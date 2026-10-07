import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import type {
  PortableTextBlock,
  PortableTextImageBlock,
  PortableTextSpan,
  PortableTextTableBlock,
  PortableTextTextBlock,
} from "emdash";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";
import type Token from "markdown-it/lib/token.mjs";
import { toHTML } from "@portabletext/to-html";
import {
  BlogArchiveError,
  getArchivePostSlug,
  parseArchivePost,
  readBlogArchive,
  resolveLocalBlogImagePath,
} from "../scripts/blog-archive";
import {
  BlogMarkdownError,
  getMarkdownImageSources,
  markdownToBlogPortableText,
  type ResolvedBlogImage,
} from "../scripts/blog-markdown";
import { getBlogPostPath } from "../src/utils/emdash-blog";
import originalArchive from "./fixtures/blog-archive-original.json";

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const archiveRoot = join(projectRoot, "src/data/blog");
const fixtureFile = join(archiveRoot, "hello-world/hello-world.md");

function postSource(
  overrides: Record<string, unknown> = {},
  markdown = "\nBody.\n"
): string {
  const data = {
    title: "A title",
    description: "A description",
    pubDate: "2024-10-25T15:49:21.902Z",
    tags: ["typescript", "javascript"],
    coverImage: "./cover.png",
    ...overrides,
  };
  return `---\n${Object.entries(data)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join("\n")}\n---\n${markdown}`;
}

test("archive metadata preserves UTC milliseconds, ordered tags, body, and optional YouTube ID", async () => {
  const markdown = "\n# Content\n\nA paragraph.\n";
  const post = await parseArchivePost(
    postSource({ youTubeVideoId: "L0pPRauLP2E" }, markdown),
    fixtureFile,
    projectRoot
  );
  assert.equal(post.filePath, fixtureFile);
  assert.equal(post.title, "A title");
  assert.equal(post.description, "A description");
  assert.equal(post.publishedAt, "2024-10-25T15:49:21.902Z");
  assert.deepEqual(post.tags, ["typescript", "javascript"]);
  assert.equal(post.youtubeVideoId, "L0pPRauLP2E");
  assert.equal(post.coverPath, join(dirname(fixtureFile), "cover.png"));
  assert.equal(post.markdown, markdown);
  const withoutVideo = await parseArchivePost(
    postSource(),
    fixtureFile,
    projectRoot
  );
  assert.equal(Object.hasOwn(withoutVideo, "youtubeVideoId"), false);
  const emptyVideo = await parseArchivePost(
    postSource({ youTubeVideoId: "" }),
    fixtureFile,
    projectRoot
  );
  assert.equal(Object.hasOwn(emptyVideo, "youtubeVideoId"), false);
});

test("date-only and timezone-offset dates preserve the exact instant in UTC", async () => {
  for (const [input, expected] of [
    ["2020-02-29", "2020-02-29T00:00:00.000Z"],
    ["2024-10-25T15:49:21.902-05:30", "2024-10-25T21:19:21.902Z"],
    ["2024-10-25T15:49:21.902", "2024-10-25T15:49:21.902Z"],
  ]) {
    const post = await parseArchivePost(
      postSource({ pubDate: input }),
      fixtureFile,
      projectRoot
    );
    assert.equal(post.publishedAt, expected);
  }
  const unquotedDate = postSource().replace(
    '"2024-10-25T15:49:21.902Z"',
    "2024-10-25T15:49:21.902Z"
  );
  assert.equal(
    (await parseArchivePost(unquotedDate, fixtureFile, projectRoot))
      .publishedAt,
    "2024-10-25T15:49:21.902Z"
  );
});

test("derived slugs use relative paths, GitHub slugging, and trailing index removal", () => {
  assert.equal(
    getArchivePostSlug(
      join(archiveRoot, "My Folder/Hello, World!.md"),
      undefined,
      projectRoot
    ),
    "my-folder/hello-world"
  );
  assert.equal(
    getArchivePostSlug(
      join(archiveRoot, "Nested/Café/index.md"),
      undefined,
      projectRoot
    ),
    "nested/café"
  );
  assert.equal(
    getArchivePostSlug(
      join(archiveRoot, "trigger-ai-agent-from-your-phone/index.md"),
      undefined,
      projectRoot
    ),
    "trigger-ai-agent-from-your-phone"
  );
});

test("explicit slugs override directories and retain literal plus signs", async () => {
  for (const slug of [
    "different-from-hello-world",
    "n+1-part-of-the-auth0-culture",
    "nested/Case+Sensitive",
  ]) {
    const post = await parseArchivePost(
      postSource({ slug }),
      fixtureFile,
      projectRoot
    );
    assert.equal(post.slug, slug);
  }
});

test("accepted slugs preserve canonical URL route identity", () => {
  for (const [input, pathname] of [
    ["n+1-part-of-the-auth0-culture", "/blog/n+1-part-of-the-auth0-culture"],
    ["nested/Case+Sensitive", "/blog/nested/Case+Sensitive"],
    ["release.v1/notes..final", "/blog/release.v1/notes..final"],
    ["nested/café", "/blog/nested/caf%C3%A9"],
  ]) {
    const slug = getArchivePostSlug(fixtureFile, input, projectRoot);
    const url = new URL(getBlogPostPath(slug), "https://www.jamesqquick.com/");
    assert.equal(slug, input);
    assert.equal(url.pathname, pathname);
    assert.equal(decodeURIComponent(url.pathname), `/blog/${slug}`);
    assert.equal(url.search, "");
    assert.equal(url.hash, "");
  }
});

