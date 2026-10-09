import type {
  PortableTextBlock,
  PortableTextHtmlBlock,
  PortableTextImageBlock,
  PortableTextMarkDef,
  PortableTextSpan,
  PortableTextTableBlock,
  PortableTextTableCell,
  PortableTextTextBlock,
} from "emdash";
import MarkdownIt from "markdown-it";
import type Token from "markdown-it/lib/token.mjs";
import sanitizeHtml from "sanitize-html";

export type ResolvedBlogImage = {
  id: string;
  url: string;
  provider?: string;
  width?: number;
  height?: number;
};

export class BlogMarkdownError extends Error {
  readonly line?: number;

  constructor(
    public readonly code:
      | "unsupported-markdown"
      | "unsupported-html"
      | "invalid-image"
      | "image-resolution",
    public readonly tokenType: string,
    message: string,
    options: { line?: number; source?: string; cause?: unknown } = {}
  ) {
    super(
      `${options.line ? `Markdown line ${options.line}: ` : ""}${message}`,
      { cause: options.cause }
    );
    this.name = "BlogMarkdownError";
    this.line = options.line;
    this.source = options.source;
  }

  readonly source?: string;
}

const parser = new MarkdownIt({
  html: true,
  linkify: false,
  typographer: false,
});
parser.renderer.rules.image = (
  tokens,
  index,
  options,
  _environment,
  renderer
) => renderer.renderToken(tokens, index, options);
const linkSchemes = ["http", "https", "mailto", "tel"];

const supportedTokens = new Set([
  "paragraph_open",
  "paragraph_close",
  "heading_open",
  "heading_close",
  "bullet_list_open",
  "bullet_list_close",
  "ordered_list_open",
  "ordered_list_close",
  "list_item_open",
  "list_item_close",
  "blockquote_open",
  "blockquote_close",
  "table_open",
  "table_close",
  "thead_open",
  "thead_close",
  "tbody_open",
  "tbody_close",
  "tr_open",
  "tr_close",
  "th_open",
  "th_close",
  "td_open",
  "td_close",
  "inline",
  "text",
  "text_special",
  "softbreak",
  "hardbreak",
  "code_inline",
  "code_block",
  "fence",
  "hr",
  "em_open",
  "em_close",
  "strong_open",
  "strong_close",
  "s_open",
  "s_close",
  "link_open",
  "link_close",
  "image",
  "html_inline",
  "html_block",
]);

function unsupported(
  token: Token,
  message = `unsupported Markdown token ${token.type}`
): BlogMarkdownError {
  return new BlogMarkdownError("unsupported-markdown", token.type, message, {
    line: token.map ? token.map[0] + 1 : undefined,
  });
}

function isComment(source: string): boolean {
  let offset = 0;
  let found = false;
  while (offset < source.length) {
    if (/\s/.test(source[offset])) {
      offset++;
      continue;
    }
    if (!source.startsWith("<!--", offset)) return false;
    const start = offset + 4;
    const end = source.indexOf("-->", start);
    if (end === -1) return false;
    const content = source.slice(start, end);
    if (
      content.startsWith(">") ||
      content.startsWith("->") ||
      content.endsWith("-") ||
      content.includes("<!--") ||
      content.includes("--!>")
    )
      return false;
    found = true;
    offset = end + 3;
  }
  return found;
}

function isBreak(token: Token): boolean {
  return token.type === "html_inline" && /^<br\s*\/?>$/i.test(token.content);
}

function visitTokens(
  tokens: Token[],
  visit: (token: Token, line?: number) => void,
  parentLine?: number
): void {
  for (const token of tokens) {
    const line = token.map ? token.map[0] + 1 : parentLine;
    visit(token, line);
    if (token.children) visitTokens(token.children, visit, line);
  }
}

