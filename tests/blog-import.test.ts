import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { join } from "node:path";
import test, { type TestContext } from "node:test";
import { fileURLToPath } from "node:url";
import { normalizeMediaValue } from "../node_modules/emdash/src/media/normalize";
import {
  BlogCmsError,
  createBlogCms,
  normalizeBlogCmsUrl,
  resolveBlogCmsConnection,
  validateBlogCmsMedia,
  type BlogCmsEntry,
  type BlogCmsMedia,
} from "../scripts/blog-cms";
import {
  BlogImportError,
  blogImportReceiptPath,
  importBlogArchive,
  parseBlogImportArgs,
  readBlogImportReceipt,
} from "../scripts/import-blog";

const root = fileURLToPath(new URL("../", import.meta.url));
const gif = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64"
);
const slug = "nested/n+1";
const markdown =
  '\n![First alt](./body.gif "First title")\n\n![Second alt](./copy.gif "Second title")\n\n```js\nconst literal = \'<img /> &amp;\';  \n```\n';

function postSource(
  overrides: Record<string, unknown> = {},
  body = markdown
): string {
  const metadata = {
    title: "An exact title",
    description: "An exact excerpt",
    pubDate: "2019-08-18T13:14:15.123Z",
    slug,
    tags: ["typescript", "javascript"],
    coverImage: "./cover.gif",
    youTubeVideoId: "L0pPRauLP2E",
    ...overrides,
  };
  return `---\n${Object.entries(metadata)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join("\n")}\n---\n${body}`;
}

async function fixture(second?: {
  metadata?: Record<string, unknown>;
  body?: string;
}): Promise<{ root: string; file: string; directory: string }> {
  const directory = await fs.mkdtemp(join(root, "tmp/blog-import-test-"));
  const first = join(directory, "src/data/blog/a");
  await fs.mkdir(first, { recursive: true });
  const file = join(first, "post.md");
  await fs.writeFile(file, postSource());
  for (const name of ["cover.gif", "body.gif", "copy.gif"])
    await fs.writeFile(join(first, name), gif);
  if (second) {
    const next = join(directory, "src/data/blog/b");
    await fs.mkdir(next, { recursive: true });
    await fs.writeFile(
      join(next, "post.md"),
      postSource({ slug: "second", ...second.metadata }, second.body)
    );
    for (const name of ["cover.gif", "body.gif", "copy.gif"])
      await fs.writeFile(join(next, name), gif);
  }
  return { root: directory, file, directory: first };
}

type Entry = BlogCmsEntry & {
  version: number;
  seo: { title: string | null };
  liveData?: Record<string, unknown>;
  bylines?: unknown[];
  byline?: unknown;
  references?: Record<string, unknown>;
};

interface ApiCall {
  method: string;
  path: string;
  body?: Record<string, unknown>;
  bytes?: Uint8Array;
}

