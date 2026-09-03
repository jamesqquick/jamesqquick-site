---
slug: create-serializable-event-summaries
title: Create Serializable Event Summaries
moduleSlug: add-event-filtering
moduleTitle: "Add Event Filtering with React"
moduleOrder: 6
lessonOrder: 2
published: true
duration: "14 minutes"
summary: Convert collection entries and venue references into plain typed summaries that Astro can pass safely to a hydrated React component.
resources:
  - https://docs.astro.build/en/guides/framework-components/#passing-props-to-framework-components
---

# Create Serializable Event Summaries

## Outcome

You will define the plain data contract for the React island, convert collection entries into that contract, and render the same eight events from a hydrated component.

Astro component props can contain collection entries, `Date` objects, and image metadata while rendering on the server. A hydrated framework component must receive values Astro can serialize into the page. Weekender converts dates to ISO strings and image metadata to a source string before crossing that boundary.

## Define the summary contract

Add this interface to `src/lib/events.ts` after the label records:

```ts
export interface EventSummary {
  id: string;
  title: string;
  description: string;
  start: string;
  end?: string;
  day: EventDay;
  category: EventCategory;
  categoryLabel: string;
  price: number;
  venueName: string;
  neighborhood: string;
  imageSrc: string;
  imageAlt: string;
  accessibility: string[];
}
```

The summary contains exactly what the directory displays or filters. It does not include rendered Markdown, the full venue entry, or Astro image metadata.

Keep `price` numeric and `category` as a stable key. React can compare those values directly and call the same display formatters as Astro.

## Convert resolved entries

Update the imports in `src/lib/content.ts`:

```ts
import { CATEGORY_LABELS, type EventDay, type EventSummary } from "./events";
```

Add the exact Memphis-local course dates and a focused error for events outside them:

```ts
const EVENT_DAY_BY_MEMPHIS_DATE: Readonly<Record<string, EventDay>> = {
  "2026-09-04": "friday",
  "2026-09-05": "saturday",
  "2026-09-06": "sunday",
};

export class InvalidEventDayError extends Error {
  constructor(eventId: string, memphisDate: string) {
    super(
      `Event ${eventId} falls outside the September 4-6, 2026 course weekend: ${memphisDate}`
    );
    this.name = "InvalidEventDayError";
  }
}
```

Then add the converter and its private day helper:

```ts
export function toEventSummary({ event, venue }: EventWithVenue): EventSummary {
  return {
    id: event.id,
    title: event.data.title,
    description: event.data.description,
    start: event.data.start.toISOString(),
    end: event.data.end?.toISOString(),
    day: getEventDay(event.id, event.data.start),
    category: event.data.category,
    categoryLabel: CATEGORY_LABELS[event.data.category],
    price: event.data.price,
    venueName: venue.data.name,
    neighborhood: venue.data.neighborhood,
    imageSrc: event.data.image.src,
    imageAlt: event.data.imageAlt,
    accessibility: event.data.accessibility,
  };
}

function getEventDay(eventId: string, date: Date): EventDay {
  const { year, month, day } = Object.fromEntries(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Chicago",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
      .formatToParts(date)
      .map(({ type, value }) => [type, value] as const)
  );
  const memphisDate = `${year}-${month}-${day}`;
  const eventDay = EVENT_DAY_BY_MEMPHIS_DATE[memphisDate];

  if (eventDay) {
    return eventDay;
  }

  throw new InvalidEventDayError(eventId, memphisDate);
}
```

The conversion is the only place that knows how a collection entry becomes an island prop. The date is derived in Memphis time and looked up in an exact course-weekend map. A different Friday, Saturday, or Sunday is not accepted merely because its weekday name matches.

## Create the first React renderer

Create `src/components/events/EventExplorer.tsx`:

```tsx
import {
  formatEventDate,
  formatEventTime,
  formatPrice,
  type EventSummary,
} from "../../lib/events";

interface EventExplorerProps {
  events: EventSummary[];
}

export function EventExplorer({ events }: EventExplorerProps) {
  return (
    <section aria-labelledby="event-results-heading">
      <div className="border-ink mb-6 flex items-end justify-between gap-4 border-b-2 pb-4">
        <h2
          className="font-display text-ink text-4xl leading-none uppercase sm:text-5xl"
          id="event-results-heading"
        >
          Weekend lineup
        </h2>
        <p className="font-bold">{events.length} events</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {events.map((event, index) => (
          <article
            className="border-ink bg-paper group grid overflow-hidden border-2 shadow-[5px_5px_0_var(--color-ink)]"
            key={event.id}
          >
            <a href={`/events/${event.id}/`}>
              <img
                alt={event.imageAlt}
                className="aspect-[3/2] h-full w-full object-cover"
                height="800"
                loading={index < 2 ? "eager" : "lazy"}
                src={event.imageSrc}
                width="1200"
              />
            </a>
            <div className="grid gap-4 p-5">
              <div className="flex justify-between text-xs font-extrabold uppercase">
                <span>{event.categoryLabel}</span>
                <span>{formatPrice(event.price)}</span>
              </div>
              <div>
                <p className="text-blue text-sm font-bold">
                  {formatEventDate(event.start)} /{" "}
                  {formatEventTime(event.start, event.end)}
                </p>
                <h3 className="font-display mt-1 text-3xl uppercase">
                  <a href={`/events/${event.id}/`}>{event.title}</a>
                </h3>
                <p className="mt-2 text-sm">
                  {event.venueName} / {event.neighborhood}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
```

This is an intentionally static first version of the island. It proves serialization and hydration before filter state is added.

## Pass summaries from Astro

Update `src/pages/events/index.astro`:

```diff
-import EventCard from '../../components/events/EventCard.astro';
+import { EventExplorer } from '../../components/events/EventExplorer';
 import BaseLayout from '../../layouts/BaseLayout.astro';
-import { getEventsWithVenues } from '../../lib/content';
+import { getEventsWithVenues, toEventSummary } from '../../lib/content';

-const events = await getEventsWithVenues();
+const events = (await getEventsWithVenues()).map(toEventSummary);
```

Replace the static directory section with:

```astro
<div class="page-shell py-10 sm:py-14">
  <EventExplorer client:load events={events} />
</div>
```

The page still queries content at build time. React receives only `EventSummary[]`.

## Reject the same weekday in another week

Now that the event directory maps every entry through `toEventSummary`, temporarily change Riverfront Sunset Sessions to another Friday:

```yaml
start: 2026-09-11T19:00:00-05:00
end: 2026-09-11T22:00:00-05:00
```

Run `pnpm build`. The event directory now executes `toEventSummary`, so the build should throw `InvalidEventDayError` for `2026-09-11`. This proves the helper validates the exact weekend instead of accepting every Friday.

Restore `start` to `2026-09-04T19:00:00-05:00` and `end` to `2026-09-04T22:00:00-05:00` before continuing. The runnable checkpoint below must use the restored dates and finish with a passing build.

## Runnable checkpoint

Run:

```sh
pnpm check
pnpm build
pnpm preview
```

With the September 4 date restored, the build should pass. Visit `/events/`. All eight events should render after the Astro-to-React migration, every card link should work, and the browser console should show no prop serialization error.
