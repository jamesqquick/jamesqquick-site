import { toHTML, type PortableTextComponents } from "@portabletext/to-html";
import type { PortableTextBlock } from "emdash";
import sanitizeHtml from "sanitize-html";
import { addBlogHeadingIds } from "./blog-headings";

export class BlogFeedContentError extends Error {
  constructor(
    public readonly blockType: string,
    detail: string
  ) {
    super(`Cannot render RSS content of type "${blockType}": ${detail}`);
    this.name = "BlogFeedContentError";
  }
}

interface TextBlock extends PortableTextBlock {
  _type: "block";
  children: PortableTextBlock[];
  listItem?: "bullet" | "number";
  level?: number;
  listId?: string;
  listStart?: number;
}

interface ListNode extends PortableTextBlock {
  _type: "@list";
  children: TextBlock[];
  listItem: "bullet" | "number";
  level: number;
  mode: "html";
  start?: number;
}

interface TableCell extends PortableTextBlock {
  _type: "tableCell";
  content: PortableTextBlock[];
  isHeader?: boolean;
  colspan?: number;
  rowspan?: number;
  textAlign?: string;
}

const BLOCK_TYPES = new Set([
  "block",
  "image",
  "gallery",
  "code",
  "table",
  "break",
  "htmlBlock",
  "embed",
]);
const BLOCK_STYLES = new Set([
  "normal",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "blockquote",
]);
const DECORATORS = new Set([
  "strong",
  "em",
  "code",
  "underline",
  "strike-through",
  "superscript",
  "subscript",
]);
const ALIGNMENTS = new Set(["left", "center", "right", "justify"]);
const IFRAME_HOSTNAMES = ["www.youtube.com", "player.vimeo.com"];
const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function assertContent(
  condition: unknown,
  blockType: string,
  detail: string
): asserts condition {
  if (!condition) throw new BlogFeedContentError(blockType, detail);
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function node(value: unknown, expectedType?: string): PortableTextBlock {
  const type =
    record(value) && typeof value._type === "string" ? value._type : "unknown";
  assertContent(record(value), type, "Expected a Portable Text object");
  assertContent(
    typeof value._type === "string" && value._type,
    type,
    "Missing _type"
  );
  assertContent(
    !expectedType || type === expectedType,
    type,
    `Expected ${expectedType}`
  );
  assertContent(typeof value._key === "string", type, "Missing _key");
  return value as PortableTextBlock;
}

function array(value: unknown, type: string, field: string): unknown[] {
  assertContent(Array.isArray(value), type, `${field} must be an array`);
  return value;
}

function string(value: unknown, type: string, field: string): string {
  assertContent(typeof value === "string", type, `${field} must be a string`);
  return value;
}

function optionalString(
  value: unknown,
  type: string,
  field: string
): string | undefined {
  return value === undefined ? undefined : string(value, type, field);
}

function optionalBoolean(value: unknown, type: string, field: string): void {
  assertContent(
    value === undefined || typeof value === "boolean",
    type,
    `${field} must be a boolean`
  );
}

function positiveInteger(
  value: unknown,
  type: string,
  field: string,
  max = Number.MAX_SAFE_INTEGER
): number {
  assertContent(
    typeof value === "number" &&
      Number.isSafeInteger(value) &&
      value >= 1 &&
      value <= max,
    type,
    `${field} must be a positive integer no greater than ${max}`
  );
  return value;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => HTML_ENTITIES[character]);
}

function markDefs(value: unknown, type: string): PortableTextBlock[] {
  const keys = new Set<string>();
  return value === undefined
    ? []
    : array(value, type, "markDefs").map((value) => {
        const mark = node(value);
        assertContent(
          mark._type === "link",
          mark._type,
          "Unsupported mark definition"
        );
        assertContent(
          !keys.has(mark._key),
          type,
          `Duplicate mark key "${mark._key}"`
        );
        keys.add(mark._key);
        string(mark.href, "link", "href");
        optionalString(mark.title, "link", "title");
        optionalBoolean(mark.blank, "link", "blank");
        return mark;
      });
}

function spans(
  value: unknown,
  definitions: PortableTextBlock[],
  type: string
): PortableTextBlock[] {
  const keys = new Set(definitions.map((mark) => mark._key));
  return array(value, type, "content").map((value) => {
    const span = node(value, "span");
    string(span.text, "span", "text");
    if (span.marks !== undefined) {
      for (const mark of array(span.marks, "span", "marks")) {
        assertContent(
          typeof mark === "string",
          "span",
          "Marks must be strings"
        );
        assertContent(
          DECORATORS.has(mark) || keys.has(mark),
          mark,
          "Unsupported or undefined mark"
        );
      }
    }
    return span;
  });
}

