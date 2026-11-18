---
slug: empty-states-and-filter-tests
title: Handle Empty States and Test Filters
moduleSlug: add-event-filtering
moduleTitle: "Add Event Filtering with React"
moduleOrder: 6
lessonOrder: 6
published: true
duration: "12 minutes"
summary: Add accessible zero-result recovery, complete the clear-filter flow, and finish pure tests for filtering and URL defaults.
resources:
  - https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-live
  - https://vitest.dev/api/expect.html
---

# Handle Empty States and Test Filters

## Outcome

You will replace a blank zero-result grid with a useful empty state, move focus after recovery, and finish the pure function tests for filter behavior and URL defaults.

The final section 6 explorer supports combined query, category, day, price, and accessibility filters. It also supports shared URLs, browser history, unrelated query parameters, and two clear-filter actions. It still has no saved-event behavior.

## Add a focused recovery action

In `EventExplorer.tsx`, keep the existing `resetFilters` function and add:

```tsx
function resetFiltersAndFocusResults() {
  resetFilters();
  requestAnimationFrame(() => {
    document.querySelector<HTMLElement>("#event-results-heading")?.focus();
  });
}
```

The sidebar's Reset filters button calls `resetFilters`. The empty state uses the second function because the current result context disappears after the reset.

`requestAnimationFrame()` waits until React has rendered the restored results before moving focus. The optional chain avoids throwing if the heading is unavailable.

## Make the result heading focusable

Add `tabIndex={-1}` to the existing result heading:

```tsx
<h2
  className="font-display text-ink text-4xl leading-none uppercase sm:text-5xl"
  id="event-results-heading"
  tabIndex={-1}
>
  Weekend lineup
</h2>
```

A negative tab index allows programmatic focus without adding the heading to the normal Tab order. After recovery, keyboard and screen-reader users land at the updated result section instead of staying on a button that has been removed.

## Render cards or the empty state

Before the component's `return`, create the result content:

```tsx
const eventResults =
  visibleEvents.length > 0 ? (
    <div className="grid gap-5 xl:grid-cols-2">
      {visibleEvents.map((event, index) => (
        <article
          className="border-ink bg-paper group grid overflow-hidden border-2 shadow-[5px_5px_0_var(--color-ink)]"
          key={event.id}
        >
          <a
            className="focus-visible:ring-tomato relative block aspect-[3/2] overflow-hidden outline-none focus-visible:ring-4 focus-visible:ring-inset"
            href={`/events/${event.id}/`}
          >
            <img
              alt={event.imageAlt}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
              height="800"
              loading={index < 2 ? "eager" : "lazy"}
              src={event.imageSrc}
              width="1200"
            />
          </a>
          <div className="grid gap-4 p-5">
            <div className="flex flex-wrap justify-between gap-2 text-xs font-extrabold uppercase">
              <span className="bg-yellow border-ink border px-2 py-1">
                {event.categoryLabel}
              </span>
              <span>{formatPrice(event.price)}</span>
            </div>
            <div>
              <p className="text-blue mb-1 text-sm font-bold">
                {formatEventDate(event.start)} /{" "}
                {formatEventTime(event.start, event.end)}
              </p>
              <h3 className="font-display text-3xl leading-tight uppercase">
                <a href={`/events/${event.id}/`}>{event.title}</a>
              </h3>
              <p className="mt-2 text-sm leading-relaxed">
                {event.venueName} / {event.neighborhood}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  ) : (
    <div className="border-ink bg-yellow grid min-h-72 place-items-center border-2 p-8 text-center shadow-[7px_7px_0_var(--color-ink)]">
      <div className="max-w-md">
        <p className="font-display text-tomato text-6xl leading-none">0</p>
        <h3 className="font-display mt-3 text-3xl uppercase">
          No events match those filters
        </h3>
        <p className="mt-2 leading-relaxed">
          Try another day or clear the filters to see the full weekend.
        </p>
        <button
          className="bg-blue text-paper border-ink focus-visible:ring-tomato mt-5 min-h-11 border-2 px-5 py-2 font-extrabold uppercase outline-none focus-visible:ring-4"
          onClick={resetFiltersAndFocusResults}
          type="button"
        >
          Show every event
        </button>
      </div>
    </div>
  );
```

Then replace the unconditional result grid inside the returned JSX with `{eventResults}`. The ternary is now a complete variable initializer, so its final semicolon belongs after the expression rather than inside a JSX expression container.

The empty state names the result, explains a recovery path, and provides the recovery action in place. The existing `aria-live="polite"` count announces `0 events` without making the entire card grid a live region.

