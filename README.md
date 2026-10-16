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

## EmDash admin sign-in

Open `http://localhost:4355/_emdash/admin` and complete the setup wizard to create the first admin account. Existing CMS users can sign in with a passkey or choose **Sign in with email link** to request a magic link.

EmDash sends login emails through the `cloudflare-email` plugin and the `EMAIL` Worker binding, from `James Q Quick <login@jamesqquick.com>`.

### Email setup

1. [Onboard `jamesqquick.com` for Cloudflare Email Sending](https://developers.cloudflare.com/email-service/get-started/send-emails/). The sender domain must be accepted before real emails can be sent.
2. Confirm the Cloudflare email plugin is active under **Plugins**. EmDash enables newly configured native plugins automatically and selects the sole email provider.
3. Open **Settings > Email**, confirm `cloudflare-email` is selected, and use **Send test email** to verify delivery. Select it manually if another provider is already selected.
4. Sign out and request a magic link for an existing CMS user. Open the link and select **Continue** to sign in. Links expire after 15 minutes and can be used once.

`EMDASH_SITE_URL` in `wrangler.jsonc` controls the origin used in login links. Development and local preview use `http://localhost:4355`; production uses `https://jamesqquick.com`. Set a hosted preview's value to its own HTTPS origin before deploying it.

### Local email testing

`pnpm dev` and `pnpm preview` simulate email delivery. The terminal logs the sender, recipient, and paths to the captured email content. Open the reported text file and copy the login link to complete the flow locally.

Development and preview have separate local databases, so complete setup for each one you test. EmDash applies pending core migrations when it initializes the database.

Use **Send test email** to investigate delivery failures. Magic-link requests return a generic response for unknown accounts and delivery failures.

## Checks

On a fresh checkout, run `pnpm dev` and wait for `Generated emdash-env.d.ts` before running checks. EmDash generates these ignored schema types from the local database.

```sh
mkdir -p tmp
pnpm exec wrangler types --include-runtime=false
pnpm exec astro check
pnpm exec tsc --project scripts/tsconfig.json
pnpm exec tsx --test tests/blog-*.test.ts
pnpm build
```

After building, run the pagination tests against the compiled Worker and isolated local D1 databases:

```sh
BLOG_PAGINATION_WORKER_TESTS=1 pnpm exec tsx --test tests/blog-pagination-worker.test.ts
```

## Blog

Published posts come from EmDash. The site serves the listing at `/blog`, post pages at `/blog/{slug}`, the RSS feed at `/rss.xml`, and the blog sitemap at `/sitemap-blog.xml`.

The blog listing shows 12 published posts per page, newest first. Previous and Next links above and below the cards lead to `/blog?page=2` and later pages. Page one uses `/blog`; invalid and out-of-range pages return HTTP 404.

`/robots.txt` advertises `/sitemap-index.xml`, the Astro index for the blog and static-page sitemaps. EmDash's `/sitemap.xml` remains its own blog sitemap endpoint.

`src/data/blog` is the source archive used by the import and cover-generation scripts. Preview blog pages read from EmDash, not that archive. To inspect an import without writing to the CMS, run:

```sh
pnpm exec tsx --tsconfig scripts/tsconfig.json scripts/import-blog.ts --dry-run
```

The cover generator also supports a no-write check:

```sh
pnpm gen-covers --dry-run
```