async function localCms(t: TestContext) {
  const entries = new Map<string, Entry>();
  const media = new Map<string, { item: BlogCmsMedia; bytes: Uint8Array }>();
  const calls: ApiCall[] = [];
  const state = {
    revision: 0,
    bypasses: 0,
    failCreate: false,
    failPublish: false,
    failNextGet: false,
    corruptPublicBytes: false,
    redirectList: false,
    uploadResponse: undefined as ((item: BlogCmsMedia) => unknown) | undefined,
    afterCreate: undefined as (() => void) | undefined,
    beforeUpdate: undefined as ((entry: Entry) => void) | undefined,
    beforePublish: undefined as ((entry: Entry) => void) | undefined,
    afterPublish: undefined as (() => void) | undefined,
  };
  function advance(entry: Entry): void {
    entry.version++;
    entry._rev = `revision-${++state.revision}`;
    entry.updatedAt = new Date(
      Date.UTC(2026, 0, 1, 0, 0, state.revision)
    ).toISOString();
  }
  function newEntry(
    id: string,
    entrySlug: string,
    data: Record<string, unknown>
  ): Entry {
    const entry: Entry = {
      id,
      type: "blog",
      slug: entrySlug,
      status: "draft",
      data: structuredClone(data),
      _rev: "initial",
      authorId: "test-author",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      publishedAt: null,
      scheduledAt: null,
      liveRevisionId: null,
      draftRevisionId: null,
      locale: "en",
      translationGroup: id,
      version: 0,
      seo: { title: null },
    };
    advance(entry);
    entries.set(id, entry);
    return entry;
  }
  const server = createServer(async (incoming, response) => {
    function send(status: number, data: unknown): void {
      response.writeHead(status, { "Content-Type": "application/json" });
      response.end(JSON.stringify({ success: true, data }));
    }
    function fail(status: number): void {
      response.writeHead(status, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({
          success: false,
          error: {
            code: status === 409 ? "CONFLICT" : "TEST_FAILURE",
            message: "upstream detail that should not be logged",
          },
        })
      );
    }
    try {
      const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
      const url = new URL(incoming.url!, origin);
      const method = incoming.method!;
      const path = url.pathname;
      const call: ApiCall = { method, path };
      calls.push(call);
      if (path === "/_emdash/api/auth/dev-bypass") {
        state.bypasses++;
        response.setHeader(
          "Set-Cookie",
          "emdash_session=test-session; Path=/; HttpOnly"
        );
        send(200, {});
        return;
      }
      const fileMatch = /^\/_emdash\/api\/media\/file\/(.+)$/.exec(path);
      if (fileMatch) {
        const file = [...media.values()].find(
          ({ item }) => item.storageKey === fileMatch[1]
        );
        if (!file) return fail(404);
        const bytes = Buffer.from(file.bytes);
        if (state.corruptPublicBytes) bytes[bytes.length - 1] ^= 1;
        response.writeHead(200, { "Content-Type": file.item.mimeType });
        response.end(bytes);
        return;
      }
      assert.equal(incoming.headers.cookie, "emdash_session=test-session");
      if (method !== "GET") {
        assert.equal(incoming.headers["x-emdash-request"], "1");
        assert.equal(incoming.headers.origin, origin);
      }
      const chunks: Buffer[] = [];
      for await (const chunk of incoming) chunks.push(Buffer.from(chunk));
      const body = Buffer.concat(chunks);
      if (incoming.headers["content-type"]?.includes("application/json")) {
        call.body = JSON.parse(body.toString()) as Record<string, unknown>;
        assert.equal(call.body.overrideLock, undefined);
        assert.equal(call.body.skipRevision, undefined);
      }
      if (path === "/_emdash/api/schema/collections/blog") {
        send(200, {
          item: {
            slug: "blog",
            fields: [{ slug: "content", type: "portableText" }],
          },
        });
        return;
      }
      if (path === "/_emdash/api/media" && method === "POST") {
        const form = await new Request(url, {
          method,
          headers: { "Content-Type": incoming.headers["content-type"]! },
          body,
        }).formData();
        const file = form.get("file") as File;
        const bytes = new Uint8Array(await file.arrayBuffer());
        call.bytes = bytes;
        const previous = [...media.values()].find((saved) =>
          Buffer.from(saved.bytes).equals(Buffer.from(bytes))
        );
        let item = previous?.item;
        if (!item) {
          const id = `media-${media.size + 1}`;
          item = {
            id,
            filename: file.name,
            storageKey: `storage-${media.size + 1}.gif`,
            url: `/_emdash/api/media/file/storage-${media.size + 1}.gif`,
            mimeType: file.type,
            size: bytes.byteLength,
            width: 1,
            height: 1,
          };
          media.set(id, { item, bytes });
        }
        send(201, {
          item: state.uploadResponse ? state.uploadResponse(item) : item,
        });
        return;
      }
      const mediaMatch = /^\/_emdash\/api\/media\/(.+)$/.exec(path);
      if (mediaMatch && method === "GET") {
        const saved = media.get(mediaMatch[1]);
        if (!saved) return fail(404);
        const { url: _url, ...item } = saved.item;
        send(200, { item });
        return;
      }
      if (path === "/_emdash/api/content/blog") {
        if (method === "GET") {
          if (state.redirectList) {
            response.writeHead(302, { Location: "/redirect-target" });
            response.end();
            return;
          }
          const all = [...entries.values()];
          const start = Number(url.searchParams.get("cursor") ?? 0);
          send(200, {
            items: all.slice(start, start + 1),
            ...(start + 1 < all.length
              ? { nextCursor: String(start + 1) }
              : {}),
          });
          return;
        }
        if (state.failCreate) return fail(503);
        if (
          [...entries.values()].some((entry) => entry.slug === call.body!.slug)
        )
          return fail(409);
        assert.equal(call.body!.status, "draft");
        const data = call.body!.data as Record<string, unknown>;
        data.featured_image = await normalizeMediaValue(
          data.featured_image,
          () => undefined
        );
        const entry = newEntry(
          `entry-${entries.size + 1}`,
          call.body!.slug as string,
          data
        );
        send(201, { item: entry, _rev: entry._rev });
        state.afterCreate?.();
        return;
      }
      const match = /^\/_emdash\/api\/content\/blog\/([^/]+)(\/publish)?$/.exec(
        path
      );
      if (match) {
        const entry = entries.get(match[1]);
        if (!entry) return fail(404);
        if (method === "GET") {
          if (state.failNextGet) {
            state.failNextGet = false;
            return fail(503);
          }
          send(200, {
            item: { bylines: [], byline: null, references: {}, ...entry },
            _rev: entry._rev,
          });
          return;
        }
        if (match[2]) {
          state.beforePublish?.(entry);
          if (call.body!._rev !== entry._rev) return fail(409);
          if (state.failPublish) return fail(503);
          entry.status = "published";
          entry.publishedAt = call.body!.publishedAt as string;
          entry.liveRevisionId = entry.draftRevisionId ?? "live-1";
          entry.draftRevisionId = null;
          delete entry.liveData;
          const stagedSlug = (entry as Entry & { stagedSlug?: string })
            .stagedSlug;
          if (stagedSlug) {
            entry.slug = stagedSlug;
            delete (entry as Entry & { stagedSlug?: string }).stagedSlug;
          }
          advance(entry);
          send(200, { item: entry, _rev: entry._rev });
          state.afterPublish?.();
          return;
        }
        state.beforeUpdate?.(entry);
        if (call.body!._rev !== entry._rev) return fail(409);
        entry.liveData = structuredClone(entry.data);
        entry.data = structuredClone(
          call.body!.data as Record<string, unknown>
        );
        entry.data.featured_image = await normalizeMediaValue(
          entry.data.featured_image,
          () => undefined
        );
        if (call.body!.slug)
          (entry as Entry & { stagedSlug?: string }).stagedSlug = call.body!
            .slug as string;
        entry.draftRevisionId = `draft-${state.revision + 1}`;
        advance(entry);
        send(200, { item: entry, _rev: entry._rev });
        return;
      }
      fail(404);
    } catch (error) {
      response.writeHead(500, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({
          error: { code: "TEST_SERVER_ERROR", message: String(error) },
        })
      );
    }
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(
    () =>
      new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve()))
      )
  );
  const origin = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  const cms = createBlogCms({ url: origin });
  const mutations = () => calls.filter((call) => call.method !== "GET");
  return {
    cms,
    origin,
    state,
    entries,
    media,
    calls,
    mutations,
    advance,
    newEntry,
  };
}

