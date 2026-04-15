import { CollectionEntry, getCollection } from "astro:content";

export type CourseSection = {
  courseSlug: string;
  slug: string;
  title: string;
  order: number;
  published: boolean;
};

const getCourseSlugFromEntryId = (id: string): string => id.split("/")[0];

/**
 * Course root entries: either legacy path ids (`course-slug/index.mdx`) or — with the
 * glob loader — `data.slug` becomes the entry id (e.g. `modern-websites-with-astro`).
 * Lessons also use slug-as-id but include `moduleSlug` / `lessonOrder`.
 */
const isCourseMetaEntry = (entry: CollectionEntry<"courses">): boolean => {
  const id = entry.id;
  const data = entry.data;
  if (/^([^/]+)\/index(\.mdx?|)$/.test(id)) return true;
  if (!id.includes("/")) {
    const isLesson =
      data.moduleSlug != null || data.lessonOrder != null;
    if (isLesson) return false;
    return (
      data.description != null ||
      data.externalUrl != null ||
      data.pubDate != null
    );
  }
  return false;
};

const isSectionEntry = (id: string): boolean =>
  /^([^/]+)\/sections\/([^/]+)\/index(\.mdx?|)$/.test(id);

const isLessonEntry = (entry: CollectionEntry<"courses">): boolean =>
  !isCourseMetaEntry(entry) && !isSectionEntry(entry.id);

export const getCourseSlug = (id: string): string => id.split("/")[0];

export const getSectionSlug = (lessonId: string): string => {
  const parts = lessonId.split("/");
  const sectionsIndex = parts.indexOf("sections");
  if (sectionsIndex >= 0 && parts[sectionsIndex + 1]) {
    return parts[sectionsIndex + 1];
  }
  return parts[1] ?? "";
};

/** Last path segment of a course entry id (filename without extension). */
export const getLessonSlug = (lessonId: string): string =>
  (lessonId.split("/").pop() ?? lessonId).replace(/\.mdx?$/i, "");

/**
 * URL segment for a lesson: optional `slug` from frontmatter, else filename stem from id.
 * Entry ids are path-based (see courses glob `generateId`).
 */
export const getLessonUrlSegment = (
  entry: CollectionEntry<"courses">
): string => {
  if (isLessonEntry(entry) && entry.data.slug) {
    return entry.data.slug;
  }
  return getLessonSlug(entry.id);
};

export const getNormalizedLessonId = (
  entry: CollectionEntry<"courses">
): string => {
  if (!isLessonEntry(entry)) return entry.id;
  const courseSlug = getCourseSlug(entry.id);
  const sectionSlug = getSectionSlug(entry.id);
  const segment = getLessonUrlSegment(entry);
  return `${courseSlug}/sections/${sectionSlug}/${segment}`;
};

export const lessonUrl = (entry: CollectionEntry<"courses">): string => {
  if (!isLessonEntry(entry)) {
    return `/course/${getCourseSlug(entry.id)}`;
  }
  const courseSlug = getCourseSlug(entry.id);
  const sectionSlug = getSectionSlug(entry.id);
  const lessonSlug = getLessonUrlSegment(entry);
  return `/course/${courseSlug}/${sectionSlug}/${lessonSlug}`;
};

export const getSortedBlogPosts = async (): Promise<
  CollectionEntry<"blog">[]
> => {
  return (await getCollection("blog")).sort(
    (a, b) =>
      new Date(b.data.pubDate).valueOf() - new Date(a.data.pubDate).valueOf()
  );
};

export const getSortedCourses = async (): Promise<
  CollectionEntry<"courses">[]
> => {
  return (await getCollection("courses"))
    .filter((entry) => isCourseMetaEntry(entry))
    .sort(
    (a, b) =>
      new Date(b.data.pubDate ?? 0).valueOf() - new Date(a.data.pubDate ?? 0).valueOf()
  );
};

export const getCourseHostType = (
  course: CollectionEntry<"courses">
): "internal" | "external" => {
  return course.data.hostType ?? "internal";
};

export const getCourseUrl = (course: CollectionEntry<"courses">): string => {
  if (course.data.hostType === "external") return course.data.externalUrl ?? "#";
  return `/course/${course.data.slug ?? getCourseSlugFromEntryId(course.id)}`;
};

export const getCourseCatalog = async (): Promise<
  CollectionEntry<"courses">[]
> => (await getSortedCourses()).filter((course) => course.data.published);

export const getInternalCourses = async (): Promise<
  CollectionEntry<"courses">[]
> => {
  const courses = await getCourseCatalog();
  return courses.filter((course) => getCourseHostType(course) === "internal");
};

export const getExternalCourses = async (): Promise<
  CollectionEntry<"courses">[]
