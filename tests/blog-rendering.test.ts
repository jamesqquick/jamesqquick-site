import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { DomUtils, parseDocument } from "htmlparser2";
import { readBlogArchive } from "../scripts/blog-archive";
import { markdownToBlogPortableText } from "../scripts/blog-markdown";
import { portableTextToFeedHtml } from "../src/utils/blog-feed";
import { splitBlogCodeBlocks } from "../src/utils/blog-code";
import {
  addBlogHeadingIds,
  getBlogHeadingText,
} from "../src/utils/blog-headings";

const SITE = "https://jamesqquick.com/";
const require = createRequire(import.meta.url);
const astro = createRequire(require.resolve("astro/package.json"));
const emdash = createRequire(require.resolve("emdash"));
const portabletext = createRequire(emdash.resolve("astro-portabletext"));
const { buildMarksTree } = portabletext("@portabletext/toolkit");
const sourceRenderer: Promise<{
  render(
    source: string
  ): Promise<{ metadata: { headings: { slug: string }[] } }>;
}> = import(pathToFileURL(astro.resolve("@astrojs/markdown-remark")).href).then(
  ({ createMarkdownProcessor }) =>
    createMarkdownProcessor({ syntaxHighlight: false })
);

function headingIds(html: string): Array<string | undefined> {
  return DomUtils.findAll(
    (element) => /^h[1-6]$/.test(element.name),
    parseDocument(html).children
  ).map((element) => element.attribs.id);
}

function renderMarkdown(markdown: string): string {
  return portableTextToFeedHtml(
    markdownToBlogPortableText(markdown, (source) => ({
      id: `image-${encodeURIComponent(source)}`,
      url: new URL(source, SITE).href,
    })),
    SITE
  );
}

test("native and HTML-fallback headings share duplicate anchor handling", () => {
  const markdown = "## Repeat\n\n## **Repeat**\n\n## `Repeat`<br>\n";
  assert.deepEqual(headingIds(renderMarkdown(markdown)), [
    "repeat",
    "repeat-1",
    "repeat-2",
  ]);
  assert.deepEqual(headingIds(renderMarkdown(markdown)), [
    "repeat",
    "repeat-1",
    "repeat-2",
  ]);
});

test("marked text, entities, Unicode, and inline code retain Astro heading IDs", async () => {
  const markdown =
    "## **Hello** & `TypeScript`\n\n## Déjà vu 中文\n\n## 😄 &amp; **Next**\n\n## `a  b`<br>next\n";
  const original = await (await sourceRenderer).render(markdown);
  assert.deepEqual(
    headingIds(renderMarkdown(markdown)),
    original.metadata.headings.map((heading) => heading.slug)
  );
});

test("HTML fallback headings retain explicit IDs after sanitization", () => {
  const html = portableTextToFeedHtml(
    [
      {
        _type: "htmlBlock",
        _key: "headings",
        html: '<h2 id="custom-anchor">Title</h2><h3 id="">Empty ID</h3><h2>Title</h2>',
      },
    ],
    SITE
  );
  assert.deepEqual(headingIds(html), ["custom-anchor", "empty-id", "title"]);
});

test("public heading processing changes only missing IDs, preserving all other markup", () => {
  const html =
    '<script>const example = "<h2>Not a heading</h2>";</script>\r\n' +
    '<h2 class="emdash-align-center" data-example="&quot;">A &amp; <code>B  C</code></h2>\n' +
    '<div class="emdash-html-block"><h3>Again</h3></div>' +
    '<h2 id="custom">Title</h2><h3 id="">Empty ID</h3>' +
    '<pre class="astro-code"><code>  &lt;h2&gt;example&lt;/h2&gt;\r\n\t  </code></pre>';
  const expected = html
    .replace('<h2 class="', '<h2 id="a--b--c" class="')
    .replace("<h3>Again</h3>", '<h3 id="again">Again</h3>');
  assert.equal(addBlogHeadingIds(html), expected);
  assert.equal(addBlogHeadingIds(expected), expected);
});

test("native heading anchors use source text rather than component padding", () => {
  const html =
    '<h3 data-blog-heading-text="Vercel AI SDK"> Vercel AI SDK </h3>' +
    '<h2 data-blog-heading-text="a  b"> <code> a  b </code> </h2>' +
    '<div class="emdash-html-block"><h3>Vercel AI SDK</h3></div>';
  assert.deepEqual(headingIds(addBlogHeadingIds(html)), [
    "vercel-ai-sdk",
    "a--b",
    "vercel-ai-sdk-1",
  ]);
});

test("native heading text survives the installed renderer's nested marks transformation", () => {
  const [block] = markdownToBlogPortableText(
    "## **Hello** & `a  b` [中文](https://example.com)",
    () => ({ id: "unused", url: SITE })
  );
  assert.equal(block._type, "block");
  if (block._type !== "block") assert.fail("Expected a text block");
  assert.ok(Array.isArray(block.children));
  const expected = "Hello & a  b 中文";
  assert.equal(getBlogHeadingText(block.children), expected);
  assert.equal(getBlogHeadingText(buildMarksTree(block)), expected);
});

