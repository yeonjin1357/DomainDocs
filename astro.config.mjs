// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import { unified } from '@astrojs/markdown-remark';
import remarkGfm from 'remark-gfm';

// 배포 시 GitHub Actions가 SITE_URL·BASE_PATH를 넣는다. 커스텀 도메인이면 BASE_PATH가 빈 문자열이다.
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
