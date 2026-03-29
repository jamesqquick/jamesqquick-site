---
name: new-feature-worktree
description: >-
  Implements a new feature in a dedicated git worktree on a feature/ branch,
  validates (tests, lint, build as appropriate), runs project-specific codegen
  (e.g. Prisma generate) only when the repo uses it, pushes and opens a PR,
  then opens the worktree folder in a new Cursor instance when possible. Use
  when the user wants a worktree-based feature workflow, or mentions
  implementing a feature in a separate worktree with a pull request.
---

# New feature (worktree workflow)

When this skill applies, follow the workflow below in order. All implementation work happens only in the worktree, not the original checkout.

## Inputs

You may receive:

- A feature name or branch slug (for example `mobile-nav` or `feature/mobile-nav`)
- A description of what to build

Branch naming: If the name does not start with `feature/`, prefix it: `feature/<name>`.

## 1) Repository root and base branch

```bash
git rev-parse --show-toplevel
```

Save as `REPO_ROOT`.

```bash
git fetch origin main
```

Set `BASE_BRANCH` to the starting point branch for the feature:

- Default: `main`
- If the user explicitly specifies another starting branch (for example `develop` or `release/1.2`), use that value instead.

Create `BASE_REF="origin/${BASE_BRANCH}"` (remote ref).

If `BASE_REF` does not resolve (missing remote branch), stop and explain.

Always fetch the starting branch too (unless it is `main`, which was already fetched):

```bash
git fetch origin "$BASE_BRANCH"
```

If this fails, stop and report.

Derive:

- `REPO_NAME` = basename of `REPO_ROOT`
- `WORKTREE_PARENT` = `${REPO_ROOT}/worktrees` (repo-local worktrees directory)

## 2) Feature branch and worktree path

- `FEATURE_BRANCH` = provided branch if it already starts with `feature/`, else `feature/<provided-name>`
- Sanitize the slug (no `..`, no absolute paths, reasonable charset).

Path:

```text
WORKTREE_PATH="${WORKTREE_PARENT}/${REPO_NAME}--${FEATURE_BRANCH#feature/}"
```

Example: repo `pantry-plan`, branch `feature/order-export` -> `.../pantry-plan/worktrees/pantry-plan--order-export`.

## 3) Create branch and worktree

- If `FEATURE_BRANCH` does not exist locally:

  ```bash
  mkdir -p "$WORKTREE_PARENT"
  git worktree add -b "$FEATURE_BRANCH" "$WORKTREE_PATH" "$BASE_REF"
  ```

- If it already exists:

  ```bash
  mkdir -p "$WORKTREE_PARENT"
  git worktree add "$WORKTREE_PATH" "$FEATURE_BRANCH"
  ```

Before proceeding, confirm the existing `FEATURE_BRANCH` includes `BASE_REF`.
If not, stop and explain (or ask the user if branch recreation from `BASE_REF` is desired).

After this, do all file edits and commands from step 5 onward only in `WORKTREE_PATH`, not in `REPO_ROOT`.

## 4) Copy `.env` into worktree (if needed)

If `$REPO_ROOT/.env` exists and `$WORKTREE_PATH/.env` does not:

```bash
cp "$REPO_ROOT/.env" "$WORKTREE_PATH/.env"
```

## 5) Work in the worktree

```bash
cd "$WORKTREE_PATH"
```

Install dependencies if needed (`npm install`, etc.).

## 6) Implement

- Inspect the codebase and repo rules (for example `.cursor/rules`, `RULES.md`).
- Draft a short plan, then implement.
- Change only what the feature requires; match existing patterns.

Do not stop after planning unless blocked by a real error.

## 7) Validate

Run what the repo provides, for example:

- `npm test` / `pnpm test` / `vitest`
- `npm run lint`
- `npm run build` or `tsc --noEmit`

Skip commands that do not exist; do not invent scripts.

## 8) Codegen before commit (only if the repo uses it)

**Skip this step entirely** unless the project actually uses the tool (check for `prisma/schema.prisma`, `schema.prisma` at the repo root, or a `prisma` dependency in `package.json`).

**Prisma** (when applicable): from the worktree:

```bash
npx prisma generate
```

If the Prisma CLI needs a database URL, set the env var the project documents, then run generate again. If generate fails, report the error; do not claim success. Include any generated tracked files in the commit.

**Other codegen** (when applicable): run whatever the repo documents (for example `npm run codegen`, `graphql-codegen`, `buf generate`). Skip if none exist.

## 9) Review

```bash
git status
git diff --stat
```

Summarize: files changed, what was implemented, validation run, and codegen result (or “skipped — not used in this repo”).

## 10) Commit

```bash
git add -A
git commit -m "feat: ${FEATURE_BRANCH#feature/}"
```

Use a more specific `feat(scope): ...` message if the repo consistently does. If there is nothing to commit, say so clearly.

## 11) Push

```bash
git push -u origin "$FEATURE_BRANCH"
```

On failure, stop and report.

## 12) Pull request

Check `command -v gh`.

If `gh` is available and authenticated, create a PR into `BASE_BRANCH`.

Title: `feat: ${FEATURE_BRANCH#feature/}` (adjust to match repo conventions if needed)

Body template:

```markdown
## Summary
- [What changed]

## Validation
- [Commands run]
- [Codegen if any, e.g. `npx prisma generate` — or “N/A”]

## Notes
- [Follow-ups, risks, or issues]
```

Example:

```bash
gh pr create --base "$BASE_BRANCH" --head "$FEATURE_BRANCH" \
  --title "feat: ${FEATURE_BRANCH#feature/}" \
  --body-file -
```

If `gh` is missing or auth fails: state that the PR was not created; give the push URL or compare link if useful.

## 13) Open worktree in a new Cursor instance

After the PR exists (or push succeeds), open `WORKTREE_PATH` in a new Cursor window.

macOS (preferred):

```bash
open -na "Cursor" --args "$WORKTREE_PATH"
```

If that fails:

```bash
open -a "Cursor" "$WORKTREE_PATH"
```

If `cursor` CLI is available, `cursor -n "$WORKTREE_PATH"` is also acceptable.

Otherwise, provide manual steps: File -> New Window, then File -> Open Folder and choose `WORKTREE_PATH`.

This step is best-effort: report whether the command ran and exited 0.

## 14) Final reply format

Include:

| Field | Content |
|--------|--------|
| Base branch | `BASE_BRANCH` |
| Feature branch | `FEATURE_BRANCH` |
| Worktree path | `WORKTREE_PATH` |
| Summary | Short |
| Validation | Commands run |
| Codegen | Skipped, OK, or error (e.g. Prisma) |
| Commit | Hash if committed |
| PR | URL or not created + reason |
| Cursor | Opened worktree in new instance (command used) or manual instructions |

## Port guidance

- This repo uses Astro defaults. If you need to mention or open a local app URL, use `http://localhost:4321` unless the dev server reports a different port.
- If `4321` is in use and Astro picks another port (for example `4322`), report and use the actual port shown in terminal output.

## Rules

- Implement only inside the worktree after it exists; never edit the same files in `REPO_ROOT` for this feature.
- Do not remove the worktree unless the user asks.
- Follow repository conventions and project agent rules.
- Be explicit about failures; never fake success.
