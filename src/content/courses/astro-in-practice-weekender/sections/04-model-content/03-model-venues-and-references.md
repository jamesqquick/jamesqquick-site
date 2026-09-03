---
slug: model-venues-and-references
title: Model Venues and References
moduleSlug: model-content
moduleTitle: "Model Events and Venues"
moduleOrder: 4
lessonOrder: 3
published: true
duration: "12 minutes"
summary: Validate venue documents and replace event venue strings with typed Content Layer references.
resources:
  - https://docs.astro.build/en/guides/content-collections/#defining-collection-references
  - https://docs.astro.build/en/reference/modules/astro-content/#reference
---

# Model Venues and References

## Outcome

You will add the complete venue schema and change `event.data.venue` from an arbitrary string into a typed reference to the `venues` collection.

A venue has its own description, address, accessibility details, and Markdown body. Keeping it as a collection entry avoids repeating that information in every event held there. It also gives the site enough data to generate venue pages later.

## Validate venue URLs narrowly

Add this helper above the collection definitions in `src/content.config.ts`:

```ts
function isHttpUrl(value: string) {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}
```

Zod's URL validation checks URL syntax. Weekender adds a protocol rule because venue links should navigate in a browser. This rejects syntactically valid values with protocols such as `ftp:`.

The helper catches `new URL()` failures and returns a boolean. That keeps parsing details out of the schema declaration.

## Replace the venue schema

Replace the placeholder `venues` collection:

```ts
const venues = defineCollection({
  loader: glob({
    base: "./src/content/venues",
    pattern: "**/*.{md,mdx}",
  }),
  schema: z.object({
    name: z.string(),
    description: z.string(),
    address: z.string(),
    neighborhood: z.string(),
    website: z
      .url()
      .refine(isHttpUrl, {
        message: "Venue websites must use HTTP or HTTPS.",
      })
      .optional(),
    accessibility: z.array(z.string()).default([]),
  }),
});
```

`website` is optional because the app should still publish a venue that has no useful external link. Accessibility defaults to an empty array for the same reason it does on events. A page can render a useful fallback without testing whether the property exists.

## Connect events to venues

Update the import from `astro:content`:

```diff
-import { defineCollection } from 'astro:content';
+import { defineCollection, reference } from 'astro:content';
```

Then replace the transitional venue field inside the event schema:

```diff
-      venue: z.string(),
+      venue: reference('venues'),
```

The frontmatter value will still look like `venue: tom-lee-park`. The difference is its validated meaning. Astro now knows the value points to a `venues` entry, and TypeScript carries that relationship as a collection reference.

This does not inline venue data into an event. Code will resolve the reference with `getEntry()` when it needs the related entry. That explicit query makes missing data and asynchronous work visible.

## Understand entry IDs

The glob loader derives each entry ID from its path relative to the collection base. For example:

```text
src/content/venues/tom-lee-park.md
```

produces the ID `tom-lee-park`. An event can reference it with:

```yaml
venue: tom-lee-park
```

Use stable lowercase filenames with hyphens. Those IDs will also become static route parameters in section 5.

## Why accessibility appears twice

Venue accessibility describes the place. Event accessibility describes the specific program. A theater may have step-free access, while only one screening provides open captions.

Do not merge those arrays in the content model. Templates can show venue details and event accommodations in the context where each claim is accurate.

## Runnable checkpoint

Run:

```sh
pnpm astro sync
pnpm check
pnpm build
```

The build should pass with empty collections. `event.data.venue` is now modeled as a reference to `venues`, while the rendered site still reads `temporaryEvents`.
