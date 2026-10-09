---
slug: choose-island-boundary
title: Choose the React Island Boundary
moduleSlug: add-event-filtering
moduleTitle: "Add Event Filtering with React"
moduleOrder: 6
lessonOrder: 1
published: true
duration: "8 minutes"
summary: Decide which event-directory behavior needs React and keep content loading, routing, layout, and static pages in Astro.
resources:
  - https://docs.astro.build/en/concepts/islands/
  - https://docs.astro.build/en/reference/directives-reference/#client-directives
---

# Choose the React Island Boundary

## Outcome

You will define the boundary for the interactive event directory before adding React code. The filter controls, result count, result cards, and empty state need shared browser state, so they will become one `EventExplorer` island. The page header, layout, content queries, and every detail route remain Astro.

This lesson makes no source change. The static directory from section 5 is the working baseline that the next lesson will migrate.

## Start from the behavior

The event directory needs to support these actions:

- Search title, description, venue, neighborhood, and category label.
- Select a day and category.
- Limit results to free events or events with listed accessibility details.
- Keep active filters in the URL.
- Restore filters when browser history changes.
- Clear all owned filters and show a useful empty state.

Those controls all affect the same result array. If each control were an independent island, they would need a second synchronization system just to share filter state. One React island gives the controls and results one state owner.

## Keep the boundary narrow

The island should not load collections. Astro's Content Layer APIs run during rendering and return rich values such as `Date` objects and local image metadata. The page already knows how to query and validate that data before HTML generation.

The intended flow is:

```text
Markdown entries
  -> Astro collection query
  -> resolved event and venue entries
  -> plain event summaries
  -> React EventExplorer props
  -> browser filter state
```

Only the final two steps need React. This keeps the collection model and route generation available when browser JavaScript is disabled.

## Why the result cards belong inside the island

It might seem smaller to hydrate only the controls and leave `EventCard.astro` below them. That split creates a problem: React can update its own controls, but it cannot declaratively add and remove Astro-rendered cards after hydration.

The filtered result cards therefore belong in the same island as the controls. The existing Astro card remains useful on the home, category, venue, and related-event pages. The React explorer will render the directory-specific card markup from a serializable summary.

This is intentional duplication at a framework boundary, not a reason to convert every card on the site to React.

## Choose the hydration timing

The directory will use:

```astro
<EventExplorer client:load events={events} />
```

`client:load` hydrates as soon as the page loads. Search and filter controls are the route's primary purpose, so delaying them until idle or visibility would make the page appear ready before its main controls work.

Astro still server-renders the React component's initial HTML. Hydration adds event handlers and state management in the browser.

## Keep saved events out of this boundary

Do not add `localStorage`, save buttons, a saved-count hook, or cross-island events in this section. Those concerns have different persistence and synchronization requirements and start in section 7.

The section 6 island owns only event discovery. That narrower responsibility makes its filters easy to test as pure functions.

## Runnable checkpoint

Confirm the static baseline before changing the rendering boundary:

```sh
pnpm check
pnpm build
pnpm preview
```

Visit `/events/` with JavaScript disabled. All eight cards should render from Astro. The next lesson starts from this passing checkpoint and replaces only the directory results with a React island.
