import {
  getEmDashCollection,
  getEmDashEntry,
  type CacheHint,
  type ContentEntry,
  type InferCollectionData,
} from "emdash";
import { BLOG_PAGE_SIZE } from "./blog-pagination";

type BlogData = InferCollectionData<"blog">;

export type BlogEntry = ContentEntry<BlogData>;

export class BlogQueryError extends Error {
  constructor(
    public readonly operation: string,
    cause: Error
  ) {
    super(`Failed to ${operation} EmDash blog content`, { cause });
    this.name = "BlogQueryError";
  }
}

export class BlogEntryDataError extends Error {
  constructor(
    public readonly field: string,
    public readonly entryId: string
  ) {
    super(`Published blog entry ${entryId} is missing ${field}`);
    this.name = "BlogEntryDataError";
  }
}

export interface PublishedBlogPage {
  entries: BlogEntry[];
  hasMore: boolean;
  cacheHint: CacheHint;
}

export interface PublishedBlogPosts {
  entries: BlogEntry[];
  cacheHint: CacheHint;
}

export interface BlogPostResult {
  entry: BlogEntry | null;
  isPreview: boolean;
  cacheHint: CacheHint;
}

export function mergeCacheHints(hints: CacheHint[]): CacheHint {
  const tags = new Set<string>();
  let lastModified: Date | undefined;

  for (const hint of hints) {
    for (const tag of hint.tags ?? []) tags.add(tag);
    if (
      hint.lastModified &&
      (!lastModified || hint.lastModified > lastModified)
    ) {
      lastModified = hint.lastModified;
    }
  }

  return {
    ...(tags.size > 0 ? { tags: [...tags] } : {}),
    ...(lastModified ? { lastModified } : {}),
  };
}

export async function getPublishedBlogPage(
  page: number
): Promise<PublishedBlogPage> {
  const result = await getEmDashCollection("blog", {
    status: "published",
    limit: BLOG_PAGE_SIZE,
    offset: (page - 1) * BLOG_PAGE_SIZE,
    orderBy: { published_at: "desc" },
  });

  if (result.error) {
    throw new BlogQueryError(
      `list published entries for page ${page}`,
      result.error
    );
  }

  return {
    entries: result.entries,
    hasMore: result.hasMore === true,
    cacheHint: result.cacheHint,
  };
}

export async function getAllPublishedBlogPosts(): Promise<PublishedBlogPosts> {
  const entries: BlogEntry[] = [];
  const cacheHints: CacheHint[] = [];
  let cursor: string | undefined;

  do {
    const result = await getEmDashCollection("blog", {
      status: "published",
      limit: 100,
      orderBy: { published_at: "desc" },
      ...(cursor ? { cursor } : {}),
    });

    if (result.error) {
      throw new BlogQueryError("list published entries", result.error);
    }

    entries.push(...result.entries);
    cacheHints.push(result.cacheHint);
    cursor = result.nextCursor;
  } while (cursor);

  return { entries, cacheHint: mergeCacheHints(cacheHints) };
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPostResult> {
  const candidates = [slug];
  try {
    const decodedSlug = decodeURIComponent(slug);
    if (decodedSlug !== slug) candidates.push(decodedSlug);
  } catch {
    // Keep the original route slug when the URL encoding is malformed.
  }

  for (const candidate of candidates) {
    const result = await getEmDashEntry("blog", candidate);

    if (result.error) {
      throw new BlogQueryError(`read entry "${slug}"`, result.error);
    }

    if (result.entry) {
      return {
        entry: result.entry,
        isPreview: result.isPreview,
        cacheHint: result.cacheHint,
      };
    }
  }

  return { entry: null, isPreview: false, cacheHint: {} };
}

export function getBlogSlug(entry: BlogEntry): string {
  const slug = entry.data.slug;
  if (typeof slug !== "string" || !slug) {
    throw new BlogEntryDataError("a slug", entry.id);
  }
  return slug;
}

export function getBlogPostPath(slug: string): string {
  return `/blog/${slug}`;
}

export function getBlogPostDate(entry: BlogEntry): Date {
  return entry.data.publishedAt ?? entry.data.createdAt;
}

export function resolveBlogImageUrl(
  image: BlogData["featured_image"],
  getPublicMediaUrl?: (storageKey: string) => string
): string | undefined {
  if (!image) return undefined;
  if (typeof image.src === "string" && image.src) return image.src;

  const storageKey = image.meta?.storageKey;
  return typeof storageKey === "string"
    ? getPublicMediaUrl?.(storageKey)
    : undefined;
}
