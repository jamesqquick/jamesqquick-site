---
slug: generate-event-routes
title: Generate Event Detail Routes
moduleSlug: generate-the-static-site
moduleTitle: "Generate the Static Site"
moduleOrder: 5
lessonOrder: 2
published: true
duration: "14 minutes"
summary: Use getStaticPaths to generate one event detail URL per published content entry and connect every event link.
resources:
  - https://docs.astro.build/en/guides/routing/#dynamic-routes
  - https://docs.astro.build/en/reference/routing-reference/#getstaticpaths
---

# Generate Event Detail Routes

## Outcome

You will add the dynamic file `src/pages/events/[id].astro`. `getStaticPaths()` will turn each published event ID into a concrete static route. You will then point the home page and cards at those routes.

## Generate paths from content

Create `src/pages/events/[id].astro` with this script:

```astro
---
import { Image } from 'astro:assets';

import BaseLayout from '../../layouts/BaseLayout.astro';
import { getPublishedEvents } from '../../lib/content';
import {
  CATEGORY_LABELS,
  formatEventDate,
  formatEventTime,
  formatPrice,
} from '../../lib/events';

export async function getStaticPaths() {
  const events = await getPublishedEvents();

  return events.map((event) => ({
    params: { id: event.id },
    props: { event },
  }));
}

const { event } = Astro.props;
---
```

The bracketed filename declares a dynamic `id` segment. Static output cannot wait for a request to discover that value, so `getStaticPaths()` returns every route at build time.

Each returned object has two jobs. `params.id` controls the URL, while `props.event` supplies the validated entry to the page. The route ID comes from the Markdown filename, so `riverfront-sunset-sessions.md` becomes `/events/riverfront-sunset-sessions/`.

## Render a useful first detail page

Add a layout and event header:

```astro
<BaseLayout title={event.data.title} description={event.data.description}>
  <article class="page-shell py-8 sm:py-12">
    <nav aria-label="Breadcrumb" class="mb-6 text-sm font-bold">
      <ol class="flex flex-wrap items-center gap-2">
        <li><a class="hover:underline" href="/events/">Events</a></li>
        <li aria-hidden="true">/</li>
        <li aria-current="page">{event.data.title}</li>
      </ol>
    </nav>

    <header class="grid gap-7 lg:grid-cols-[1.12fr_0.88fr]">
      <div
        class="border-ink relative min-h-80 overflow-hidden border-2 shadow-[7px_7px_0_var(--color-ink)]"
      >
        <Image
          alt={event.data.imageAlt}
          class="bg-blue absolute inset-0 h-full w-full object-contain"
          loading="eager"
          src={event.data.image}
        />
      </div>
      <div
        class="border-ink bg-yellow grid content-between gap-8 border-2 p-6 shadow-[7px_7px_0_var(--color-ink)] sm:p-9"
      >
        <div>
          <div
            class="mb-6 flex flex-wrap justify-between gap-3 text-xs font-black tracking-[0.15em] uppercase"
          >
            <span class="bg-paper border-ink border px-2 py-1">
              {CATEGORY_LABELS[event.data.category]}
            </span>
            <span>{formatPrice(event.data.price)}</span>
          </div>
          <h1
            class="font-display text-[clamp(3.5rem,8vw,6.7rem)] leading-[0.85] uppercase"
          >
            {event.data.title}
          </h1>
          <p class="mt-6 text-lg leading-relaxed font-semibold">
            {event.data.description}
          </p>
        </div>
        <p class="font-bold">
          {formatEventDate(event.data.start)} /
          {formatEventTime(event.data.start, event.data.end)}
        </p>
      </div>
    </header>
  </article>
</BaseLayout>
```

This is an intentionally intermediate detail page. It proves route generation and renders core event fields. The next lesson resolves the venue and renders the Markdown body.

Do not add a save button. Saved-event behavior starts in section 7.

## Connect card links

In `EventCard.astro`, change both `/events/` link targets:

```diff
-href="/events/"
+href={`/events/${event.id}/`}
```

Do the same for the editor's pick image and title links in `src/pages/index.astro`, using `heroEvent.event.id`:

```astro
href={`/events/${heroEvent.event.id}/`}
```

The destination now exists for every published event, so the temporary directory target is no longer needed.

## Runnable checkpoint

Run:

```sh
pnpm check
pnpm build
pnpm preview
```

Open `/events/riverfront-sunset-sessions/` and `/events/stax-soul-brunch/`. Both should render distinct titles and poster data. Follow a card link from `/events/` and the editor's pick link from `/`; neither should lead to a missing page.
