import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import type { PortableTextBlock, PortableTextTableBlock } from "emdash";
import MarkdownIt from "markdown-it";
import { readBlogArchive } from "../scripts/blog-archive";
import { markdownToBlogPortableText } from "../scripts/blog-markdown";
import { portableTextToFeedHtml } from "../src/utils/blog-feed";

const SITE = "https://www.jamesqquick.com/";
const require = createRequire(import.meta.url);
const installed = createRequire(require.resolve("emdash"));

interface EditorDocument {
  check(): void;
  toJSON(): unknown;
}

interface AdminEditor {
  schema: { nodeFromJSON(value: unknown): EditorDocument };
  portableTextToProsemirror(blocks: PortableTextBlock[]): unknown;
  prosemirrorToPortableText(document: unknown): PortableTextBlock[];
}

function loadAdminEditor(): AdminEditor {
  const entry = installed.resolve("@emdash-cms/admin");
  const admin = createRequire(entry);
  const version = JSON.parse(
    readFileSync(join(dirname(entry), "../package.json"), "utf8")
  ).version;
  assert.equal(version, "1.0.1");
  const source = readFileSync(entry, "utf8");
  const between = (start: string, end: string): string => {
    const from = source.indexOf(start);
    const to = source.indexOf(end, from + start.length);
    assert.ok(
      from >= 0 && to > from,
      `Missing installed admin source: ${start}`
    );
    return source.slice(from, to);
  };
  const section = (path: string) =>
    between(`//#region ${path}\n`, "\n//#endregion");
  const core = admin("@tiptap/core");
  const dockerfile = admin("highlight.js/lib/languages/dockerfile");
  const dependencies = {
    ...core,
    ...admin("@tiptap/pm/state"),
    ...admin("@tiptap/pm/view"),
    ...admin("@tiptap/pm/tables"),
    ...admin("@tiptap/pm/history"),
    ...admin("@tiptap/pm/transform"),
    ...admin("@tiptap/pm/model"),
    ...admin("@emdash-cms/admin/portable-text-table"),
    ...admin("lowlight"),
    Node: core.Node,
    Node$1: core.Node,
    Mark: core.Mark,
    mergeAttributes$1: core.mergeAttributes,
    StarterKit: admin("@tiptap/starter-kit").StarterKit,
    CodeBlockLowlight: admin("@tiptap/extension-code-block-lowlight")
      .CodeBlockLowlight,
    Code$1: admin("@tiptap/extension-code").Code,
    dockerfile: dockerfile.default ?? dockerfile,
    OrderedList: admin("@tiptap/extension-list").OrderedList,
    Table$2: admin("@tiptap/extension-table").Table,
    TableCell: admin("@tiptap/extension-table-cell").TableCell,
    TableHeader: admin("@tiptap/extension-table-header").TableHeader,
    TableRow: admin("@tiptap/extension-table-row").TableRow,
    Subscript: admin("@tiptap/extension-subscript").Subscript,
    Superscript: admin("@tiptap/extension-superscript").Superscript,
    TextAlign: admin("@tiptap/extension-text-align").TextAlign,
  };
  // The admin's converters are private. Execute its installed code and schema
  // extensions instead of copying converters or substituting core's versions.
  const loaded = new Function(
    ...Object.keys(dependencies),
    [
      section("src/lib/media-utils.ts"),
      section("src/lib/portable-text-marks.ts"),
      section("src/components/editor/CodeBlockNode.tsx"),
      section("src/components/editor/CodeMarkExtension.ts"),
      section("src/components/editor/TableExtensions.ts"),
      section("src/components/editor/HtmlBlockNode.tsx"),
      section("src/components/editor/ImageNode.tsx"),
      section("src/components/editor/ordered-list.ts"),
      between("function generateKey() {", "function insertHtmlBlock("),
      `return {
        portableTextToProsemirror,
        prosemirrorToPortableText,
        extensions: [
          PortableTextIdentityExtension,
          PortableTextSpanIdentity,
          StarterKit.configure({
            heading: { levels: [1, 2, 3, 4, 5, 6] },
            codeBlock: false,
            code: false,
            orderedList: false,
            link: { openOnClick: false, enableClickSelection: true },
            underline: {}
          }),
          EmDashOrderedList,
          CodeMarkExtension,
          CodeBlockExtension,
          HtmlBlockExtension,
          ImageExtension,
          Subscript,
          Superscript,
          EmDashTable.configure({
            allowTableNodeSelection: true,
            cellMinWidth: TABLE_CELL_MIN_WIDTH,
            resizable: false
          }),
          EmDashTableRow,
          EmDashTableHeader,
          EmDashTableCell,
          TextAlign.configure({ types: ["heading", "paragraph"] })
        ]
      };`,
    ].join("\n")
  )(...Object.values(dependencies)) as Omit<AdminEditor, "schema"> & {
    extensions: unknown[];
  };
  return { ...loaded, schema: core.getSchema(loaded.extensions) };
}