test("connection settings use upstream env names, defaults, and exact loopback hosts", () => {
  assert.deepEqual(resolveBlogCmsConnection({}, {}), {
    origin: "http://localhost:4355",
    loopback: true,
  });
  assert.deepEqual(
    resolveBlogCmsConnection(
      {},
      { EMDASH_URL: "https://cms.example", EMDASH_TOKEN: "test-token" }
    ),
    { origin: "https://cms.example", loopback: false, token: "test-token" }
  );
  assert.equal(
    resolveBlogCmsConnection(
      { url: "http://127.0.0.1:4371" },
      { EMDASH_URL: "https://cms.example" }
    ).origin,
    "http://127.0.0.1:4371"
  );
  for (const url of [
    "http://localhost:4355",
    "http://127.0.0.1:4371/",
    "http://[::1]:4355",
  ])
    assert.equal(normalizeBlogCmsUrl(url).loopback, true);
  for (const url of [
    "https://localhost.evil.example",
    "https://evil.example/localhost",
    "https://localhost@evil.example",
    "http://localhost.",
    "http://127.1",
    "http://2130706433",
  ])
    assert.throws(() => resolveBlogCmsConnection({ url }, {}), BlogCmsError);
  for (const url of [
    "file:///tmp/cms",
    "http://user:password@localhost:4355",
    "http://localhost:4355/_emdash",
    "http://localhost:4355?token=secret",
    "http://localhost:4355/#fragment",
    " http://localhost:4355",
    "http://localhost\\evil.example",
  ])
    assert.throws(() => normalizeBlogCmsUrl(url), BlogCmsError);
});

