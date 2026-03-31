---
name: new-feature-worktree
description: >-
  Implements a new feature in a dedicated git worktree on a feature/ branch,
  validates (tests, lint, build as appropriate), pushes and opens a PR,
  then opens the worktree folder in a new OpenCode instance when possible. Use
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

## 4) Copy environment files into worktree (if needed)

This project uses `.dev.vars` (Cloudflare convention) for local secrets. Copy both `.env` and `.dev.vars` if they exist:

```bash
[ -f "$REPO_ROOT/.env" ] && [ ! -f "$WORKTREE_PATH/.env" ] && cp "$REPO_ROOT/.env" "$WORKTREE_PATH/.env"
[ -f "$REPO_ROOT/.dev.vars" ] && [ ! -f "$WORKTREE_PATH/.dev.vars" ] && cp "$REPO_ROOT/.dev.vars" "$WORKTREE_PATH/.dev.vars"
```

## 5) Work in the worktree

```bash
cd "$WORKTREE_PATH"
```

Install dependencies:

```bash
pnpm install
```

## 6) Implement

- Inspect the codebase and repo rules (for example `.opencode/rules`, `AGENTS.md`).
- Draft a short plan, then implement.
- Change only what the feature requires; match existing patterns.

Do not stop after planning unless blocked by a real error.

## 7) Validate

This project has no `test` or `lint` scripts. Run the build to validate:

```bash
pnpm run build
```

Do not run `pnpm test` or `pnpm run lint` — they do not exist and will fail.

## 8) Review

```bash
git status
git diff --stat
```

Summarize: files changed, what was implemented, and validation run.

## 9) Commit

```bash
git add -A
git commit -m "feat: ${FEATURE_BRANCH#feature/}"
```

Use a more specific `feat(scope): ...` message if the repo consistently does. If there is nothing to commit, say so clearly.

## 10) Push

```bash
git push -u origin "$FEATURE_BRANCH"
```

On failure, stop and report.

## 11) Pull request

Check `command -v gh`.

If `gh` is available and authenticated, create a PR into `BASE_BRANCH`.

Title: `feat: ${FEATURE_BRANCH#feature/}` (adjust to match repo conventions if needed)

Body template:

```markdown
## Summary
- [What changed]

## Validation
- [Commands run]
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

## 12) Open worktree in a new OpenCode instance

After the PR exists (or push succeeds), open `WORKTREE_PATH` in a new OpenCode window.

```bash
opencode "$WORKTREE_PATH"
```

Otherwise, provide manual steps: navigate to `WORKTREE_PATH` and run `opencode`.

This step is best-effort: report whether the command ran and exited 0.

## 13) Final reply format

Include:

| Field | Content |
|--------|--------|
| Base branch | `BASE_BRANCH` |
| Feature branch | `FEATURE_BRANCH` |
| Worktree path | `WORKTREE_PATH` |
| Summary | Short |
| Validation | Commands run |
| Commit | Hash if committed |
| PR | URL or not created + reason |
| OpenCode | Opened worktree in new instance (command used) or manual instructions |

## Project stack

- **Framework:** Astro 6 (server-rendered, `output: "server"`)
- **UI:** Svelte 5 components, Tailwind CSS 3, MDX content
- **Deployment:** Cloudflare Workers via `@astrojs/cloudflare` adapter + `wrangler`
- **Bindings:** R2 bucket (`COURSE_BUCKET`), secrets via `.dev.vars` (`RESEND_API_KEY`, `RESEND_AUDIENCE_ID`)
- **Package manager:** pnpm 9
- **Node version:** 22 (`.nvmrc`)
- **Available scripts:** `dev`, `build`, `preview` (wrangler dev), `deploy` — no test or lint

Match existing Astro/Svelte/Tailwind patterns when implementing features.

## Port guidance

- This repo uses Astro defaults. If you need to mention or open a local app URL, use `http://localhost:4321` unless the dev server reports a different port.
- If `4321` is in use and Astro picks another port (for example `4322`), report and use the actual port shown in terminal output.

## Rules

- Implement only inside the worktree after it exists; never edit the same files in `REPO_ROOT` for this feature.
- Do not remove the worktree unless the user asks.
- Follow repository conventions and project agent rules.
- Be explicit about failures; never fake success.
