// src/content.config.ts

import { z, defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { slugifyTaxonomyValue } from './lib/taxonomy';

const aovPassSchema = z.object({
  name: z.string(),
  image: z.string(),
});

const alignmentSchema = z
  .enum(['media-left', 'center', 'page-left', 'page-right'])
  .default('page-left');

const thumbnailCropSchema = z.object({
  zoom: z.number().min(1).max(3).default(1),
  positionX: z.number().min(0).max(100).default(50),
  positionY: z.number().min(0).max(100).default(50),
});

export const mediaBlockSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('image'),
    title: z.string().optional(),
    titleAlign: alignmentSchema.optional(),
    image: z.string(),
    fitToViewport: z.boolean().default(true),
    comment: z.string().optional(),
    commentAlign: alignmentSchema.optional(),
  }),

  z.object({
    type: z.literal('video'),
    title: z.string().optional(),
    titleAlign: alignmentSchema.optional(),
    videoUrl: z.string(),
    comment: z.string().optional(),
    commentAlign: alignmentSchema.optional(),
  }),

  z.object({
    type: z.literal('turntable'),
    title: z.string().optional(),
    titleAlign: alignmentSchema.optional(),
    folder: z.string(),
    fitToViewport: z.boolean().default(true),
    comment: z.string().optional(),
    commentAlign: alignmentSchema.optional(),
  }),

  z.object({
    type: z.literal('aov'),
    title: z.string().optional(),
    titleAlign: alignmentSchema.optional(),
    aovPasses: z.array(aovPassSchema).default([]),
    fitToViewport: z.boolean().default(true),
    comment: z.string().optional(),
    commentAlign: alignmentSchema.optional(),
  }),

  z.object({
    type: z.literal('text_block'),
    title: z.string().optional(),
    content: z.string().default(''),
  }),
]);

export type MediaBlock = z.infer<typeof mediaBlockSchema>;

const taxonomyEntrySchema = z.object({
  name: z.string().min(1),
});


const taxonomyFileLoader = (filePath: string) =>
  file(filePath, {
    parser: (contents) => {
      const parsed = JSON.parse(contents) as {
        values: Array<{ name: string }>;
      };

      return parsed.values.map((value) => ({
        id: slugifyTaxonomyValue(value.name),
        name: value.name,
      }));
    },
  });

const tagCollection = defineCollection({
  loader: taxonomyFileLoader('./src/content/pools/tags.json'),
  schema: taxonomyEntrySchema,
});

const softwareCollection = defineCollection({
  loader: taxonomyFileLoader('./src/content/pools/software.json'),
  schema: taxonomyEntrySchema,
});

const projectCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    category: z.string(),
    publishDate: z.date().optional(),
    thumbnail: z.string(),
    thumbnailCrop: thumbnailCropSchema.optional(),
    showreelUrl: z.string().optional(),
    role: z.string().default('Lead 3D Artist'),
    client: z.string().default('Personal Project'),
    tags: z.array(z.string()).min(1),
    softwareUsed: z.array(z.string()).min(1),
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
    tags: z.array(z.string()),
    softwareUsed: z.array(z.string()).default([]),
    thumbnail: z.string(),
    thumbnailCrop: thumbnailCropSchema.optional(),

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
  tags: tagCollection,
  software: softwareCollection,
  projects: projectCollection,
  learning: learningCollection,
  pages: pagesCollection,
};