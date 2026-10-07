import { createHash, randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import { basename, dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import {
  BlogArchiveError,
  readBlogArchive,
  resolveLocalBlogImagePath,
  type ArchivePost,
} from "./blog-archive";
import {
  BlogCmsError,
  blogMediaValue,
  createBlogCms,
  normalizeBlogCmsUrl,
  resolveBlogCmsConnection,
  validateBlogCmsEntry,
  validateBlogCmsMedia,
  verifyBlogCmsMedia,
  type BlogCms,
  type BlogCmsEntry,
  type BlogCmsMedia,
} from "./blog-cms";
import {
  BlogMarkdownError,
  getMarkdownImageSources,
  markdownToBlogPortableText,
  type ResolvedBlogImage,
} from "./blog-markdown";

export class BlogImportError extends Error {
  constructor(
    public readonly code:
      | "arguments"
      | "preflight"
      | "receipt"
      | "conflict"
      | "verification"
      | "cms",
    public readonly source: string,
    message: string,
    options: { cause?: unknown } = {}
  ) {
    super(`${source}: ${message}`, options);
    this.name = "BlogImportError";
  }
}

export interface PreparedBlogMedia {
  filePath: string;
  sourcePath: string;
  hash: string;
  bytes: Uint8Array;
}

interface SourceSnapshot {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  tags: string[];
  youtubeVideoId?: string;
  markdown: string;
  coverPath: string;
  media: Record<string, string>;
}

export interface PreparedBlogPost {
  post: ArchivePost;
  sourcePath: string;
  sourceHash: string;
  source: SourceSnapshot;
  images: Map<string, string | undefined>;
}

interface MediaReceipt {
  paths: string[];
  media: BlogCmsMedia;
}

interface PostReceipt {
  id: string;
  slug: string;
  sourceHash: string;
  source: SourceSnapshot;
  target: BlogCmsEntry;
  revision: string;
  stage: "draft" | "published";
}

export interface BlogImportReceipt {
  version: 1;
  origin: string;
  media: Record<string, MediaReceipt>;
  posts: Record<string, PostReceipt>;
}

export interface BlogImportOptions {
  root?: string;
  url?: string;
  token?: string;
  slug?: string;
  dryRun?: boolean;
  cms?: BlogCms;
}

export interface BlogImportResult {
  origin: string;
  dryRun: boolean;
  receiptPath: string;
  selected: number;
  localFiles: number;
  distinctBytes: number;
  uploaded: number;
  reused: number;
  entriesBefore?: number;
  entriesAfter?: number;
  posts: Array<{
    slug: string;
    outcome: "planned" | "created" | "resumed" | "unchanged" | "protected";
    id?: string;
    reason?: string;
  }>;
}

const projectRoot = fileURLToPath(new URL("../", import.meta.url));
const hashPattern = /^[a-f0-9]{64}$/;

function hash(bytes: string | Uint8Array): string {
  return createHash("sha256").update(bytes).digest("hex");
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function canonical(value: unknown): string {
  return JSON.stringify(value, (_key, item: unknown) =>
    record(item)
      ? Object.fromEntries(
          Object.keys(item)
            .sort()
            .map((key) => [key, item[key]])
        )
      : item
  );
}

function targetSnapshot(
  entry: BlogCmsEntry,
  previous?: BlogCmsEntry
): BlogCmsEntry {
  const saved = { ...entry } as BlogCmsEntry & Record<string, unknown>;
  const prior = previous as
    (BlogCmsEntry & Record<string, unknown>) | undefined;
  // Publication omits these hydrations; retain their last verified values.
  for (const [key, fallback] of [
    ["bylines", []],
    ["byline", null],
    ["references", {}],
  ] as const) {
    if (saved[key] === undefined) saved[key] = prior?.[key] ?? fallback;
  }
  return JSON.parse(JSON.stringify(saved)) as BlogCmsEntry;
}

function validateSlug(slug: string): void {
  if (
    !slug ||
    /[%\s\\?#\u0000-\u001f\u007f]/.test(slug) ||
    slug.split("/").some((part) => !part || part === "." || part === "..")
  ) {
    throw new BlogImportError(
      "arguments",
      "--slug",
      "expected an exact, unescaped archive slug"
    );
  }
}

function remoteImage(source: string): ResolvedBlogImage {
  const url = new URL(source, "https://www.jamesqquick.com/");
  if (!/^https?:$/.test(url.protocol) || url.username || url.password) {
    throw new BlogImportError(
      "preflight",
      "body image",
      "external images must use credential-free HTTP(S) URLs"
    );
  }
  return { id: `external-${hash(source)}`, url: source, provider: "external" };
}

export async function preflightBlogImport(
  root = projectRoot,
  slug?: string
): Promise<{
  posts: PreparedBlogPost[];
  media: Map<string, PreparedBlogMedia>;
}> {
  root = resolve(root);
  if (slug !== undefined) validateSlug(slug);
  let archive: ArchivePost[];
  try {
    archive = await readBlogArchive(root);
  } catch (cause) {
    if (cause instanceof BlogArchiveError)
      throw new BlogImportError("preflight", cause.filePath, cause.message, {
        cause,
      });
    throw cause;
  }
  const selected =
    slug === undefined ? archive : archive.filter((post) => post.slug === slug);
  if (!selected.length)
    throw new BlogImportError(
      "arguments",
      "archive",
      "no posts match the requested selection"
    );
  const media = new Map<string, PreparedBlogMedia>();
  const posts: PreparedBlogPost[] = [];

  async function prepareMedia(filePath: string): Promise<PreparedBlogMedia> {
    const previous = media.get(filePath);
    if (previous) return previous;
    const bytes = await fs.readFile(filePath);
    if (!bytes.byteLength)
      throw new BlogImportError("preflight", filePath, "image is empty");
    const prepared = {
      filePath,
      sourcePath: relative(root, filePath).split(sep).join("/"),
      bytes,
      hash: hash(bytes),
    };
    media.set(filePath, prepared);
    return prepared;
  }

  for (const post of selected) {
    try {
      const images = new Map<string, string | undefined>();
      const files = new Set([post.coverPath]);
      for (const source of getMarkdownImageSources(post.markdown)) {
        const path = await resolveLocalBlogImagePath(
          source,
          post.filePath,
          root
        );
        if (path) files.add(path);
        else remoteImage(source);
        images.set(source, path);
      }
      const sourceMedia: Record<string, string> = {};
      for (const filePath of files) {
        const file = await prepareMedia(filePath);
        sourceMedia[file.sourcePath] = file.hash;
      }
      markdownToBlogPortableText(post.markdown, (source) => {
        const filePath = images.get(source);
        return filePath
          ? {
              id: `preflight-${media.get(filePath)!.hash}`,
              url: `/_emdash/api/media/file/preflight-${media.get(filePath)!.hash}.png`,
            }
          : remoteImage(source);
      });
      const source: SourceSnapshot = {
        slug: post.slug,
        title: post.title,
        description: post.description,
        publishedAt: post.publishedAt,
        tags: post.tags,
        ...(post.youtubeVideoId === undefined
          ? {}
          : { youtubeVideoId: post.youtubeVideoId }),
        markdown: post.markdown,
        coverPath: media.get(post.coverPath)!.sourcePath,
        media: sourceMedia,
      };
      posts.push({
        post,
        sourcePath: relative(root, post.filePath).split(sep).join("/"),
        sourceHash: hash(canonical(source)),
        source,
        images,
      });
    } catch (cause) {
      const message =
        cause instanceof BlogArchiveError ||
        cause instanceof BlogMarkdownError ||
        cause instanceof BlogImportError
          ? cause.message
          : "cannot read or convert source media";
      throw new BlogImportError("preflight", post.filePath, message, { cause });
    }
  }
  return { posts, media };
}

export function blogImportReceiptPath(root: string, origin: string): string {
  return join(
    resolve(root),
    "tmp/blog-import",
    `${hash(normalizeBlogCmsUrl(origin).origin)}.json`
  );
}

export async function readBlogImportReceipt(
  root: string,
  origin: string
): Promise<BlogImportReceipt> {
  const path = blogImportReceiptPath(root, origin);
  let text: string;
  try {
    text = await fs.readFile(path, "utf8");
  } catch (cause) {
    if (record(cause) && cause.code === "ENOENT")
      return { version: 1, origin, media: {}, posts: {} };
    throw new BlogImportError("receipt", path, "cannot read receipt", {
      cause,
    });
  }
  try {
    const parsed: unknown = JSON.parse(text);
    if (!record(parsed))
      throw new BlogImportError("receipt", path, "receipt must be an object");
    const { checksum, ...receipt } = parsed;
    if (
      receipt.version !== 1 ||
      receipt.origin !== origin ||
      !record(receipt.media) ||
      !record(receipt.posts) ||
      checksum !== hash(canonical(receipt))
    ) {
      throw new BlogImportError(
        "receipt",
        path,
        "corrupt receipt or wrong target origin"
      );
    }
    for (const [digest, item] of Object.entries(receipt.media)) {
      if (
        !hashPattern.test(digest) ||
        !record(item) ||
        !Array.isArray(item.paths) ||
        !item.paths.length ||
        item.paths.some((path) => typeof path !== "string" || !path)
      ) {
        throw new BlogImportError("receipt", path, "invalid media checkpoint");
      }
      validateBlogCmsMedia(item.media, origin, true);
    }
    const ids = new Set<string>();
    for (const [sourcePath, item] of Object.entries(receipt.posts)) {
      if (
        !sourcePath ||
        !record(item) ||
        typeof item.id !== "string" ||
        !item.id ||
        typeof item.slug !== "string" ||
        typeof item.sourceHash !== "string" ||
        !hashPattern.test(item.sourceHash) ||
        !record(item.source) ||
        item.sourceHash !== hash(canonical(item.source)) ||
        !["draft", "published"].includes(String(item.stage)) ||
        typeof item.revision !== "string" ||
        !item.revision
      ) {
        throw new BlogImportError(
          "receipt",
          path,
          "invalid content checkpoint"
        );
      }
      const entry = validateBlogCmsEntry(item.target);
      if (
        entry.id !== item.id ||
        entry._rev !== item.revision ||
        item.source.slug !== item.slug ||
        ids.has(item.id)
      )
        throw new BlogImportError(
          "receipt",
          path,
          "inconsistent content identity or revision"
        );
      ids.add(item.id);
    }
    return receipt as unknown as BlogImportReceipt;
  } catch (cause) {
    if (cause instanceof BlogImportError) throw cause;
    throw new BlogImportError(
      "receipt",
      path,
      "invalid receipt JSON or checkpoint",
      { cause }
    );
  }
}

async function checkpoint(
  root: string,
  receipt: BlogImportReceipt
): Promise<void> {
  const path = blogImportReceiptPath(root, receipt.origin);
  const temporary = `${path}.${randomUUID()}.part`;
  try {
    await fs.mkdir(dirname(path), { recursive: true });
    const file = await fs.open(temporary, "wx", 0o600);
    try {
      await file.writeFile(
        `${JSON.stringify({ ...receipt, checksum: hash(canonical(receipt)) }, null, 2)}\n`
      );
      await file.sync();
    } finally {
      await file.close();
    }
    await fs.rename(temporary, path);
  } catch (cause) {
    throw new BlogImportError(
      "receipt",
      path,
      "atomic checkpoint failed; stop before another CMS write",
      { cause }
    );
  }
}

function matchesTarget(owned: PostReceipt, current: BlogCmsEntry): boolean {
  return (
    current._rev === owned.revision &&
    canonical(targetSnapshot(current)) === canonical(owned.target)
  );
}

export function blogPostData(
  prepared: PreparedBlogPost,
  media: Map<string, BlogCmsMedia>
): Record<string, unknown> {
  const { post, images } = prepared;
  const cover = media.get(post.coverPath);
  if (!cover)
    throw new BlogImportError(
      "verification",
      post.filePath,
      "cover has no uploaded media"
    );
  return {
    title: post.title,
    excerpt: post.description,
    tags: post.tags,
    content: markdownToBlogPortableText(post.markdown, (source) => {
      const path = images.get(source);
      if (!path) return remoteImage(source);
      const image = media.get(path);
      if (!image)
        throw new BlogImportError(
          "verification",
          post.filePath,
          "body image has no uploaded media"
        );
      return {
        id: image.id,
        url: image.url,
        provider: "local",
        ...(image.width === undefined ? {} : { width: image.width }),
        ...(image.height === undefined ? {} : { height: image.height }),
      };
    }),
    featured_image: blogMediaValue(cover),
    youtube_video_id: post.youtubeVideoId ?? "",
  };
}

export function verifyBlogEntry(
  entry: BlogCmsEntry,
  prepared: PreparedBlogPost,
  expected: Record<string, unknown>,
  published: boolean
): void {
  const fail = (field: string) =>
    new BlogImportError(
      "verification",
      prepared.post.filePath,
      `saved ${field} differs for ${prepared.post.slug}`
    );
  if (published && entry.slug !== prepared.post.slug) throw fail("slug");
  for (const field of [
    "title",
    "excerpt",
    "tags",
    "content",
    "youtube_video_id",
  ]) {
    if (canonical(entry.data[field]) !== canonical(expected[field]))
      throw fail(field);
  }
  const cover = entry.data.featured_image;
  const desired = expected.featured_image;
  if (!record(cover) || !record(desired)) throw fail("featured_image");
  for (const [key, value] of Object.entries(desired)) {
    if (key === "meta") {
      if (
        !record(cover.meta) ||
        !record(value) ||
        cover.meta.storageKey !== value.storageKey
      )
        throw fail("cover storage key");
    } else if (canonical(cover[key]) !== canonical(value))
      throw fail(`cover ${key}`);
  }
  if (
    published &&
    (entry.status !== "published" ||
      entry.publishedAt !== prepared.post.publishedAt ||
      entry.draftRevisionId !== null ||
      entry.scheduledAt !== null)
  )
    throw fail("publication status/date");
}

export async function importBlogArchive(
  options: BlogImportOptions = {}
): Promise<BlogImportResult> {
  const root = resolve(options.root ?? projectRoot);
  const connection = options.cms
    ? normalizeBlogCmsUrl(options.cms.origin)
    : resolveBlogCmsConnection(options);
  if (
    options.cms &&
    options.url &&
    normalizeBlogCmsUrl(options.url).origin !== connection.origin
  )
    throw new BlogImportError(
      "arguments",
      "connection",
      "client and requested origins differ"
    );
  const prepared = await preflightBlogImport(root, options.slug);
  const receipt = await readBlogImportReceipt(root, connection.origin);
  const result: BlogImportResult = {
    origin: connection.origin,
    dryRun: options.dryRun ?? false,
    receiptPath: blogImportReceiptPath(root, connection.origin),
    selected: prepared.posts.length,
    localFiles: prepared.media.size,
    distinctBytes: new Set(
      [...prepared.media.values()].map((file) => file.hash)
    ).size,
    uploaded: 0,
    reused: 0,
    posts: [],
  };
  if (result.dryRun) {
    result.posts = prepared.posts.map(({ post }) => ({
      slug: post.slug,
      outcome: "planned",
    }));
    return result;
  }
  const cms =
    options.cms ??
    createBlogCms({ url: connection.origin, token: options.token });
  const entries = await cms.listEntries();
  result.entriesBefore = entries.length;
  const verified = new Set<string>();
  const uploaded = new Set<string>();
  let ready = false;

  async function beforeWrite(): Promise<void> {
    if (!ready) {
      await checkpoint(root, receipt);
      ready = true;
    }
  }

  async function postMedia(
    post: PreparedBlogPost,
    reuseOnly = false
  ): Promise<Map<string, BlogCmsMedia>> {
    const media = new Map<string, BlogCmsMedia>();
    const paths = new Set([
      post.post.coverPath,
      ...[...post.images.values()].filter(
        (path): path is string => path !== undefined
      ),
    ]);
    for (const path of paths) {
      const file = prepared.media.get(path)!;
      let saved = receipt.media[file.hash];
      if (!saved) {
        if (reuseOnly)
          throw new BlogImportError(
            "receipt",
            post.post.filePath,
            "owned entry is missing its media checkpoint"
          );
        await beforeWrite();
        saved = {
          paths: [file.sourcePath],
          media: await cms.uploadMedia(file.bytes, basename(file.filePath)),
        };
        receipt.media[file.hash] = saved;
        uploaded.add(file.hash);
        result.uploaded++;
        await checkpoint(root, receipt);
      } else if (!saved.paths.includes(file.sourcePath)) {
        saved.paths.push(file.sourcePath);
        await checkpoint(root, receipt);
      }
      if (!verified.has(file.hash)) {
        await verifyBlogCmsMedia(cms, saved.media, file.bytes);
        verified.add(file.hash);
        if (!uploaded.has(file.hash)) result.reused++;
      }
      media.set(path, saved.media);
    }
    return media;
  }

  async function savePost(
    post: PreparedBlogPost,
    entry: BlogCmsEntry,
    stage: PostReceipt["stage"]
  ): Promise<PostReceipt> {
    const saved: PostReceipt = {
      id: entry.id,
      slug: post.post.slug,
      sourceHash: post.sourceHash,
      source: post.source,
      target: targetSnapshot(entry, receipt.posts[post.sourcePath]?.target),
      revision: entry._rev,
      stage,
    };
    receipt.posts[post.sourcePath] = saved;
    await checkpoint(root, receipt);
    return saved;
  }

  for (const post of prepared.posts) {
    try {
      let owned = receipt.posts[post.sourcePath];
      let current: BlogCmsEntry | undefined;
      const collision = entries.find(
        (entry) => entry.slug === post.post.slug && entry.id !== owned?.id
      );
      const protect = (reason: string, id?: string) =>
        result.posts.push({
          slug: post.post.slug,
          outcome: "protected",
          ...(id ? { id } : {}),
          reason,
        });
      if (collision) {
        protect("unowned slug collision", collision.id);
        continue;
      }
      if (owned) {
        try {
          current = await cms.getEntry(owned.id);
        } catch (cause) {
          if (cause instanceof BlogCmsError && cause.status === 404) {
            protect("owned entry is missing; refusing replacement", owned.id);
            continue;
          }
          throw cause;
        }
        if (!matchesTarget(owned, current)) {
          protect(
            "CMS revision or editorial snapshot changed since last checkpoint",
            owned.id
          );
          continue;
        }
        if (owned.sourceHash !== post.sourceHash) {
          protect(
            "archive source changed; refusing to overwrite the CMS entry",
            owned.id
          );
          continue;
        }
        if (
          owned.stage === "published" &&
          owned.sourceHash === post.sourceHash
        ) {
          verifyBlogEntry(
            current,
            post,
            blogPostData(post, await postMedia(post, true)),
            true
          );
          result.posts.push({
            slug: post.post.slug,
            outcome: "unchanged",
            id: owned.id,
          });
          continue;
        }
      }
      const outcome = !owned ? "created" : "resumed";
      const data = blogPostData(post, await postMedia(post));
      if (!owned) {
        await beforeWrite();
        current = await cms.createDraft(post.post.slug, data);
        owned = await savePost(post, current, "draft");
        if (current.status !== "draft" || current.slug !== post.post.slug)
          throw new BlogImportError(
            "verification",
            post.post.filePath,
            "new entry was not saved as a draft with its exact slug"
          );
        entries.push(current);
      }
      current = await cms.getEntry(owned.id);
      if (!matchesTarget(owned, current))
        throw new BlogImportError(
          "conflict",
          post.post.filePath,
          "CMS changed before publication; write refused"
        );
      verifyBlogEntry(current, post, data, false);
      await beforeWrite();
      const published = await cms.publishEntry(
        current.id,
        post.post.publishedAt,
        current._rev
      );
      owned = await savePost(post, published, "published");
      const saved = await cms.getEntry(published.id);
      if (!matchesTarget(owned, saved))
        throw new BlogImportError(
          "conflict",
          post.post.filePath,
          "CMS changed after publication"
        );
      verifyBlogEntry(saved, post, data, true);
      result.posts.push({ slug: post.post.slug, outcome, id: saved.id });
    } catch (cause) {
      if (cause instanceof BlogImportError) throw cause;
      const conflict =
        cause instanceof BlogCmsError && cause.code === "conflict";
      throw new BlogImportError(
        conflict ? "conflict" : "cms",
        post.post.filePath,
        cause instanceof BlogCmsError ? cause.message : "CMS operation failed",
        { cause }
      );
    }
  }
  result.entriesAfter = (await cms.listEntries()).length;
  if (
    result.entriesAfter !==
    result.entriesBefore +
      result.posts.filter((post) => post.outcome === "created").length
  )
    throw new BlogImportError(
      "verification",
      "blog",
      "entry count changed unexpectedly during import"
    );
  return result;
}

export function parseBlogImportArgs(args: string[]): {
  url?: string;
  slug?: string;
  dryRun: boolean;
} {
  try {
    const { values } = parseArgs({
      args,
      options: {
        url: { type: "string" },
        slug: { type: "string" },
        "dry-run": { type: "boolean" },
      },
      strict: true,
      allowPositionals: false,
    });
    if (values.slug !== undefined) validateSlug(values.slug);
    if (values.url !== undefined) normalizeBlogCmsUrl(values.url);
    return {
      ...(values.url === undefined ? {} : { url: values.url }),
      ...(values.slug === undefined ? {} : { slug: values.slug }),
      dryRun: values["dry-run"] ?? false,
    };
  } catch (cause) {
    if (cause instanceof BlogImportError || cause instanceof BlogCmsError)
      throw cause;
    throw new BlogImportError(
      "arguments",
      "CLI",
      "use --url <origin>, --slug <exact-slug>, and/or --dry-run",
      { cause }
    );
  }
}

export async function main(args = process.argv.slice(2)): Promise<void> {
  console.log(
    JSON.stringify(await importBlogArchive(parseBlogImportArgs(args)), null, 2)
  );
}

if (
  process.argv[1] &&
  resolve(process.argv[1]) === fileURLToPath(import.meta.url)
) {
  main().catch((error: unknown) => {
    console.error(
      error instanceof BlogImportError || error instanceof BlogCmsError
        ? `${error.name} [${error.code}] ${error.message}`
        : "Blog import failed"
    );
    process.exitCode = 1;
  });
}