const adminEditor = loadAdminEditor();

function adminRoundtrip(blocks: PortableTextBlock[]): PortableTextBlock[] {
  const document = adminEditor.schema.nodeFromJSON(
    adminEditor.portableTextToProsemirror(blocks)
  );
  document.check();
  return adminEditor.prosemirrorToPortableText(document.toJSON());
}

const resolveImage = (source: string) => ({
  id: `asset-${encodeURIComponent(source)}`,
  url: /^(?:https?:)?\/\//i.test(source)
    ? new URL(source, SITE).href
    : `/media/${encodeURIComponent(source)}`,
  width: 640,
  height: 480,
});

interface HtmlNode {
  type: string;
  name?: string;
  data?: string;
  attribs?: Record<string, string>;
  children?: HtmlNode[];
}

interface SemanticNode {
  type: string;
  text?: string;
  attributes?: Record<string, string | number | boolean>;
  marks?: string[];
  content?: SemanticNode[];
}

const { parseDocument } = createRequire(require.resolve("sanitize-html"))(
  "htmlparser2"
) as { parseDocument(html: string): { children: HtmlNode[] } };

function domText(nodes: HtmlNode[]): string {
  return nodes
    .map((node) =>
      node.type === "text"
        ? (node.data ?? "")
        : node.name === "br"
          ? "\n"
          : node.name === "img"
            ? (node.attribs?.alt ?? "")
            : domText(node.children ?? [])
    )
    .join("");
}

const sourceRenderer = new MarkdownIt({
  html: true,
  linkify: false,
  typographer: false,
});
sourceRenderer.renderer.rules.text_special = sourceRenderer.renderer.rules.text;
sourceRenderer.renderer.rules.image = (
  tokens,
  index,
  options,
  environment,
  renderer
) => {
  const token = tokens[index];
  const image = resolveImage(token.attrGet("src") ?? "");
  // Render alt formatting independently, including inline code that
  // MarkdownIt's default image renderer omits from accessible text.
  token.attrSet(
    "alt",
    domText(
      parseDocument(
        renderer.renderInline(token.children ?? [], options, environment)
      ).children
    )
  );
  token.attrSet("src", image.url);
  token.attrSet("width", String(image.width));
  token.attrSet("height", String(image.height));
  return renderer.renderToken(tokens, index, options);
};

