---
slug: model-events-zod
title: Model Events with Zod
moduleSlug: model-content
moduleTitle: "Model Events and Venues"
moduleOrder: 4
lessonOrder: 2
published: true
duration: "13 minutes"
summary: Replace the temporary event schema with validated dates, categories, prices, local images, defaults, and editorial fields.
resources:
  - https://docs.astro.build/en/guides/content-collections/#defining-the-collection-schema
  - https://docs.astro.build/en/guides/images/#images-in-content-collections
---

# Model Events with Zod

## Outcome

You will define the event categories and replace the placeholder event schema with the fields used by the reference app. The venue field will remain a validated string for one lesson. That intermediate choice keeps the schema runnable until the `venues` collection has its full model.

## Define the category vocabulary

Create `src/lib/events.ts` with the category values the site supports:

```ts
export const EVENT_CATEGORIES = [
  "music",
  "food",
  "family",
  "market",
  "outdoors",
] as const;
```

`as const` preserves each string as a literal type. Zod can use the same array at runtime, and TypeScript can derive a union from it later. One source of truth prevents a route or filter from accepting a category that content validation rejects.

## Add the event schema

Import the category list near the top of `src/content.config.ts`:

```diff
 import { z } from 'astro/zod';
+
+import { EVENT_CATEGORIES } from './lib/events';
```

Replace only the `events` collection with this definition:

```ts
const events = defineCollection({
  loader: glob({
    base: "./src/content/events",
    pattern: "**/*.{md,mdx}",
  }),
  schema: ({ image }) =>
    z
      .object({
        title: z.string(),
        description: z.string(),
        start: z.coerce.date(),
        end: z.coerce.date().optional(),
        venue: z.string(),
        category: z.enum(EVENT_CATEGORIES),
        price: z.number().nonnegative(),
        featured: z.boolean().default(false),
        image: image(),
        imageAlt: z.string(),
        accessibility: z.array(z.string()).default([]),
        draft: z.boolean().default(false),
      })
      .refine(({ start, end }) => !end || end.getTime() > start.getTime(), {
        message: "Event end must be after its start",
        path: ["end"],
      }),
});
```

The schema is a function because Astro supplies the `image()` helper through its context. That helper validates a local image path and produces image metadata compatible with `astro:assets`.

## Validate source values, not display strings

The temporary objects store date, time, category, and price as labels. The collection stores the values from which those labels can be produced:

- `start` and `end` become `Date` objects.
- `category` is one of five stable keys.
- `price` is a nonnegative number, with `0` representing free admission.
- `featured` and `draft` are booleans with defaults.

This keeps presentation choices out of content. A card, RSS feed, and structured data block may format the same start time differently without editing the event entry.

`z.coerce.date()` is useful for Markdown frontmatter because YAML supplies an ISO date value that still needs to become a JavaScript `Date`. An invalid date fails during content sync instead of reaching a page formatter.

`end` is optional because an event may publish only a start time. When it exists, the object-level refinement compares both parsed dates and rejects an event that ends at or before its start. The error points to `end`, which makes the invalid field clear during content sync. `accessibility` defaults to an empty array so templates can always read `.length` and map over the field.

## Keep the venue field temporary

The reference model uses `reference('venues')`, but this lesson uses `z.string()` on purpose. The venues collection still has a placeholder schema, so the relationship is not ready.

Do not query the collection or update `EventCard` yet. The current home page still compiles against `TemporaryEvent`, while Astro can now reject malformed event content as soon as entries are added.

## Check the date range deliberately

Confirm the object-level rule with a short temporary entry at `src/content/events/schema-check.md`:

```md
---
title: Schema check
description: This file exists only to prove date-range validation.
start: 2026-09-04T19:00:00-05:00
end: 2026-09-04T18:00:00-05:00
venue: temporary-venue
category: music
price: 0
image: ../../assets/events/riverfront-sunset.svg
imageAlt: A temporary event poster.
---
```

Run `pnpm astro sync`. It should reject `end` with `Event end must be after its start`, even though both timestamps are individually valid.

Restore valid frontmatter by changing `end` to `2026-09-04T20:00:00-05:00`, then run `pnpm astro sync` again. It should pass. Remove `schema-check.md` after the successful verification; the real content arrives only after both schemas are complete.

## Runnable checkpoint

With `schema-check.md` removed, run:

```sh
pnpm astro sync
pnpm check
pnpm build
```

The commands should pass. `EVENT_CATEGORIES` should contain five literal values, and the home page should still use the temporary event array.
