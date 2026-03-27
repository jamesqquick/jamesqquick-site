#!/usr/bin/env node
/**
 * Renames video files in a folder to match lesson `slug` values from the
 * modern-websites-with-astro course (underscore Title_Case → kebab-case slug).
 *
 * Usage:
 *   node scripts/rename-astro-course-videos.mjs --dir ~/Downloads/astro-course-videos
 *   node scripts/rename-astro-course-videos.mjs --dir ~/Downloads/astro-course-videos --dry-run
 *
 * Run from the repo root so lesson files can be read.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { globSync } from "glob";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");

const LESSON_GLOB = "src/content/courses/modern-websites-with-astro/sections/**/*.{md,mdx}";

/** Filename quirks → slug (typos, duplicates, shortened titles). */
const OVERRIDES = {
  "refacting-the-categorylist-component": "refactoring-the-categorylist-component",
  "resources-updated-1": "resources",
  "resources-updated": "resources",
  "setting-up-the-astro-image-component-1": "setting-up-the-astro-image-component",
  "setting-up-the-astro-image-component1": "setting-up-the-astro-image-component",
  "welcome-and-thank-you-1": "welcome-and-thank-you",
  "displaying-featured-posts": "displaying-a-featured-post",
  "intro-to-meta-tags": "introduction-to-meta-tags",
};

function loadSlugs() {
  const files = globSync(path.join(repoRoot, LESSON_GLOB), { nodir: true }).filter(
    (f) => !f.endsWith("index.mdx")
  );
  const slugs = new Set();
  for (const f of files) {
    const raw = fs.readFileSync(f, "utf8");
    const m = raw.match(/^slug:\s*(.+)$/m);
    if (!m) continue;
    const slug = m[1].trim().replace(/^["']|["']$/g, "");
    slugs.add(slug);
  }
  return slugs;
}

function baseToCandidate(base) {
  let s = base
    .replace(/\s*\(\d+\)\s*$/i, "")
    .replace(/_/g, "-")
    .toLowerCase();
  s = s.replace(/[^a-z0-9-]/g, "");
  s = s.replace(/-+/g, "-").replace(/^-|-$/g, "");
  return s;
}

function parseArgs() {
  const args = process.argv.slice(2);
  let dir = null;
  let dryRun = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--dir" && args[i + 1]) {
      dir = args[++i];
    } else if (args[i] === "--dry-run") {
      dryRun = true;
    }
  }
  if (!dir) {
    console.error("Usage: node scripts/rename-astro-course-videos.mjs --dir <path-to-videos> [--dry-run]");
    process.exit(1);
  }
  return { dir: path.resolve(dir), dryRun };
}

const { dir: videoDir, dryRun } = parseArgs();
const slugs = loadSlugs();
const videos = fs.readdirSync(videoDir).filter((n) => /\.(mp4|mov|webm)$/i.test(n));

const plan = [];
for (const v of videos) {
  const ext = path.extname(v);
  const base = path.basename(v, ext);
  let cand = baseToCandidate(base);
  if (OVERRIDES[cand]) cand = OVERRIDES[cand];
  if (!slugs.has(cand)) {
    console.error(`No lesson slug for "${v}" (candidate: "${cand}")`);
    process.exit(1);
  }
  const from = path.join(videoDir, v);
  const to = path.join(videoDir, `${cand}${ext}`);
  plan.push({ from, to });
}

const byTarget = {};
for (const p of plan) {
  byTarget[path.basename(p.to)] = (byTarget[path.basename(p.to)] || []).concat(path.basename(p.from));
}
const dupes = Object.entries(byTarget).filter(([, arr]) => arr.length > 1);
if (dupes.length) {
  console.error("Multiple sources for same target:", dupes);
  process.exit(1);
}

for (const { from, to } of plan) {
  if (from === to) continue;
  if (fs.existsSync(to)) {
    console.error(`Target already exists: ${to}`);
    process.exit(1);
  }
}

for (const { from, to } of plan) {
  if (from === to) continue;
  if (dryRun) {
    console.log(`${path.basename(from)} -> ${path.basename(to)}`);
  } else {
    fs.renameSync(from, to);
    console.log(`${path.basename(from)} -> ${path.basename(to)}`);
  }
}

const renamed = plan.filter((p) => p.from !== p.to).length;
console.log(dryRun ? `(dry-run) ${renamed} would rename` : `Done: ${renamed} renamed`);