function parseMarkdown(markdown: string): Token[] {
  if (typeof markdown !== "string") {
    throw new BlogMarkdownError(
      "unsupported-markdown",
      "document",
      "Markdown must be a string"
    );
  }
  const tokens = parser.parse(markdown, {});
  visitTokens(tokens, (token, line) => {
    if (!supportedTokens.has(token.type)) throw unsupported(token);
    if (
      (token.type === "html_inline" || token.type === "html_block") &&
      !isBreak(token) &&
      !isComment(token.content)
    ) {
      throw new BlogMarkdownError(
        "unsupported-html",
        token.type,
        "raw HTML is supported only for inert comments and inline line breaks",
        { line, source: token.content }
      );
    }
    if (token.type === "image") {
      const source = token.attrGet("src") ?? "";
      if (!safeImageUrl(source)) {
        throw new BlogMarkdownError(
          "invalid-image",
          token.type,
          "unsupported image URL",
          { line, source }
        );
      }
    }
    if (token.type === "link_open") {
      const href = token.attrGet("href");
      const scheme = href?.match(/^([a-z][a-z\d+.-]*):/i)?.[1].toLowerCase();
      if (
        href === null ||
        !parser.validateLink(href) ||
        (scheme && !linkSchemes.includes(scheme))
      ) {
        throw new BlogMarkdownError(
          "unsupported-markdown",
          token.type,
          "unsupported link URL",
          { line, source: href ?? undefined }
        );
      }
    }
  });
  return tokens;
}

export function getMarkdownImageSources(markdown: string): string[] {
  const sources = new Set<string>();
  visitTokens(parseMarkdown(markdown), (token) => {
    if (token.type === "image") sources.add(token.attrGet("src") ?? "");
  });
  return [...sources];
}

interface MarkdownNode {
  token: Token;
  children: MarkdownNode[];
  close?: Token;
}

function tokenTree(tokens: Token[]): MarkdownNode[] {
  const nodes: MarkdownNode[] = [];
  const stack: MarkdownNode[] = [];
  for (const token of tokens) {
    if (token.nesting === -1) {
      const node = stack.pop();
      if (!node || token.type !== node.token.type.replace(/_open$/, "_close")) {
        throw unsupported(token, "unbalanced Markdown block tokens");
      }
      node.close = token;
    } else {
      const node = { token, children: [] };
      (stack.at(-1)?.children ?? nodes).push(node);
      if (token.nesting === 1) stack.push(node);
    }
  }
  if (stack.length)
    throw unsupported(stack[0].token, "unclosed Markdown block");
  return nodes;
}

function flattenNode(node: MarkdownNode): Token[] {
  return [
    node.token,
    ...node.children.flatMap(flattenNode),
    ...(node.close ? [node.close] : []),
  ];
}

function inlineTokens(node: MarkdownNode): Token[] {
  if (node.children.length !== 1 || node.children[0].token.type !== "inline") {
    throw unsupported(
      node.token,
      "expected one inline token inside text block"
    );
  }
  return node.children[0].token.children ?? [];
}

function hasLossyLink(tokens: Token[]): boolean {
  let link: Token | undefined;
  let hasContent = false;
  for (const token of tokens) {
    if (token.type === "link_open") {
      link = token;
      hasContent = false;
    } else if (token.type === "link_close") {
      if (!hasContent) return true;
      link = undefined;
    } else if (link && token.type === "image") {
      // The admin's image-link normalizer discards titles and empty hrefs.
      if (link.attrGet("title") !== null || link.attrGet("href") === "")
        return true;
      hasContent = true;
    } else if (
      link &&
      ((token.nesting === 0 && token.content.length > 0) ||
        token.type === "softbreak" ||
        token.type === "hardbreak")
    ) {
      hasContent = true;
    }
  }
  return false;
}

function hasCodeBeforeBreak(tokens: Token[]): boolean {
  let afterCode = false;
  for (const token of tokens) {
    const linebreak =
      token.type === "softbreak" ||
      token.type === "hardbreak" ||
      isBreak(token);
    // EmDash 1.0.1 appends non-table breaks to the preceding span, including code.
    if (linebreak && afterCode) return true;
    if (
      token.nesting === 0 &&
      (linebreak || token.content.length > 0 || token.type === "image")
    )
      afterCode = token.type === "code_inline";
  }
  return false;
}

