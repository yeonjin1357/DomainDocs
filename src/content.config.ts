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
    type: z.enum(['overview', 'concept', 'guide']),
    // 개념 글의 층. basics는 도메인 기초, monitoring은 모니터링 관점. 개념 글에만 쓴다(글 검사가 확인).
    stage: z.enum(['basics', 'monitoring']).optional(),
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

// 용어는 영역마다 YAML 파일 하나(src/content/terms/{domain}.yaml). 자세한 형식 검사와 줄 번호는 글 검사기가 맡는다.
const termSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/),
  name: z.string().min(1).max(30),
  en: z.string().optional(),
  aliases: z.array(z.string()).default([]),
  short: z.string().min(1).max(60),
  analogy: z.string().optional(),
  doc: z.string().optional(),
});

const glossary = defineCollection({
  // 화면 테스트는 TERMS_CONTENT_DIR=./tests/fixtures/terms로 테스트 전용 용어를 쓴다.
  loader: glob({ pattern: '*.yaml', base: process.env.TERMS_CONTENT_DIR ?? './src/content/terms' }),
  schema: z.object({ terms: z.array(termSchema).min(1) }),
});

export const collections = { docs, glossary };