test("invalid metadata and calendar dates report a typed error with source and field", async () => {
  const invalid: Array<[Record<string, unknown>, string]> = [
    [{ title: undefined }, "title"],
    [{ title: 42 }, "title"],
    [{ description: " " }, "description"],
    [{ tags: "typescript" }, "tags"],
    [{ tags: ["typescript", 1] }, "tags"],
    [{ tags: [""] }, "tags"],
    [{ youTubeVideoId: "bad" }, "youTubeVideoId"],
    [{ coverImage: undefined }, "coverImage"],
    [{ pubDate: "2025-02-30" }, "pubDate"],
    [{ pubDate: "2023-02-29" }, "pubDate"],
    [{ pubDate: "2024-13-01" }, "pubDate"],
    [{ pubDate: "2024-01-01T24:00:00Z" }, "pubDate"],
    [{ pubDate: "2024-01-01T00:00:00+25:00" }, "pubDate"],
    [{ pubDate: 1700000000 }, "pubDate"],
    [{ pubDate: "not-a-date" }, "pubDate"],
  ];
  for (const [data, field] of invalid) {
    await assert.rejects(
      parseArchivePost(postSource(data), fixtureFile, projectRoot),
      (error) => {
        assert.ok(error instanceof BlogArchiveError);
        assert.equal(error.filePath, fixtureFile);
        assert.equal(error.field, field);
        return true;
      }
    );
  }
  const invalidUnquotedDate = postSource().replace(
    '"2024-10-25T15:49:21.902Z"',
    "2025-02-30"
  );
  await assert.rejects(
    parseArchivePost(invalidUnquotedDate, fixtureFile, projectRoot),
    BlogArchiveError
  );
});

test("malformed, missing, and executable frontmatter are rejected without evaluation", async () => {
  for (const source of [
    "Body only",
    "---\ntitle: bad\n",
    "---\ntitle: [bad\n---\n",
    "---javascript\n({ title: 'bad' })\n---\n",
    "---\n- array\n---\n",
  ]) {
    await assert.rejects(
      parseArchivePost(source, fixtureFile, projectRoot),
      (error) => {
        assert.ok(error instanceof BlogArchiveError);
        assert.equal(error.code, "invalid-frontmatter");
        assert.equal(error.filePath, fixtureFile);
        return true;
      }
    );
  }
});

test("invalid explicit slugs fail instead of being regenerated", () => {
  for (const slug of [
    "",
    null,
    123,
    "/leading",
    "trailing/",
    "a//b",
    "../a",
    "one/../two",
    "one/./two",
    "a?b",
    "a#b",
    "a b",
  ]) {
    assert.throws(
      () => getArchivePostSlug(fixtureFile, slug, projectRoot),
      BlogArchiveError
    );
  }
});

test("encoded traversal and ambiguous separators fail with typed slug context", () => {
  for (const slug of [
    "%2e%2e/other",
    "%2E%2e/other",
    "one/%2e%2e/two",
    "one/.%2E/two",
    "one/%2e./two",
    "one/%2e/two",
    "one%2ftwo",
    "one%2F..%2Ftwo",
    "%2fother",
    "one/%5c../two",
    "one%5Ctwo",
    "%252e%252e/other",
    "one%252ftwo",
    "one%255ctwo",
    "one/%",
    "one/%ZZ",
  ]) {
    assert.throws(
      () => getArchivePostSlug(fixtureFile, slug, projectRoot),
      (error) => {
        assert.ok(error instanceof BlogArchiveError);
        assert.equal(error.code, "invalid-slug");
        assert.equal(error.field, "slug");
        assert.equal(error.filePath, fixtureFile);
        return true;
      },
      slug
    );
  }
});

test("local covers are validated and remote covers are rejected", async () => {
  await assert.rejects(
    parseArchivePost(
      postSource({ coverImage: "./missing-cover.png" }),
      fixtureFile,
      projectRoot
    ),
    (error) => {
      assert.ok(error instanceof BlogArchiveError);
      assert.equal(error.code, "missing-image");
      assert.equal(error.filePath, fixtureFile);
      return true;
    }
  );
  await assert.rejects(
    parseArchivePost(
      postSource({ coverImage: "https://example.com/cover.png" }),
      fixtureFile,
      projectRoot
    ),
    BlogArchiveError
  );
  assert.equal(
    await resolveLocalBlogImagePath(
      "./cover.png?download=1#image",
      fixtureFile,
      projectRoot
    ),
    join(dirname(fixtureFile), "cover.png")
  );
  assert.equal(
    await resolveLocalBlogImagePath(
      "https://example.com/image.gif",
      fixtureFile,
      projectRoot
    ),
    undefined
  );
  for (const source of [
    "file:///outside.png",
    "data:image/png;base64,AA",
    "../../../../../../../outside.png",
    "./%00.png",
    "./%ZZ.png",
    "./hello-world.md",
  ]) {
    await assert.rejects(
      resolveLocalBlogImagePath(source, fixtureFile, projectRoot),
      BlogArchiveError
    );
  }
});

test("missing archive directories report the requested source path", async () => {
  const missingRoot = join(projectRoot, "__missing_blog_archive__");
  await assert.rejects(readBlogArchive(missingRoot), (error) => {
    assert.ok(error instanceof BlogArchiveError);
    assert.equal(error.code, "archive-read");
    assert.equal(error.filePath, join(missingRoot, "src/data/blog"));
    return true;
  });
});

