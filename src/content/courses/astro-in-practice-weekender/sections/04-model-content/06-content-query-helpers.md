---
slug: content-query-helpers
title: Build the Content Query Layer
moduleSlug: model-content
moduleTitle: "Model Events and Venues"
moduleOrder: 4
lessonOrder: 6
published: true
duration: "16 minutes"
summary: Query published events, resolve venue references, and switch the home page and event card from temporary objects to validated content entries.
resources:
  - https://docs.astro.build/en/reference/modules/astro-content/#getcollection
  - https://docs.astro.build/en/reference/modules/astro-content/#getentry
---

# Build the Content Query Layer

## Outcome

You will create a small query layer that filters drafts, sorts events, and resolves venue references. Then you will update `EventCard.astro` and the home page in one migration. Only after the app builds from collections will you remove `src/lib/temporary-events.ts`.

Pages should ask for useful domain data rather than repeat collection plumbing. Weekender's common unit is an event paired with its venue, so the helper will return that pair.

## Define the resolved relationship

Create `src/lib/content.ts`:

```ts
import { getCollection, getEntry, type CollectionEntry } from "astro:content";

export interface EventWithVenue {
  event: CollectionEntry<"events">;
  venue: CollectionEntry<"venues">;
}

export class MissingVenueError extends Error {
  constructor(eventId: string) {
    super(`Venue not found for event: ${eventId}`);
    this.name = "MissingVenueError";
  }
}
```

`CollectionEntry<'events'>` comes from the schema Astro generated. Components now receive types based on validated content instead of a handwritten duplicate.

The custom error carries the event ID. A generic `Error('Missing venue')` would hide the content entry that needs repair.

## Query and sort published events

Add the first helper:

```ts
export async function getPublishedEvents() {
  const events = await getCollection("events", ({ data }) => !data.draft);

  return events.sort(
    (first, second) => first.data.start.getTime() - second.data.start.getTime()
  );
}
```

The collection callback filters drafts while entries load. Sorting in one helper gives every page the same chronological order. JavaScript's `sort()` mutates the returned array, which is safe here because the array is local to this call.

## Resolve venue references

Add the paired query:

```ts
export async function getEventsWithVenues(): Promise<EventWithVenue[]> {
  const events = await getPublishedEvents();

  return Promise.all(
    events.map(async (event) => {
      const venue = await getEntry(event.data.venue);

      if (!venue) {
        throw new MissingVenueError(event.id);
      }

      return { event, venue };
    })
  );
}
```

`event.data.venue` is the typed reference created by `reference('venues')`. Passing it to `getEntry()` preserves the target collection type, so `venue.data.name` and the other venue fields are type-checked.

`Promise.all()` resolves every venue while preserving event order. A broken reference should stop the build. Publishing an event page with missing location data would be worse than a clear build failure.

## Migrate the event card

Update the script in `src/components/events/EventCard.astro`:

```diff
 import { Image } from 'astro:assets';
-import type { TemporaryEvent } from '../../lib/temporary-events';
+import type { CollectionEntry } from 'astro:content';
+
+import {
+  CATEGORY_LABELS,
+  formatEventDate,
+  formatEventTime,
+  formatPrice,
+} from '../../lib/events';

 interface Props {
-  event: TemporaryEvent;
+  event: CollectionEntry<'events'>;
+  venue: CollectionEntry<'venues'>;
   eager?: boolean;
   featured?: boolean;
 }

-const { event, eager = false, featured = false } = Astro.props;
+const { event, venue, eager = false, featured = false } = Astro.props;
```

Replace temporary display fields throughout the template:

```diff
-{event.categoryLabel}
+{CATEGORY_LABELS[event.data.category]}

-{event.priceLabel}
+{formatPrice(event.data.price)}

-{event.date} / {event.time}
+{formatEventDate(event.data.start)} / {formatEventTime(event.data.start, event.data.end)}

-{event.title}
+{event.data.title}

-{event.description}
+{event.data.description}

-{event.venueName} / {event.neighborhood}
+{venue.data.name} / {venue.data.neighborhood}
```

Update the image link's accessible name and both image bindings too:

```diff
-aria-label={`View ${event.title}`}
+aria-label={`View ${event.data.title}`}

-alt={event.imageAlt}
+alt={event.data.imageAlt}

-src={event.image}
+src={event.data.image}
```

Keep both card links pointed at `/events/` for this lesson. Event detail routes do not exist until section 5, so this is a deliberate intermediate link target.

## Switch the home page atomically

In `src/pages/index.astro`, replace the temporary import and destructuring:

```diff
 import EventCard from '../components/events/EventCard.astro';
-import { temporaryEvents } from '../lib/temporary-events';
+import { getEventsWithVenues } from '../lib/content';
+import { formatEventDate, formatEventTime } from '../lib/events';

-const [editorPick, ...secondaryEvents] = temporaryEvents;
+const eventEntries = await getEventsWithVenues();
+const featuredEvents = eventEntries.filter(({ event }) => event.data.featured);
+const [heroEvent, ...secondaryEvents] = featuredEvents;
```

Update every hero binding to read `heroEvent.event.data`, including the image link's accessible name:

```astro
<a
  aria-label={`View ${heroEvent.event.data.title}`}
  class="focus-visible:ring-tomato relative block min-h-72 overflow-hidden outline-none focus-visible:ring-4 focus-visible:ring-inset"
  href="/events/"
>
  <Image
    alt={heroEvent.event.data.imageAlt}
    loading="eager"
    src={heroEvent.event.data.image}
  />
</a>

<p class="text-blue text-sm font-bold">
  {formatEventDate(heroEvent.event.data.start)} /
  {formatEventTime(heroEvent.event.data.start, heroEvent.event.data.end)}
</p>
<h2 class="font-display text-4xl leading-none uppercase sm:text-5xl">
  <a class="hover:underline" href="/events/">
    {heroEvent.event.data.title}
  </a>
</h2>
<p class="leading-relaxed">{heroEvent.event.data.description}</p>
```

Change the secondary card map so each card receives both entries:

```diff
-secondaryEvents.slice(0, 3).map((event, index) => (
-  <EventCard event={event} eager={index === 0} />
+secondaryEvents.slice(0, 3).map(({ event, venue }, index) => (
+  <EventCard event={event} venue={venue} eager={index === 0} />
 ))
```

The page still shows four featured events, but their order now comes from validated start dates rather than array position in a temporary module. After this replacement, the live page should contain no `editorPick` identifier and no direct temporary field access such as `.title`, `.image`, `.imageAlt`, `.date`, `.time`, `.description`, `.categoryLabel`, `.priceLabel`, `.venueName`, or `.neighborhood` on an event object. Collection fields go through `.data`, and venue display fields go through `venue.data`.

## Remove the temporary source last

Search `src/components/events/EventCard.astro` and `src/pages/index.astro` for `temporary-events`, `TemporaryEvent`, and `editorPick`. Also search for every temporary field access listed above. Once no live references remain, remove `src/lib/temporary-events.ts`. Removing it before the page and card migration would break the app between edits.

## Runnable checkpoint

Run the complete migration check:

```sh
pnpm astro sync
pnpm check
pnpm build
```

Open the generated home page with `pnpm preview`. It should show Riverfront Sunset Sessions as the hero and the next three featured events in chronological order. No source file should import `temporary-events`, and the build should succeed after that temporary file is removed.
