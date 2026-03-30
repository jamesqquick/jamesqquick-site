import rss from "@astrojs/rss";
import { getImage } from "astro:assets";
import { SITE_TITLE, SITE_DESCRIPTION } from "../config";
import sanitizeHtml from "sanitize-html";
import MarkdownIt from "markdown-it";
import { getSortedBlogPosts } from "../utils/contentCollections";

const parser = new MarkdownIt();

/** MIME type for RSS <enclosure type="..."> from source format or optimized URL */
function enclosureMime(coverFormat, optimizedSrc) {
  const s = optimizedSrc.toLowerCase();
  if (s.includes("fm=webp") || s.includes(".webp")) return "image/webp";
  if (s.includes("fm=png") || s.includes(".png")) return "image/png";
  if (s.includes("fm=avif") || s.includes(".avif")) return "image/avif";
  const map = {
    jpeg: "image/jpeg",
    jpg: "image/jpeg",
    png: "image/png",
    webp: "image/webp",
    gif: "image/gif",
    avif: "image/avif",
    tiff: "image/tiff",
    svg: "image/svg+xml",
  };
  return map[coverFormat] ?? "image/jpeg";
}

export const GET = async () => {
  const blogs = await getSortedBlogPosts();
  const site = import.meta.env.SITE;
  const items = await Promise.all(
    blogs.map(async (post) => {
      const optimized = await getImage({ src: post.data.coverImage });
      const imageUrl = new URL(optimized.src, site).href;
      return {
        title: post.data.title,
        pubDate: post.data.pubDate,
        description: post.data.description,
        link: `/blog/${post.id}/`,
        content: sanitizeHtml(parser.render(post.body)),
        enclosure: {
          url: imageUrl,
          length: 0,
          type: enclosureMime(post.data.coverImage.format, optimized.src),
        },
      };
    }),
  );
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site,
    items,
  });
};
