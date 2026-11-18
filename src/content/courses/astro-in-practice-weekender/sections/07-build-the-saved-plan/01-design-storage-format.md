---
slug: design-storage-format
title: Design the Saved Event Storage Format
moduleSlug: build-the-saved-plan
moduleTitle: "Build the Saved Weekend Plan"
moduleOrder: 7
lessonOrder: 1
published: true
duration: "12 minutes"
summary: Store saved event IDs in a versioned localStorage envelope with runtime validation and focused update functions.
resources:
  - https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
  - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse
---

# Design the Saved Event Storage Format

## Outcome

You will create the browser storage layer for saved events. The stored value will contain only event IDs, wrapped in a versioned object that can be validated before the app trusts it.

The event collection remains the source of truth for titles, times, venues, and prices. Copying complete events into `localStorage` would create a second content database that could become stale. IDs are enough to reconnect a saved choice to current build data.

## Choose a versioned envelope

Create `src/lib/saved-events.ts` with the storage key, version, and envelope type:

```ts
const STORAGE_KEY = "weekender:saved-events";
const STORAGE_VERSION = 1;

interface SavedEventsEnvelope {
  version: typeof STORAGE_VERSION;
  eventIds: string[];
}
```

The key is namespaced so it is unlikely to collide with another feature. The version is data, not decoration. If a later release changes the shape, the reader can reject or migrate older values instead of guessing.

Do not expose the envelope to components. Components care about `string[]`; the storage module owns serialization.

## Validate untrusted browser data

Add a type guard at the bottom of the file:

```ts
function isSavedEventsEnvelope(value: unknown): value is SavedEventsEnvelope {
  if (!value || typeof value !== "object") {
    return false;
  }

  const envelope = value as Partial<SavedEventsEnvelope>;

  return (
    envelope.version === STORAGE_VERSION &&
    Array.isArray(envelope.eventIds) &&
    envelope.eventIds.every((id) => typeof id === "string")
  );
}
```

TypeScript cannot validate the result of `JSON.parse()` at runtime. Parse into `unknown`, then prove the object has the expected version and an array containing only strings.

Rejecting an unknown version is safer than treating it as current data. A future lesson will test malformed JSON, wrong object shapes, and unknown versions directly.

## Read and replace the saved IDs

Add these functions above the type guard:

```ts
export function getBrowserStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

export function readSavedEvents(storage: Storage | null) {
  if (!storage) return [];

  const value = storage.getItem(STORAGE_KEY);
  if (!value) return [];

  try {
    const parsed: unknown = JSON.parse(value);
    if (!isSavedEventsEnvelope(parsed)) return [];
    return [...new Set(parsed.eventIds)];
  } catch {
    return [];
  }
}

export function replaceSavedEvents(
  storage: Storage | null,
  eventIds: readonly string[]
) {
  if (!storage) return;

  const envelope: SavedEventsEnvelope = {
    version: STORAGE_VERSION,
    eventIds: [...new Set(eventIds)],
  };

  storage.setItem(STORAGE_KEY, JSON.stringify(envelope));
}
```

Passing `Storage | null` keeps server rendering explicit. Astro can render React components on the server, where `window` does not exist. `getBrowserStorage()` returns `null` there, and reads become an empty list.

`Set` removes accidental duplicates while preserving insertion order. That order is useful for storage, but the saved-plan page will sort current event records by time before displaying them.

## Add narrow update functions

Finish the public API:

```ts
export function toggleSavedEvent(storage: Storage | null, eventId: string) {
  const current = readSavedEvents(storage);
  const next = current.includes(eventId)
    ? current.filter((id) => id !== eventId)
    : [...current, eventId];

  replaceSavedEvents(storage, next);
  return next;
}

export function clearSavedEvents(storage: Storage | null) {
  replaceSavedEvents(storage, []);
}
```

Returning the next array lets React update immediately after a write. It does not need to parse storage a second time.

This first implementation handles absent storage and malformed serialized data. It still assumes that an available `Storage` object permits reads and writes. Lesson 7.7 will add a memory fallback for browsers that expose `localStorage` but deny access.

## Runnable checkpoint

Run:

```sh
pnpm check
pnpm test
pnpm build
```

All existing filter tests and the production build should pass. No page uses the new library yet, so the visible site should remain unchanged. The checkpoint is exact for this stage: `src/lib/saved-events.ts` compiles, imports no React code, and never reads `window` during module evaluation.