test("duplicate archive slugs identify both source files", async (context) => {
  const original = fs.readFile;
  context.mock.method(
    fs,
    "readFile",
    async (...args: Parameters<typeof fs.readFile>) => {
      const result = await original(...args);
      if (String(args[0]).endsWith(".md")) {
        return postSource({ slug: "duplicate-identifier" });
      }
      return result;
    }
  );
  await assert.rejects(readBlogArchive(projectRoot), (error) => {
    assert.ok(error instanceof BlogArchiveError);
    assert.equal(error.code, "duplicate-slug");
    assert.match(error.message, /duplicate-identifier.*also used by/);
    assert.notEqual(error.filePath, fixtureFile);
    return true;
  });
});

test("the current archive contains 91 deterministic posts with valid local covers", async () => {
  const posts = await readBlogArchive(projectRoot);
  assert.equal(posts.length, 91);
  assert.deepEqual(
    posts.map((post) => post.filePath),
    posts.map((post) => post.filePath).sort()
  );
  assert.deepEqual(await readBlogArchive(projectRoot), posts);
  assert.equal(new Set(posts.map((post) => post.slug)).size, posts.length);
  for (const post of posts) {
    assert.ok((await fs.stat(post.coverPath)).isFile(), post.filePath);
    const original = matter(await fs.readFile(post.filePath, "utf8"));
    assert.equal(
      post.publishedAt,
      new Date(original.data.pubDate).toISOString(),
      post.filePath
    );
    assert.deepEqual(post.tags, original.data.tags, post.filePath);
    assert.equal(post.markdown, original.content, post.filePath);
    if (original.data.slug)
      assert.equal(post.slug, original.data.slug, post.filePath);
  }
});

test("all 91 archive posts match the captured original routes, metadata, and tags", async () => {
  const posts = await readBlogArchive(projectRoot);
  assert.equal(posts.length, 91);
  assert.deepEqual(
    posts.map((post) => post.slug).sort(),
    [...originalArchive.routes].sort()
  );
  assert.deepEqual(
    posts.map((post) => relative(archiveRoot, post.filePath)).sort(),
    originalArchive.sources.map((source) => source.file).sort()
  );
  const sources = new Map(
    originalArchive.sources.map((source) => [source.file, source])
  );
  for (const post of posts) {
    const source = sources.get(relative(archiveRoot, post.filePath));
    assert.ok(source, post.filePath);
    assert.equal(
      post.slug,
      source.slug ?? source.file.replace(/\/index\.md$/, ""),
      post.filePath
    );
    assert.equal(post.title, source.title, post.filePath);
    assert.equal(post.publishedAt, source.date, post.filePath);
  }
  assert.deepEqual(
    [...new Set(posts.flatMap((post) => post.tags))].sort(),
    [...originalArchive.tags].sort()
  );
});

test("source files that disappear after enumeration report their exact path", async (context) => {
  const missing = new DOMException("Source disappeared", "NotFoundError");
  context.mock.method(fs, "readFile", async () => {
    throw missing;
  });
  await assert.rejects(readBlogArchive(projectRoot), (error) => {
    assert.ok(error instanceof BlogArchiveError);
    assert.equal(error.code, "archive-read");
    assert.equal(error.cause, missing);
    assert.ok(error.filePath.startsWith(archiveRoot));
    assert.ok(error.filePath.endsWith(".md"));
    return true;
  });
});

const markdownParser = new MarkdownIt({
  html: true,
  linkify: false,
  typographer: false,
});
const resolveImage = (source: string): ResolvedBlogImage => ({
  id: `asset-${encodeURIComponent(source)}`,
  url: `/media/${encodeURIComponent(source)}`,
  width: 640,
  height: 480,
});

function isTextBlock(
  block: PortableTextBlock
): block is PortableTextBlock & PortableTextTextBlock {
  return block._type === "block";
}

function isImageBlock(
  block: PortableTextBlock
): block is PortableTextBlock & PortableTextImageBlock {
  return block._type === "image";
}

function isTableBlock(
  block: PortableTextBlock
): block is PortableTextBlock & PortableTextTableBlock {
  return block._type === "table";
}

function spanText(spans: PortableTextSpan[]): string {
  return spans.map((span) => span.text).join("");
}

function flattenTokens(tokens: Token[]): Token[] {
  return tokens.flatMap((token) => [
    token,
    ...flattenTokens(token.children ?? []),
  ]);
}

