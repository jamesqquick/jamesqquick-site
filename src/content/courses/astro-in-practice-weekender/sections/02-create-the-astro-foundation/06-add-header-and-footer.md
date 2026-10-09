---
slug: add-header-and-footer
title: Add the Header and Footer
moduleSlug: create-the-astro-foundation
moduleTitle: "Create the Astro Foundation"
moduleOrder: 2
lessonOrder: 6
published: true
duration: "13 minutes"
summary: Add the shared Weekender navigation and footer, including active-route state and accessible labels.
resources:
  - https://docs.astro.build/en/basics/astro-components/
  - https://docs.astro.build/en/reference/api-reference/#astrourl
  - https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-current
---

# Add the Header and Footer

## Outcome

You will create the two shared layout components rendered by `BaseLayout.astro`. The header will identify the site, expose primary navigation, and mark the current route. The footer will label the project and provide a small secondary navigation.

The finished header also renders a React saved-event count. That island depends on content and browser-state files built later, so this lesson adds only the presentational navigation that can run now.

## Create the linked routes first

The navigation should not point to missing pages. Create `src/pages/events/index.astro` and `src/pages/saved.astro`. Keep the `src/pages/about.astro` page from the previous lesson, or create it now if you skipped the exercise.

Use this small page shape for each route, changing the title, description, and heading:

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
---

<BaseLayout title="Events" description="Browse all Weekender events.">
  <section class="page-shell py-12">
    <h1 class="font-display text-6xl uppercase">Events</h1>
    <p class="mt-4">The complete event directory is coming next.</p>
  </section>
</BaseLayout>
```

The nested events page needs `../../layouts/BaseLayout.astro`. The top-level saved and about pages use `../layouts/BaseLayout.astro`. Run `pnpm check` after creating all three stubs.

## Create the header route logic

Create `src/components/layout/SiteHeader.astro` with the route logic available now:

```astro
---
const pathname = Astro.url.pathname;

function isActive(href: string) {
  if (href === '/') return pathname === href;
  return pathname.startsWith(href);
}
---
```

`Astro.url.pathname` is the current request path while Astro renders the page. The home route needs an exact comparison because every pathname begins with `/`. The other links use prefix matching so future detail pages can keep their parent section visually active.

## Build the site identity

Start the template with the header and brand link:

```astro
<header class="bg-blue text-paper border-ink border-b-2">
  <div
    class="mx-auto flex max-w-[90rem] flex-wrap items-center justify-between gap-x-8 gap-y-3 px-4 py-3 sm:px-6 lg:px-10"
  >
    <a
      class="focus-visible:ring-yellow flex min-h-11 items-center gap-3 outline-none focus-visible:ring-4"
      href="/"
      aria-label="The Weekender home"
    >
      <span
        class="bg-yellow text-ink border-ink grid size-9 -rotate-3 place-items-center border-2 font-black"
        aria-hidden="true"
      >
        W
      </span>
      <span
        class="font-display text-2xl leading-none tracking-wide uppercase sm:text-3xl"
      >
        The Weekender
      </span>
    </a>
  </div>
</header>
```

The link wraps both the visual badge and name, giving users one generous target. `aria-label` names its destination. The decorative `W` is hidden from assistive technology so the link is not announced twice.

`min-h-11` creates a 44-pixel minimum target height with Tailwind's default spacing scale. The focus ring is explicit because keyboard state must be as visible as hover state.

## Add primary navigation

Place the navigation after the brand link inside the same wrapper:

```astro
<nav aria-label="Primary navigation">
  <ul class="flex items-center gap-1 text-sm font-extrabold uppercase sm:gap-3">
    <li>
      <a
        class:list={[
          'focus-visible:ring-yellow inline-flex min-h-11 items-center px-3 outline-none focus-visible:ring-4',
          { 'bg-paper text-blue': isActive('/events/') },
        ]}
        href="/events/"
        aria-current={pathname === '/events/' ? 'page' : undefined}
      >
        Events
      </a>
    </li>
    <li>
      <a
        class:list={[
          'focus-visible:ring-yellow inline-flex min-h-11 items-center gap-2 px-3 outline-none focus-visible:ring-4',
          { 'bg-paper text-blue': isActive('/saved/') },
        ]}
        href="/saved/"
        aria-current={pathname === '/saved/' ? 'page' : undefined}
      >
        My plan
      </a>
    </li>
    <li class="hidden sm:block">
      <a
        class:list={[
          'focus-visible:ring-yellow inline-flex min-h-11 items-center px-3 outline-none focus-visible:ring-4',
          { 'bg-paper text-blue': isActive('/about/') },
        ]}
        href="/about/"
        aria-current={pathname === '/about/' ? 'page' : undefined}
      >
        About
      </a>
    </li>
  </ul>
</nav>
```

Astro's `class:list` directive combines the shared class string with an object of conditional classes. Active sections receive a paper background and blue text.

`aria-current="page"` is stricter than the visual section state. Set it only when the current pathname exactly matches the link. On a future event detail route, the Events link will still look active without claiming to be the current page.

The About link is hidden below the `sm` breakpoint so the two primary task links retain enough room. It remains available in the footer.

The saved-plan section will add the count island after it creates the component and the content helper that supplies valid event IDs.

## Create the footer

Create `src/components/layout/SiteFooter.astro`:

```astro
<footer class="bg-ink text-paper border-ink border-t-2">
  <div
    class="mx-auto grid max-w-[90rem] gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1fr_auto] md:items-end lg:px-10"
  >
    <div>
      <p class="font-display text-yellow text-4xl leading-none uppercase">
        Go do something.
      </p>
      <p
        class="mt-3 max-w-lg text-sm leading-relaxed text-[oklch(0.82_0.015_250)]"
      >
        A fictional Memphis weekend guide built to teach Astro. Event details
        are sample content created for the course.
      </p>
    </div>
    <nav aria-label="Footer navigation">
      <ul class="flex flex-wrap gap-x-5 gap-y-2 text-sm font-bold">
        <li><a class="hover:text-yellow underline-offset-4 hover:underline" href="/events/">Events</a></li>
        <li><a class="hover:text-yellow underline-offset-4 hover:underline" href="/about/">About</a></li>
      </ul>
    </nav>
  </div>
</footer>
```

The disclaimer is part of the product, not legal filler. It tells visitors that event details are sample course data. The named footer navigation gives assistive technology a way to distinguish it from the primary navigation.

## Connect both components to the layout

Now that both files exist, add their imports to `src/layouts/BaseLayout.astro`:

```astro
import SiteFooter from '../components/layout/SiteFooter.astro';
import SiteHeader from '../components/layout/SiteHeader.astro';
```

Place these lines below the existing global stylesheet import in the component script. Render `<SiteHeader />` immediately before `main` and `<SiteFooter />` immediately after it. The layout never had unresolved imports, and it gains the full frame only after both dependencies exist.

## Verification

Run `pnpm dev` and visit `/`, `/events/`, `/saved/`, and `/about/`. Confirm the corresponding header section changes color.

Resize below and above the `sm` breakpoint. The About link should disappear from the header at the narrow size while remaining in the footer. Tab through every link and confirm the focus rings remain visible.

Run `pnpm check` and `pnpm build`. Both should complete without unresolved imports or missing-route links in the shared navigation.

## Exercise

Add a temporary nested page under `/about/team/` and inspect the header. The About link should receive its active visual classes because `isActive('/about/')` uses a prefix match. Explain why the home link cannot use the same rule: every pathname starts with `/`.