function textBlock(value: PortableTextBlock): TextBlock {
  const definitions = markDefs(value.markDefs, "block");
  const children = spans(value.children, definitions, "block");
  const style = optionalString(value.style, "block", "style") ?? "normal";
  assertContent(BLOCK_STYLES.has(style), style, "Unsupported block style");
  const listItem = optionalString(value.listItem, "block", "listItem");
  assertContent(
    listItem === undefined || listItem === "bullet" || listItem === "number",
    listItem ?? "block",
    "Unsupported list style"
  );
  if (value.level !== undefined) positiveInteger(value.level, "block", "level");
  if (value.listStart !== undefined)
    positiveInteger(value.listStart, "block", "listStart", 2_147_483_647);
  const listId = optionalString(value.listId, "block", "listId")?.trim();
  assertContent(
    listId === undefined || (listId.length > 0 && listId.length <= 128),
    "block",
    "Invalid listId"
  );
  return {
    ...value,
    children,
    markDefs: definitions,
    style,
    listItem,
    listId,
  } as TextBlock;
}

function buildLists(blocks: PortableTextBlock[]): PortableTextBlock[] {
  interface ListDescriptor {
    node: ListNode;
    parent?: TextBlock;
    listId?: string;
    explicitStart?: number;
    scope: string | ListNode;
  }
  const result: PortableTextBlock[] = [];
  const active = new Map<number, ListDescriptor>();
  const lastItems = new Map<number, { node: TextBlock; index: number }>();
  const lists: ListDescriptor[] = [];

  for (const [index, block] of blocks.entries()) {
    if (block._type !== "block" || !block.listItem) {
      result.push(block);
      active.clear();
      lastItems.clear();
      continue;
    }
    const item = block as TextBlock;
    const level = item.level ?? 1;
    for (const depth of active.keys()) if (depth > level) active.delete(depth);
    for (const depth of lastItems.keys())
      if (depth > level) lastItems.delete(depth);
    let parent: { node: TextBlock; index: number } | undefined;
    let parentLevel = 0;
    for (const [depth, candidate] of lastItems) {
      if (depth < level && depth > parentLevel) {
        parent = candidate;
        parentLevel = depth;
      }
    }
    let list = active.get(level);
    const separateStart =
      item.listItem === "number" &&
      !item.listId &&
      item.listStart !== undefined &&
      list?.explicitStart !== item.listStart;
    if (
      !list ||
      list.node.listItem !== item.listItem ||
      list.parent !== parent?.node ||
      (item.listItem === "number" && list.listId !== item.listId) ||
      separateStart
    ) {
      const listNode: ListNode = {
        _type: "@list",
        _key: `${item._key}-list-${index}`,
        children: [],
        listItem: item.listItem!,
        level,
        mode: "html",
      };
      list = {
        node: listNode,
        parent: parent?.node,
        listId: item.listId,
        explicitStart: item.listStart,
        scope: item.listId
          ? JSON.stringify([item.listId, level, parent?.index ?? "root"])
          : listNode,
      };
      lists.push(list);
      active.set(level, list);
      if (parent) parent.node.children.push(listNode);
      else result.push(listNode);
    }
    const rendered = { ...item, children: [...item.children] };
    list.node.children.push(rendered);
    lastItems.set(level, { node: rendered, index });
  }

  // A listId continues numbering across interrupted runs, scoped to its parent item.
  const bases = new Map<string | ListNode, number>();
  const counts = new Map<string | ListNode, number>();
  for (const list of lists) {
    if (list.node.listItem !== "number" || bases.has(list.scope)) continue;
    const start = list.node.children.find(
      (item) => item.listStart !== undefined
    )?.listStart;
    if (start !== undefined) bases.set(list.scope, start);
  }
  for (const list of lists) {
    if (list.node.listItem !== "number") continue;
    const count = counts.get(list.scope) ?? 0;
    list.node.start = positiveInteger(
      (bases.get(list.scope) ?? 1) + count,
      "block",
      "listStart",
      2_147_483_647
    );
    counts.set(list.scope, count + list.node.children.length);
  }
  return result;
}

