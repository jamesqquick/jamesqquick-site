---
slug: build-base-layout
title: Build the Base Layout
moduleSlug: create-the-astro-foundation
moduleTitle: "Create the Astro Foundation"
moduleOrder: 2
lessonOrder: 5
published: true
duration: "12 minutes"
summary: Build the shared Astro document layout with typed metadata, a skip link, and a page content slot.
resources:
  - https://docs.astro.build/en/basics/layouts/
  - https://docs.astro.build/en/reference/api-reference/#astroprops
---

# Build the Base Layout

## Outcome

You will create `src/layouts/BaseLayout.astro`, the shared HTML document used by every Weekender page. The layout will accept typed page metadata, expose a skip link, and render page content through a slot.

This first version deliberately omits the header, footer, canonical URL, and social image. Those features depend on components, deployment configuration, or assets that do not exist yet. Add them only when their prerequisites are in place.

## Add the favicon before referencing it

Create `public/favicon.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" fill="#2048bd" />
  <path d="M10 14h10l6 28 6-20 6 20 6-28h10L44 52H34l-6-18-6 18H12Z" fill="#fff4c7" />
</svg>
```

The layout can now use `/favicon.svg` without pointing to a missing public file.

## Define the layout contract

Create `src/layouts/BaseLayout.astro`. Start with the component script:

```astro
---
import '../styles/global.css';

interface Props {
  title: string;
  description: string;
}

const { title, description } = Astro.props;
const pageTitle =
  title === 'The Weekender' ? title : `${title} | The Weekender`;
---
```

The `Props` interface makes `title` and `description` required for every page.

The home page keeps the short title `The Weekender`. Other pages append the site name, which gives each browser tab context without repeating the name on the home route.

Do not invent a production origin to produce canonical URLs. A later deployment lesson will configure the real site URL before adding canonical and social metadata.

## Create the document head

Add the document shell and metadata:

```astro
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="description" content={description} />
    <meta name="generator" content={Astro.generator} />
    <meta name="theme-color" content="oklch(0.49 0.2 265)" />
    <meta name="viewport" content="width=device-width" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta property="og:type" content="website" />
    <meta property="og:title" content={pageTitle} />
    <meta property="og:description" content={description} />
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content={pageTitle} />
    <meta name="twitter:description" content={description} />
    <title>{pageTitle}</title>
  </head>
</html>
```

The viewport tag lets responsive CSS use the device width. Open Graph and Twitter fields provide explicit text when a route is shared. Keeping the head centralized prevents pages from drifting into different metadata conventions.

Add image, canonical, and RSS metadata later, after the relevant asset, production origin, and endpoint exist.

## Build an accessible body shell

Place this body inside the `html` element after `head`:

```astro
<body class="bg-paper text-ink min-h-screen antialiased">
  <a
    class="bg-yellow text-ink border-ink fixed -top-20 left-3 z-50 border-2 px-4 py-2 font-bold focus:top-3 focus-visible:outline-4 focus-visible:outline-offset-2"
    href="#main-content"
  >
    Skip to content
  </a>
  <div class="flex min-h-screen flex-col">
    <main class="flex-1" id="main-content" tabindex="-1">
      <slot />
    </main>
  </div>
</body>
```

The skip link begins above the viewport and moves into view when it receives keyboard focus. Its destination is the main region. `tabindex="-1"` allows script or link navigation to move focus to that region without adding it to the normal Tab sequence.

The outer `div` is a column with a minimum height equal to the viewport. `main` uses `flex-1`, so the document already has the right structure when the footer is added next.

`<slot />` is where each page's children render. The layout controls the shared document but does not know the structure of a specific route.

## Use the layout from a page

Update `src/pages/index.astro`. Remove the temporary global stylesheet import because the layout owns it now:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout
  title="The Weekender"
  description="A guide to concerts, markets, food, and outdoor events in Memphis for September 4-6."
>
  <h1>The Weekender</h1>
</BaseLayout>
```

TypeScript will report an error if you omit the description or pass an incompatible prop. That feedback is the reason to define `Props` instead of reading untyped values.

## Verification

Run `pnpm dev` and inspect the resulting page source. Confirm the title, description, social text fields, favicon, and main region appear in the generated HTML.

Press Tab as soon as the page loads. The skip link should become visible. Activate it and confirm focus moves to the main content.

Run `pnpm check` and `pnpm build`. Both commands should complete with no missing component imports or public asset references.

## Exercise

Create `src/pages/about.astro` and pass `title="About"` plus a description to `BaseLayout`. Keep the page for the next lesson. Verify that the browser title becomes `About | The Weekender` while the home page title remains `The Weekender`.
