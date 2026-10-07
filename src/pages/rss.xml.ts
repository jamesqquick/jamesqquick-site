import rss from "@astrojs/rss";
import type { APIRoute } from "astro";
import { SITE_DESCRIPTION, SITE_TITLE } from "../config";
import {
  getAllPublishedBlogPosts,
  getBlogPostDate,
  getBlogPostPath,
  getBlogSlug,
  resolveBlogImageUrl,
} from "../utils/emdash-blog";
import { portableTextToFeedHtml } from "../utils/blog-feed";

export const prerender = false;

function enclosureMime(mimeType: string | undefined): string {
  const normalized = mimeType?.toLowerCase().split(";", 1)[0];
  return normalized && /^image\/[a-z0-9.+-]+$/.test(normalized)
    ? normalized
    : "image/jpeg";
}

export const GET: APIRoute = async ({ locals, url }) => {
  const site = import.meta.env.SITE ?? url.origin;
  const blogs = await getAllPublishedBlogPosts();
  const items = blogs.map((post) => {
    const slug = getBlogSlug(post);
    const link = getBlogPostPath(slug);
    const postUrl = new URL(link, site);
    const imageUrl = resolveBlogImageUrl(
      post.data.featured_image,
      locals.emdash?.getPublicMediaUrl
    );

    return {
      title: post.data.title,
      pubDate: getBlogPostDate(post),
      description: post.data.excerpt,
      link,
      content: portableTextToFeedHtml(post.data.content ?? [], postUrl),
      ...(imageUrl
        ? {
            enclosure: {
              url: new URL(imageUrl, site).href,
              length: 0,
              type: enclosureMime(post.data.featured_image?.mimeType),
            },
          }
        : {}),
    };
  });

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site,
    items,
  });
};