function renderLink(value: unknown, children: string): string {
  assertContent(record(value), "link", "Missing link definition");
  const href = string(value.href, "link", "href");
  const title = optionalString(value.title, "link", "title");
  optionalBoolean(value.blank, "link", "blank");
  const target =
    value.blank && !href.trim().startsWith("#")
      ? ' target="_blank" rel="noopener noreferrer"'
      : "";
  return `<a href="${escapeHtml(href)}"${title !== undefined ? ` title="${escapeHtml(title)}"` : ""}${target}>${children}</a>`;
}

function imageDimension(value: unknown, field: string): number | undefined {
  if (value === undefined) return undefined;
  assertContent(
    typeof value === "number" && Number.isFinite(value) && value > 0,
    "image",
    `${field} must be a positive number`
  );
  return value;
}

function renderImage(value: PortableTextBlock): string {
  assertContent(record(value.asset), "image", "Missing asset");
  const id = string(value.asset._ref, "image", "asset._ref");
  const src = value.asset.url;
  assertContent(
    typeof src === "string" && src.trim(),
    "image",
    `Missing resolved asset.url for media reference ${JSON.stringify(id)}`
  );
  const alt = optionalString(value.alt, "image", "alt") ?? "";
  const title = optionalString(value.title, "image", "title");
  const caption = optionalString(value.caption, "image", "caption");
  const originalWidth = imageDimension(value.width, "width");
  const originalHeight = imageDimension(value.height, "height");
  const displayWidth = imageDimension(value.displayWidth, "displayWidth");
  const displayHeight = imageDimension(value.displayHeight, "displayHeight");
  const ratio =
    originalWidth && originalHeight
      ? originalWidth / originalHeight
      : undefined;
  const width =
    displayWidth ??
    (displayHeight && ratio
      ? Math.round(displayHeight * ratio)
      : originalWidth);
  const height =
    displayHeight ??
    (displayWidth && ratio ? Math.round(displayWidth / ratio) : originalHeight);
  const metadata = `${title !== undefined ? ` title="${escapeHtml(title)}"` : ""}${width ? ` width="${width}"` : ""}${height ? ` height="${height}"` : ""}`;
  let image = `<img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}"${metadata}>`;
  if (value.link !== undefined) {
    image = renderLink(
      typeof value.link === "string" ? { href: value.link } : value.link,
      image
    );
  }
  return `<figure>${image}${caption ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ""}</figure>`;
}

function renderCode(value: PortableTextBlock): string {
  const code = string(value.code, "code", "code");
  const language = optionalString(value.language, "code", "language");
  const filename = optionalString(value.filename, "code", "filename");
  const languageClass = language
    ? ` class="language-${escapeHtml(language)}"`
    : "";
  const label =
    filename !== undefined
      ? `<div class="emdash-code-filename">${escapeHtml(filename)}</div>`
      : "";
  // The package's escapeHTML normalizes spaces, which would change literal code.
  return `${label}<pre><code${languageClass}>${escapeHtml(code)}</code></pre>`;
}

