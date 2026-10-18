---
slug: build-saved-plan-page
title: Build the Saved Plan Page
moduleSlug: build-the-saved-plan
moduleTitle: "Build the Saved Weekend Plan"
moduleOrder: 7
lessonOrder: 5
published: true
duration: "18 minutes"
summary: Render saved events as a chronological Friday-to-Sunday plan with remove, clear, and empty-state controls.
resources:
  - https://docs.astro.build/en/guides/framework-components/
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
---

# Build the Saved Plan Page

## Outcome

You will create `/saved/` and a React plan component. Current event data will arrive from Astro, while the browser decides which records to show from saved IDs.

The plan will sort events chronologically, group them in Friday-to-Sunday order, remove individual events, clear the complete plan, and provide a useful empty state.

## Build the data boundary

Create `src/pages/saved.astro`:

```astro
---
import { SavedPlan } from '../components/events/SavedPlan';
import BaseLayout from '../layouts/BaseLayout.astro';
import { getEventsWithVenues, toEventSummary } from '../lib/content';

const events = (await getEventsWithVenues()).map(toEventSummary);
---

<BaseLayout
  title="My weekend plan"
  description="Your saved Memphis events, organized by day."
>
  <header class="bg-tomato text-paper border-ink border-b-2">
    <div
      class="page-shell grid gap-5 py-10 sm:py-14 md:grid-cols-[1fr_25rem] md:items-end"
    >
      <div>
        <p class="text-paper text-sm font-black tracking-[0.2em] uppercase">
          Saved events
        </p>
        <h1
          class="font-display mt-2 text-6xl leading-[0.88] uppercase sm:text-8xl"
        >
          Your weekend plan
        </h1>
      </div>
      <p class="text-lg leading-relaxed font-semibold md:text-right">
        Saved events stay in this browser. No account required.
      </p>
    </div>
  </header>
  <div class="page-shell py-12 sm:py-16">
    <SavedPlan client:load events={events} />
  </div>
</BaseLayout>
```

Astro resolves content references and serializes `EventSummary[]`. React receives plain strings, numbers, and arrays rather than collection entries or image metadata objects.

`client:load` is required because the meaningful page content depends on browser storage. Astro still emits the page shell, title, and introductory text as static HTML.

## Start the plan component

Create `src/components/events/SavedPlan.tsx` with imports, props, and data preparation:

```tsx
import {
  DAY_LABELS,
  EVENT_DAYS,
  formatEventTime,
  formatPrice,
  type EventSummary,
} from "../../lib/events";
import { useSavedEvents } from "../../lib/use-saved-events";

interface SavedPlanProps {
  events: EventSummary[];
}

export function SavedPlan({ events }: SavedPlanProps) {
  const { savedIds, toggle, clear } = useSavedEvents(
    events.map((event) => event.id)
  );
  const savedEvents = savedIds
    .map((id) => events.find((event) => event.id === id))
    .filter((event): event is EventSummary => Boolean(event))
    .sort(
      (first, second) => Date.parse(first.start) - Date.parse(second.start)
    );

  if (savedEvents.length === 0) {
    return (
      <section className="border-ink bg-yellow grid min-h-96 place-items-center border-2 p-8 text-center shadow-[8px_8px_0_var(--color-ink)]">
        <div className="max-w-lg">
          <h2 className="font-display text-4xl uppercase">
            Your weekend is wide open
          </h2>
          <p className="mx-auto mt-3 max-w-md leading-relaxed">
            Save a few events and they will show up here, organized by day. Your
            picks stay in this browser.
          </p>
          <a
            className="bg-blue text-paper border-ink focus-visible:ring-tomato mt-6 inline-flex min-h-11 items-center border-2 px-6 py-3 font-extrabold uppercase shadow-[4px_4px_0_var(--color-ink)] outline-none focus-visible:ring-4"
            href="/events/"
          >
            Browse the lineup
          </a>
        </div>
      </section>
    );
  }

  return null;
}
```

Mapping saved IDs back to current events prevents storage from becoming the content source. The type-predicate filter tells TypeScript that missing lookups have been removed. Sorting by parsed start time makes the plan chronological even though storage preserves save order.

## Add the populated plan

Replace the temporary `return null;` and the following function closing brace with the populated plan:

```diff
-  return null;
-}
+  return (
+    <section>
+      <div className="border-ink mb-8 flex flex-wrap items-end justify-between gap-4 border-b-2 pb-4">
+        <p className="text-lg font-bold">
+          {savedEvents.length} saved{' '}
+          {savedEvents.length === 1 ? 'event' : 'events'}
+        </p>
+        <button
+          className="focus-visible:ring-tomato min-h-11 font-bold underline decoration-2 underline-offset-4 outline-none focus-visible:ring-4"
+          onClick={clear}
+          type="button"
+        >
+          Clear my plan
+        </button>
+      </div>
+
+      <div className="grid gap-10">
+        {EVENT_DAYS.map((day) => {
+          const dayEvents = savedEvents.filter((event) => event.day === day);
+          if (dayEvents.length === 0) return null;
+
+          return (
+            <section aria-labelledby={`${day}-heading`} key={day}>
+              <div className="mb-4 flex items-center gap-4">
+                <h2
+                  className="font-display text-blue text-4xl uppercase"
+                  id={`${day}-heading`}
+                >
+                  {DAY_LABELS[day]}
+                </h2>
+                <span className="bg-tomato h-1 flex-1" />
+              </div>
+              <div className="grid gap-4">
+                {dayEvents.map((event) => (
+                  <article
+                    className="border-ink bg-paper grid gap-4 border-2 p-4 shadow-[4px_4px_0_var(--color-ink)] sm:grid-cols-[8rem_1fr_auto] sm:items-center"
+                    data-saved-event
+                    key={event.id}
+                  >
+                    <p className="font-display text-2xl uppercase">
+                      {formatEventTime(event.start)}
+                    </p>
+                    <div>
+                      <h3 className="font-display text-2xl uppercase">
+                        <a
+                          className="focus-visible:ring-tomato outline-none hover:underline focus-visible:ring-4"
+                          href={`/events/${event.id}/`}
+                        >
+                          {event.title}
+                        </a>
+                      </h3>
+                      <p className="text-sm">
+                        {event.venueName} / {formatPrice(event.price)}
+                      </p>
+                    </div>
+                    <button
+                      aria-label={`Remove ${event.title}`}
+                      className="border-ink hover:bg-tomato hover:text-paper focus-visible:ring-blue min-h-11 border-2 px-4 py-2 text-sm font-bold uppercase outline-none focus-visible:ring-4"
+                      onClick={() => toggle(event.id)}
+                      type="button"
+                    >
+                      Remove
+                    </button>
+                  </article>
+                ))}
+              </div>
+            </section>
+          );
+        })}
+      </div>
+    </section>
+  );
+}
```

`EVENT_DAYS` defines a stable Friday, Saturday, Sunday group order. Empty days return `null`, so a plan with Friday and Sunday events does not show an empty Saturday heading.

The clear action uses the hook rather than calling storage directly. That keeps the header badge and other islands synchronized through the same custom event.

## Runnable checkpoint

Run:

```sh
pnpm check
pnpm test
pnpm build
pnpm dev
```

Save events in a nonchronological order, including at least two different days. Open `/saved/`. Events must appear by start time under Friday, Saturday, and Sunday headings; empty days must be omitted. Remove one event, then click Clear my plan. The empty state must show `Your weekend is wide open`, the header count must become zero, and reload must keep the plan empty.
