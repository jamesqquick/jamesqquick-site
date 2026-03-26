# Design System Usage

Use this guide when building or updating UI in this codebase.

## Core Rules

- Prefer semantic tokens over raw values.
- In shared components, avoid hardcoded Tailwind color utilities like `text-white`, `text-gray-*`, and `bg-*` when a token exists.
- Keep spacing on the approved rhythm (`8, 12, 16, 24, 32, 48, 64`).
- Reuse primitive components (`Button`, `Section`, `Link`, headings) before creating one-off patterns.

## Tokens

- Source of truth: `src/styles/tokens.css`
- Imported globally via: `src/styles/global.css`
- Tailwind variable mapping: `tailwind.config.mjs`

Use token variables for:
- Color: `--color-*`
- Radius: `--radius-*`
- Shadows: `--shadow-*`
- Motion: `--duration-*`, `--ease-*`
- Typography: `--font-*`

## Accessibility Baseline

- Every interactive element must have visible `:focus-visible` styles.
- Do not rely on color alone for meaning.
- Respect reduced motion (`prefers-reduced-motion`).
- Keep readable contrast in both dark and light themes.

## Theming

- Default baseline is dark theme.
- Theme override uses `data-theme` (`dark` or `light`).
- User preference is persisted in `localStorage`.

## Migration Guidance

- When touching old UI, migrate incrementally:
  1. Replace raw color classes with semantic token-based classes/styles.
  2. Align radius and shadow with the shared scale.
  3. Normalize hover/active/focus states.
  4. Keep component APIs backward-compatible when possible.
