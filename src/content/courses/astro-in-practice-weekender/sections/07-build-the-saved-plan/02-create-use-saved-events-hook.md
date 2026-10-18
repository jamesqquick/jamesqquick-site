---
slug: create-use-saved-events-hook
title: Create the useSavedEvents Hook
moduleSlug: build-the-saved-plan
moduleTitle: "Build the Saved Weekend Plan"
moduleOrder: 7
lessonOrder: 2
published: true
duration: "15 minutes"
summary: Connect saved-event storage to React with stale-ID pruning and same-page and cross-tab synchronization.
resources:
  - https://react.dev/reference/react/useEffect
  - https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event
  - https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent
---

# Create the useSavedEvents Hook

## Outcome

You will create one React hook that reads saved IDs after hydration, updates storage, removes stale IDs, and keeps every saved-event island synchronized.

The site will have several independent React roots: event buttons, the header count, the event explorer, and the saved plan. React context cannot cross those roots. Browser events provide a small shared channel without turning the whole Astro site into one React application.

## Create the hook

Create `src/lib/use-saved-events.ts`:

```ts
import { useEffect, useState } from "react";

import {
  clearSavedEvents,
  getBrowserStorage,
  readSavedEvents,
  replaceSavedEvents,
  toggleSavedEvent,
} from "./saved-events";

const SAVED_EVENTS_CHANGED = "weekender:saved-events-changed";

export function useSavedEvents(validEventIds?: readonly string[]) {
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const validIdsKey = validEventIds?.join("\0") ?? null;

  useEffect(() => {
    const setValidSavedIds = (eventIds: string[]) => {
      const next = filterValidEventIds(eventIds, validIdsKey);
      setSavedIds(next);

      if (next.length !== eventIds.length) {
        replaceSavedEvents(getBrowserStorage(), next);
      }
    };

    const syncFromStorage = () => {
      setValidSavedIds(readSavedEvents(getBrowserStorage()));
    };

    const syncFromChange = (event: Event) => {
      const detail = (event as CustomEvent<unknown>).detail;

      if (isStringArray(detail)) {
        setValidSavedIds(detail);
        return;
      }

      syncFromStorage();
    };

    syncFromStorage();
    window.addEventListener("storage", syncFromStorage);
    window.addEventListener(SAVED_EVENTS_CHANGED, syncFromChange);

    return () => {
      window.removeEventListener("storage", syncFromStorage);
      window.removeEventListener(SAVED_EVENTS_CHANGED, syncFromChange);
    };
  }, [validIdsKey]);

  function toggle(eventId: string) {
    const next = filterValidEventIds(
      toggleSavedEvent(getBrowserStorage(), eventId),
      validIdsKey
    );
    setSavedIds(next);
    window.dispatchEvent(
      new CustomEvent(SAVED_EVENTS_CHANGED, { detail: next })
    );
  }

  function clear() {
    clearSavedEvents(getBrowserStorage());
    setSavedIds([]);
    window.dispatchEvent(new CustomEvent(SAVED_EVENTS_CHANGED, { detail: [] }));
  }

  return { savedIds, toggle, clear };
}

function filterValidEventIds(eventIds: string[], validIdsKey: string | null) {
  if (validIdsKey === null) return eventIds;

  const validIds = new Set(validIdsKey ? validIdsKey.split("\0") : []);
  return eventIds.filter((eventId) => validIds.has(eventId));
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}
```

## Read after hydration

The initial state is `[]` for both server rendering and the first client render. `useEffect()` reads browser storage after React hydrates. That stable initial value prevents server and client HTML from disagreeing.

`validEventIds` is optional because an event-detail button knows only its own ID. Components with the complete event list pass all current IDs. Those consumers can remove IDs for events that were deleted or unpublished after a visitor saved them.

The joined `validIdsKey` gives the effect a primitive dependency. The array passed by a component may be recreated on every render. Depending on the array itself would restart listeners unnecessarily.

## Synchronize two browser cases

The native `storage` event fires in other documents that share the same storage area. It does not fire in the same page that performed the write.

The custom `weekender:saved-events-changed` event handles the same page. A save button dispatches the next IDs, and the header count or another island receives them immediately. The custom event detail is validated because any script on the page can dispatch an event with that name.

Together, these listeners cover separate React roots in one page and the same site open in another tab.

## Prune stale IDs at the boundary

`setValidSavedIds()` filters every source of data: initial storage, cross-tab changes, and custom events. If filtering removes anything, it writes the clean list back.

This is better than hiding a missing event only in the saved-plan component. Pruning repairs storage once, so the header count and every future read agree.

## Runnable checkpoint

Run:

```sh
pnpm check
pnpm test
pnpm build
```

The hook should compile without changing the rendered site. Search `src/lib/use-saved-events.ts` and confirm every use of `window` or `localStorage` occurs inside an effect or a function called by the browser. No browser global should run while Astro imports the module for static generation.
