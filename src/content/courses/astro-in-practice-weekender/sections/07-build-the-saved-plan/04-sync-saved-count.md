---
slug: sync-saved-count
title: Synchronize the Saved Event Count
moduleSlug: build-the-saved-plan
moduleTitle: "Build the Saved Weekend Plan"
moduleOrder: 7
lessonOrder: 4
published: true
duration: "11 minutes"
summary: Add a hydrated header count that follows save changes across independent islands and browser tabs.
resources:
  - https://docs.astro.build/en/guides/framework-components/#hydrating-interactive-components
  - https://developer.mozilla.org/en-US/docs/Web/API/Window/storage_event
---

# Synchronize the Saved Event Count

## Outcome

You will add a saved-event count to the global header. It will update after a save in another React island, reload from storage, and follow changes made in another tab.

The header is an Astro component because its navigation is static. Only the number needs browser state, so the count becomes a small React island inside the existing header.

## Create the count island

Create `src/components/events/SavedCount.tsx`:

```tsx
import { useSavedEvents } from "../../lib/use-saved-events";

interface SavedCountProps {
  validEventIds: string[];
}

export function SavedCount({ validEventIds }: SavedCountProps) {
  const { savedIds } = useSavedEvents(validEventIds);

  return (
    <span
      aria-label={`${savedIds.length} saved ${savedIds.length === 1 ? "event" : "events"}`}
      className="bg-yellow text-ink border-ink inline-grid min-w-6 place-items-center rounded-full border px-1.5 text-xs font-black"
    >
      {savedIds.length}
    </span>
  );
}
```

The visual output is only a number. The `aria-label` gives that number meaning and handles singular grammar. Because the label is part of the surrounding link's accessible name, browser tests can find `My plan 1 saved event` without relying on CSS or implementation details.

Passing valid IDs lets a globally visible count repair stale storage. Otherwise a deleted event could keep the badge at one while the saved page has nothing to render.

## Query IDs in the Astro header

Update the component script in `src/components/layout/SiteHeader.astro`:

```diff
 ---
+import { SavedCount } from '../events/SavedCount';
+import { getPublishedEvents } from '../../lib/content';
+
 const pathname = Astro.url.pathname;
+const validEventIds = (await getPublishedEvents()).map((event) => event.id);
```

This query runs during static generation. The browser receives a short array of IDs as serialized island props, not complete content entries.

## Render the count in the plan link

Find the `My plan` link and make its contents:

```astro
<a
  class:list={[
    'focus-visible:ring-yellow inline-flex min-h-11 items-center gap-2 px-3 outline-none focus-visible:ring-4',
    { 'bg-paper text-blue': isActive('/saved/') },
  ]}
  href="/saved/"
  aria-current={pathname === '/saved/' ? 'page' : undefined}
>
  My plan
  <SavedCount client:load validEventIds={validEventIds} />
</a>
```

Keep the existing list item and surrounding navigation. `client:load` is appropriate because the count is visible in the initial viewport and should respond as soon as another island dispatches a change.

On the server, the hook renders zero. After hydration, it reads storage and updates. This small change is preferable to blocking all header HTML on client JavaScript.

## Verify both synchronization paths

Open an event detail route and watch the header while toggling the event. The count should update immediately. That proves the custom event connects separate React roots in the same document.

Open the same route in a second tab. Toggle the event there and return to the first tab. The first header should update through the native `storage` event.

## Runnable checkpoint

Run:

```sh
pnpm check
pnpm test
pnpm build
pnpm dev
```

Save one event on its detail page. The My plan link must expose the accessible name `My plan 1 saved event`. Remove it from `/events/`; the label must become `My plan 0 saved events` without a reload. Repeat with two tabs and confirm both counts converge after each change.
