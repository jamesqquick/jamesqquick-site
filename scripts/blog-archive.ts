import fs from "node:fs/promises";
import { createRequire } from "node:module";
import {
  dirname,
  extname,
  isAbsolute,
  join,
  relative,
  resolve,
  sep,
} from "node:path";
import matter from "gray-matter";

export interface ArchivePost {
  filePath: string;
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  tags: string[];
  youtubeVideoId?: string;
  coverPath: string;
  markdown: string;
}

type ArchiveErrorCode =
  | "archive-read"
  | "invalid-frontmatter"
  | "invalid-metadata"
  | "invalid-slug"
  | "invalid-image"
  | "missing-image"
  | "duplicate-slug";

export class BlogArchiveError extends Error {
  readonly field?: string;

  constructor(
    public readonly code: ArchiveErrorCode,
    public readonly filePath: string,
    message: string,
    options: { field?: string; cause?: unknown } = {}
  ) {
    super(`${filePath}: ${message}`, { cause: options.cause });
    this.name = "BlogArchiveError";
    this.field = options.field;
  }
}

const require = createRequire(import.meta.url);
// Use the same installed slugger as Astro without adding a migration dependency.
const { slug: githubSlug } = createRequire(
  require.resolve("astro/package.json")
)("github-slugger") as { slug: (value: string) => string };
const yaml = createRequire(require.resolve("gray-matter"))("js-yaml") as {
  JSON_SCHEMA: unknown;
  safeLoad: (source: string, options: { schema: unknown }) => unknown;
};

function isWithin(root: string, filePath: string): boolean {
  const path = relative(root, filePath);
  return path !== ".." && !path.startsWith(`..${sep}`) && !isAbsolute(path);
}

function requiredString(
  data: Record<string, unknown>,
  field: string,
  filePath: string
): string {
  const value = data[field];
  if (typeof value !== "string" || value.trim() === "") {
    throw new BlogArchiveError(
      "invalid-metadata",
      filePath,
      `${field} must be a nonempty string`,
      {
        field,
      }
    );
  }
  return value;
}