function renderTable(
  value: PortableTextBlock,
  render: (blocks: PortableTextBlock[]) => string
): string {
  optionalBoolean(value.hasHeaderRow, "table", "hasHeaderRow");
  const shared = markDefs(value.markDefs, "table");
  const rows = array(value.rows, "table", "rows").map((value) => {
    const row = node(value, "tableRow");
    return array(row.cells, "tableRow", "cells").map((value) => {
      const cell = node(value, "tableCell");
      const definitions = new Map(shared.map((mark) => [mark._key, mark]));
      for (const mark of markDefs(cell.markDefs, "tableCell"))
        definitions.set(mark._key, mark);
      optionalBoolean(cell.isHeader, "tableCell", "isHeader");
      if (cell.colspan !== undefined)
        positiveInteger(cell.colspan, "tableCell", "colspan", 100);
      if (cell.rowspan !== undefined)
        positiveInteger(cell.rowspan, "tableCell", "rowspan", 100);
      const alignment = optionalString(
        cell.textAlign,
        "tableCell",
        "textAlign"
      );
      assertContent(
        alignment === undefined || ALIGNMENTS.has(alignment),
        "tableCell",
        "Invalid textAlign"
      );
      return {
        ...cell,
        content: spans(cell.content, [...definitions.values()], "tableCell"),
        markDefs: [...definitions.values()],
      } as TableCell;
    });
  });
  const first = rows[0] ?? [];
  const promoteHeader =
    value.hasHeaderRow === true &&
    !first.some((cell) => cell.isHeader !== undefined);
  const hasHeaderRow =
    first.length > 0 &&
    first.every(
      (cell) =>
        (promoteHeader || cell.isHeader === true) && (cell.rowspan ?? 1) === 1
    );
  const occupied = rows.map(() => new Set<number>());
  const renderedRows = rows.map((cells, rowIndex) => {
    let column = 0;
    return `<tr>${cells
      .map((cell) => {
        while (occupied[rowIndex].has(column)) column++;
        const isHeader =
          cell.isHeader === true || (rowIndex === 0 && promoteHeader);
        const tag = isHeader ? "th" : "td";
        const scope =
          hasHeaderRow && rowIndex === 0
            ? "col"
            : isHeader && column === 0 && (cell.rowspan ?? 1) === 1
              ? "row"
              : undefined;
        const attributes = `${scope ? ` scope="${scope}"` : ""}${(cell.colspan ?? 1) > 1 ? ` colspan="${cell.colspan}"` : ""}${(cell.rowspan ?? 1) > 1 ? ` rowspan="${cell.rowspan}"` : ""}${cell.textAlign ? ` style="text-align:${cell.textAlign}"` : ""}`;
        for (let rowOffset = 0; rowOffset < (cell.rowspan ?? 1); rowOffset++) {
          for (
            let columnOffset = 0;
            columnOffset < (cell.colspan ?? 1);
            columnOffset++
          ) {
            occupied[rowIndex + rowOffset]?.add(column + columnOffset);
          }
        }
        column += cell.colspan ?? 1;
        const contents = render([
          {
            _type: "block",
            _key: cell._key,
            children: cell.content,
            markDefs: cell.markDefs,
          },
        ]);
        return `<${tag}${attributes}>${contents}</${tag}>`;
      })
      .join("")}</tr>`;
  });
  const head = hasHeaderRow ? `<thead>${renderedRows.shift()}</thead>` : "";
  return `<table>${head}<tbody>${renderedRows.join("")}</tbody></table>`;
}

function absoluteUrl(value: string, site: URL, href: boolean): URL | undefined {
  if (
    (!value.trim() && (!href || value !== "")) ||
    /[\u0000-\u001f\u007f]/.test(value)
  )
    return undefined;
  try {
    const url = new URL(value, site);
    const safe =
      url.protocol === "http:" ||
      url.protocol === "https:" ||
      (href && (url.protocol === "mailto:" || url.protocol === "tel:"));
    return safe && !url.username && !url.password ? url : undefined;
  } catch {
    return undefined;
  }
}

function renderEmbed(value: PortableTextBlock, site: URL): string {
  const rawUrl = string(value.url, "embed", "url");
  const html = optionalString(value.html, "embed", "html");
  const caption = optionalString(value.caption, "embed", "caption");
  const url = absoluteUrl(rawUrl, site, false);
  let videoId: string | undefined;
  let provider: "YouTube" | "Vimeo" | undefined;
  if (
    url &&
    ["youtube.com", "www.youtube.com", "m.youtube.com", "youtu.be"].includes(
      url.hostname
    )
  ) {
    const candidate =
      url.hostname === "youtu.be"
        ? url.pathname.slice(1)
        : url.pathname === "/watch"
          ? url.searchParams.get("v")
          : url.pathname.match(/^\/embed\/([^/]+)$/)?.[1];
    if (candidate && /^[a-zA-Z0-9_-]{11}$/.test(candidate)) {
      videoId = candidate;
      provider = "YouTube";
    }
  } else if (
    url &&
    ["vimeo.com", "www.vimeo.com", "player.vimeo.com"].includes(url.hostname)
  ) {
    videoId = url.pathname.match(/^\/(?:video\/)?(\d+)$/)?.[1];
    if (videoId) provider = "Vimeo";
  }
  const source =
    provider === "YouTube"
      ? `https://www.youtube.com/embed/${videoId}`
      : `https://player.vimeo.com/video/${videoId}`;
  const embed = provider
    ? `<iframe src="${source}" title="${provider} video" allowfullscreen></iframe>`
    : html || renderLink({ href: rawUrl }, escapeHtml(rawUrl));
  return `<figure>${embed}${caption !== undefined ? `<figcaption>${escapeHtml(caption)}</figcaption>` : ""}</figure>`;
}

