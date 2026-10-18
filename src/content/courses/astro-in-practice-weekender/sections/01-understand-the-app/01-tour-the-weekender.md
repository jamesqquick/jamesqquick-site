---
slug: tour-the-weekender
title: Tour The Weekender
moduleSlug: understand-the-app
moduleTitle: "Understand the Finished App"
moduleOrder: 1
lessonOrder: 1
published: true
duration: "8 minutes"
summary: Tour the finished Weekender site and connect each visitor-facing feature to the Astro course ahead.
resources:
  - https://docs.astro.build/en/concepts/why-astro/
---

# Tour The Weekender

## Goal

In this lesson, you will inspect the finished Weekender application as a user. The goal is not to understand every implementation detail yet. You need a clear picture of what the project does so each later file and API has a reason to exist.

The Weekender is a fictional guide to eight Memphis events scheduled for September 4 through 6, 2026. The data is course content, not a live event feed. The application helps a visitor browse the weekend, narrow the list, save interesting events, and review a personal plan.

## Use the finished-app tour

Use the course screenshots and route descriptions in this lesson as your tour. You do not need starter code or a separate repository yet. Section 2 creates the project from an empty Astro scaffold, and every later checkpoint uses files you have already built.

As you read, separate what the visitor sees from what the browser must calculate. That distinction will guide the Astro and React split.

## Read the home page as an editor

The home page at `/` has four distinct jobs.

First, the editorial hero explains the scope immediately: one city, one weekend, and eight events. It offers direct paths to the full directory and the saved plan. The page does not begin with filters because its job is orientation, not search.

Second, an editor's pick gives one featured event more visual weight. Three additional featured events appear below it. This hierarchy lets the site recommend a starting point while still giving the visitor options.

Third, category links summarize the available event types. The finished data set uses music, food, family, market, and outdoors categories. Each category link points to a statically generated route such as `/categories/music/`.

Finally, the saved-plan callout explains that selections stay in the current browser. The project has no account system or database. That constraint matters because it determines where saved state lives and what the interface can promise.

## Explore the event directory

The planned `/events/` page begins as normal HTML with all eight events available. A React-powered explorer then provides these controls:

- Text search
- Day selection for Friday, Saturday, or Sunday
- Category selection
- A free-events-only option
- An accessibility-details option

The selected filters are encoded in the query string. This means a visitor can reload the page and retain the same state because the React component reads the URL when it loads.

This is a useful product choice, not only a technical detail. A filtered view can be bookmarked, shared, and restored with the Back and Forward buttons.

A combination that produces no results replaces the grid with a specific empty state and a button that restores all events. After reset, focus moves to the results heading. That focus change helps keyboard and screen-reader users understand that the results changed.

## Follow the static routes

An event detail route contains the event image, date, time, cost, venue, description, schedule, and accessibility notes. It also links to its venue and to other events in the same category.

The venue route shows its address, accessibility information, optional external website, prose description, and all events assigned to that venue.

These pages look dynamic because their content changes by URL, but the finished project builds them ahead of time. It uses Astro's static output mode, so event, venue, and category paths are generated from known content during `pnpm build`.

## Build a saved plan

Saving an event from the directory updates its detail-page button and the count in the header.

The `/saved/` page groups events by Friday, Saturday, and Sunday. Selections survive reloads, and removing an event updates save buttons elsewhere in the application.

The finished application stores event IDs in `localStorage`. It also dispatches a custom browser event so separate React islands can synchronize without placing the whole application inside one React root.

## Check responsive and keyboard behavior

The narrow-screen design changes multi-column layouts into single-column layouts and hides the About navigation item to preserve room for the primary actions. Header links, event cards, filters, and the saved plan remain usable without horizontal scrolling.

The keyboard design exposes a skip link when it receives focus and moves focus to the main content when activated. Interactive controls use visible focus rings, and save or filter buttons expose their pressed state to assistive technology.

## Checkpoint

You should now be able to describe the finished application in one sentence: The Weekender is a statically generated Astro event guide with focused React islands for filtering and browser-local saved plans.

You should also know the planned public routes: `/`, `/events/`, `/events/[id]/`, `/categories/[category]/`, `/venues/[id]/`, `/saved/`, and `/about/`. This is a map of the finished application, not a set of routes that exists before you scaffold the project.

## Reflection

Choose one feature and name the smallest part of the page that must run JavaScript in the browser. For example, filtering needs browser state, but the event heading and page description do not. This distinction is the basis of Astro's island architecture, which you will examine later in this section.
