/**
 * Creates missing ./images/* files for blog posts (valid images for Astro).
 * Run after migrate-blog-post-images.mjs when public/ sources are absent.
 * Replace outputs with real assets from public/images/posts when available locally.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const blogBase = path.join(root, "src/data/blog");

/** 1×1 transparent GIF (valid for inline images that were .gif) */
const MIN_GIF = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64",
);

const mdRef = /\.\/images\/([^)\s]+)/g;

function walkMarkdownFiles(dir, acc = []) {
  for (const name of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, name.name);
    if (name.isDirectory()) walkMarkdownFiles(p, acc);
    else if (name.name.endsWith(".md")) acc.push(p);
  }
  return acc;
}

async function writePlaceholder(abs) {
  const ext = path.extname(abs).toLowerCase();
  fs.mkdirSync(path.dirname(abs), { recursive: true });

  if (ext === ".gif") {
    fs.writeFileSync(abs, MIN_GIF);
    return;
  }

  const pipeline = sharp({
    create: {
      width: 800,
      height: 450,
      channels: 3,
      background: { r: 232, g: 232, b: 232 },
    },
  });

  if (ext === ".png") {
    await pipeline.png().toFile(abs);
  } else if (ext === ".jpeg" || ext === ".jpg") {
    await pipeline.jpeg({ quality: 80 }).toFile(abs);
  } else {
    await pipeline.png().toFile(abs);
  }
}

async function main() {
  const files = walkMarkdownFiles(blogBase);
  const needed = new Set();
  for (const md of files) {
    const text = fs.readFileSync(md, "utf8");
    let m;
    while ((m = mdRef.exec(text)) !== null) {
      needed.add(path.join(path.dirname(md), "images", m[1]));
    }
  }

  for (const abs of needed) {
    if (fs.existsSync(abs)) continue;
    await writePlaceholder(abs);
    console.log("created", path.relative(root, abs));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