function htmlSemantics(html: string, base: URL): SemanticNode[] {
  const inlineTags = new Set([
    "a",
    "br",
    "code",
    "del",
    "em",
    "img",
    "s",
    "strong",
  ]);
  const decorators: Record<string, string> = {
    code: "code",
    del: "strike-through",
    s: "strike-through",
    em: "em",
    strong: "strong",
  };
  const inline = (
    nodes: HtmlNode[],
    marks: string[] = [],
    link?: Record<string, string>
  ): SemanticNode[] => {
    const result: SemanticNode[] = [];
    const append = (part: SemanticNode) => {
      const previous = result.at(-1);
      if (
        part.type === "text" &&
        previous?.type === "text" &&
        JSON.stringify(previous.marks) === JSON.stringify(part.marks)
      )
        previous.text += part.text!;
      else result.push(part);
    };
    for (const [index, node] of nodes.entries()) {
      if (node.type === "comment") continue;
      if (node.type === "text" || node.name === "br") {
        let text = node.name === "br" ? "\n" : (node.data ?? "");
        if (
          node.type === "text" &&
          !marks.includes("code") &&
          nodes[index - 1]?.name === "br"
        )
          text = text.replace(/^\n/, "");
        if (text)
          append({ type: "text", text, marks: [...new Set(marks)].sort() });
        continue;
      }
      const attributes = node.attribs ?? {};
      if (node.name === "img") {
        assert.ok(attributes.src, "Image source disappeared");
        append({
          type: "image",
          attributes: {
            src: new URL(attributes.src, base).href,
            alt: attributes.alt ?? "",
            ...(attributes.title === undefined
              ? {}
              : { title: attributes.title }),
            ...(attributes.width === undefined
              ? {}
              : { width: Number(attributes.width) }),
            ...(attributes.height === undefined
              ? {}
              : { height: Number(attributes.height) }),
            ...(link ? { href: link.href } : {}),
            ...(link?.title === undefined ? {} : { linkTitle: link.title }),
          },
        });
        continue;
      }
      if (node.name === "a") {
        assert.notEqual(
          attributes.href,
          undefined,
          "Link destination disappeared"
        );
        const destination = {
          href: new URL(attributes.href, base).href,
          ...(attributes.title === undefined
            ? {}
            : { title: attributes.title }),
        };
        const content = inline(
          node.children ?? [],
          [...marks, `link:${JSON.stringify(destination)}`],
          destination
        );
        if (content.length) content.forEach(append);
        else append({ type: "empty-link", attributes: destination });
        continue;
      }
      assert.ok(
        node.name && (decorators[node.name] || node.name === "p"),
        `Unexpected inline element: ${node.name}`
      );
      inline(
        node.children ?? [],
        decorators[node.name!] ? [...marks, decorators[node.name!]] : marks,
        link
      ).forEach(append);
    }
    return result;
  };
  const paragraphs = (content: SemanticNode[]): SemanticNode[] => {
    const result: SemanticNode[] = [];
    let text: SemanticNode[] = [];
    const flush = () => {
      if (text.length) result.push({ type: "p", content: text });
      text = [];
    };
    for (const part of content) {
      if (part.type === "image") {
        flush();
        result.push(part);
      } else text.push(part);
    }
    flush();
    return result;
  };
  const flow = (nodes: HtmlNode[]): SemanticNode[] => {
    const result: SemanticNode[] = [];
    let pending: HtmlNode[] = [];
    const flush = () => {
      // Tight lists and native quotes omit p wrappers. Trim only their HTML
      // layout newlines; text inside explicit paragraphs and code stays exact.
      const raw = pending.map((node, index) => {
        let data = node.data;
        if (index === 0) data = data?.replace(/^\n+/, "");
        if (index === pending.length - 1) data = data?.replace(/\n+$/, "");
        return { ...node, data };
      });
      if (raw.some((node) => node.type !== "text" || node.data?.trim()))
        result.push(...paragraphs(inline(raw)));
      pending = [];
    };
    for (const node of nodes) {
      if (node.type === "comment") continue;
      if (node.type === "text" || inlineTags.has(node.name ?? "")) {
        pending.push(node);
        continue;
      }
      flush();
      const children = node.children ?? [];
      const attributes = node.attribs ?? {};
      switch (node.name) {
        case "p": {
          const content = inline(children);
          result.push(
            ...(content.length
              ? paragraphs(content)
              : [{ type: "p", content: [] }])
          );
          break;
        }
        case "figure":
        case "thead":
        case "tbody":
          result.push(...flow(children));
          break;
        case "pre": {
          const code = children.find((child) => child.name === "code");
          assert.ok(code, "Missing code element");
          const language =
            code.attribs?.class?.match(/\blanguage-([^\s]+)/)?.[1];
          result.push({
            type: "code-block",
            text: domText(code.children ?? []),
            attributes: language ? { language } : {},
          });
          break;
        }
        case "hr":
          result.push({ type: "hr" });
          break;
        case "ol":
        case "ul":
          result.push({
            type: node.name,
            attributes:
              node.name === "ol"
                ? { start: Number(attributes.start ?? 1) }
                : {},
            content: flow(children),
          });
          break;
        case "blockquote":
        case "li":
        case "table":
        case "tr":
          result.push({ type: node.name, content: flow(children) });
          break;
        case "td":
        case "th":
          result.push({
            type: node.name,
            attributes: {
              colspan: Number(attributes.colspan ?? 1),
              rowspan: Number(attributes.rowspan ?? 1),
              textAlign:
                attributes.style?.match(/text-align:\s*([^;]+)/)?.[1] ?? "left",
            },
            content: inline(children),
          });
          break;
        default:
          assert.match(node.name ?? "", /^(?:h[1-6]|figcaption)$/);
          result.push({ type: node.name!, content: inline(children) });
      }
    }
    flush();
    return result;
  };
  return flow(parseDocument(html).children);
}

