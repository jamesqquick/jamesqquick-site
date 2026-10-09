---
slug: build-editorial-hero
title: Build the Editorial Hero
moduleSlug: build-the-static-experience
moduleTitle: "Build the Static Experience"
moduleOrder: 3
lessonOrder: 1
published: true
duration: "11 minutes"
summary: Build the Weekender home-page hero with a clear editorial hierarchy, responsive type, and direct paths to the site's main tasks.
resources:
  - https://docs.astro.build/en/basics/astro-pages/
  - https://tailwindcss.com/docs/responsive-design
---

# Build the Editorial Hero

## Outcome

You will replace the starter home page with the Weekender's primary editorial hero. The result will explain the scope, establish the site's visual language, and point visitors to the event directory and saved plan without requiring browser JavaScript.

## Set up the home page

Open `src/pages/index.astro`. The finished page imports content helpers and event components, but the hero itself needs only `BaseLayout`. Start with this page boundary:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---

<BaseLayout
  title="The Weekender"
  description="A guide to concerts, markets, food, and outdoor events in Memphis for September 4-6."
>
  <!-- Home-page sections go here. -->
</BaseLayout>
```

The page title uses the special home-page case from `BaseLayout`, so the document title remains `The Weekender`. The description names the content and date range instead of repeating the headline.

## Create the responsive split

Add the first section inside the layout:

```astro
<section
  class="page-shell grid gap-8 py-8 md:py-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch"
>
  <div
    class="border-ink bg-yellow relative overflow-hidden border-2 p-6 shadow-[8px_8px_0_var(--color-ink)] sm:p-9 lg:p-12"
  >
    <!-- Editorial copy goes here. -->
  </div>

  <!-- The editor's pick card goes here later. -->
</section>
```

The section starts as one grid column. At the `lg` breakpoint, it becomes a slightly uneven two-column layout. The copy receives a little more width than the future event card.

`page-shell` applies the shared horizontal gutter and maximum width. The yellow panel uses the project's recurring two-pixel border and offset ink shadow. `overflow-hidden` contains the decorative shape you will add later.

This is an editorial layout rather than a centered marketing hero. The text sits in a strong block and shares the first viewport with a concrete event recommendation.

## Add the content hierarchy

Inside the yellow panel, add the eyebrow, heading, and supporting copy. Use an ASCII hyphen for the date range in lesson code and content files where ASCII is required.

```astro
<p class="text-blue text-sm font-black tracking-[0.2em] uppercase">
  Memphis, September 4-6
</p>
<h1
  class="font-display mt-5 max-w-3xl text-[clamp(4.4rem,11vw,9.4rem)] leading-[0.86] tracking-[-0.035em] uppercase"
>
  Eight events. One Memphis weekend.
</h1>
<p class="mt-8 max-w-xl text-lg leading-relaxed font-semibold sm:text-xl">
  Eight good reasons to leave the house, picked for people who want a plan
  without spending all Friday making one.
</p>
```

The eyebrow provides location and date context before the headline. The heading uses the display font and a tight line height. Its `clamp()` value grows with the viewport while keeping a usable minimum and maximum.

The heading is intentionally much larger than the body text. The short sentence can support that scale without becoming hard to scan. `max-w-3xl` and `max-w-xl` stop the text from stretching across all available space.

## Add the two primary paths

Place this link group after the supporting paragraph:

```astro
<div class="mt-8 flex flex-wrap items-center gap-4">
  <a
    class="bg-blue text-paper border-ink focus-visible:ring-tomato inline-flex min-h-12 items-center border-2 px-6 py-3 font-black tracking-wide uppercase shadow-[4px_4px_0_var(--color-ink)] outline-none hover:-translate-y-0.5 focus-visible:ring-4 motion-reduce:transform-none"
    href="/events/"
  >
    Explore all 8 events
  </a>
  <a
    class="focus-visible:ring-tomato inline-flex min-h-11 items-center font-bold underline decoration-2 underline-offset-4 outline-none focus-visible:ring-4"
    href="/saved/"
  >
    Open my weekend plan
  </a>
</div>
```

The event directory is the dominant action, so it receives a filled button treatment and shadow. The saved plan is a secondary text link. Both remain normal anchors because they navigate to pages. Using a button element here would give the wrong semantic meaning.

The primary link moves up by half a pixel unit on hover. `motion-reduce:transform-none` removes that movement when the visitor has requested reduced motion. Both links have large minimum heights and visible keyboard focus rings.

## Add restrained decoration

Add the final shape at the bottom of the panel:

```astro
<span
  class="bg-tomato border-ink absolute -right-14 -bottom-12 size-40 rotate-12 border-2"
  aria-hidden="true"></span>
```

The shape reinforces the block-print style but communicates nothing. `aria-hidden="true"` keeps it out of the accessibility tree. The parent is `relative` and clips overflow, so the square can sit partly outside the panel without causing horizontal scrolling.

## Why the hero stays static

Every part of this hero is text, decoration, or navigation. It has hover and focus styles, but those are CSS states. There is no React state, browser storage, or event handler.

Astro will generate this section as HTML and CSS. Keeping it outside a client component avoids sending React code for content that the browser already knows how to display and navigate.

## Verification

Run `pnpm dev` and inspect the page at narrow and wide widths.

At narrow widths, the panel should fill one column with six spacing units of padding. At `sm`, the copy grows and padding increases. At `lg`, the section should reserve a second column for the editor's pick card you will add after image work.

Use Tab to reach both links. Confirm each focus ring is visible. Enable reduced-motion emulation in browser developer tools and verify the primary link no longer moves on hover.

Run `pnpm build` to confirm the page remains statically renderable.

## Exercise

Remove `overflow-hidden` temporarily and inspect the page at a narrow viewport. Notice how the decorative square can affect the visual boundary. Restore the class and explain why decorative absolute positioning should never create horizontal page overflow.
