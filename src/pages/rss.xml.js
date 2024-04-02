import rss from "@astrojs/rss";
import { SITE_TITLE, SITE_DESCRIPTION } from "../config";
import sanitizeHtml from "sanitize-html";
import MarkdownIt from "markdown-it";
import { getSortedBlogPosts } from "../utils/contentCollections";
const parser = new MarkdownIt();

export const GET = async () => {
  const blogs = await getSortedBlogPosts();
  const items = blogs.map((post) => ({
    title: post.data.title,
    pubDate: post.data.pubDate,
    description: post.data.description,
    link: `/blog/${post.slug}/`,
    content: sanitizeHtml(parser.render(post.body)),
    image: `/blog/${post.slug}/${post.data.image}`,
  }));
  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: import.meta.env.SITE,
    items,
  });
};
