---
slug: content-collections-basics
title: Content Collections Basics
moduleSlug: content-and-routing
moduleTitle: Content and Routing
moduleOrder: 2
lessonOrder: 1
published: true
duration: "16m"
summary: Understand schema validation and content querying with Astro collections.
videoId: ""
transcript: ""
resources:
  - title: Content collections guide
    href: https://docs.astro.build/en/guides/content-collections/
---

## Why content collections matter

When you scale beyond a handful of pages, content becomes a data problem:

- consistent metadata
- predictable ordering
- navigation generation
- safe evolution as requirements change

Astro content collections solve that by combining:

- filesystem-based content
- schema-based validation (via frontmatter)
- typed access at build time

## What you'll do in this lesson

- Define a schema for the data you want to rely on
- Query entries for navigation (course -> module -> lesson)
- Sort entries using stable ordering fields