function hasNonTextInline(node: MarkdownNode): boolean {
  const tokens = inlineTokens(node);
  return (
    hasLossyLink(tokens) ||
    tokens.some(
      (token) =>
        token.type === "image" ||
        (token.type === "html_inline" && !isBreak(token))
    )
  );
}

function isList(node: MarkdownNode): boolean {
  return (
    node.token.type === "bullet_list_open" ||
    node.token.type === "ordered_list_open"
  );
}

function canRepresentList(node: MarkdownNode): boolean {
  const start = Number(node.token.attrGet("start") ?? 1);
  if (start < 1 || start > 2_147_483_647) return false;
  return node.children.every((item) => {
    if (item.token.type !== "list_item_open") throw unsupported(item.token);
    const children = item.children;
    const paragraph =
      children[0]?.token.type === "paragraph_open" ? children[0] : undefined;
    if (
      paragraph &&
      (hasNonTextInline(paragraph) ||
        hasCodeBeforeBreak(inlineTokens(paragraph)))
    )
      return false;
    const nested = children.slice(paragraph ? 1 : 0);
    return nested.every(
      (child, index) =>
        isList(child) &&
        canRepresentList(child) &&
        !(
          child.token.type === "bullet_list_open" &&
          nested[index - 1]?.token.type === "bullet_list_open"
        )
    );
  });
}

function imageAlt(tokens: Token[]): string {
  return tokens
    .map((token) => {
      if (token.type === "image") return imageAlt(token.children ?? []);
      if (
        token.type === "softbreak" ||
        token.type === "hardbreak" ||
        isBreak(token)
      )
        return "\n";
      return token.nesting === 0 ? token.content : "";
    })
    .join("");
}

