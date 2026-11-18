---
slug: understand-astro-rendering
title: Understand Astro Rendering and Islands
moduleSlug: understand-the-app
moduleTitle: "Understand the Finished App"
moduleOrder: 1
lessonOrder: 3
published: true
duration: "11 minutes"
summary: Understand what Astro renders at build time, what React hydrates in the browser, and why the Weekender uses focused islands.
resources:
  - https://docs.astro.build/en/concepts/islands/
  - https://docs.astro.build/en/reference/directives-reference/#client-directives
  - https://docs.astro.build/en/guides/integrations-guide/react/
---

# Understand Astro Rendering and Islands

## Outcome

In this lesson, you will separate three ideas that are easy to blur together when learning Astro: build-time rendering, browser HTML, and hydrated islands. You will then locate each one in the Weekender.

## Start with the default

An Astro component has a component script between the two `---` fences and a template below it. In a static build, Astro runs the component script while generating the site. It turns the template into HTML and does not send the component script to the browser.

The event directory page shows this boundary clearly:

```astro
---
import { EventExplorer } from '../../components/events/EventExplorer';
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getEventsWithVenues, toEventSummary } from '../../lib/content';

const events = (await getEventsWithVenues()).map(toEventSummary);
---
```

The collection query runs before deployment for this project. A visitor does not download `getEventsWithVenues()` or query Markdown files from the browser.

The page then renders a normal layout and one interactive component:

```astro
<div class="page-shell py-10 sm:py-14">
  <EventExplorer client:load events={events} />
</div>
```

`BaseLayout` and the surrounding page become static HTML. The `client:load` directive tells Astro to include the JavaScript needed to hydrate `EventExplorer` when the page loads.

## Understand hydration

React renders an initial representation of `EventExplorer` into the page. In the browser, React attaches event handlers and starts managing state for that component. This process is hydration.

Without a client directive, Astro can render a framework component as HTML, but it does not ship the framework's browser runtime for that component. A search field could appear, but React state and `onChange` behavior would not run.

The Weekender uses `client:load` because the interactive controls are part of the page's main task. Visitors should be able to filter or read saved state as soon as the page is ready. Other Astro projects may choose `client:visible` for a below-the-fold widget or `client:idle` for lower-priority behavior, but the finished Weekender uses `client:load` for these controls.

## Find the four islands

The finished application has four hydration points.

`src/pages/events/index.astro` hydrates the event explorer:

```astro
<EventExplorer client:load events={events} />
```

`src/pages/saved.astro` hydrates the saved plan:

```astro
<SavedPlan client:load events={events} />
```

`src/pages/events/[id].astro` hydrates one save button:

```astro
<SaveEventButton
  client:load
  eventId={event.id}
  eventTitle={event.data.title}
/>
```

`src/components/layout/SiteHeader.astro` hydrates the saved count:

```astro
<SavedCount client:load validEventIds={validEventIds} />
```

Each island has a specific job. The home page, event cards, page metadata, category links, venue details, and footer stay outside React because they do not need browser state.

## Follow data across the boundary

Astro and React run in different environments, so the boundary between them should be explicit. The event explorer does not receive raw `CollectionEntry` objects. The page converts each event and venue pair with `toEventSummary()` first.

The resulting `EventSummary` uses serializable values:

```ts
export interface EventSummary {
  id: string;
  title: string;
  description: string;
  start: string;
  end?: string;
  day: EventDay;
  category: EventCategory;
  categoryLabel: string;
  price: number;
  venueName: string;
  neighborhood: string;
  imageSrc: string;
  imageAlt: string;
  accessibility: string[];
}
```

Dates become ISO strings, and the processed image becomes its source URL. React does not need to know how Astro loaded or validated the original content. It receives only the data needed for filtering and display.

This smaller contract has two benefits. It avoids sending unused fields to the browser, and it keeps the React component independent from Astro's content-entry shape.

## See how islands coordinate

Separate islands do not share one React context. The Weekender still needs a save action in one island to update the header count in another.

The shared hook in `src/lib/use-saved-events.ts` reads a versioned `localStorage` value and listens for both the browser's `storage` event and a project-specific event. When a component changes the saved IDs, the library writes the new value and dispatches the custom event. Every mounted island can then read the same browser state.

This is a deliberate tradeoff. Keeping the islands separate avoids hydrating the entire page, but shared browser state requires a small synchronization layer.

## Compare this with a single React application

In a client-rendered React application, you might put the header, router, event list, and saved plan beneath one root component. That makes context-based state sharing straightforward, but it also makes React responsible for content that does not change in the browser.

The Weekender chooses a different boundary. Astro handles content relationships, route generation, document metadata, and static markup. React handles controls that need hooks and browser APIs. The architecture follows behavior rather than using one framework for every file.

## Checkpoint

Use the rendering map from this lesson to classify the finished interface. The page title, event text, images, venue details, and links are generated HTML. Filtering, save buttons, the saved count, and the saved plan are hydrated React islands.

Section 2 creates the first runnable project. From that point forward, each lesson ends with exact commands against files already present.

## Exercise

Review the home-page tour and list every element that would stop working if its whole section were converted from Astro to plain generated HTML. Most of the page will still work because links, images, headings, and content cards do not need hydration. The saved-plan callout is also only a link. This is why the home page contains no React island at all.
