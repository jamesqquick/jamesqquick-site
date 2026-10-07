import assert from "node:assert/strict";
import { test } from "node:test";
import type { PortableTextBlock } from "emdash";
import {
  BlogFeedContentError,
  portableTextToFeedHtml,
  sanitizeBlogHtml,
} from "../src/utils/blog-feed";

const SITE = "https://www.jamesqquick.com/";

function span(text: string, marks: string[] = []): PortableTextBlock {
  return { _type: "span", _key: "span", text, marks };
}

function block(
  text: string,
  fields: Record<string, unknown> = {}
): PortableTextBlock {
  return {
    _type: "block",
    _key: "block",
    style: "normal",
    children: [span(text)],
    markDefs: [],
    ...fields,
  };
}

function image(fields: Record<string, unknown> = {}): PortableTextBlock {
  return {
    _type: "image",
    _key: "image",
    asset: { _ref: "media-id", url: "/images/example.png" },
    ...fields,
  };
}

function cell(
  text: string,
  fields: Record<string, unknown> = {}
): PortableTextBlock {
  return { _type: "tableCell", _key: "cell", content: [span(text)], ...fields };
}

function row(cells: PortableTextBlock[]): PortableTextBlock {
  return { _type: "tableRow", _key: "row", cells };
}

function htmlBlock(html: string): PortableTextBlock {
  return { _type: "htmlBlock", _key: "html", html };
}

