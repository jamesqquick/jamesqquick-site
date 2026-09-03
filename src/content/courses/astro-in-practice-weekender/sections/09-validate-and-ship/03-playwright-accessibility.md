---
slug: playwright-accessibility
title: Test Browser Journeys and Accessibility
moduleSlug: validate-and-ship
moduleTitle: "Validate and Ship the Site"
moduleOrder: 9
lessonOrder: 3
published: true
duration: "18 minutes"
summary: Test desktop and mobile routes, URL history, saved plans, denied storage, lazy images, feeds, and axe scans in Chromium.
resources:
  - https://playwright.dev/docs/writing-tests
  - https://playwright.dev/docs/emulation
  - https://playwright.dev/docs/accessibility-testing
---

# Test Browser Journeys and Accessibility

## Outcome

You will test the built site in desktop and mobile Chromium. The suite will cover navigation, URL and `popstate` behavior, saved-event persistence, storage denial, lazy images, static routes, feeds, and automated accessibility scans.

Playwright runs against `pnpm preview`, so these tests exercise generated HTML and production client bundles rather than the development server.

## Add an explicit hydration marker

The first browser interaction must wait for the React explorer to hydrate. A server-rendered `<select>` can exist before its React event handler is ready, so a test that calls `selectOption()` immediately after `goto()` can race the island.

Add a testability marker to `src/components/events/EventExplorer.tsx`. This is a small course change, not user-facing content. Add state beside the existing filter state:

```tsx
const [filters, setFilters] = useState(DEFAULT_FILTERS);
const [isReady, setIsReady] = useState(false);
```

Use the existing URL synchronization effect and set the marker after its initial synchronization:

```tsx
useEffect(() => {
  const syncFromUrl = () => {
    const next = filtersFromSearchParams(new URLSearchParams(location.search));
    filtersRef.current = next;
    setFilters(next);
  };

  syncFromUrl();
  setIsReady(true);
  window.addEventListener("popstate", syncFromUrl);
  return () => window.removeEventListener("popstate", syncFromUrl);
}, []);
```

Add the marker to the explorer's existing root `<div>` without changing its class list:

```tsx
return (
  <div
    className="grid gap-10 lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start"
    data-explorer-ready={isReady ? "true" : undefined}
  >
    {/* existing explorer markup */}
  </div>
);
```

The attribute is absent in server HTML and becomes `data-explorer-ready="true"` after the effect runs. It gives Playwright a stable readiness contract without adding a delay, changing layout, or exposing test copy to visitors.

## Add a save-button hydration marker

The event detail route also renders its save button in server HTML before the React handler hydrates. Add a separate testability marker to `src/components/events/SaveEventButton.tsx`. This is a course hardening change. The reference component currently has no readiness marker.

Update its import and add state beside the existing saved-state hook:

```tsx
import { useEffect, useState } from "react";

import { useSavedEvents } from "../../lib/use-saved-events";

// inside SaveEventButton
const { savedIds, toggle } = useSavedEvents();
const [isReady, setIsReady] = useState(false);

useEffect(() => {
  setIsReady(true);
}, []);
```

Add the marker to the existing button without changing its accessible name or `aria-pressed` behavior:

```tsx
<button
  aria-pressed={isSaved}
  data-save-event-ready={isReady ? "true" : undefined}
  onClick={() => toggle(eventId)}
  type="button"
>
  {/* existing accessible and visible label spans */}
</button>
```

Keep the component's existing `className`, label spans, and props around this focused excerpt. The attribute is absent during server rendering and appears after hydration, so it is a concrete readiness contract rather than a timing delay.

## Add a saved-plan hydration marker

The cross-page test must also wait for the saved-plan island to finish its initial storage read and listener setup. The empty-state heading is server-rendered HTML, so its presence proves only that the route responded. It is not a hydration signal.

Add state and an effect to `src/components/events/SavedPlan.tsx`. Declare the effect after the `useSavedEvents()` call. React runs the hook's storage effect first, then this component effect:

```tsx
import { useEffect, useRef, useState } from "react";

// inside SavedPlan
const [isReady, setIsReady] = useState(false);
const { savedIds, toggle, clear } = useSavedEvents(
  events.map((event) => event.id)
);

useEffect(() => {
  setIsReady(true);
}, []);
```

Add the same marker to both top-level `<section>` elements in the empty and populated return branches:

```tsx
<section data-saved-plan-ready={isReady ? "true" : undefined} ref={planRef}>
  {/* existing empty-state or populated-plan markup */}
</section>
```

The marker is absent from server HTML and becomes `data-saved-plan-ready="true"` only after the SavedPlan effect runs. This is a course hardening change. The reference component currently has no saved-plan readiness marker.

## Create the browser journey suite

Create `tests/e2e/app.spec.ts`. Define the generated detail routes first:

```ts
import { expect, test } from "@playwright/test";

const eventPaths = [
  "/events/cooper-young-makers-morning/",
  "/events/crosstown-rooftop-cinema/",
  "/events/edge-district-taco-trail/",
  "/events/overton-family-field-day/",
  "/events/riverfront-sunset-sessions/",
  "/events/shelby-farms-paddle-club/",
  "/events/south-main-night-market/",
  "/events/stax-soul-brunch/",
];

const venuePaths = [
  "/venues/cooper-young-community-yard/",
  "/venues/crosstown-theater/",
  "/venues/edge-motor-museum-plaza/",
  "/venues/overton-park-greensward/",
  "/venues/shelby-farms-boat-house/",
  "/venues/south-main-promenade/",
  "/venues/stax-museum-courtyard/",
  "/venues/tom-lee-park/",
];
```

These explicit arrays turn the authored content set into a route contract. If an ID changes, the test forces the route expectation to change with it.

## Test navigation, filters, and history

Add these tests:

```ts
test("home page leads into the event guide", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle(/The Weekender/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Eight events. One Memphis weekend."
  );
  await page.getByRole("link", { name: "Explore all 8 events" }).click();

  await expect(page).toHaveURL("/events/");
  await expect(page.locator("article")).toHaveCount(8);
});

test("filters events and restores choices with browser history", async ({
  page,
}) => {
  await page.goto("/events/?ref=course");

  await expect(page.locator('[data-explorer-ready="true"]')).toHaveCount(1);
  const category = page.getByRole("combobox", { name: "Category" });
  await category.selectOption("music");
  await expect(page.locator("article")).toHaveCount(2);
  await expect(page).toHaveURL(/ref=course.*category=music/);

  await category.selectOption("food");
  await expect(page.locator("article")).toHaveCount(2);
  await expect(page).toHaveURL(/category=food/);

  await page.goBack();
  await expect(category).toHaveValue("music");
  await expect(page.locator("article")).toHaveCount(2);
  await expect(page).toHaveURL(/ref=course.*category=music/);

  await page.goForward();
  await expect(category).toHaveValue("food");
  await expect(page).toHaveURL(/ref=course.*category=food/);
});

test("hydrates filters from a shared URL", async ({ page }) => {
  await page.goto("/events/?category=food&q=market");

  await expect(page.getByRole("combobox", { name: "Category" })).toHaveValue(
    "food"
  );
  await expect(
    page.getByRole("searchbox", { name: "Search events" })
  ).toHaveValue("market");
  await expect(page.locator("article")).toHaveCount(1);
  await expect(
    page.getByRole("heading", { name: "South Main Night Market" })
  ).toBeVisible();
});
```

The second test covers both serialization and the `popstate` listener. `ref=course` proves explorer updates preserve a query parameter they do not own.

## Test images and saved state

Continue the same file:

```ts
test("loads deferred event artwork when it enters the viewport", async ({
  page,
}) => {
  await page.goto("/events/");

  const staxCard = page.locator("article").filter({
    has: page.getByRole("heading", { name: "Stax Soul Brunch" }),
  });
  await expect(staxCard).toHaveCount(1);
  const deferredArtwork = staxCard.getByRole("img");
  await expect(deferredArtwork).toHaveCount(1);
  await deferredArtwork.scrollIntoViewIfNeeded();

  await expect(deferredArtwork).toBeVisible();
  await expect
    .poll(() =>
      deferredArtwork.evaluate(
        (image) => (image as HTMLImageElement).naturalWidth
      )
    )
    .toBeGreaterThan(0);
});

test("saves an event into a persistent weekend plan", async ({ page }) => {
  await page.goto("/events/riverfront-sunset-sessions/");

  const saveButton = page.getByRole("button", {
    name: "Save Riverfront Sunset Sessions",
  });
  await expect(saveButton).toHaveAttribute("data-save-event-ready", "true");
  await saveButton.click();
  await expect(
    page.getByRole("button", { name: "Remove Riverfront Sunset Sessions" })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /My plan 1 saved event/ })
  ).toBeVisible();

  await page.getByRole("link", { name: /My plan 1 saved event/ }).click();
  await expect(page).toHaveURL("/saved/");
  await expect(
    page.getByRole("heading", { name: "Riverfront Sunset Sessions" })
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Friday" })).toBeVisible();

  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Riverfront Sunset Sessions" })
  ).toBeVisible();

  await page.getByRole("button", { name: "Clear my plan" }).click();
  await expect(
    page.getByRole("heading", { name: "Your weekend is wide open" })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Browse the lineup" })
  ).toBeFocused();
});

test("keeps save controls usable when local storage is denied", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      get() {
        throw new DOMException("Access denied", "SecurityError");
      },
    });
  });
  const pageErrors: Error[] = [];
  page.on("pageerror", (error) => pageErrors.push(error));

  await page.goto("/events/riverfront-sunset-sessions/");
  const saveButton = page.getByRole("button", {
    name: "Save Riverfront Sunset Sessions",
  });
  await expect(saveButton).toHaveAttribute("data-save-event-ready", "true");
  await saveButton.click();

  await expect(
    page.getByRole("button", { name: "Remove Riverfront Sunset Sessions" })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: /My plan 1 saved event/ })
  ).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("syncs saved state between pages in one browser context", async ({
  context,
}) => {
  const eventPage = await context.newPage();
  const savedPage = await context.newPage();

  try {
    await eventPage.goto("/events/riverfront-sunset-sessions/");
    await savedPage.goto("/saved/");
    await expect(
      savedPage.locator('[data-saved-plan-ready="true"]')
    ).toHaveCount(1);
    await expect(
      savedPage.getByRole("heading", { name: "Your weekend is wide open" })
    ).toBeVisible();

    const saveButton = eventPage.getByRole("button", {
      name: "Save Riverfront Sunset Sessions",
    });
    await expect(saveButton).toHaveAttribute("data-save-event-ready", "true");
    await saveButton.click();

    await expect(
      savedPage.getByRole("heading", {
        name: "Riverfront Sunset Sessions",
      })
    ).toBeVisible();
    await expect(
      savedPage.getByRole("link", { name: /My plan 1 saved event/ })
    ).toBeVisible();

    await savedPage
      .getByRole("button", { name: "Remove Riverfront Sunset Sessions" })
      .click();
    await expect(
      eventPage.getByRole("button", {
        name: "Save Riverfront Sunset Sessions",
      })
    ).toBeVisible();
  } finally {
    await eventPage.close();
    await savedPage.close();
  }
});
```

Playwright runs these tests in both configured projects. The same save and filter journeys therefore execute at desktop and Pixel 7 sizes.

The two pages deliberately share the configured Playwright browser context, so they share the same origin storage area and inherit the active project's desktop or Pixel 7 settings. A write on one page emits the native `storage` event on the other page. The test checks both directions. The custom event remains necessary for separate React islands in one page because the native event does not fire in the document that performed the write.

## Test mobile navigation and generated routes

Finish `app.spec.ts`:

```ts
test("mobile layout retains navigation to every primary route", async ({
  page,
  isMobile,
}) => {
  test.skip(!isMobile, "This assertion targets the mobile breakpoint.");
  await page.goto("/");

  const primary = page.getByRole("navigation", {
    name: "Primary navigation",
  });
  await expect(
    primary.getByRole("link", { name: "Events", exact: true })
  ).toBeVisible();
  await expect(primary.getByRole("link", { name: /My plan/ })).toBeVisible();
  await expect(
    page
      .getByRole("navigation", { name: "Footer navigation" })
      .getByRole("link", { name: "About" })
  ).toBeVisible();
});

test("all authored static routes and feeds respond successfully", async ({
  request,
}) => {
  const paths = [
    "/",
    "/about/",
    "/events/",
    "/saved/",
    "/categories/family/",
    "/categories/food/",
    "/categories/market/",
    "/categories/music/",
    "/categories/outdoors/",
    "/rss.xml",
    "/sitemap-index.xml",
    ...eventPaths,
    ...venuePaths,
  ];

  for (const path of paths) {
    const response = await request.get(path);
    expect(response.ok(), `${path} should respond successfully`).toBe(true);
  }
});

test("renders the custom 404 with a recovery link", async ({
  page,
  request,
}) => {
  const response = await request.get("/events/not-a-real-event/");

  expect(response.status()).toBe(404);
  await page.goto("/events/not-a-real-event/");
  await expect(
    page.getByRole("heading", { name: "That plan fell through" })
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Browse events" })
  ).toHaveAttribute("href", "/events/");
});
```

Request-level route checks are faster and less brittle than opening every content page in a browser. The major user journeys still use `page`, where layout, hydration, and focus matter.

## Add axe scans

Create `tests/e2e/accessibility.spec.ts`:

```ts
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const pages = [
  { name: "home", path: "/" },
  { name: "event directory", path: "/events/" },
  { name: "event detail", path: "/events/riverfront-sunset-sessions/" },
  { name: "venue detail", path: "/venues/tom-lee-park/" },
  { name: "saved plan empty state", path: "/saved/" },
];

for (const route of pages) {
  test(`${route.name} has no automatically detectable accessibility violations`, async ({
    page,
  }) => {
    await page.goto(route.path);

    const results = await new AxeBuilder({ page }).analyze();

    expect(results.violations).toEqual([]);
  });
}
```

Axe catches many semantic, labeling, contrast, and document-structure problems. It cannot judge whether prose is clear or whether focus moves sensibly. Keep the explicit focus and navigation assertions alongside these scans.

The empty saved-plan route remains in the `pages` loop, so the default `Your weekend is wide open` state is still scanned. Add a second scan for the populated state so the Remove and Clear my plan controls are included:

```ts
test("populated saved plan has no automatically detectable accessibility violations", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      "weekender:saved-events",
      JSON.stringify(["riverfront-sunset-sessions"])
    );
  });
  await page.goto("/saved/");

  await expect(page.locator('[data-saved-plan-ready="true"]')).toHaveCount(1);
  await expect(
    page.getByRole("button", { name: "Remove Riverfront Sunset Sessions" })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Clear my plan" })
  ).toBeVisible();

  const results = await new AxeBuilder({ page }).analyze();

  expect(results.violations).toEqual([]);
});
```

Seed the real `weekender:saved-events` key before navigation, then wait for `data-saved-plan-ready="true"`. The scan therefore covers the populated plan, including its Remove and Clear my plan controls, instead of scanning only the server-rendered empty state.

## Runnable checkpoint

Run:

```sh
pnpm format
SITE_URL=https://events.example.com pnpm test:e2e
```

Playwright must build the site, start preview, and pass both the `chromium` and `mobile-chromium` projects. The report must include URL Back and Forward restoration, shared URL hydration, lazy image loading, persistent saved state, clear-focus behavior, denied storage, mobile navigation, every generated route, the custom 404 status/heading/recovery-link check, RSS, sitemap, and six axe scans: five empty/default routes plus the populated saved plan.