const editorBreakDecorationSlugs = new Set([
  "top-5-pieces-of-advice-for-aspiring-and-learning-developers",
  "trigger-ai-agent-from-your-phone",
]);

function assertAdminSourceSemantics(
  actual: SemanticNode[],
  expected: SemanticNode[],
  slug: string,
  message = slug
): void {
  if (!editorBreakDecorationSlugs.has(slug)) {
    assert.deepEqual(actual, expected, message);
    return;
  }
  const splitLinebreaks = (nodes: SemanticNode[]): SemanticNode[] =>
    nodes.flatMap((node) => {
      const content = node.content
        ? { content: splitLinebreaks(node.content) }
        : {};
      if (
        node.type === "text" &&
        node.text?.includes("\n") &&
        !node.marks?.includes("code")
      )
        return node.text
          .split(/(\n)/)
          .filter(Boolean)
          .map((text) => ({ ...node, ...content, text }));
      return [{ ...node, ...content }];
    });
  const normalize = (
    nodes: SemanticNode[],
    source: SemanticNode[]
  ): SemanticNode[] =>
    nodes.map((node, index) => {
      const original = source[index];
      const previous = nodes[index - 1];
      const marks = node.marks ?? [];
      const sourceMarks = original?.marks ?? [];
      const added = marks.filter((mark) => !sourceMarks.includes(mark));
      const inheritedDecoration =
        node.type === "text" &&
        node.text === "\n" &&
        original?.type === "text" &&
        original.text === "\n" &&
        !marks.includes("code") &&
        !sourceMarks.includes("code") &&
        previous?.type === "text" &&
        !previous.marks?.includes("code") &&
        sourceMarks.every((mark) => marks.includes(mark)) &&
        added.length > 0 &&
        added.every(
          (mark) =>
            (mark === "strong" || mark.startsWith("link:")) &&
            previous.marks?.includes(mark)
        );
      return {
        ...node,
        ...(inheritedDecoration ? { marks: sourceMarks } : {}),
        ...(node.content
          ? { content: normalize(node.content, original?.content ?? []) }
          : {}),
      };
    });
  const source = splitLinebreaks(expected);
  assert.deepEqual(normalize(splitLinebreaks(actual), source), source, message);
}

test("semantic comparisons keep code-marked text and code descendants whitespace-exact", () => {
  const base = new URL("blog/code-whitespace/", SITE);
  for (const html of [
    "<p><code>a  b</code></p>",
    "<p><strong><code>a  b</code></strong></p>",
    "<p><code><em>a  b</em></code></p>",
    '<table><tr><td><code><a href="#docs">a  b</a></code></td></tr></table>',
    "<pre><code><strong>a  b</strong></code></pre>",
  ]) {
    const expected = htmlSemantics(html, base);
    for (const replacement of ["a b", "a\u00a0 b"])
      assert.notDeepEqual(
        htmlSemantics(html.replace("a  b", replacement), base),
        expected,
        html
      );
  }
  assert.notDeepEqual(
    htmlSemantics("<p><code>a<br>\nb</code></p>", base),
    htmlSemantics("<p><code>a<br>b</code></p>", base)
  );
});

