---
slug: page-metadata
title: Add Page and Social Metadata
moduleSlug: production-metadata
moduleTitle: "Add Production Metadata and Discovery"
moduleOrder: 8
lessonOrder: 1
published: true
duration: "13 minutes"
summary: Extend the shared layout with a default social image and route-specific Open Graph and Twitter metadata.
resources:
  - https://docs.astro.build/en/guides/seo/
  - https://ogp.me/
---

# Add Page and Social Metadata

## Outcome

You will extend `BaseLayout.astro` with social image metadata and a default share image. Event detail pages will use their event artwork, while every other route will use the site default.

The layout already owns page titles and descriptions. Keeping the rest of the document metadata there gives every route one contract and prevents page templates from drifting apart.

## Create a default social image

Create `public/og-default.svg`:

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="oklch(0.49 0.2 265)" />
  <rect x="60" y="60" width="1080" height="510" fill="oklch(0.86 0.16 90)" stroke="oklch(0.19 0.025 250)" stroke-width="12" />
  <rect x="845" y="120" width="210" height="210" fill="oklch(0.62 0.22 32)" transform="rotate(7 950 225)" />
  <text x="105" y="220" fill="oklch(0.19 0.025 250)" font-family="sans-serif" font-size="64" font-weight="800">MEMPHIS / SEP 4-6</text>
  <text x="105" y="360" fill="oklch(0.19 0.025 250)" font-family="sans-serif" font-size="128" font-weight="900">THE WEEKENDER</text>
  <text x="105" y="465" fill="oklch(0.49 0.2 265)" font-family="sans-serif" font-size="58" font-weight="800">GO DO SOMETHING.</text>
</svg>
```

Files in `public/` keep their paths during the build, so this image will be available at `/og-default.svg`. SVG keeps this course asset readable and editable without adding a binary file.

## Extend the layout props

Update the props and destructuring in `src/layouts/BaseLayout.astro`:

```diff
 interface Props {
   title: string;
   description: string;
+  image?: string;
 }

-const { title, description } = Astro.props;
+const { title, description, image = '/og-default.svg' } = Astro.props;
```

`image` is optional because most routes should use one consistent site image. Event details can override it with the optimized event asset path already available in their content entry.

## Complete the social tags

Update the Open Graph and Twitter fields in the layout head:

```astro
<meta property="og:type" content="website" />
<meta property="og:title" content={pageTitle} />
<meta property="og:description" content={description} />
<meta property="og:image" content={image} />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={pageTitle} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image" content={image} />
```

The card changes from `summary` to `summary_large_image` because the new asset uses a wide 1200 by 630 canvas.

These image paths are relative for this intermediate checkpoint. The build has no configured production origin yet, so inventing one in the layout would produce incorrect URLs. Lesson 8.3 will configure `SITE_URL` and turn image, canonical, and feed links into absolute URLs.

## Use event artwork on detail pages

Update the existing `BaseLayout` call in `src/pages/events/[id].astro`:

```diff
 <BaseLayout
   title={event.data.title}
   description={event.data.description}
+  image={event.data.image.src}
 >
```

Astro's image pipeline has already resolved the imported content image. Passing its generated path avoids copying source image files into `public/`.

Do not add image props to every route. The default exists so ordinary pages need only a title and description.

## Inspect generated metadata

Build the site and open one generated event HTML file. The event title, description, and image path should appear in both Open Graph and Twitter tags. Open a non-event page and confirm it uses `/og-default.svg`.

Page metadata is generated HTML. It does not require a React component or client directive.

## Runnable checkpoint

Run:

```sh
pnpm check
pnpm build
pnpm preview
```

Open `/events/riverfront-sunset-sessions/` and inspect the document head. `og:title` must name the event, `twitter:card` must equal `summary_large_image`, and `og:image` must use the event image path. Open `/about/` and confirm `og:image` and `twitter:image` both use `/og-default.svg`. The paths will become absolute in lesson 8.3.