test("HTML-fallback code preserves literal text, attributes, and surrounding list markup", () => {
  const code = 'const  html = "<script> &amp;";\r\n\treturn html;  \n';
  const before = '<ol start="5"><li><p>Before.</p>\r\n';
  const after = "<p>After.</p></li></ol>";
  const escapedCode = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const html = `${before}<pre id="example"><code class="language-ts">${escapedCode}</code></pre>${after}`;
  const segments = splitBlogCodeBlocks(html);
  assert.equal(segments.length, 3);
  assert.deepEqual(segments[0], { html: before });
  assert.deepEqual(segments[2], { html: after });
  const segment = segments[1];
  assert.ok(segment && "code" in segment);
  assert.equal(segment.code, code);
  assert.equal(segment.lang, "ts");
  assert.deepEqual(segment.attributes, { id: "example" });
});

test("code processing keeps highlighted blocks intact and renders unknown languages as plaintext", () => {
  const highlighted =
    '<pre class="astro-code github-dark"><code><span style="color:#FFF">const x = 1;</span></code></pre>';
  const unknown =
    '<pre><code class="language-not-a-language">a &amp; b</code></pre>';
  const segments = splitBlogCodeBlocks(highlighted + unknown);
  assert.equal(segments.length, 3);
  assert.deepEqual(segments[0], { html: highlighted });
  assert.deepEqual(segments[2], { html: "" });
  const segment = segments[1];
  assert.ok(segment && "code" in segment);
  assert.equal(segment.code, "a & b");
  assert.equal(segment.lang, "plaintext");
  assert.deepEqual(segment.attributes, {});
  assert.deepEqual(splitBlogCodeBlocks("<pre>No code element</pre>"), [
    { html: "<pre>No code element</pre>" },
  ]);
});

test("fallback highlighting preserves both element attributes and matches original Astro code whitespace", async () => {
  const { createShikiHighlighter } = await import(
    pathToFileURL(astro.resolve("@astrojs/internal-helpers/shiki")).href
  );
  const { createMarkdownProcessor } = await import(
    pathToFileURL(astro.resolve("@astrojs/markdown-remark")).href
  );
  const highlighter = await createShikiHighlighter({
    langs: ["ts"],
    theme: "github-dark",
  });
  const originalRenderer = await createMarkdownProcessor();
  for (const literal of [
    "const  x = 1;\n",
    "const  x = 1;\n\n",
    'const html = "<script> &amp;";\r\n\treturn html;  \r\n',
    "",
  ]) {
    const escaped = literal.replace(/&/g, "&amp;").replace(/</g, "&lt;");
    const segments = splitBlogCodeBlocks(
      `<pre id="outer" class="custom-pre"><code id="example" class="language-ts custom" data-example="&quot;&lt;&amp;">${escaped}</code></pre>`
    );
    const segment = segments[1];
    assert.ok(segment && "code" in segment);
    const rendered = await highlighter.codeToHtml(segment.code, segment.lang, {
      attributes: segment.attributes,
      transformers: segment.transformers,
    });
    const document = parseDocument(rendered);
    const pre = DomUtils.findOne(
      (node) => node.name === "pre",
      document.children
    );
    const code = DomUtils.findOne(
      (node) => node.name === "code",
      document.children
    );
    assert.ok(pre && code);
    assert.equal(pre.attribs.id, "outer");
    assert.ok(pre.attribs.class.split(/\s+/).includes("custom-pre"));
    assert.deepEqual(code.attribs, {
      id: "example",
      class: "language-ts custom",
      "data-example": '"<&',
    });
    const original = await originalRenderer.render(
      `\`\`\`ts\n${literal}\`\`\`\n`
    );
    const originalCode = DomUtils.findOne(
      (node) => node.name === "code",
      parseDocument(original.code).children
    );
    assert.ok(originalCode);
    assert.equal(
      DomUtils.textContent(code),
      DomUtils.textContent(originalCode)
    );
  }
});

test("all 92 archive posts retain their original Astro heading anchors", async (context) => {
  const posts = await readBlogArchive(
    fileURLToPath(new URL("../", import.meta.url))
  );
  assert.equal(posts.length, 92);
  const renderer = await sourceRenderer;
  let count = 0;
  for (const post of posts) {
    const original = await renderer.render(post.markdown);
    const expected = original.metadata.headings.map((heading) => heading.slug);
    assert.deepEqual(
      headingIds(renderMarkdown(post.markdown)),
      expected,
      post.slug
    );
    count += expected.length;
  }
  context.diagnostic(`Compared ${count} heading anchors across all 92 posts.`);
});