export function getArchivePostSlug(
  filePath: string,
  explicitSlug: unknown,
  projectRoot = process.cwd()
): string {
  const archiveRoot = resolve(projectRoot, "src/data/blog");
  const sourceFile = resolve(filePath);
  if (!isWithin(archiveRoot, sourceFile) || extname(sourceFile) !== ".md") {
    throw new BlogArchiveError(
      "invalid-slug",
      sourceFile,
      "source must be a Markdown file in src/data/blog"
    );
  }

  const slug =
    explicitSlug === undefined
      ? relative(archiveRoot, sourceFile)
          .slice(0, -3)
          .split(sep)
          .map((segment) => githubSlug(segment))
          .join("/")
          .replace(/\/index$/, "")
      : explicitSlug;

  if (
    typeof slug !== "string" ||
    !slug ||
    /[%\s\\?#\u0000-\u001f\u007f]/.test(slug) ||
    slug
      .split("/")
      .some((segment) => !segment || segment === "." || segment === "..")
  ) {
    throw new BlogArchiveError(
      "invalid-slug",
      sourceFile,
      "slug must be a nonempty unescaped route path",
      {
        field: "slug",
      }
    );
  }
  return slug;
}

function publishedAt(value: unknown, filePath: string): string {
  const match =
    typeof value === "string"
      ? /^(\d{4})-(\d{2})-(\d{2})(?:[Tt ](\d{2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?(?:[Zz]|([+-])(\d{2}):?(\d{2}))?)?$/.exec(
          value
        )
      : null;
  const invalid = () =>
    new BlogArchiveError(
      "invalid-metadata",
      filePath,
      "pubDate must be a valid ISO calendar date or timestamp",
      {
        field: "pubDate",
      }
    );
  if (!match) throw invalid();

  const [
    ,
    year,
    month,
    day,
    hour = "00",
    minute = "00",
    second = "00",
    fraction = "",
    sign,
    offsetHour,
    offsetMinute,
  ] = match;
  const leapYear = +year % 4 === 0 && (+year % 100 !== 0 || +year % 400 === 0);
  const days = [31, leapYear ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  if (
    +month < 1 ||
    +month > 12 ||
    +day < 1 ||
    +day > days[+month - 1] ||
    +hour > 23 ||
    +minute > 59 ||
    +second > 59 ||
    (sign && (+offsetHour > 23 || +offsetMinute > 59))
  ) {
    throw invalid();
  }

  const zone = sign ? `${sign}${offsetHour}:${offsetMinute}` : "Z";
  const date = new Date(
    `${year}-${month}-${day}T${hour}:${minute}:${second}.${fraction.padEnd(3, "0")}${zone}`
  );
  if (!Number.isFinite(date.getTime())) throw invalid();
  return date.toISOString();
}

export async function resolveLocalBlogImagePath(
  source: string,
  sourceFile: string,
  projectRoot = process.cwd()
): Promise<string | undefined> {
  const invalid = (message: string, cause?: unknown) =>
    new BlogArchiveError("invalid-image", sourceFile, `${message}: ${source}`, {
      cause,
    });
  if (typeof source !== "string" || !source.trim())
    throw invalid("image source is empty");
  if (/^(?:https?:)?\/\//i.test(source)) return undefined;
  if (/^[a-z][a-z\d+.-]*:/i.test(source))
    throw invalid("unsupported image URL scheme");

  let pathname: string;
  try {
    pathname = decodeURIComponent(source.split(/[?#]/, 1)[0]);
  } catch (cause) {
    throw invalid("invalid image URL encoding", cause);
  }
  if (!pathname || /[\\\u0000-\u001f\u007f]/.test(pathname))
    throw invalid("invalid local image path");
  if (!/\.(?:avif|bmp|gif|ico|jpe?g|png|svg|tiff?|webp)$/i.test(pathname)) {
    throw invalid("local media must have an image extension");
  }

  const root = resolve(projectRoot);
  const filePath = pathname.startsWith("/")
    ? resolve(root, "public", `.${pathname}`)
    : resolve(dirname(sourceFile), pathname);
  if (!isWithin(root, filePath))
    throw invalid("local image escapes the project root");

  try {
    const [realRoot, realFile, stat] = await Promise.all([
      fs.realpath(root),
      fs.realpath(filePath),
      fs.stat(filePath),
    ]);
    if (!isWithin(realRoot, realFile))
      throw invalid("image symlink escapes the project root");
    if (!stat.isFile() || stat.size === 0)
      throw invalid("local image must be a nonempty file");
    return filePath;
  } catch (cause) {
    if (cause instanceof BlogArchiveError) throw cause;
    throw new BlogArchiveError(
      "missing-image",
      sourceFile,
      `cannot read local image ${filePath}`,
      {
        cause,
      }
    );
  }
}

export async function parseArchivePost(
  source: string,
  filePath: string,
  projectRoot = process.cwd()
): Promise<ArchivePost> {
  filePath = resolve(filePath);
  if (
    !/^\uFEFF?---\r?\n/.test(source) ||
    !/\r?\n---(?:\r?\n|$)/.test(source.slice(3))
  ) {
    throw new BlogArchiveError(
      "invalid-frontmatter",
      filePath,
      "expected closed YAML frontmatter"
    );
  }

  let parsed: ReturnType<typeof matter>;
  try {
    // JSON_SCHEMA keeps timestamps as strings, before YAML can normalize invalid dates.
    parsed = matter(source, {
      engines: {
        yaml: (text: string) => {
          const data = yaml.safeLoad(text, { schema: yaml.JSON_SCHEMA });
          if (!data || typeof data !== "object" || Array.isArray(data)) {
            throw new BlogArchiveError(
              "invalid-frontmatter",
              filePath,
              "frontmatter must be a mapping"
            );
          }
          return data;
        },
      },
    });
  } catch (cause) {
    if (cause instanceof BlogArchiveError) throw cause;
    throw new BlogArchiveError(
      "invalid-frontmatter",
      filePath,
      "cannot parse YAML frontmatter",
      {
        cause,
      }
    );
  }
  const data: Record<string, unknown> = parsed.data;
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new BlogArchiveError(
      "invalid-frontmatter",
      filePath,
      "frontmatter must be a mapping"
    );
  }

  const title = requiredString(data, "title", filePath);
  const description = requiredString(data, "description", filePath);
  const date = publishedAt(data.pubDate, filePath);
  if (
    !Array.isArray(data.tags) ||
    data.tags.some((tag) => typeof tag !== "string" || !tag.trim())
  ) {
    throw new BlogArchiveError(
      "invalid-metadata",
      filePath,
      "tags must be an ordered array of nonempty strings",
      {
        field: "tags",
      }
    );
  }
  const youtubeVideoId =
    data.youTubeVideoId === "" ? undefined : data.youTubeVideoId;
  if (
    youtubeVideoId !== undefined &&
    (typeof youtubeVideoId !== "string" || !/^[\w-]{11}$/.test(youtubeVideoId))
  ) {
    throw new BlogArchiveError(
      "invalid-metadata",
      filePath,
      "youTubeVideoId must be an 11-character video ID",
      {
        field: "youTubeVideoId",
      }
    );
  }

  const slug = getArchivePostSlug(filePath, data.slug, projectRoot);
  const coverSource = requiredString(data, "coverImage", filePath);
  const coverPath = await resolveLocalBlogImagePath(
    coverSource,
    filePath,
    projectRoot
  );
  if (!coverPath) {
    throw new BlogArchiveError(
      "invalid-image",
      filePath,
      "coverImage must reference a local image",
      {
        field: "coverImage",
      }
    );
  }

  return {
    filePath,
    slug,
    title,
    description,
    publishedAt: date,
    tags: [...data.tags],
    ...(youtubeVideoId === undefined ? {} : { youtubeVideoId }),
    coverPath,
    markdown: parsed.content,
  };
}

export async function readBlogArchive(
  projectRoot = process.cwd()
): Promise<ArchivePost[]> {
  const root = resolve(projectRoot);
  const archiveRoot = join(root, "src/data/blog");
  const files: string[] = [];
  const visit = async (directory: string): Promise<void> => {
    try {
      for (const entry of await fs.readdir(directory, {
        withFileTypes: true,
      })) {
        const filePath = join(directory, entry.name);
        if (entry.isDirectory()) await visit(filePath);
        else if (entry.isFile() && extname(entry.name) === ".md")
          files.push(filePath);
        else if (entry.isSymbolicLink() && extname(entry.name) === ".md") {
          throw new BlogArchiveError(
            "archive-read",
            filePath,
            "archive posts must not be symlinks"
          );
        }
      }
    } catch (cause) {
      if (cause instanceof BlogArchiveError) throw cause;
      throw new BlogArchiveError(
        "archive-read",
        directory,
        "cannot enumerate blog archive",
        { cause }
      );
    }
  };
  await visit(archiveRoot);

  const posts: ArchivePost[] = [];
  const slugs = new Map<string, string>();
  for (const filePath of files.sort()) {
    let source: string;
    try {
      source = await fs.readFile(filePath, "utf8");
    } catch (cause) {
      throw new BlogArchiveError(
        "archive-read",
        filePath,
        "cannot read Markdown source",
        { cause }
      );
    }
    const post = await parseArchivePost(source, filePath, root);
    const previous = slugs.get(post.slug);
    if (previous) {
      throw new BlogArchiveError(
        "duplicate-slug",
        filePath,
        `duplicate slug ${JSON.stringify(post.slug)} also used by ${previous}`,
        {
          field: "slug",
        }
      );
    }
    slugs.set(post.slug, filePath);
    posts.push(post);
  }
  return posts;
}