test("approved editor linebreak comparisons accept only inherited strong/link decoration", () => {
  const base = new URL("blog/editor-breaks/", SITE);
  const compare = (actual: string, source: string, slug: string) =>
    assertAdminSourceSemantics(
      htmlSemantics(actual, base),
      htmlSemantics(source, base),
      slug
    );
  const sourceStrong = "<p><strong>bold</strong>\nnext</p>";
  const editedStrong = "<p><strong>bold<br></strong>next</p>";
  const sourceLink = '<p><a href="#docs" title="Docs">docs</a>\nnext</p>';
  const editedLink = '<p><a href="#docs" title="Docs">docs<br></a>next</p>';
  for (const slug of editorBreakDecorationSlugs) {
    compare(editedStrong, sourceStrong, slug);
    compare(editedLink, sourceLink, slug);
    compare(
      '<p><strong><a href="#docs">docs<br></a></strong>next</p>',
      '<p><strong><a href="#docs">docs</a></strong>\nnext</p>',
      slug
    );
    for (const [actual, source] of [
      ["<p><strong>bold<br></strong>Next</p>", sourceStrong],
      ["<p><strong>bold<br>next</strong></p>", sourceStrong],
      ["<p><strong>bold<em><br></em></strong>next</p>", sourceStrong],
      ["<p><strong>bold</strong>next</p>", sourceStrong],
      ["<p><strong>bold<br><br></strong>next</p>", sourceStrong],
      [sourceStrong, editedStrong],
      ['<p><a href="#changed" title="Docs">docs<br></a>next</p>', sourceLink],
      ['<p><a href="#docs" title="Changed">docs<br></a>next</p>', sourceLink],
      [
        '<p><a href="#docs" title="Docs">docs</a><a href="#changed"><br></a>next</p>',
        sourceLink,
      ],
      ["<p><code>a b</code>\nnext</p>", "<p><code>a  b</code>\nnext</p>"],
      ["<p><code>a\u00a0 b</code>\nnext</p>", "<p><code>a  b</code>\nnext</p>"],
      [
        "<p><strong><code>a  b<br></code></strong>next</p>",
        "<p><strong><code>a  b</code></strong>\nnext</p>",
      ],
      [
        '<table><tr><td><code><a href="#docs">a b</a></code></td></tr></table>',
        '<table><tr><td><code><a href="#docs">a  b</a></code></td></tr></table>',
      ],
      [
        "<pre><code><strong>a b\n</strong></code></pre>",
        "<pre><code><strong>a  b\n</strong></code></pre>",
      ],
    ])
      assert.throws(() => compare(actual, source, slug), assert.AssertionError);
  }
  assert.throws(
    () => compare(editedStrong, sourceStrong, "unapproved-post"),
    assert.AssertionError
  );
});

test("all 91 archive posts retain source HTML semantics after conversion to RSS", async (context) => {
  const posts = await readBlogArchive(
    fileURLToPath(new URL("../", import.meta.url))
  );
  assert.equal(posts.length, 91);
  for (const post of posts) {
    const base = new URL(`blog/${post.slug}/`, SITE);
    const blocks = markdownToBlogPortableText(post.markdown, resolveImage);
    assert.deepEqual(
      htmlSemantics(portableTextToFeedHtml(blocks, base), base),
      htmlSemantics(sourceRenderer.render(post.markdown), base),
      post.filePath
    );
  }
  context.diagnostic(
    "Compared ordered headings, paragraphs, marked text, links, literal code, images, tables, and lists for 91 posts."
  );
});