function safeImageUrl(url: string): boolean {
  return (
    !!url.trim() &&
    url === url.trim() &&
    !/[\u0000-\u001f\u007f]/.test(url) &&
    !/\\/.test(url) &&
    (!/^[a-z][a-z\d+.-]*:/i.test(url) || /^https?:\/\//i.test(url)) &&
    parser.validateLink(url)
  );
}

function resolveImages(
  tokens: Token[],
  resolveImage: (source: string) => ResolvedBlogImage
): WeakMap<Token, ResolvedBlogImage> {
  const images = new WeakMap<Token, ResolvedBlogImage>();
  visitTokens(tokens, (token, line) => {
    if (token.type !== "image") return;
    const source = token.attrGet("src") ?? "";
    let image: ResolvedBlogImage;
    try {
      image = resolveImage(source);
    } catch (cause) {
      throw new BlogMarkdownError(
        "image-resolution",
        token.type,
        `cannot resolve image ${source}`,
        { line, source, cause }
      );
    }
    if (
      !image ||
      typeof image.id !== "string" ||
      !image.id.trim() ||
      typeof image.url !== "string" ||
      !safeImageUrl(image.url) ||
      (image.provider !== undefined &&
        (typeof image.provider !== "string" || !image.provider.trim())) ||
      [image.width, image.height].some(
        (dimension) =>
          dimension !== undefined &&
          (typeof dimension !== "number" ||
            !Number.isFinite(dimension) ||
            dimension <= 0)
      )
    ) {
      throw new BlogMarkdownError(
        "invalid-image",
        token.type,
        `invalid resolved image ${source}`,
        { line, source }
      );
    }
    images.set(token, image);
    token.attrSet("src", image.url);
    token.attrSet("alt", imageAlt(token.children ?? []));
    if (image.width !== undefined) token.attrSet("width", String(image.width));
    if (image.height !== undefined)
      token.attrSet("height", String(image.height));
  });
  return images;
}

function sanitizedFallback(node: MarkdownNode): string {
  const comments: string[] = [];
  const html = parser.renderer.render(flattenNode(node), parser.options, {});
  const marked = html.replace(/<!--[\s\S]*?-->/g, (comment) => {
    comments.push(comment);
    return `<span data-blog-comment="${comments.length - 1}"></span>`;
  });
  // Installed sanitize-html typings predate its empty-attribute option.
  const options: sanitizeHtml.IOptions & {
    allowedEmptyAttributes: string[];
  } = {
    allowedTags: [
      "a",
      "blockquote",
      "br",
      "code",
      "em",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "hr",
      "img",
      "li",
      "ol",
      "p",
      "pre",
      "s",
      "span",
      "strong",
      "table",
      "tbody",
      "td",
      "th",
      "thead",
      "tr",
      "ul",
    ],
    allowedAttributes: {
      a: ["href", "title"],
      code: ["class"],
      img: ["src", "alt", "title", "width", "height"],
      ol: ["start"],
      span: ["data-blog-comment"],
      td: ["style"],
      th: ["style"],
    },
    allowedStyles: {
      td: { "text-align": [/^(?:left|right|center)$/] },
      th: { "text-align": [/^(?:left|right|center)$/] },
    },
    allowedEmptyAttributes: ["alt", "href", "title"],
    allowedSchemes: linkSchemes,
    allowedSchemesByTag: { img: ["http", "https"] },
  };
  const sanitized = sanitizeHtml(marked, options);
  return sanitized.replace(
    /<span data-blog-comment="(\d+)"><\/span>/g,
    (_, index: string) => comments[Number(index)]
  );
}

interface TextPart {
  kind: "text";
  children: PortableTextSpan[];
  markDefs: PortableTextMarkDef[];
}

interface ImagePart {
  kind: "image";
  token: Token;
  link?: { href: string; title?: string };
}

interface ActiveMark {
  type: string;
  decorator?: string;
  link?: { href: string; title?: string };
}

export function markdownToBlogPortableText(
  markdown: string,
  resolveImage: (source: string) => ResolvedBlogImage
): PortableTextBlock[] {
  const tokens = parseMarkdown(markdown);
  const images = resolveImages(tokens, resolveImage);
  let nextKey = 0;
  const key = () => `blog-${(nextKey++).toString(36)}`;

  const inlineParts = (tokens: Token[]): Array<TextPart | ImagePart> => {
    const parts: Array<TextPart | ImagePart> = [];
    const active: ActiveMark[] = [];
    let children: PortableTextSpan[] = [];
    let definitions = new Map<string, PortableTextMarkDef>();
    const flush = () => {
      if (children.length)
        parts.push({
          kind: "text",
          children,
          markDefs: [...definitions.values()],
        });
      children = [];
      definitions = new Map();
    };
    const span = (text: string, code = false) => {
      if (!text) return;
      const marks = active.map((mark) => {
        if (mark.decorator) return mark.decorator;
        const signature = JSON.stringify(mark.link);
        let definition = definitions.get(signature);
        if (!definition) {
          definition = { _type: "link", _key: key(), ...mark.link };
          definitions.set(signature, definition);
        }
        return definition._key;
      });
      if (code) marks.push("code");
      const uniqueMarks = [...new Set(marks)];
      const previous = children.at(-1);
      if (
        previous &&
        JSON.stringify(previous.marks ?? []) === JSON.stringify(uniqueMarks)
      )
        previous.text += text;
      else
        children.push({
          _type: "span",
          _key: key(),
          text,
          ...(uniqueMarks.length ? { marks: uniqueMarks } : {}),
        });
    };
    for (const token of tokens) {
      switch (token.type) {
        case "text":
        case "text_special":
          span(token.content);
          break;
        case "softbreak":
        case "hardbreak":
          span("\n");
          break;
        case "code_inline":
          span(token.content, true);
          break;
        case "html_inline":
          if (!isBreak(token))
            throw unsupported(token, "raw HTML requires a lossless HTML block");
          span("\n");
          break;
        case "em_open":
          active.push({ type: token.type, decorator: "em" });
          break;
        case "strong_open":
          active.push({ type: token.type, decorator: "strong" });
          break;
        case "s_open":
          active.push({ type: token.type, decorator: "strike-through" });
          break;
        case "link_open": {
          const href = token.attrGet("href");
          if (href === null || !parser.validateLink(href))
            throw unsupported(token, "unsupported link URL");
          const title = token.attrGet("title");
          active.push({
            type: token.type,
            link: { href, ...(title === null ? {} : { title }) },
          });
          break;
        }
        case "em_close":
        case "strong_close":
        case "s_close":
        case "link_close":
          if (active.pop()?.type !== token.type.replace(/_close$/, "_open"))
            throw unsupported(token, "unbalanced inline marks");
          break;
        case "image":
          flush();
          parts.push({
            kind: "image",
            token,
            link: active.findLast((mark) => mark.link)?.link,
          });
          break;
        default:
          throw unsupported(token);
      }
    }
    if (active.length)
      throw new BlogMarkdownError(
        "unsupported-markdown",
        "inline",
        "unclosed inline marks"
      );
    flush();
    return parts;
  };

  const textBlock = (
    part: TextPart,
    style: PortableTextTextBlock["style"]
  ): PortableTextTextBlock & PortableTextBlock => ({
    _type: "block",
    _key: key(),
    style,
    children: part.children.length
      ? part.children
      : [{ _type: "span", _key: key(), text: "" }],
    ...(part.markDefs.length ? { markDefs: part.markDefs } : {}),
  });
  const fallback = (
    node: MarkdownNode
  ): PortableTextHtmlBlock & PortableTextBlock => ({
    _type: "htmlBlock",
    _key: key(),
    html: sanitizedFallback(node),
  });
  const imageBlock = (
    part: ImagePart
  ): PortableTextImageBlock & PortableTextBlock => {
    const image = images.get(part.token);
    if (!image) throw unsupported(part.token, "unresolved image token");
    const title = part.token.attrGet("title");
    return {
      _type: "image",
      _key: key(),
      asset: {
        _ref: image.id,
        url: image.url,
        provider: image.provider ?? "local",
      },
      alt: part.token.attrGet("alt") ?? "",
      caption: "",
      ...(title === null ? {} : { title }),
      ...(image.width === undefined ? {} : { width: image.width }),
      ...(image.height === undefined ? {} : { height: image.height }),
      ...(part.link ? { link: part.link } : {}),
    };
  };
  const paragraph = (
    node: MarkdownNode,
    style: PortableTextTextBlock["style"]
  ): PortableTextBlock[] => {
    const inline = inlineTokens(node);
    if (
      hasLossyLink(inline) ||
      hasCodeBeforeBreak(inline) ||
      inline.some((token) => token.type === "html_inline" && !isBreak(token)) ||
      (style !== "normal" && inline.some((token) => token.type === "image"))
    )
      return [fallback(node)];
    const parts = inlineParts(inline);
    if (!parts.length)
      return [textBlock({ kind: "text", children: [], markDefs: [] }, style)];
    return parts.map((part) =>
      part.kind === "text" ? textBlock(part, style) : imageBlock(part)
    );
  };
  const list = (
    node: MarkdownNode,
    level: number
  ): Array<PortableTextTextBlock & PortableTextBlock> => {
    const numbered = node.token.type === "ordered_list_open";
    const metadata = numbered
      ? { listId: key(), listStart: Number(node.token.attrGet("start") ?? 1) }
      : {};
    const blocks: Array<PortableTextTextBlock & PortableTextBlock> = [];
    for (const item of node.children) {
      const first =
        item.children[0]?.token.type === "paragraph_open"
          ? item.children[0]
          : undefined;
      const part = first ? inlineParts(inlineTokens(first))[0] : undefined;
      if (part && part.kind !== "text") throw unsupported(item.token);
      blocks.push({
        ...textBlock(
          part ?? { kind: "text", children: [], markDefs: [] },
          "normal"
        ),
        listItem: numbered ? "number" : "bullet",
        level,
        ...metadata,
      });
      for (const nested of item.children.slice(first ? 1 : 0))
        blocks.push(...list(nested, level + 1));
    }
    return blocks;
  };
  const table = (
    node: MarkdownNode
  ): PortableTextTableBlock | (PortableTextHtmlBlock & PortableTextBlock) => {
    const rows = node.children.flatMap((group) => {
      if (
        group.token.type !== "thead_open" &&
        group.token.type !== "tbody_open"
      )
        throw unsupported(group.token);
      return group.children;
    });
    if (rows.some((row) => row.children.some(hasNonTextInline)))
      return fallback(node);
    return {
      _type: "table",
      _key: key(),
      hasHeaderRow: true,
      rows: rows.map((row) => {
        if (row.token.type !== "tr_open") throw unsupported(row.token);
        return {
          _type: "tableRow",
          _key: key(),
          cells: row.children.map((cell): PortableTextTableCell => {
            if (cell.token.type !== "td_open" && cell.token.type !== "th_open")
              throw unsupported(cell.token);
            const part = inlineParts(inlineTokens(cell))[0] ?? {
              kind: "text",
              children: [],
              markDefs: [],
            };
            if (part.kind !== "text") throw unsupported(cell.token);
            const align = cell.token
              .attrGet("style")
              ?.replace("text-align:", "");
            if (
              align &&
              align !== "left" &&
              align !== "right" &&
              align !== "center"
            )
              throw unsupported(cell.token, "unsupported table alignment");
            const textAlign =
              align === "left" || align === "right" || align === "center"
                ? align
                : undefined;
            return {
              _type: "tableCell",
              _key: key(),
              content: part.children.length
                ? part.children
                : [{ _type: "span", _key: key(), text: "" }],
              ...(part.markDefs.length ? { markDefs: part.markDefs } : {}),
              isHeader: cell.token.type === "th_open",
              ...(textAlign ? { textAlign } : {}),
            };
          }),
        };
      }),
    };
  };

  const blocks: PortableTextBlock[] = [];
  const nodes = tokenTree(tokens);
  for (const [index, node] of nodes.entries()) {
    switch (node.token.type) {
      case "paragraph_open":
        blocks.push(...paragraph(node, "normal"));
        break;
      case "heading_open":
        blocks.push(
          ...paragraph(node, node.token.tag as PortableTextTextBlock["style"])
        );
        break;
      case "fence":
      case "code_block":
        blocks.push({
          _type: "code",
          _key: key(),
          code: node.token.content,
          ...(node.token.info ? { language: node.token.info.trim() } : {}),
        });
        break;
      case "hr":
        blocks.push({ _type: "break", _key: key(), style: "lineBreak" });
        break;
      case "bullet_list_open":
      case "ordered_list_open": {
        const mergesBulletLists =
          node.token.type === "bullet_list_open" &&
          nodes[index - 1]?.token.type === "bullet_list_open" &&
          blocks.at(-1)?._type === "block";
        if (!canRepresentList(node) || mergesBulletLists)
          blocks.push(fallback(node));
        else blocks.push(...list(node, 1));
        break;
      }
      case "blockquote_open":
        if (
          node.children.length === 1 &&
          node.children[0].token.type === "paragraph_open" &&
          !hasNonTextInline(node.children[0]) &&
          !hasCodeBeforeBreak(inlineTokens(node.children[0]))
        ) {
          blocks.push(...paragraph(node.children[0], "blockquote"));
        } else blocks.push(fallback(node));
        break;
      case "table_open":
        blocks.push(table(node));
        break;
      case "html_block":
        blocks.push(fallback(node));
        break;
      default:
        throw unsupported(node.token);
    }
  }
  return blocks;
}
