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
    
    aovPasses: z.array(
      z.object({
        name: z.string(),
        image: z.string(),
      })
    ).optional(),
    
    // Now you just provide the folder path! (e.g., "/turntables/test")
    turntable: z.string().optional(),
  }),
});

export const collections = {
  'projects': projectCollection,
};