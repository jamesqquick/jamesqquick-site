---
slug: domain-types-and-formatting
title: Create Domain Types and Formatters
moduleSlug: model-content
moduleTitle: "Model Events and Venues"
moduleOrder: 4
lessonOrder: 5
published: true
duration: "11 minutes"
summary: Derive event category and day types from runtime constants and centralize date, time, price, and label formatting.
resources:
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat
---

# Create Domain Types and Formatters

## Outcome

You will expand `src/lib/events.ts` into the shared domain module used by Astro pages and the React explorer. It will own stable category and day values, display labels, and formatting rules.

Content entries should store values that can be sorted and compared. Components should not each invent their own conversion from those values to text. Central formatters keep the home page, detail pages, and future React island consistent.

## Derive types from runtime values

Keep `EVENT_CATEGORIES` and add the weekend days:

```ts
export const EVENT_CATEGORIES = [
  "music",
  "food",
  "family",
  "market",
  "outdoors",
] as const;

export const EVENT_DAYS = ["friday", "saturday", "sunday"] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];
export type EventDay = (typeof EVENT_DAYS)[number];
```

The arrays exist at runtime for Zod, route generation, and filter controls. The indexed access types produce unions such as `'friday' | 'saturday' | 'sunday'` without maintaining a second list.

## Add display labels

Add typed records below the types:

```ts
export const CATEGORY_LABELS: Record<EventCategory, string> = {
  music: "Live music",
  food: "Food & drink",
  family: "Family",
  market: "Markets",
  outdoors: "Outdoors",
};

export const DAY_LABELS: Record<EventDay, string> = {
  friday: "Friday",
  saturday: "Saturday",
  sunday: "Sunday",
};
```

The record types require one label for every supported key and reject unknown keys. Routes use stable lowercase values, while interfaces use readable labels.

## Create date and time formatters

Create formatter instances once at module scope:

```ts
const DATE_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Chicago",
  weekday: "long",
  month: "short",
  day: "numeric",
});

const TIME_FORMATTER = new Intl.DateTimeFormat("en-US", {
  timeZone: "America/Chicago",
  hour: "numeric",
  minute: "2-digit",
});

export function formatEventDate(start: string | Date) {
  return DATE_FORMATTER.format(new Date(start));
}

export function formatEventTime(start: string | Date, end?: string | Date) {
  const startLabel = TIME_FORMATTER.format(new Date(start));

  if (!end) {
    return startLabel;
  }

  return `${startLabel}-${TIME_FORMATTER.format(new Date(end))}`;
}
```

The explicit `America/Chicago` time zone makes a Memphis event render the same label during a local build, CI build, and client hydration. Without it, the host machine's time zone could shift a late event to another day.

The functions accept `Date` for content entries and strings for the serializable event summaries introduced in section 6. One formatter contract can serve both sides of the Astro island boundary.

## Format prices from numbers

Add the price helper:

```ts
export function formatPrice(price: number) {
  if (price === 0) {
    return "Free";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}
```

Zero receives the product-specific label `Free`. Paid events use `Intl.NumberFormat` instead of manual dollar-sign concatenation. The schema already rejects negative numbers, so this function can focus on display.

## Leave the current card alone for one more lesson

`EventCard.astro` still expects `TemporaryEvent`, whose labels are already formatted. Do not mix the new formatters into that temporary interface. The next lesson changes the query source and component props together, which keeps every intermediate build valid.

## Runnable checkpoint

Run:

```sh
pnpm check
pnpm build
```

Both commands should pass. `src/lib/events.ts` should export category and day constants, their derived types, both label records, and all three formatter functions. The visible app should still use temporary data.