function decodeRenderedHtml(text: string): string {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function portableCode(blocks: PortableTextBlock[]): string[] {
  return blocks.flatMap((block) => {
    if (block._type === "code") {
      assert.equal(typeof block.code, "string");
      return [block.code as string];
    }
    if (block._type === "htmlBlock") {
      assert.equal(typeof block.html, "string");
      return [
        ...(block.html as string).matchAll(
          /<pre><code\b[^>]*>([\s\S]*?)<\/code><\/pre>/g
        ),
      ].map((match) => decodeRenderedHtml(match[1]));
    }
    return [];
  });
}

function imageCount(blocks: PortableTextBlock[]): number {
  return blocks.reduce(
    (count, block) =>
      count +
      (block._type === "image"
        ? 1
        : block._type === "htmlBlock"
          ? (String(block.html).match(/<img\b/g)?.length ?? 0)
          : 0),
    0
  );
}

function assertKeysAndMarks(blocks: PortableTextBlock[]): void {
  const keys = new Set<string>();
  const visit = (value: unknown) => {
    if (Array.isArray(value)) return value.forEach(visit);
    if (!value || typeof value !== "object") return;
    const record = value as Record<string, unknown>;
    if ("_key" in record) {
      assert.equal(typeof record._key, "string");
      assert.ok(
        !keys.has(record._key as string),
        `duplicate key ${record._key}`
      );
      keys.add(record._key as string);
    }
    if (record._type === "block" || record._type === "tableCell") {
      const definitions = new Set(
        ((record.markDefs ?? []) as Array<{ _key: string }>).map(
          (definition) => definition._key
        )
      );
      const decorators = new Set(["strong", "em", "code", "strike-through"]);
      for (const span of (record.children ??
        record.content ??
        []) as PortableTextSpan[]) {
        for (const mark of span.marks ?? [])
          assert.ok(
            decorators.has(mark) || definitions.has(mark),
            `dangling mark reference ${mark}`
          );
      }
    }
    Object.values(record).forEach(visit);
  };
  visit(blocks);
}

test("headings, paragraphs, mixed inline marks, escapes, and breaks use native text blocks", () => {
  const markdown =
    "# Heading\n\nPlain **bold _both_** and _italic_ with ~~deleted~~ and `code <tag>`.\\\nNext &amp; final.\n\n---\n";
  const blocks = markdownToBlogPortableText(markdown, resolveImage);
  assert.deepEqual(
    blocks.map((block) => block._type),
    ["block", "block", "break"]
  );
  const text = blocks.filter(isTextBlock);
  assert.equal(text[0].style, "h1");
  assert.equal(text[1].style, "normal");
  assert.equal(
    spanText(text[1].children),
    "Plain bold both and italic with deleted and code <tag>.\nNext & final."
  );
  assert.deepEqual(
    text[1].children.find((span) => span.text === "both")?.marks,
    ["strong", "em"]
  );
  assert.deepEqual(
    text[1].children.find((span) => span.text === "deleted")?.marks,
    ["strike-through"]
  );
  assert.deepEqual(
    text[1].children.find((span) => span.text === "code <tag>")?.marks,
    ["code"]
  );
  assertKeysAndMarks(blocks);
});

test("parenthesized link destinations, reference links, titles, and nested marks are preserved", () => {
  const markdown =
    '[**bold _link_**](https://example.com/path_(one) "A title") and [reference][docs].\n\n[docs]: https://example.com/a_(b) "Docs"\n';
  const blocks = markdownToBlogPortableText(markdown, resolveImage);
  const block = blocks.filter(isTextBlock)[0];
  assert.equal(spanText(block.children), "bold link and reference.");
  assert.deepEqual(
    block.markDefs?.map((definition) => [definition.href, definition.title]),
    [
      ["https://example.com/path_(one)", "A title"],
      ["https://example.com/a_(b)", "Docs"],
    ]
  );
  const nested = block.children.find((span) => span.text === "link");
  assert.ok(nested?.marks?.includes("strong"));
  assert.ok(nested?.marks?.includes("em"));
  assertKeysAndMarks(blocks);
});

test("native Portable Text renders mixed marks and links through the independent HTML serializer", () => {
  const blocks = markdownToBlogPortableText(
    "## Heading\n\n**bold _both_** and [link](https://example.com/a_(b)) with `code`.\n",
    resolveImage
  );
  const html = toHTML(blocks, {
    onMissingComponent: (_message, context) =>
      assert.fail(`missing serializer for ${context.type}`),
  });
  assert.match(html, /<h2>Heading<\/h2>/);
  assert.match(html, /<strong>bold <em>both<\/em><\/strong>/);
  assert.match(html, /href="https:\/\/example.com\/a_\(b\)"/);
  assert.match(html, /<code>code<\/code>/);
});

test("GFM tables retain marked and empty cells, alignment, escaped pipes, and cell-local links", () => {
  const markdown =
    "| **Name** | _Value_ | Link |\n| :--- | :---: | ---: |\n| `a` | ~~b~~ | [docs](https://example.com/a_(b)) |\n| a\\|b | | [again](https://example.com/a_(b)) |\n";
  const blocks = markdownToBlogPortableText(markdown, resolveImage);
  assert.equal(blocks.length, 1);
  assert.ok(isTableBlock(blocks[0]));
  const table = blocks[0];
  assert.equal(table.hasHeaderRow, true);
  assert.equal(table.rows.length, 3);
  assert.deepEqual(
    table.rows[0].cells.map((cell) => cell.textAlign),
    ["left", "center", "right"]
  );
  assert.ok(table.rows[0].cells.every((cell) => cell.isHeader));
  assert.deepEqual(table.rows[0].cells[0].content[0].marks, ["strong"]);
  assert.deepEqual(table.rows[0].cells[1].content[0].marks, ["em"]);
  assert.deepEqual(table.rows[1].cells[0].content[0].marks, ["code"]);
  assert.deepEqual(table.rows[1].cells[1].content[0].marks, ["strike-through"]);
  assert.equal(spanText(table.rows[2].cells[0].content), "a|b");
  assert.equal(spanText(table.rows[2].cells[1].content), "");
  assert.equal(
    table.rows[1].cells[2].markDefs?.[0].href,
    "https://example.com/a_(b)"
  );
  assert.notEqual(
    table.rows[1].cells[2].markDefs?.[0]._key,
    table.rows[2].cells[2].markDefs?.[0]._key
  );
  assertKeysAndMarks(blocks);
});

test("ordinary nested lists and ordered starts are native and keep list identities", () => {
  const markdown =
    "3. Third\n   - child **bold**\n\n     7. nested seven\n     8. nested eight\n4. Fourth\n\n9) Separate ninth\n10) Separate tenth\n";
  const blocks = markdownToBlogPortableText(markdown, resolveImage);
  assert.ok(blocks.every(isTextBlock));
  const items = blocks.filter(isTextBlock);
  assert.deepEqual(
    items.map((block) => [
      spanText(block.children),
      block.listItem,
      block.level,
      block.listStart,
    ]),
    [
      ["Third", "number", 1, 3],
      ["child bold", "bullet", 2, undefined],
      ["nested seven", "number", 3, 7],
      ["nested eight", "number", 3, 7],
      ["Fourth", "number", 1, 3],
      ["Separate ninth", "number", 1, 9],
      ["Separate tenth", "number", 1, 9],
    ]
  );
  assert.equal(items[0].listId, items[4].listId);
  assert.equal(items[2].listId, items[3].listId);
  assert.equal(items[5].listId, items[6].listId);
  assert.notEqual(items[0].listId, items[2].listId);
  assert.notEqual(items[0].listId, items[5].listId);
  assertKeysAndMarks(blocks);
});

test("separate bullet lists and zero-start ordered lists retain their HTML grouping", () => {
  for (const markdown of [
    "- first\n* separate\n",
    "- parent\n  - first\n  * separate\n",
    "0. zero\n1. one\n",
  ]) {
    const blocks = markdownToBlogPortableText(markdown, resolveImage);
    assert.ok(blocks.some((block) => block._type === "htmlBlock"));
    if (markdown.startsWith("0."))
      assert.match(String(blocks[0].html), /<ol start="0">/);
    assertKeysAndMarks(blocks);
  }
});

test("complex list items preserve paragraphs, exact code, and resolved GIFs in sanitized HTML", () => {
  const markdown =
    '3. First **item**.\n\n   A separate paragraph with `inline code`.\n\n   ```jsx\n   import Thing from "./thing";\n   const value = <Thing text="&lt;literal>" />;\n   const pattern = "\\\\* ![not an image](./fake.png)";\n   ```\n\n   ![Moving `image`](./clip.gif "GIF title")\n\n4. Last item.\n';
  const calls: string[] = [];
  const blocks = markdownToBlogPortableText(markdown, (source) => {
    calls.push(source);
    return resolveImage(source);
  });
  assert.deepEqual(calls, ["./clip.gif"]);
  assert.equal(blocks.length, 1);
  assert.equal(blocks[0]._type, "htmlBlock");
  assert.match(String(blocks[0].html), /<ol start="3">/);
  assert.match(
    String(blocks[0].html),
    /A separate paragraph with <code>inline code<\/code>/
  );
  assert.match(String(blocks[0].html), /alt="Moving image" title="GIF title"/);
  assert.match(
    String(blocks[0].html),
    /src="\/media\/%2E|src="\/media\/\.%2Fclip.gif"/
  );
  assert.ok(!String(blocks[0].html).includes('src="./clip.gif"'));
  assert.deepEqual(
    portableCode(blocks),
    markdownParser
      .parse(markdown, {})
      .filter((token) => token.type === "fence")
      .map((token) => token.content)
  );
  assert.equal(imageCount(blocks), 1);
  assertKeysAndMarks(blocks);
});

test("complex quotes preserve nested content and exact indented and fenced code", () => {
  const markdown =
    '> Quote **start**.\n>\n> ```tsx\n> import { Widget } from "./widget";\n> <Widget value="<literal>" />;\n> ```\n>\n> - Nested list\n>   - ![quoted](./quote.gif "Quoted")\n>\n>     const indented = "& exact";\n>\n> Final paragraph.\n';
  const blocks = markdownToBlogPortableText(markdown, resolveImage);
  assert.equal(blocks.length, 1);
  assert.equal(blocks[0]._type, "htmlBlock");
  assert.match(String(blocks[0].html), /^<blockquote>/);
  assert.match(String(blocks[0].html), /Final paragraph\./);
  assert.deepEqual(
    portableCode(blocks),
    markdownParser
      .parse(markdown, {})
      .filter((token) => token.type === "fence" || token.type === "code_block")
      .map((token) => token.content)
  );
  assert.equal(imageCount(blocks), 1);
});

test("simple quotes stay native while multi-paragraph quotes retain grouping", () => {
  const simple = markdownToBlogPortableText(
    "> One **paragraph**.\n",
    resolveImage
  );
  assert.ok(isTextBlock(simple[0]));
  assert.equal(simple[0].style, "blockquote");
  const multiple = markdownToBlogPortableText(
    "> First.\n>\n> Second.\n",
    resolveImage
  );
  assert.equal(multiple[0]._type, "htmlBlock");
  assert.match(String(multiple[0].html), /<p>First\.<\/p>\n<p>Second\.<\/p>/);
});

test("fallbacks preserve empty links, empty alt, and whitespace titles", () => {
  const markdown =
    '- [download](https://example.com/archive) and [current page]()\n\n  ![](./image.gif " ")\n';
  const blocks = markdownToBlogPortableText(markdown, resolveImage);
  assert.equal(blocks[0]._type, "htmlBlock");
  assert.match(String(blocks[0].html), /href="https:\/\/example.com\/archive"/);
  assert.match(String(blocks[0].html), /href="">current page<\/a>/);
  assert.match(String(blocks[0].html), /alt="" title=" "/);
});

test("FTP and custom link schemes fail before conversion or image resolution", () => {
  for (const href of ["ftp://example.com/archive", "custom-protocol:thing"]) {
    const markdown = `[unsupported](${href}) ![image](./image.png)`;
    for (const convert of [
      () => getMarkdownImageSources(markdown),
      () =>
        markdownToBlogPortableText(markdown, () =>
          assert.fail("unsafe document resolved an image")
        ),
    ]) {
      assert.throws(convert, (error) => {
        assert.ok(error instanceof BlogMarkdownError);
        assert.equal(error.code, "unsupported-markdown");
        assert.equal(error.tokenType, "link_open");
        assert.equal(error.source, href);
        return true;
      });
    }
  }
});

test("empty-label links retain their hrefs, surrounding labels, and order in HTML fallbacks", () => {
  for (const [markdown, tag] of [
    ["[](#preparation)Preparation and [](#next)**Next**.", "p"],
    ["## [](#preparation)Preparation and [](#next)**Next**", "h2"],
    ["- [](#preparation)Preparation and [](#next)**Next**", "ul"],
    ["> [](#preparation)Preparation and [](#next)**Next**", "blockquote"],
    [
      "| [](#preparation)Preparation |\n| --- |\n| [](#next)**Next** |",
      "table",
    ],
  ]) {
    const blocks = markdownToBlogPortableText(markdown, resolveImage);
    assert.equal(blocks.length, 1);
    assert.equal(blocks[0]._type, "htmlBlock");
    const html = String(blocks[0].html);
    assert.ok(html.startsWith(`<${tag}>`), markdown);
    assert.match(html, /<a href="#preparation"><\/a>Preparation/);
    assert.match(html, /<a href="#next"><\/a><strong>Next<\/strong>/);
    assert.ok(html.indexOf("#preparation") < html.indexOf("#next"));
    assertKeysAndMarks(blocks);
  }
});

test("blank input, empty headings and items, and image-adjacent paragraphs preserve content", () => {
  assert.deepEqual(markdownToBlogPortableText("\n \n\n", resolveImage), []);
  const empty = markdownToBlogPortableText("#\n\n-\n", resolveImage);
  assert.ok(empty.every(isTextBlock));
  assert.equal(empty.length, 2);
  assert.ok(
    empty.filter(isTextBlock).every((block) => spanText(block.children) === "")
  );
  const markdown =
    '\n\n![first](./first.gif "First")Adjacent **text**.\n\nBefore ![middle](./middle.png) after.\n\n![last](./last.png)\n';
  const blocks = markdownToBlogPortableText(markdown, resolveImage);
  assert.deepEqual(
    blocks.map((block) => block._type),
    ["image", "block", "block", "image", "block", "image"]
  );
  assert.deepEqual(
    blocks.filter(isTextBlock).map((block) => spanText(block.children)),
    ["Adjacent text.", "Before ", " after."]
  );
  assert.equal(imageCount(blocks), 3);
  assertKeysAndMarks(blocks);
});

test("native images preserve alt, title, provider, dimensions, links, and surrounding marks", () => {
  const markdown =
    '**before [![alt `code` &amp; _em_](./motion.gif "Title &amp; stuff")](https://example.com/a_(b)) after**';
  const blocks = markdownToBlogPortableText(markdown, () => ({
    id: "media-id",
    url: "/media/motion.gif",
    provider: "custom",
    width: 1280,
    height: 720,
  }));
  const image = blocks.filter(isImageBlock)[0];
  assert.deepEqual(image.asset, {
    _ref: "media-id",
    url: "/media/motion.gif",
    provider: "custom",
  });
  assert.equal(image.alt, "alt code & em");
  assert.equal(image.title, "Title & stuff");
  assert.equal(image.caption, "");
  assert.equal(image.width, 1280);
  assert.equal(image.height, 720);
  assert.deepEqual(image.link, {
    href: "https://example.com/a_(b)",
  });
  assert.deepEqual(
    blocks
      .filter(isTextBlock)
      .map((block) => [spanText(block.children), block.children[0].marks]),
    [
      ["before ", ["strong"]],
      [" after", ["strong"]],
    ]
  );
  assertKeysAndMarks(blocks);
});

test("titled image links use a narrow HTML fallback that retains both tooltips", () => {
  const blocks = markdownToBlogPortableText(
    `Native paragraph.\n\n**before [![alt code &amp; em](./motion.gif "Image tooltip")](../gallery 'Link "quote" &amp; more') after**\n\nNative tail.`,
    resolveImage
  );
  assert.deepEqual(
    blocks.map((block) => block._type),
    ["block", "htmlBlock", "block"]
  );
  assert.match(
    String(blocks[1].html),
    /<p><strong>before <a href="\.\.\/gallery" title="Link &quot;quote&quot; &amp; more"><img [^>]*alt="alt code &amp; em" title="Image tooltip"[^>]* \/><\/a> after<\/strong><\/p>/
  );
  assertKeysAndMarks(blocks);
});

test("empty image-link hrefs survive admin normalization through an HTML fallback", () => {
  const blocks = markdownToBlogPortableText(
    "[![alt](./image.png)]()",
    resolveImage
  );
  assert.equal(blocks[0]._type, "htmlBlock");
  assert.match(
    String(blocks[0].html),
    /<a href=""><img [^>]*alt="alt"[^>]* \/><\/a>/
  );
});

test("all image tokens in paragraphs, lists, quotes, and tables resolve in source order", () => {
  const markdown =
    'Text![one](./one.gif)tail\n\n- ![two][ref]\n\n> ![three](./three.png)\n\n| Image | Content |\n| --- | --- |\n| a![four](./four.gif "Four")b | **marked** |\n\n![again](./one.gif)\n\n[ref]: ./two.png "Two"\n';
  assert.deepEqual(getMarkdownImageSources(markdown), [
    "./one.gif",
    "./two.png",
    "./three.png",
    "./four.gif",
  ]);
  const calls: string[] = [];
  const blocks = markdownToBlogPortableText(markdown, (source) => {
    calls.push(source);
    return resolveImage(source);
  });
  assert.deepEqual(calls, [
    "./one.gif",
    "./two.png",
    "./three.png",
    "./four.gif",
    "./one.gif",
  ]);
  assert.equal(imageCount(blocks), calls.length);
  const table = blocks.find(
    (block) =>
      block._type === "htmlBlock" && String(block.html).startsWith("<table>")
  );
  assert.ok(table);
  assert.match(String(table.html), /a<img[^>]+title="Four"[^>]* \/>b/);
  assert.ok(!String(table.html).includes('src="./four.gif"'));
  assertKeysAndMarks(blocks);
});

test("fenced literal JSX and imports and indented code remain exact native code", () => {
  const markdown =
    '```jsx\nimport Image from "astro:assets";\nconst example = <Widget src="./not-an-image.gif" />;\n// ![not an image](./not-an-image.png)\n```\n\n    import { literal } from "./module";\n    const html = "<script> & text";\n\n```plain text\nA multi-word language label.\n```\n';
  const blocks = markdownToBlogPortableText(markdown, () =>
    assert.fail("code must not resolve images")
  );
  assert.ok(blocks.every((block) => block._type === "code"));
  assert.deepEqual(getMarkdownImageSources(markdown), []);
  assert.deepEqual(
    portableCode(blocks),
    markdownParser
      .parse(markdown, {})
      .filter((token) => token.type === "fence" || token.type === "code_block")
      .map((token) => token.content)
  );
  assert.deepEqual(
    blocks.map((block) => block.language),
    ["jsx", undefined, "plain text"]
  );
  assertKeysAndMarks(blocks);
});

test("inert HTML comments survive sanitization and inline br becomes a native newline", () => {
  const markdown =
    "<!-- Meta: source metadata -->\n\n- Item\n\n  <!-- preserve this comment -->\n\n  Another paragraph.\n\nText<br />next.\n";
  const blocks = markdownToBlogPortableText(markdown, resolveImage);
  assert.equal(blocks[0]._type, "htmlBlock");
  assert.equal(blocks[0].html, "<!-- Meta: source metadata -->\n");
  assert.match(String(blocks[1].html), /<!-- preserve this comment -->/);
  assert.ok(!String(blocks[1].html).includes("data-blog-comment"));
  const text = blocks.filter(isTextBlock).at(-1);
  assert.ok(text);
  assert.equal(spanText(text.children), "Text\nnext.");
});

function assertUnsupportedCommentHtml(markdown: string): void {
  const calls: string[] = [];
  const unsupportedHtml = (error: unknown) => {
    assert.ok(error instanceof BlogMarkdownError);
    assert.equal(error.code, "unsupported-html");
    assert.equal(error.tokenType, "html_block");
    assert.equal(error.line, 1);
    assert.equal(error.source?.trimEnd(), markdown.trimEnd());
    return true;
  };
  assert.throws(() => getMarkdownImageSources(markdown), unsupportedHtml);
  assert.throws(
    () =>
      markdownToBlogPortableText(markdown, (source) => {
        calls.push(source);
        return resolveImage(source);
      }),
    unsupportedHtml
  );
  assert.deepEqual(calls, []);
}

for (const [name, markdown] of [
  ["raw images", '<!-- before --> <img src="./missing.png"> <!-- after -->'],
  ["JSX", '<!-- before --> <Widget src="./missing.png" /> <!-- after -->'],
  ["nonwhitespace text", "<!-- before --> visible text <!-- after -->"],
]) {
  test(`comment-only HTML rejects mixed ${name} at the first closing delimiter`, () => {
    assertUnsupportedCommentHtml(markdown);
  });
}

test("comment-only HTML rejects malformed and unclosed comments", () => {
  for (const markdown of [
    "<!-->",
    "<!--->",
    "<!-- unclosed",
    "<!-- before --> <!-- unclosed",
    "<!-- invalid --!>",
    "<!-- before --> <!--> <!-- after -->",
    "<!-- before --> <!---> <!-- after -->",
    "<!-- nested <!-- child -->",
    "<!-- ends with a dash --->",
  ])
    assertUnsupportedCommentHtml(markdown);
});

test("comment-only HTML preserves whitespace-separated valid comments and inert contents", () => {
  for (const markdown of [
    "<!---->\n",
    "<!-- first -->\t \u00a0<!----><!-- last -->\n",
    "<!-- first -->\r\n<!-- second -->\n",
    '<!-- <img src="./missing.png"> <Widget /> -->\n',
    "Before <!-- inert comment --> after.\n",
    "<!-- repeated --> ".repeat(2048),
  ]) {
    assert.deepEqual(getMarkdownImageSources(markdown), []);
    const blocks = markdownToBlogPortableText(markdown, () =>
      assert.fail("inert comments must not resolve images")
    );
    assert.ok(blocks.every((block) => block._type === "htmlBlock"));
    assert.equal(
      blocks.map((block) => String(block.html)).join(""),
      markdownParser.render(markdown)
    );
  }
});

test("comment-only HTML rejects long repeated comments followed by nonwhitespace", () => {
  const comments = "<!-- repeated --> ".repeat(2048);
  assertUnsupportedCommentHtml(`${comments}not a comment`);
});

test("unsupported raw HTML and live JSX fail with typed source context rather than disappearing", () => {
  for (const markdown of [
    '<script>alert("bad")</script>',
    '<Widget image="./image.png" />',
    '<img src="./raw.png" onerror="alert(1)">',
    "<!--> <script>alert(1)</script> -->",
  ]) {
    assert.throws(
      () => markdownToBlogPortableText(markdown, resolveImage),
      (error) => {
        assert.ok(error instanceof BlogMarkdownError);
        assert.equal(error.code, "unsupported-html");
        assert.equal(error.line, 1);
        assert.ok(error.source);
        return true;
      }
    );
    assert.throws(() => getMarkdownImageSources(markdown), BlogMarkdownError);
  }
});

test("invalid image resolutions and resolver failures are typed and retain image context", () => {
  for (const image of [
    { id: "", url: "/media/a.png" },
    { id: "id", url: "javascript:alert(1)" },
    { id: "id", url: " ftp://example.com/image.png" },
    { id: "id", url: "/media/a.png", provider: "" },
    { id: "id", url: "/media/a.png", width: 0 },
    { id: "id", url: "/media/a.png", height: NaN },
  ]) {
    assert.throws(
      () => markdownToBlogPortableText("![image](./image.png)", () => image),
      (error) => {
        assert.ok(error instanceof BlogMarkdownError);
        assert.equal(error.code, "invalid-image");
        assert.equal(error.source, "./image.png");
        assert.equal(error.line, 1);
        return true;
      }
    );
  }
  const failure = new BlogArchiveError(
    "missing-image",
    fixtureFile,
    "missing image"
  );
  assert.throws(
    () =>
      markdownToBlogPortableText("![image](./image.png)", () => {
        throw failure;
      }),
    (error) => {
      assert.ok(error instanceof BlogMarkdownError);
      assert.equal(error.code, "image-resolution");
      assert.equal(error.cause, failure);
      assert.equal(error.source, "./image.png");
      return true;
    }
  );
  for (const markdown of ["![]()", "![embedded](data:image/png;base64,AA)"]) {
    assert.throws(() => getMarkdownImageSources(markdown), BlogMarkdownError);
    assert.throws(
      () => markdownToBlogPortableText(markdown, resolveImage),
      BlogMarkdownError
    );
  }
});

test("keys and mark references are deterministic and isolated between documents", () => {
  const markdown =
    "**[marked](https://example.com) ![image](./image.png) [marked](https://example.com)**\n\n| [cell](https://example.com) |\n| --- |\n| [another](https://example.com) |\n\n3. List\n";
  const first = markdownToBlogPortableText(markdown, resolveImage);
  markdownToBlogPortableText(
    "Different document with [other](https://example.net)",
    resolveImage
  );
  assert.deepEqual(markdownToBlogPortableText(markdown, resolveImage), first);
  assertKeysAndMarks(first);
});

test("all current articles convert with exact code, image and table counts, valid marks, and local media", async (context) => {
  const posts = await readBlogArchive(projectRoot);
  let codeBlocks = 0;
  let imageTokens = 0;
  let tables = 0;
  let localImageReferences = 0;
  let remoteImageReferences = 0;
  const fallbackTypes: Record<string, number> = {};
  const fallbackPosts: Array<{ slug: string; types: string[] }> = [];
  for (const post of posts) {
    const tokens = markdownParser.parse(post.markdown, {});
    const expectedCode = tokens
      .filter((token) => token.type === "fence" || token.type === "code_block")
      .map((token) => token.content);
    const expectedImages = flattenTokens(tokens).filter(
      (token) => token.type === "image"
    );
    const expectedTables = tokens.filter(
      (token) => token.type === "table_open"
    ).length;
    const calls: string[] = [];
    let blocks: PortableTextBlock[] = [];
    assert.doesNotThrow(() => {
      blocks = markdownToBlogPortableText(post.markdown, (source) => {
        calls.push(source);
        return resolveImage(source);
      });
    }, post.filePath);
    assert.deepEqual(portableCode(blocks), expectedCode, post.filePath);
    assert.equal(imageCount(blocks), expectedImages.length, post.filePath);
    assert.deepEqual(
      calls,
      expectedImages.map((token) => token.attrGet("src")),
      post.filePath
    );
    assert.equal(
      blocks.filter(isTableBlock).length +
        blocks
          .filter((block) => block._type === "htmlBlock")
          .reduce(
            (count, block) =>
              count + (String(block.html).match(/<table>/g)?.length ?? 0),
            0
          ),
      expectedTables,
      post.filePath
    );
    assert.deepEqual(
      markdownToBlogPortableText(post.markdown, resolveImage),
      blocks,
      post.filePath
    );
    assertKeysAndMarks(blocks);
    const sources = getMarkdownImageSources(post.markdown);
    assert.deepEqual(sources, [...new Set(calls)], post.filePath);
    for (const source of sources) {
      const local = await resolveLocalBlogImagePath(
        source,
        post.filePath,
        projectRoot
      );
      if (local) {
        assert.ok(
          (await fs.stat(local)).isFile(),
          `${post.filePath}: ${source}`
        );
        if (/\.gif(?:[?#]|$)/i.test(source)) assert.match(local, /\.gif$/i);
        localImageReferences++;
      } else remoteImageReferences++;
    }
    const types: string[] = [];
    for (const block of blocks.filter((block) => block._type === "htmlBlock")) {
      const html = String(block.html).trimStart();
      const type = /^<(?:ul|ol)\b/.test(html)
        ? "list"
        : html.startsWith("<blockquote>")
          ? "blockquote"
          : html.startsWith("<table>")
            ? "table"
            : html.startsWith("<!--")
              ? "comment"
              : "text";
      fallbackTypes[type] = (fallbackTypes[type] ?? 0) + 1;
      types.push(type);
      assert.ok(!/src="(?:\.\/|\.\.\/)/.test(html), post.filePath);
    }
    if (types.length) fallbackPosts.push({ slug: post.slug, types });
    codeBlocks += expectedCode.length;
    imageTokens += expectedImages.length;
    tables += expectedTables;
  }
  assert.equal(posts.length, 91);
  context.diagnostic(
    JSON.stringify({
      posts: posts.length,
      codeBlocks,
      imageTokens,
      tables,
      localImageReferences,
      remoteImageReferences,
      htmlFallbacks: fallbackTypes,
      fallbackPosts,
    })
  );
});
