import { createHash } from "node:crypto";
import type { MediaValue } from "emdash";
import {
  EmDashApiError,
  EmDashClient,
  createTransport,
  csrfInterceptor,
  devBypassInterceptor,
  tokenInterceptor,
  type ContentItem,
  type Interceptor,
} from "emdash/client";

export class BlogCmsError extends Error {
  constructor(
    public readonly code:
      | "invalid-url"
      | "auth-required"
      | "api"
      | "conflict"
      | "invalid-response"
      | "media-verification",
    public readonly operation: string,
    message: string,
    public readonly status?: number,
    options: { cause?: unknown } = {}
  ) {
    super(`${operation}: ${message}`, options);
    this.name = "BlogCmsError";
  }
}

export type BlogCmsEntry = ContentItem & { _rev: string };

export interface BlogCmsMedia {
  id: string;
  filename: string;
  storageKey: string;
  url: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
}

export interface BlogCms {
  origin: string;
  listEntries(): Promise<ContentItem[]>;
  getEntry(id: string): Promise<BlogCmsEntry>;
  createDraft(
    slug: string,
    data: Record<string, unknown>
  ): Promise<BlogCmsEntry>;
  updateEntry(
    id: string,
    data: Record<string, unknown>,
    revision: string,
    slug?: string
  ): Promise<BlogCmsEntry>;
  publishEntry(
    id: string,
    publishedAt: string,
    revision: string
  ): Promise<BlogCmsEntry>;
  uploadMedia(bytes: Uint8Array, filename: string): Promise<BlogCmsMedia>;
  getMedia(id: string): Promise<BlogCmsMedia>;
  readMedia(media: BlogCmsMedia): Promise<Uint8Array>;
}

export function normalizeBlogCmsUrl(value: string): {
  origin: string;
  loopback: boolean;
} {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new BlogCmsError(
      "invalid-url",
      "connection",
      "expected an HTTP(S) origin"
    );
  }
  if (
    value !== value.trim() ||
    /[\s\\]/.test(value) ||
    !/^https?:\/\//i.test(value) ||
    !["http:", "https:"].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.pathname !== "/" ||
    url.search ||
    url.hash
  ) {
    throw new BlogCmsError(
      "invalid-url",
      "connection",
      "URL must be an HTTP(S) origin without credentials, path, query, or fragment"
    );
  }
  const hostname = value
    .split("//", 2)[1]
    .split("/", 1)[0]
    .replace(/:\d+$/, "")
    .toLowerCase();
  const loopbacks = new Set(["localhost", "127.0.0.1", "[::1]"]);
  return {
    origin: url.origin,
    loopback: loopbacks.has(hostname) && loopbacks.has(url.hostname),
  };
}