There is deliberately no Save event button in the card. Section 7 introduces persistence once filtering works independently.

## Complete the pure tests

Replace `tests/unit/event-filters.test.ts` with this complete file. It contains the five test cases in the reference suite: three filter tests and two URL tests.

```ts
import { describe, expect, it } from "vitest";

import {
  DEFAULT_FILTERS,
  filterEvents,
  filtersFromSearchParams,
  filtersToSearchParams,
} from "../../src/lib/event-filters";
import type { EventSummary } from "../../src/lib/events";

const events: EventSummary[] = [
  {
    id: "riverfront-sunset-sessions",
    title: "Riverfront Sunset Sessions",
    description: "A free night of local music beside the Mississippi River.",
    start: "2026-09-05T00:00:00.000Z",
    end: "2026-09-05T03:00:00.000Z",
    day: "friday",
    category: "music",
    categoryLabel: "Live music",
    price: 0,
    venueName: "Tom Lee Park",
    neighborhood: "Downtown",
    imageSrc: "/riverfront.svg",
    imageAlt: "An illustrated sunset over the river.",
    accessibility: ["Wheelchair accessible"],
  },
  {
    id: "makers-morning",
    title: "Cooper-Young Makers Morning",
    description: "Shop ceramics, prints, and vintage finds.",
    start: "2026-09-05T15:00:00.000Z",
    end: "2026-09-05T19:00:00.000Z",
    day: "saturday",
    category: "market",
    categoryLabel: "Markets",
    price: 5,
    venueName: "Cooper-Young Community Yard",
    neighborhood: "Cooper-Young",
    imageSrc: "/makers.svg",
    imageAlt: "An illustrated collection of handmade objects.",
    accessibility: [],
  },
];

describe("filterEvents", () => {
  it("returns all events for the default filters", () => {
    expect(filterEvents(events, DEFAULT_FILTERS)).toEqual(events);
  });

  it("combines query, day, category, price, and accessibility filters", () => {
    expect(
      filterEvents(events, {
        query: "river",
        day: "friday",
        category: "music",
        freeOnly: true,
        accessibleOnly: true,
      })
    ).toEqual([events[0]]);
  });

  it("searches venue and neighborhood names case-insensitively", () => {
    expect(
      filterEvents(events, { ...DEFAULT_FILTERS, query: "COOPER-YOUNG" })
    ).toEqual([events[1]]);
  });
});

describe("filter query parameters", () => {
  it("parses known values and ignores malformed values", () => {
    const params = new URLSearchParams(
      "q=music&day=friday&category=unknown&free=true&accessible=no"
    );

    expect(filtersFromSearchParams(params)).toEqual({
      query: "music",
      day: "friday",
      category: "all",
      freeOnly: true,
      accessibleOnly: false,
    });
  });

  it("serializes active filters and preserves unrelated parameters", () => {
    const params = filtersToSearchParams(
      { ...DEFAULT_FILTERS, category: "market", freeOnly: true },
      new URLSearchParams("ref=course")
    );

    expect(params.toString()).toBe("ref=course&category=market&free=true");
  });
});
```

The combined filter test protects the main narrowing behavior. The parser test rejects unknown values, and the serializer test proves that active filters preserve an unrelated parameter.

Pure tests do not need to render React or mock browser history. These five tests cover the rules that are easiest to break: combination, normalization, validation, and query-parameter serialization.

Focus transfer and `popstate` restoration require a real browser. Verify them manually in this section. Section 9 adds browser E2E coverage for both behaviors so the shipped app does not rely on manual coverage alone.

## Run the full interaction pass

Check these cases in the browser:

1. Search `sunset`, choose Live music, Friday, Free events only, and Accessibility details listed. One event should remain.
2. Change Friday to Sunday while all other filters remain active. The empty state should appear.
3. Click Show every event. Eight cards should return, the result heading should receive focus, and explorer-owned query parameters should clear.
4. Start at `?ref=course`, filter, reset, and confirm `ref=course` remains.
5. Use Back and Forward across day and category changes. Controls, count, and cards should restore together.

## Runnable checkpoint

Run the final section 6 checks:

```sh
pnpm test
pnpm check
pnpm build
pnpm preview
```

Vitest should report five passing pure tests. `/events/?ref=course&category=food&q=market` should round-trip through filter changes without losing `ref=course`, browser history should restore filters during the manual pass, Reset filters and Show every event should restore all eight cards, and no section 6 file should import saved-event state. Section 9 will automate the `popstate` and focus checks.
