// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import { unified } from '@astrojs/markdown-remark';
import remarkGfm from 'remark-gfm';

// 배포는 Vercel이 하고, 프로젝트 환경 변수로 SITE_URL·BASE_PATH를 넣는다. 도메인 루트에 두므로 BASE_PATH는 `/`이다.
const basePath = process.env.BASE_PATH;

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://yeonjin1357.github.io',
  base: basePath === undefined ? '/DomainDocs' : basePath || '/',
  integrations: [mdx(), react()],
  markdown: {
    // Sätteri(기본 처리기)는 "1~2초"를 취소선으로 바꾼다. remark + singleTilde:false로 막는다.
    processor: unified({
      gfm: false,
      smartypants: false,
      remarkPlugins: [[remarkGfm, { singleTilde: false }]],
    }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
    },
  },
});