test("CLI accepts exact nested/plus slugs and rejects invalid options without echoing credentials", () => {
  assert.deepEqual(
    parseBlogImportArgs([
      "--url",
      "http://127.0.0.1:4371",
      "--slug",
      slug,
      "--dry-run",
    ]),
    { url: "http://127.0.0.1:4371", slug, dryRun: true }
  );
  for (const args of [
    ["--slug"],
    ["--unknown", "secret"],
    ["post"],
    ["--slug", "nested/%2f"],
    ["--slug", "../post"],
    ["--url", "https://user:secret@example.com"],
  ]) {
    assert.throws(
      () => parseBlogImportArgs(args),
      (error) => {
        assert.ok(
          error instanceof BlogImportError || error instanceof BlogCmsError
        );
        assert.ok(!error.message.includes("secret"));
        return true;
      }
    );
  }
});

test("authenticated client requests refuse redirects", async (t) => {
  const api = await localCms(t);
  api.state.redirectList = true;
  await assert.rejects(api.cms.listEntries(), BlogCmsError);
  assert.ok(!api.calls.some((call) => call.path === "/redirect-target"));
});

test("cover mapping survives the installed CMS's local-media normalization", async (t) => {
  const source = await fixture();
  const api = await localCms(t);
  await importBlogArchive({ root: source.root, cms: api.cms });
  const cover = [...api.entries.values()][0].data.featured_image;
  assert.deepEqual(await normalizeMediaValue(cover, () => undefined), cover);
});

test("dry run preflights all conversion and bytes with zero network requests or receipt writes", async (t) => {
  const source = await fixture();
  const api = await localCms(t);
  const result = await importBlogArchive({
    root: source.root,
    cms: api.cms,
    dryRun: true,
    slug,
  });
  assert.equal(result.selected, 1);
  assert.equal(result.localFiles, 3);
  assert.equal(result.distinctBytes, 1);
  assert.equal(result.uploaded, 0);
  assert.equal(result.posts[0].outcome, "planned");
  assert.deepEqual(api.calls, []);
  await assert.rejects(fs.stat(result.receiptPath), { code: "ENOENT" });
});

for (const [name, second] of [
  ["missing body image", { body: "![missing](./missing.gif)" }],
  ["invalid metadata", { metadata: { pubDate: "2025-02-30" } }],
  ["unsupported Markdown", { body: "<Widget />\n" }],
] as const) {
  test(`${name} on a later post fails contextually before any CMS write`, async (t) => {
    const source = await fixture(second);
    const api = await localCms(t);
    await assert.rejects(
      importBlogArchive({ root: source.root, cms: api.cms }),
      (error) => {
        assert.ok(error instanceof BlogImportError);
        assert.equal(error.code, "preflight");
        assert.ok(error.message.includes("/b/post.md"));
        return true;
      }
    );
    assert.deepEqual(api.calls, []);
  });
}

test("all selected sources are re-preflighted on resume", async (t) => {
  const source = await fixture();
  const api = await localCms(t);
  await importBlogArchive({ root: source.root, cms: api.cms });
  const requests = api.calls.length;
  await fs.writeFile(source.file, postSource({}, "![missing](./missing.gif)"));
  await assert.rejects(
    importBlogArchive({ root: source.root, cms: api.cms }),
    BlogImportError
  );
  assert.equal(api.calls.length, requests);
});

test("cover/body dedup preserves exact GIF bytes, native references, alt/title, code, and metadata", async (t) => {
  const source = await fixture();
  const api = await localCms(t);
  const result = await importBlogArchive({ root: source.root, cms: api.cms });
  assert.equal(result.uploaded, 1);
  assert.equal(api.media.size, 1);
  assert.equal(
    api.state.bypasses,
    1,
    "client and direct publisher share one auth cookie"
  );
  const uploads = api.calls.filter(
    (call) => call.path === "/_emdash/api/media" && call.method === "POST"
  );
  assert.equal(uploads.length, 1);
  assert.deepEqual(Buffer.from(uploads[0].bytes!), gif);
  const entry = [...api.entries.values()][0];
  assert.equal(entry.slug, slug);
  assert.equal(entry.status, "published");
  assert.equal(entry.publishedAt, "2019-08-18T13:14:15.123Z");
  assert.equal(entry.data.title, "An exact title");
  assert.equal(entry.data.excerpt, "An exact excerpt");
  assert.deepEqual(entry.data.tags, ["typescript", "javascript"]);
  assert.equal(entry.data.youtube_video_id, "L0pPRauLP2E");
  const cover = entry.data.featured_image as {
    id: string;
    provider: string;
    meta: { storageKey: string };
  };
  assert.equal(cover.id, "media-1");
  assert.equal(cover.provider, "local");
  assert.equal(cover.meta.storageKey, "storage-1.gif");
  const content = entry.data.content as Array<{
    _type: string;
    asset?: { _ref: string; url: string; provider: string };
    alt?: string;
    title?: string;
    code?: string;
  }>;
  const images = content.filter((block) => block._type === "image");
  assert.deepEqual(
    images.map((image) => [image.asset?._ref, image.alt, image.title]),
    [
      [cover.id, "First alt", "First title"],
      [cover.id, "Second alt", "Second title"],
    ]
  );
  assert.equal(images[0].asset?.url, "/_emdash/api/media/file/storage-1.gif");
  assert.equal(images[0].asset?.provider, "local");
  assert.equal(
    content.find((block) => block._type === "code")?.code,
    "const literal = '<img /> &amp;';  \n"
  );
  assert.deepEqual(
    Buffer.from(await api.cms.readMedia([...api.media.values()][0].item)),
    gif
  );
  const receipt = await readBlogImportReceipt(source.root, api.origin);
  assert.equal(Object.keys(receipt.media).length, 1);
  assert.equal(Object.values(receipt.media)[0].paths.length, 3);
  assert.equal(Object.values(receipt.posts)[0].revision, entry._rev);
  assert.equal(Object.values(receipt.posts)[0].stage, "published");
});

