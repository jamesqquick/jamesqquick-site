import { z, defineCollection } from "astro:content";

const testimonialsCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    name: z.string(),
    image: z.string(),
  }),
});

const coursesCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    coverImage: z.string(),
    pubDate: z.date(),
    description: z.string(),
    youTubeVideoId: z.string().optional(),
  }),
});

const blogsCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    coverImage: z.string(),
    pubDate: z.date(),
    description: z.string(),
    youTubeVideoId: z.string().optional(),
    tags: z.array(z.string()),
  }),
});

export const collections = {
  testimonial: testimonialsCollection,
  blog: blogsCollection,
  course: coursesCollection,
};
