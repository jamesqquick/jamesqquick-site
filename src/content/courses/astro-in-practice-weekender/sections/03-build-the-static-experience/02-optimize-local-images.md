---
slug: optimize-local-images
title: Optimize Local Images
moduleSlug: build-the-static-experience
moduleTitle: "Build the Static Experience"
moduleOrder: 3
lessonOrder: 2
published: true
duration: "10 minutes"
summary: Use Astro's local asset pipeline and Image component to render SVG event artwork with explicit loading behavior.
resources:
  - https://docs.astro.build/en/guides/images/
  - https://docs.astro.build/en/reference/modules/astro-assets/
---

# Optimize Local Images

## Outcome

You will use the `Image` component from `astro:assets` to render local SVG event artwork. You will use its imported metadata, preserve intrinsic dimensions, provide useful alt text, and choose deliberate loading behavior.

## Add the local poster before importing it

Create `src/assets/events/riverfront-sunset.svg` with the supplied course artwork:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 800" role="img">
  <rect width="1200" height="800" fill="oklch(0.49 0.2 265)" />
  <circle cx="860" cy="300" r="190" fill="oklch(0.86 0.16 90)" />
  <path d="M0 490 Q180 430 360 500 T720 500 T1080 500 T1320 500 V800 H0Z" fill="oklch(0.62 0.22 32)" />
  <path d="M0 590 Q180 530 360 600 T720 600 T1080 600 T1320 600 V800 H0Z" fill="oklch(0.94 0.025 82)" />
  <text x="70" y="120" fill="oklch(0.94 0.025 82)" font-family="sans-serif" font-size="54" font-weight="800">FRIDAY / 7 PM</text>
  <text x="70" y="245" fill="oklch(0.94 0.025 82)" font-family="sans-serif" font-size="100" font-weight="900">SUNSET</text>
  <text x="70" y="345" fill="oklch(0.94 0.025 82)" font-family="sans-serif" font-size="100" font-weight="900">SESSIONS</text>
</svg>
```

Files in `src/assets/` are imported assets. Astro reads their metadata during the build. Files in `public/` are copied as-is and referenced by a plain URL.

## Import the Image component

At the top of `src/pages/index.astro`, import the image component and the file you just created. Add a temporary local object for the editor's pick:

```astro
---
import { Image } from 'astro:assets';

import riverfrontSunset from '../assets/events/riverfront-sunset.svg';

const editorPick = {
  title: 'Riverfront Sunset Sessions',
  description: 'Local bands close out Friday beside the Mississippi River.',
  date: 'Friday, September 4',
  time: '7:00 PM-10:00 PM',
  image: riverfrontSunset,
  imageAlt:
    'Riverfront Sunset Sessions poster with a yellow sun and cream and orange waves on a blue background.',
};
---
```

The imported asset carries its `src`, `width`, `height`, and format metadata. Astro infers this SVG's 1200-by-800 dimensions from its `viewBox`. The temporary object keeps this section runnable without depending on content collections from the next module.

## Render the editor's pick image

Replace the editor's-pick comment from the previous lesson with this article. Its links point to the existing event-directory stub until event detail routes are created later:

```astro
<article
  class="border-ink bg-paper group grid grid-rows-[auto_minmax(18rem,1fr)_auto] overflow-hidden border-2 shadow-[8px_8px_0_var(--color-ink)]"
>
  <div class="bg-blue border-ink border-b-2 px-4 py-3">
    <span class="bg-tomato text-paper border-ink inline-block border-2 px-3 py-2 text-xs font-black tracking-[0.16em] uppercase">
      Editor's pick
    </span>
  </div>
  <a
    aria-label={`View ${editorPick.title}`}
    class="focus-visible:ring-tomato relative block min-h-72 overflow-hidden outline-none focus-visible:ring-4 focus-visible:ring-inset"
    href="/events/"
  >
    <Image
      alt={editorPick.imageAlt}
      class="bg-blue absolute inset-0 h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
      decoding="async"
      fetchpriority="high"
      loading="eager"
      src={editorPick.image}
    />
  </a>
  <div class="grid gap-2 p-6 sm:p-8">
    <p class="text-blue text-sm font-bold">
      {editorPick.date} / {editorPick.time}
    </p>
    <h2 class="font-display text-4xl leading-none uppercase sm:text-5xl">
      <a class="hover:underline" href="/events/">{editorPick.title}</a>
    </h2>
    <p class="leading-relaxed">{editorPick.description}</p>
  </div>
