// src/content.config.ts
import { z, defineCollection } from 'astro:content';
import { glob } from 'astro/loaders'; 

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
    aovTitle: z.string().optional(),
    aovPasses: z.array(z.object({
      name: z.string(),
      image: z.string(),
    })).optional(),
    turntable: z.string().optional(),
  }),
});

// NEW: The Learning Collection (used for both Tutorials and Breakdowns)
const learningCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/learning" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.date(), // So we can sort them by newest!
    type: z.enum(["Tutorial", "Breakdown"]), // This strictly separates them in the database
    format: z.enum(["Video", "Article"]),
    tags: z.array(z.string()),
    thumbnail: z.string(),
    youtubeId: z.string().optional(),
    featured: z.boolean().default(false),
  }),
});

export const collections = {
  'projects': projectCollection,
  'learning': learningCollection, // We register the new collection
};