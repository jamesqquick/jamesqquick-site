---
slug: create-design-tokens
title: Create the Design Tokens
moduleSlug: create-the-astro-foundation
moduleTitle: "Create the Astro Foundation"
moduleOrder: 2
lessonOrder: 4
published: true
duration: "11 minutes"
summary: Define the Weekender font and color tokens with Tailwind CSS 4, then add global behavior shared by every page.
resources:
  - https://tailwindcss.com/docs/theme
  - https://tailwindcss.com/docs/adding-custom-styles
  - https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
---

# Create the Design Tokens

## Outcome

You will turn the Weekender's visual decisions into reusable Tailwind CSS 4 tokens. You will also add a small set of global rules for page width, focus behavior, prose, and reduced motion.

Tokens matter because the same colors and fonts appear across Astro and React components. A shared name such as `blue` is less error-prone than copying a color value into every class string.

## Define fonts and colors

Open `src/styles/global.css`. Keep the font and Tailwind imports at the top, then add the project's `@theme` block:

```css
@import "@fontsource-variable/manrope";
@import "@fontsource-variable/oswald";
@import "tailwindcss";

@theme {
  --font-sans: "Manrope Variable", sans-serif;
  --font-display: "Oswald Variable", sans-serif;

  --color-paper: oklch(0.965 0.022 82);
  --color-cream: oklch(0.925 0.035 78);
  --color-ink: oklch(0.19 0.025 250);
  --color-blue: #2048bd;
  --color-tomato: #b9230c;
  --color-yellow: oklch(0.86 0.16 90);
  --color-green: oklch(0.57 0.12 155);
}
```

Tailwind turns these variables into utilities. `--font-display` enables `font-display`. `--color-paper` enables classes such as `bg-paper`, `text-paper`, and `border-paper`.

The palette has semantic names tied to this visual system. `paper` and `ink` form the normal reading pair. `blue`, `tomato`, `yellow`, and `green` create strong editorial blocks and interaction states.

The project uses a condensed display face for large uppercase headings and a readable sans serif for body copy. That contrast creates hierarchy without requiring many font sizes or weights.

## Add shared base behavior

Add the base layer:

```css
@layer base {
  :root {
    color-scheme: light;
    font-family: var(--font-sans);
    background: var(--color-paper);
  }

  html {
    scroll-behavior: smooth;
  }

  ::selection {
    color: var(--color-paper);
    background: var(--color-blue);
  }

  a,
  button,
  input,
  select {
    border-radius: 0.125rem;
  }

  button,
  select {
    cursor: pointer;
  }

  button:disabled {
    cursor: not-allowed;
  }

  :focus-visible {
    outline-color: var(--color-tomato);
  }
}
```

`color-scheme: light` tells the browser which built-in control theme fits the design. The common two-pixel radius softens controls without turning the blocky editorial style into rounded cards. `:focus-visible` changes the default keyboard focus outline to a color with strong contrast against the main surfaces.

The finished `body` also uses two subtle radial gradients. Keep that exact block from `global.css` if you want the textured paper effect. It is decoration, so the application remains understandable if a browser does not render it.

## Add reusable component classes

Most styles remain utility classes in templates. Create two shared CSS abstractions where repetition would be noisy.

```css
@layer components {
  .page-shell {
    width: min(100% - 2rem, 90rem);
    margin-inline: auto;
  }

  .event-prose {
    max-width: 68ch;
    font-size: 1.075rem;
    line-height: 1.8;
  }

  .event-prose > * + * {
    margin-top: 1.25rem;
  }

  .event-prose h2 {
    margin-top: 2.75rem;
    font-family: var(--font-display);
    font-size: 2rem;
    line-height: 1.05;
    text-transform: uppercase;
  }

  .event-prose ul {
    padding-left: 1.25rem;
    list-style: square;
  }

  .event-prose li + li {
    margin-top: 0.45rem;
  }
}
```

`.page-shell` gives every major section the same fluid gutters and 90rem maximum width. The formula leaves one rem on each side at narrow widths.

`.event-prose` styles rendered Markdown bodies. Those elements do not carry Tailwind classes because they come from content. A bounded prose class is the right place for their typography and spacing.

## Respect reduced-motion preferences

Add the final media query:

```css
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }

  *,
  *::before,
  *::after {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
  }
}
```

The interface uses hover transforms and smooth scrolling. This query keeps those details from overriding a visitor's reduced-motion preference. The tiny duration allows state changes to complete without a visible animation.

## Verify the tokens

Use a temporary block in `src/pages/index.astro`:

```astro
<section class="bg-yellow text-ink border-blue border-2 p-6">
  <h1 class="font-display text-5xl uppercase">The Weekender</h1>
  <p class="font-sans">Plan one Memphis weekend.</p>
</section>
```

Run `pnpm dev`. Confirm the custom colors and both font utilities apply. Inspect the computed styles to verify they resolve to the variables from `@theme`.

## Exercise

Add `bg-paper` and `font-display` to separate elements on the starter page and inspect their computed styles. Explain why putting these tokens in CSS is better than exporting a TypeScript color object. CSS controls rendering in both Astro and future React components and can respond to browser media features.