test("unchanged reruns verify saved media but do not mutate CMS or receipts", async (t) => {
  const source = await fixture();
  const api = await localCms(t);
  const first = await importBlogArchive({ root: source.root, cms: api.cms });
  const receipt = await fs.readFile(first.receiptPath, "utf8");
  const writes = api.mutations().length;
  const second = await importBlogArchive({ root: source.root, cms: api.cms });
  assert.equal(second.posts[0].outcome, "unchanged");
  assert.equal(second.uploaded, 0);
  assert.equal(second.reused, 1);
  assert.equal(api.mutations().length, writes);
  assert.equal(api.entries.size, 1);
  assert.equal(api.media.size, 1);
  assert.equal(await fs.readFile(first.receiptPath, "utf8"), receipt);
});

test("receipts are isolated per target origin and a copied wrong-target receipt is rejected", async (t) => {
  const source = await fixture();
  const first = await localCms(t);
  const second = await localCms(t);
  const a = await importBlogArchive({ root: source.root, cms: first.cms });
  const b = await importBlogArchive({ root: source.root, cms: second.cms });
  assert.notEqual(a.receiptPath, b.receiptPath);
  assert.equal(a.uploaded, 1);
  assert.equal(b.uploaded, 1);
  assert.equal(first.entries.size, 1);
  assert.equal(second.entries.size, 1);
  const third = await localCms(t);
  await fs.writeFile(
    blogImportReceiptPath(source.root, third.origin),
    await fs.readFile(a.receiptPath)
  );
  await assert.rejects(
    importBlogArchive({ root: source.root, cms: third.cms }),
    (error) => error instanceof BlogImportError && error.code === "receipt"
  );
  assert.equal(third.calls.length, 0);
});

test("corrupt receipts are refused before network calls", async (t) => {
  const source = await fixture();
  const api = await localCms(t);
  const first = await importBlogArchive({ root: source.root, cms: api.cms });
  const requests = api.calls.length;
  await fs.writeFile(
    first.receiptPath,
    (await fs.readFile(first.receiptPath, "utf8")).replace(
      "An exact title",
      "Corrupted title"
    )
  );
  await assert.rejects(
    importBlogArchive({ root: source.root, cms: api.cms }),
    (error) => error instanceof BlogImportError && error.code === "receipt"
  );
  assert.equal(api.calls.length, requests);
});

test("changed owned source is protected without updating, publishing, or checkpointing", async (t) => {
  const source = await fixture();
  const api = await localCms(t);
  const first = await importBlogArchive({ root: source.root, cms: api.cms });
  const entry = [...api.entries.values()][0];
  const before = structuredClone(entry);
  const receipt = await fs.readFile(first.receiptPath, "utf8");
  const writes = api.mutations().length;
  await fs.writeFile(
    source.file,
    postSource(
      {
        title: "Changed source",
        pubDate: "2020-03-04T05:06:07.890Z",
        tags: ["javascript", "typescript"],
      },
      `${markdown}\nChanged body.\n`
    )
  );
  const result = await importBlogArchive({ root: source.root, cms: api.cms });
  assert.equal(result.posts[0].outcome, "protected");
  assert.match(result.posts[0].reason!, /archive source changed/);
  assert.equal(result.uploaded, 0);
  assert.deepEqual(entry, before);
  assert.equal(api.mutations().length, writes);
  assert.equal(await fs.readFile(first.receiptPath, "utf8"), receipt);
});