</article>
```

The link establishes a positioned box with a minimum height. The image fills that box. `object-contain` preserves the complete poster instead of cropping it.

`Image` uses the imported metadata to add intrinsic `width` and `height` attributes to the generated `img`. Those dimensions reserve the correct aspect ratio before the file finishes loading, while the CSS still controls its rendered size.

SVG is already resolution-independent, so this lesson keeps one scalable source rather than requesting multiple generated widths. Responsive raster artwork works differently: local PNG, JPEG, and WebP imports can use Astro's image transforms and responsive layout options to generate candidate files for the browser to choose between.

## Choose loading behavior by page position

The editor's pick uses `loading="eager"` because it appears near the top of the home page and is likely visible immediately. `fetchpriority="high"` also tells the browser that this request matters to the initial view, while `decoding="async"` allows image decoding without blocking other rendering work.

The shared event card in the next lesson will accept an `eager` prop and make the same choice explicit. Most cards can lazy-load because they appear farther down the page.

Do not make every image eager. That would make below-the-fold artwork compete with the content needed for the first viewport.

Use high fetch priority just as selectively. Most images should keep the browser's default priority, and images below the fold should normally use `loading="lazy"`.

## Render imported SVG safely

Passing the trusted local import to `Image` renders the SVG through an `img` element. Keep untrusted SVG markup out of `set:html` and do not inline markup received from users or external sources. Treat SVG files as code-capable documents when deciding which assets belong in the repository.

## Match the fit to the composition

The editor's pick uses `object-contain` because its poster sits in a tall, flexible feature area and the design wants the full artwork visible.

Reusable cards use a fixed `aspect-[3/2]` image region and `object-cover`. Covering the frame keeps rows visually consistent, even if the source artwork has a different aspect ratio. Some edges can be cropped.

This choice is about the containing layout, not a universal image rule. Choose `contain` when the whole asset must remain visible. Choose `cover` when filling a known frame matters more than preserving every edge.

## Write useful alternative text

The temporary object stores `imageAlt` beside the event rather than generating it from the title. Riverfront Sunset Sessions describes the poster's sun, waves, and colors.

That field is passed directly to `alt`. A title alone would not describe the image, and a filename would be meaningless. Content-specific alt text also lets an editor revise the description without changing component code.

The link's `aria-label` names its destination as `View Riverfront Sunset Sessions`. The image's alt text describes the poster artwork. These strings serve different purposes, so keep navigation language out of `imageAlt` and visual details out of the link's accessible name.

## Preserve motion preferences and focus

The image scales slightly when its parent card is hovered. `motion-reduce:transition-none` removes the animated transition for visitors who request less motion. The wrapping link receives an inset focus ring so keyboard users can see the active image link without changing the card layout.

## Verification

Run `pnpm build`, then inspect the generated HTML in `dist/`. Confirm the generated `img` includes intrinsic `width` and `height` values plus `loading="eager"`, `decoding="async"`, and `fetchpriority="high"`.

Run `pnpm preview` and resize the page. Confirm the SVG remains sharp and the browser preserves its aspect ratio at narrow and wide viewports.

Disable images and confirm the alternative text still communicates the poster content.

## Exercise

Temporarily render `{editorPick.image.width} x {editorPick.image.height}` beside the poster. Confirm the values match the SVG `viewBox`, then remove the text. Explain how intrinsic dimensions and CSS sizing solve different layout problems.
