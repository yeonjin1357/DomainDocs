import { defineCollection, reference } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { DOMAIN_IDS } from './data/domains';
import { ICON_NAMES } from './data/icons';

const docs = defineCollection({
  // 화면 테스트는 DOCS_CONTENT_DIR=./tests/fixtures/docs로 테스트 전용 글을 쓴다.
  loader: glob({ pattern: '**/*.mdx', base: process.env.DOCS_CONTENT_DIR ?? './src/content/docs' }),
  schema: z.object({
    title: z.string().max(30),
    summary: z.string().min(15).max(60),
    domain: z.enum(DOMAIN_IDS),
    type: z.enum(['concept', 'guide']),
    order: z.number().int(),
    icon: z.enum(ICON_NAMES).optional(),
    keywords: z.array(z.string()).max(10).default([]),
    related: z.array(reference('docs')).max(5).default([]),
    // 출처 링크는 http/https만 받는다(javascript:, file: 등은 거른다).
    sources: z.array(z.object({ title: z.string(), url: z.url({ protocol: /^https?$/ }) })).min(1),
    updated: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { docs };
