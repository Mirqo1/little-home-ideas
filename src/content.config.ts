import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
const articles = defineCollection({
 loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
 schema: z.object({ title: z.string(), description: z.string().max(170), category: z.enum(['small-spaces','garden-patio','diy-home','renter-friendly','practical-solutions']), date: z.coerce.date(), updated: z.coerce.date().optional(), image: z.string(), imageAlt: z.string(), imageSmall: z.string().optional(), imageWidth: z.number().int().positive().default(960), imageHeight: z.number().int().positive().default(640), imageCaption: z.string().default(""), imageProvenance: z.enum(["generated","original","third-party"]), imageCredit: z.object({creator:z.string().min(1),source:z.string().url(),license:z.string().min(1),licenseUrl:z.string().url(),freeToUse:z.literal(true)}).optional(), reviewed: z.boolean().default(false), draft: z.boolean().default(true), sources: z.array(z.object({title:z.string(),url:z.string().url(),note:z.string().optional()})).default([]) }).refine(d=>d.imageProvenance!=="third-party" || !!d.imageCredit,{message:"Third-party photographs require a creator, source, verified free-use license, and license URL.",path:["imageCredit"]})
});
export const collections = { articles };
