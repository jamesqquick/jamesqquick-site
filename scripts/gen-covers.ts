import { readFileSync, writeFileSync } from "fs";
import { join, dirname } from "path";
import { glob } from "fs/promises";
import matter from "gray-matter";
import { renderCover } from "./ogTemplate.tsx";

const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const DRY_RUN = args.includes("--dry-run");
const SLUG_IDX = args.indexOf("--slug");
const ONLY_SLUG = SLUG_IDX !== -1 ? args[SLUG_IDX + 1] : null;

if (SLUG_IDX !== -1 && (!args[SLUG_IDX + 1] || args[SLUG_IDX + 1].startsWith("--"))) {
  console.error("Error: --slug requires a value. Usage: pnpm gen-covers --slug <slug>");
  process.exit(1);
}

const BLOG_DIR = join(process.cwd(), "src/data/blog");

async function main() {
  let generated = 0;
  let skipped = 0;

  const pattern = join(BLOG_DIR, "**/*.md").replace(/\\/g, "/");
  const files: string[] = [];
  for await (const f of glob(pattern)) {
    files.push(f as string);
  }

  for (const filePath of files) {
    const postDir = dirname(filePath);
    const slug = postDir.split("/").at(-1) ?? "";

    if (ONLY_SLUG && slug !== ONLY_SLUG) continue;

    const raw = readFileSync(filePath, "utf-8");
    const { data: fm } = matter(raw);

    if (fm.coverImage && !FORCE) {
      skipped++;
      continue;
    }

    const title: string = fm.title ?? slug;
    const tags: string[] = Array.isArray(fm.tags) ? fm.tags : [];
    const tag = tags[0];

    console.log(`  generating: ${slug}`);

    if (!DRY_RUN) {
      const buf = await renderCover({ title, tag });
      const outPath = join(postDir, "cover.png");
      writeFileSync(outPath, buf);

      if (!fm.coverImage) {
        const { content } = matter(raw);
        const patched = matter.stringify(content, { ...fm, coverImage: "./cover.png" });
        writeFileSync(filePath, patched);
      }
    }

    generated++;
  }

  console.log(
    `\nDone. Generated: ${generated}, Skipped (already have cover): ${skipped}${DRY_RUN ? " [dry-run — no files written]" : ""}`
  );
}

main().catch((err: unknown) => {
  console.error("gen-covers failed:", err);
  process.exit(1);
});
