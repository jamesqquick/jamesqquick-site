import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const testimonialsCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/data/testimonial" }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      name: z.string(),
      image: image(),
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
      conferenceLogo: image(),
      youTubeVideoId: z.string().optional(),
      title: z.string(),
      pubDate: z.date(),
      slidesLink: z.string().optional(),
      featured: z.boolean().default(false),
    }),
});

/**
 * Use file path as entry id, not `data.slug`. Lesson frontmatter often sets `slug` for
 * URLs; the default glob loader would use that as the id, collapsing many lessons into
 * one and breaking `getCourseSlug()` / per-section grouping.
 */
const coursesCollection = defineCollection({
  loader: glob({
    pattern: "**/*.{md,mdx}",
    base: "./src/content/courses",
    generateId: ({ entry }) => entry.replace(/\.mdx?$/i, "").replace(/\\/g, "/"),
  }),
  schema: ({ image }) =>
    z
      .object({
        slug: z.string().optional(),
        title: z.string(),
        /** Processed image via astro:assets image pipeline */
        coverImage: image().optional(),
        pubDate: z.date().optional(),
        updatedDate: z.date().optional(),
        description: z.string().optional(),
        youTubeVideoId: z.string().optional(),
        featured: z.boolean().optional(),
        tags: z.array(z.string()).default([]),
        hostType: z.enum(["internal", "external"]).optional(),
        published: z.boolean().default(true),
        externalUrl: z.string().url().optional(),
        courseSlug: z.string().optional(),
        order: z.number().optional(),
        moduleSlug: z.string().optional(),
        moduleTitle: z.string().optional(),
        moduleOrder: z.number().optional(),
        lessonOrder: z.number().optional(),
        duration: z.string().optional(),
        summary: z.string().optional(),
        videoId: z.string().optional(),
        /** R2 object key (e.g. `intro-to-astro.mp4`) for signed playback via SecureVideo */
        videoKey: z.string().optional(),
        videoUrl: z.string().optional(),
        transcript: z.string().optional(),
        resources: z.array(z.string()).default([]),
      })
      .superRefine((data, ctx) => {
        if (data.hostType === "external" && !data.externalUrl) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["externalUrl"],
            message: "External courses require `externalUrl`.",
          });
        }

        if (data.hostType === "internal" && data.externalUrl) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["externalUrl"],
            message: "Internal courses should not include `externalUrl`.",
          });
        }
      }),
});

const blogsCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/data/blog" }),
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
  courses: coursesCollection,
  talk: talksCollection,
};

