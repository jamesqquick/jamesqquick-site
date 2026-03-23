---
slug: your-first-astro-page
title: Your First Astro Page
moduleSlug: foundations
moduleTitle: Foundations
moduleOrder: 1
lessonOrder: 2
published: true
duration: "14m"
summary: Create a page and understand layout composition in Astro.
videoId: ""
transcript: ""
resources:
  - title: Astro Pages docs
    href: https://docs.astro.build/en/core-concepts/astro-pages/
---

## Build a page

In Astro, a "page" is just a file that exports a component and gets rendered into HTML.

Typical workflow:

1. Create a new page file
2. Compose it with layouts/components
3. Add frontmatter metadata for SEO/feeds (when needed)

## Layout composition (mental model)

Think in terms of:

- Layouts: shared shell (header/footer/SEO defaults)
- Pages: the specific content for a route
- Components: reusable UI building blocks

## Practice

- Create a simple page
- Reuse a layout
- Confirm the output in `astro dev`

