---
slug: build-event-explorer
title: Build the Event Explorer
moduleSlug: add-event-filtering
moduleTitle: "Add Event Filtering with React"
moduleOrder: 6
lessonOrder: 4
published: true
duration: "16 minutes"
summary: Add local React state, deferred search, filter controls, a live count, and combined client-side results to the event directory.
resources:
  - https://react.dev/reference/react/useDeferredValue
  - https://react.dev/reference/react/useState
---

# Build the Event Explorer

## Outcome

You will connect every filter to React state and render the matching event summaries. The URL and empty state remain unchanged until the next two lessons, so this checkpoint focuses on local interaction.

## Add state and deferred search

Update the imports at the top of `EventExplorer.tsx`:

```tsx
import { useDeferredValue, useState } from "react";

import {
  DEFAULT_FILTERS,
  filterEvents,
  type EventFilters,
} from "../../lib/event-filters";
import {
  CATEGORY_LABELS,
  DAY_LABELS,
  EVENT_CATEGORIES,
  EVENT_DAYS,
  formatEventDate,
  formatEventTime,
  formatPrice,
  type EventSummary,
} from "../../lib/events";
```

Inside `EventExplorer`, add the state before the return:

```tsx
const [filters, setFilters] = useState(DEFAULT_FILTERS);
const deferredQuery = useDeferredValue(filters.query);
const visibleEvents = filterEvents(events, {
  ...filters,
  query: deferredQuery,
});

function updateFilters(changes: Partial<EventFilters>) {
  setFilters((current) => ({ ...current, ...changes }));
}

function resetFilters() {
  setFilters(DEFAULT_FILTERS);
}
```

The input value updates immediately, while the event filtering can use `deferredQuery`. On this eight-item dataset the calculation is cheap, but the pattern keeps typing responsive if the cards or list grow.

Only the query is deferred. Day, category, price, and accessibility selections should update results immediately because each is one deliberate action.

## Create reusable filter controls

Add these small components below `EventExplorer`:

```tsx
interface FilterButtonProps {
  active: boolean;
  label: string;
  onClick: () => void;
}

function FilterButton({ active, label, onClick }: FilterButtonProps) {
  return (
    <button
      aria-pressed={active}
      className={`border-ink focus-visible:ring-tomato min-h-11 border-2 px-3 py-2 text-sm font-bold outline-none focus-visible:ring-4 ${
        active ? "bg-ink text-paper" : "bg-paper hover:bg-yellow"
      }`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

interface CheckFilterProps {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}

function CheckFilter({ checked, label, onChange }: CheckFilterProps) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-bold">
      <input
        checked={checked}
        className="accent-blue focus-visible:ring-tomato size-5 outline-none focus-visible:ring-4"
        onChange={(event) => onChange(event.target.checked)}
        type="checkbox"
      />
      {label}
    </label>
  );
}
```

`aria-pressed` exposes the selected day as button state. The checkbox labels wrap both input and text, which gives each option a larger click target.

## Add the filter panel

Wrap the existing results section in this two-column container and place the panel before it:

```tsx
<div className="grid gap-10 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start">
  <aside className="border-ink bg-cream lg:sticky lg:top-6 lg:border-2">
    <div className="bg-blue text-paper border-ink border-b-2 px-5 py-4">
      <p className="font-display text-2xl leading-none uppercase">
        Filter events
      </p>
    </div>

    <div className="grid gap-6 p-5">
      <label className="grid gap-2 text-sm font-bold" htmlFor="event-search">
        Search events
        <input
          className="border-ink bg-paper min-h-11 border-2 px-3 py-2 font-normal"
          id="event-search"
          onChange={(event) => updateFilters({ query: event.target.value })}
          placeholder="Search for sunset"
          type="search"
          value={filters.query}
        />
      </label>

      <fieldset className="grid gap-2">
        <legend className="mb-2 text-sm font-bold">Day</legend>
        <div className="grid grid-cols-2 gap-2">
          <FilterButton
            active={filters.day === "all"}
            label="All days"
            onClick={() => updateFilters({ day: "all" })}
          />
          {EVENT_DAYS.map((day) => (
            <FilterButton
              active={filters.day === day}
              key={day}
              label={DAY_LABELS[day]}
              onClick={() => updateFilters({ day })}
            />
          ))}
        </div>
      </fieldset>

      <label className="grid gap-2 text-sm font-bold" htmlFor="category">
        Category
        <select
          className="border-ink bg-paper min-h-11 border-2 px-3 py-2 font-normal"
          id="category"
          onChange={(event) =>
            updateFilters({
              category: event.target.value as EventFilters["category"],
            })
          }
          value={filters.category}
        >
          <option value="all">All categories</option>
          {EVENT_CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {CATEGORY_LABELS[category]}
            </option>
          ))}
        </select>
      </label>

      <div className="grid gap-3">
        <CheckFilter
          checked={filters.freeOnly}
          label="Free events only"
          onChange={(freeOnly) => updateFilters({ freeOnly })}
        />
        <CheckFilter
          checked={filters.accessibleOnly}
          label="Accessibility details listed"
          onChange={(accessibleOnly) => updateFilters({ accessibleOnly })}
        />
      </div>

      <button
        className="justify-self-start font-bold underline"
        onClick={resetFilters}
        type="button"
      >
        Reset filters
      </button>
    </div>
  </aside>

  {/* Keep the existing results section here. */}
</div>
```

Change the result count and the existing card map from `events` to `visibleEvents`:

```tsx
<p aria-atomic="true" aria-live="polite" className="font-bold">
  {visibleEvents.length} {visibleEvents.length === 1 ? "event" : "events"}
</p>
```

The map edit is one identifier change. Keep the complete event article from lesson 6.2 inside it:

```diff
-{events.map((event, index) => (
+{visibleEvents.map((event, index) => (
   <article
```

The live region announces result-count changes without moving keyboard focus. The visible cards stay in chronological order because `filter()` preserves input order.

Do not add save buttons to the cards. This island is still limited to discovery.

## Runnable checkpoint

Run:

```sh
pnpm test
pnpm check
pnpm build
pnpm dev
```

On `/events/`, select Friday, Live music, Free events only, and Accessibility details listed, then search for `river`. Exactly Riverfront Sunset Sessions should remain. Click Reset filters and confirm all eight events return. The URL should not change yet.