> => {
  const courses = await getCourseCatalog();
  return courses.filter((course) => getCourseHostType(course) === "external");
};

export const getCourseBySlug = async (
  courseSlug: string
): Promise<CollectionEntry<"courses"> | undefined> => {
  const courses = await getCourseCatalog();
  return courses.find(
    (course) => (course.data.slug ?? getCourseSlugFromEntryId(course.id)) === courseSlug
  );
};

export const getSectionsByCourseSlug = async (
  courseSlug: string
): Promise<CourseSection[]> => {
  const explicitSections = (await getCollection("courses"))
    .filter(
      (section) =>
        isSectionEntry(section.id) && getCourseSlugFromEntryId(section.id) === courseSlug
    )
    .map((section) => ({
      courseSlug: getCourseSlugFromEntryId(section.id),
      slug: section.id.split("/")[2] ?? "",
      title: section.data.title,
      order: section.data.order ?? 0,
      published: section.data.published,
    }));

  if (explicitSections.length > 0) {
    return explicitSections
      .filter((section) => section.published)
      .sort((a, b) => a.order - b.order);
  }

  const lessons = (await getCollection("courses")).filter(
    (lesson) =>
      !isCourseMetaEntry(lesson) &&
      !isSectionEntry(lesson.id) &&
      getCourseSlugFromEntryId(lesson.id) === courseSlug &&
      lesson.data.published
  );

  const sectionMap = new Map<string, CourseSection>();
  for (const lesson of lessons) {
    const sectionSlug = getSectionSlug(lesson.id) || lesson.data.moduleSlug || "section";
    if (!sectionMap.has(sectionSlug)) {
      sectionMap.set(sectionSlug, {
        courseSlug,
        slug: sectionSlug,
        title: lesson.data.moduleTitle ?? sectionSlug,
        order: lesson.data.moduleOrder ?? 0,
        published: true,
      });
    }
  }

  return [...sectionMap.values()].sort((a, b) => a.order - b.order);
};

export const getLessonsBySection = async (
  courseSlug: string,
  sectionSlug: string
): Promise<CollectionEntry<"courses">[]> => {
  const lessons = await getCollection("courses");
  return lessons
    .filter(
      (lesson) =>
        !isCourseMetaEntry(lesson) &&
        !isSectionEntry(lesson.id) &&
        getCourseSlugFromEntryId(lesson.id) === courseSlug &&
        getSectionSlug(lesson.id) === sectionSlug &&
        lesson.data.published
    )
    .sort((a, b) => (a.data.lessonOrder ?? 0) - (b.data.lessonOrder ?? 0));
};

export const getLessonsByCourseSlug = async (
  courseSlug: string
): Promise<CollectionEntry<"courses">[]> => {
  const lessons = await getCollection("courses");
  return lessons
    .filter(
      (lesson) =>
        !isCourseMetaEntry(lesson) &&
        !isSectionEntry(lesson.id) &&
        getCourseSlugFromEntryId(lesson.id) === courseSlug && lesson.data.published
    )
    .sort((a, b) => {
      if ((a.data.moduleOrder ?? 0) !== (b.data.moduleOrder ?? 0)) {
        return (a.data.moduleOrder ?? 0) - (b.data.moduleOrder ?? 0);
      }
      return (a.data.lessonOrder ?? 0) - (b.data.lessonOrder ?? 0);
    });
};

export const getLessonByRoute = async (
  courseSlug: string,
  sectionSlug: string,
  lessonSlug: string
): Promise<CollectionEntry<"courses"> | undefined> => {
  const lessons = await getCollection("courses");
  return lessons.find((lesson) => {
    if (!isLessonEntry(lesson)) return false;
    if (getCourseSlugFromEntryId(lesson.id) !== courseSlug) return false;
    if (getSectionSlug(lesson.id) !== sectionSlug) return false;
    return getLessonUrlSegment(lesson) === lessonSlug;
  });
};

export const getTestimonials = async (): Promise<
  CollectionEntry<"testimonial">[]
> => {
  return getCollection("testimonial");
};

export const getSortedTalks = async (): Promise<CollectionEntry<"talk">[]> => {
  return (await getCollection("talk")).sort(
    (a, b) =>
      new Date(b.data.pubDate).valueOf() - new Date(a.data.pubDate).valueOf()
  );
};

export const getFeaturedTalks = async (): Promise<
  CollectionEntry<"talk">[]
> => {
  const allTalks = await getCollection("talk");

  return allTalks
    .sort(
      (a, b) =>
        new Date(b.data.pubDate).valueOf() - new Date(a.data.pubDate).valueOf()
    )
    .filter((talk) => talk.data.featured === true);
};
