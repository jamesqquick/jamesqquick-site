import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import test from "node:test";
import { DomUtils, parseDocument } from "htmlparser2";
import { readBlogArchive } from "../scripts/blog-archive";
import { BLOG_PAGE_SIZE, getBlogPagePath } from "../src/utils/blog-pagination";

interface WorkerRuntime {
  getWorker(): Promise<{
    fetch(url: string, init?: RequestInit): Promise<Response>;
  }>;
  getD1Database(binding: string): Promise<D1Database>;
  dispose(): Promise<void>;
}

interface FixturePost {
  slug: string;
  title: string;
  publishedAt: string;
}

const require = createRequire(import.meta.url);
const installed = createRequire(require.resolve("wrangler/package.json"));
const { Miniflare, convertV4MiniflareOptions } = installed("miniflare") as {
  Miniflare: new (options: unknown) => WorkerRuntime;
  convertV4MiniflareOptions(options: unknown): unknown;
};

async function createFixture(posts: FixturePost[]) {
  const rootPath = resolve("dist/server");
  const config = JSON.parse(
    readFileSync(resolve(rootPath, "wrangler.json"), "utf8")
  );
  const modulePaths = [
    "entry.mjs",
    ...readdirSync(rootPath, { recursive: true }).filter(
      (path): path is string =>
        typeof path === "string" &&
        path.endsWith(".mjs") &&
        path !== "entry.mjs" &&
        !path.startsWith(".prerender/")
    ),
  ];
  const runtime = new Miniflare(
    convertV4MiniflareOptions({
      rootPath,
      modules: modulePaths.map((path) => ({
        type: "ESModule",
        path: resolve(rootPath, path),
        contents: readFileSync(resolve(rootPath, path), "utf8"),
      })),
      compatibilityDate: config.compatibility_date,
      compatibilityFlags: config.compatibility_flags,
      d1Databases: { DB: "blog-pagination-tests" },
      r2Buckets: ["MEDIA", "COURSE_BUCKET"],
      kvNamespaces: ["SESSION"],
      bindings: { EMDASH_SITE_URL: "https://jamesqquick.com" },
      assets: { directory: resolve("dist/client"), binding: "ASSETS" },
    })
  );

  try {
    const worker = await runtime.getWorker();
    const fetchPage = (path: string) =>
      worker.fetch(`https://jamesqquick.com${path}`, { redirect: "manual" });
    // Initialize EmDash's actual schema without caching an empty blog query.
    const setup = await fetchPage("/_emdash/admin");
    await setup.text();
    assert.ok(setup.status < 500);
    const db = await runtime.getD1Database("DB");
    const insert = `INSERT INTO ec_blog
      (id, translation_group, slug, status, title, excerpt, content,
       created_at, updated_at, published_at, deleted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const insertPost = (
      post: FixturePost,
      id: string,
      status = "published",
      deletedAt: string | null = null
    ) =>
      db.prepare(insert).bind(
        id,
        id,
        post.slug,
        status,
        post.title,
        "A pagination fixture.",
        JSON.stringify([
          {
            _type: "block",
            _key: "body",
            style: "normal",
            markDefs: [],
            children: [
              { _type: "span", _key: "text", text: "Article body.", marks: [] },
            ],
          },
        ]),
        post.publishedAt,
        post.publishedAt,
        post.publishedAt,
        deletedAt
      );
    const datedPosts = posts.map((post, index) => ({
      ...post,
      id: String(index).padStart(4, "0"),
    }));
    await db.batch([
      ...datedPosts.map((post) => insertPost(post, post.id)),
      ...["draft", "archived", "scheduled"].map((status) =>
        insertPost(
          {
            slug: `excluded-${status}`,
            title: status,
            publishedAt: "2026-01-01T00:00:00.000Z",
          },
          `excluded-${status}`,
          status
        )
      ),
      insertPost(
        {
          slug: "excluded-deleted",
          title: "Deleted",
          publishedAt: "2026-01-01T00:00:00.000Z",
        },
        "excluded-deleted",
        "published",
        "2026-01-02T00:00:00.000Z"
      ),
    ]);

    return {
      runtime,
      db,
      fetchPage,
      expectedPaths: datedPosts
        .sort(
          (a, b) =>
            Date.parse(b.publishedAt) - Date.parse(a.publishedAt) ||
            b.id.localeCompare(a.id)
        )
        .map((post) => `/blog/${post.slug}`),
    };
  } catch (error) {
    await runtime.dispose();
    throw error;
  }
}

function inspectPage(html: string) {
  const document = parseDocument(html);
  const nodes = DomUtils.findAll(() => true, document.children);
  const cards = nodes.filter(
    (node) =>
      node.name === "a" && node.attribs.class?.split(" ").includes("card-shell")
  );
  const navigation = nodes
    .filter(
      (node) =>
        node.name === "nav" &&
        node.attribs["aria-label"]?.startsWith("Blog pagination")
    )
    .map((node) => ({
      label: node.attribs["aria-label"],
      current: DomUtils.findOne(
        (child) => child.attribs["aria-current"] === "page",
        node.children
      ),
      links: DomUtils.findAll((child) => child.name === "a", node.children).map(
        (child) => ({
          text: DomUtils.textContent(child).trim(),
          href: child.attribs.href,
        })
      ),
    }));
  return {
    cards: cards.map((node) => node.attribs.href),
    links: nodes
      .filter((node) => node.name === "a")
      .map((node) => ({
        text: DomUtils.textContent(node).trim(),
        href: node.attribs.href,
      })),
    navigation,
    title: DomUtils.textContent(nodes.find((node) => node.name === "title")!),
    canonical: nodes.find(
      (node) => node.name === "link" && node.attribs.rel === "canonical"
    )?.attribs.href,
    robots: nodes.find(
      (node) => node.name === "meta" && node.attribs.name === "robots"
    )?.attribs.content,
  };
}

test(
  "compiled Worker paginates the actual EmDash collection",
  { skip: process.env.BLOG_PAGINATION_WORKER_TESTS !== "1", timeout: 120000 },
  async (context) => {
    for (const count of [0, 1, 12, 13, 24, 25]) {
      await context.test(
        `${count} published posts have correct boundaries`,
        async (context) => {
          const fixture = await createFixture(
            Array.from({ length: count }, (_, index) => ({
              slug: `post-${index}`,
              title: `Post ${index}`,
              publishedAt: new Date(
                Date.UTC(2020, 0, Math.floor(index / 3) + 1)
              ).toISOString(),
            }))
          );
          context.after(() => fixture.runtime.dispose());
          const lastPage = Math.max(1, Math.ceil(count / BLOG_PAGE_SIZE));
          const visited: string[] = [];

          for (let page = 1; page <= lastPage; page++) {
            const response = await fixture.fetchPage(getBlogPagePath(page));
            assert.equal(response.status, 200);
            const html = await response.text();
            const result = inspectPage(html);
            const expected = fixture.expectedPaths.slice(
              (page - 1) * BLOG_PAGE_SIZE,
              page * BLOG_PAGE_SIZE
            );
            assert.deepEqual(result.cards, expected);
            visited.push(...result.cards);
            assert.equal(
              result.canonical,
              `https://jamesqquick.com${getBlogPagePath(page)}`
            );
            assert.equal(
              result.title,
              page === 1
                ? "Blog | James Q Quick"
                : `Blog - Page ${page} | James Q Quick`
            );
            assert.equal(result.robots, undefined);
            assert.equal(result.navigation.length, lastPage > 1 ? 2 : 0);

            for (const nav of result.navigation) {
              assert.equal(
                DomUtils.textContent(nav.current!).trim(),
                `Page ${page}`
              );
              assert.deepEqual(nav.links, [
                ...(page > 1
                  ? [{ text: "Previous", href: getBlogPagePath(page - 1) }]
                  : []),
                ...(page < lastPage
                  ? [{ text: "Next", href: getBlogPagePath(page + 1) }]
                  : []),
              ]);
            }
            if (lastPage > 1) {
              assert.deepEqual(
                result.navigation.map((nav) => nav.label),
                ["Blog pagination, top", "Blog pagination, bottom"]
              );
            }
            if (count === 0)
              assert.ok(html.includes("No posts published yet."));
          }
          assert.deepEqual(visited, fixture.expectedPaths);
          const missing = await fixture.fetchPage(
            getBlogPagePath(lastPage + 1)
          );
          assert.equal(missing.status, 404);
          const missingHtml = await missing.text();
          const missingPage = inspectPage(missingHtml);
          assert.equal(missingPage.robots, "noindex, nofollow");
          assert.ok(
            missingPage.links.some(
              (link) => link.text === "Back to blog" && link.href === "/blog"
            )
          );
        }
      );
    }

    await context.test(
      "canonical redirects, metadata, and invalid URLs",
      async (context) => {
        const fixture = await createFixture(
          Array.from({ length: 25 }, (_, index) => ({
            slug: `post-${index}`,
            title: `Post ${index}`,
            publishedAt: "2020-01-01T00:00:00.000Z",
          }))
        );
        context.after(() => fixture.runtime.dispose());

        for (const [path, location] of [
          ["/blog?page=1", "/blog"],
          ["/blog?page=001&utm_source=email", "/blog?utm_source=email"],
          ["/blog?page=02", "/blog?page=2"],
          ["/blog?utm_source=email&page=02", "/blog?utm_source=email&page=2"],
        ]) {
          const response = await fixture.fetchPage(path);
          assert.equal(response.status, 301, path);
          assert.equal(response.headers.get("location"), location, path);
          await response.text();
        }

        for (const query of [
          "page=",
          "page=0",
          "page=-1",
          "page=abc",
          "page=1.5",
          "page=1e2",
          "page=2%0A",
          "page=2&page=2",
          "page=9007199254740993",
        ]) {
          const response = await fixture.fetchPage(`/blog?${query}`);
          assert.equal(response.status, 404, query);
          const result = inspectPage(await response.text());
          assert.equal(result.title, "404 | James Q Quick");
          assert.equal(result.robots, "noindex, nofollow");
          assert.deepEqual(result.cards, []);
          assert.deepEqual(result.navigation, []);
        }

        const tracked = await fixture.fetchPage(
          "/blog?page=2&utm_source=email"
        );
        assert.equal(tracked.status, 200);
        assert.equal(
          inspectPage(await tracked.text()).canonical,
          "https://jamesqquick.com/blog?page=2"
        );
      }
    );

    await context.test(
      "all 92 archived routes remain reachable through pagination and RSS",
      async (context) => {
        const archive = await readBlogArchive(resolve("."));
        assert.equal(archive.length, 92);
        const fixture = await createFixture(
          archive.map((post) => ({
            slug: post.slug,
            title: post.title,
            publishedAt: post.publishedAt,
          }))
        );
        context.after(() => fixture.runtime.dispose());
        const visited: string[] = [];
        for (
          let page = 1;
          page <= Math.ceil(archive.length / BLOG_PAGE_SIZE);
          page++
        ) {
          const response = await fixture.fetchPage(getBlogPagePath(page));
          assert.equal(response.status, 200);
          visited.push(...inspectPage(await response.text()).cards);
        }
        assert.deepEqual(visited, fixture.expectedPaths);
        assert.equal(new Set(visited).size, 92);

        const rss = await fixture.fetchPage("/rss.xml");
        assert.equal(rss.status, 200);
        const xml = parseDocument(await rss.text(), { xmlMode: true });
        const items = DomUtils.findAll(
          (node) => node.name === "item",
          xml.children
        );
        assert.equal(items.length, 92);
        const links = items.map((item) =>
          DomUtils.textContent(
            DomUtils.findOne(
              (node) => node.name === "link",
              item.children,
              false
            )!
          )
        );
        assert.deepEqual(
          links,
          fixture.expectedPaths.map(
            (path) => new URL(`${path}/`, "https://jamesqquick.com").href
          )
        );
        for (const path of [
          visited[0],
          visited.at(-1)!,
          "/blog/n+1-part-of-the-auth0-culture",
        ]) {
          const article = await fixture.fetchPage(path);
          assert.equal(article.status, 200, path);
          assert.ok((await article.text()).includes("Article body."));
        }
      }
    );

    await context.test(
      "query failures stay server errors while invalid pages skip the query",
      async (context) => {
        const fixture = await createFixture([
          {
            slug: "post",
            title: "Post",
            publishedAt: "2020-01-01T00:00:00.000Z",
          },
        ]);
        context.after(() => fixture.runtime.dispose());
        await fixture.db
          .prepare("ALTER TABLE ec_blog RENAME TO ec_blog_unavailable")
          .run();
        await fixture.db
          .prepare(
            "CREATE VIEW ec_blog AS SELECT * FROM ec_blog_unavailable WHERE json('invalid') IS NOT NULL"
          )
          .run();
        const invalid = await fixture.fetchPage("/blog?page=abc");
        assert.equal(invalid.status, 404);
        await invalid.text();
        for (const path of ["/blog", "/blog?page=2"]) {
          const failed = await fixture.fetchPage(path);
          assert.equal(failed.status, 500);
          const html = await failed.text();
          const result = inspectPage(html);
          assert.equal(result.robots, "noindex, nofollow");
          assert.ok(html.includes("Blog unavailable"));
          assert.ok(
            result.links.some(
              (link) => link.text === "Try again" && link.href === path
            )
          );
          assert.ok(!html.includes("No posts published yet."));
        }
      }
    );
  }
);
