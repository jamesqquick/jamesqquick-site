---
slug: build-event-directory
title: Build the Event Directory
moduleSlug: generate-the-static-site
moduleTitle: "Generate the Static Site"
moduleOrder: 5
lessonOrder: 1
published: true
duration: "12 minutes"
summary: Replace the events route stub with a statically rendered directory backed by resolved event and venue content.
resources:
  - https://docs.astro.build/en/basics/astro-pages/
---

# Build the Event Directory

## Outcome

You will replace the `/events/` stub with a complete directory of all published events. This first version is entirely static. React filtering arrives in section 6 after the route and content rendering work on their own.

## Load resolved entries in the page script

Open `src/pages/events/index.astro` and replace its stub script with:

```astro
---
import EventCard from '../../components/events/EventCard.astro';
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getEventsWithVenues } from '../../lib/content';

const events = await getEventsWithVenues();
---
```

Astro runs this code while generating the route. `getEventsWithVenues()` already filters drafts, sorts by start time, and resolves each venue reference. The page should not duplicate those rules.

No `client:*` directive appears here. A collection query at build time does not require browser JavaScript.

## Add the directory header

Use the shared layout and replace the stub content with:

```astro
<BaseLayout
  title="Browse events"
  description="Browse eight Memphis events for September 4-6."
>
  <header class="bg-cream border-ink border-b-2">
    <div
      class="page-shell grid gap-5 py-10 sm:py-14 md:grid-cols-[1fr_25rem] md:items-end"
    >
      <div>
        <p class="text-tomato text-sm font-black tracking-[0.2em] uppercase">
          This weekend in Memphis
        </p>
        <h1
          class="font-display mt-2 text-6xl leading-[0.9] uppercase sm:text-8xl"
        >
          Browse all 8 events
        </h1>
      </div>
      <p class="text-lg leading-relaxed font-semibold md:text-right">
        Start with Friday night, then work through Saturday and Sunday.
      </p>
    </div>
  </header>

  <!-- The directory grid goes here. -->
</BaseLayout>
```

The header describes the current capability instead of promising filtering or saved events that do not exist yet. Course copy should match the implementation at each checkpoint.

## Render every event card

Replace the grid comment:

```astro
<section class="page-shell py-10 sm:py-14" aria-labelledby="lineup-heading">
  <div class="border-ink mb-7 border-b-2 pb-4">
    <p class="text-blue text-sm font-extrabold tracking-[0.18em] uppercase">
      September 4-6
    </p>
    <h2
      class="font-display text-ink text-4xl leading-none uppercase sm:text-5xl"
      id="lineup-heading"
    >
      Weekend lineup
    </h2>
  </div>

  <div class="grid gap-7 lg:grid-cols-2">
    {
      events.map(({ event, venue }, index) => (
        <EventCard event={event} venue={venue} eager={index < 2} />
      ))
    }
  </div>
</section>
```

The page passes the event and its already resolved venue to each card. `EventCard` stays a rendering component and performs no collection query.

Only the first two posters receive eager loading because they are the cards most likely to enter the first viewport. The page owns that decision because it knows where each card appears.

## Confirm the generated output

Astro produces the event directory as HTML during `pnpm build`. The event titles, dates, prices, and venue names should be present before any browser JavaScript runs.

This gives the app a durable baseline. Section 6 will move the list into a React island only because filtering needs browser state, not because React is needed to render cards.

## Runnable checkpoint

Run:

```sh
pnpm check
pnpm build
pnpm preview
```

Visit `/events/`. The page should contain eight event cards in chronological order, starting with Riverfront Sunset Sessions and ending with Stax Soul Brunch. Disable JavaScript and reload. The complete directory should remain visible.
