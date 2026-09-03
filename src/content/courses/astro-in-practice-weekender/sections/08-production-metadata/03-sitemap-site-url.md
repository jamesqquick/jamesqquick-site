---
slug: sitemap-site-url
title: Generate a Sitemap and Configure SITE_URL
moduleSlug: production-metadata
moduleTitle: "Add Production Metadata and Discovery"
moduleOrder: 8
lessonOrder: 3
published: true
duration: "16 minutes"
summary: Validate the public site origin, generate a sitemap, and build absolute canonical, social, and feed URLs.
resources:
  - https://docs.astro.build/en/reference/configuration-reference/#site
  - https://docs.astro.build/en/guides/integrations-guide/sitemap/
---

# Generate a Sitemap and Configure SITE_URL

## Outcome

You will make the public origin an explicit build input, add Astro's sitemap integration, and use the configured origin for canonical, social image, RSS discovery, and feed item URLs.

Static HTML cannot discover its final host after deployment. The build must know the public origin. `SITE_URL` provides that value without tying the project to a hosting vendor.

## Install the sitemap integration

Run:

```sh
pnpm add @astrojs/sitemap@^3.7.4
```

The integration reads generated routes and writes sitemap files during `astro build`. It needs Astro's `site` setting to create absolute URLs.

## Validate the environment value

Replace `astro.config.mjs` with the reference configuration, then add the course hardening checks shown below:

```js
// @ts-check
import { defineConfig } from "astro/config";

import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import sitemap from "@astrojs/sitemap";

class InvalidSiteUrlError extends Error {
  /** @param {string} siteUrl */
  constructor(siteUrl) {
    super(
      `SITE_URL must be an absolute HTTP(S) public origin with no path, query, hash, username, or password: ${siteUrl}`
    );
    this.name = "InvalidSiteUrlError";
  }
}

const site = process.env.SITE_URL ?? "https://weekender.example.com";

try {
  const siteUrl = new URL(site);
  const hasForbiddenOriginParts =
    !["http:", "https:"].includes(siteUrl.protocol) ||
    !/^[a-z][a-z\d+.-]*:\/\/[^/?#]+\/?(?:[?#]|$)/i.test(site) ||
    siteUrl.pathname !== "/" ||
    siteUrl.search !== "" ||
    siteUrl.hash !== "" ||
    siteUrl.username !== "" ||
    siteUrl.password !== "" ||
    site.includes("?") ||
    site.includes("#") ||
    site.includes("@");

  if (hasForbiddenOriginParts) {
    throw new InvalidSiteUrlError(site);
  }
} catch (error) {
  if (error instanceof InvalidSiteUrlError) throw error;
  throw new InvalidSiteUrlError(site);
}

export default defineConfig({
  site,
  output: "static",
  integrations: [
    react(),
    sitemap({
      filter: (page) => !new URL(page).pathname.startsWith("/saved/"),
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
```

The fallback uses a reserved example domain so a local build remains possible. It must never be treated as the deployed origin. Set `SITE_URL` for preview checks, CI, and every production build.

The reference configuration's original check only validates the protocol. The stricter check above is the course hardening implementation: it also rejects any path other than `/`, query string, hash, username, or password. The raw delimiter checks reject even empty `?` and `#` suffixes that `URL` normalizes away. The reserved fallback is still accepted for local builds; this config does not reject that fallback as a production value, so deployment systems must set `SITE_URL` explicitly.

Use the actual build to exercise the strict validator. The first value is valid; every later value must fail before Astro generates the site:

```sh
SITE_URL=https://events.example.com pnpm build

for invalid_site_url in \
  not-a-url \
  file:///tmp/site \
  https://events.example.com/events \
  https://events.example.com/.. \
  'https://events.example.com/?preview=1' \
  'https://events.example.com/#top' \
  'https://reader:secret@events.example.com/'
do
  if SITE_URL="$invalid_site_url" pnpm build; then
    printf 'Expected SITE_URL validation to reject %s\n' "$invalid_site_url" >&2
    exit 1
  fi
done
```

The named error tells the person running the build which input is wrong. A missing scheme, `file:` URL, path, query, hash, or credential should all produce the same validation failure.

## Make layout URLs absolute

In `src/layouts/BaseLayout.astro`, add these values after `pageTitle`:

```ts
const canonicalUrl = new URL(Astro.url.pathname, Astro.site);
const socialImage = new URL(image, Astro.site);
const isSavedPage = Astro.url.pathname === "/saved/";
```

Then update the head:

```diff
+<link rel="canonical" href={canonicalUrl} />
 <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
 <link
   rel="alternate"
   type="application/rss+xml"
   title="The Weekender event feed"
-  href="/rss.xml"
+  href={new URL('/rss.xml', Astro.site)}
 />
```

Replace the social image fields and add the page URL:

```astro
<meta property="og:url" content={canonicalUrl} />
<meta property="og:image" content={socialImage} />
<meta name="twitter:image" content={socialImage} />
<meta name="robots" content={isSavedPage ? 'noindex, follow' : 'index, follow'} />
```

Keep the existing title, description, type, and card fields. `new URL()` handles leading slashes and produces one normalized absolute URL.

The canonical uses only `Astro.url.pathname`. Filter query strings represent states of the event explorer, not separate documents that should compete in search results.

The saved plan is browser-local and personalized, so add `noindex, follow` for `/saved/`. The reference demo currently includes `/saved/` in its sitemap because it uses `sitemap()` without a filter. Excluding the route is a course hardening change and is the recommended implementation here. The page remains directly reachable for visitors, but search engines should not index a personalized, empty-by-default document.

## Let the RSS route use Astro.site

The route already receives `site` from Astro and passes it to `rss()`. Once the config sets `site`, the fallback is no longer used. Keep the fallback because it makes the route independently safe if someone temporarily removes the config while experimenting.

## Build with a real origin

For local verification, use a neutral example origin:

```sh
SITE_URL=https://events.example.com pnpm build
```

For deployment, replace that value with the exact public origin, including `https://` and any required subdomain. Do not include a route path unless the entire site is intentionally hosted under that base path and the project is configured for it.

## Runnable checkpoint

Run:

```sh
SITE_URL=https://events.example.com pnpm check
SITE_URL=https://events.example.com pnpm build
grep -q 'noindex, follow' dist/saved/index.html
if grep -R -q 'https://events.example.com/saved/' dist/sitemap*.xml; then
  printf 'Saved plan must not appear in sitemap XML\n' >&2
  exit 1
fi
pnpm preview
```

Open `/sitemap-index.xml`, `/rss.xml`, and one event page. Every generated public URL must begin with `https://events.example.com`. Then run the invalid-origin smoke checks above. Each must fail with `SITE_URL must be an absolute HTTP(S) public origin with no path, query, hash, username, or password`. Open `/saved/` and confirm its document head contains `noindex, follow`. Confirm no generated sitemap file contains `https://events.example.com/saved/`. Restore a valid value before continuing.
