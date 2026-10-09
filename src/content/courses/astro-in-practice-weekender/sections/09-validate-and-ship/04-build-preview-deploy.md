---
slug: build-preview-deploy
title: Build, Preview, and Deploy the Site
moduleSlug: validate-and-ship
moduleTitle: "Validate and Ship the Site"
moduleOrder: 9
lessonOrder: 4
published: true
duration: "12 minutes"
summary: Run the complete validation gate, preview the static artifact, and deploy dist to any static host with SITE_URL configured.
resources:
  - https://docs.astro.build/en/guides/deploy/
  - https://docs.astro.build/en/reference/cli-reference/#astro-preview
---

# Build, Preview, and Deploy the Site

## Outcome

You will run the complete quality gate, inspect the final preview, and prepare the static `dist/` directory for a host-neutral deployment.

The application needs no server runtime. Astro generates pages, RSS, sitemap files, optimized assets, and React island bundles ahead of time. Any static host that can serve directories and files can publish the artifact.

## Set the production origin

Choose the exact public origin before the production build:

```sh
export SITE_URL=https://events.example.com
```

Replace the example with the deployed site's real origin. `SITE_URL` affects canonical links, social images, RSS links, and sitemap records. If it is missing, the reference configuration falls back to a reserved example domain for local convenience. A deployment with that fallback is misconfigured even if the build succeeds.

Keep the environment value in the deployment system or shell. Do not hardcode a provider URL in source, and do not add provider-specific files unless the chosen host requires them.

## Run the full gate

Run:

```sh
pnpm validate
```

The script runs these checks in order:

1. `pnpm format:check`
2. `pnpm lint`
3. `pnpm check`
4. `pnpm test`
5. `pnpm test:e2e`

The E2E script builds again before Playwright starts preview. That repetition is intentional. Browser tests should always run against output produced from the current source and environment.

If formatting fails, run `pnpm format`, inspect the changes, and run `pnpm validate` again. Do not skip a failing stage to produce a release artifact.

## Preview the final artifact

After validation, build once with the current production origin and start preview:

```sh
pnpm build
pnpm preview --host 127.0.0.1
```

Preview serves `dist/` exactly as generated. Complete this short release pass:

1. Open `/` and follow the primary event link.
2. Filter events, then use browser Back and Forward.
3. Save events from a detail page and the explorer.
4. Open `/saved/`, remove one item, clear the rest, and check focus.
5. Reload to confirm saved state persistence.
6. Open `/rss.xml` and `/sitemap-index.xml`.
7. Inspect one event head for the production canonical and social image origin.
8. Resize from a narrow mobile viewport to a wide desktop viewport.
9. Confirm `/saved/` has `noindex, follow` metadata and does not appear in sitemap XML.

Automated tests cover these behaviors, but a short preview pass can catch deployment-input mistakes such as the wrong `SITE_URL` or missing environment settings.

## Understand the deployment artifact

Upload the contents of `dist/` to the static host. The important mapping is simple:

```text
dist/index.html                              -> /
dist/events/index.html                       -> /events/
dist/events/<event-id>/index.html            -> /events/<event-id>/
dist/saved/index.html                        -> /saved/
dist/rss.xml                                 -> /rss.xml
dist/sitemap-index.xml                       -> /sitemap-index.xml
dist/_astro/*                                -> hashed CSS, JS, fonts, and images
```

The host should preserve nested `index.html` routing and serve XML files with normal static-file behavior. No rewrite to one SPA entry point is needed because Astro generated each route.

The sitemap intentionally excludes `/saved/`. That route is a personalized browser-local plan, not a public content document. The `noindex, follow` robots metadata is a second line of defense if someone reaches the page directly.

Saved plans remain browser-local after deployment. They are not part of `dist/`, do not require a database, and do not follow a visitor between browsers. If storage is denied, the in-memory fallback lasts only until the loaded page is closed or reloaded.

## Verify the deployed result

After upload, request the public routes directly rather than relying only on client navigation:

```sh
curl --fail --location "$SITE_URL/"
curl --fail --location "$SITE_URL/events/"
curl --fail --location "$SITE_URL/saved/"
curl --fail --location "$SITE_URL/rss.xml"
curl --fail --location "$SITE_URL/sitemap-index.xml"
```

Then view the public page source and confirm canonical, Open Graph, RSS, and sitemap URLs use the same origin as `SITE_URL`.

The deployment target may add caching or compression, but those settings are outside this project because the reference app does not include host-specific configuration.

## Runnable checkpoint

Run the final course checkpoint with the real public origin:

```sh
export SITE_URL=https://events.example.com
pnpm format:check
pnpm lint
pnpm check
pnpm test
pnpm test:e2e
pnpm build
test -f dist/index.html
test -f dist/rss.xml
test -f dist/sitemap-index.xml
grep -q "$SITE_URL" dist/rss.xml
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
grep -q "$SITE_URL" "dist/$sitemap_child"
if grep -R -q "$SITE_URL/saved/" dist/sitemap*.xml; then
  printf 'Saved plan must not appear in sitemap XML\n' >&2
  exit 1
fi
pnpm preview --host 127.0.0.1
```

Replace the example origin before a real deployment. Every command before preview must exit successfully. The preview must support desktop and mobile navigation, URL history, save and remove controls, synchronized counts, Friday-to-Sunday grouping, clearing with focus restoration, RSS, sitemap discovery, and direct loading of every generated route. Deploy only the resulting `dist/` contents to the chosen static host.
