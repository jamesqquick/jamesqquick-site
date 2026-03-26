import { CollectionEntry, getCollection } from "astro:content";

export type CourseSection = {
  courseSlug: string;
  slug: string;
  title: string;
  order: number;
  published: boolean;
};

const getCourseSlugFromEntryId = (id: string): string => id.split("/")[0];
const isCourseMetaEntry = (id: string): boolean =>
  /^([^/]+)\/index(\.mdx?|)$/.test(id);
const isSectionEntry = (id: string): boolean =>
  /^([^/]+)\/sections\/([^/]+)\/index(\.mdx?|)$/.test(id);
const isLessonEntry = (id: string): boolean =>
  !isCourseMetaEntry(id) && !isSectionEntry(id);

export const getCourseSlug = (id: string): string => id.split("/")[0];

export const getSectionSlug = (lessonId: string): string => {
  const parts = lessonId.split("/");
  const sectionsIndex = parts.indexOf("sections");
  if (sectionsIndex >= 0 && parts[sectionsIndex + 1]) {
    return parts[sectionsIndex + 1];
  }
  return parts[1] ?? "";
};

export const getLessonSlug = (lessonId: string): string =>
  (lessonId.split("/").pop() ?? lessonId).replace(/\.mdx?$/i, "");

export const getNormalizedLessonId = (lessonId: string): string => {
  const parts = lessonId.split("/");
  const courseSlug = parts[0];
  const sectionSlug = getSectionSlug(lessonId);
  const lessonSlug = getLessonSlug(lessonId);
  return `${courseSlug}/sections/${sectionSlug}/${lessonSlug}`;
};

export const lessonUrl = (lessonId: string): string => {
  const courseSlug = getCourseSlug(lessonId);
  const sectionSlug = getSectionSlug(lessonId);
  const lessonSlug = getLessonSlug(lessonId);
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
    .filter((entry) => isCourseMetaEntry(entry.id))
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
      !isCourseMetaEntry(lesson.id) &&
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
        !isCourseMetaEntry(lesson.id) &&
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
        !isCourseMetaEntry(lesson.id) &&
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
    if (!isLessonEntry(lesson.id)) return false;
    if (getCourseSlugFromEntryId(lesson.id) !== courseSlug) return false;
    if (getSectionSlug(lesson.id) !== sectionSlug) return false;
    return getLessonSlug(lesson.id) === lessonSlug;
  });
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