test("changed owned slug is protected without creating a replacement entry", async (t) => {
  const source = await fixture();
  const api = await localCms(t);
  await importBlogArchive({ root: source.root, cms: api.cms });
  const entry = [...api.entries.values()][0];
  const before = structuredClone(entry);
  const writes = api.mutations().length;
  await fs.writeFile(source.file, postSource({ slug: "new/n+2" }));
  const result = await importBlogArchive({ root: source.root, cms: api.cms });
  assert.equal(result.posts[0].outcome, "protected");
  assert.match(result.posts[0].reason!, /archive source changed/);
  assert.deepEqual(entry, before);
  assert.equal(api.mutations().length, writes);
  assert.equal(api.entries.size, 1);
});

test("changed source media is not uploaded before a changed owned entry is reviewed", async (t) => {
  const source = await fixture();
  const api = await localCms(t);
  const first = await importBlogArchive({ root: source.root, cms: api.cms });
  const entry = [...api.entries.values()][0];
  const before = structuredClone(entry);
  const receipt = await fs.readFile(first.receiptPath, "utf8");
  const writes = api.mutations().length;
  const changed = Buffer.concat([gif, Buffer.from("original appended bytes")]);
  await fs.writeFile(join(source.directory, "body.gif"), changed);
  const result = await importBlogArchive({ root: source.root, cms: api.cms });
  assert.equal(result.posts[0].outcome, "protected");
  assert.match(result.posts[0].reason!, /archive source changed/);
  assert.equal(result.uploaded, 0);
  assert.equal(api.media.size, 1);
  assert.deepEqual(entry, before);
  assert.equal(api.mutations().length, writes);
  assert.equal(await fs.readFile(first.receiptPath, "utf8"), receipt);
});

for (const mode of [
  "data",
  "revision",
  "seo-without-revision",
  "byline-without-revision",
  "references-without-revision",
] as const) {
  test(`CMS editorial ${mode} changes are protected for unchanged and changed archives`, async (t) => {
    const source = await fixture();
    const api = await localCms(t);
    const first = await importBlogArchive({ root: source.root, cms: api.cms });
    const entry = [...api.entries.values()][0];
    if (mode === "data") entry.data.title = "Editorial title";
    if (mode === "seo-without-revision") entry.seo.title = "Editorial SEO";
    if (mode === "byline-without-revision") {
      entry.byline = { id: "editor-credit", name: "Editorial byline" };
      entry.bylines = [
        {
          byline: entry.byline,
          sortOrder: 0,
          roleLabel: null,
          source: "explicit",
        },
      ];
    }
    if (mode === "references-without-revision")
      entry.references = {
        related: { items: [{ id: "editor-related-entry" }] },
      };
    if (mode === "data" || mode === "revision") api.advance(entry);
    const before = structuredClone(entry);
    const receipt = await fs.readFile(first.receiptPath, "utf8");
    const writes = api.mutations().length;
    for (const changed of [false, true]) {
      if (changed)
        await fs.writeFile(
          source.file,
          postSource({ title: "Changed archive" })
        );
      const result = await importBlogArchive({
        root: source.root,
        cms: api.cms,
      });
      assert.equal(result.posts[0].outcome, "protected");
      assert.match(
        result.posts[0].reason!,
        /CMS revision or editorial snapshot/
      );
    }
    assert.deepEqual(entry, before);
    assert.equal(api.mutations().length, writes);
    assert.equal(await fs.readFile(first.receiptPath, "utf8"), receipt);
  });
}

test("unowned exact-match entries are reported without adoption, uploads, or writes", async (t) => {
  const ownedSource = await fixture();
  const unownedSource = await fixture();
  const api = await localCms(t);
  await importBlogArchive({ root: ownedSource.root, cms: api.cms });
  const before = structuredClone([...api.entries.values()][0]);
  const writes = api.mutations().length;
  const result = await importBlogArchive({
    root: unownedSource.root,
    cms: api.cms,
  });
  assert.equal(result.posts[0].outcome, "protected");
  assert.equal(result.posts[0].reason, "unowned slug collision");
  assert.deepEqual([...api.entries.values()][0], before);
  assert.equal(api.mutations().length, writes);
  assert.deepEqual(
    (await readBlogImportReceipt(unownedSource.root, api.origin)).posts,
    {}
  );
});