function codeText(html: string): string {
  const contents = html.match(
    /<pre><code(?: [^>]*)?>([\s\S]*?)<\/code><\/pre>/
  )?.[1];
  assert.notEqual(contents, undefined, "Expected a code block");
  const entities: Record<string, string> = {
    "&amp;": "&",
    "&lt;": "<",
    "&gt;": ">",
    "&quot;": '"',
    "&#39;": "'",
  };
  return contents!.replace(
    /&(amp|lt|gt|quot|#39);/g,
    (entity) => entities[entity]
  );
}

test("renders standard blocks and EmDash decorators", () => {
  const html = portableTextToFeedHtml(
    [
      block("Heading <two>", { style: "h2" }),
      block("", {
        children: [
          span("bold", ["strong"]),
          span("italic", ["em"]),
          span("under", ["underline"]),
          span("deleted", ["strike-through"]),
          span("up", ["superscript"]),
          span("down", ["subscript"]),
          span("inline", ["code"]),
          span("line\nbreak"),
        ],
      }),
      block("Quoted", { style: "blockquote" }),
    ],
    SITE
  );
  assert.equal(
    html,
    '<h2 id="heading-two">Heading &lt;two&gt;</h2><p><strong>bold</strong><em>italic</em><u>under</u><del>deleted</del><sup>up</sup><sub>down</sub><code>inline</code>line<br />break</p><blockquote>Quoted</blockquote>'
  );
});

test("preserves repeated spaces and literal entities in paragraph inline code", () => {
  const html = portableTextToFeedHtml(
    [
      block("", {
        children: [
          span("Before "),
          span("  const  value = <tag> &amp;  ", ["code"]),
          span(" after"),
        ],
      }),
    ],
    SITE
  );
  assert.equal(
    html,
    "<p>Before <code>  const  value = &lt;tag&gt; &amp;amp;  </code> after</p>"
  );
});

test("preserves repeated spaces and literal entities in table-cell inline code", () => {
  const html = portableTextToFeedHtml(
    [
      {
        _type: "table",
        _key: "table",
        rows: [
          row([
            cell("", {
              content: [span("  a  b   <tag> &amp;  ", ["code"])],
            }),
          ]),
        ],
      },
    ],
    SITE
  );
  assert.equal(
    html,
    "<table><tbody><tr><td><p><code>  a  b   &lt;tag&gt; &amp;amp;  </code></p></td></tr></tbody></table>"
  );
});

test("preserves literal code, including spaces, CRLF, blank lines, and HTML entities", () => {
  const code =
    "\nconst  html = \"<script>alert('x')</script>\";\r\n\t  // &amp; & < >\n\n  return html;  \n";
  const html = portableTextToFeedHtml(
    [
      {
        _type: "code",
        _key: "code",
        code,
        language: "typescript",
        filename: "example.ts",
      },
    ],
    SITE
  );
  assert.equal(codeText(html), code);
  assert.match(html, /<code class="language-typescript">/);
  assert.match(html, /<div class="emdash-code-filename">example.ts<\/div>/);
  assert.doesNotMatch(html, /<script>|&nbsp;|<br/);
});

test("preserves empty code blocks", () => {
  assert.equal(
    portableTextToFeedHtml([{ _type: "code", _key: "empty", code: "" }], SITE),
    "<pre><code></code></pre>"
  );
});

test("escapes code metadata and language attribute payloads", () => {
  const html = portableTextToFeedHtml(
    [
      {
        _type: "code",
        _key: "code",
        code: '</code></pre><img src="x" onerror="alert(1)">',
        language: 'ts" onmouseover="alert(1)',
        filename: '<script>alert("filename")</script>',
      },
    ],
    SITE
  );
  assert.equal(codeText(html), '</code></pre><img src="x" onerror="alert(1)">');
  assert.match(html, /class="language-ts&quot; onmouseover=&quot;alert\(1\)"/);
  assert.doesNotMatch(html, /<script>|<img| onmouseover="/);
});

test("preserves the resolved storage-key media URL including its extension", () => {
  const html = portableTextToFeedHtml(
    [
      image({
        asset: {
          _ref: "01ARZ3NDEKTSV4RRFFQ69G5FAV",
          url: "/_emdash/api/media/file/01ARZ3NDEKTSV4RRFFQ69G5FAV.png",
        },
        alt: "A developer",
        title: "Photo",
        width: 640,
        height: 480,
        caption: "At the conference",
      }),
    ],
    SITE
  );
  assert.equal(
    html,
    '<figure><img src="https://www.jamesqquick.com/_emdash/api/media/file/01ARZ3NDEKTSV4RRFFQ69G5FAV.png" alt="A developer" title="Photo" width="640" height="480" /><figcaption>At the conference</figcaption></figure>'
  );
});

test("resolves relative image URLs against a URL site without mutating it", () => {
  const site = new URL("https://www.jamesqquick.com/blog/");
  const html = portableTextToFeedHtml(
    [
      image({
        asset: {
          _ref: "image-id",
          url: "images/example.png?size=large&fit=contain",
          provider: "local",
        },
        alt: "",
      }),
    ],
    site
  );
  assert.match(
    html,
    /src="https:\/\/www\.jamesqquick\.com\/blog\/images\/example\.png\?size=large&amp;fit=contain"/
  );
  assert.match(html, /alt=""/);
  assert.equal(site.href, "https://www.jamesqquick.com/blog/");
});

test("preserves GIF URLs and absolute external media URLs", () => {
  const html = portableTextToFeedHtml(
    [
      image({
        asset: { _ref: "gif", url: "/images/demo.gif" },
        alt: "Animated demo",
      }),
      image({
        asset: {
          _ref: "external",
          url: "https://cdn.example.com/demo.gif?frame=all",
          provider: "external",
        },
      }),
      image({ asset: { _ref: "cdn", url: "//cdn.example.com/animation.gif" } }),
    ],
    SITE
  );
  assert.match(
    html,
    /src="https:\/\/www\.jamesqquick\.com\/images\/demo\.gif"/
  );
  assert.match(html, /src="https:\/\/cdn\.example\.com\/demo\.gif\?frame=all"/);
  assert.match(html, /src="https:\/\/cdn\.example\.com\/animation\.gif"/);
});

test("uses display dimensions with the original image aspect ratio", () => {
  const html = portableTextToFeedHtml(
    [image({ width: 800, height: 600, displayWidth: 400 })],
    SITE
  );
  assert.match(html, /width="400" height="300"/);
});

test("preserves encoded storage-key URLs independently of the media reference", () => {
  const html = portableTextToFeedHtml(
    [
      image({
        asset: {
          _ref: 'unrelated/id?size=1#"<tag>',
          url: "/_emdash/api/media/file/nested/stored%20image.gif?download=1&version=2",
        },
      }),
    ],
    SITE
  );
  assert.equal(
    html,
    '<figure><img src="https://www.jamesqquick.com/_emdash/api/media/file/nested/stored%20image.gif?download=1&amp;version=2" alt="" /></figure>'
  );
});

test("unresolved image references fail with a typed error and reference context", () => {
  for (const url of [undefined, null, "", " \t ", 123]) {
    assert.throws(
      () =>
        portableTextToFeedHtml(
          [image({ asset: { _ref: "unresolved-image-id", url } })],
          SITE
        ),
      (error) => {
        assert.ok(error instanceof BlogFeedContentError);
        assert.equal(error.blockType, "image");
        assert.match(error.message, /unresolved-image-id/);
        assert.match(error.message, /asset\.url/);
        return true;
      }
    );
  }
});

test("unresolved gallery references fail instead of inventing media URLs", () => {
  for (const url of [undefined, "", "   "]) {
    assert.throws(
      () =>
        portableTextToFeedHtml(
          [
            {
              _type: "gallery",
              _key: "gallery",
              images: [
                image({ _key: "resolved" }),
                image({
                  _key: "unresolved",
                  asset: { _ref: "unresolved-gallery-image-id", url },
                }),
              ],
            },
          ],
          SITE
        ),
      (error) => {
        assert.ok(error instanceof BlogFeedContentError);
        assert.equal(error.blockType, "image");
        assert.match(error.message, /unresolved-gallery-image-id/);
        assert.match(error.message, /asset\.url/);
        return true;
      }
    );
  }
});

test("preserves linked image metadata and escapes captions and attributes", () => {
  const html = portableTextToFeedHtml(
    [
      image({
        asset: { _ref: "image", url: '/images/a.png" onerror="alert(1)' },
        alt: '\"><script>alert("alt")</script>',
        title: 'Photo" onload="alert(1)',
        caption: '<img src="x" onerror="alert(1)">',
        link: { href: "/gallery?image=1&view=full", blank: true },
      }),
    ],
    SITE
  );
  assert.match(
    html,
    /<a href="https:\/\/www\.jamesqquick\.com\/gallery\?image=1&amp;view=full" target="_blank" rel="noopener noreferrer">/
  );
  assert.match(
    html,
    /src="https:\/\/www\.jamesqquick\.com\/images\/a\.png%22%20onerror=%22alert\(1\)"/
  );
  assert.match(
    html,
    /alt="&quot;&gt;&lt;script&gt;alert\(&quot;alt&quot;\)&lt;\/script&gt;"/
  );
  assert.match(html, /title="Photo&quot; onload=&quot;alert\(1\)"/);
  assert.match(
    html,
    /<figcaption>&lt;img src="x" onerror="alert\(1\)"&gt;<\/figcaption>/
  );
  assert.doesNotMatch(html, /<script>|<img[^>]* onerror="|<img[^>]* onload="/);
});

test("supports legacy image link strings", () => {
  const html = portableTextToFeedHtml(
    [image({ link: "/legacy-image-link" })],
    SITE
  );
  assert.match(
    html,
    /<a href="https:\/\/www\.jamesqquick\.com\/legacy-image-link"><img /
  );
});

test("preserves and escapes native text and image link titles", () => {
  const title = 'A "tooltip" & <img src=x onerror=alert(1)>';
  const html = portableTextToFeedHtml(
    [
      block("Docs", {
        children: [span("Docs", ["docs"])],
        markDefs: [{ _type: "link", _key: "docs", href: "/docs", title }],
      }),
      image({ link: { href: "/gallery", title } }),
    ],
    SITE
  );
  assert.equal(
    (
      html.match(
        /title="A &quot;tooltip&quot; &amp; &lt;img src=x onerror=alert\(1\)&gt;"/g
      ) ?? []
    ).length,
    2
  );
  assert.doesNotMatch(html, /<img src=x| onerror="/);
  for (const content of [
    block("Unused malformed title", {
      markDefs: [{ _type: "link", _key: "unused", href: "/docs", title: 123 }],
    }),
    image({ link: { href: "/gallery", title: {} } }),
  ]) {
    assert.throws(
      () => portableTextToFeedHtml([content], SITE),
      BlogFeedContentError
    );
  }
});

test("tooltip-only images and empty captions do not create visible figcaptions", () => {
  for (const caption of [undefined, ""]) {
    const html = portableTextToFeedHtml(
      [image({ title: "Tooltip", caption })],
      SITE
    );
    assert.match(html, /title="Tooltip"/);
    assert.doesNotMatch(html, /<figcaption/);
  }
});

test("preserves gallery image alt text, captions, and dimensions", () => {
  const html = portableTextToFeedHtml(
    [
      {
        _type: "gallery",
        _key: "gallery",
        columns: 2,
        images: [
          image({
            _key: "first",
            alt: "First",
            caption: "First <caption>",
            width: 100,
            height: 80,
          }),
          image({
            _key: "second",
            asset: { _ref: "second", url: "/photos/second.gif" },
            alt: "Second",
            caption: "Second caption",
          }),
        ],
      },
    ],
    SITE
  );
  assert.equal((html.match(/<figure>/g) ?? []).length, 2);
  assert.match(html, /alt="First" width="100" height="80"/);
  assert.match(html, /<figcaption>First &lt;caption&gt;<\/figcaption>/);
  assert.match(
    html,
    /src="https:\/\/www\.jamesqquick\.com\/photos\/second\.gif" alt="Second"/
  );
  assert.match(html, /<figcaption>Second caption<\/figcaption>/);
});

test("renders table headers and strong/link marks from cell and table definitions", () => {
  const html = portableTextToFeedHtml(
    [
      {
        _type: "table",
        _key: "table",
        hasHeaderRow: true,
        markDefs: [
          { _type: "link", _key: "docs", href: "/docs?topic=1&view=all" },
        ],
        rows: [
          row([
            cell("Name", { isHeader: true }),
            cell("Documentation", { isHeader: true }),
          ]),
          row([
            cell("Library", { isHeader: true }),
            cell("", {
              content: [
                span("Shared docs", ["docs", "strong"]),
                span(" and "),
                span("Local docs", ["local"]),
              ],
              markDefs: [{ _type: "link", _key: "local", href: "/local" }],
              textAlign: "center",
            }),
          ]),
        ],
      },
    ],
    SITE
  );
  assert.match(
    html,
    /<thead><tr><th scope="col"><p>Name<\/p><\/th><th scope="col"><p>Documentation<\/p><\/th><\/tr><\/thead>/
  );
  assert.match(html, /<th scope="row"><p>Library<\/p><\/th>/);
  assert.match(html, /<td style="text-align:center">/);
  assert.match(
    html,
    /<a href="https:\/\/www\.jamesqquick\.com\/docs\?topic=1&amp;view=all"><strong>Shared docs<\/strong><\/a>/
  );
  assert.match(
    html,
    /<a href="https:\/\/www\.jamesqquick\.com\/local">Local docs<\/a>/
  );
});

test("cell-local link definitions override table-wide definitions", () => {
  const html = portableTextToFeedHtml(
    [
      {
        _type: "table",
        _key: "table",
        markDefs: [{ _type: "link", _key: "docs", href: "/shared" }],
        rows: [
          row([
            cell("", {
              content: [span("Docs", ["docs"])],
              markDefs: [{ _type: "link", _key: "docs", href: "/cell" }],
            }),
          ]),
        ],
      },
    ],
    SITE
  );
  assert.match(html, /href="https:\/\/www\.jamesqquick\.com\/cell"/);
  assert.doesNotMatch(html, /\/shared/);
});

test("promotes legacy table headers while respecting explicit non-header cells", () => {
  const promoted = portableTextToFeedHtml(
    [
      {
        _type: "table",
        _key: "table",
        hasHeaderRow: true,
        rows: [
          row([cell("Header"), cell("Other")]),
          row([cell("Body"), cell("Other body")]),
        ],
      },
    ],
    SITE
  );
  assert.match(promoted, /<thead><tr><th scope="col">/);
  const mixed = portableTextToFeedHtml(
    [
      {
        _type: "table",
        _key: "table",
        hasHeaderRow: true,
        rows: [
          row([
            cell("Header", { isHeader: true }),
            cell("Not a header", { isHeader: false }),
          ]),
        ],
      },
    ],
    SITE
  );
  assert.doesNotMatch(mixed, /<thead>/);
  assert.match(
    mixed,
    /<th scope="row"><p>Header<\/p><\/th><td><p>Not a header<\/p><\/td>/
  );
});

test("preserves table spans and assigns row scope by visual column", () => {
  const html = portableTextToFeedHtml(
    [
      {
        _type: "table",
        _key: "table",
        rows: [
          row([
            cell("Spanning", { isHeader: true, rowspan: 2 }),
            cell("Wide", { colspan: 2 }),
          ]),
          row([cell("Offset header", { isHeader: true }), cell("Body")]),
        ],
      },
    ],
    SITE
  );
  assert.match(html, /<th rowspan="2"><p>Spanning<\/p><\/th>/);
  assert.match(html, /<td colspan="2"><p>Wide<\/p><\/td>/);
  assert.match(html, /<th><p>Offset header<\/p><\/th>/);
  assert.doesNotMatch(html, /scope="row"/);
});

test("renders nested mixed lists without moving children out of their parent items", () => {
  const html = portableTextToFeedHtml(
    [
      block("Parent", { listItem: "bullet", level: 1 }),
      block("Child", { listItem: "bullet", level: 2 }),
      block("Grandchild", {
        listItem: "number",
        level: 3,
        listId: "nested",
        listStart: 4,
      }),
      block("Second child", { listItem: "bullet", level: 2 }),
      block("Second parent", { listItem: "bullet", level: 1 }),
    ],
    SITE
  );
  assert.equal(
    html,
    '<ul><li>Parent<ul><li>Child<ol start="4"><li>Grandchild</li></ol></li><li>Second child</li></ul></li><li>Second parent</li></ul>'
  );
});

test("preserves explicit ordered starts with and without list IDs", () => {
  for (const fields of [{ listStart: 7 }, { listStart: 7, listId: "steps" }]) {
    const html = portableTextToFeedHtml(
      [
        block("First", { listItem: "number", ...fields }),
        block("Second", { listItem: "number", listId: fields.listId }),
      ],
      SITE
    );
    assert.equal(html, '<ol start="7"><li>First</li><li>Second</li></ol>');
  }
});

test("keeps distinct adjacent ordered list IDs separate", () => {
  const html = portableTextToFeedHtml(
    [
      block("A1", { listItem: "number", listId: "a", listStart: 5 }),
      block("A2", { listItem: "number", listId: "a", listStart: 5 }),
      block("B1", { listItem: "number", listId: "b", listStart: 1 }),
      block("B2", { listItem: "number", listId: "b", listStart: 1 }),
    ],
    SITE
  );
  assert.equal(
    html,
    '<ol start="5"><li>A1</li><li>A2</li></ol><ol><li>B1</li><li>B2</li></ol>'
  );
});

test("keeps explicit restarts separate when legacy lists lack IDs", () => {
  const html = portableTextToFeedHtml(
    [
      block("First", { listItem: "number", listStart: 3 }),
      block("Restart", { listItem: "number", listStart: 8 }),
    ],
    SITE
  );
  assert.equal(
    html,
    '<ol start="3"><li>First</li></ol><ol start="8"><li>Restart</li></ol>'
  );
});

test("continues the same ordered list ID across paragraph interruptions", () => {
  const html = portableTextToFeedHtml(
    [
      block("First", { listItem: "number", listId: "steps", listStart: 7 }),
      block("Second", { listItem: "number", listId: "steps", listStart: 7 }),
      block("A note"),
      block("Third", { listItem: "number", listId: "steps", listStart: 7 }),
    ],
    SITE
  );
  assert.equal(
    html,
    '<ol start="7"><li>First</li><li>Second</li></ol><p>A note</p><ol start="9"><li>Third</li></ol>'
  );
});

test("keeps adjacent nested ordered IDs separate and numbering scoped to the parent", () => {
  const html = portableTextToFeedHtml(
    [
      block("Parent", { listItem: "bullet", level: 1 }),
      block("A", {
        listItem: "number",
        level: 2,
        listId: "nested",
        listStart: 3,
      }),
      block("B", {
        listItem: "number",
        level: 2,
        listId: "other",
        listStart: 6,
      }),
      block("Another parent", { listItem: "bullet", level: 1 }),
      block("C", {
        listItem: "number",
        level: 2,
        listId: "nested",
        listStart: 3,
      }),
    ],
    SITE
  );
  assert.equal(
    html,
    '<ul><li>Parent<ol start="3"><li>A</li></ol><ol start="6"><li>B</li></ol></li><li>Another parent<ol start="3"><li>C</li></ol></li></ul>'
  );
});

test("does not mutate Portable Text content while building lists", () => {
  const content = [
    block("Parent", { listItem: "bullet", level: 1 }),
    block("Child", {
      listItem: "number",
      level: 2,
      listId: "nested",
      listStart: 4,
    }),
  ];
  const original = structuredClone(content);
  portableTextToFeedHtml(content, SITE);
  assert.deepEqual(content, original);
});

test("preserves complex legacy HTML list continuations", () => {
  const html = portableTextToFeedHtml(
    [
      htmlBlock(
        '<ol start="4"><li><p>Run the command.</p><pre><code>  pnpm  install\n</code></pre><p>Then continue.</p><ul><li>Nested detail</li></ul></li><li value="9">Explicit item</li></ol><ol start="12" reversed><li>Another list</li></ol>'
      ),
    ],
    SITE
  );
  assert.equal(
    html,
    '<ol start="4"><li><p>Run the command.</p><pre><code>  pnpm  install\n</code></pre><p>Then continue.</p><ul><li>Nested detail</li></ul></li><li value="9">Explicit item</li></ol><ol start="12" reversed><li>Another list</li></ol>'
  );
});

test("sanitizes raw HTML and rewrites both image and link URLs", () => {
  const html = portableTextToFeedHtml(
    [
      htmlBlock(
        '<script>alert(1)</script><style>body{display:none}</style><p onclick="alert(1)" style="color:red">Read <a href="../guide?a=1&amp;b=2" target="_blank" onclick="alert(1)">this</a><img src="images/demo.gif" alt="Demo" width="100" height="50" onerror="alert(1)" srcset="javascript:alert(1) 1x" /></p><object data="evil">Object</object><form action="evil"><input value="hidden" /></form>'
      ),
    ],
    new URL("https://www.jamesqquick.com/blog/")
  );
  assert.equal(
    html,
    '<p>Read <a href="https://www.jamesqquick.com/guide?a=1&amp;b=2" target="_blank" rel="noopener noreferrer">this</a><img src="https://www.jamesqquick.com/blog/images/demo.gif" alt="Demo" width="100" height="50" /></p>Object'
  );
});

test("rewrites fragment, root-relative, protocol-relative, and ordinary links", () => {
  const html = portableTextToFeedHtml(
    [
      block("", {
        children: [
          span("Anchor", ["anchor"]),
          span("Root", ["root"]),
          span("CDN", ["cdn"]),
          span("Relative", ["relative"]),
        ],
        markDefs: [
          { _type: "link", _key: "anchor", href: "#section", blank: true },
          { _type: "link", _key: "root", href: "/guide" },
          { _type: "link", _key: "cdn", href: "//docs.example.com/page" },
          { _type: "link", _key: "relative", href: "guide" },
        ],
      }),
    ],
    new URL("https://www.jamesqquick.com/blog/")
  );
  assert.match(
    html,
    /href="https:\/\/www\.jamesqquick\.com\/blog\/#section">Anchor/
  );
  assert.match(html, /href="https:\/\/www\.jamesqquick\.com\/guide">Root/);
  assert.match(html, /href="https:\/\/docs\.example\.com\/page">CDN/);
  assert.match(
    html,
    /href="https:\/\/www\.jamesqquick\.com\/blog\/guide">Relative/
  );
  assert.doesNotMatch(html, /target="_blank"/);
});

test("empty and relative hrefs resolve against the canonical post URL", () => {
  const post = new URL(
    "https://www.jamesqquick.com/blog/javascript-trends-2023/"
  );
  const raw =
    '<p><a href="">Astro</a><a href="#preparation"></a>Preparation <a href="../guide">Guide</a><a href="notes">Notes</a><img src=""></p>';
  const expected =
    '<p><a href="https://www.jamesqquick.com/blog/javascript-trends-2023/">Astro</a><a href="https://www.jamesqquick.com/blog/javascript-trends-2023/#preparation"></a>Preparation <a href="https://www.jamesqquick.com/blog/guide">Guide</a><a href="https://www.jamesqquick.com/blog/javascript-trends-2023/notes">Notes</a></p>';
  assert.equal(sanitizeBlogHtml(raw, post), expected);
  assert.equal(portableTextToFeedHtml([htmlBlock(raw)], post), expected);
  assert.equal(
    portableTextToFeedHtml(
      [
        block("Astro", {
          children: [span("Astro", ["astro"])],
          markDefs: [{ _type: "link", _key: "astro", href: "" }],
        }),
      ],
      post
    ),
    '<p><a href="https://www.jamesqquick.com/blog/javascript-trends-2023/">Astro</a></p>'
  );
  assert.equal(
    post.href,
    "https://www.jamesqquick.com/blog/javascript-trends-2023/"
  );
});

test("the shared HTML sanitizer preserves list, table, and code attributes under the existing safety policy", () => {
  const raw =
    '<ol start="7" reversed type="a"><li value="9"><pre><code class="language-ts">  const  x = "&lt;tag&gt;";\n</code></pre><table><tbody><tr><th scope="row" colspan="2" rowspan="3" style="text-align:center;color:red">Header</th><td style="text-align:right">Cell</td></tr></tbody></table></li></ol><iframe src="https://www.youtube.com/embed/dQw4w9WgXcQ"></iframe><iframe src="https://player.vimeo.com/video/123"></iframe><iframe src="https://evil.example/embed/123"></iframe><a href="ftp://example.com/file">FTP</a><a href="custom:thing">Custom</a><a href="java&#x0a;script:alert(1)">Script</a><a href=" ">Blank</a><img src="data:image/png,evil"><script>evil()</script>';
  const sanitized = sanitizeBlogHtml(raw, SITE);
  assert.equal(sanitized, portableTextToFeedHtml([htmlBlock(raw)], SITE));
  assert.match(sanitized, /<ol start="7" reversed type="a"><li value="9">/);
  assert.match(
    sanitized,
    /<code class="language-ts">  const  x = "&lt;tag&gt;";\n<\/code>/
  );
  assert.match(
    sanitized,
    /<th scope="row" colspan="2" rowspan="3" style="text-align:center">Header<\/th><td style="text-align:right">Cell<\/td>/
  );
  assert.equal((sanitized.match(/<iframe /g) ?? []).length, 2);
  assert.ok(sanitized.endsWith("FTPCustomScriptBlank"));
  assert.doesNotMatch(
    sanitized,
    /evil|ftp:|custom:|javascript:|color:red|<img/
  );
});

test("preserves mailto and tel links but does not accept them as image URLs", () => {
  const html = portableTextToFeedHtml(
    [
      htmlBlock(
        '<a href="mailto:james@example.com">Email</a><a href="tel:+15551234567">Call</a><img src="mailto:james@example.com">'
      ),
    ],
    SITE
  );
  assert.equal(
    html,
    '<a href="mailto:james@example.com">Email</a><a href="tel:+15551234567">Call</a>'
  );
});

test("strips unsafe schemes and malformed or credentialed URLs from structured content", () => {
  for (const href of [
    "javascript:alert(1)",
    "JaVaScRiPt:alert(1)",
    "java\nscript:alert(1)",
    "\u0000javascript:alert(1)",
    "vbscript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "data:image/svg+xml,<svg onload='alert(1)'></svg>",
    "file:///etc/passwd",
    "ftp://example.com/file",
    "blob:https://example.com/id",
    "https://user:password@example.com/",
    "http://[broken",
  ]) {
    const html = portableTextToFeedHtml(
      [
        block("Safe text", {
          children: [span("Safe text", ["unsafe"])],
          markDefs: [{ _type: "link", _key: "unsafe", href }],
        }),
        image({
          asset: { _ref: "image", url: href },
          alt: "Bad image",
          link: href,
        }),
      ],
      SITE
    );
    assert.equal(html, "<p>Safe text</p><figure></figure>", href);
  }
});

test("strips HTML-encoded URL attacks and unsafe raw attributes", () => {
  const html = portableTextToFeedHtml(
    [
      htmlBlock(
        '<a href="jav&#x61;script:alert(1)" onclick="alert(1)">One</a><a href="java&#x0a;script:alert(1)">Two</a><img src="data:image/svg+xml,evil" onerror="alert(1)"><img src="javascript&#58;alert(1)"><iframe srcdoc="<script>alert(1)</script>"></iframe><svg onload="alert(1)"></svg><table><tbody><tr><td style="text-align:center;background-image:url(javascript:alert(1))">Cell</td></tr></tbody></table>'
      ),
    ],
    SITE
  );
  assert.equal(
    html,
    'OneTwo<table><tbody><tr><td style="text-align:center">Cell</td></tr></tbody></table>'
  );
});

test("URL rewriting cannot turn escaped attribute payloads into attributes", () => {
  const html = portableTextToFeedHtml(
    [
      block("Link", {
        children: [span("Link", ["link"])],
        markDefs: [
          { _type: "link", _key: "link", href: '/guide" onclick="alert(1)' },
        ],
      }),
    ],
    SITE
  );
  assert.equal(
    html,
    '<p><a href="https://www.jamesqquick.com/guide%22%20onclick=%22alert(1)">Link</a></p>'
  );
});

test("renders inspected YouTube and Vimeo embed shapes", () => {
  const html = portableTextToFeedHtml(
    [
      {
        _type: "embed",
        _key: "youtube",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ&feature=share",
        provider: "youtube",
        caption: "A <video>",
      },
      {
        _type: "embed",
        _key: "short",
        url: "https://youtu.be/dQw4w9WgXcQ?t=20",
      },
      {
        _type: "embed",
        _key: "vimeo",
        url: "https://vimeo.com/123456789",
        provider: "vimeo",
      },
      {
        _type: "embed",
        _key: "player",
        url: "https://player.vimeo.com/video/987654321",
      },
    ],
    SITE
  );
  assert.equal(
    (html.match(/src="https:\/\/www\.youtube\.com\/embed\/dQw4w9WgXcQ"/g) ?? [])
      .length,
    2
  );
  assert.match(
    html,
    /src="https:\/\/player\.vimeo\.com\/video\/123456789" title="Vimeo video" allowfullscreen/
  );
  assert.match(html, /src="https:\/\/player\.vimeo\.com\/video\/987654321"/);
  assert.match(html, /<figcaption>A &lt;video&gt;<\/figcaption>/);
});

test("falls back to links for other embed URLs and rejects provider spoofing", () => {
  const html = portableTextToFeedHtml(
    [
      { _type: "embed", _key: "other", url: "/videos/demo", provider: "other" },
      {
        _type: "embed",
        _key: "spoof",
        url: "https://evil.example/youtube.com/watch?v=dQw4w9WgXc",
        provider: "youtube",
      },
    ],
    SITE
  );
  assert.match(html, /href="https:\/\/www\.jamesqquick\.com\/videos\/demo"/);
  assert.match(
    html,
    /href="https:\/\/evil\.example\/youtube\.com\/watch\?v=dQw4w9WgXc"/
  );
  assert.doesNotMatch(html, /<iframe/);
});

test("uses exactly EmDash's iframe hostname allowlist for raw HTML and embed HTML", () => {
  const markup =
    '<iframe src="//www.youtube.com/embed/dQw4w9WgXc" title="YouTube" srcdoc="evil" onload="alert(1)"></iframe><iframe src="https://player.vimeo.com/video/123456789"></iframe><iframe src="https://youtube.com/embed/dQw4w9WgXc"></iframe><iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXc"></iframe><iframe src="https://evil.www.youtube.com/embed/dQw4w9WgXc"></iframe><iframe src="https://www.youtube.com.evil.example/embed/dQw4w9WgXc"></iframe><iframe src="https://www.youtube.com@evil.example/embed/dQw4w9WgXc"></iframe><iframe src="/embed/dQw4w9WgXc"></iframe><iframe src="javascript:alert(1)"></iframe>';
  for (const content of [
    [htmlBlock(markup)],
    [
      {
        _type: "embed",
        _key: "embed",
        url: "https://example.com/video",
        html: markup,
      },
    ],
  ]) {
    const html = portableTextToFeedHtml(content, SITE);
    assert.equal((html.match(/<iframe/g) ?? []).length, 2);
    assert.match(html, /src="https:\/\/www\.youtube\.com\/embed\/dQw4w9WgXc"/);
    assert.match(html, /src="https:\/\/player\.vimeo\.com\/video\/123456789"/);
    assert.doesNotMatch(html, /srcdoc|onload|nocookie|evil|javascript/);
  }
});

test("renders the inspected break variants", () => {
  assert.equal(
    portableTextToFeedHtml(
      [
        { _type: "break", _key: "line" },
        { _type: "break", _key: "lineBreak", style: "lineBreak" },
        { _type: "break", _key: "dots", style: "dots" },
        { _type: "break", _key: "space", style: "space" },
      ],
      SITE
    ),
    "<hr /><hr /><div>• • •</div><br /><br />"
  );
});

test("returns an empty string for an empty body and drops opaque JSON comments", () => {
  assert.equal(portableTextToFeedHtml([], SITE), "");
  assert.equal(
    portableTextToFeedHtml(
      [
        htmlBlock(
          '<!--ec:block {"_type":"opaqueWidget","payload":"private"} -->'
        ),
      ],
      SITE
    ),
    ""
  );
  assert.equal(portableTextToFeedHtml([htmlBlock("")], SITE), "");
});

test("throws a typed error identifying unknown blocks, including ones with children", () => {
  for (const content of [
    [{ _type: "opaqueWidget", _key: "unknown", payload: { private: true } }],
    [
      {
        _type: "opaqueWidget",
        _key: "unknown",
        children: [span("Should not become a paragraph")],
        markDefs: [],
      },
    ],
    [
      {
        _type: "@text",
        _key: "internal",
        text: "Should not bypass validation",
      },
    ],
    [{ _type: "constructor", _key: "prototype" }],
  ]) {
    assert.throws(
      () => portableTextToFeedHtml(content, SITE),
      (error: unknown) => {
        assert.ok(error instanceof BlogFeedContentError);
        assert.equal(error.name, "BlogFeedContentError");
        assert.equal(error.blockType, content[0]._type);
        assert.match(error.message, /Unsupported block type/);
        return true;
      }
    );
  }
});

test("detects unknown inline objects, marks, styles, and gallery entries", () => {
  const cases: [PortableTextBlock, string][] = [
    [
      block("", { children: [{ _type: "mentionWidget", _key: "inline" }] }),
      "mentionWidget",
    ],
    [
      block("", { children: [span("Text", ["mystery"])], markDefs: [] }),
      "mystery",
    ],
    [
      block("", {
        children: [span("Text", ["custom"])],
        markDefs: [{ _type: "customMark", _key: "custom" }],
      }),
      "customMark",
    ],
    [block("Text", { style: "customStyle" }), "customStyle"],
    [block("Text", { listItem: "customList" }), "customList"],
    [
      {
        _type: "gallery",
        _key: "gallery",
        images: [{ _type: "opaqueImage", _key: "image" }],
      },
      "opaqueImage",
    ],
  ];
  for (const [content, type] of cases) {
    assert.throws(
      () => portableTextToFeedHtml([content], SITE),
      (error: unknown) => {
        assert.ok(error instanceof BlogFeedContentError);
        assert.equal(error.blockType, type);
        return true;
      }
    );
  }
});

test("rejects malformed known content with typed errors instead of dropping it", () => {
  for (const content of [
    { _type: "code", _key: "code", code: 123 },
    { _type: "htmlBlock", _key: "html", html: null },
    { _type: "image", _key: "image" },
    image({ asset: { _ref: "" } }),
    image({ width: '100" onload="alert(1)' }),
    block("", { children: [{ _type: "span", _key: "span", text: 123 }] }),
    block("", {
      children: [
        { _type: "span", _key: "span", text: "Text", marks: "strong" },
      ],
    }),
    block("Step", { listItem: "number", listStart: -1 }),
    block("Step", { listItem: "number", level: 0 }),
    { _type: "table", _key: "table", rows: "invalid" },
    {
      _type: "table",
      _key: "table",
      rows: [row([cell("", { content: "invalid" })])],
    },
    {
      _type: "table",
      _key: "table",
      rows: [
        row([cell("", { content: [{ _type: "opaqueCell", _key: "cell" }] })]),
      ],
    },
    {
      _type: "table",
      _key: "table",
      rows: [row([cell("Text", { colspan: '2" onclick="alert(1)' })])],
    },
    {
      _type: "table",
      _key: "table",
      rows: [row([cell("Text", { textAlign: "center;background:url(evil)" })])],
    },
    { _type: "gallery", _key: "gallery", images: [null] },
    { _type: "break", _key: "break", style: "invalid" },
    { _type: "embed", _key: "embed", url: null },
    { _type: "code", _key: "code", code: "Should be validated", children: [] },
  ]) {
    assert.throws(
      () => portableTextToFeedHtml([content], SITE),
      BlogFeedContentError,
      JSON.stringify(content)
    );
  }
  assert.throws(
    () => portableTextToFeedHtml(null as unknown as PortableTextBlock[], SITE),
    BlogFeedContentError
  );
  assert.throws(
    () =>
      portableTextToFeedHtml([null] as unknown as PortableTextBlock[], SITE),
    BlogFeedContentError
  );
});

test("rejects invalid and script-capable site bases with a typed error", () => {
  for (const site of [
    "relative/path",
    "javascript:alert(1)",
    "data:text/html,hello",
    "ftp://example.com/",
    "https://user:password@example.com/",
  ]) {
    for (const render of [
      () => portableTextToFeedHtml([], site),
      () => sanitizeBlogHtml("", site),
    ]) {
      assert.throws(render, (error: unknown) => {
        assert.ok(error instanceof BlogFeedContentError);
        assert.equal(error.blockType, "site");
        return true;
      });
    }
  }
});
