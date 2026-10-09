---
slug: save-event-button
title: Build the Save Event Button
moduleSlug: build-the-saved-plan
moduleTitle: "Build the Saved Weekend Plan"
moduleOrder: 7
lessonOrder: 3
published: true
duration: "16 minutes"
summary: Add accessible save and remove controls to event details and the React event explorer.
resources:
  - https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-pressed
  - https://docs.astro.build/en/reference/directives-reference/#client-directives
---

# Build the Save Event Button

## Outcome

You will add save and remove controls to the event detail route and the interactive event explorer. Each control will expose its state and event title to assistive technology.

Static Astro cards do not need their own React root. The home and category pages can link to details, while the existing React explorer can render controls inside its current island. This keeps shipped JavaScript tied to behavior.

## Create the detail-page button

Create `src/components/events/SaveEventButton.tsx`:

```tsx
import { useSavedEvents } from "../../lib/use-saved-events";

interface SaveEventButtonProps {
  eventId: string;
  eventTitle: string;
  compact?: boolean;
}

export function SaveEventButton({
  eventId,
  eventTitle,
  compact = false,
}: SaveEventButtonProps) {
  const { savedIds, toggle } = useSavedEvents();
  const isSaved = savedIds.includes(eventId);

  return (
    <button
      aria-pressed={isSaved}
      className={`border-ink focus-visible:ring-blue min-h-11 border-2 font-extrabold uppercase outline-none focus-visible:ring-4 ${
        compact
          ? "bg-paper hover:bg-yellow px-3 py-2 text-xs tracking-wide"
          : "bg-tomato text-paper hover:bg-yellow hover:text-ink px-6 py-3 tracking-[0.08em] shadow-[4px_4px_0_var(--color-ink)]"
      }`}
      onClick={() => toggle(eventId)}
      type="button"
    >
      <span className="sr-only">
        {isSaved ? "Remove" : "Save"} {eventTitle}
      </span>
      <span aria-hidden="true">
        {isSaved ? "Saved" : "+ Save to my weekend"}
      </span>
    </button>
  );
}
```

`aria-pressed` makes this a toggle button instead of two unrelated actions. The accessible name changes from `Save Riverfront Sunset Sessions` to `Remove Riverfront Sunset Sessions`. The visible copy can stay short because the nearby page heading already gives visual context.

The optional compact style belongs here because both versions have identical behavior. Do not create a second storage-aware button.

## Add it to event details

Import the component in `src/pages/events/[id].astro`:

```diff
 import EventCard from '../../components/events/EventCard.astro';
+import { SaveEventButton } from '../../components/events/SaveEventButton';
```

Place it in the yellow detail panel after the description:

```astro
<SaveEventButton
  client:load
  eventId={event.id}
  eventTitle={event.data.title}
/>
```

`client:load` renders initial HTML during the build and hydrates the button as soon as the page loads. A save control is a primary action, so delaying hydration until it scrolls into view would make the visible button temporarily inert.

## Connect the event explorer

Import the hook in `src/components/events/EventExplorer.tsx`:

```ts
import { useSavedEvents } from "../../lib/use-saved-events";
```

Inside `EventExplorer`, read saved state with the complete list of valid IDs:

```tsx
const { savedIds, toggle } = useSavedEvents(events.map((event) => event.id));
```

Change the `visibleEvents.map()` callback from an implicit JSX return to a block so each card can calculate its state:

```tsx
{
  visibleEvents.map((event, index) => {
    const isSaved = savedIds.includes(event.id);

    return (
      <article
        className="border-ink bg-paper group grid overflow-hidden border-2 shadow-[5px_5px_0_var(--color-ink)]"
        key={event.id}
      >
        {/* Keep the existing image link and event text here. */}
        <button
          aria-pressed={isSaved}
          className="border-ink bg-paper hover:bg-tomato hover:text-paper focus-visible:ring-blue min-h-11 border-2 px-4 py-2 text-sm font-extrabold tracking-wide uppercase outline-none focus-visible:ring-4"
          onClick={() => toggle(event.id)}
          type="button"
        >
          <span className="sr-only">
            {isSaved ? "Remove" : "Save"} {event.title}
          </span>
          <span aria-hidden="true">{isSaved ? "Saved" : "+ Save event"}</span>
        </button>
      </article>
    );
  });
}
```

Keep all existing card markup. Insert the button inside the card's padded content wrapper, after the event text. The comment above marks unchanged content in this focused excerpt; it is not a replacement for the existing image and details.

The explorer passes all event IDs to the hook, so opening `/events/` also prunes stale storage. The detail button cannot do that because it does not receive the full collection.

## Test the interaction manually

Open an event detail route and click the button. Its pressed state and label should change without navigation. Reload the page and confirm the saved state returns from `localStorage`.

Open `/events/` in the same tab. The matching explorer button should show the same state. Toggle it there, return to the detail route, and confirm the next hydration reads the update.

## Runnable checkpoint

Run:

```sh
pnpm check
pnpm test
pnpm build
pnpm dev
```

Open `/events/riverfront-sunset-sessions/`. The button must change between the accessible names `Save Riverfront Sunset Sessions` and `Remove Riverfront Sunset Sessions`, keep its state after reload, and write this envelope under `weekender:saved-events`:

```json
{ "version": 1, "eventIds": ["riverfront-sunset-sessions"] }
```

Open `/events/` and confirm the same event can be removed from the existing React explorer without breaking filters or URL synchronization.
