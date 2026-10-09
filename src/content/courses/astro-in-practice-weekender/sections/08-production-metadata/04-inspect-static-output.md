---
slug: inspect-static-output
title: Inspect the Static Output
moduleSlug: production-metadata
moduleTitle: "Add Production Metadata and Discovery"
moduleOrder: 8
lessonOrder: 4
published: true
duration: "10 minutes"
summary: Inspect dist for generated routes, endpoint files, metadata, client islands, optimized assets, RSS, and sitemap output.
resources:
  - https://docs.astro.build/en/basics/building-sites/
---

# Inspect the Static Output

## Outcome

You will inspect `dist/` as the artifact that a static host receives. You will verify route HTML, RSS, sitemap files, optimized assets, and the JavaScript emitted for React islands.

A passing build means generation completed. Inspecting output answers a different question: did the build produce the files and URLs the deployment needs?

## Build with the public origin

Remove any old output by letting Astro replace it, then build:

```sh
SITE_URL=https://events.example.com pnpm build
```

Astro writes the complete static site to `dist/`. The directory should contain route folders such as `events/riverfront-sunset-sessions/index.html`, endpoint files such as `rss.xml`, and hashed assets under `_astro/`.

`dist/` is generated output. Do not edit it. Fix source or configuration and rebuild.

## Check required files

Run these exact shell checks from the project root:

```sh
test -f dist/index.html
test -f dist/about/index.html
test -f dist/events/index.html
test -f dist/events/riverfront-sunset-sessions/index.html
test -f dist/saved/index.html
test -f dist/rss.xml
test -f dist/sitemap-index.xml
```

No output means every assertion succeeded. A nonzero exit status identifies a missing build artifact before upload.

The sitemap integration may split route records into one or more child files. The index is the stable discovery entry point and links to the generated child files.

## Inspect HTML and XML

Use targeted searches rather than reading minified files from top to bottom:

```sh
grep -n "canonical\|og:image\|rss.xml" dist/events/riverfront-sunset-sessions/index.html
grep -n "riverfront-sunset-sessions" dist/rss.xml
sitemap_child=$(
  awk '
    match($0, /<loc>[^<]+<\/loc>/) {
      child = substr($0, RSTART + 5, RLENGTH - 11)
      sub(/^.*\//, "", child)
      print child
      exit
    }
  ' dist/sitemap-index.xml
)
test -n "$sitemap_child"
test -f "dist/$sitemap_child"
grep -n "events.example.com" "dist/$sitemap_child"
```

The event HTML should contain absolute canonical, social image, and RSS URLs. The feed and sitemap should point at generated event routes under the configured origin.

The `awk` check follows the first `<loc>` in `dist/sitemap-index.xml`, strips the URL to a filename, and checks that generated child. This is more portable than assuming an integration-specific filename. If the index contains multiple children, repeat the same check for each listed `<loc>` when you need complete coverage. Because `/saved/` is personalized, the recommended sitemap filter must keep that URL out of every generated sitemap file.

## Identify static and hydrated UI

Open `dist/events/index.html`. The event content should already be present because Astro rendered the React explorer during the build. Hashed scripts under `dist/_astro/` hydrate filtering and saved state in the browser.

This is progressive enhancement, not an empty client-rendered shell. Search engines and no-script clients receive headings, event links, and content. Browser JavaScript adds filter history and saved-event behavior.

The saved page is different in one important way. Its personalized list comes from browser storage, so static HTML contains the route shell and the React island's empty initial state. Hydration replaces that state with the current browser's plan.

## Check optimized and lazy-loaded images

Generated event HTML should contain responsive image attributes and hashed asset paths from Astro's image pipeline. Explorer image elements keep their explicit `loading` values: the first two use `eager`, and later images use `lazy`.

The `loading` attribute is only a browser request hint. Section 9 will use Playwright to scroll a deferred image into view and confirm it has a nonzero `naturalWidth`.

## Serve the exact artifact

Run:

```sh
pnpm preview
```

Preview serves `dist/`; it does not rebuild source files. Use it to test the artifact after every production build. If you change source, stop preview, rebuild, and start preview again.

## Runnable checkpoint

Run the section checkpoint:

```sh
SITE_URL=https://events.example.com pnpm check
SITE_URL=https://events.example.com pnpm build
test -f dist/rss.xml
test -f dist/sitemap-index.xml
grep -q "https://events.example.com" dist/rss.xml
sitemap_child=$(awk '
  match($0, /<loc>[^<]+<\/loc>/) {
    child = substr($0, RSTART + 5, RLENGTH - 11)
    sub(/^.*\//, "", child)
    print child
    exit
  }
' dist/sitemap-index.xml)
test -n "$sitemap_child"
test -f "dist/$sitemap_child"
grep -q "https://events.example.com" "dist/$sitemap_child"
if grep -R -q "https://events.example.com/saved/" dist/sitemap*.xml; then
  printf 'Saved plan must not appear in sitemap XML\n' >&2
  exit 1
fi
pnpm preview
```

The shell checks must exit successfully. In preview, `/`, `/events/`, `/saved/`, `/rss.xml`, and `/sitemap-index.xml` must respond. View an event page source and confirm it contains static event content plus absolute canonical, social image, and RSS discovery URLs. View `/saved/` and confirm its robots metadata is `noindex, follow`. Then confirm the sitemap files do not contain `https://events.example.com/saved/`.
