---
slug: render-event-grid
title: Render the Event Grid
moduleSlug: build-the-static-experience
moduleTitle: "Build the Static Experience"
moduleOrder: 3
lessonOrder: 4
published: true
duration: "12 minutes"
summary: Create temporary typed event data and render reusable cards in a responsive Astro grid.
resources:
  - https://docs.astro.build/en/basics/astro-syntax/#dynamic-html
  - https://tailwindcss.com/docs/grid-template-columns
---

# Render the Event Grid

## Outcome

You will create a temporary typed event array in `src/lib/temporary-events.ts` and render `EventCard.astro` in a responsive grid. This keeps the static experience runnable before the next module introduces content collections.

## Create the temporary event array

Open `src/lib/temporary-events.ts`. Keep its poster import and interface, then export this array below them:

```ts
export const temporaryEvents = [
  {
    title: "Riverfront Sunset Sessions",
    description: "Local bands close out Friday beside the Mississippi River.",
    date: "Friday, September 4",
    time: "7:00 PM-10:00 PM",
    categoryLabel: "Music",
    priceLabel: "Free",
    venueName: "Riverfront Park",
    neighborhood: "Downtown",
    image: riverfrontSunset,
    imageAlt:
      "Riverfront Sunset Sessions poster with a yellow sun and cream and orange waves on a blue background.",
  },
  {
    title: "South Main Night Market",
    description:
      "Shop local makers, vintage finds, and late-night food stalls.",
    date: "Friday, September 4",
    time: "6:00 PM-10:00 PM",
    categoryLabel: "Market",
    priceLabel: "Free",
    venueName: "South Main Promenade",
    neighborhood: "South Main",
    image: riverfrontSunset,
    imageAlt:
      "Sunset Sessions poster reused for South Main Night Market, with a yellow sun and layered orange and cream waves.",
  },
  {
    title: "Six Tacos, One Block",
    description: "Taste six neighborhood taco specials on one walkable block.",
    date: "Saturday, September 5",
    time: "12:00 PM-4:00 PM",
    categoryLabel: "Food & drink",
    priceLabel: "$24",
    venueName: "Broad Avenue",
    neighborhood: "Binghampton",
    image: riverfrontSunset,
    imageAlt:
      "Sunset Sessions poster reused for Six Tacos, One Block, with bold cream lettering on a blue background.",
  },
  {
    title: "Hyde Lake Paddle Hour",
    description: "Take a guided beginner paddle around Hyde Lake.",
    date: "Sunday, September 6",
    time: "9:00 AM-11:00 AM",
    categoryLabel: "Outdoors",
    priceLabel: "$12",
    venueName: "Shelby Farms Park",
    neighborhood: "East Memphis",
    image: riverfrontSunset,
    imageAlt:
      "Sunset Sessions poster reused for Hyde Lake Paddle Hour, with orange and cream waves below a yellow sun.",
  },
] satisfies TemporaryEvent[];
```

`satisfies TemporaryEvent[]` checks every object without widening away its inferred values.

The repeated poster is intentional temporary data. The content module will replace these objects with individual Markdown entries and poster imports.

Return to `src/pages/index.astro`. Remove its direct `riverfrontSunset` import and the single `editorPick` object. Add these imports and destructure the array:

```astro
---
import EventCard from '../components/events/EventCard.astro';
import { temporaryEvents } from '../lib/temporary-events';

const [editorPick, ...secondaryEvents] = temporaryEvents;
---
```

Keep the existing `Image`, `BaseLayout`, and global page markup. Array destructuring keeps the first object as the existing editor's pick and exposes the remaining three to the grid.

## Understand the expected content invariant

The temporary array includes one editor's pick and three secondary events. The page accesses `editorPick` directly, so the array must contain at least one item.

That is a local invariant for this fixed lesson data. Once editors can change content, the project should validate the invariant or define a fallback rather than relying on array position.

## Render the section heading

After the first hero section, add the featured section:

```astro
<section class="page-shell py-16 sm:py-20" aria-labelledby="featured-heading">
  <div class="mb-8 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
    <div>
      <p class="text-tomato text-sm font-black tracking-[0.2em] uppercase">
        Start here
      </p>
      <h2
        class="font-display text-5xl leading-none uppercase sm:text-7xl"
        id="featured-heading"
      >
        Four featured events
      </h2>
    </div>
    <p class="max-w-sm leading-relaxed md:text-right">
      Start with the editor's pick above, then check the other three below.
    </p>
  </div>
</section>
```

`aria-labelledby` associates the section with its visible heading. The heading's ID is also useful as a link target and test selector.

The heading row becomes two columns at `md`. The description aligns to the right only when there is enough horizontal room.

## Map entries to cards

Inside that section after the heading wrapper, render the grid:

```astro
<div class="grid gap-7 lg:grid-cols-3">
  {
    secondaryEvents
      .slice(0, 3)
      .map((event, index) => (
        <EventCard event={event} eager={index === 0} />
      ))
  }
</div>
```

Astro expressions use braces. The array map returns one component for each selected event.

`.slice(0, 3)` enforces the editorial promise in the heading. Additional featured entries do not silently expand the home-page section.

The first secondary card receives `eager={true}`. The other cards use the component's default lazy loading. This gives the first likely visible grid image priority without making the whole page eager-load.

The grid starts with one column and switches directly to three at `lg`. The cards do not need to know which grid contains them. Their internal layout and responsive image hints come from props.

## Keep loading policy on the page

The first secondary card is eager because it is the first grid image likely to approach the initial viewport. The other two cards use the component's default lazy loading.

Loading policy belongs to the page because the page knows placement. Rendering policy belongs to the card because the card owns its image element.

## Avoid leaking loop details into the component

The card receives `event` and a meaningful loading decision. It does not receive `index` and decide that index zero is special. An index has no meaning outside its current list, while `eager` states the actual behavior.

This small prop choice keeps `EventCard` reusable when later pages begin to use it.

## Verification

Run `pnpm dev`. Confirm the home page renders one editor's pick and exactly three secondary cards. Resize below and above the `lg` breakpoint and check the column change.

Inspect the first secondary image and the next image. Their `loading` attributes should be `eager` and `lazy` respectively.

Run `pnpm check` and `pnpm build`. Because all temporary data is available during generation, the generated home-page HTML should already contain the event titles, descriptions, venue names, and links.

## Exercise

Temporarily reverse `temporaryEvents` before destructuring and observe which entry becomes the editor's pick. Restore the original order. Explain why the later content helper, rather than every rendering page, should own event sorting.
