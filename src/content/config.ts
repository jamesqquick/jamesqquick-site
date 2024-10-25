import { z, defineCollection } from "astro:content";
import { glob } from "astro/loaders";

const testimonialsCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/data/testimonial" }),
  schema: z.object({
    title: z.string(),
    name: z.string(),
    image: z.string(),
    shortQuote: z.string(),
  }),
});

const talksCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/data/talk" }),
  schema: ({ image }) =>
    z.object({
      conferenceName: z.string(),
      conferenceLocation: z.string(),
      conferenceLink: z.string(),
      coverImage: image().optional(),
      conferenceLogo: z.string(),
      youTubeVideoId: z.string().optional(),
      title: z.string(),
      pubDate: z.date(),
      slidesLink: z.string().optional(),
      featured: z.boolean().default(false),
    }),
});

const coursesCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/data/course" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      coverImage: image(),
      pubDate: z.date(),
      description: z.string(),
      youTubeVideoId: z.string().optional(),
      featured: z.boolean().optional(),
      link: z.string().optional(),
    }),
});

const blogsCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/data/blog" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      coverImage: image().optional(),
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
  talk: talksCollection,
};
