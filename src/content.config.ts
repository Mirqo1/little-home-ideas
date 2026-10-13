import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
const articles = defineCollection({
 loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
 schema: z.object({ title: z.string(), description: z.string().max(170), category: z.enum(['small-spaces','garden-patio','diy-home','renter-friendly','practical-solutions']), date: z.coerce.date(), updated: z.coerce.date().optional(), image: z.string(), imageAlt: z.string(), reviewed: z.boolean().default(false), draft: z.boolean().default(true), sources: z.array(z.object({title:z.string(),url:z.string().url()})).default([]) })
});
export const collections = { articles };
