---
slug: unit-component-tests
title: Write Unit and Component Tests
moduleSlug: validate-and-ship
moduleTitle: "Validate and Ship the Site"
moduleOrder: 9
lessonOrder: 2
published: true
duration: "17 minutes"
summary: Test event explorer behavior, saved state, stale-ID pruning, chronological rendering, and focus restoration with Testing Library.
resources:
  - https://testing-library.com/docs/react-testing-library/intro/
  - https://testing-library.com/docs/user-event/intro/
  - https://vitest.dev/api/
---

# Write Unit and Component Tests

## Outcome

You will add component tests around the two stateful workflows. The event explorer test will cover filtering and accessible save state. The saved plan test will cover stale-ID pruning, chronological order, removal, and focus restoration.

The storage and filter tests from earlier sections already protect pure rules. Component tests should prove that React connects those rules to controls and rendered output, not repeat every pure input combination.

## Keep visual timing deterministic

The Vitest configuration from the previous lesson must use visual jsdom:

```ts
export default getViteConfig({
  test: {
    environment: "jsdom",
    environmentOptions: {
      jsdom: {
        url: "http://localhost/",
        pretendToBeVisual: true,
      },
    },
    setupFiles: ["./tests/setup/vitest.ts"],
  },
});
```

`SavedPlan` calls `requestAnimationFrame()` after a remove or clear action. `pretendToBeVisual: true` gives jsdom the browser-like animation-frame API that makes those focus tests deterministic. The test still waits for the focused element because the callback runs after React updates the DOM.

## Test the event explorer

Create `tests/unit/event-explorer.test.tsx`. Start with two event summaries:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { EventExplorer } from "../../src/components/events/EventExplorer";
import type { EventSummary } from "../../src/lib/events";

const events: EventSummary[] = [
  {
    id: "riverfront",
    title: "Riverfront Sunset Sessions",
    description: "Free music by the river.",
    start: "2026-09-04T19:00:00-05:00",
    end: "2026-09-04T22:00:00-05:00",
    day: "friday",
    category: "music",
    categoryLabel: "Live music",
    price: 0,
    venueName: "Tom Lee Park",
    neighborhood: "Downtown",
    imageSrc: "/riverfront.svg",
    imageAlt: "Sunset illustration.",
    accessibility: ["Wheelchair accessible"],
  },
  {
    id: "makers",
    title: "Makers Morning",
    description: "Local art and vintage finds.",
    start: "2026-09-05T10:00:00-05:00",
    end: "2026-09-05T14:00:00-05:00",
    day: "saturday",
    category: "market",
    categoryLabel: "Markets",
    price: 5,
    venueName: "Community Yard",
    neighborhood: "Cooper-Young",
    imageSrc: "/makers.svg",
    imageAlt: "Market illustration.",
    accessibility: [],
  },
];
```

Add the two reference EventExplorer tests and a small envelope helper:

```tsx
describe("EventExplorer", () => {
  it("filters events and exposes a useful empty state", async () => {
    const user = userEvent.setup();
    render(<EventExplorer events={events} />);

    await user.type(screen.getByRole("searchbox"), "river");
    expect(
      await screen.findByRole("heading", {
        name: "Riverfront Sunset Sessions",
      })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Makers Morning" })
    ).not.toBeInTheDocument();

    await user.clear(screen.getByRole("searchbox"));
    await user.type(screen.getByRole("searchbox"), "basketball");
    expect(
      await screen.findByRole("heading", {
        name: "No events match those filters",
      })
    ).toBeInTheDocument();
  });

  it("toggles a saved event with an accessible pressed state", async () => {
    const user = userEvent.setup();
    render(<EventExplorer events={events} />);

    const saveButton = screen.getByRole("button", {
      name: "Save Riverfront Sunset Sessions",
    });
    await user.click(saveButton);

    expect(saveButton).toHaveAttribute("aria-pressed", "true");
    expect(readSavedEnvelope()).toEqual({
      version: 1,
      eventIds: ["riverfront"],
    });
  });
});

