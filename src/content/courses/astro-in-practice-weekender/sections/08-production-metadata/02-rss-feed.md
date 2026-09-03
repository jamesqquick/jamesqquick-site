---
slug: rss-feed
title: Generate the RSS Feed
moduleSlug: production-metadata
moduleTitle: "Add Production Metadata and Discovery"
moduleOrder: 8
lessonOrder: 2
published: true
duration: "12 minutes"
summary: Generate an RSS document from published events and advertise it from every page.
resources:
  - https://docs.astro.build/en/recipes/rss/
  - https://docs.astro.build/en/reference/modules/astro-content/#getcollection
---

# Generate the RSS Feed

## Outcome

You will add `/rss.xml`, generated from the same published event collection as the site. You will also advertise the feed in the shared document head.

RSS is another view of existing content. It should query content directly instead of scraping rendered pages or maintaining a second list.

## Install the RSS helper

Install the Astro package used by the reference project:

```sh
pnpm add @astrojs/rss@^4.0.19
```

`@astrojs/rss` handles XML escaping and response headers. The route still controls which entries appear and how links are formed.

## Create the feed route

Create `src/pages/rss.xml.ts`:

```ts
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ site }) => {
  const events = await getCollection("events", ({ data }) => !data.draft);
  const sortedEvents = events.sort(
    (first, second) => first.data.start.getTime() - second.data.start.getTime()
  );

  return rss({
    title: "The Weekender",
    description: "Eight Memphis events for September 4-6.",
    site: site ?? "https://weekender.example.com",
    items: sortedEvents.map((event) => ({
      title: event.data.title,
      description: event.data.description,
      link: `/events/${event.id}/`,
    })),
  });
};
```

The content predicate matches `getPublishedEvents()`: draft events stay out of generated routes and the feed. Sorting by `start` makes feed order predictable and matches the event directory.

Item links stay relative in the mapping. The RSS helper resolves them against `site` and produces absolute URLs in the XML.

The example origin keeps this intermediate build runnable before Astro has a configured site. It is not a production setting. Lesson 8.3 will configure the app from `SITE_URL`, and every production build must set that environment variable to its public origin.

## Advertise the feed

Add this tag to the head in `src/layouts/BaseLayout.astro`, near the favicon:

```astro
<link
  rel="alternate"
  type="application/rss+xml"
  title="The Weekender event feed"
  href="/rss.xml"
/>
```

The link lets browsers and feed tools discover RSS from any page. It is relative for the same reason as the current social image path: the production origin is configured in the next lesson.

## Inspect the route

Astro treats a file named `rss.xml.ts` as an endpoint whose public path ends in `.xml`. Static output runs `GET` during the build and writes `dist/rss.xml`.

The endpoint does not include event bodies or venue records because the feed needs a title, short description, and destination. Keeping items small makes the feed useful without duplicating each detail page.

## Runnable checkpoint

Run:

```sh
pnpm check
pnpm build
pnpm preview
```

Open `/rss.xml`. The response must be XML with eight `<item>` entries ordered by event start time. Each item must link to its generated `/events/<id>/` route. View the source of `/` and confirm it contains an alternate link with `type="application/rss+xml"` and `href="/rss.xml"`.