test("missing owned entries are protected instead of recreated", async (t) => {
  const source = await fixture();
  const api = await localCms(t);
  await importBlogArchive({ root: source.root, cms: api.cms });
  api.entries.clear();
  const writes = api.mutations().length;
  const result = await importBlogArchive({ root: source.root, cms: api.cms });
  assert.equal(result.posts[0].outcome, "protected");
  assert.equal(api.entries.size, 0);
  assert.equal(api.mutations().length, writes);
});

test("concurrent editorial changes protect changed archive entries without writes", async (t) => {
  const source = await fixture();
  const api = await localCms(t);
  const first = await importBlogArchive({ root: source.root, cms: api.cms });
  const entry = [...api.entries.values()][0];
  const before = structuredClone(entry);
  const receipt = await fs.readFile(first.receiptPath, "utf8");
  const writes = api.mutations().length;
  await fs.writeFile(source.file, postSource({ title: "Changed archive" }));
  entry.data.title = "Concurrent editor";
  api.advance(entry);
  const result = await importBlogArchive({ root: source.root, cms: api.cms });
  assert.equal(result.posts[0].outcome, "protected");
  assert.match(result.posts[0].reason!, /CMS revision or editorial snapshot/);
  assert.equal(entry.data.title, "Concurrent editor");
  assert.equal(api.calls.filter((call) => call.method === "PUT").length, 0);
  assert.equal(
    api.calls.filter((call) => call.path.endsWith("/publish")).length,
    1
  );
  assert.notDeepEqual(entry, before);
  assert.equal(api.mutations().length, writes);
  assert.equal(await fs.readFile(first.receiptPath, "utf8"), receipt);
});

test("concurrent publish 409 leaves the draft and protects the editor's revision on resume", async (t) => {
  const source = await fixture();
  const api = await localCms(t);
  api.state.beforePublish = (entry) => {
    entry.data.title = "Concurrent draft";
    api.advance(entry);
  };
  await assert.rejects(
    importBlogArchive({ root: source.root, cms: api.cms }),
    (error) => error instanceof BlogImportError && error.code === "conflict"
  );
  const entry = [...api.entries.values()][0];
  assert.equal(entry.status, "draft");
  assert.equal(entry.data.title, "Concurrent draft");
  const writes = api.mutations().length;
  const result = await importBlogArchive({ root: source.root, cms: api.cms });
  assert.equal(result.posts[0].outcome, "protected");
  assert.equal(api.mutations().length, writes);
  assert.equal(
    Object.values(
      (await readBlogImportReceipt(source.root, api.origin)).posts
    )[0].stage,
    "draft"
  );
});

test("an interruption after upload resumes without another upload", async (t) => {
  const source = await fixture();
  const api = await localCms(t);
  api.state.failCreate = true;
  await assert.rejects(
    importBlogArchive({ root: source.root, cms: api.cms }),
    BlogImportError
  );
  const receipt = await readBlogImportReceipt(source.root, api.origin);
  assert.equal(Object.keys(receipt.media).length, 1);
  assert.equal(Object.keys(receipt.posts).length, 0);
  api.state.failCreate = false;
  const result = await importBlogArchive({ root: source.root, cms: api.cms });
  assert.equal(result.posts[0].outcome, "created");
  assert.equal(result.uploaded, 0);
  assert.equal(
    api.calls.filter(
      (call) => call.method === "POST" && call.path === "/_emdash/api/media"
    ).length,
    1
  );
  assert.equal(api.entries.size, 1);
});

test("an interruption after draft creation resumes from the saved ID/revision", async (t) => {
  const source = await fixture();
  const api = await localCms(t);
  api.state.afterCreate = () => {
    api.state.failNextGet = true;
  };
  await assert.rejects(
    importBlogArchive({ root: source.root, cms: api.cms }),
    BlogImportError
  );
  assert.equal(
    Object.values(
      (await readBlogImportReceipt(source.root, api.origin)).posts
    )[0].stage,
    "draft"
  );
  api.state.afterCreate = undefined;
  const result = await importBlogArchive({ root: source.root, cms: api.cms });
  assert.equal(result.posts[0].outcome, "resumed");
  assert.equal(result.uploaded, 0);
  assert.equal(
    api.calls.filter(
      (call) =>
        call.method === "POST" && call.path === "/_emdash/api/content/blog"
    ).length,
    1
  );
  assert.equal(api.entries.size, 1);
});

