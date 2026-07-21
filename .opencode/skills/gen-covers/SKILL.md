---
name: gen-covers
description: >-
  Generate a cover image for a blog post using the project's built-in cover
  generator. Use when adding a new blog post or regenerating an existing cover.
---

# gen-covers

## When to use

- Adding a new blog post that needs a cover image
- Regenerating a cover after changing a post's title or tags
- Replacing a manually added cover with the standard generated one

## How it works

Generates `cover.png` for blog posts using `scripts/gen-covers.ts`, which renders title + first tag via the OG template.

## Command

```bash
# Single post
pnpm gen-covers --slug <slug>

# Force-regenerate even if coverImage is already set in frontmatter
pnpm gen-covers --slug <slug> --force

# Preview without writing files
pnpm gen-covers --slug <slug> --dry-run
```

The slug is the directory name under `src/data/blog/`.

## Frontmatter behavior

- If `coverImage` is **not set**, the script patches it to `./cover.png` automatically.
- If `coverImage` **is already set**, the script still writes `cover.png` (when `--force` is used) but does **not** update the frontmatter. Update it manually if needed.
