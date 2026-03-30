/**
 * Migrates blog post images from public/ URLs to co-located ./images/ paths
 * under each src/data/blog/<slug>/ folder so Astro can optimize them.
 *
 * Run from repo root: node scripts/migrate-blog-post-images.mjs
 *
 * Copies from public/images/posts/<slug>/ and public/images/<slug>/ when present.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const blogBase = path.join(root, "src/data/blog");

async function walkMarkdownFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      files.push(...(await walkMarkdownFiles(p)));
    } else if (e.name.endsWith(".md")) {
      files.push(p);
    }
  }
  return files;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function main() {
  const mdFiles = await walkMarkdownFiles(blogBase);
  for (const file of mdFiles) {
    const folderSlug = path.basename(path.dirname(file));
    const esc = escapeRegExp(folderSlug);
    let content = await fs.readFile(file, "utf8");
    const orig = content;

    content = content.replace(
      new RegExp(`/images/posts/${esc}/`, "g"),
      "./images/",
    );
    content = content.replace(
      new RegExp(`/images/${esc}/`, "g"),
      "./images/",
    );

    if (content !== orig) {
      await fs.writeFile(file, content, "utf8");
      console.log("updated", path.relative(root, file));
    }

    const destDir = path.join(path.dirname(file), "images");
    for (const src of [
      path.join(root, "public/images/posts", folderSlug),
      path.join(root, "public/images", folderSlug),
    ]) {
      try {
        const stat = await fs.stat(src);
        if (!stat.isDirectory()) continue;
        await fs.mkdir(destDir, { recursive: true });
        const names = await fs.readdir(src);
        for (const name of names) {
          if (name.startsWith(".")) continue;
          const from = path.join(src, name);
          const st = await fs.stat(from);
          if (!st.isFile()) continue;
          await fs.copyFile(from, path.join(destDir, name));
        }
        console.log("copied", path.relative(root, src), "->", path.relative(root, destDir));
      } catch {
        // source missing
      }
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
