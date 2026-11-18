---
slug: sync-filters-with-url
title: Synchronize Filters with the URL
moduleSlug: add-event-filtering
moduleTitle: "Add Event Filtering with React"
moduleOrder: 6
lessonOrder: 5
published: true
duration: "15 minutes"
summary: Parse and serialize filter query parameters, preserve unrelated parameters, and synchronize React state with browser history.
resources:
  - https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
  - https://developer.mozilla.org/en-US/docs/Web/API/Window/popstate_event
  - https://developer.mozilla.org/en-US/docs/Web/API/History/pushState
---

# Synchronize Filters with the URL

## Outcome

You will make event filters shareable and history-aware. The URL functions stay pure, while the React component owns the browser effects for initial hydration, updates, and `popstate`.

## Parse only known values

Update the import in `src/lib/event-filters.ts` so runtime validation can use the shared arrays:

```ts
import {
  EVENT_CATEGORIES,
  EVENT_DAYS,
  type EventCategory,
  type EventDay,
  type EventSummary,
} from "./events";
```

Add the parser:

```ts
export function filtersFromSearchParams(params: URLSearchParams): EventFilters {
  const day = params.get("day");
  const category = params.get("category");

  return {
    query: params.get("q") ?? "",
    day: isEventDay(day) ? day : "all",
    category: isEventCategory(category) ? category : "all",
    freeOnly: params.get("free") === "true",
    accessibleOnly: params.get("accessible") === "true",
  };
}

function isEventDay(value: string | null): value is EventDay {
  return EVENT_DAYS.some((day) => day === value);
}

function isEventCategory(value: string | null): value is EventCategory {
  return EVENT_CATEGORIES.some((category) => category === value);
}
```

Query parameters are untrusted strings. Unknown days and categories fall back to `all`. Boolean filters turn on only for the exact value `true`.

## Serialize active filters

Add the reverse conversion:

```ts
export function filtersToSearchParams(
  filters: EventFilters,
  base = new URLSearchParams()
) {
  const params = new URLSearchParams(base);

  for (const key of ["q", "day", "category", "free", "accessible"]) {
    params.delete(key);
  }

  if (filters.query.trim()) params.set("q", filters.query.trim());
  if (filters.day !== "all") params.set("day", filters.day);
  if (filters.category !== "all") params.set("category", filters.category);
  if (filters.freeOnly) params.set("free", "true");
  if (filters.accessibleOnly) params.set("accessible", "true");

  return params;
}
```

The function starts from a copy of `base`. It removes only keys owned by the explorer, then writes non-default filters. A URL such as `?ref=newsletter&category=music` keeps `ref=newsletter` through every filter change.

Omitting defaults produces shorter URLs and gives Reset filters a natural result. The event path with no unrelated parameters returns to `/events/`.

## Read browser history in React

Update the React import:

```diff
-import { useDeferredValue, useState } from 'react';
+import { useDeferredValue, useEffect, useRef, useState } from 'react';
```

Import the URL helpers and filter types from `event-filters.ts`:

```ts
import {
  DEFAULT_FILTERS,
  filterEvents,
  filtersFromSearchParams,
  filtersToSearchParams,
  type EventFilters,
} from "../../lib/event-filters";
```

Replace the initial state block with:

```tsx
const [filters, setFilters] = useState(DEFAULT_FILTERS);
const filtersRef = useRef(DEFAULT_FILTERS);
const deferredQuery = useDeferredValue(filters.query);
const visibleEvents = filterEvents(events, {
  ...filters,
  query: deferredQuery,
});

useEffect(() => {
  const syncFromUrl = () => {
    const next = filtersFromSearchParams(new URLSearchParams(location.search));
    filtersRef.current = next;
    setFilters(next);
  };

  syncFromUrl();
  window.addEventListener("popstate", syncFromUrl);
  return () => window.removeEventListener("popstate", syncFromUrl);
}, []);
```

Browser globals stay inside `useEffect`, so server rendering does not try to read `location`. Calling `syncFromUrl()` on mount hydrates a shared URL. The event listener applies the same parser when Back or Forward changes the active history entry.

`filtersRef` keeps the latest complete filter object available to event handlers. State updates and history changes can occur close together, and every partial change must merge into the newest values.

## Write updates to history

Replace `updateFilters`:

```tsx
function updateFilters(
  changes: Partial<EventFilters>,
  historyMode: "push" | "replace" = "push"
) {
  const next = { ...filtersRef.current, ...changes };
  filtersRef.current = next;
  const params = filtersToSearchParams(
    next,
    new URLSearchParams(location.search)
  );
  const nextUrl = `${location.pathname}${params.size ? `?${params}` : ""}${location.hash}`;

  window.history[historyMode === "push" ? "pushState" : "replaceState"](
    {},
    "",
    nextUrl
  );
  setFilters(next);
}
```

Change the search input to replace history while the user types:

```tsx
<input
  onChange={(event) => updateFilters({ query: event.target.value }, "replace")}
  placeholder="Search for sunset"
  type="search"
  value={filters.query}
/>
```

Replace the local-only reset from the previous lesson so clearing filters also updates history:

```tsx
function resetFilters() {
  updateFilters(DEFAULT_FILTERS);
}
```

Buttons, selects, checkboxes, and Reset filters keep the default `push` mode. Those discrete choices deserve history entries. Each search keystroke does not.

Appending `location.hash` keeps an existing fragment through both `pushState` and `replaceState`. Query serialization owns only the search parameters; changing a filter should not silently discard the page location identified by the fragment.

## Test URL round trips

Add these tests to `tests/unit/event-filters.test.ts`:

```ts
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

The complete test import above includes both URL helpers, `DEFAULT_FILTERS`, `filterEvents`, and the `EventFilters` type used by the component. Keep that import together rather than pasting only individual imported names.

## Runnable checkpoint

Run:

```sh
pnpm test
pnpm check
pnpm build
pnpm dev
```

Open `/events/?ref=course&category=food&q=market`. The controls should hydrate to Food and `market`, and only South Main Night Market should show. Change the day, use Back and Forward, and confirm the controls and cards follow history while `ref=course` remains in the URL.

For the focused fragment check, open `/events/?ref=course#event-results-heading`, type in the search field, and then reset the filters. The query string should change while `#event-results-heading` remains at the end of the URL after both the search input's `replaceState` update and the reset button's `pushState` update.
