# jamesqquick.com

James Quick's personal site, built with Astro 7 and Cloudflare Workers. EmDash serves the server-rendered blog. Astro content collections power the courses, talks, and testimonials.

## Requirements

- Node.js 22, as specified in `.nvmrc`
- pnpm 9.12.0, as specified in `package.json`

## Local development

```sh
pnpm install
pnpm exec wrangler types --include-runtime=false
pnpm dev
```

Astro starts at `http://localhost:4355`. Cloudflare bindings are configured in `wrangler.jsonc`.

To test the built Worker with local bindings, run:

```sh
pnpm preview
```

`pnpm preview` builds the `preview` environment and starts the Worker at `http://localhost:4355` using local bindings.

## Checks

```sh
pnpm exec wrangler types --include-runtime=false
pnpm exec astro check
pnpm exec tsc --project scripts/tsconfig.json
pnpm exec tsx --test tests/blog-*.test.ts
pnpm build
```

## Blog

Published posts come from EmDash. The site serves the listing at `/blog`, post pages at `/blog/{slug}`, the RSS feed at `/rss.xml`, and the blog sitemap at `/sitemap-blog.xml`.

`/robots.txt` advertises `/sitemap-index.xml`, the Astro index for the blog and static-page sitemaps. EmDash's `/sitemap.xml` remains its own blog sitemap endpoint.

`src/data/blog` is the source archive used by the import and cover-generation scripts. Preview blog pages read from EmDash, not that archive. To inspect an import without writing to the CMS, run:

```sh
pnpm exec tsx --tsconfig scripts/tsconfig.json scripts/import-blog.ts --dry-run
```

The cover generator also supports a no-write check:

```sh
pnpm gen-covers --dry-run
```
