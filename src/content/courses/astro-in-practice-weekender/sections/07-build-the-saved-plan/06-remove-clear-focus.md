---
slug: remove-clear-focus
title: Restore Focus After Removing Events
moduleSlug: build-the-saved-plan
moduleTitle: "Build the Saved Weekend Plan"
moduleOrder: 7
lessonOrder: 6
published: true
duration: "10 minutes"
summary: Move keyboard focus to the next useful control after remove and clear actions change the saved plan.
resources:
  - https://react.dev/reference/react/useRef
  - https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
---

# Restore Focus After Removing Events

## Outcome

You will keep keyboard focus in a useful place after an event or the complete plan disappears. The first remaining Remove button receives focus when possible. If the plan becomes empty, focus moves to Browse the lineup.

Without this work, the browser loses the focused button when React removes its element. Visual users may notice a missing focus ring. Screen-reader and keyboard users lose their position in the task.

## Keep a reference to the changing region

Update the top of `src/components/events/SavedPlan.tsx`:

```diff
+import { useRef } from 'react';

 import {
```

Add the ref as the first line inside `SavedPlan`:

```tsx
const planRef = useRef<HTMLElement>(null);
```

Attach it to both top-level section variants:

```diff
-<section className="border-ink bg-yellow ...">
+<section className="border-ink bg-yellow ..." ref={planRef}>
```

```diff
-<section>
+<section ref={planRef}>
```

The same ref follows whichever branch is currently rendered. React sets `planRef.current` to the populated section, then updates it to the empty section after the last item is removed.

## Focus after React commits the update

Add these functions before the empty-state condition:

```tsx
function focusPlanAfterUpdate() {
  requestAnimationFrame(() => {
    planRef.current
      ?.querySelector<HTMLElement>(
        '[data-saved-event] button, a[href="/events/"]'
      )
      ?.focus();
  });
}

function removeEvent(eventId: string) {
  toggle(eventId);
  focusPlanAfterUpdate();
}

function clearPlan() {
  clear();
  focusPlanAfterUpdate();
}
```

`requestAnimationFrame()` waits until React has committed the next DOM. Querying immediately after `toggle()` would still find the button that is about to disappear.

The selector follows the actual reference behavior. It focuses the first remaining Remove button in DOM order. If there are no saved events, it focuses the empty-state link. The reference does not calculate a removed index or claim to preserve the exact list position.

## Route the actual remove action

The plan is grouped by day for rendering, but the reference implementation does not calculate or preserve a removed index. Keep the remove handler focused on the event ID:

```tsx
return (
  <div>
    {dayEvents.map((event) => (
      <article data-saved-event key={event.id}>
        {/* event content */}
        <button onClick={() => removeEvent(event.id)} type="button">
          Remove
        </button>
      </article>
    ))}
  </div>
);
```

Keep the existing event content and classes from the previous lesson. The `map` expression closes with `))}` inside the returned JSX. This is the valid TSX form for an implicit JSX return inside a JSX expression.

## Route actions through the focus helpers

Change the clear button:

```diff
-onClick={clear}
+onClick={clearPlan}
```

Change each remove button:

```diff
-onClick={() => toggle(event.id)}
+onClick={() => removeEvent(event.id)}
```

Do not add `autoFocus` to cards or the empty state. `autoFocus` would move focus on initial page hydration, even when the visitor had not asked to change the plan. Focus should move only after the two destructive controls.

## Check the keyboard flow

Save three events. Open `/saved/`, use Tab to reach a Remove button, and activate it with Space or Enter. Focus should move to the first remaining Remove button in the plan.

Remove events until one remains. Activate its Remove button. The empty state should appear and Browse the lineup should receive focus.

Repeat with multiple events and Clear my plan. The same empty-state link should receive focus.

## Optional exercise: preserve the removed position

The reference only focuses the first remaining control. If you want index-aware focus as an exercise, replace the complete focus helper and remove handler with this version, then pass the flattened index from a complete `map` callback:

```tsx
const removedIndexRef = useRef<number | null>(null);

function focusPlanAfterUpdate() {
  requestAnimationFrame(() => {
    const removeButtons = planRef.current?.querySelectorAll<HTMLElement>(
      "[data-saved-event] button"
    );

    if (!removeButtons?.length) {
      planRef.current
        ?.querySelector<HTMLElement>('a[href="/events/"]')
        ?.focus();
      removedIndexRef.current = null;
      return;
    }

    const removedIndex = removedIndexRef.current ?? 0;
    removeButtons[Math.min(removedIndex, removeButtons.length - 1)]?.focus();
    removedIndexRef.current = null;
  });
}

function removeEvent(eventId: string, eventIndex: number) {
  removedIndexRef.current = eventIndex;
  toggle(eventId);
  focusPlanAfterUpdate();
}
```

Use this complete rendering expression for the remove button:

```tsx
return (
  <div>
    {dayEvents.map((event) => {
      const eventIndex = savedEvents.findIndex(({ id }) => id === event.id);

      return (
        <article data-saved-event key={event.id}>
          {/* event content */}
          <button
            onClick={() => removeEvent(event.id, eventIndex)}
            type="button"
          >
            Remove
          </button>
        </article>
      );
    })}
  </div>
);
```

This is optional because it changes the reference behavior. Do not describe it as the default implementation or claim it is covered by the current reference tests.

## Runnable checkpoint

Run:

```sh
pnpm check
pnpm test
pnpm build
pnpm dev
```

On `/saved/`, remove one of several events and run this in the browser console:

```js
document.activeElement?.textContent?.trim();
```

It should return `Remove`. Remove the last event or clear the plan and run it again. It should return `Browse the lineup`. The focus move must happen only after either saved-plan action, not when the page first hydrates.
