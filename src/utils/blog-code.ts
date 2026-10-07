import { DomUtils, parseDocument } from "htmlparser2";
import type { ShikiTransformer } from "shiki";
import { bundledLanguages, type BundledLanguage } from "shiki/langs";

type BlogCodeLanguage = BundledLanguage | "plaintext";

export function getBlogCodeLanguage(language?: string): BlogCodeLanguage {
  const name = language?.trim().split(/\s+/, 1)[0] ?? "plaintext";
  return Object.hasOwn(bundledLanguages, name)
    ? (name as BundledLanguage)
    : "plaintext";
}

type BlogCodeSegment =
  | { html: string }
  | {
      code: string;
      lang: BlogCodeLanguage;
      attributes: Record<string, string>;
      transformers: ShikiTransformer[];
    };

export function splitBlogCodeBlocks(html: string): BlogCodeSegment[] {
  const document = parseDocument(html, {
    withStartIndices: true,
    withEndIndices: true,
  });
  const blocks = DomUtils.findAll(
    (element) =>
      element.name === "pre" &&
      !element.attribs.class
        ?.split(/\s+/)
        .some((name) => name === "astro-code" || name === "shiki"),
    document.children
  );
  const segments: BlogCodeSegment[] = [];
  let cursor = 0;

  for (const block of blocks) {
    const code = DomUtils.findOne(
      (element) => element.name === "code",
      block.children,
      false
    );
    if (!code || block.startIndex === null || block.endIndex === null) continue;
    const language = code.attribs.class?.match(
      /(?:^|\s)language-([^\s]+)/
    )?.[1];
    segments.push(
      { html: html.slice(cursor, block.startIndex) },
      {
        code: DomUtils.textContent(code),
        lang: getBlogCodeLanguage(language),
        attributes: block.attribs,
        transformers: [
          {
            code(node) {
              Object.assign(node.properties, code.attribs);
            },
          },
        ],
      }
    );
    cursor = block.endIndex + 1;
  }

  segments.push({ html: html.slice(cursor) });
  return segments;
}
