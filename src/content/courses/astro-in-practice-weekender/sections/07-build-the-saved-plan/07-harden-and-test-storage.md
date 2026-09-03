---
slug: harden-and-test-storage
title: Harden and Test Browser Storage
moduleSlug: build-the-saved-plan
moduleTitle: "Build the Saved Weekend Plan"
moduleOrder: 7
lessonOrder: 7
published: true
duration: "17 minutes"
summary: Add a memory fallback for denied browser storage and test malformed data, versions, toggles, clearing, and denial.
resources:
  - https://developer.mozilla.org/en-US/docs/Web/API/DOMException
  - https://vitest.dev/guide/
---

# Harden and Test Browser Storage

## Outcome

You will finish the saved-event storage layer so denied reads or writes do not break controls. You will also add unit tests for empty data, malformed data, unknown versions, duplicate prevention, clearing, and the memory fallback.

Private browsing policies, embedded contexts, and browser privacy settings can expose `localStorage` while throwing on access. Saving should remain usable for the current page session even when persistence is unavailable.

## Replace the storage implementation

Replace `src/lib/saved-events.ts` with the hardened version from the reference app:

```ts
const STORAGE_KEY = "weekender:saved-events";
const STORAGE_VERSION = 1;
const unavailableStorages = new WeakSet<Storage>();
let fallbackEventIds: string[] = [];

interface SavedEventsEnvelope {
  version: typeof STORAGE_VERSION;
  eventIds: string[];
}

export function getBrowserStorage(): Storage | null {
  if (typeof window === "undefined") return null;

  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readSavedEvents(storage: Storage | null) {
  if (!storage || unavailableStorages.has(storage)) {
    return [...fallbackEventIds];
  }

  let value: string | null;

  try {
    value = storage.getItem(STORAGE_KEY);
  } catch {
    unavailableStorages.add(storage);
    return [...fallbackEventIds];
  }

  if (!value) {
    fallbackEventIds = [];
    return [];
  }

  try {
    const parsed: unknown = JSON.parse(value);

    if (!isSavedEventsEnvelope(parsed)) {
      fallbackEventIds = [];
      return [];
    }

    fallbackEventIds = [...new Set(parsed.eventIds)];
    return [...fallbackEventIds];
  } catch {
    fallbackEventIds = [];
    return [];
  }
}

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

export function replaceSavedEvents(
  storage: Storage | null,
  eventIds: readonly string[]
) {
  fallbackEventIds = [...new Set(eventIds)];
  const envelope: SavedEventsEnvelope = {
    version: STORAGE_VERSION,
    eventIds: fallbackEventIds,
  };

  if (!storage || unavailableStorages.has(storage)) return;

  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(envelope));
  } catch {
    unavailableStorages.add(storage);
  }
}

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

The module keeps a copy in memory after every valid read or replacement. A denied `Storage` object enters a `WeakSet`, so later calls do not repeat an operation known to throw. The weak collection does not keep discarded storage objects alive.

Returning copies prevents components from mutating the module's fallback array by accident.

## Test without a real browser

Create `tests/unit/saved-events.test.ts`:

```ts
import { beforeEach, describe, expect, it } from "vitest";

import {
  clearSavedEvents,
  readSavedEvents,
  toggleSavedEvent,
} from "../../src/lib/saved-events";

const KEY = "weekender:saved-events";

class MemoryStorage implements Storage {
  private values = new Map<string, string>();

  get length() {
    return this.values.size;
  }

  clear() {
    this.values.clear();
  }

  getItem(key: string) {
    return this.values.get(key) ?? null;
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null;
  }

  removeItem(key: string) {
    this.values.delete(key);
  }

  setItem(key: string, value: string) {
    this.values.set(key, value);
  }
}

beforeEach(() => {
  clearSavedEvents(null);
});

describe("saved events storage", () => {
  it("returns an empty list for empty, malformed, or invalid data", () => {
    const storage = new MemoryStorage();
    expect(readSavedEvents(storage)).toEqual([]);

    for (const value of [
      "{not json",
      JSON.stringify({ version: 1, eventIds: [42] }),
      JSON.stringify({ version: 1, eventIds: "riverfront" }),
    ]) {
      storage.setItem(KEY, value);
      expect(readSavedEvents(storage)).toEqual([]);
    }
  });

  it("ignores envelopes from unknown versions", () => {
    const storage = new MemoryStorage();
    storage.setItem(
      KEY,
      JSON.stringify({ version: 2, eventIds: ["riverfront"] })
    );

    expect(readSavedEvents(storage)).toEqual([]);
  });

  it("adds and removes IDs without duplicates", () => {
    const storage = new MemoryStorage();
    expect(toggleSavedEvent(storage, "riverfront")).toEqual(["riverfront"]);
    expect(toggleSavedEvent(storage, "makers")).toEqual([
      "riverfront",
      "makers",
    ]);
    expect(toggleSavedEvent(storage, "riverfront")).toEqual(["makers"]);
  });

  it("clears saved events", () => {
    const storage = new MemoryStorage();
    toggleSavedEvent(storage, "riverfront");
    clearSavedEvents(storage);

    expect(readSavedEvents(storage)).toEqual([]);
  });

  it("falls back to session memory when storage access is denied", () => {
    const deniedStorage = {
      getItem() {
        throw new DOMException("Access denied", "SecurityError");
      },
      setItem() {
        throw new DOMException("Access denied", "SecurityError");
      },
    } as unknown as Storage;

    expect(toggleSavedEvent(deniedStorage, "riverfront")).toEqual([
      "riverfront",
    ]);
    expect(toggleSavedEvent(deniedStorage, "riverfront")).toEqual([]);
  });
});
```

The in-memory `Storage` implements the browser interface without jsdom. Section 9 will switch Vitest to jsdom when component tests need a document.

The denial test proves more than error suppression. The second toggle sees the first toggle's fallback state, so controls remain coherent for the life of the loaded page.

## Verify stale-ID pruning

Use the browser console to store a valid current ID and a missing ID:

```js
localStorage.setItem(
  "weekender:saved-events",
  JSON.stringify({
    version: 1,
    eventIds: ["missing-event", "riverfront-sunset-sessions"],
  })
);
location.assign("/saved/");
```

The saved page should show Riverfront Sunset Sessions. Read the storage key again. `missing-event` should be gone because `SavedPlan` passed the current event IDs to the hook.

## Runnable checkpoint

Run the complete section checks:

```sh
pnpm test
pnpm check
pnpm build
pnpm dev
```

Vitest should report five filter tests and five storage tests. Including the two `EventExplorer` tests and one `SavedPlan` test from section 9, that is 13 unit tests total. In the browser, verify save, remove, header count, chronological grouping, clear, focus restoration, stale-ID pruning, and same-page updates. Section 9 adds an automated two-page shared-context check for cross-tab updates. Denying `localStorage` must not throw, and save controls must still toggle for the current loaded page.
