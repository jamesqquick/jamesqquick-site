---
slug: tour-project-structure
title: Tour the Project Structure
moduleSlug: create-the-astro-foundation
moduleTitle: "Create the Astro Foundation"
moduleOrder: 2
lessonOrder: 2
published: true
duration: "8 minutes"
summary: Learn the purpose of each Weekender folder and place new files where Astro and future maintainers expect them.
resources:
  - https://docs.astro.build/en/basics/project-structure/
  - https://docs.astro.build/en/basics/astro-pages/
---

# Tour the Project Structure

## Outcome

You will learn how Astro maps files to responsibilities, then create the empty source folders used by the finished Weekender. The goal is a structure that stays easy to navigate as content, static pages, and React islands are added.

## Start with Astro's conventions

Astro gives a few directories special meaning.

`src/pages/` is required for file-based routing. A file at `src/pages/about.astro` becomes `/about/`, while `src/pages/index.astro` becomes `/`.

`public/` holds files Astro should copy without processing. The project will store files such as its favicon there when a stable public URL is needed.

`src/` holds source files that participate in the build. Imports from this folder can be type-checked, bundled, transformed, or optimized.

`dist/` is generated output. Never treat it as source. Delete and rebuild it whenever necessary rather than editing a generated HTML file.

## Create the Weekender folders

Create the application directories used by the finished project:

```sh
mkdir -p src/assets/events
mkdir -p src/components/events
mkdir -p src/components/layout
mkdir -p src/content/events
mkdir -p src/content/venues
mkdir -p src/layouts
mkdir -p src/lib
mkdir -p src/styles
```

These commands create directories only. Keep the generated `src/pages/index.astro` in place for now.

Your source tree will grow into this shape:

```text
src/
|-- assets/
|   `-- events/
|-- components/
|   |-- events/
|   `-- layout/
|-- content/
|   |-- events/
|   `-- venues/
|-- layouts/
|-- lib/
|-- pages/
`-- styles/
```

## Know what belongs in each folder

### Assets

`src/assets/events/` contains local event artwork imported by content entries. Unlike files in `public/`, imported assets pass through Astro's asset pipeline. The finished project can therefore give the `Image` component source metadata and generate appropriate output widths.

Use `public/` when you need an unchanged URL. Use `src/assets/` when code or content imports an image and Astro should process it.

### Components

`src/components/layout/` holds `SiteHeader.astro` and `SiteFooter.astro`. `src/components/events/` holds the repeated `EventCard.astro` plus React components such as `EventExplorer.tsx` and `SaveEventButton.tsx`.

Astro does not require components to live here, but one components folder makes reusable UI easy to find. Grouping by feature is more useful than splitting components into many technical categories.

### Content

`src/content/events/` and `src/content/venues/` hold Markdown entries. Their fields are validated by collections in `src/content.config.ts`.

These entries are not pages by themselves. Pages query them and decide which URLs to generate. That separation lets one event appear on the home page, its event detail page, its venue page, and a category page without duplicating content.

### Layouts

`src/layouts/BaseLayout.astro` owns the shared HTML document, metadata, skip link, header, main region, and footer. Pages pass it a title and description, then render page-specific content through its slot.

A layout is still an Astro component. It gets its own folder because it defines the frame around full pages rather than a smaller reusable element.

### Library code

`src/lib/` stores application logic without page markup. The finished project uses separate files for content queries, event formatting, filters, saved-event persistence, and the saved-event React hook.

Keeping pure operations here makes them reusable and testable. For example, date formatting should not be copied into every card and page.

### Pages

The finished `src/pages/` folder includes static and dynamic routes:

```text
src/pages/
|-- categories/[category].astro
|-- events/[id].astro
|-- events/index.astro
|-- venues/[id].astro
|-- 404.astro
|-- about.astro
|-- index.astro
|-- rss.xml.ts
`-- saved.astro
```

Square brackets mark a dynamic parameter. In a static project, the page's `getStaticPaths()` function supplies the actual parameter values during the build.

`rss.xml.ts` is an endpoint rather than a visual page. It returns XML, which shows that file-based routing is not limited to HTML.

### Styles

`src/styles/global.css` imports local fonts and Tailwind CSS, defines project tokens, and adds shared base and component rules. Most element styling remains close to the markup as Tailwind utility classes.

## Avoid two common placement mistakes

Do not put event poster art in `public/` if you want Astro's `Image` component to process it. The finished content entries import images from `src/assets/events/`.

Do not put reusable data operations in a page frontmatter block if several routes need them. The finished project will centralize those queries in `src/lib/content.ts`.

## Verification

Run the development server after creating the directories:

```sh
pnpm dev
```

Empty folders do not change the current page, so the starter should still render. That is the expected result.

## Exercise

For each future file, choose its folder and explain why: an event poster, a global color token, a dynamic venue route, a price formatter, and a save button with React state. Your answers should be `src/assets/events/`, `src/styles/`, `src/pages/venues/`, `src/lib/`, and `src/components/events/`.
