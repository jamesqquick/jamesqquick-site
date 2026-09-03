---
slug: related-events-and-404
title: Add Related Events and a 404 Page
moduleSlug: generate-the-static-site
moduleTitle: "Generate the Static Site"
moduleOrder: 5
lessonOrder: 5
published: true
duration: "10 minutes"
summary: Add category-based related events to detail pages and create a useful static fallback for unknown routes.
resources:
  - https://docs.astro.build/en/basics/astro-pages/#custom-404-error-page
---

# Add Related Events and a 404 Page

## Outcome

You will add up to two related events to each detail page and replace the generic missing-page response with a Weekender 404 page.

Related content should use the same validated dataset and card component as the rest of the site. A 404 page should give a visitor a clear route back into that dataset.

## Select related events

Update the content import in `src/pages/events/[id].astro`:

```diff
-import { getPublishedEvents, MissingVenueError } from '../../lib/content';
+import {
+  getEventsWithVenues,
+  getPublishedEvents,
+  MissingVenueError,
+} from '../../lib/content';
```

Import `EventCard`:

```ts
import EventCard from "../../components/events/EventCard.astro";
```

After rendering the event body, create the related list:

```ts
const relatedEvents = (await getEventsWithVenues())
  .filter(
    ({ event: candidate }) =>
      candidate.id !== event.id &&
      candidate.data.category === event.data.category
  )
  .slice(0, 2);
```

The first condition prevents the current event from recommending itself. The second uses the validated category key. `.slice(0, 2)` limits the section without changing the shared query helper.

This is a small editorial rule, not a recommendation engine. It is deterministic, understandable, and enough for a dataset of eight entries.

## Render the related section

Place this section after the event article:

```astro
{
  relatedEvents.length > 0 && (
    <section
      class="bg-cream border-ink border-t-2 py-14 sm:py-18"
      aria-labelledby="related-heading"
    >
      <div class="page-shell">
        <h2
          class="font-display mb-7 text-4xl uppercase sm:text-5xl"
          id="related-heading"
        >
          More in {CATEGORY_LABELS[event.data.category]}
        </h2>
        <div class="grid gap-7 md:grid-cols-2">
          {
            relatedEvents.map(({ event: relatedEvent, venue: relatedVenue }) => (
              <EventCard event={relatedEvent} venue={relatedVenue} />
            ))
          }
        </div>
      </div>
    </section>
  )
}
```

The section does not render when no sibling event exists. Omitting an empty recommendation region is clearer than displaying a heading with no cards.

## Create the custom 404 page

Create `src/pages/404.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout
  title="Page not found"
  description="The page you requested could not be found."
>
  <section
    class="page-shell grid min-h-[70vh] place-items-center py-16 text-center"
  >
    <div
      class="border-ink bg-yellow max-w-3xl border-2 p-8 shadow-[10px_10px_0_var(--color-ink)] sm:p-12"
    >
      <p class="font-display text-tomato text-9xl leading-none">404</p>
      <h1 class="font-display mt-3 text-5xl uppercase sm:text-7xl">
        That plan fell through
      </h1>
      <p class="mx-auto mt-5 max-w-lg text-lg leading-relaxed">
        This page does not exist, but the weekend still does. Head back to the
        lineup and find something worth doing.
      </p>
      <a
        class="bg-blue text-paper border-ink focus-visible:ring-tomato mt-7 inline-flex min-h-12 items-center border-2 px-6 py-3 font-black uppercase outline-none focus-visible:ring-4"
        href="/events/"
      >
        Browse events
      </a>
    </div>
  </section>
</BaseLayout>
```

Astro recognizes `src/pages/404.astro` as the custom not-found page. It still uses `BaseLayout`, so metadata, skip navigation, header, footer, and global styles remain consistent.

The large `404` is visual context, while the `h1` states the page result. The link gives the visitor one direct recovery action.

## Add a browser check for the 404

Playwright is configured in section 9. When you create `tests/e2e/app.spec.ts`, add this concrete route check:

```ts
test("renders the custom 404 with a recovery link", async ({
  page,
  request,
}) => {
  const response = await request.get("/events/not-a-real-event/");

  expect(response.status()).toBe(404);
  await page.goto("/events/not-a-real-event/");
  await expect(
    page.getByRole("heading", { name: "That plan fell through" })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Browse events" })
  ).toHaveAttribute("href", "/events/");
});
```

The request assertion checks the HTTP response rather than only the rendered text. The page assertions then confirm the custom heading and the exact recovery destination.

## Runnable checkpoint

Run:

```sh
pnpm check
pnpm build
pnpm preview
```

Open `/events/riverfront-sunset-sessions/` and confirm it shows Stax Soul Brunch in the related music section. Then request `/events/not-a-real-event/`. The custom page should return status 404, render the heading `That plan fell through`, and expose a `Browse events` link with `href="/events/"`. Add the Playwright check above to the suite when section 9 introduces it.
