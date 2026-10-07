import {
  getEmDashCollection,
  getEmDashEntry,
  type ContentEntry,
  type InferCollectionData,
} from "emdash";

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

export async function getPublishedBlogPosts(limit = 50): Promise<BlogEntry[]> {
  const result = await getEmDashCollection("blog", {
    status: "published",
    limit,
    orderBy: { published_at: "desc" },
  });

  if (result.error) {
    throw new BlogQueryError("list published entries", result.error);
  }

  return result.entries;
}

export async function getAllPublishedBlogPosts(): Promise<BlogEntry[]> {
  const entries: BlogEntry[] = [];
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
    cursor = result.nextCursor;
  } while (cursor);

  return entries;
}

export async function getBlogPostBySlug(
  slug: string
): Promise<{ entry: BlogEntry | null; isPreview: boolean }> {
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
      return { entry: result.entry, isPreview: result.isPreview };
    }
  }

  return { entry: null, isPreview: false };
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
