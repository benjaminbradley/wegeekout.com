import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Every entry carries its public URL in `path`, so historical URLs
// (/content/<slug>/ from Drupal, /2022/04/21/... from WordPress) are kept as-is.
const legacy = z.object({
  drupalNid: z.number().optional(),
  publishedOnDrupal: z.boolean().optional(),
  draftStage: z.string().optional(),
  publishedFromDraft: z.coerce.date().optional(),
  originalDrupalDate: z.coerce.date().optional(),
  source: z.string().optional(),
}).optional();

const path = z.string().regex(/^\/(.*\/)?$/, 'path must start and end with "/"');

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    path,
    description: z.string().optional(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
    legacy,
  }),
});

const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    path,
    description: z.string().optional(),
    pubDate: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    legacy,
    // Home page only: the portfolio cards.
    portfolio: z.object({
      heading: z.string(),
      intro: z.string().optional(),
      projects: z.array(z.object({
        title: z.string(),
        href: z.string(),
        blurb: z.string(),
        image: z.string().optional(),
      })),
    }).optional(),
  }),
});

export const collections = { blog, pages };
