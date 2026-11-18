---
slug: add-react-and-tailwind
title: Add React and Tailwind CSS
moduleSlug: create-the-astro-foundation
moduleTitle: "Create the Astro Foundation"
moduleOrder: 2
lessonOrder: 3
published: true
duration: "10 minutes"
summary: Configure React 19 and Tailwind CSS 4 in Astro using the React integration and Tailwind Vite plugin.
resources:
  - https://docs.astro.build/en/guides/integrations-guide/react/
  - https://docs.astro.build/en/guides/styling/#tailwind
  - https://tailwindcss.com/docs/installation/using-vite
---

# Add React and Tailwind CSS

## Outcome

You will add React 19 for focused interactive islands and Tailwind CSS 4 for styling. You will also configure Astro exactly where each tool expects to run.

The Weekender does not use React as its page framework. Astro still owns routing, layouts, content loading, and static HTML. React is available for the event explorer and saved-plan controls that need hooks and browser APIs.

## Install the React packages

Install the integration, React runtime, and React type packages:

```sh
pnpm add @astrojs/react@^6.0.5 react@^19.2.8 react-dom@^19.2.8
pnpm add -D @types/react@^19.2.18 @types/react-dom@^19.2.5
```

The Astro integration teaches the compiler how to render React components. `react` and `react-dom` provide the framework runtime. The type packages let TypeScript validate JSX, props, and React APIs.

The final `tsconfig.json` includes React's automatic JSX transform:

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"],
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  }
}
```

## Install Tailwind CSS 4

The project uses Tailwind's Vite plugin rather than the older PostCSS configuration:

```sh
pnpm add tailwindcss@^4.3.3 @tailwindcss/vite@^4.3.3
```

Tailwind CSS 4 supports CSS-first configuration. The Weekender defines its fonts and colors in `src/styles/global.css`, so it does not need a `tailwind.config.js` file.

## Configure Astro

Open `astro.config.mjs` and configure only the integrations needed now:

```js
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  output: "static",
  integrations: [react()],

  vite: {
    plugins: [tailwindcss()],
  },
});
```

`integrations` is for Astro-aware extensions. React belongs there because Astro needs to render `.tsx` components and understand client directives.

Tailwind is a Vite plugin, so it belongs under `vite.plugins`. It scans source files and transforms the Tailwind import and utility usage into generated CSS.

`output: 'static'` states the deployment model directly. Static is Astro's default, but the explicit setting documents the project's intent.

## Create the global stylesheet

Create `src/styles/global.css` with these three imports:

```css
@import "@fontsource-variable/manrope";
@import "@fontsource-variable/oswald";
@import "tailwindcss";
```

Install the font packages referenced by those imports:

```sh
pnpm add @fontsource-variable/manrope@^5.3.0 @fontsource-variable/oswald@^5.3.0
```

The font files now come from project dependencies instead of a remote stylesheet. Astro and Vite include them in the build, and the site does not depend on a third-party font request at runtime.

The shared layout will own this import in lesson 2.5. Until that layout exists, import the stylesheet from `src/pages/index.astro` so this lesson is immediately testable:

```astro
---
import '../styles/global.css';
---
```

Keep this temporary page import through the next lesson. When `BaseLayout.astro` imports the stylesheet, remove it from `index.astro` so every page receives the same Tailwind output without duplicate imports.

## Prove Tailwind is active

Add a temporary class to the heading in `src/pages/index.astro`:

```astro
<h1 class="text-4xl font-bold">The Weekender</h1>
```

Run:

```sh
pnpm dev
```

The heading should render larger and bold. Inspect it in browser developer tools. Its styles should come from generated Tailwind CSS rather than an inline style attribute.

Remove the temporary test once you begin the real home page. The same utility classes will appear throughout the finished templates.

## Prove React is available

You do not need to add a permanent test component. Astro's type checker can confirm that the integration and JSX settings agree once a real `.tsx` island exists. For now, run:

```sh
pnpm build
```

The build should complete with the React integration and Tailwind plugin loaded.

## Why this split matters

Tailwind runs while the project builds and produces CSS for any page or component. React has two phases. Astro can render a React component to HTML during generation, and a client directive can send its JavaScript to the browser for hydration.

Adding React does not make every page client-rendered. The choice is made at each component use, such as `<EventExplorer client:load events={events} />`.

## Checkpoint

Confirm all of the following:

- `astro.config.mjs` contains `react()` in `integrations`.
- `tailwindcss()` appears under `vite.plugins`.
- `src/styles/global.css` imports `tailwindcss`.
- The project has no Tailwind 3 configuration file.
- `pnpm build` completes.

## Exercise

Explain why `SiteFooter.astro` does not need React even though the project has React installed. It renders text and links with no browser state. A framework should be chosen for a component's behavior, not because it is available in the project.