test("a changed source cannot publish a previously checkpointed draft", async (t) => {
  const source = await fixture();
  const api = await localCms(t);
  api.state.afterCreate = () => {
    api.state.failNextGet = true;
  };
  await assert.rejects(
    importBlogArchive({ root: source.root, cms: api.cms }),
    BlogImportError
  );
  const receipt = await readBlogImportReceipt(source.root, api.origin);
  assert.equal(Object.values(receipt.posts)[0].stage, "draft");
  const entry = [...api.entries.values()][0];
  const before = structuredClone(entry);
  const writes = api.mutations().length;
  api.state.afterCreate = undefined;
  await fs.writeFile(source.file, postSource({ title: "Changed archive" }));
  const result = await importBlogArchive({ root: source.root, cms: api.cms });
  assert.equal(result.posts[0].outcome, "protected");
  assert.match(result.posts[0].reason!, /archive source changed/);
  assert.equal(entry.status, "draft");
  assert.equal(entry.data.title, before.data.title);
  assert.deepEqual(entry, before);
  assert.equal(api.mutations().length, writes);
  assert.equal(api.calls.filter((call) => call.method === "PUT").length, 0);
  assert.equal(
    api.calls.filter((call) => call.path.endsWith("/publish")).length,
    0
  );
  assert.equal(
    Object.values(
      (await readBlogImportReceipt(source.root, api.origin)).posts
    )[0].stage,
    "draft"
  );
});

test("an interruption after publication readback resumes as a no-op", async (t) => {
  const source = await fixture();
  const api = await localCms(t);
  api.state.afterPublish = () => {
    api.state.failNextGet = true;
  };
  await assert.rejects(
    importBlogArchive({ root: source.root, cms: api.cms }),
    BlogImportError
  );
  const writes = api.mutations().length;
  api.state.afterPublish = undefined;
  const result = await importBlogArchive({ root: source.root, cms: api.cms });
  assert.equal(result.posts[0].outcome, "unchanged");
  assert.equal(api.mutations().length, writes);
});

test("invalid upload output cannot create or publish entries", async (t) => {
  const source = await fixture();
  const api = await localCms(t);
  api.state.uploadResponse = (item) => ({
    ...item,
    storageKey: undefined,
    url: `/_emdash/api/media/file/${item.id}`,
  });
  await assert.rejects(
    importBlogArchive({ root: source.root, cms: api.cms }),
    (error) =>
      error instanceof BlogImportError &&
      error.cause instanceof BlogCmsError &&
      error.cause.code === "invalid-response"
  );
  assert.equal(api.entries.size, 0);
});

test("public byte verification rejects altered GIFs before entry writes and can resume", async (t) => {
  const source = await fixture();
  const api = await localCms(t);
  api.state.corruptPublicBytes = true;
  await assert.rejects(
    importBlogArchive({ root: source.root, cms: api.cms }),
    (error) =>
      error instanceof BlogImportError &&
      error.cause instanceof BlogCmsError &&
      error.cause.code === "media-verification"
  );
  assert.equal(api.entries.size, 0);
  assert.equal(api.media.size, 1);
  api.state.corruptPublicBytes = false;
  const result = await importBlogArchive({ root: source.root, cms: api.cms });
  assert.equal(result.uploaded, 0);
  assert.equal(api.entries.size, 1);
});

test("media validation rejects missing URLs, bare IDs, foreign URLs, and invalid dimensions", () => {
  const origin = "http://127.0.0.1:4371";
  const item = {
    id: "id",
    filename: "file.gif",
    storageKey: "storage.gif",
    url: "/_emdash/api/media/file/storage.gif",
    mimeType: "image/gif",
    size: gif.byteLength,
    width: 1,
    height: 1,
  };
  for (const patch of [
    { url: undefined },
    { url: "/_emdash/api/media/file/id" },
    { url: "https://other.example/_emdash/api/media/file/storage.gif" },
    { storageKey: "../storage.gif" },
    { width: 0 },
  ])
    assert.throws(
      () => validateBlogCmsMedia({ ...item, ...patch }, origin, true),
      BlogCmsError
    );
});

test("paginated listings protect collisions beyond the first page and verify total counts", async (t) => {
  const source = await fixture({ metadata: { slug: "second" } });
  const api = await localCms(t);
  api.newEntry("unrelated", "other", { title: "Other" });
  api.newEntry("collision", "second", { title: "Unowned" });
  const result = await importBlogArchive({ root: source.root, cms: api.cms });
  assert.equal(result.entriesBefore, 2);
  assert.equal(result.entriesAfter, 3);
  assert.deepEqual(
    result.posts.map((post) => post.outcome),
    ["created", "protected"]
  );
  assert.equal(api.entries.get("collision")!.data.title, "Unowned");
});
