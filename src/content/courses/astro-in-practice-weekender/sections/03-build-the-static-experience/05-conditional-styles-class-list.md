---
slug: conditional-styles-class-list
title: Apply Conditional Styles with class:list
moduleSlug: build-the-static-experience
moduleTitle: "Build the Static Experience"
moduleOrder: 3
lessonOrder: 5
published: true
duration: "8 minutes"
summary: Use Astro's class:list directive to combine stable utilities with typed visual variants and route-aware states.
resources:
  - https://docs.astro.build/en/reference/directives-reference/#classlist
  - https://tailwindcss.com/docs/detecting-classes-in-source-files
---

# Apply Conditional Styles with class:list

## Outcome

You will audit two existing `class:list` uses: the event card variant and active navigation state. You will also keep Tailwind utility names visible to its source scanner.

## Start with the stable classes

Most Weekender elements use a normal `class` attribute because their styles do not change. Conditional classes are useful only where markup has a real state or variant.

The event card always needs its border, background, grid, overflow, and shadow. It needs a second grid column only when `featured` is true.

In `EventCard.astro`, focus on the one attribute that expresses that distinction:

```astro
class:list={[
  'border-ink bg-paper group grid overflow-hidden border-2 shadow-[6px_6px_0_var(--color-ink)]',
  featured ? 'md:grid-cols-[1.25fr_1fr]' : '',
]}
```

`class:list` accepts an array. Astro flattens the values and produces one HTML class attribute. The first item is always present. The second item evaluates to a utility string or an empty string.

This keeps the shared visual identity readable as one value instead of splitting every utility into an object entry.

## Change visual scale without changing semantics

The same component changes heading size without duplicating its `h3` markup:

```astro
class:list={[
  'font-display mt-1 leading-[0.98] uppercase',
  featured ? 'text-4xl lg:text-5xl' : 'text-3xl',
]}
```

Both branches are complete Tailwind class strings in source. Tailwind can detect `text-4xl`, `lg:text-5xl`, and `text-3xl` while building the stylesheet.

Avoid constructing names such as `` `text-${size}` ``. Tailwind scans source text for class candidates and cannot reliably infer arbitrary fragments. Complete branch strings are both clearer and safer.

The element remains an `h3` in both variants. A visual variant should not change heading level because heading semantics depend on the page outline.

## Use object syntax for state

In `SiteHeader.astro`, the conditional object is the only addition needed for active color:

```astro
class:list={[
  'focus-visible:ring-yellow inline-flex min-h-11 items-center px-3 outline-none focus-visible:ring-4',
  { 'bg-paper text-blue': isActive('/events/') },
]}
aria-current={pathname === '/events/' ? 'page' : undefined}
```

The object key is the class string, and the object value decides whether Astro includes it. This reads naturally when the state is true or absent.

`isActive('/events/')` uses a prefix match, so event detail routes keep the Events navigation visually selected. `aria-current` uses an exact match because the link itself points only to `/events/`.

Visual state and accessibility state answer related but different questions. The visual treatment identifies the current site section. `aria-current="page"` identifies the exact current page link.

## Pick the simplest conditional form

Use a ternary when exactly one of two class strings must appear:

```astro
featured ? 'text-4xl lg:text-5xl' : 'text-3xl'
```

Use an object when classes are added only for a true condition:

```astro
{ 'bg-paper text-blue': isActive('/events/') }
```

Use a normal `class` attribute when there is no condition. `class:list` is not a replacement for every class attribute.

## Keep the variant API narrow

`EventCard` exposes one `featured?: boolean` prop instead of several presentation props such as `columns`, `headingSize`, and `imageWidth`. The component owns the coordinated style change.

That API prevents invalid combinations. A caller cannot request the featured image layout with the ordinary heading size. The variant represents a product concept, while individual utilities remain implementation details.

## Verification

Temporarily duplicate the first card call in the home-page grid and add `featured` to the duplicate:

```astro
<EventCard event={event} />
<EventCard event={event} featured />
```

Inspect the generated HTML. Both should contain the base classes. Only the featured card should contain `md:grid-cols-[1.25fr_1fr]`, `text-4xl`, and `lg:text-5xl`. The ordinary card should contain `text-3xl`.

Visit the home page and `/events/`. The Events link should have active colors and `aria-current="page"` only on `/events/`.

Run `pnpm build` after testing. If a conditional utility appears in source as a complete string, Tailwind should include its CSS.

## Exercise

Add a temporary `compact` prop to a copy of the card heading and try to combine it with `featured`. List the possible visual combinations. Then remove it. This shows why each new boolean variant can multiply states and why the component should expose only variants it actually needs.
