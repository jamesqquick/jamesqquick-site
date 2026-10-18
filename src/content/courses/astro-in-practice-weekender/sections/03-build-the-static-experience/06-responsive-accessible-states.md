---
slug: responsive-accessible-states
title: Add Responsive and Accessible States
moduleSlug: build-the-static-experience
moduleTitle: "Build the Static Experience"
moduleOrder: 3
lessonOrder: 6
published: true
duration: "14 minutes"
summary: Finish the static experience with responsive layouts, keyboard focus, semantic regions, motion preferences, and meaningful empty-state patterns.
resources:
  - https://tailwindcss.com/docs/responsive-design
  - https://tailwindcss.com/docs/hover-focus-and-other-states
  - https://developer.mozilla.org/en-US/docs/Web/Accessibility
  - https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-labelledby
---

# Add Responsive and Accessible States

## Outcome

You will audit the static Weekender interface across viewport sizes, keyboard input, and motion preferences. You will connect responsive utilities to content priorities instead of treating mobile support as a final shrink pass.

## Build from one column outward

Tailwind's unprefixed utilities apply at every width. Breakpoint-prefixed utilities add changes at larger widths. The Weekender starts major sections in one column, then introduces columns only when the content has room.

The home-page hero follows that pattern. Its base classes create one grid column, while `lg:grid-cols-[1.08fr_0.92fr]` adds the split only on wide screens.

At narrow widths, the copy and editor's pick stack. Padding increases at `md`, and the two-column split appears at `lg`.

The featured grid does the same with `grid gap-7 lg:grid-cols-3`.

This approach avoids overriding a desktop layout with many mobile exceptions. The base is already the constrained layout.

## Use fluid type where the range is wide

The hero heading spans a large range of devices:

```astro
<h1
  class="font-display mt-5 max-w-3xl text-[clamp(4.4rem,11vw,9.4rem)] leading-[0.86] tracking-[-0.035em] uppercase"
>
  Eight events. One Memphis weekend.
</h1>
```

`clamp()` gives the type a minimum, a viewport-relative preferred size, and a maximum. It avoids abrupt jumps between several breakpoint sizes.

Other headings use discrete responsive steps such as `text-5xl sm:text-7xl` because two sizes are enough for their narrower range.

Large type still needs testing with real copy. Check for clipped letters, overlap, and horizontal scrolling rather than assuming the formula makes every string safe.

## Preserve navigation priorities

The header uses `flex-wrap`, responsive padding, and separate horizontal and vertical gaps so its contents can wrap without colliding.

The About item's `hidden sm:block` classes reserve the smallest screens for the two primary task links.

Events and My plan remain because they support the application's primary tasks. About remains available in the footer. Responsive design includes deciding what gets scarce space, not only reducing font sizes.

## Make keyboard state visible

Interactive elements remove the browser's default outline only when they replace it with a clear focus-visible style. The event card link uses an inset ring:

```astro
<a
  class="focus-visible:ring-tomato relative block aspect-[3/2] overflow-hidden outline-none focus-visible:ring-4 focus-visible:ring-inset"
  href="/events/"
>
```

The inset ring remains visible inside an overflow-hidden image frame. Text links use an external ring or underline. The goal is not identical focus decoration everywhere. The goal is an unmistakable state that fits the element's geometry.

The shared layout's skip link stays above the visual layout until `focus:top-3` moves it into view. Its target is `<main id="main-content" tabindex="-1">`.

## Name regions and current state

When a page has several regions, visible headings and ARIA attributes should describe their purpose.

The featured section uses `aria-labelledby="featured-heading"`, which matches its visible `h2` ID.

Audit the home-page outline as it exists now: the editorial hero is the single `h1`, the editor's pick title is an `h2`, the featured-events section starts with an `h2`, and each card title is an `h3`. This hierarchy follows the sections you built; it does not depend on text size or a future reference implementation.

Navigation elements receive distinct labels, `Primary navigation` and `Footer navigation`. Exact current-page links receive `aria-current="page"`.

Decorative elements use `aria-hidden="true"`. This includes the tilted `W` badge, the hero square, and punctuation that adds visual rhythm without meaning.

## Keep targets usable

Header links use `min-h-11`, and the main hero action uses `min-h-12`. At Tailwind's default spacing scale, `min-h-11` is 44 pixels. The target includes padding around the text instead of requiring precise pointer placement.

The footer links are less prominent, but their wrapping layout and line height keep them separated. Always test target size on the actual rendered page rather than relying only on class names.

## Respect motion settings

The event image hover effect includes `motion-reduce:transition-none`, and the primary hero link includes `motion-reduce:transform-none`.

The primary hero link includes `motion-reduce:transform-none`. The global stylesheet also disables smooth scrolling and reduces transition and animation durations inside a `prefers-reduced-motion: reduce` query.

Motion is optional feedback. Removing it must not hide content, focus, or state.

## Add an empty state to the current grid

Static pages still need content states. Inside the featured grid, add a message before the existing map expression:

```astro
{secondaryEvents.length === 0 && (
  <p class="border-ink bg-cream border-2 p-6 font-bold lg:col-span-3">
    More featured events are coming soon.
  </p>
)}
```

An empty array should not produce an unlabeled blank section. This fallback explains the state without importing future content validation or interactive filtering code.

## Run a manual verification pass

Start the app with `pnpm dev` and complete this pass:

1. Check 390-pixel and wide desktop viewports for horizontal scrolling.
2. Confirm hero, cards, and footer switch layouts without hiding required content.
3. Press Tab from the top and activate the skip link.
4. Tab through image links, title links, navigation, and calls to action.
5. Confirm each focused element has a visible indicator.
6. Inspect the page outline and verify headings progress by content hierarchy.
7. Enable reduced motion and test hover and in-page navigation.
8. Disable images and read the event poster alt text.

Then run:

```sh
pnpm build
```

Later, a Playwright suite will automate desktop and mobile route checks plus accessibility scans. Manual keyboard and responsive testing still catches visual and interaction problems that static analysis cannot judge.

## Exercise

Choose one responsive class and one accessibility attribute from the event card. Remove each temporarily and state the exact user-facing regression. Restore both. If you cannot describe a regression, the class or attribute may not be earning its place.
