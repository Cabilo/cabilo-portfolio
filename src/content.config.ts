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

const mediaBlockItemSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('image'),
    title: z.string().optional(),
    titleAlign: alignmentSchema.optional(),
    image: z.string(),
    compress: z.boolean().default(true),
    fitToViewport: z.boolean().default(true),
    comment: z.string().optional(),
    commentAlign: alignmentSchema.optional(),
  }),

  z.object({
    type: z.literal('video'),
    title: z.string().optional(),
    titleAlign: alignmentSchema.optional(),
    videoUrl: z.string(),
    fitToViewport: z.boolean().default(true),
    comment: z.string().optional(),
    commentAlign: alignmentSchema.optional(),
  }),

  z.object({
    type: z.literal('turntable'),
    title: z.string().optional(),
    titleAlign: alignmentSchema.optional(),
    folder: z.string(),
    compress: z.boolean().default(true),
    fitToViewport: z.boolean().default(true),
    comment: z.string().optional(),
    commentAlign: alignmentSchema.optional(),
  }),

  z.object({
    type: z.literal('aov'),
    title: z.string().optional(),
    titleAlign: alignmentSchema.optional(),
    aovPasses: z.array(aovPassSchema).default([]),
    compress: z.boolean().default(true),
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

export const mediaBlockSchema = z.union([
  mediaBlockItemSchema,

  z.object({
    type: z.literal('group'),
    columns: z.number().int().min(1).max(5).default(2),
    items: z.array(mediaBlockItemSchema).min(1).max(5),
  }),
]);

export type MediaBlock = z.infer<typeof mediaBlockSchema>;

const layoutBlockBaseSchema = z.object({
  id: z.string(),
  x: z.number().int().min(0).max(9),
  y: z.number().int().min(0).max(99),
  w: z.number().int().min(1).max(10),
  h: z.number().int().min(1).max(100),
  snap: z.enum(['grid', 'free']).default('grid'),
  title: z.string().optional(),
  fitMode: z.enum(['none', 'width-to-height', 'height-to-width']).default('none'),
  fitToViewport: z.boolean().default(true),
  compress: z.boolean().default(true),
  assetAlignment: z.enum(['auto', 'left', 'center', 'right']).default('auto'),
});

export const layoutBlockSchema = z.discriminatedUnion('type', [
  layoutBlockBaseSchema.extend({
    type: z.literal('image'),
    image: z.string(),
  }),
  layoutBlockBaseSchema.extend({
    type: z.literal('text'),
    content: z.string().default(''),
  }),
  layoutBlockBaseSchema.extend({
    type: z.literal('video'),
    videoUrl: z.string(),
  }),
  layoutBlockBaseSchema.extend({
    type: z.literal('turntable'),
    folder: z.string(),
  }),
  layoutBlockBaseSchema.extend({
    type: z.literal('aov'),
    aovPasses: z.array(aovPassSchema).default([]),
  }),
]);

export type LayoutBlock = z.infer<typeof layoutBlockSchema>;

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

const softwareFileLoader = file('./src/content/pools/software.json', {
  parser: (contents) => {
    const parsed = JSON.parse(contents) as {
      values: Array<{ name: string; addToArsenal?: boolean }>;
    };

    return parsed.values.map((value) => ({
      id: slugifyTaxonomyValue(value.name),
      name: value.name,
      addToArsenal: value.addToArsenal ?? true,
    }));
  },
});

const tagCollection = defineCollection({
  loader: taxonomyFileLoader('./src/content/pools/tags.json'),
  schema: taxonomyEntrySchema,
});

const softwareCollection = defineCollection({
  loader: softwareFileLoader,
  schema: taxonomyEntrySchema.extend({
    addToArsenal: z.boolean().default(true),
  }),
});

const projectCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/projects" }),
  schema: z.object({
    title: z.string(),
    category: z.string(),
    publishDate: z.date().optional(),
    thumbnail: z.string(),
    compressThumbnail: z.boolean().default(true),
    thumbnailCrop: thumbnailCropSchema.optional(),
    showreelUrl: z.string().optional(),
    showreelFitToViewport: z.boolean().default(true),
    role: z.string().default('Lead 3D Artist'),
    client: z.string().default('Personal Project'),
    tags: z.array(z.string()).min(1),
    softwareUsed: z.array(z.string()).min(1),
    mediaBlocks: z.array(mediaBlockSchema).optional(),
    layoutBlocks: z.array(layoutBlockSchema).optional(),
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
    compressThumbnail: z.boolean().default(true),
    thumbnailCrop: thumbnailCropSchema.optional(),

    // FIXED: Universal video URL for the optional top video.
    videoUrl: z.string().optional(),

    featured: z.boolean().default(false),

    // Shared media-block system used by Projects, Tutorials, and Breakdowns.
    mediaBlocks: z.array(mediaBlockSchema).optional(),
    layoutBlocks: z.array(layoutBlockSchema).optional(),
  }),
});

const pagesCollection = defineCollection({
  loader: glob({ pattern: "**/*.md", base: "./src/content/pages" }),
  schema: z.object({
    title: z.string(),
    headline: z.string().optional(),
    subheadline: z.string().optional(),
    showreelUrl: z.string().optional(),

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