function readSavedEnvelope() {
  const value = window.localStorage.getItem("weekender:saved-events");
  return value ? JSON.parse(value) : null;
}
```

Queries use roles and accessible names because those are the contracts visitors use. The saved-state assertion also checks the storage boundary, including the envelope version.

## Test the saved plan

Create `tests/unit/saved-plan.test.tsx` with two Friday events intentionally provided in chronological order but saved in reverse order:

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { SavedPlan } from "../../src/components/events/SavedPlan";
import type { EventSummary } from "../../src/lib/events";

const events: EventSummary[] = [
  {
    id: "riverfront",
    title: "Riverfront Sunset Sessions",
    description: "Free music by the river.",
    start: "2026-09-04T19:00:00-05:00",
    end: "2026-09-04T22:00:00-05:00",
    day: "friday",
    category: "music",
    categoryLabel: "Live music",
    price: 0,
    venueName: "Tom Lee Park",
    neighborhood: "Downtown",
    imageSrc: "/riverfront.svg",
    imageAlt: "Sunset illustration.",
    accessibility: ["Wheelchair accessible"],
  },
  {
    id: "late-show",
    title: "Late Show",
    description: "A late concert.",
    start: "2026-09-04T23:00:00-05:00",
    day: "friday",
    category: "music",
    categoryLabel: "Live music",
    price: 10,
    venueName: "Crosstown Theater",
    neighborhood: "Crosstown",
    imageSrc: "/late-show.svg",
    imageAlt: "Concert illustration.",
    accessibility: [],
  },
];
```

Add the test:

```tsx
describe("SavedPlan", () => {
  it("prunes stale IDs, sorts events, and restores focus after removals", async () => {
    const user = userEvent.setup();
    window.localStorage.setItem(
      "weekender:saved-events",
      JSON.stringify({
        version: 1,
        eventIds: ["late-show", "missing-event", "riverfront"],
      })
    );
    render(<SavedPlan events={events} />);

    await waitFor(() => {
      expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(2);
    });
    expect(
      screen
        .getAllByRole("heading", { level: 3 })
        .map(({ textContent }) => textContent?.trim())
    ).toEqual(["Riverfront Sunset Sessions", "Late Show"]);
    expect(readSavedEnvelope()).toEqual({
      version: 1,
      eventIds: ["late-show", "riverfront"],
    });

    await user.click(
      screen.getByRole("button", {
        name: "Remove Riverfront Sunset Sessions",
      })
    );
    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Remove Late Show" })
      ).toHaveFocus();
    });

    await user.click(screen.getByRole("button", { name: "Remove Late Show" }));
    await waitFor(() => {
      expect(
        screen.getByRole("link", { name: "Browse the lineup" })
      ).toHaveFocus();
    });
  });
});

function readSavedEnvelope() {
  const value = window.localStorage.getItem("weekender:saved-events");
  return value ? JSON.parse(value) : null;
}
```

The headings prove chronological display rather than save order. The repaired envelope proves stale IDs are removed from storage, not merely hidden. The focus assertions wait for React's update and the component's animation-frame callback.

## Keep URL rules in pure tests

The final `tests/unit/event-filters.test.ts` from section 6 should match the five test cases in the reference suite: three filter cases and two query-parameter cases. Do not move `popstate` into jsdom component tests. Browser history navigation is more reliable in Playwright, where Back and Forward behave like the shipped browser.

## Runnable checkpoint

Run:

```sh
pnpm format
SITE_URL=https://events.example.com pnpm test
SITE_URL=https://events.example.com pnpm lint
SITE_URL=https://events.example.com pnpm check
```

Vitest should report five filter tests, five storage tests, two EventExplorer tests, and one SavedPlan test, for 13 unit tests total. No test should depend on execution order. Run `pnpm test` a second time to confirm the setup resets DOM, local storage, and history between cases.
