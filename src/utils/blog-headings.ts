import GithubSlugger from "github-slugger";
import { DomUtils, parseDocument } from "htmlparser2";

type BlogHeadingNode = {
  _type: string;
  text?: string;
  children?: BlogHeadingNode[];
};

export function getBlogHeadingText(nodes: BlogHeadingNode[]): string {
  // astro-portabletext replaces stored spans with nested @text/@span nodes.
  return nodes
    .map((node) =>
      node._type === "span" || node._type === "@text"
        ? (node.text ?? "")
        : node._type === "@span"
          ? getBlogHeadingText(node.children ?? [])
          : ""
    )
    .join("");
}

export function addBlogHeadingIds(html: string): string {
  const document = parseDocument(html, { withStartIndices: true });
  const headings = DomUtils.findAll(
    (element) =>
      /^h[1-6]$/.test(element.name) && !Object.hasOwn(element.attribs, "id"),
    document.children
  );
  const slugger = new GithubSlugger();
  let result = "";
  let cursor = 0;

  // Insert IDs by source offset so other markup, scripts, and whitespace stay exact.
  for (const heading of headings) {
    if (heading.startIndex === null) continue;
    const position = heading.startIndex + heading.name.length + 1;
    // Native text excludes padding introduced by Portable Text component templates.
    const text =
      heading.attribs["data-blog-heading-text"] ??
      DomUtils.textContent(heading);
    const id = slugger
      .slug(text)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/</g, "&lt;");
    result += html.slice(cursor, position) + ` id="${id}"`;
    cursor = position;
  }

  return result + html.slice(cursor);
}
