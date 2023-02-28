import { getCollection } from "astro:content";

export const getSortedBlogPosts = async (): Promise<any[]> => {
  return (await getCollection("blog")).sort(
    (a, b) =>
      new Date(b.data.pubDate).valueOf() - new Date(a.data.pubDate).valueOf()
  );
};

export const getSortedCourses = async (): Promise<any[]> => {
  return (await getCollection("course")).sort(
    (a, b) =>
      new Date(b.data.pubDate).valueOf() - new Date(a.data.pubDate).valueOf()
  );
};
