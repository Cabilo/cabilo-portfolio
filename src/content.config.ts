// src/content.config.ts

import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const aovPassSchema = z.object({
  name: z.string(),
  image: z.string(),
});

const alignmentSchema = z.enum([
  'media-left',
  'center',
  'page-left',
  'page-right',
]);

export const mediaBlockSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('image'),
    title: z.string().optional(),
    titleAlign: alignmentSchema.default('media-left'),
    image: z.string(),
    fitToViewport: z.boolean().default(true),
    comment: z.string().optional(),
    commentAlign: alignmentSchema.default('media-left'),
  }),

  z.object({
    type: z.literal('video'),
    title: z.string().optional(),
    titleAlign: alignmentSchema.default('media-left'),
    videoUrl: z.string(),
    comment: z.string().optional(),
    commentAlign: alignmentSchema.default('media-left'),
  }),

  z.object({
    type: z.literal('turntable'),
    title: z.string().optional(),
    titleAlign: alignmentSchema.default('media-left'),
    folder: z.string(),
    fitToViewport: z.boolean().default(true),
    comment: z.string().optional(),
    commentAlign: alignmentSchema.default('media-left'),
  }),

  z.object({
    type: z.literal('aov'),
    title: z.string().optional(),
    titleAlign: alignmentSchema.default('media-left'),
    aovPasses: z.array(aovPassSchema).default([]),
    fitToViewport: z.boolean().default(true),
    comment: z.string().optional(),
    commentAlign: alignmentSchema.default('media-left'),
  }),

  z.object({
    type: z.literal('text_block'),
    title: z.string().optional(),
    content: z.string().default(''),
  }),
]);

export type MediaBlock = z.infer<typeof mediaBlockSchema>;

const projectCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    category: z.string(),
    thumbnail: z.string(),
    showreelUrl: z.string().optional(),
    role: z.string().default('Lead 3D Artist'),
    client: z.string().default('Personal Project'),
    softwareUsed: z.array(z.string()).default([]),
    mediaBlocks: z.array(mediaBlockSchema).optional(),
  }),
});

const learningCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/learning" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date(),
    type: z.enum(["Tutorial", "Breakdown"]),
    format: z.enum(["Video", "Article"]),
    tags: z.array(z.string()),
    thumbnail: z.string(),

    // FIXED: Universal video URL for the optional top video.
    videoUrl: z.string().optional(),

    featured: z.boolean().default(false),

    // Shared media-block system used by Projects, Tutorials, and Breakdowns.
    mediaBlocks: z.array(mediaBlockSchema).optional(),
  }),
});

const pagesCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    headline: z.string().optional(),
    subheadline: z.string().optional(),
    showreelUrl: z.string().optional(),
    softwareArsenal: z.array(z.string()).optional(),

    // NEW: Global SEO pulled from Homepage
    globalSeoTitle: z.string().optional(),
    globalSeoDescription: z.string().optional(),
    globalSeoImage: z.string().optional(),
  }),
});

export const collections = {
  projects: projectCollection,
  learning: learningCollection,
  pages: pagesCollection,
};