export function resolveBlogCmsConnection(
  options: { url?: string; token?: string } = {},
  environment: Partial<NodeJS.ProcessEnv> = process.env
): { origin: string; token?: string; loopback: boolean } {
  const connection = normalizeBlogCmsUrl(
    options.url ?? environment.EMDASH_URL ?? "http://localhost:4355"
  );
  const token = options.token ?? environment.EMDASH_TOKEN;
  if (token !== undefined && (!token.trim() || /[\r\n]/.test(token))) {
    throw new BlogCmsError(
      "auth-required",
      "connection",
      "EMDASH_TOKEN is invalid"
    );
  }
  if (!token && !connection.loopback) {
    throw new BlogCmsError(
      "auth-required",
      "connection",
      "non-loopback origins require EMDASH_TOKEN"
    );
  }
  return { ...connection, ...(token ? { token } : {}) };
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateBlogCmsEntry(
  value: unknown,
  revision?: unknown
): BlogCmsEntry {
  const rev = revision ?? (record(value) ? value._rev : undefined);
  if (
    !record(value) ||
    typeof value.id !== "string" ||
    !value.id ||
    value.type !== "blog" ||
    typeof value.slug !== "string" ||
    !value.slug ||
    typeof value.status !== "string" ||
    !record(value.data) ||
    typeof value.updatedAt !== "string" ||
    typeof value.createdAt !== "string" ||
    !(value.publishedAt === null || typeof value.publishedAt === "string") ||
    !(value.scheduledAt === null || typeof value.scheduledAt === "string") ||
    !(
      value.draftRevisionId === null ||
      typeof value.draftRevisionId === "string"
    ) ||
    !(
      value.liveRevisionId === null || typeof value.liveRevisionId === "string"
    ) ||
    typeof rev !== "string" ||
    !rev
  ) {
    throw new BlogCmsError(
      "invalid-response",
      "content",
      "missing content identity, data, or revision"
    );
  }
  return { ...value, _rev: rev } as BlogCmsEntry;
}

export function validateBlogCmsMedia(
  value: unknown,
  origin: string,
  requireUrl = false
): BlogCmsMedia {
  const invalid = () =>
    new BlogCmsError(
      "invalid-response",
      "media",
      "invalid uploaded media metadata or public storage-key URL"
    );
  if (
    !record(value) ||
    typeof value.id !== "string" ||
    !value.id ||
    typeof value.filename !== "string" ||
    !value.filename ||
    typeof value.storageKey !== "string" ||
    !/^[\w.-]+\.[\w]+$/.test(value.storageKey) ||
    typeof value.mimeType !== "string" ||
    !/^image\/[\w.+-]+$/.test(value.mimeType) ||
    typeof value.size !== "number" ||
    !Number.isSafeInteger(value.size) ||
    value.size <= 0 ||
    [value.width, value.height].some(
      (dimension) =>
        dimension != null &&
        (typeof dimension !== "number" ||
          !Number.isSafeInteger(dimension) ||
          dimension <= 0)
    ) ||
    (requireUrl && (typeof value.url !== "string" || !value.url)) ||
    (value.url !== undefined && (typeof value.url !== "string" || !value.url))
  ) {
    throw invalid();
  }
  const path = `/_emdash/api/media/file/${value.storageKey}`;
  let url: URL;
  try {
    url = new URL(typeof value.url === "string" ? value.url : path, origin);
  } catch {
    throw invalid();
  }
  if (
    url.origin !== origin ||
    url.username ||
    url.password ||
    url.pathname !== path ||
    url.search ||
    url.hash
  ) {
    throw invalid();
  }
  return {
    id: value.id,
    filename: value.filename,
    storageKey: value.storageKey,
    url: path,
    mimeType: value.mimeType,
    size: value.size,
    ...(typeof value.width === "number" ? { width: value.width } : {}),
    ...(typeof value.height === "number" ? { height: value.height } : {}),
  };
}

export function blogMediaValue(media: BlogCmsMedia): MediaValue {
  return {
    id: media.id,
    provider: "local",
    filename: media.filename,
    mimeType: media.mimeType,
    ...(media.width === undefined ? {} : { width: media.width }),
    ...(media.height === undefined ? {} : { height: media.height }),
    meta: { storageKey: media.storageKey },
  };
}

export async function verifyBlogCmsMedia(
  cms: BlogCms,
  media: BlogCmsMedia,
  bytes: Uint8Array
): Promise<void> {
  const saved = await cms.getMedia(media.id);
  const expected = createHash("sha256").update(bytes).digest("hex");
  if (
    JSON.stringify(saved) !== JSON.stringify(media) ||
    saved.size !== bytes.byteLength ||
    createHash("sha256")
      .update(await cms.readMedia(saved))
      .digest("hex") !== expected
  ) {
    throw new BlogCmsError(
      "media-verification",
      `media ${media.id}`,
      "saved metadata or public bytes differ from source"
    );
  }
}

export function createBlogCms(
  options: { url?: string; token?: string } = {}
): BlogCms {
  const { origin, token } = resolveBlogCmsConnection(options);
  const authenticate = token
    ? tokenInterceptor(token)
    : devBypassInterceptor(origin);
  const auth: Interceptor = (request, next) =>
    authenticate(new Request(request, { redirect: "error" }), next);
  const client = new EmDashClient({ baseUrl: origin, interceptors: [auth] });
  const transport = createTransport({
    interceptors: [csrfInterceptor(), auth],
  });

  async function request<T>(
    operation: string,
    action: () => Promise<T>
  ): Promise<T> {
    try {
      return await action();
    } catch (cause) {
      if (cause instanceof BlogCmsError) throw cause;
      const status = cause instanceof EmDashApiError ? cause.status : undefined;
      throw new BlogCmsError(
        status === 409 ? "conflict" : "api",
        operation,
        status === 409
          ? "revision conflict or edit lock; write refused"
          : `CMS request failed${status ? ` (HTTP ${status})` : ""}`,
        status,
        { cause }
      );
    }
  }

  async function postEntry(
    path: string,
    body: Record<string, unknown>
  ): Promise<BlogCmsEntry> {
    const response = await transport.fetch(
      new Request(`${origin}/_emdash/api${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        redirect: "error",
      })
    );
    if (!response.ok) {
      throw new BlogCmsError(
        response.status === 409 ? "conflict" : "api",
        path,
        `CMS write refused (HTTP ${response.status})`,
        response.status
      );
    }
    const json: unknown = await response.json();
    if (!record(json) || json.success !== true || !record(json.data)) {
      throw new BlogCmsError(
        "invalid-response",
        path,
        "missing content response"
      );
    }
    return validateBlogCmsEntry(json.data.item, json.data._rev);
  }

  return {
    origin,
    listEntries: () =>
      request("list blog", async () => {
        const entries: ContentItem[] = [];
        for await (const entry of client.listAll("blog", { limit: 100 }))
          entries.push(entry);
        return entries;
      }),
    getEntry: (id) =>
      request(`read blog ${id}`, async () =>
        validateBlogCmsEntry(await client.get("blog", id, { raw: true }))
      ),
    // Client.create drops the response's _rev; checkpoint the server revision directly.
    createDraft: (slug, data) =>
      request("create blog draft", () =>
        postEntry("/content/blog", { slug, status: "draft", data })
      ),
    updateEntry: (id, data, revision, slug) =>
      request(`update blog ${id}`, async () => {
        if (!revision)
          throw new BlogCmsError(
            "conflict",
            "update blog",
            "revision is required"
          );
        return validateBlogCmsEntry(
          await client.update("blog", id, {
            data,
            _rev: revision,
            ...(slug === undefined ? {} : { slug }),
          })
        );
      }),
    publishEntry: (id, publishedAt, revision) =>
      request(`publish blog ${id}`, () => {
        if (!revision)
          throw new BlogCmsError(
            "conflict",
            "publish blog",
            "revision is required"
          );
        return postEntry(`/content/blog/${encodeURIComponent(id)}/publish`, {
          publishedAt,
          _rev: revision,
        });
      }),
    uploadMedia: (bytes, filename) =>
      request(`upload ${filename}`, async () =>
        validateBlogCmsMedia(
          await client.mediaUpload(bytes, filename),
          origin,
          true
        )
      ),
    getMedia: (id) =>
      request(`read media ${id}`, async () =>
        validateBlogCmsMedia(await client.mediaGet(id), origin)
      ),
    readMedia: (media) =>
      request(`read public media ${media.id}`, async () => {
        const valid = validateBlogCmsMedia(media, origin, true);
        const response = await fetch(new URL(valid.url, origin), {
          redirect: "error",
        });
        if (
          !response.ok ||
          response.headers.get("content-type")?.split(";", 1)[0] !==
            media.mimeType
        ) {
          throw new BlogCmsError(
            "media-verification",
            `media ${media.id}`,
            "public URL failed or returned a different MIME type",
            response.status
          );
        }
        const bytes = new Uint8Array(await response.arrayBuffer());
        if (bytes.byteLength !== media.size)
          throw new BlogCmsError(
            "media-verification",
            `media ${media.id}`,
            "public file size differs from metadata"
          );
        return bytes;
      }),
  };
}