test("installed EmDash 1.0.1 admin roundtrip retains source HTML semantics for all 91 archive posts", async (context) => {
  const posts = await readBlogArchive(
    fileURLToPath(new URL("../", import.meta.url))
  );
  assert.equal(posts.length, 91);
  for (const post of posts) {
    const base = new URL(`blog/${post.slug}/`, SITE);
    const blocks = markdownToBlogPortableText(post.markdown, resolveImage);
    assertAdminSourceSemantics(
      htmlSemantics(portableTextToFeedHtml(adminRoundtrip(blocks), base), base),
      htmlSemantics(sourceRenderer.render(post.markdown), base),
      post.slug,
      post.filePath
    );
  }
  context.diagnostic(
    "Compared source HTML semantics after the actual installed EmDash 1.0.1 admin roundtrip for all 91 posts."
  );
});

test("installed EmDash 1.0.1 admin schema preserves native titles, images, and breaks", () => {
  const blocks = markdownToBlogPortableText(
    '## Heading\n\n[**`Docs`**](../docs "Docs tooltip").\n\n![alt](./image.gif "Image tooltip")\n\n---\n',
    resolveImage
  );
  const roundtrip = adminRoundtrip(blocks);
  assert.equal(
    portableTextToFeedHtml(roundtrip, SITE),
    portableTextToFeedHtml(blocks, SITE)
  );
  assert.deepEqual(
    roundtrip.map((block) => block._key),
    blocks.map((block) => block._key)
  );
  assert.equal(roundtrip.find((block) => block._type === "image")?.caption, "");
  assert.equal(
    roundtrip.find((block) => block._type === "break")?.style,
    "lineBreak"
  );
});

test("inline-code break fallbacks keep safe text and table cells native", () => {
  assert.equal(
    markdownToBlogPortableText("`a  b`\\\nnext\n", resolveImage)[0]._type,
    "htmlBlock"
  );
  for (const markdown of [
    "before\n`a  b`\n",
    "before\\\n`a  b`\n",
    "before<br>`a  b`\n",
    "`a  b` text\nnext\n",
    "`a  b` text\\\nnext\n",
    "`a  b` text<br>next\n",
  ])
    assert.equal(
      markdownToBlogPortableText(markdown, resolveImage)[0]._type,
      "block",
      markdown
    );
  assert.equal(
    markdownToBlogPortableText(
      "| `head  value`<br>label |\n| --- |\n| before<br>`a  b`<br>next |\n",
      resolveImage
    )[0]._type,
    "table"
  );
});

