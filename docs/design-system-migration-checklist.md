# Design System Migration Checklist

This checklist maps the approved style guide into concrete implementation work for this codebase.

## Branch and Scope

- Branch: `feat/design-system-migration-plan`
- Base: `main`
- Goal: move from ad hoc Tailwind classes to token-driven, reusable primitives and consistent interaction patterns.

## Phase 1 - Foundation (Global Tokens and Theme)

### 1) `src/styles/tokens.css`
- [ ] Add full token set (color, typography, spacing, radius, shadows, motion, containers)
- [ ] Default to dark-first values for current site continuity
- [ ] Add `[data-theme="light"]` overrides
- [ ] Add category tokens (`--color-speaking`, `--color-ai`, `--color-learning`)
- [ ] Confirm subtle default shadow scale for cards and buttons (avoid heavy shadows)

### 2) `src/styles/global.css`
- [ ] Import `tokens.css` at top
- [ ] Replace base typography declarations with tokenized defaults
- [ ] Add focus-visible, selection, and reduced-motion rules
- [ ] Keep mobile menu overflow lock behavior

### 3) `tailwind.config.mjs`
- [ ] Map core Tailwind colors to CSS variables
- [ ] Preserve legacy utility names (`brand`, `bg`, `bgDark`, `bgLight`) during transition
- [ ] Add semantic color aliases (`surface`, `text`, `border`, `accent`)
- [ ] Extend font families to include display and mono stacks

## Phase 2 - Primitive Components

### 4) `src/components/Button.astro`
- [ ] Move variants to tokenized color/radius/shadow behavior
- [ ] Standardize hover/active/focus behavior
- [ ] Keep API compatibility with existing usages

### 5) `src/components/Section.astro`
- [ ] Normalize section spacing tokens (`64/96/128` responsive rhythm)
- [ ] Replace direct background classes with semantic variants where possible
- [ ] Ensure `tone` and `paddingY` are preferred over `isLight`, `hasYPadding`, and manual `py/pt/pb`

### 6) `src/components/Link.astro`
- [ ] Consolidate link styles around accent + underline behavior
- [ ] Ensure focus-visible treatment is always present

### 7) `src/components/H1.astro`, `src/components/H2.astro`, `src/components/PageHeader.astro`
- [ ] Apply display font and updated scale
- [ ] Enforce hierarchy and spacing consistency

## Phase 3 - Shell and Navigation

### 8) `src/components/Navbar.astro`
- [ ] Apply consistent nav typography and interactive states
- [ ] Add theme toggle control placeholder (or implementation)
- [ ] Verify keyboard and mobile menu accessibility

### 9) `src/components/Footer.astro`
- [ ] Align card surface, radius, and shadow tokens
- [ ] Standardize link styles and spacing rhythm
- [ ] Reduce excessive elevation (prefer subtle shadows)

### 10) `src/layouts/BaseLayout.astro`
- [ ] Apply semantic body classes (`bg`, `text`)
- [ ] Ensure theme attribute strategy is in place

## Phase 4 - High-Impact Content Surfaces

### 11) `src/components/HeroSection.astro`
- [ ] Migrate typography scale and spacing
- [ ] Apply decorative signature accents (subtle gradients / geometric marks)

### 12) `src/components/FeaturedSplitSection.astro`, `src/components/LinkCard.astro`, `src/components/TalkCard.astro`
- [ ] Convert card variants to shared radius/shadow rules
- [ ] Add category chip styling for speaking/ai/learning where relevant
- [ ] Keep shadows subtle and consistent across card surfaces

### 13) `src/pages/courses.astro` and top-level landing pages
- [ ] Validate section rhythm, card grid behavior, and CTA hierarchy

## Phase 5 - QA and Governance

### 14) Accessibility and Motion QA
- [ ] Focus-visible on all interactive controls
- [ ] Contrast review (dark and light themes)
- [ ] Verify reduced-motion handling

### 15) Design System Guardrails
- [ ] Add short contributor doc in `docs/design-system-usage.md`
- [ ] Document "use semantic tokens in shared components, avoid raw color utilities"
- [ ] Optional follow-up lint/codemod pass to reduce legacy class usage

## Suggested Order for PRs

1. Foundation tokens + global + tailwind mapping
2. Button/Section/Link primitives
3. Navbar/Footer/BaseLayout
4. Hero and key cards
5. Remaining pages + QA sweep
