---
slug: render-markdown-and-venues
title: Render Markdown and Venue Data
moduleSlug: generate-the-static-site
moduleTitle: "Generate the Static Site"
moduleOrder: 5
lessonOrder: 3
published: true
duration: "15 minutes"
summary: Resolve each event's venue reference, render its Markdown body, and add event-specific schedule, location, cost, and accessibility details.
resources:
  - https://docs.astro.build/en/reference/modules/astro-content/#render
  - https://docs.astro.build/en/reference/modules/astro-content/#getentry
---

# Render Markdown and Venue Data

## Outcome

You will finish the main event detail content. The route will resolve its venue reference, render the event's Markdown body, and keep structured fields in predictable page regions.

## Resolve the venue in the route

Update the imports in `src/pages/events/[id].astro`:

```diff
 import { Image } from 'astro:assets';
+import { getEntry, render } from 'astro:content';

-import { getPublishedEvents } from '../../lib/content';
+import { getPublishedEvents, MissingVenueError } from '../../lib/content';
```

After `const { event } = Astro.props`, resolve the reference and render the body:

```ts
const venue = await getEntry(event.data.venue);

if (!venue) {
  throw new MissingVenueError(event.id);
}

const { Content } = await render(event);
```

`getEntry()` returns the referenced venue or `undefined`. The schema catches broken local references during sync, but the explicit guard makes this page safe if the content source or loader changes later.

`render(event)` compiles the Markdown body and returns an Astro `Content` component. Frontmatter remains available through `event.data`; the prose body is rendered where the page places `<Content />`.

## Add structured event facts

After the header, add a definition list:

```astro
<div class="bg-blue text-paper border-ink mt-12 border-y-2">
  <dl
    class="page-shell grid divide-y-2 divide-white/30 sm:grid-cols-3 sm:divide-x-2 sm:divide-y-0"
  >
    <div class="px-4 py-6 sm:px-7">
      <dt class="text-yellow text-xs font-black tracking-[0.18em] uppercase">
        When
      </dt>
      <dd class="font-display mt-1 text-2xl uppercase">
        {formatEventDate(event.data.start)}
      </dd>
      <dd>{formatEventTime(event.data.start, event.data.end)}</dd>
    </div>
    <div class="px-4 py-6 sm:px-7">
      <dt class="text-yellow text-xs font-black tracking-[0.18em] uppercase">
        Where
      </dt>
      <dd class="font-display mt-1 text-2xl uppercase">
        <a class="hover:underline" href={`/venues/${venue.id}/`}>
          {venue.data.name}
        </a>
      </dd>
      <dd>{venue.data.neighborhood}</dd>
    </div>
    <div class="px-4 py-6 sm:px-7">
      <dt class="text-yellow text-xs font-black tracking-[0.18em] uppercase">
        Cost
      </dt>
      <dd class="font-display mt-1 text-2xl uppercase">
        {formatPrice(event.data.price)}
      </dd>
      <dd>
        {event.data.price === 0 ? 'No ticket needed' : 'Advance ticket recommended'}
      </dd>
    </div>
  </dl>
</div>
```

A definition list matches the label-and-value relationship. The venue link points to a route that will be generated in the next lesson. It is acceptable for that destination to remain unavailable for this one checkpoint because the event page itself is complete and the target route is the next ordered change.

## Render prose and supporting details

Add the body area after the definition list:

```astro
<div
  class="page-shell grid gap-12 py-14 sm:py-18 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start"
>
  <div class="event-prose">
    <Content />
  </div>

  <aside class="grid gap-6 lg:sticky lg:top-6">
    <section
      class="border-ink bg-cream border-2 p-5 shadow-[4px_4px_0_var(--color-ink)]"
    >
      <h2 class="font-display text-2xl uppercase">Accessibility</h2>
      {
        event.data.accessibility.length > 0 ? (
          <ul class="mt-3 grid gap-2 text-sm">
            {event.data.accessibility.map((item) => <li>{item}</li>)}
          </ul>
        ) : (
          <p class="mt-3 text-sm">
            Contact the venue for current accessibility details.
          </p>
        )
      }
    </section>

    <section class="border-ink bg-paper border-2 p-5">
      <p class="text-blue text-xs font-black tracking-[0.18em] uppercase">
        Venue
      </p>
      <h2 class="font-display mt-1 text-2xl uppercase">{venue.data.name}</h2>
      <p class="mt-2 text-sm leading-relaxed">{venue.data.address}</p>
      <a
        class="mt-4 inline-flex min-h-11 items-center font-bold underline decoration-2 underline-offset-4"
        href={`/venues/${venue.id}/`}
      >
        View venue details
      </a>
    </section>
  </aside>
</div>
```

The existing `.event-prose` class scopes typography for headings, lists, and paragraphs generated from Markdown. The content author controls structure, while the page controls its width and visual treatment.

Event accessibility stays separate from venue accessibility. Open captions or ASL interpretation may apply to one event without applying to every program at that location.

## Runnable checkpoint

Run:

```sh
pnpm check
pnpm build
pnpm preview
```

Open `/events/riverfront-sunset-sessions/`. Confirm the schedule from Markdown renders, the structured When, Where, and Cost values appear, and the accessibility list contains three event-specific items. The build must complete before venue routes exist.
