import { CollectionEntry, getCollection } from "astro:content";

export const getSortedBlogPosts = async (): Promise<
  CollectionEntry<"blog">[]
> => {
  return (await getCollection("blog")).sort(
    (a, b) =>
      new Date(b.data.pubDate).valueOf() - new Date(a.data.pubDate).valueOf()
  );
};

export const getSortedCourses = async (): Promise<
  CollectionEntry<"course">[]
> => {
  return (await getCollection("course")).sort(
    (a, b) =>
      new Date(b.data.pubDate).valueOf() - new Date(a.data.pubDate).valueOf()
  );
};

export const getSortedTalks = async (): Promise<CollectionEntry<"talk">[]> => {
  return (await getCollection("talk")).sort(
    (a, b) => new Date(b.data.date).valueOf() - new Date(a.data.date).valueOf()
  );
};
