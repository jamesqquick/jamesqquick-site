#!/usr/bin/env node
/**
 * Sets `videoKey` on course lessons and removes legacy empty `videoId` / `videoUrl`.
 * YouTube-only lessons (non-empty videoId) keep `videoId` and omit `videoKey`.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { globSync } from "glob";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

/** R2 key differs from slug-based default for this lesson (optional override). */
const VIDEO_KEY_BY_SLUG = {
  "intro-to-astro": "intro-to-astro.mp4",
};

const LESSON_GLOB = "src/content/courses/modern-websites-with-astro/sections/**/*.{md,mdx}";

function parseFrontmatter(raw) {
  if (!raw.startsWith("---\n")) return null;
  const end = raw.indexOf("\n---\n", 4);
  if (end === -1) return null;
  return {
    frontmatter: raw.slice(4, end),
    rest: raw.slice(end + "\n---\n".length),
    endDelimiter: "\n---\n",
  };
}

function getSlug(fm) {
  const m = fm.match(/^slug:\s*(.+)$/m);
  if (!m) return null;
  return m[1].trim().replace(/^["']|["']$/g, "");
}

function updateFrontmatter(fm, slug) {
  const lines = fm.split("\n");
  const out = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^videoUrl:\s*/.test(line)) continue;
    if (/^videoId:\s*""\s*$/.test(line) || /^videoId:\s*''\s*$/.test(line)) continue;
    if (/^videoKey:\s*/.test(line)) continue;
    out.push(line);
  }

  const hasVideoId = out.some((l) => {
    const m = l.match(/^videoId:\s*(.+)$/);
    if (!m) return false;
    const v = m[1].trim().replace(/^["']|["']$/g, "");
    return v.length > 0;
  });

  if (hasVideoId) {
    return out.join("\n");
  }

  const key = VIDEO_KEY_BY_SLUG[slug] ?? `${slug}.mp4`;

  const summaryIdx = out.findIndex((l) => /^summary:\s*/.test(l));
  const insertAt =
    summaryIdx >= 0 ? summaryIdx + 1 : Math.min(1, out.length);
  const toInsert = [`videoKey: "${key}"`];
  out.splice(insertAt, 0, ...toInsert);
  return out.join("\n");
}

const files = globSync(path.join(repoRoot, LESSON_GLOB), { nodir: true }).filter(
  (f) => !f.endsWith("index.mdx")
);

for (const file of files) {
  const raw = fs.readFileSync(file, "utf8");
  const parsed = parseFrontmatter(raw);
  if (!parsed) continue;
  const slug = getSlug(parsed.frontmatter);
  if (!slug) continue;
  const newFm = updateFrontmatter(parsed.frontmatter, slug);
  const next = `---\n${newFm}\n---\n${parsed.rest}`;
  fs.writeFileSync(file, next, "utf8");
}

console.log(`Updated ${files.length} lesson files.`);