function siteUrl(site: string | URL): URL {
  let base: URL;
  try {
    base = new URL(site);
  } catch {
    throw new BlogFeedContentError("site", "Expected an absolute HTTP(S) URL");
  }
  assertContent(
    (base.protocol === "http:" || base.protocol === "https:") &&
      !base.username &&
      !base.password,
    "site",
    "Expected an absolute HTTP(S) URL without credentials"
  );
  return base;
}

export function portableTextToFeedHtml(
  content: PortableTextBlock[],
  site: string | URL
): string {
  const base = siteUrl(site);
  const blocks = array(content, "content", "content").map((value) => {
    const block = node(value);
    assertContent(
      BLOCK_TYPES.has(block._type),
      block._type,
      "Unsupported block type"
    );
    if (block._type === "block") return textBlock(block);
    assertContent(
      block.children === undefined,
      block._type,
      "Unexpected children on a custom block"
    );
    return block;
  });
  const components: PortableTextComponents = {
    escapeHTML: escapeHtml,
    types: {
      image: ({ value }) => renderImage(value),
      gallery: ({ value }) =>
        `<div>${array(value.images, "gallery", "images")
          .map((value) => renderImage(node(value, "image")))
          .join("")}</div>`,
      code: ({ value }) => renderCode(value),
      table: ({ value }) => renderTable(value, render),
      break: ({ value }) => {
        const style = optionalString(value.style, "break", "style") ?? "line";
        assertContent(
          ["line", "lineBreak", "dots", "space"].includes(style),
          "break",
          "Unsupported break style"
        );
        return style === "dots"
          ? "<div>• • •</div>"
          : style === "space"
            ? "<br><br>"
            : "<hr>";
      },
      htmlBlock: ({ value }) => string(value.html, "htmlBlock", "html"),
      embed: ({ value }) => renderEmbed(value, base),
    },
    marks: {
      link: ({ value, children }) => renderLink(value, children),
      underline: ({ children }) => `<u>${children}</u>`,
      superscript: ({ children }) => `<sup>${children}</sup>`,
      subscript: ({ children }) => `<sub>${children}</sub>`,
    },
    list: {
      number: ({ value, children }) => {
        const start = (value as typeof value & { start: number }).start;
        return `<ol${start !== 1 ? ` start="${start}"` : ""}>${children}</ol>`;
      },
    },
  };
  function render(blocks: PortableTextBlock[]): string {
    return toHTML(blocks, {
      components,
      onMissingComponent: (_message, { type, nodeType }) => {
        throw new BlogFeedContentError(type, `Unsupported ${nodeType}`);
      },
    });
  }
  return addBlogHeadingIds(sanitizeBlogHtml(render(buildLists(blocks)), base));
}

export function sanitizeBlogHtml(html: string, site: string | URL): string {
  const base = siteUrl(site);
  return sanitizeHtml(string(html, "htmlBlock", "html"), {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img", "iframe", "del"],
    allowedAttributes: {
      "*": ["class", "id"],
      a: ["href", "name", "title", "target", "rel"],
      img: ["src", "alt", "title", "width", "height"],
      iframe: [
        "src",
        "title",
        "width",
        "height",
        "frameborder",
        "allow",
        "allowfullscreen",
      ],
      ol: ["start", "reversed", "type"],
      li: ["value"],
      th: ["scope", "colspan", "rowspan", "style"],
      td: ["colspan", "rowspan", "style"],
    },
    allowedStyles: {
      th: { "text-align": [/^(left|center|right|justify)$/] },
      td: { "text-align": [/^(left|center|right|justify)$/] },
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    allowedSchemesByTag: { img: ["http", "https"], iframe: ["http", "https"] },
    allowProtocolRelative: false,
    allowedIframeHostnames: IFRAME_HOSTNAMES,
    allowIframeRelativeUrls: false,
    transformTags: {
      "*": (tagName, attributes) => {
        for (const attribute of ["src", "href"]) {
          if (attributes[attribute] === undefined) continue;
          const url = absoluteUrl(
            attributes[attribute],
            base,
            attribute === "href"
          );
          if (url) attributes[attribute] = url.href;
          else delete attributes[attribute];
        }
        if (tagName === "a" && attributes.target === "_blank")
          attributes.rel = "noopener noreferrer";
        return { tagName, attribs: attributes };
      },
    },
    exclusiveFilter: ({ tag, attribs }) => {
      if ((tag === "img" || tag === "iframe") && !attribs.src) return true;
      return tag === "a" && !attribs.href && !attribs.id && !attribs.name
        ? "excludeTag"
        : false;
    },
  });
}
