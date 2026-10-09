---
slug: write-filtering-functions
title: Write the Filtering Functions
moduleSlug: add-event-filtering
moduleTitle: "Add Event Filtering with React"
moduleOrder: 6
lessonOrder: 3
published: true
duration: "13 minutes"
summary: Model filter state as plain data, implement combined event filtering, and prove the rules with Vitest.
resources:
  - https://vitest.dev/guide/
---

# Write the Filtering Functions

## Outcome

You will implement event filtering as a pure function before connecting it to React. You will also add Vitest and cover the default and combined-filter behavior.

A pure filter accepts events and filter values, then returns a result without reading the DOM, URL, or React state. That makes the product rules fast to test and safe to reuse.

## Define filter state

Create `src/lib/event-filters.ts`:

```ts
import type { EventCategory, EventDay, EventSummary } from "./events";

export interface EventFilters {
  query: string;
  day: EventDay | "all";
  category: EventCategory | "all";
  freeOnly: boolean;
  accessibleOnly: boolean;
}

export const DEFAULT_FILTERS: EventFilters = {
  query: "",
  day: "all",
  category: "all",
  freeOnly: false,
  accessibleOnly: false,
};
```

`'all'` is an explicit UI state, not a category or day. Booleans fit the two independent restrictions. Keeping this shape flat makes partial updates straightforward in React.

## Combine filter rules

Add the pure function:

```ts
export function filterEvents(events: EventSummary[], filters: EventFilters) {
  const query = filters.query.trim().toLocaleLowerCase();

  return events.filter((event) => {
    const searchableText = [
      event.title,
      event.description,
      event.venueName,
      event.neighborhood,
      event.categoryLabel,
    ]
      .join(" ")
      .toLocaleLowerCase();

    return (
      (!query || searchableText.includes(query)) &&
      (filters.day === "all" || event.day === filters.day) &&
      (filters.category === "all" || event.category === filters.category) &&
      (!filters.freeOnly || event.price === 0) &&
      (!filters.accessibleOnly || event.accessibility.length > 0)
    );
  });
}
```

Every active rule must pass because the conditions use `&&`. A free, accessible Friday music event matches only when it also satisfies the query and category selections.

The search text includes fields a visitor can recognize on a card. It does not search IDs, image paths, or raw timestamps. Trimming the query makes whitespace behave like no search.

## Add Vitest

Install the test runner used by the reference app:

```sh
pnpm add -D vitest@^4.1.11
```

Add this script to `package.json`:

```diff
 "scripts": {
+  "test": "vitest run",
   "dev": "astro dev",
```

Create `vitest.config.ts`:

```ts
/// <reference types="vitest/config" />

import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    include: ["tests/unit/**/*.test.{ts,tsx}"],
  },
});
```

Using Astro's Vite config keeps path handling and TypeScript behavior aligned with the app. These tests are pure and need no browser environment.

## Test the filter rules

Create `tests/unit/event-filters.test.ts`. Define two `EventSummary` fixtures, one free and accessible Friday music event and one paid Saturday market event. Then add:

```ts
import { describe, expect, it } from "vitest";

import { DEFAULT_FILTERS, filterEvents } from "../../src/lib/event-filters";
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
```

The combined test matters more than five isolated happy paths. It proves active filters narrow one shared result rather than replacing one another.

## Runnable checkpoint

Run:

```sh
pnpm test
pnpm check
pnpm build
```

Vitest should report three passing filter tests. The event directory should still render eight events because the React component does not consume `filterEvents` until the next lesson.