const adminFixtures: Array<[string, string]> = [
  ["inline-code with a soft break after", "`a  b`\nnext\n"],
  ["inline-code with a soft break before", "before\n`a  b`\n"],
  ["inline-code with a backslash hard break after", "`a  b`\\\nnext\n"],
  ["inline-code with a backslash hard break before", "before\\\n`a  b`\n"],
  ["inline-code with a two-space hard break after", "`a  b`  \nnext\n"],
  ["inline-code with a two-space hard break before", "before  \n`a  b`\n"],
  ["inline-code with an HTML break after", "`a  b`<br>next\n"],
  ["inline-code with an HTML break before", "before<br>`a  b`\n"],
  [
    "inline-code with a break after nested strong and link marks",
    '[**`a  b`**](../docs "Docs title")\\\nnext\n',
  ],
  [
    "inline-code spans separated by soft and hard breaks",
    "`a  b`\n`c  d`\n\n`e  f`\\\n`g  h`\n",
  ],
  [
    "inline-code with table-cell breaks after",
    "| `head  value`<br>label |\n| --- |\n| `a  b`<br>next |\n",
  ],
  [
    "inline-code with table-cell breaks before",
    "| heading<br>`head  value` |\n| --- |\n| before<br>`a  b` |\n",
  ],
  ["inline-code with a soft break in a list", "- `a  b`\n  next\n"],
  ["inline-code with a hard break in a quote", "> `a  b`\\\n> next\n"],
  ["inline-code with a break in a heading", "## `a  b`<br>next\n"],
  [
    "inline-code with a break in a nested ordered list",
    "3. Parent\n   - `a  b`\\\n     next\n4. Tail\n",
  ],
  [
    "repeated-space inline code in paragraphs and table cells",
    'Before `a  b   <tag> &amp;` and **`strong  code`**.\n\n| `header  value` | Link |\n| --- | --- |\n| `cell  value   &amp;` | [**`linked  code`**](../docs "Docs title") |\n',
  ],
  [
    "table headers, cell-local titled links, marks, empty cells, and alignment",
    '| **Name** | _Value_ | Link |\n| :--- | :---: | ---: |\n| `a` | ~~b~~ | [**`docs`**](../docs "Docs title") |\n| a\\|b | | [again](#reference "Reference title") |\n',
  ],
  [
    "literal fenced and indented code",
    '```tsx\nimport { Widget } from "./widget";\n\n\tconst  html = <Widget value="&amp; <literal>" />;  \n// ![not an image](./fake.png)\n```\n\n    const  literal = "<script> & text";\n    return literal;\n',
  ],
  [
    "empty-label links in paragraphs, headings, lists, quotes, and tables",
    "[](#preparation)Preparation then [](#next)**Next** and [Astro]().\n\n## [](#heading)Heading\n\n- [](#item)Item\n\n> [](#quote)Quote\n\n| [](#column)Column |\n| --- |\n| [](#cell)Cell |\n",
  ],
  [
    "tooltip-only images with formatted and empty alt text",
    '**before [![alt `code` &amp; _em_](./motion.gif "Image tooltip")](../gallery) after**\n\n![](./empty-alt.png "Another tooltip")\n',
  ],
  [
    "titled image-link HTML fallbacks",
    'Native paragraph.\n\n**before [![alt `code` &amp; _em_](./motion.gif "Image tooltip")](../gallery \'Link "quote" &amp; more\') after**\n\nNative tail.\n',
  ],
  [
    "empty image-link destinations",
    '[![alt](./image.png "Image tooltip")]()\n',
  ],
  [
    "native list identities, starts, separate runs, and mixed nesting",
    "3. Third\n   - child **bold**\n\n     7. nested seven\n     8. nested eight\n4. Fourth\n\n9) Separate ninth\n10) Separate tenth\n",
  ],
  [
    "HTML fallback list paragraphs, images, and exact code",
    '5. First **item**.\n\n   A separate paragraph with `inline code`.\n\n   ```ts\n   const  value = "<literal> &amp;";\n   ```\n\n   ![Moving `image`](./clip.gif "GIF tooltip")\n\n6. Last item.\n',
  ],
];

for (const [name, markdown] of adminFixtures) {
  test(`installed admin roundtrip retains ${name}`, () => {
    const base = new URL("blog/admin-roundtrip/", SITE);
    const blocks = markdownToBlogPortableText(markdown, resolveImage);
    const expected = htmlSemantics(sourceRenderer.render(markdown), base);
    assert.deepEqual(
      htmlSemantics(portableTextToFeedHtml(blocks, base), base),
      expected
    );
    const roundtrip = adminRoundtrip(blocks);
    assert.deepEqual(
      htmlSemantics(portableTextToFeedHtml(roundtrip, base), base),
      expected
    );
    assert.deepEqual(
      roundtrip.map((block) => block._key),
      blocks.map((block) => block._key)
    );
    const listMetadata = (values: PortableTextBlock[]) =>
      values
        .filter((block) => block.listItem)
        .map((block) => ({
          _key: block._key,
          listItem: block.listItem,
          level: block.level,
          listId: block.listId,
          listStart: block.listStart,
        }));
    assert.deepEqual(listMetadata(roundtrip), listMetadata(blocks));
    const tableKeys = (values: PortableTextBlock[]) =>
      values
        .filter((block) => block._type === "table")
        .map((block) =>
          (block as PortableTextBlock & PortableTextTableBlock).rows.map(
            (row) => [row._key, ...row.cells.map((cell) => cell._key)]
          )
        );
    assert.deepEqual(tableKeys(roundtrip), tableKeys(blocks));
    for (const image of roundtrip.filter(
      (block) => block._type === "image" && block.title
    ))
      assert.equal(image.caption, "");
  });
}
