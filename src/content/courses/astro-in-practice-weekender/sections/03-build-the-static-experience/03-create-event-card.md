---
slug: create-event-card
title: Create a Typed Event Card
moduleSlug: build-the-static-experience
moduleTitle: "Build the Static Experience"
moduleOrder: 3
lessonOrder: 3
published: true
duration: "13 minutes"
summary: Build a reusable Astro event card with a small typed prop contract for the static experience.
resources:
  - https://docs.astro.build/en/basics/astro-components/#component-props
---

# Create a Typed Event Card

## Outcome

You will create `src/components/events/EventCard.astro`. The component will receive one temporary typed event object, render consistent links and metadata, and support optional eager-image and featured-layout variants.

The next course section replaces this temporary interface with validated content entries. Keeping the first contract local lets the component run now without importing APIs that have not been introduced.

## Define the temporary data contract

Create `src/lib/temporary-events.ts`:

```ts
import riverfrontSunset from "../assets/events/riverfront-sunset.svg";

export interface TemporaryEvent {
  title: string;
  description: string;
  date: string;
  time: string;
  categoryLabel: string;
  priceLabel: string;
  venueName: string;
  neighborhood: string;
  image: typeof riverfrontSunset;
  imageAlt: string;
}
```

The asset import gives `image` the metadata type Astro generated for this local file. The next lesson adds the temporary records to this module. Keeping the interface in a normal TypeScript file gives the page and component one shared contract.

Now create `src/components/events/EventCard.astro` and add its script:

```astro
---
import { Image } from 'astro:assets';
import type { TemporaryEvent } from '../../lib/temporary-events';

interface Props {
  event: TemporaryEvent;
  eager?: boolean;
  featured?: boolean;
}

const { event, eager = false, featured = false } = Astro.props;
---
```

`TemporaryEvent` contains only values the card displays. Dates, prices, categories, and venue details are already formatted strings, so this temporary component does not depend on future formatter or content-query modules.

The card remains a predictable rendering component and performs no data access.

`eager` controls image loading. `featured` controls the card's layout and heading scale. Both default to `false`, so ordinary card usage stays short.

## Build the card container

Add the article and its conditional layout:

```astro
<article
  class:list={[
    'border-ink bg-paper group grid overflow-hidden border-2 shadow-[6px_6px_0_var(--color-ink)]',
    featured ? 'md:grid-cols-[1.25fr_1fr]' : '',
  ]}
  data-event-card
>
  <!-- Image and content go here. -->
</article>
```

The base card is a grid with an offset shadow. A featured card becomes two columns at the medium breakpoint, giving the image more width than the text.

The `group` class lets the linked image react when the article is hovered. `data-event-card` gives end-to-end tests a stable way to identify cards without coupling assertions to visual utility classes.

## Add the linked image

Inside the article, add the image link:

```astro
<a
  aria-label={`View ${event.title}`}
  class="focus-visible:ring-tomato relative block aspect-[3/2] overflow-hidden outline-none focus-visible:ring-4 focus-visible:ring-inset"
  href="/events/"
>
  <Image
    alt={event.imageAlt}
    class="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
    loading={eager ? 'eager' : 'lazy'}
    src={event.image}
  />
</a>
```

The link uses the event-directory stub created in section 2. Event detail links will replace it only after those routes exist. The temporary artwork is SVG, so Astro passes the scalable payload through without generating the raster candidates controlled by `widths` and `sizes`.

When later artwork uses a raster format, the three-column grid demonstrated in this section can use `sizes="(min-width: 1024px) 33vw, 100vw"` with appropriate generated widths.

The image and title will both link to the same detail page. This creates two convenient targets without wrapping the whole card in one link, which would make the venue text and metadata part of an oversized interactive region.

The image link's `aria-label` names the destination and action. `imageAlt` describes the artwork. Keeping those values separate gives the link a useful name such as `View South Main Night Market` without replacing the poster description with navigation text.

## Render category, price, and time

Add the content wrapper after the image link:

```astro
<div class="grid content-between gap-5 p-5 sm:p-6">
  <div>
    <div
      class="mb-4 flex flex-wrap items-center justify-between gap-2 text-xs font-extrabold tracking-[0.12em] uppercase"
    >
      <span class="bg-yellow border-ink border px-2 py-1">
        {event.categoryLabel}
      </span>
      <span>{event.priceLabel}</span>
    </div>
    <p class="text-blue text-sm font-bold">
      {event.date}
      <span aria-hidden="true"> / </span>
      {event.time}
    </p>
  </div>
</div>
```

The display punctuation is decorative, so it is hidden from assistive technology. The temporary data provides display-ready labels. The content-modeling section will move formatting rules out of the sample data and into shared helpers.

## Add the title and description

Place this block after the time paragraph inside the same inner `div`:

```astro
<h3
  class:list={[
    'font-display mt-1 leading-[0.98] uppercase',
    featured ? 'text-4xl lg:text-5xl' : 'text-3xl',
  ]}
>
  <a
    class="focus-visible:ring-tomato outline-none hover:underline focus-visible:ring-4"
    href="/events/"
  >
    {event.title}
  </a>
</h3>
<p class="mt-3 text-sm leading-relaxed">
  {event.description}
</p>
```

The card uses `h3` because the home page introduces its card group with an `h2`. Heading level follows document structure, not text size.

The featured variant changes visual size without changing semantics. The same event card still occupies the same level in the page outline.

## Add venue context

Finish the content wrapper with this paragraph after the inner `div`:

```astro
<p class="border-ink border-t pt-3 text-sm font-bold">
  {event.venueName}
  <span aria-hidden="true"> / </span>
  {event.neighborhood}
</p>
```

The temporary object includes display-ready venue context. A later content helper will resolve venue references before passing the same visible values to the card.

## Verification

Run `pnpm check`. Change `event.title` temporarily to `event.missingField`. TypeScript should report that the field does not exist. Restore the title.

The next lesson renders normal cards from a typed temporary array. For now, `pnpm check` and `pnpm build` should complete with the component ready to import.

## Exercise

Create a temporary object that omits `imageAlt` and type it with `TemporaryEvent`. Confirm the type checker rejects it, then remove the object. Explain why this compile-time failure is more useful than checking for the field inside the component at runtime.
