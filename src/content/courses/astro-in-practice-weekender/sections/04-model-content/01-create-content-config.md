---
slug: create-content-config
title: Create the Content Configuration
moduleSlug: model-content
moduleTitle: "Model Events and Venues"
moduleOrder: 4
lessonOrder: 1
published: true
duration: "9 minutes"
summary: Configure Astro 7 Content Layer collections with file loaders while the existing temporary event data keeps the site running.
resources:
  - https://docs.astro.build/en/guides/content-collections/
  - https://docs.astro.build/en/reference/content-loader-reference/#glob-loader
---

# Create the Content Configuration

## Outcome

You will create Astro's content configuration and register `events` and `venues` as file-backed collections. The home page will continue using `src/lib/temporary-events.ts`, so this setup does not interrupt the static app from section 3.

Astro 7 uses the Content Layer API. A collection combines a loader, which finds entries, with a schema, which validates their frontmatter. We will add the real schemas over the next two lessons. Starting with empty collections lets us verify the loader and generated types before content and UI changes become mixed together.

## Create the content folders

Create one folder for each kind of document:

```sh
mkdir -p src/content/events src/content/venues
```

An event and a venue have different fields and different page templates, so they belong in separate collections. The relationship between them will be an explicit reference rather than a naming convention hidden inside component code.

## Add the Content Layer configuration

Create `src/content.config.ts`:

```ts
import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const venues = defineCollection({
  loader: glob({
    base: "./src/content/venues",
    pattern: "**/*.{md,mdx}",
  }),
  schema: z.object({}),
});

const events = defineCollection({
  loader: glob({
    base: "./src/content/events",
    pattern: "**/*.{md,mdx}",
  }),
  schema: z.object({}),
});

export const collections = { events, venues };
```

The file must use this exact name and location. Astro discovers `src/content.config.ts` and generates collection types from the exported `collections` object.

`glob()` is a build-time loader from `astro/loaders`. Its `base` limits each collection to one directory. Its pattern accepts Markdown and MDX at any depth. Weekender will use Markdown, but accepting MDX now does not change how Markdown entries render.

The empty `z.object({})` schemas are intentionally temporary. There are no entries yet, and no page queries these collections. This intermediate configuration compiles while giving the next lessons a small, testable place to add validation.

## Keep the current app connected

Do not change `src/pages/index.astro`, `EventCard.astro`, or `src/lib/temporary-events.ts` yet. Content modeling should not force the interface to consume incomplete data.

This gives us two parallel sources for a short time:

- `temporaryEvents` remains the current rendering source.
- The new collections are an empty replacement being built behind it.

The switch happens only after the content schemas, entries, formatters, and query helper all exist. That order avoids half-migrated props and broken pages.

## Generate collection types

Run Astro's sync command whenever you add or rename collections:

```sh
pnpm astro sync
```

Astro reads the config and updates generated types under `.astro/`. Do not edit those generated files. They are an output of the collection definitions.

If Astro reports that it cannot find a loader base, confirm both content directories exist and that the paths are relative to the project root.

## Runnable checkpoint

Run the exact checks below with both content directories still empty:

```sh
pnpm astro sync
pnpm check
pnpm build
```

All three commands should complete, and the home page should still render the four temporary events from `src/lib/temporary-events.ts`.
