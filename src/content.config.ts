// src/content.config.ts

import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

const aovPassSchema = z.object({
  name: z.string(),
  image: z.string(),
});

const mediaBlockSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('image'),
    title: z.string().optional(),
    image: z.string(),
    comment: z.string().optional(),
  }),

  z.object({
    type: z.literal('video'),
    title: z.string().optional(),
    videoUrl: z.string(),
    comment: z.string().optional(),
  }),

  z.object({
    type: z.literal('turntable'),
    title: z.string().optional(),
    folder: z.string(),
    comment: z.string().optional(),
  }),

  z.object({
    type: z.literal('aov'),
    title: z.string().optional(),
    aovPasses: z.array(aovPassSchema).default([]),
    comment: z.string().optional(),
  }),

  // NEW: The Text/Markdown Media Block!
  z.object({
    type: z.literal('text_block'),
    title: z.string().optional(),
    content: z.string(),
  }),
]);

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

    // The order of these blocks determines their order on the project page.
    mediaBlocks: z.array(mediaBlockSchema).optional(),
    
    // Legacy fields have been completely removed!
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
    youtubeId: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

export const collections = {
  projects: projectCollection,
  learning: learningCollection,
};