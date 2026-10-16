# Projects Showcase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a screenshot-led homepage section that presents five projects with clear live-demo, download, and GitHub actions.

**Architecture:** Keep the data and markup in a focused Astro homepage component. Reuse the existing `Section` and `Button` primitives, use token-based scoped CSS for the responsive card grid, and use a small inline browser script only for the terminal typewriter/reveal animation.

**Tech Stack:** Astro 7, Tailwind utility classes, existing CSS tokens, TypeScript-compatible inline browser script.

---

### Task 1: Add the project showcase component

**Files:**
- Create: `src/components/HomeProjectsShowcase.astro`
- Modify: `src/pages/index.astro`

- [x] Add five project cards for Quick Cuts, QuickTab, QuickShot, Dropcast, and Quickspense with screenshot placeholders, descriptions, tags, and verified project links.
- [x] Use `ButtonType.PRIMARY` for each primary action and keep GitHub as a secondary text link.
- [x] Place the component after `HomeTopics` and before `WorkExperience`.

### Task 2: Add terminal interaction

**Files:**
- Modify: `src/components/HomeProjectsShowcase.astro`

- [x] Type `$ ls projects/` on first intersection with the section.
- [x] Reveal the five project paths with a staggered delay.
- [x] Skip animation and show the complete terminal when reduced motion is preferred.
- [x] Keep the terminal content available to assistive technology and preserve a stable layout during animation.

### Task 3: Verify

**Files:**
- No additional files.

- [x] Run `pnpm astro check` and record existing unrelated diagnostics separately from feature diagnostics.
- [x] Run `NODE_OPTIONS='--inspect-port=0' CLOUDFLARE_ACCOUNT_ID=4426cbeacb457b1ca1b865d6c36ced0d pnpm build`.
- [x] Confirm the branch contains only the feature component, homepage integration, and this implementation plan.
