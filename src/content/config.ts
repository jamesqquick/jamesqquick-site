import { z, defineCollection } from "astro:content";

const testimonialsCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    name: z.string(),
    image: z.string(),
    shortQuote: z.string(),
  }),
});

const talksCollection = defineCollection({
  schema: z.object({
    conferenceName: z.string(),
    conferenceLocation: z.string(),
    conferenceLink: z.string(),
    conferenceLogo: z.string(),
    youTubeVideoId: z.string().optional(),
    title: z.string(),
    pubDate: z.date(),
    slidesLink: z.string().optional(),
  }),
});

const coursesCollection = defineCollection({
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
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      coverImage: image(),
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
