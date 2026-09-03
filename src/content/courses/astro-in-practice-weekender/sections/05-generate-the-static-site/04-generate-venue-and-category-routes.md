---
slug: generate-venue-and-category-routes
title: Generate Venue and Category Routes
moduleSlug: generate-the-static-site
moduleTitle: "Generate the Static Site"
moduleOrder: 5
lessonOrder: 4
published: true
duration: "16 minutes"
summary: Generate venue pages from content entries and category pages from the shared category vocabulary.
resources:
  - https://docs.astro.build/en/guides/routing/#dynamic-routes
  - https://docs.astro.build/en/reference/modules/astro-content/#getcollection
---

# Generate Venue and Category Routes

## Outcome

You will generate eight venue pages and five category pages. Both use dynamic route files, but their path sources differ. Venue paths come from content entries. Category paths come from the closed category list in `src/lib/events.ts`.

## Generate venue paths

Create `src/pages/venues/[id].astro` with this script:

```astro
---
import { getCollection, render } from 'astro:content';

import EventCard from '../../components/events/EventCard.astro';
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getEventsWithVenues } from '../../lib/content';

export async function getStaticPaths() {
  const venues = await getCollection('venues');

  return venues.map((venue) => ({
    params: { id: venue.id },
    props: { venue },
  }));
}

const { venue } = Astro.props;
const { Content } = await render(venue);
const venueEvents = (await getEventsWithVenues()).filter(
  ({ venue: eventVenue }) => eventVenue.id === venue.id,
);
---
```

The route maps one content entry to one path. Filtering by resolved venue ID is safer than comparing names because display names can change without changing the relationship.

## Render the venue page

Add the main page structure:

```astro
<BaseLayout title={venue.data.name} description={venue.data.description}>
  <header class="bg-blue text-paper border-ink border-b-2">
    <div
      class="page-shell grid gap-8 py-12 sm:py-16 lg:grid-cols-[1fr_24rem] lg:items-end"
    >
      <div>
        <p class="text-yellow text-sm font-black tracking-[0.2em] uppercase">
          {venue.data.neighborhood} venue
        </p>
        <h1
          class="font-display mt-2 text-6xl leading-[0.88] uppercase sm:text-8xl"
        >
          {venue.data.name}
        </h1>
      </div>
      <p class="text-lg leading-relaxed font-semibold">
        {venue.data.description}
      </p>
    </div>
  </header>

  <div
    class="page-shell grid gap-12 py-12 sm:py-16 lg:grid-cols-[22rem_minmax(0,1fr)]"
  >
    <aside class="border-ink bg-yellow grid gap-6 border-2 p-6">
      <div>
        <p class="text-blue text-xs font-black tracking-[0.18em] uppercase">
          Address
        </p>
        <p class="mt-2 font-bold">{venue.data.address}</p>
      </div>
      <div>
        <h2 class="text-blue text-xs font-black tracking-[0.18em] uppercase">
          Accessibility
        </h2>
        <ul class="mt-2 grid gap-2 text-sm">
          {venue.data.accessibility.map((item) => <li>{item}</li>)}
        </ul>
      </div>
      {
        venue.data.website && (
          <a href={venue.data.website} rel="noreferrer" target="_blank">
            Visit venue website
            <span class="sr-only"> (opens in a new tab)</span>
          </a>
        )
      }
    </aside>

    <div>
      <div class="event-prose"><Content /></div>
      <section class="mt-12" aria-labelledby="venue-events-heading">
        <h2
          class="font-display mb-6 text-4xl uppercase sm:text-5xl"
          id="venue-events-heading"
        >
          Events here
        </h2>
        <div class="grid gap-7 xl:grid-cols-2">
          {
            venueEvents.map(({ event, venue: eventVenue }) => (
              <EventCard event={event} venue={eventVenue} />
            ))
          }
        </div>
      </section>
    </div>
  </div>
</BaseLayout>
```

External venue websites use `target="_blank"`, so the accessible name announces the new tab. Internal event and venue links stay in the same tab.

## Generate category paths from constants

Create `src/pages/categories/[category].astro`:

```astro
---
import EventCard from '../../components/events/EventCard.astro';
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getEventsWithVenues } from '../../lib/content';
import {
  CATEGORY_LABELS,
  EVENT_CATEGORIES,
  type EventCategory,
} from '../../lib/events';

export function getStaticPaths() {
  return EVENT_CATEGORIES.map((category) => ({
    params: { category },
    props: { category },
  }));
}

const { category } = Astro.props as { category: EventCategory };
const categoryEvents = (await getEventsWithVenues()).filter(
  ({ event }) => event.data.category === category,
);
const categoryLabel = CATEGORY_LABELS[category];
---

<BaseLayout
  title={categoryLabel}
  description={`Browse Memphis events in the ${categoryLabel.toLowerCase()} category.`}
>
  <header class="bg-yellow border-ink border-b-2">
    <div class="page-shell py-12 sm:py-16">
      <p class="text-blue text-sm font-black tracking-[0.2em] uppercase">
        Browse by category
      </p>
      <h1
        class="font-display mt-2 text-7xl leading-[0.85] uppercase sm:text-9xl"
      >
        {categoryLabel}
      </h1>
      <p class="mt-6 text-lg font-semibold">
        {categoryEvents.length}
        {categoryEvents.length === 1 ? ' event' : ' events'} in this guide.
      </p>
    </div>
  </header>

  <section class="page-shell py-12 sm:py-16" aria-label={`${categoryLabel} events`}>
    <div class="grid gap-8 lg:grid-cols-2">
      {
        categoryEvents.map(({ event, venue }, index) => (
          <EventCard event={event} venue={venue} eager={index < 2} />
        ))
      }
    </div>
    <a class="mt-12 inline-flex font-black underline" href="/events/">
      Browse every event
    </a>
  </section>
</BaseLayout>
```

The category route does not scan current entries to discover categories. The schema and navigation need the closed vocabulary even when a category temporarily has zero events. Generating from `EVENT_CATEGORIES` keeps those parts aligned.

## Runnable checkpoint

Run:

```sh
pnpm check
pnpm build
pnpm preview
```

Open `/venues/tom-lee-park/`, `/venues/crosstown-theater/`, `/categories/music/`, and `/categories/outdoors/`. Venue pages should render their Markdown and associated events. Category pages should show only matching events. The build output should contain eight venue routes and five category routes.
