---
name: commit-untracked-changes
description: >-
  Stages untracked and modified files, writes a conventional commit message
  from the actual diff and file list, and runs git commit. Use when the user
  wants to commit everything including untracked files, asks for a commit with
  a good message, or says to commit all changes / include new files.
---

# Commit untracked changes (with message)

## When this applies

The user wants a **git commit** that includes **untracked** files (not only previously tracked edits), with a **clear, accurate message** derived from what changed.

## Workflow

### 1) Inspect the tree

From the repo root:

```bash
git status
git diff
git diff --stat
```

For untracked paths only:

```bash
git ls-files --others --exclude-standard
```

Summarize mentally: areas touched (e.g. components, layouts, docs), change type (feature, fix, style, content, config), and whether multiple logical changes are mixed.

### 2) Safety before staging

- Do **not** stage or commit secrets: `.env`, `*.pem`, keys, or files the repo’s `.gitignore` is meant to exclude—unless the user explicitly asks to force-add a specific path and understands the risk.
- If something sensitive appears in `git status`, stop and warn before staging.

### 3) Stage

- Default for “commit everything” / “include untracked”: `git add -A` from repo root (stages new, modified, and deleted tracked files).
- If the user names specific paths, stage only those: `git add <paths>…`.

### 4) Message

Write the message from the **staged** diff, not guesses:

```bash
git diff --cached --stat
git diff --cached
```

**Format** (match repo conventions if obvious; otherwise Conventional Commits):

```text
<type>(<optional-scope>): <imperative summary ~50–72 chars>

Optional body: why or what, not restating the diff line-by-line.
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `chore`, `test`, `content` (use for MD/marketing copy if the repo does).

**Summary:** imperative (“add”, “fix”, “update”), no trailing period, specific enough to find the change later.

**Multiple unrelated concerns:** prefer separate commits; if the user insists on one commit, use a summary that honestly reflects the combined change or the dominant one and mention the rest in the body.

### 5) Commit

```bash
git commit -m "$(cat <<'EOF'
<type>(<scope>): <summary>

<body if any>
EOF
)"
```

Or a single-line `-m` when there is no body.

### 6) Confirm

```bash
git status
git log -1 --oneline
```

Report: commit hash, short message, and branch name.

## Rules

- **Execute** the commands; do not only suggest them (unless the environment cannot run git).
- **Never** claim success without a zero exit from `git commit`.
- If there is **nothing to commit** after staging, say so and show `git status`.
- If **pre-commit hooks** fail, show the hook output and do not amend the message to fake success.
