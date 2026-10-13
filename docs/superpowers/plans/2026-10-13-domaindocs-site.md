# DomainDocs 사이트 1단계 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 토스풍의 읽기 쉬운 모니터링 지식 사이트(홈·영역·개념·가이드 페이지, 개념 미리보기 시트, 검색, 데모 2개)를 만들고, 공통 기초 샘플 글 4편을 실어 GitHub Pages에 공개한다.

**Architecture:** Astro 7 정적 사이트. 글은 `src/content/docs/{domain}/{slug}.mdx`이고, 머리말은 zod 스키마로, 본문 틀과 문장은 자체 글 검사기(remark 기반)로 빌드 전에 검사한다. 화면은 JavaScript 없는 HTML이 기본이고, 미리보기 시트·검색·상단 바만 작은 스크립트를 쓰며, 데모 2개만 React 섬(island)이다. 화면 테스트는 테스트 전용 글로 빌드한 사이트를 base 경로 아래에서 띄워서 돈다.

**Tech Stack:** Astro 7.3, @astrojs/mdx 8, @astrojs/react 7, @astrojs/markdown-remark 7.3(unified 처리기), remark-gfm 4, React 19.3, TypeScript 6, zod 4(`astro/zod`), @lucide/astro, Pretendard, Pagefind 1.5, Vitest 5, Playwright 1.64, tsx 4.

**Spec:** `docs/superpowers/specs/2026-10-13-domaindocs-site-design.md`

## Global Constraints

- Node `>=22.12.0`(로컬 22.17.1). `package.json`은 `"type": "module"`.
- TypeScript는 `^6`으로 고정한다. `@astrojs/check` 0.9.10의 peer가 `^5 || ^6`이라 7은 쓰지 않는다.
- MDX 처리기는 `astro.config.mjs`에서 `unified({ gfm: false, smartypants: false, remarkPlugins: [[remarkGfm, { singleTilde: false }]] })`로 고정한다. Astro 7 기본 처리기(Sätteri)는 `1~2초 또는 3~4초`를 `1<del>2초 또는 3</del>4초`로 바꾼다(사전 실험으로 확인함). 되돌리지 않는다.
- Astro 7 import 경로는 다음과 같다. `z`는 `astro/zod`, `defineCollection`·`reference`·`getCollection`·`render`·`CollectionEntry`는 `astro:content`, `glob`은 `astro/loaders`에서 가져온다. URL 검사는 `z.url()`을 쓴다(`z.string().url()`은 deprecated).
- `entry.id`는 `foundations/percentiles` 형식이다(확장자 없는 경로). `related`와 `<Term slug>`는 모두 이 형식을 쓴다.
- 존재하지 않는 `reference()`를 가리켜도 Astro 7 빌드는 경고만 내고 성공한다. 그래서 글 검사기와 `src/lib/content.ts`의 `assertReferences`가 직접 실패시킨다.
- base 경로는 `/DomainDocs`이다(끝에 `/` 없음). 내부 URL은 반드시 `src/lib/paths.ts`의 `withBase`·`docPath`·`domainPath`로 만든다. `/`로 시작하는 내부 경로를 하드코딩하지 않는다.
- React 데모는 MDX 안에서 default import 후 `<Demo client:visible />`로 쓴다. `components` 맵으로 넘긴 컴포넌트에는 client 지시어를 쓸 수 없다(빌드 실패).
- Astro 7은 `compressHTML: 'jsx'`가 기본이다. `.astro` 템플릿에서 줄바꿈으로 나뉜 인라인 요소 사이의 공백이 사라지므로, 간격은 CSS `gap`이나 `{' '}`로 명시한다.
- 스크립트로 만든 DOM(검색 결과, 시트의 목록)에는 Astro 범위(scoped) 스타일이 적용되지 않는다. `:global()`이나 `<style is:global>`을 쓴다.
- Playwright `page.goto`는 앞에 `/` 없는 상대 경로로 쓴다(`'foundations/alpha/'`). 앞에 `/`를 붙이면 base 밖으로 나간다. 가로 넘침은 `scrollWidth <= clientWidth`로 잰다(`innerWidth`는 모바일 에뮬레이션에서 늘어나 넘침을 놓친다).
- Windows Git Bash에서 `/`로 시작하는 환경 변수 값은 경로로 바뀐다. 필요하면 `MSYS_NO_PATHCONV=1`을 붙인다. PowerShell에서는 `$env:NAME = 'value'`를 쓴다.
- Astro 7은 AI 에이전트가 `astro dev`를 실행하면 백그라운드로 띄운다. 포그라운드가 필요하면 `ASTRO_DEV_BACKGROUND=0`을 쓰고, 끝나면 `npx astro dev stop`으로 정리한다.
- 화면 문구는 모두 한국어 해요체로 쓴다. 토스 로고, Toss Product Sans, 토스페이스 이모지, 토스 일러스트는 쓰지 않는다.
- 디자인 토큰 값은 스펙 8.1 표를 그대로 쓴다. 본문은 17px / 행간 1.7 / 자간 -0.01em, 본문 칼럼은 최대 640px, 모바일 좌우 여백은 20px이다.
- 댓글, 로그인, 방문자 분석, 영어판, CMS, 서버, 다크 모드 수동 전환은 만들지 않는다.
- 글 검사 기준값은 스펙 7.2를 따른다. 문장 80자, 단락 3문장, 개념 본문 1,500자, 가이드 본문 4,000자, 블록 제목 30자이다.
- 커밋 메시지는 `feat: …`, `test: …`, `docs: …` 형식에 한국어 설명을 쓰고, 마지막 줄에 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`를 붙인다.

## Review Focus

1. **base 경로 밖으로 새는 링크**: GitHub Pages에서는 `/DomainDocs/` 밖의 내부 링크가 모두 404가 된다. 사이트 전체 링크를 따라가며 200을 확인하는 크롤러 테스트로 고정한다(Task 6).
2. **360px 화면에서 넘치는 긴 토큰**: 긴 지표 이름(인라인 코드), 코드 블록, 넓은 표가 가로 스크롤을 만들면 안 된다. '더 깊이'를 모두 펼친 상태로 모든 테스트 페이지의 넘침을 잰다(Task 5).
3. **한글 숫자 범위의 물결표**: `1~2초`가 취소선이 되면 안 된다. 화면 테스트(Task 5)와 검사기 파서 설정(Task 2)으로 고정한다.
4. **공개 글이 초안 글을 가리킴**: 운영 빌드에서는 초안이 빠지므로 깨진 링크가 된다. 검사기 규칙(Task 3)과 빌드 가드(Task 5)로 막는다.
5. **검색 색인을 못 불러오는 경우**: `astro dev`, 네트워크 실패, 결과 없음에서 빈 화면 대신 안내 문구를 보여야 한다. `pagefind.js` 요청을 막은 상태의 테스트로 고정한다(Task 8).

## 파일 구조

```text
/
├─ CLAUDE.md                          # 에이전트 작업 규칙 (Task 3)
├─ README.md                          # 소개와 실행 방법 (Task 16)
├─ astro.config.mjs                   # (Task 1)
├─ package.json / tsconfig.json / vitest.config.ts / playwright.config.ts   # (Task 1)
├─ .gitignore / .gitattributes        # (Task 1)
├─ .github/workflows/site.yml         # CI + 배포 (Task 16)
├─ public/favicon.svg                 # (Task 4)
├─ scripts/
│  ├─ serve-dist.mjs                  # base 경로 정적 서버 (Task 1)
│  └─ lint-content/                   # 글 검사기 (Task 3)
│     ├─ config.ts                    #   기준값·금지 표현
│     ├─ rules.ts                     #   lintSource, collectMeta
│     └─ index.ts                     #   CLI
├─ src/
│  ├─ content.config.ts               # 컬렉션·스키마 (Task 5)
│  ├─ content/docs/{domain}/*.mdx     # 실제 글 (Task 12~15)
│  ├─ data/
│  │  ├─ site.ts                      # 사이트 이름·문구 (Task 4)
│  │  ├─ icons.ts                     # 아이콘 이름 목록 (Task 4)
│  │  └─ domains.ts                   # 영역 정의 (Task 5)
│  ├─ lib/
│  │  ├─ paths.ts                     # base 경로 (Task 1)
│  │  ├─ mdx/parse.ts                 # MDX 파싱 (Task 2)
│  │  ├─ mdx/prose.ts                 # 문장 추출·분리 (Task 2)
│  │  ├─ mdx/analyze.ts               # 읽는 시간·Term·핵심 제목 (Task 2)
│  │  ├─ catalog.ts                   # DocCard·정렬 (Task 5)
│  │  ├─ content.ts                   # astro:content 래퍼 (Task 5, 7)
│  │  ├─ viz/line.ts                  # 차트 좌표 (Task 9)
│  │  ├─ stats.ts                     # 평균·백분위수·다운샘플링 (Task 10, 11)
│  │  └─ demo-data.ts                 # 데모 데이터 (Task 10, 11)
│  ├─ components/
│  │  ├─ ui/                          # TopBar, Icon, ListRow (Task 4, 5), Card (Task 6), BottomSheet (Task 7), SearchOverlay (Task 8)
│  │  ├─ content/                     # 틀 블록 + Term + index.ts (Task 5, 9)
│  │  ├─ doc/                         # DocHeader, SourceList, RelatedList, NextCard (Task 5), TermSheet (Task 7)
│  │  ├─ viz/                         # MiniLineChart, StatTile (Task 9)
│  │  └─ demos/                       # PercentileDemo, DownsamplingDemo, demo.css (Task 10, 11)
│  ├─ layouts/BaseLayout.astro        # (Task 4)
│  ├─ layouts/DocLayout.astro         # (Task 5)
│  ├─ pages/index.astro               # (Task 1 임시 → Task 6)
│  ├─ pages/404.astro                 # (Task 6)
│  ├─ pages/[domain]/index.astro      # (Task 6)
│  ├─ pages/[domain]/[slug].astro     # (Task 5)
│  ├─ scripts/                        # topbar은 TopBar 안, dialog.ts·term-sheet.ts (Task 7), search.ts (Task 8)
│  └─ styles/tokens.css, global.css   # (Task 4)
├─ tests/
│  ├─ unit/                           # Vitest
│  ├─ e2e/                            # Playwright
│  └─ fixtures/
│     ├─ docs/foundations/*.mdx       # 화면 테스트 전용 글 (Task 5~11)
│     └─ lint/{good,bad}/foundations/ # 검사기 CLI 테스트용 (Task 3)
└─ docs/
   ├─ writing-guide.md                # 글쓰기 규칙 (Task 3)
   ├─ reviews/                        # 글별 사실 검토 기록 (Task 12~15)
   └─ superpowers/{specs,plans}/
```

---

### Task 1: 프로젝트 골격과 테스트 도구

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`, `.gitignore`, `.gitattributes`, `scripts/serve-dist.mjs`, `src/pages/index.astro`(임시), `src/lib/paths.ts`, `src/content/docs/.gitkeep`
- Test: `tests/unit/paths.test.ts`, `tests/e2e/smoke.spec.ts`

**Interfaces:**
- Produces:
  - `joinBase(base: string, path?: string): string`: `joinBase('/DomainDocs', 'a/')` → `'/DomainDocs/a/'`, `joinBase('/DomainDocs')` → `'/DomainDocs/'`, `joinBase('/', 'a/')` → `'/a/'`
  - `withBase(path?: string): string`: `joinBase(import.meta.env.BASE_URL, path)`
  - `docPath(id: string): string`: `withBase(`${id}/`)`
  - `domainPath(domain: string): string`: `withBase(`${domain}/`)`
  - npm 스크립트 `dev`, `build`, `check`, `test`, `test:e2e`
  - 테스트 서버 `http://localhost:4329/DomainDocs/`. Playwright가 `DOCS_CONTENT_DIR=./tests/fixtures/docs`로 빌드한 뒤 띄운다.

- [ ] **Step 1: package.json 만들기**

```json
{
  "name": "domain-docs",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "engines": { "node": ">=22.12.0" },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "check": "astro check",
    "test": "vitest run",
    "test:e2e": "playwright test"
  }
}
```

- [ ] **Step 2: 의존성 설치**

```bash
npm install astro@^7.3.8 @astrojs/mdx@^8.0.3 @astrojs/react@^7.0.1 @astrojs/markdown-remark@^7.3.2 remark-gfm@^4.0.1 react@^19.3.0 react-dom@^19.3.0
npm install -D @astrojs/check@^0.9.10 typescript@^6.0.3 @types/react@^19 @types/react-dom@^19 @types/node@^22 vitest@^5.0.4 @playwright/test@^1.64.0
npx playwright install chromium
```

Expected: 설치가 끝난다. `undici`의 EBADENGINE 경고(Node 22.19 이상 권장)는 무시해도 된다. 빌드에는 영향이 없다.

- [ ] **Step 3: 설정 파일 만들기**

`astro.config.mjs`:

```js
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
```

`tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"],
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "react"
  }
}
```

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    environment: 'node',
  },
});
```

`playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

const PORT = 4329;
const BASE_URL = `http://localhost:${PORT}/DomainDocs/`;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: BASE_URL, trace: 'retain-on-failure' },
  webServer: {
    // 테스트 전용 글로 빌드한 뒤 base 경로 아래에서만 응답하는 서버를 띄운다.
    command: `npm run build && node scripts/serve-dist.mjs ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 300_000,
    env: { ...(process.env as Record<string, string>), DOCS_CONTENT_DIR: './tests/fixtures/docs' },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    {
      name: 'mobile',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 360, height: 740 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 3,
      },
    },
  ],
});
```

`.gitignore`:

```text
node_modules/
dist/
.astro/
test-results/
playwright-report/
.playwright-mcp/
.vitest/
screenshots/
```

`.gitattributes`:

```text
* text=auto eol=lf
*.png binary
*.woff2 binary
```

`src/content/docs/.gitkeep`: 빈 파일.

- [ ] **Step 4: base 경로 정적 서버 만들기**

`scripts/serve-dist.mjs`:

```js
// 빌드 결과(dist/)를 base 경로 아래에서만 서빙하는 테스트용 정적 서버.
// GitHub Pages처럼 동작한다: base 밖은 404, 디렉터리는 끝에 /를 붙여 리다이렉트, 없는 경로는 404.html.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const port = Number(process.argv[2] ?? 4329);
const base = (process.env.BASE_PATH ?? '/DomainDocs').replace(/\/+$/, '');
const root = join(process.cwd(), 'dist');
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.wasm': 'application/wasm',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
};

async function statOrNull(path) {
  try {
    return await stat(path);
  } catch {
    return null;
  }
}

createServer(async (req, res) => {
  const { pathname } = new URL(req.url ?? '/', 'http://localhost');
  if (pathname === base) {
    res.writeHead(301, { Location: `${base}/` }).end();
    return;
  }
  if (!pathname.startsWith(`${base}/`)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('base 경로 밖이에요');
    return;
  }
  const rel = decodeURIComponent(pathname.slice(base.length + 1));
  let file = normalize(join(root, rel));
  if (!file.startsWith(root)) {
    res.writeHead(403).end();
    return;
  }
  let status = 200;
  const info = await statOrNull(file);
  if (info?.isDirectory()) {
    if (!pathname.endsWith('/')) {
      res.writeHead(301, { Location: `${pathname}/` }).end();
      return;
    }
    file = join(file, 'index.html');
  }
  if (!(await statOrNull(file))?.isFile()) {
    file = join(root, '404.html');
    status = 404;
    if (!(await statOrNull(file))?.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('없는 페이지예요');
      return;
    }
  }
  res.writeHead(status, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
  res.end(await readFile(file));
}).listen(port, () => {
  console.log(`dist를 http://localhost:${port}${base}/ 에서 서빙해요`);
});
```

- [ ] **Step 5: paths 단위 테스트 쓰기(실패 확인용)**

`tests/unit/paths.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { joinBase } from '../../src/lib/paths';

describe('joinBase', () => {
  it('base 뒤에 경로를 붙인다', () => {
    expect(joinBase('/DomainDocs', 'foundations/percentiles/')).toBe('/DomainDocs/foundations/percentiles/');
  });
  it('경로가 없으면 base 루트(끝에 /)를 돌려준다', () => {
    expect(joinBase('/DomainDocs')).toBe('/DomainDocs/');
    expect(joinBase('/DomainDocs/', '')).toBe('/DomainDocs/');
  });
  it('base와 경로의 중복 슬래시를 합친다', () => {
    expect(joinBase('/DomainDocs/', '/foundations/')).toBe('/DomainDocs/foundations/');
  });
  it('base가 루트(/)여도 동작한다', () => {
    expect(joinBase('/', 'foundations/')).toBe('/foundations/');
    expect(joinBase('/')).toBe('/');
  });
});
```

- [ ] **Step 6: 테스트가 실패하는지 확인**

Run: `npx vitest run tests/unit/paths.test.ts`
Expected: FAIL. `../../src/lib/paths`를 찾을 수 없다는 오류가 난다.

- [ ] **Step 7: paths 구현**

`src/lib/paths.ts`:

```ts
/** base와 경로를 슬래시 하나로 이어 붙인다. 경로가 비면 base 루트(끝에 /)를 돌려준다. */
export function joinBase(base: string, path = ''): string {
  const b = base.replace(/\/+$/, '');
  const p = path.replace(/^\/+/, '');
  return p ? `${b}/${p}` : `${b}/`;
}

/** 사이트 내부 URL. 모든 내부 링크는 이 함수를 거친다. */
export function withBase(path = ''): string {
  return joinBase(import.meta.env.BASE_URL, path);
}

export function docPath(id: string): string {
  return withBase(`${id}/`);
}

export function domainPath(domain: string): string {
  return withBase(`${domain}/`);
}
```

- [ ] **Step 8: 단위 테스트 통과 확인**

Run: `npx vitest run tests/unit/paths.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 9: 임시 홈과 스모크 E2E 쓰기**

`src/pages/index.astro`(Task 6에서 교체):

```astro
---
---
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>DomainDocs</title>
  </head>
  <body>
    <h1>DomainDocs</h1>
  </body>
</html>
```

`tests/e2e/smoke.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('홈이 base 경로 아래에서 열린다', async ({ page }) => {
  const res = await page.goto('./');
  expect(res?.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
});

test('base 밖의 경로는 404다', async ({ request }) => {
  const res = await request.get('/');
  expect(res.status()).toBe(404);
});
```

- [ ] **Step 10: 빌드·타입 검사·E2E 실행**

Run: `npm run build`
Expected: `dist/index.html`이 생기고 "Complete!"가 나온다. `src/content/docs`가 비어 있다는 경고는 아직 컬렉션이 없으므로 나오지 않는다.

Run: `npm run check`
Expected: `0 errors`.

Run: `npm run test:e2e`
Expected: PASS (2 tests × 2 projects = 4).

- [ ] **Step 11: 커밋**

```bash
git add -A
git commit -m "feat: Astro 7 프로젝트 골격과 테스트 도구 구성

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: MDX 분석 라이브러리

글 검사기(Task 3)와 사이트(읽는 시간·미리보기 시트, Task 5·7)가 함께 쓰는 순수 TypeScript 모듈이다. 사전 실험에서 검증한 코드를 바탕으로 한다.

**Files:**
- Create: `src/lib/mdx/parse.ts`, `src/lib/mdx/prose.ts`, `src/lib/mdx/analyze.ts`
- Test: `tests/unit/mdx/parse.test.ts`, `tests/unit/mdx/prose.test.ts`, `tests/unit/mdx/analyze.test.ts`

**Interfaces:**
- Produces (`src/lib/mdx/parse.ts`):
  - `parseMdx(source: string): Root`: CRLF를 LF로 바꾼 뒤 파싱한다. 잘못된 MDX면 `VFileMessage`(`.line`, `.column`, `.reason`)를 던진다.
  - `parseErrorLocation(e: { line?: number; column?: number; reason?: string }): { line: number; column: number }`
  - `readFrontmatter(tree: Root): Record<string, unknown> | null`
  - `type JsxElement = MdxJsxFlowElement | MdxJsxTextElement`
  - `jsxAttrs(el: JsxElement): Record<string, string | true | { expression: string }>`
  - `jsxOnlyParagraph(p: Paragraph): MdxJsxTextElement[] | null`: 한 줄짜리 `<Check>…</Check>`처럼 JSX만 있는 단락이면 그 요소들을 돌려준다.
  - `componentChildren(parent: Root | MdxJsxFlowElement): JsxElement[]`
- Produces (`src/lib/mdx/prose.ts`):
  - `interface ProseUnit { text: string; masked: string; pieces: Piece[]; line: number; ancestors: string[] }`: 단락 하나다. `ancestors`는 바깥 JSX 요소 이름 목록이다(예: `['KeyPoints', 'Point']`).
  - `interface Sentence { text: string; masked: string; length: number; line: number; column: number }`
  - `CODE_MASK: string`(U+E000), `extractProse(tree: Root): ProseUnit[]`, `splitSentenceSpans(text: string): Array<[number, number]>`, `sentencesOf(unit: ProseUnit): Sentence[]`
  - `FORMAL_ENDING: RegExp`, `findBanned(s: Sentence, banned: readonly string[]): string[]`
- Produces (`src/lib/mdx/analyze.ts`):
  - `CHARS_PER_MINUTE = 500`
  - `proseChars(tree: Root, opts: { excludeDeeper: boolean }): number`
  - `extractTermSlugs(tree: Root): string[]`(등장 순서, 중복 제거), `extractPointTitles(tree: Root): string[]`
  - `interface BodyAnalysis { readingMinutes: number; termSlugs: string[]; pointTitles: string[] }`, `analyzeBody(body: string): BodyAnalysis`

- [ ] **Step 1: 의존성 설치**

```bash
npm install unified@^11.0.5 remark-parse@^11.0.0 remark-mdx@^3.1.1 remark-frontmatter@^5.0.0 unist-util-visit@^5.1.0 unist-util-visit-parents@^6.0.2 yaml@^2.9.1 mdast-util-mdx@^3.0.0
npm install -D @types/mdast@^4.0.4 tsx@^4.23.15
```

사이트 빌드(읽는 시간 계산)에도 쓰므로 런타임 의존성으로 설치한다.

- [ ] **Step 2: 실패하는 테스트 쓰기**

`tests/unit/mdx/parse.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { componentChildren, jsxAttrs, parseErrorLocation, parseMdx, readFrontmatter } from '../../../src/lib/mdx/parse';

const SAMPLE = `---
title: 평균과 백분위수
order: 1
related: [foundations/counters-and-rate]
updated: 2026-10-13
---
import PercentileDemo from '../../../components/demos/PercentileDemo.tsx';

<OnDashboard title="응답시간">
  <MiniLineChart series={[1, 2, 3]} ariaLabel="그래프" />
</OnDashboard>

<KeyPoints>
  <Point title="첫 번째">본문이에요.</Point>
  <Point title="두 번째">본문이에요.</Point>
</KeyPoints>

<PercentileDemo client:visible />

<Checkpoints>
  <Check>한 줄짜리 확인 문장이에요.</Check>
</Checkpoints>
`;

describe('parseMdx', () => {
  it('최상위 컴포넌트를 순서대로 찾는다', () => {
    const names = componentChildren(parseMdx(SAMPLE)).map((el) => el.name);
    expect(names).toEqual(['OnDashboard', 'KeyPoints', 'PercentileDemo', 'Checkpoints']);
  });

  it('한 줄짜리 자식 컴포넌트도 자식으로 센다', () => {
    const tree = parseMdx(SAMPLE);
    const checkpoints = componentChildren(tree).find((el) => el.name === 'Checkpoints');
    expect(checkpoints?.type).toBe('mdxJsxFlowElement');
    if (checkpoints?.type !== 'mdxJsxFlowElement') return;
    expect(componentChildren(checkpoints).map((el) => el.name)).toEqual(['Check']);
  });

  it('속성을 문자열·표현식·불리언으로 읽는다', () => {
    const tree = parseMdx(SAMPLE);
    const onDashboard = componentChildren(tree)[0];
    expect(jsxAttrs(onDashboard)).toEqual({ title: '응답시간' });
    if (onDashboard.type !== 'mdxJsxFlowElement') return;
    expect(jsxAttrs(componentChildren(onDashboard)[0])).toEqual({ series: { expression: '[1, 2, 3]' }, ariaLabel: '그래프' });
    const demo = componentChildren(tree)[2];
    expect(jsxAttrs(demo)).toEqual({ 'client:visible': true });
  });

  it('YAML 날짜는 문자열로, 목록은 배열로 읽는다', () => {
    expect(readFrontmatter(parseMdx(SAMPLE))).toEqual({
      title: '평균과 백분위수',
      order: 1,
      related: ['foundations/counters-and-rate'],
      updated: '2026-10-13',
    });
  });

  it('CRLF 줄바꿈도 같은 결과를 낸다', () => {
    const crlf = SAMPLE.replace(/\n/g, '\r\n');
    expect(componentChildren(parseMdx(crlf)).map((el) => el.name)).toEqual(['OnDashboard', 'KeyPoints', 'PercentileDemo', 'Checkpoints']);
  });

  it('닫히지 않은 태그는 위치와 함께 오류를 던진다', () => {
    let caught: unknown;
    try {
      parseMdx('<KeyPoints>\n  <Point title="x">본문이에요.\n');
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeDefined();
    const loc = parseErrorLocation(caught as { line?: number; column?: number; reason?: string });
    expect(loc.line).toBeGreaterThanOrEqual(1);
  });
});
```

`tests/unit/mdx/prose.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { parseMdx } from '../../../src/lib/mdx/parse';
import { extractProse, FORMAL_ENDING, findBanned, sentencesOf, splitSentenceSpans } from '../../../src/lib/mdx/prose';

const split = (text: string) => splitSentenceSpans(text).map(([s, e]) => text.slice(s, e));
const sentences = (mdx: string) => extractProse(parseMdx(mdx)).flatMap((u) => sentencesOf(u).map((s) => s.text));

describe('splitSentenceSpans', () => {
  it('소수점과 Node.js에서 나누지 않는다', () => {
    expect(split('요청 100개 중 98개가 0.1초이고 2개가 3초면 평균은 0.158초예요. Node.js에서는 그래요.')).toEqual([
      '요청 100개 중 98개가 0.1초이고 2개가 3초면 평균은 0.158초예요.',
      'Node.js에서는 그래요.',
    ]);
  });
  it('물음표와 느낌표에서 나눈다', () => {
    expect(split('끝났어요! 정말요? 네.')).toEqual(['끝났어요!', '정말요?', '네.']);
  });
  it('e.g. 같은 약어와 따옴표 안의 마침표에서 나누지 않는다', () => {
    expect(split('약어는 e.g. 같은 거예요.')).toEqual(['약어는 e.g. 같은 거예요.']);
    expect(split('그는 "그래요."라고 말했어요.')).toEqual(['그는 "그래요."라고 말했어요.']);
  });
  it('띄어쓰기 없이 붙은 문장도 나눈다', () => {
    expect(split('있어요.다음 문장이에요.')).toEqual(['있어요.', '다음 문장이에요.']);
  });
});

describe('extractProse', () => {
  it('JSX 안 단락을 찾고 바깥 컴포넌트 이름을 기록한다', () => {
    const units = extractProse(parseMdx('<KeyPoints>\n  <Point title="제목">\n    첫 문장이에요. 둘째 문장이에요.\n  </Point>\n</KeyPoints>\n'));
    expect(units).toHaveLength(1);
    expect(units[0].ancestors).toEqual(['KeyPoints', 'Point']);
    expect(sentencesOf(units[0]).map((s) => s.text)).toEqual(['첫 문장이에요.', '둘째 문장이에요.']);
  });
  it('한 줄짜리 컴포넌트의 글도 그 컴포넌트를 조상으로 갖는다', () => {
    const units = extractProse(parseMdx('<Checkpoints>\n  <Check>확인해요.</Check>\n</Checkpoints>\n'));
    expect(units.map((u) => [u.text, u.ancestors])).toEqual([['확인해요.', ['Checkpoints', 'Check']]]);
  });
  it('제목·표·코드 블록·속성값은 문장으로 세지 않는다', () => {
    const mdx = [
      '<Deeper>',
      '  ## 계산 방법',
      '',
      '  | 구분 | 값 |',
      '  | --- | --- |',
      '  | p50 | 0.1초 |',
      '',
      '  ```text',
      '  p99 = sorted[ceil(0.99 * n) - 1]',
      '  ```',
      '',
      '  설명 문장이에요.',
      '</Deeper>',
      '',
      '<OnDashboard title="이 제목은 세지 않아요" caption="이 설명도 세지 않아요">',
      '</OnDashboard>',
    ].join('\n');
    expect(sentences(mdx)).toEqual(['설명 문장이에요.']);
  });
  it('물결표 범위는 취소선이 아니라 글자 그대로 남는다', () => {
    expect(sentences('응답은 1~2초 또는 3~4초예요.\n')).toEqual(['응답은 1~2초 또는 3~4초예요.']);
  });
  it('인라인 코드는 길이에 포함하지만 문장 분리와 끝맺음 검사에서는 가린다', () => {
    const [unit] = extractProse(parseMdx('`Node.js 습니다.` 명령은 짧아요.\n'));
    const [s] = sentencesOf(unit);
    expect(s.text).toBe('`Node.js 습니다.` 명령은 짧아요.'.replace(/`/g, ''));
    expect(s.length).toBe([...'Node.js 습니다. 명령은 짧아요.'].length);
    expect(FORMAL_ENDING.test(s.masked)).toBe(false);
  });
  it('링크와 Term의 보이는 글자를 문장에 포함한다', () => {
    expect(sentences('<Term slug="foundations/beta">rate</Term>도 함께 봐요.\n')).toEqual(['rate도 함께 봐요.']);
  });
});

describe('FORMAL_ENDING', () => {
  it.each(['끝냅니다.', '그렇습니다', '좋습니다!', '합니다?', '그렇습니다."'])('%s는 합쇼체로 잡는다', (s) => {
    expect(FORMAL_ENDING.test(s)).toBe(true);
  });
  it.each(['예요.', '해요.', '그렇습니다만 아니에요.', '"합니다"라고 해요.'])('%s는 잡지 않는다', (s) => {
    expect(FORMAL_ENDING.test(s)).toBe(false);
  });
});

describe('findBanned', () => {
  it('가려진 텍스트에서 금지 표현을 찾는다', () => {
    const [unit] = extractProse(parseMdx('이 계산이 맞다고 주장하지 않아요.\n'));
    expect(findBanned(sentencesOf(unit)[0], ['주장하지 않', '단정하지 않'])).toEqual(['주장하지 않']);
  });
});
```

`tests/unit/mdx/analyze.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { parseMdx } from '../../../src/lib/mdx/parse';
import { analyzeBody, extractPointTitles, extractTermSlugs, proseChars } from '../../../src/lib/mdx/analyze';

const BODY = [
  '<KeyPoints>',
  '  <Point title="평균은 느린 요청을 숨겨요">',
  '    가나다라마바사예요. <Term slug="foundations/beta">베타</Term>와 <Term slug="foundations/beta">베타</Term>를 봐요.',
  '  </Point>',
  '  <Point title="두 번째 핵심">',
  '    <Term slug="foundations/gamma">감마</Term>도 있어요.',
  '  </Point>',
  '</KeyPoints>',
  '',
  '<Deeper>',
  '  더 깊은 설명은 읽는 시간에서 빠져요.',
  '</Deeper>',
].join('\n');

describe('analyze', () => {
  it('Term slug를 등장 순서대로 중복 없이 모은다', () => {
    expect(extractTermSlugs(parseMdx(BODY))).toEqual(['foundations/beta', 'foundations/gamma']);
  });
  it('KeyPoints 안 Point 제목을 모은다', () => {
    expect(extractPointTitles(parseMdx(BODY))).toEqual(['평균은 느린 요청을 숨겨요', '두 번째 핵심']);
  });
  it('Deeper를 뺀 글자 수를 센다', () => {
    const tree = parseMdx(BODY);
    const withDeeper = proseChars(tree, { excludeDeeper: false });
    const withoutDeeper = proseChars(tree, { excludeDeeper: true });
    expect(withDeeper - withoutDeeper).toBe([...'더 깊은 설명은 읽는 시간에서 빠져요.'].length);
  });
  it('읽는 시간은 500자당 1분, 최소 1분이다', () => {
    expect(analyzeBody(BODY).readingMinutes).toBe(1);
    const long = `${'가나다라마바사아자차카타파하 문장이에요. '.repeat(3)}\n\n`.repeat(20);
    expect(analyzeBody(long).readingMinutes).toBe(Math.ceil(proseChars(parseMdx(long), { excludeDeeper: true }) / 500));
    expect(analyzeBody(long).readingMinutes).toBeGreaterThan(1);
  });
});
```

- [ ] **Step 3: 테스트가 실패하는지 확인**

Run: `npx vitest run tests/unit/mdx`
Expected: FAIL. `src/lib/mdx/parse` 등을 찾을 수 없다는 오류가 난다.

- [ ] **Step 4: parse.ts 구현**

`src/lib/mdx/parse.ts`:

```ts
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import { parse as parseYaml } from 'yaml';
import type { Paragraph, PhrasingContent, Root, RootContent, Yaml } from 'mdast';
import type { MdxJsxAttribute, MdxJsxFlowElement, MdxJsxTextElement } from 'mdast-util-mdx';

// astro.config.mjs와 같은 해석: GFM 표는 켜고, 물결표 하나짜리 취소선은 끈다.
const processor = unified()
  .use(remarkParse)
  .use(remarkFrontmatter, ['yaml'])
  .use(remarkGfm, { singleTilde: false })
  .use(remarkMdx);

/** 잘못된 MDX면 VFileMessage(.line, .column, .reason)를 던진다. */
export function parseMdx(source: string): Root {
  return processor.parse(source.replace(/\r\n?/g, '\n')) as Root;
}

/** 파일 끝에서 닫히지 않은 태그는 line이 비어 있어 reason의 "(줄:칸" 표기에서 위치를 읽는다. */
export function parseErrorLocation(e: { line?: number; column?: number; reason?: string }): { line: number; column: number } {
  if (e.line != null) return { line: e.line, column: e.column ?? 1 };
  const m = /\((\d+):(\d+)/.exec(e.reason ?? '');
  return m ? { line: Number(m[1]), column: Number(m[2]) } : { line: 1, column: 1 };
}

export function readFrontmatter(tree: Root): Record<string, unknown> | null {
  const node = tree.children.find((n): n is Yaml => n.type === 'yaml');
  if (!node) return null;
  const data: unknown = parseYaml(node.value);
  return data && typeof data === 'object' ? (data as Record<string, unknown>) : null;
}

export type JsxElement = MdxJsxFlowElement | MdxJsxTextElement;

export function jsxAttrs(el: JsxElement): Record<string, string | true | { expression: string }> {
  const out: Record<string, string | true | { expression: string }> = {};
  for (const a of el.attributes) {
    if (a.type !== 'mdxJsxAttribute') continue;
    const attr = a as MdxJsxAttribute;
    if (attr.value == null) out[attr.name] = true;
    else if (typeof attr.value === 'string') out[attr.name] = attr.value;
    else out[attr.name] = { expression: attr.value.value };
  }
  return out;
}

const isBlankText = (n: PhrasingContent) => n.type === 'text' && n.value.trim() === '';

/** `<Check>…</Check>`처럼 한 줄에 JSX만 있는 단락이면 그 요소들을 돌려준다. */
export function jsxOnlyParagraph(p: Paragraph): MdxJsxTextElement[] | null {
  const meaningful = p.children.filter((c) => !isBlankText(c));
  return meaningful.length > 0 && meaningful.every((c) => c.type === 'mdxJsxTextElement')
    ? (meaningful as MdxJsxTextElement[])
    : null;
}

/** 자식 컴포넌트를 순서대로 돌려준다. 한 줄짜리 컴포넌트 단락은 풀어서 센다. */
export function componentChildren(parent: Root | MdxJsxFlowElement): JsxElement[] {
  const out: JsxElement[] = [];
  for (const c of parent.children as RootContent[]) {
    if (c.type === 'mdxJsxFlowElement') out.push(c);
    else if (c.type === 'paragraph') out.push(...(jsxOnlyParagraph(c) ?? []));
  }
  return out;
}
```

- [ ] **Step 5: prose.ts 구현**

`src/lib/mdx/prose.ts`:

```ts
import type { Paragraph, PhrasingContent, Root } from 'mdast';
import { visitParents } from 'unist-util-visit-parents';
import { jsxOnlyParagraph } from './parse';

/** 인라인 코드 글자를 한 글자씩 덮는 사용 영역 문자. 길이를 바꾸지 않고 분리·끝맺음 검사에서 코드를 숨긴다. */
export const CODE_MASK = String.fromCharCode(0xe000);

interface Piece {
  offset: number;
  text: string;
  line: number;
  column: number;
}

export interface ProseUnit {
  /** 보이는 글자(인라인 코드 포함). 길이 계산용 */
  text: string;
  /** 인라인 코드를 CODE_MASK로 덮은 글자. 문장 분리·끝맺음·금지 표현 검사용 */
  masked: string;
  pieces: Piece[];
  line: number;
  /** 바깥 JSX 요소 이름(바깥 → 안쪽 순서) */
  ancestors: string[];
}

function collectInline(nodes: PhrasingContent[], unit: ProseUnit): void {
  for (const n of nodes) {
    switch (n.type) {
      case 'text':
      case 'inlineCode': {
        const p = n.position!.start;
        unit.pieces.push({ offset: unit.text.length, text: n.value, line: p.line, column: p.column });
        unit.text += n.value;
        unit.masked += n.type === 'text' ? n.value : CODE_MASK.repeat(n.value.length);
        break;
      }
      case 'break':
        unit.text += '\n';
        unit.masked += '\n';
        break;
      case 'link':
      case 'linkReference':
      case 'emphasis':
      case 'strong':
      case 'delete':
      case 'mdxJsxTextElement':
        collectInline(n.children as PhrasingContent[], unit);
        break;
      default:
        // image, mdxTextExpression, html, footnoteReference는 문장이 아니다.
        break;
    }
  }
}

function makeUnit(children: PhrasingContent[], line: number, ancestors: string[]): ProseUnit {
  const unit: ProseUnit = { text: '', masked: '', pieces: [], line, ancestors };
  collectInline(children, unit);
  return unit;
}

function jsxNames(nodes: readonly unknown[]): string[] {
  return nodes.flatMap((n) => {
    const node = n as { type?: string; name?: string | null };
    return (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') && node.name ? [node.name] : [];
  });
}

/** 모든 단락(JSX 안 포함)을 찾는다. 제목·표·코드 블록·속성값은 단락이 아니므로 빠진다. */
export function extractProse(tree: Root): ProseUnit[] {
  const units: ProseUnit[] = [];
  visitParents(tree, 'paragraph', (p: Paragraph, parents) => {
    const ancestors = jsxNames(parents);
    const els = jsxOnlyParagraph(p);
    if (els) {
      for (const el of els) {
        units.push(makeUnit(el.children as PhrasingContent[], el.position!.start.line, [...ancestors, ...(el.name ? [el.name] : [])]));
      }
    } else {
      units.push(makeUnit(p.children, p.position!.start.line, ancestors));
    }
  });
  return units.filter((u) => u.text.trim() !== '');
}

const ABBREV = /(?:^|[\s(])(?:e\.g|i\.e|etc|vs|cf|approx)\.$/i;
const SENT_END = /[.?!]+["'”’」』)\]]*(?=\s|$)|(?<=[가-힣])[.?!]+(?=[가-힣])/g;

/** 문장 범위 [시작, 끝)을 돌려준다. masked 텍스트에 쓴다. */
export function splitSentenceSpans(text: string): Array<[number, number]> {
  const spans: Array<[number, number]> = [];
  let start = 0;
  const push = (s: number, e: number) => {
    while (s < e && /\s/.test(text[s])) s++;
    while (e > s && /\s/.test(text[e - 1])) e--;
    if (e > s) spans.push([s, e]);
  };
  for (const m of text.matchAll(SENT_END)) {
    const end = m.index + m[0].length;
    if (ABBREV.test(text.slice(start, end))) continue;
    if (/^\.{2,}$|^…/.test(m[0]) && end < text.length) continue;
    push(start, end);
    start = end;
  }
  push(start, text.length);
  return spans;
}

export interface Sentence {
  text: string;
  masked: string;
  length: number;
  line: number;
  /** 0이면 알 수 없음(여러 줄 단락의 둘째 줄 이후) */
  column: number;
}

export function sentencesOf(unit: ProseUnit): Sentence[] {
  return splitSentenceSpans(unit.masked).map(([s, e]) => {
    const piece = [...unit.pieces].reverse().find((p) => p.offset <= s) ?? unit.pieces[0];
    const before = piece ? piece.text.slice(0, s - piece.offset) : '';
    const nl = before.split('\n').length - 1;
    const text = unit.text.slice(s, e).replace(/\s+/g, ' ').normalize('NFC');
    return {
      text,
      masked: unit.masked.slice(s, e),
      length: [...text].length,
      line: (piece?.line ?? unit.line) + nl,
      column: piece && nl === 0 ? piece.column + before.length : 0,
    };
  });
}

/** 합쇼체 끝맺음("~니다.", "~니다?", "~니다\"")을 찾는다. masked 문장에 쓴다. */
export const FORMAL_ENDING = /니다[.?!…~]*["'”’」』)\]]*$/u;

export function findBanned(s: Sentence, banned: readonly string[]): string[] {
  return banned.filter((b) => s.masked.includes(b));
}
```

- [ ] **Step 6: analyze.ts 구현**

`src/lib/mdx/analyze.ts`:

```ts
import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';
import { componentChildren, jsxAttrs, parseMdx, type JsxElement } from './parse';
import { extractProse, sentencesOf } from './prose';

export const CHARS_PER_MINUTE = 500;

export function proseChars(tree: Root, opts: { excludeDeeper: boolean }): number {
  return extractProse(tree)
    .filter((u) => !(opts.excludeDeeper && u.ancestors.includes('Deeper')))
    .flatMap((u) => sentencesOf(u))
    .reduce((sum, s) => sum + s.length, 0);
}

function isJsx(node: { type: string }): node is JsxElement {
  return node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement';
}

export function extractTermSlugs(tree: Root): string[] {
  const slugs: string[] = [];
  visit(tree, (node) => {
    if (!isJsx(node) || node.name !== 'Term') return;
    const slug = jsxAttrs(node).slug;
    if (typeof slug === 'string' && !slugs.includes(slug)) slugs.push(slug);
  });
  return slugs;
}

export function extractPointTitles(tree: Root): string[] {
  const keyPoints = componentChildren(tree).find((el) => el.name === 'KeyPoints');
  if (!keyPoints || keyPoints.type !== 'mdxJsxFlowElement') return [];
  return componentChildren(keyPoints)
    .filter((el) => el.name === 'Point')
    .map((el) => jsxAttrs(el).title)
    .filter((t): t is string => typeof t === 'string');
}

export interface BodyAnalysis {
  readingMinutes: number;
  termSlugs: string[];
  pointTitles: string[];
}

export function analyzeBody(body: string): BodyAnalysis {
  const tree = parseMdx(body);
  return {
    readingMinutes: Math.max(1, Math.ceil(proseChars(tree, { excludeDeeper: true }) / CHARS_PER_MINUTE)),
    termSlugs: extractTermSlugs(tree),
    pointTitles: extractPointTitles(tree),
  };
}
```

- [ ] **Step 7: 테스트 통과 확인**

Run: `npx vitest run tests/unit/mdx`
Expected: PASS(모두). 실패하면 사전 실험 결과(위 동작)와 비교해 구현을 고친다. 테스트 기대값은 바꾸지 않는다.

Run: `npm run check`
Expected: `0 errors`.

- [ ] **Step 8: 커밋**

```bash
git add -A
git commit -m "feat: 글 검사와 읽는 시간 계산에 쓸 MDX 분석 모듈 추가

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: 글 검사기, 글쓰기 가이드, CLAUDE.md

**Files:**
- Create: `scripts/lint-content/config.ts`, `scripts/lint-content/rules.ts`, `scripts/lint-content/index.ts`, `docs/writing-guide.md`, `CLAUDE.md`, `tests/fixtures/lint/good/foundations/sample.mdx`, `tests/fixtures/lint/bad/foundations/sample.mdx`
- Modify: `package.json`(scripts)
- Test: `tests/unit/lint/rules.test.ts`, `tests/unit/lint/cli.test.ts`

**Interfaces:**
- Consumes: Task 2의 `parseMdx`, `parseErrorLocation`, `readFrontmatter`, `jsxAttrs`, `jsxOnlyParagraph`, `componentChildren`, `extractProse`, `sentencesOf`, `FORMAL_ENDING`, `findBanned`, `proseChars`
- Produces:
  - `type RuleId = 'parse' | 'frontmatter' | 'domain-folder' | 'structure' | 'block-children' | 'block-title' | 'sentence-length' | 'paragraph-length' | 'formal-ending' | 'banned-phrase' | 'body-length' | 'reference' | 'markdown-link'`
  - `interface LintIssue { file: string; line: number; column: number; rule: RuleId; message: string }`
  - `interface SourceFile { file: string; id: string; source: string }`: `id`는 `foundations/percentiles` 형식
  - `interface DocMeta { id: string; type: 'concept' | 'guide' | null; draft: boolean }`
  - `interface LintContext { docs: Map<string, DocMeta> }`
  - `collectMeta(src: SourceFile): DocMeta | null`, `lintSource(src: SourceFile, ctx: LintContext): LintIssue[]`
  - `LINT_CONFIG`(기준값), npm 스크립트 `lint:content`. `build`는 `npm run lint:content && astro build`가 된다.
  - CLI는 `DOCS_CONTENT_DIR`(기본 `src/content/docs`) 아래 `**/*.mdx`를 검사한다. 위반이 있으면 종료 코드 1이다.

- [ ] **Step 1: 실패하는 규칙 테스트 쓰기**

`tests/unit/lint/rules.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { lintSource, type DocMeta, type LintContext, type RuleId } from '../../../scripts/lint-content/rules';

const FRONT = (extra = '', type = 'concept', domain = 'foundations') => `---
title: 테스트 글
summary: 검사 규칙을 확인하려고 만든 글이에요.
domain: ${domain}
type: ${type}
order: 1
sources:
  - title: 예시 출처
    url: https://example.com/
updated: 2026-10-13
${extra}---
`;

const CONCEPT_BODY = `
<OnDashboard title="응답시간">
  <StatTile label="p99" value="1.2" unit="초" />
</OnDashboard>

<KeyPoints>
  <Point title="첫 번째 핵심">
    응답은 1~2초 사이예요. <Term slug="foundations/other">다른 개념</Term>과 함께 봐요.
  </Point>
</KeyPoints>

<Checkpoints>
  <Check>평균만 보고 있다면 다시 확인하세요.</Check>
</Checkpoints>
`;

const GUIDE_BODY = `
<Situation>
  두 화면의 숫자가 달라요.
</Situation>

<FirstLook>
  <Item title="집계 구간">한 점이 몇 초인지 봐요.</Item>
</FirstLook>

## 1. 구간을 맞춰 보세요

<Term slug="foundations/other">다른 개념</Term>을 떠올려요.

<Checkpoints>
  <Check>계산식이 다르다면 문서로 남기세요.</Check>
</Checkpoints>
`;

const DOCS: DocMeta[] = [
  { id: 'foundations/test', type: 'concept', draft: false },
  { id: 'foundations/other', type: 'concept', draft: false },
  { id: 'foundations/secret', type: 'concept', draft: true },
];
const ctx: LintContext = { docs: new Map(DOCS.map((d) => [d.id, d])) };
const lint = (source: string, id = 'foundations/test') => lintSource({ file: `${id}.mdx`, id, source }, ctx);
const rules = (source: string, id?: string): RuleId[] => lint(source, id).map((i) => i.rule);

describe('통과 사례', () => {
  it('올바른 개념 글은 위반이 없다', () => {
    expect(lint(FRONT() + CONCEPT_BODY)).toEqual([]);
  });
  it('올바른 가이드 글은 위반이 없다', () => {
    expect(lint(FRONT('', 'guide') + GUIDE_BODY)).toEqual([]);
  });
  it('CRLF 줄바꿈도 위반이 없다', () => {
    expect(lint((FRONT() + CONCEPT_BODY).replace(/\n/g, '\r\n'))).toEqual([]);
  });
  it('import한 데모는 최상위 어디에 둬도 된다', () => {
    const body = CONCEPT_BODY.replace('<Checkpoints>', "<PercentileDemo client:visible />\n\n<Checkpoints>");
    expect(lint(`${FRONT()}import PercentileDemo from '../../../components/demos/PercentileDemo.tsx';\n${body}`)).toEqual([]);
  });
  it('Deeper 안에서는 금지 표현을 허용한다', () => {
    expect(lint(`${FRONT() + CONCEPT_BODY}\n<Deeper>\n  모든 버전을 보장하지 않아요.\n</Deeper>\n`)).toEqual([]);
  });
  it('초안 글은 초안을 가리켜도 된다', () => {
    const body = CONCEPT_BODY.replace('foundations/other', 'foundations/secret');
    expect(lint(FRONT('draft: true\n') + body)).toEqual([]);
  });
});

describe('문장 규칙', () => {
  it('합쇼체 끝맺음을 잡는다', () => {
    expect(rules(FRONT() + CONCEPT_BODY.replace('사이예요.', '사이입니다.'))).toEqual(['formal-ending']);
  });
  it('80자를 넘는 문장을 잡는다', () => {
    const long = `${'가'.repeat(80)}예요.`;
    expect(rules(FRONT() + CONCEPT_BODY.replace('응답은 1~2초 사이예요.', long))).toEqual(['sentence-length']);
  });
  it('한 단락에 문장이 4개면 잡는다', () => {
    const para = '하나예요. 둘이에요. 셋이에요. 넷이에요.';
    expect(rules(FRONT() + CONCEPT_BODY.replace('응답은 1~2초 사이예요.', para))).toEqual(['paragraph-length']);
  });
  it('본문의 금지 표현을 잡는다', () => {
    expect(rules(FRONT() + CONCEPT_BODY.replace('사이예요.', '사이라고 단정하지 않아요.'))).toEqual(['banned-phrase']);
  });
  it('개념 본문이 1,500자를 넘으면 잡는다', () => {
    // 문장 36자 × 3문장 × 15단락 = 1,620자
    const sentence = '가나다라마바사아자차카타파하 가나다라마바사아자차카타파하 문장이에요. ';
    const paras = Array.from({ length: 15 }, () => sentence.repeat(3).trim()).join('\n\n    ');
    expect(rules(FRONT() + CONCEPT_BODY.replace('응답은 1~2초 사이예요.', paras))).toContain('body-length');
  });
});

describe('틀 규칙', () => {
  it('Checkpoints가 없으면 잡는다', () => {
    const body = CONCEPT_BODY.replace(/<Checkpoints>[\s\S]*<\/Checkpoints>/, '');
    expect(rules(FRONT() + body)).toEqual(['structure']);
  });
  it('블록 순서가 틀리면 잡는다', () => {
    const onDashboard = CONCEPT_BODY.match(/<OnDashboard[\s\S]*?<\/OnDashboard>/)![0];
    const body = CONCEPT_BODY.replace(onDashboard, '').replace('<Checkpoints>', `${onDashboard}\n\n<Checkpoints>`);
    expect(rules(FRONT() + body)).toEqual(['structure']);
  });
  it('개념 글 최상위의 일반 단락과 소제목을 잡는다', () => {
    expect(rules(`${FRONT()}\n## 소제목\n\n그냥 단락이에요.\n${CONCEPT_BODY}`)).toEqual(['structure', 'structure']);
  });
  it('최상위에 둘 수 없는 컴포넌트를 잡는다', () => {
    expect(rules(`${FRONT()}${CONCEPT_BODY}\n<Point title="밖">밖이에요.</Point>\n`)).toEqual(['structure']);
  });
  it('Point가 4개면 잡는다', () => {
    const point = '  <Point title="추가">추가예요.</Point>\n';
    const body = CONCEPT_BODY.replace('</KeyPoints>', `${point}${point}${point}</KeyPoints>`);
    expect(rules(FRONT() + body)).toEqual(['block-children']);
  });
  it('KeyPoints 안의 맨 글자를 잡는다', () => {
    expect(rules(FRONT() + CONCEPT_BODY.replace('</KeyPoints>', '  맨 글자예요.\n</KeyPoints>'))).toEqual(['block-children']);
  });
  it('Point 제목이 없거나 30자를 넘으면 잡는다', () => {
    expect(rules(FRONT() + CONCEPT_BODY.replace(' title="첫 번째 핵심"', ''))).toEqual(['block-title']);
    expect(rules(FRONT() + CONCEPT_BODY.replace('첫 번째 핵심', '가'.repeat(31)))).toEqual(['block-title']);
  });
  it('가이드에 ## 소제목이 없으면 잡는다', () => {
    expect(rules(FRONT('', 'guide') + GUIDE_BODY.replace('## 1. 구간을 맞춰 보세요\n', ''))).toEqual(['structure']);
  });
  it('가이드에 KeyPoints를 쓰면 잡는다', () => {
    const body = GUIDE_BODY.replace('## 1.', '<KeyPoints>\n  <Point title="x">x예요.</Point>\n</KeyPoints>\n\n## 1.');
    expect(rules(FRONT('', 'guide') + body)).toEqual(['structure']);
  });
});

describe('머리말과 참조 규칙', () => {
  it('domain이 폴더와 다르면 잡는다', () => {
    expect(rules(FRONT('', 'concept', 'apm') + CONCEPT_BODY)).toEqual(['domain-folder']);
  });
  it('type이 잘못되면 잡는다', () => {
    expect(rules(FRONT('', 'essay') + CONCEPT_BODY)).toEqual(['frontmatter']);
  });
  it('없는 글을 가리키는 Term과 related를 잡는다', () => {
    expect(rules(FRONT() + CONCEPT_BODY.replace('foundations/other', 'foundations/nope'))).toEqual(['reference']);
    expect(rules(FRONT('related: [foundations/nope]\n') + CONCEPT_BODY)).toEqual(['reference']);
  });
  it('공개 글이 초안을 가리키면 잡는다', () => {
    expect(rules(FRONT() + CONCEPT_BODY.replace('foundations/other', 'foundations/secret'))).toEqual(['reference']);
  });
  it('마크다운 링크를 잡는다', () => {
    expect(rules(FRONT() + CONCEPT_BODY.replace('사이예요.', '사이예요. [문서](https://example.com)를 봐요.'))).toEqual(['markdown-link']);
  });
  it('MDX 문법 오류는 parse 위반 하나로 끝낸다', () => {
    const issues = lint(`${FRONT()}\n<KeyPoints>\n  <Point title="x">열린 채로 끝나요.\n`);
    expect(issues.map((i) => i.rule)).toEqual(['parse']);
    expect(issues[0].line).toBeGreaterThanOrEqual(1);
  });
});
```

`tests/unit/lint/cli.test.ts`:

```ts
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

function runLint(dir: string) {
  return spawnSync(process.execPath, ['--import', 'tsx', 'scripts/lint-content/index.ts'], {
    env: { ...process.env, DOCS_CONTENT_DIR: dir },
    encoding: 'utf8',
  });
}

describe('lint:content CLI', () => {
  it('올바른 글만 있으면 0으로 끝난다', () => {
    const res = runLint('tests/fixtures/lint/good');
    expect(res.stdout).toContain('위반 0건');
    expect(res.status).toBe(0);
  });
  it('위반이 있으면 파일:줄과 규칙 이름을 출력하고 1로 끝난다', () => {
    const res = runLint('tests/fixtures/lint/bad');
    expect(res.stdout).toMatch(/foundations[\\/]sample\.mdx:\d+:\d+ \[formal-ending\]/);
    expect(res.status).toBe(1);
  });
  it('폴더가 없으면 1로 끝난다', () => {
    expect(runLint('tests/fixtures/lint/missing').status).toBe(1);
  });
});
```

`tests/fixtures/lint/good/foundations/sample.mdx`:

```mdx
---
title: 검사기 통과 예시
summary: 검사기 CLI가 통과시키는 예시 글이에요.
domain: foundations
type: concept
order: 1
sources:
  - title: 예시 출처
    url: https://example.com/
updated: 2026-10-13
---

<OnDashboard title="응답시간">
  <StatTile label="p99" value="1.2" unit="초" />
</OnDashboard>

<KeyPoints>
  <Point title="핵심">
    짧고 분명한 문장이에요.
  </Point>
</KeyPoints>

<Checkpoints>
  <Check>평균만 보고 있다면 다시 확인하세요.</Check>
</Checkpoints>
```

`tests/fixtures/lint/bad/foundations/sample.mdx`: 위 파일과 같되, `짧고 분명한 문장이에요.`를 `짧고 분명한 문장입니다.`로 바꾼다.

- [ ] **Step 2: 테스트가 실패하는지 확인**

Run: `npx vitest run tests/unit/lint`
Expected: FAIL. `scripts/lint-content/rules`를 찾을 수 없다는 오류가 난다.

- [ ] **Step 3: config.ts 구현**

`scripts/lint-content/config.ts`:

```ts
/** 글 검사 기준값. 바꾸면 docs/writing-guide.md의 같은 값도 함께 고친다. */
export const LINT_CONFIG = {
  maxSentenceChars: 80,
  maxSentencesPerParagraph: 3,
  maxBodyChars: { concept: 1500, guide: 4000 },
  maxBlockTitleChars: 30,
  /** 본문(Deeper 밖)에 쓰지 않는 표현. 면책·메타 서술을 막는다. */
  bannedPhrases: ['주장하지 않', '단정하지 않', '보장하지 않', '일반화하지 않', '이 문서에서는', '이 장에서는'],
} as const;
```

- [ ] **Step 4: rules.ts 구현**

`scripts/lint-content/rules.ts`:

```ts
import type { Heading, Root, RootContent } from 'mdast';
import { visit } from 'unist-util-visit';
import {
  componentChildren,
  jsxAttrs,
  jsxOnlyParagraph,
  parseErrorLocation,
  parseMdx,
  readFrontmatter,
  type JsxElement,
} from '../../src/lib/mdx/parse';
import { extractProse, findBanned, FORMAL_ENDING, sentencesOf } from '../../src/lib/mdx/prose';
import { proseChars } from '../../src/lib/mdx/analyze';
import { LINT_CONFIG } from './config';

export type RuleId =
  | 'parse'
  | 'frontmatter'
  | 'domain-folder'
  | 'structure'
  | 'block-children'
  | 'block-title'
  | 'sentence-length'
  | 'paragraph-length'
  | 'formal-ending'
  | 'banned-phrase'
  | 'body-length'
  | 'reference'
  | 'markdown-link';

export interface LintIssue {
  file: string;
  line: number;
  column: number;
  rule: RuleId;
  message: string;
}

export interface SourceFile {
  file: string;
  /** foundations/percentiles 형식 */
  id: string;
  source: string;
}

export type DocType = 'concept' | 'guide';

export interface DocMeta {
  id: string;
  type: DocType | null;
  draft: boolean;
}

export interface LintContext {
  docs: Map<string, DocMeta>;
}

type Report = (rule: RuleId, line: number, column: number, message: string) => void;

const CONCEPT_BLOCKS = ['OnDashboard', 'KeyPoints', 'Checkpoints', 'Deeper'];
const GUIDE_BLOCKS = ['Situation', 'FirstLook', 'Checkpoints'];
const GUIDE_FREE_COMPONENTS = ['OnDashboard'];
const GUIDE_FREE_NODES = ['paragraph', 'heading', 'list', 'table', 'code', 'blockquote'];
const CHILD_RULES: Record<string, { child: string; min: number; max: number }> = {
  KeyPoints: { child: 'Point', min: 1, max: 3 },
  FirstLook: { child: 'Item', min: 1, max: 3 },
  Checkpoints: { child: 'Check', min: 1, max: Number.POSITIVE_INFINITY },
};
const TITLED = ['Point', 'Item'];

type TopItem =
  | { kind: 'component'; name: string; line: number }
  | { kind: 'node'; node: RootContent; line: number };

const lineOf = (node: { position?: { start: { line: number } } }) => node.position?.start.line ?? 1;
const columnOf = (node: { position?: { start: { column: number } } }) => node.position?.start.column ?? 1;
const preview = (text: string) => ([...text].length > 24 ? `${[...text].slice(0, 24).join('')}…` : text);

function topLevelItems(tree: Root): TopItem[] {
  const items: TopItem[] = [];
  for (const c of tree.children) {
    if (c.type === 'yaml' || c.type === 'mdxjsEsm') continue;
    if (c.type === 'mdxJsxFlowElement') {
      items.push({ kind: 'component', name: c.name ?? '', line: lineOf(c) });
      continue;
    }
    if (c.type === 'paragraph') {
      const els = jsxOnlyParagraph(c);
      if (els) {
        for (const el of els) items.push({ kind: 'component', name: el.name ?? '', line: lineOf(el) });
        continue;
      }
    }
    items.push({ kind: 'node', node: c, line: lineOf(c) });
  }
  return items;
}

/** MDX 안 default import 이름(데모 컴포넌트). */
function importedNames(tree: Root): Set<string> {
  const names = new Set<string>();
  for (const c of tree.children) {
    if (c.type !== 'mdxjsEsm') continue;
    for (const m of c.value.matchAll(/import\s+([A-Z]\w*)\s+from/g)) names.add(m[1]);
  }
  return names;
}

const NODE_LABEL: Record<string, string> = {
  paragraph: '일반 단락',
  heading: '소제목',
  list: '목록',
  table: '표',
  code: '코드 블록',
  blockquote: '인용',
  thematicBreak: '구분선',
};

function checkConceptStructure(items: TopItem[], demos: Set<string>, report: Report): void {
  for (const item of items) {
    if (item.kind === 'node') {
      const label = NODE_LABEL[item.node.type] ?? item.node.type;
      report('structure', item.line, 1, `개념 글 최상위에는 틀 블록과 데모만 둘 수 있어요. ${label}을(를) 블록 안으로 옮기세요.`);
    } else if (!CONCEPT_BLOCKS.includes(item.name) && !demos.has(item.name)) {
      report('structure', item.line, 1, `<${item.name}>은(는) 개념 글 최상위에 둘 수 없어요.`);
    }
  }
  const seq = items.flatMap((i) => (i.kind === 'component' && CONCEPT_BLOCKS.includes(i.name) ? [i.name] : []));
  const expected = seq.at(-1) === 'Deeper' ? CONCEPT_BLOCKS : CONCEPT_BLOCKS.slice(0, 3);
  if (seq.join() !== expected.join()) {
    const first = items.find((i) => i.kind === 'component');
    report(
      'structure',
      first?.line ?? 1,
      1,
      `개념 글 블록은 OnDashboard → KeyPoints → Checkpoints → (Deeper) 순서여야 해요. 현재: ${seq.join(' → ') || '없음'}`,
    );
  }
}

function checkGuideStructure(items: TopItem[], demos: Set<string>, report: Report): void {
  const nameAt = (i: number) => {
    const item = items.at(i);
    return item?.kind === 'component' ? item.name : null;
  };
  const seq = items.flatMap((i) => (i.kind === 'component' && GUIDE_BLOCKS.includes(i.name) ? [i.name] : []));
  if (nameAt(0) !== 'Situation' || nameAt(1) !== 'FirstLook' || nameAt(-1) !== 'Checkpoints' || seq.length !== 3) {
    report('structure', items[0]?.line ?? 1, 1, `가이드는 Situation → FirstLook → (단계별 설명) → Checkpoints 순서여야 해요. 현재 블록: ${seq.join(' → ') || '없음'}`);
    return;
  }
  const middle = items.slice(2, -1);
  for (const item of middle) {
    if (item.kind === 'component') {
      if (!GUIDE_FREE_COMPONENTS.includes(item.name) && !demos.has(item.name)) {
        report('structure', item.line, 1, `<${item.name}>은(는) 가이드 본문에 둘 수 없어요.`);
      }
    } else if (!GUIDE_FREE_NODES.includes(item.node.type)) {
      report('structure', item.line, 1, `가이드 본문에 ${NODE_LABEL[item.node.type] ?? item.node.type}을(를) 둘 수 없어요.`);
    } else if (item.node.type === 'heading' && (item.node as Heading).depth === 1) {
      report('structure', item.line, 1, '가이드 본문 소제목은 ##부터 써요. #은 페이지 제목에만 써요.');
    }
  }
  const hasStep = middle.some((i) => i.kind === 'node' && i.node.type === 'heading' && (i.node as Heading).depth === 2);
  if (!hasStep) report('structure', middle[0]?.line ?? items[1].line, 1, '가이드에는 단계별 설명(## 소제목)이 1개 이상 필요해요.');
}

function isJsx(node: { type: string }): node is JsxElement {
  return node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement';
}

function checkBlocks(tree: Root, report: Report): void {
  visit(tree, (node) => {
    if (!isJsx(node)) return;
    const name = node.name ?? '';
    const rule = CHILD_RULES[name];
    if (rule && node.type === 'mdxJsxFlowElement') {
      for (const c of node.children) {
        const ok =
          (c.type === 'mdxJsxFlowElement' && c.name === rule.child) ||
          (c.type === 'paragraph' && (jsxOnlyParagraph(c)?.every((x) => x.name === rule.child) ?? false));
        if (!ok) report('block-children', lineOf(c), columnOf(c), `<${name}> 안에는 <${rule.child}>만 둘 수 있어요.`);
      }
      const n = componentChildren(node).filter((x) => x.name === rule.child).length;
      if (n < rule.min || n > rule.max) {
        const range = Number.isFinite(rule.max) ? `${rule.min}~${rule.max}개` : `${rule.min}개 이상`;
        report('block-children', lineOf(node), columnOf(node), `<${name}> 안의 <${rule.child}>는 ${range}여야 해요. 현재 ${n}개예요.`);
      }
    }
    if (TITLED.includes(name)) {
      const title = jsxAttrs(node).title;
      if (typeof title !== 'string' || title.trim() === '') {
        report('block-title', lineOf(node), columnOf(node), `<${name}>에 title이 필요해요.`);
      } else if ([...title].length > LINT_CONFIG.maxBlockTitleChars) {
        report('block-title', lineOf(node), columnOf(node), `<${name}> 제목이 ${[...title].length}자예요 (최대 ${LINT_CONFIG.maxBlockTitleChars}자).`);
      }
    }
  });
}

function checkProse(tree: Root, report: Report): void {
  for (const unit of extractProse(tree)) {
    const sentences = sentencesOf(unit);
    if (sentences.length > LINT_CONFIG.maxSentencesPerParagraph) {
      report('paragraph-length', unit.line, 1, `한 단락에 문장이 ${sentences.length}개예요 (최대 ${LINT_CONFIG.maxSentencesPerParagraph}개). 단락을 나누세요.`);
    }
    for (const s of sentences) {
      const col = s.column || 1;
      if (s.length > LINT_CONFIG.maxSentenceChars) {
        report('sentence-length', s.line, col, `문장이 ${s.length}자예요 (최대 ${LINT_CONFIG.maxSentenceChars}자): "${preview(s.text)}"`);
      }
      if (FORMAL_ENDING.test(s.masked)) report('formal-ending', s.line, col, `해요체로 써 주세요: "${preview(s.text)}"`);
      if (unit.ancestors.includes('Deeper')) continue;
      for (const b of findBanned(s, LINT_CONFIG.bannedPhrases)) {
        report('banned-phrase', s.line, col, `본문에 쓰지 않는 표현이에요("${b}"). 꼭 필요하면 <Deeper>로 옮기세요.`);
      }
    }
  }
}

function checkReferences(tree: Root, fm: Record<string, unknown>, src: SourceFile, ctx: LintContext, report: Report): void {
  const targets: { slug: string; line: number; via: string }[] = [];
  if (Array.isArray(fm.related)) for (const r of fm.related) targets.push({ slug: String(r), line: 1, via: 'related' });
  visit(tree, (node) => {
    if (!isJsx(node) || node.name !== 'Term') return;
    const slug = jsxAttrs(node).slug;
    if (typeof slug !== 'string') report('reference', lineOf(node), columnOf(node), '<Term>에 slug가 필요해요.');
    else targets.push({ slug, line: lineOf(node), via: 'Term' });
  });
  const selfDraft = fm.draft === true;
  for (const t of targets) {
    const target = ctx.docs.get(t.slug);
    if (t.slug === src.id) report('reference', t.line, 1, `${t.via}: 자기 자신을 가리킬 수 없어요.`);
    else if (!target) report('reference', t.line, 1, `${t.via}: 대상 글이 없어요 (${t.slug}).`);
    else if (target.draft && !selfDraft) report('reference', t.line, 1, `${t.via}: 공개 글은 초안 글을 가리킬 수 없어요 (${t.slug}).`);
  }
}

export function collectMeta(src: SourceFile): DocMeta | null {
  try {
    const fm = readFrontmatter(parseMdx(src.source));
    if (!fm) return null;
    const type = fm.type === 'concept' || fm.type === 'guide' ? fm.type : null;
    return { id: src.id, type, draft: fm.draft === true };
  } catch {
    return null;
  }
}

export function lintSource(src: SourceFile, ctx: LintContext): LintIssue[] {
  const issues: LintIssue[] = [];
  const report: Report = (rule, line, column, message) => issues.push({ file: src.file, line, column, rule, message });

  let tree: Root;
  try {
    tree = parseMdx(src.source);
  } catch (e) {
    const err = e as { line?: number; column?: number; reason?: string };
    const loc = parseErrorLocation(err);
    report('parse', loc.line, loc.column, `MDX를 읽을 수 없어요: ${err.reason ?? String(e)}`);
    return issues;
  }

  const fm = readFrontmatter(tree);
  if (!fm) {
    report('frontmatter', 1, 1, '머리말(---)이 없어요.');
    return issues;
  }
  if (fm.type !== 'concept' && fm.type !== 'guide') {
    report('frontmatter', 1, 1, `type은 concept 또는 guide여야 해요. 현재: ${String(fm.type)}`);
    return issues;
  }
  const type: DocType = fm.type;
  const folder = src.id.split('/')[0];
  if (fm.domain !== folder) report('domain-folder', 1, 1, `domain(${String(fm.domain)})이 폴더(${folder})와 달라요.`);

  const items = topLevelItems(tree);
  const demos = importedNames(tree);
  if (type === 'concept') checkConceptStructure(items, demos, report);
  else checkGuideStructure(items, demos, report);
  checkBlocks(tree, report);
  checkProse(tree, report);

  const chars = proseChars(tree, { excludeDeeper: true });
  const max = LINT_CONFIG.maxBodyChars[type];
  if (chars > max) {
    report('body-length', 1, 1, `본문이 ${chars}자예요 (${type === 'concept' ? '개념' : '가이드'} 최대 ${max}자, '더 깊이' 제외).`);
  }

  checkReferences(tree, fm, src, ctx, report);
  visit(tree, 'link', (node) => {
    report('markdown-link', lineOf(node), columnOf(node), `본문에 마크다운 링크를 쓰지 않아요. 다른 글은 <Term>으로, 출처는 머리말 sources로 옮기세요 (${node.url}).`);
  });
  return issues;
}
```

- [ ] **Step 5: CLI 구현**

`scripts/lint-content/index.ts`:

```ts
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { collectMeta, lintSource, type LintContext, type SourceFile } from './rules';

const root = process.env.DOCS_CONTENT_DIR ?? 'src/content/docs';

function listMdx(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return listMdx(full);
    return name.endsWith('.mdx') ? [full] : [];
  });
}

if (!existsSync(root)) {
  console.error(`글 폴더가 없어요: ${root}`);
  process.exit(1);
}

const files: SourceFile[] = listMdx(root).map((full) => ({
  file: relative(process.cwd(), full),
  id: relative(root, full).split(sep).join('/').replace(/\.mdx$/, ''),
  source: readFileSync(full, 'utf8'),
}));

const ctx: LintContext = { docs: new Map() };
for (const f of files) {
  const meta = collectMeta(f);
  if (meta) ctx.docs.set(meta.id, meta);
}

const issues = files.flatMap((f) => lintSource(f, ctx));
for (const i of issues) console.log(`${i.file}:${i.line}:${i.column} [${i.rule}] ${i.message}`);
console.log(`글 ${files.length}편 검사, 위반 ${issues.length}건`);
process.exitCode = issues.length > 0 ? 1 : 0;
```

`package.json`의 scripts를 고친다:

```json
"lint:content": "tsx scripts/lint-content/index.ts",
"build": "npm run lint:content && astro build",
```

- [ ] **Step 6: 테스트 통과 확인**

Run: `npx vitest run tests/unit/lint`
Expected: PASS(모두).

Run: `npm run lint:content`
Expected: `글 0편 검사, 위반 0건`, 종료 코드 0이다(아직 실제 글이 없다).

- [ ] **Step 7: 글쓰기 가이드와 CLAUDE.md 쓰기**

`docs/writing-guide.md`에 다음 내용을 **해요체로** 쓴다. 이 문서 자체가 예시가 되도록 짧은 문장과 표로 쓴다.

1. **목적**: 이 사이트의 독자와 가독성 원칙. 스펙 1장의 "반면교사" 표를 그대로 옮긴다.
2. **글쓰기 규칙**: 스펙 6장 목록을 그대로 옮기고, 규칙마다 나쁜 예/좋은 예를 한 쌍씩 단다. 예: 나쁜 예 "본 문서에서는 CPU 사용률을 특정 수집기의 정의라고 주장하지 않습니다." / 좋은 예 "CPU 사용률은 계산식이 제품마다 달라요."
3. **개념 글 뼈대**(복사해서 쓰는 MDX):

````mdx
---
title: 제목(30자 이하)
summary: 한 줄 요약(15~60자). 이것만 읽어도 무엇인지 알게 써요.
domain: foundations
type: concept
order: 1
icon: chart-column
keywords: [검색 별칭, 영어 용어]
related: [foundations/다른-글]
sources:
  - title: 출처 제목
    url: https://...
updated: 2026-10-13
---
import PercentileDemo from '../../../components/demos/PercentileDemo.tsx';

<OnDashboard title="위젯 이름" caption="그림이 보여 주는 것 한 문장">
  <MiniLineChart ariaLabel="그래프 설명" series={[{ label: '평균', values: [1, 2, 3], tone: 'sub' }]} />
  <StatTile label="p99" value="3,000" unit="ms" tone="warn" />
</OnDashboard>

<KeyPoints>
  <Point title="핵심 1 (30자 이하)">
    두세 문장이에요.
  </Point>
</KeyPoints>

<PercentileDemo client:visible />

<Checkpoints>
  <Check>AI나 동료의 구현에서 의심해야 할 지점이에요.</Check>
</Checkpoints>

<Deeper>
  공식, 예외, 세부 동작이에요.
</Deeper>
````

4. **가이드 글 뼈대**: `<Situation>` → `<FirstLook>`(`<Item title>` 1~3개) → `## 1. …` 단계들 → `<Checkpoints>` 순서의 MDX 예시를 쓴다.
5. **컴포넌트 목록**: 표 하나로 정리한다. `OnDashboard(title, caption?)`, `KeyPoints`, `Point(title)`, `Checkpoints`, `Check`, `Deeper`, `Situation`, `FirstLook`, `Item(title)`, `Term(slug)`, `MiniLineChart(series, ariaLabel, yMax?, height?)`(단위는 범례 `value`에 직접 쓴다), `StatTile(label, value, unit?, tone?, note?)`, 데모(`PercentileDemo`, `DownsamplingDemo`: default import + `client:visible`). viz 컴포넌트는 한 줄에 하나씩 쓴다는 점도 적는다(한 줄에 여러 개를 쓰면 단락으로 묶여 배치가 깨진다).
6. **검사 규칙과 기준값**: 스펙 7.2 표와 `scripts/lint-content/config.ts`의 값. 기준값을 바꾸면 두 곳을 같이 고친다는 점을 적는다.
7. **작성 절차**: ① 출처 조사(공식 문서·명세·원 논문 우선) → ② 초안 → ③ `npm run lint:content` → ④ 작성자와 다른 에이전트의 사실 검토(`docs/reviews/{domain}-{slug}.md`) → ⑤ 반영 후 재검사 → ⑥ 사이트 주인의 화면 검토.
8. **사실 검토 기록 형식**:

```md
# 사실 검토: <제목>

- 글: src/content/docs/<domain>/<slug>.mdx
- 검토일: YYYY-MM-DD
- 결과: 수정 필요 N건 / 확인 N건

| 주장(인용) | 판정 | 근거(URL과 인용) | 수정 제안 |
| --- | --- | --- | --- |

## 반영

- 무엇을 어떻게 고쳤는지
```

`CLAUDE.md`:

```md
# DomainDocs 작업 규칙

모니터링 도메인 지식을 한국어로 정리하는 공개 정적 사이트예요. 가독성이 최우선이에요.

## 꼭 지킬 것

- 글(`src/content/docs/**`)을 쓰거나 고치기 전에 `docs/writing-guide.md`를 읽고 그대로 따른다.
- 글을 고친 뒤에는 `npm run lint:content`가 위반 0건이어야 한다.
- 새 글은 작성자와 다른 에이전트가 사실 검토하고, 결과를 `docs/reviews/`에 남긴다.
- 내부 링크는 `src/lib/paths.ts`의 함수로 만든다. `/`로 시작하는 경로를 하드코딩하지 않는다.
- 토스 로고, Toss Product Sans, 토스페이스, 토스 일러스트는 쓰지 않는다.
- 댓글, 로그인, 방문자 분석, 영어판은 만들지 않는다.
- 설계: `docs/superpowers/specs/2026-10-13-domaindocs-site-design.md`

## 명령

| 명령 | 하는 일 |
| --- | --- |
| `npm run dev` | 개발 서버(에이전트가 실행하면 백그라운드로 뜬다. `npx astro dev stop`으로 끈다) |
| `npm run lint:content` | 글 검사 |
| `npm run build` | 글 검사 → 빌드 → 검색 색인 |
| `npm run check` | 타입 검사 |
| `npm test` | 단위 테스트 |
| `npm run test:e2e` | 화면 테스트(테스트 전용 글로 빌드해서 실행) |
```

- [ ] **Step 8: 커밋**

```bash
git add -A
git commit -m "feat: 글 검사기와 글쓰기 가이드 추가

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: 디자인 토큰, 기본 레이아웃, 상단 바

**Files:**
- Create: `src/styles/tokens.css`, `src/styles/global.css`, `src/data/site.ts`, `src/data/icons.ts`, `src/components/ui/Icon.astro`, `src/components/ui/TopBar.astro`, `src/layouts/BaseLayout.astro`, `public/favicon.svg`
- Modify: `src/pages/index.astro`(임시 홈이 BaseLayout을 쓰게)
- Test: `tests/e2e/helpers.ts`, `tests/e2e/layout.spec.ts`

**Interfaces:**
- Consumes: `withBase`(Task 1)
- Produces:
  - `SITE = { name: 'DomainDocs', headline: '모니터링 숫자를\n제대로 읽는 법', description: '모니터링 제품을 만들고 판단하는 개발자를 위한 개념 노트예요.' }`
  - `ICON_NAMES`(readonly tuple), `type IconName`
  - `<Icon name: IconName size?: number />`
  - `<BaseLayout title?: string description?: string surface?: 'grey' | 'white' backHref?: string barTitle?: string>`: 슬롯 `default`(main 안), `head`, `end`(body 끝)
  - `<TopBar backHref?: string title?: string />`: 검색 버튼에 `data-search-open`이 있다(Task 8이 연결함). 페이지의 `[data-page-title]` 요소가 화면 밖으로 나가면 상단 바에 `is-scrolled`가 붙는다.
  - CSS 클래스: `.page`, `.pressable`, `.visually-hidden`, `.hero`·`.hero-title`·`.hero-desc`, `.block`·`.block-title`·`.block-caption`, `.doc-section`·`.section-title`, `.prose`(MDX 본문)
  - e2e 도우미 `expectNoHorizontalOverflow(page: Page): Promise<void>`, `openAllDetails(page: Page): Promise<void>`

- [ ] **Step 1: 실패하는 E2E 쓰기**

`tests/e2e/helpers.ts`:

```ts
import { expect, type Page } from '@playwright/test';

/** 가로 넘침 검사. 모바일 에뮬레이션에서는 innerWidth가 늘어나므로 clientWidth와 비교한다. */
export async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const { scrollWidth, clientWidth } = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(scrollWidth, `가로 넘침: ${page.url()}`).toBeLessThanOrEqual(clientWidth);
}

/** 접힌 '더 깊이'를 모두 펼친다. 접힌 내용은 배치되지 않아 넘침 검사에서 빠지기 때문이다. */
export async function openAllDetails(page: Page): Promise<void> {
  await page.locator('details').evaluateAll((els) => els.forEach((d) => ((d as HTMLDetailsElement).open = true)));
}
```

`tests/e2e/layout.spec.ts`:

```ts
import { expect, test } from '@playwright/test';
import { expectNoHorizontalOverflow } from './helpers';

test('본문 글꼴은 Pretendard, 17px, 행간 1.7이다', async ({ page }) => {
  await page.goto('./');
  const style = await page.evaluate(() => {
    const s = getComputedStyle(document.body);
    return { family: s.fontFamily, size: s.fontSize, lineHeight: s.lineHeight };
  });
  expect(style.family).toContain('Pretendard Variable');
  expect(style.size).toBe('17px');
  expect(parseFloat(style.lineHeight)).toBeCloseTo(17 * 1.7, 1);
});

test('라이트 모드 배경은 #F2F4F6이다', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('./');
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(242, 244, 246)');
});

test('다크 모드 배경은 #101013이다', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('./');
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(16, 16, 19)');
});

test('본문 칼럼은 640px을 넘지 않는다', async ({ page }) => {
  await page.goto('./');
  const width = await page.locator('main.page').evaluate((el) => el.getBoundingClientRect().width);
  expect(width).toBeLessThanOrEqual(640);
});

test('상단 바에 사이트 이름과 검색 버튼이 있다', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('link', { name: 'DomainDocs' })).toHaveAttribute('href', '/DomainDocs/');
  await expect(page.getByRole('button', { name: '검색' })).toBeVisible();
});

test('홈에 가로 스크롤이 없다', async ({ page }) => {
  await page.goto('./');
  await expectNoHorizontalOverflow(page);
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx playwright test tests/e2e/layout.spec.ts`
Expected: FAIL. 글꼴·배경색·검색 버튼 검사가 실패한다.

- [ ] **Step 3: 의존성 설치**

```bash
npm install @lucide/astro@^1.55.0 pretendard@^1.3.9
```

- [ ] **Step 4: 토큰과 전역 스타일 쓰기**

`src/styles/tokens.css`:

```css
:root {
  color-scheme: light dark;

  --color-bg: #f2f4f6;
  --color-card: #ffffff;
  --color-text: #191f28;
  --color-text-sub: #6b7684;
  --color-text-weak: #8b95a1;
  --color-accent: #3182f6;
  --color-accent-weak: #e8f3ff;
  --color-warn: #f04452;
  --color-warn-weak: #fff0f1;
  --color-line: #e5e8eb;
  --color-press: rgba(2, 32, 71, 0.05);
  --shadow-sheet: 0 -8px 32px rgba(0, 0, 0, 0.12);

  --font-sans: 'Pretendard Variable', Pretendard, -apple-system, BlinkMacSystemFont, system-ui, 'Apple SD Gothic Neo',
    'Malgun Gothic', sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Consolas, 'Liberation Mono', monospace;

  --radius-card: 20px;
  --radius-row: 14px;
  --radius-button: 12px;
  --content-width: 640px;
  --gutter: 20px;
  --topbar-height: 56px;
}

@media (prefers-color-scheme: dark) {
  :root {
    --color-bg: #101013;
    --color-card: #1c1c21;
    --color-text: #e8e9ec;
    --color-text-sub: #9ea4ad;
    --color-text-weak: #6e747c;
    --color-accent: #4c93ff;
    --color-accent-weak: #1a2a40;
    --color-warn: #ff6b76;
    --color-warn-weak: #3a1e22;
    --color-line: #2a2b31;
    --color-press: rgba(255, 255, 255, 0.06);
    --shadow-sheet: 0 -8px 32px rgba(0, 0, 0, 0.5);
  }
}
```

`src/styles/global.css`:

```css
*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  -webkit-text-size-adjust: 100%;
  text-size-adjust: 100%;
}

body {
  --surface: var(--color-bg);
  margin: 0;
  font-family: var(--font-sans);
  font-size: 17px;
  line-height: 1.7;
  letter-spacing: -0.01em;
  color: var(--color-text);
  background: var(--surface);
  /* 한글은 어절 단위로 줄을 바꾸고, 긴 영문·지표 이름은 어디서든 끊는다 */
  word-break: keep-all;
  overflow-wrap: anywhere;
  -webkit-font-smoothing: antialiased;
}

body.surface-white {
  --surface: var(--color-card);
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  font: inherit;
  color: inherit;
}

svg {
  display: block;
  max-width: 100%;
}

.page {
  max-width: var(--content-width);
  margin: 0 auto;
  padding: 8px var(--gutter) 96px;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

.pressable {
  cursor: pointer;
  transition: transform 0.15s ease, background-color 0.15s ease;
}

.pressable:active {
  transform: scale(0.98);
  background-color: var(--color-press);
}

:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
  border-radius: 8px;
}

/* 홈·영역·404 머리 */
.hero {
  padding: 24px 0 16px;
}

.hero-title {
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  line-height: 1.35;
  letter-spacing: -0.02em;
}

.hero-title > span {
  display: block;
}

.hero-desc {
  margin: 12px 0 0;
  color: var(--color-text-sub);
}

/* 글 틀 블록 공통 */
.block {
  margin: 48px 0;
}

.block-title {
  margin: 0 0 16px;
  font-size: 20px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: -0.02em;
}

.block-caption {
  margin: 12px 0 0;
  font-size: 15px;
  color: var(--color-text-sub);
}

/* 글 아래 영역(참고 자료·관련 개념) */
.doc-section {
  margin-top: 48px;
}

.section-title {
  margin: 0 0 8px;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

/* MDX 본문. :where()로 명시도를 0으로 낮춰 블록 컴포넌트 스타일이 이기게 한다. */
:where(.prose) p {
  margin: 0 0 1em;
}

:where(.prose) h2 {
  margin: 48px 0 12px;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: -0.02em;
}

:where(.prose) h3 {
  margin: 32px 0 8px;
  font-size: 19px;
  font-weight: 600;
  line-height: 1.45;
  letter-spacing: -0.02em;
}

:where(.prose) :is(ul, ol) {
  margin: 0 0 1em;
  padding-left: 1.25em;
}

:where(.prose) li + li {
  margin-top: 4px;
}

:where(.prose) strong {
  font-weight: 700;
}

:where(.prose) :not(pre) > code {
  padding: 2px 6px;
  border-radius: 6px;
  font-family: var(--font-mono);
  font-size: 15px;
  background: var(--color-bg);
  word-break: break-all;
}

:where(.prose) pre {
  margin: 0 0 1em;
  padding: 16px;
  border-radius: 16px;
  overflow-x: auto;
  font-family: var(--font-mono);
  font-size: 15px;
  line-height: 1.6;
  word-break: normal;
  overflow-wrap: normal;
}

:where(.prose) table {
  display: block;
  max-width: 100%;
  margin: 0 0 1em;
  overflow-x: auto;
  border-collapse: collapse;
  font-size: 15px;
}

:where(.prose) :is(th, td) {
  padding: 10px 12px;
  border-bottom: 1px solid var(--color-line);
  text-align: left;
  white-space: nowrap;
}

:where(.prose) th {
  font-weight: 600;
  color: var(--color-text-sub);
}

@media (prefers-color-scheme: dark) {
  .astro-code,
  .astro-code span {
    color: var(--shiki-dark) !important;
    background-color: var(--shiki-dark-bg) !important;
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    transition: none !important;
    animation: none !important;
    scroll-behavior: auto !important;
  }
}
```

- [ ] **Step 5: 데이터·아이콘·상단 바·레이아웃 쓰기**

`src/data/site.ts`:

```ts
export const SITE = {
  name: 'DomainDocs',
  headline: '모니터링 숫자를\n제대로 읽는 법',
  description: '모니터링 제품을 만들고 판단하는 개발자를 위한 개념 노트예요.',
} as const;
```

`src/data/icons.ts`:

```ts
/** 글 머리말 icon에 쓸 수 있는 이름. 늘리면 Icon.astro의 ICONS에도 추가한다(타입 검사가 빠뜨림을 잡는다). */
export const ICON_NAMES = [
  'sigma',
  'activity',
  'database',
  'server',
  'chart-line',
  'chart-column',
  'gauge',
  'timer',
  'layers',
  'hash',
  'clock',
  'trending-up',
] as const;

export type IconName = (typeof ICON_NAMES)[number];
```

`src/components/ui/Icon.astro`:

```astro
---
import { Activity, ChartColumn, ChartLine, Clock, Database, Gauge, Hash, Layers, Server, Sigma, Timer, TrendingUp } from '@lucide/astro';
import type { IconName } from '../../data/icons';

interface Props {
  name: IconName;
  size?: number;
}

const ICONS = {
  sigma: Sigma,
  activity: Activity,
  database: Database,
  server: Server,
  'chart-line': ChartLine,
  'chart-column': ChartColumn,
  gauge: Gauge,
  timer: Timer,
  layers: Layers,
  hash: Hash,
  clock: Clock,
  'trending-up': TrendingUp,
} satisfies Record<IconName, unknown>;

const { name, size = 22 } = Astro.props;
const Component = ICONS[name];
---
<Component size={size} aria-hidden="true" />
```

`@lucide/astro`에 위 이름 중 하나가 없어서 `npm run check`가 실패하면, `node_modules/@lucide/astro`에서 같은 모양의 현재 이름(예: `LineChart` → `ChartLine`)을 찾아 바꾼다. `ICON_NAMES`의 문자열은 바꾸지 않는다.

`src/components/ui/TopBar.astro`:

```astro
---
import { ChevronLeft, Search } from '@lucide/astro';
import { SITE } from '../../data/site';
import { withBase } from '../../lib/paths';

interface Props {
  backHref?: string;
  title?: string;
}

const { backHref, title } = Astro.props;
---
<header class="topbar" data-topbar>
  <div class="topbar-inner">
    {
      backHref ? (
        <a class="icon-button pressable" href={backHref} aria-label="뒤로 가기">
          <ChevronLeft size={26} aria-hidden="true" />
        </a>
      ) : (
        <a class="brand" href={withBase()}>{SITE.name}</a>
      )
    }
    <span class="topbar-title" aria-hidden="true">{title}</span>
    <button class="icon-button pressable" type="button" data-search-open aria-label="검색" aria-keyshortcuts="/">
      <Search size={22} aria-hidden="true" />
    </button>
  </div>
</header>

<style>
  .topbar {
    position: sticky;
    top: 0;
    z-index: 10;
    background: var(--surface);
  }

  .topbar-inner {
    display: flex;
    align-items: center;
    gap: 4px;
    max-width: var(--content-width);
    height: var(--topbar-height);
    margin: 0 auto;
    padding: 0 calc(var(--gutter) - 8px);
  }

  .icon-button {
    display: grid;
    flex: none;
    place-items: center;
    width: 40px;
    height: 40px;
    border: 0;
    border-radius: var(--radius-button);
    background: transparent;
    color: var(--color-text);
  }

  .brand {
    padding: 0 8px;
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .topbar-title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    font-size: 17px;
    font-weight: 600;
    white-space: nowrap;
    text-overflow: ellipsis;
    opacity: 0;
    transform: translateY(4px);
    transition: opacity 0.2s ease, transform 0.2s ease;
  }

  .topbar.is-scrolled .topbar-title {
    opacity: 1;
    transform: none;
  }
</style>

<script>
  const bar = document.querySelector<HTMLElement>('[data-topbar]');
  const heading = document.querySelector('[data-page-title]');
  if (bar && heading) {
    new IntersectionObserver(([entry]) => bar.classList.toggle('is-scrolled', !entry.isIntersecting), {
      rootMargin: '-56px 0px 0px 0px',
    }).observe(heading);
  }
</script>
```

`src/layouts/BaseLayout.astro`:

```astro
---
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import '../styles/tokens.css';
import '../styles/global.css';
import TopBar from '../components/ui/TopBar.astro';
import { SITE } from '../data/site';
import { withBase } from '../lib/paths';

interface Props {
  title?: string;
  description?: string;
  surface?: 'grey' | 'white';
  backHref?: string;
  barTitle?: string;
}

const { title, description = SITE.description, surface = 'grey', backHref, barTitle } = Astro.props;
const fullTitle = title ? `${title} · ${SITE.name}` : SITE.name;
---
<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="color-scheme" content="light dark" />
    <title>{fullTitle}</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={fullTitle} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <link rel="icon" href={withBase('favicon.svg')} type="image/svg+xml" />
    <slot name="head" />
  </head>
  <body class={`surface-${surface}`}>
    <TopBar backHref={backHref} title={barTitle} />
    <main id="main" class="page">
      <slot />
    </main>
    <slot name="end" />
  </body>
</html>
```

`public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" rx="8" fill="#3182F6"/><path d="M7 21l5-6 4 4 9-9" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
```

`src/pages/index.astro`(임시, Task 6에서 교체):

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { SITE } from '../data/site';
---
<BaseLayout>
  <section class="hero">
    <h1 class="hero-title" data-page-title>{SITE.headline.split('\n').map((line) => <span>{line}</span>)}</h1>
    <p class="hero-desc">{SITE.description}</p>
  </section>
</BaseLayout>
```

- [ ] **Step 6: 통과 확인**

Run: `npm run check`
Expected: `0 errors`.

Run: `npx playwright test tests/e2e/layout.spec.ts tests/e2e/smoke.spec.ts`
Expected: PASS(모두, 두 프로젝트).

- [ ] **Step 7: 커밋**

```bash
git add -A
git commit -m "feat: 토스풍 디자인 토큰, 기본 레이아웃, 상단 바 추가

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: 콘텐츠 스키마, 글 페이지, 틀 블록 컴포넌트

**Files:**
- Create: `src/data/domains.ts`, `src/content.config.ts`, `src/lib/catalog.ts`, `src/lib/content.ts`, `src/components/content/{OnDashboard,KeyPoints,Point,Checkpoints,Check,Deeper,Situation,FirstLook,Item,Term}.astro`, `src/components/content/index.ts`, `src/components/ui/ListRow.astro`, `src/components/doc/{DocHeader,SourceList,RelatedList,NextCard}.astro`, `src/layouts/DocLayout.astro`, `src/pages/[domain]/[slug].astro`, `tests/fixtures/docs/foundations/{alpha,beta,gamma-guide,draft-doc}.mdx`
- Modify: `tests/e2e/helpers.ts`(PAGES 추가), `tests/e2e/layout.spec.ts`(넘침 검사를 PAGES 전체로)
- Test: `tests/unit/catalog.test.ts`, `tests/e2e/doc-page.spec.ts`

**Interfaces:**
- Consumes: `analyzeBody`·`BodyAnalysis`(Task 2), `docPath`·`domainPath`·`withBase`(Task 1), `BaseLayout`·`Icon`·`IconName`·`ICON_NAMES`(Task 4)
- Produces:
  - `DOMAIN_IDS`, `type DomainId`, `interface Domain { id; name; description; icon: IconName }`, `DOMAINS: readonly Domain[]`, `getDomain(id: string): Domain | undefined`
  - 컬렉션 `docs`(스키마는 스펙 7.1과 같다. `keywords` 기본값 `[]`, `related` 기본값 `[]`, `draft` 기본값 `false`)
  - `type DocType = 'concept' | 'guide'`, `TYPE_LABEL: Record<DocType, string>`
  - `interface DocCard { id: string; domain: DomainId; type: DocType; order: number; title: string; summary: string; icon?: IconName; updated: Date; readingMinutes: number; url: string }`
  - `sortByOrder<T>(docs): T[]`, `inDomain<T>(docs, domain): T[]`, `nextInDomain<T>(docs, currentId): T | undefined`, `recentlyUpdated<T>(docs, limit): T[]`
  - `type DocEntry = CollectionEntry<'docs'>`, `analyzeEntry(entry): BodyAnalysis`, `getPublishedDocs(): Promise<DocEntry[]>`, `assertReferences(entries): void`, `toCard(entry): DocCard`, `getCards(): Promise<DocCard[]>`
  - `mdxComponents`(MDX `components` prop에 넘기는 객체)
  - `<ListRow href? icon? title description? meta? badge? />`: 링크면 `<a data-row>`, 아니면 `<div data-row aria-disabled="true">`
  - 화면 표식(테스트가 쓴다): `[data-block="on-dashboard|key-points|checkpoints|deeper|situation|first-look"]`, `[data-point]`, `[data-check]`, `[data-item]`, `a.term[data-term]`, `[data-doc-summary]`, `[data-doc-type]`, `[data-reading-time]`, `[data-sources]`, `[data-related]`, `[data-used-concepts]`, `[data-next]`, `article[data-pagefind-body]`

- [ ] **Step 1: 실패하는 단위 테스트 쓰기**

`tests/unit/catalog.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { inDomain, nextInDomain, recentlyUpdated, sortByOrder, type DocCard } from '../../src/lib/catalog';

const card = (id: string, order: number, updated: string, domain: DocCard['domain'] = 'foundations', type: DocCard['type'] = 'concept'): DocCard => ({
  id,
  domain,
  type,
  order,
  title: id,
  summary: '',
  updated: new Date(updated),
  readingMinutes: 1,
  url: `/DomainDocs/${id}/`,
});

const DOCS = [
  card('foundations/c', 3, '2026-10-03'),
  card('foundations/a', 1, '2026-10-05'),
  card('foundations/b', 1, '2026-10-05'),
  card('apm/x', 1, '2026-10-09', 'apm'),
];

describe('catalog', () => {
  it('order 오름차순, 같으면 id 순으로 정렬한다', () => {
    expect(sortByOrder(DOCS).map((d) => d.id)).toEqual(['apm/x', 'foundations/a', 'foundations/b', 'foundations/c']);
  });
  it('영역별로 거른다', () => {
    expect(inDomain(DOCS, 'apm').map((d) => d.id)).toEqual(['apm/x']);
  });
  it('같은 영역의 다음 글을 찾는다', () => {
    expect(nextInDomain(DOCS, 'foundations/a')?.id).toBe('foundations/b');
    expect(nextInDomain(DOCS, 'foundations/b')?.id).toBe('foundations/c');
  });
  it('영역의 마지막 글이나 없는 글이면 undefined다', () => {
    expect(nextInDomain(DOCS, 'foundations/c')).toBeUndefined();
    expect(nextInDomain(DOCS, 'apm/x')).toBeUndefined();
    expect(nextInDomain(DOCS, 'nope/nope')).toBeUndefined();
  });
  it('최근 수정 순으로 limit개를 고른다', () => {
    expect(recentlyUpdated(DOCS, 3).map((d) => d.id)).toEqual(['apm/x', 'foundations/a', 'foundations/b']);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run tests/unit/catalog.test.ts`
Expected: FAIL. `src/lib/catalog`를 찾을 수 없다는 오류가 난다.

- [ ] **Step 3: 영역·카탈로그 구현**

`src/data/domains.ts`:

```ts
import type { IconName } from './icons';

export const DOMAIN_IDS = ['foundations', 'apm', 'database', 'infra'] as const;
export type DomainId = (typeof DOMAIN_IDS)[number];

export interface Domain {
  id: DomainId;
  name: string;
  description: string;
  icon: IconName;
}

export const DOMAINS: readonly Domain[] = [
  { id: 'foundations', name: '공통 기초', description: '지표, 시계열, 백분위수처럼 어느 모니터링 제품에서나 쓰는 개념이에요.', icon: 'sigma' },
  { id: 'apm', name: 'APM', description: '트랜잭션, 응답시간, 분산 트레이스로 애플리케이션 성능을 읽어요.', icon: 'activity' },
  { id: 'database', name: 'DB 모니터링', description: '세션, 대기 이벤트, 락, 실행 계획으로 데이터베이스를 읽어요.', icon: 'database' },
  { id: 'infra', name: '인프라·쿠버네티스', description: 'CPU, 메모리, 컨테이너, Pod 상태로 인프라를 읽어요.', icon: 'server' },
];

export function getDomain(id: string): Domain | undefined {
  return DOMAINS.find((d) => d.id === id);
}
```

`src/lib/catalog.ts`:

```ts
import type { DomainId } from '../data/domains';
import type { IconName } from '../data/icons';

export type DocType = 'concept' | 'guide';

export const TYPE_LABEL: Record<DocType, string> = { concept: '개념', guide: '가이드' };

/** 목록·카드·다음 글에 쓰는 글 요약. astro:content에 의존하지 않아 단위 테스트할 수 있다. */
export interface DocCard {
  id: string;
  domain: DomainId;
  type: DocType;
  order: number;
  title: string;
  summary: string;
  icon?: IconName;
  updated: Date;
  readingMinutes: number;
  url: string;
}

export function sortByOrder<T extends Pick<DocCard, 'order' | 'id'>>(docs: readonly T[]): T[] {
  return [...docs].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}

export function inDomain<T extends Pick<DocCard, 'domain'>>(docs: readonly T[], domain: DomainId): T[] {
  return docs.filter((d) => d.domain === domain);
}

export function nextInDomain<T extends Pick<DocCard, 'id' | 'domain' | 'order'>>(docs: readonly T[], currentId: string): T | undefined {
  const current = docs.find((d) => d.id === currentId);
  if (!current) return undefined;
  const list = sortByOrder(inDomain(docs, current.domain));
  return list[list.findIndex((d) => d.id === currentId) + 1];
}

export function recentlyUpdated<T extends Pick<DocCard, 'updated' | 'id'>>(docs: readonly T[], limit: number): T[] {
  return [...docs].sort((a, b) => b.updated.getTime() - a.updated.getTime() || a.id.localeCompare(b.id)).slice(0, limit);
}
```

- [ ] **Step 4: 단위 테스트 통과 확인**

Run: `npx vitest run tests/unit/catalog.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 5: 스키마와 콘텐츠 래퍼 구현**

`src/content.config.ts`:

```ts
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
    sources: z.array(z.object({ title: z.string(), url: z.url() })).min(1),
    updated: z.coerce.date(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { docs };
```

`src/lib/content.ts`:

```ts
import { getCollection, type CollectionEntry } from 'astro:content';
import type { DocCard } from './catalog';
import { analyzeBody, type BodyAnalysis } from './mdx/analyze';
import { docPath } from './paths';

export type DocEntry = CollectionEntry<'docs'>;

const analysisCache = new Map<string, BodyAnalysis>();

export function analyzeEntry(entry: DocEntry): BodyAnalysis {
  const key = `${entry.id}:${entry.digest ?? ''}`;
  let result = analysisCache.get(key);
  if (!result) {
    result = analyzeBody(entry.body ?? '');
    analysisCache.set(key, result);
  }
  return result;
}

/** related와 <Term>이 실제로 공개된 글을 가리키는지 확인한다. Astro는 없는 reference를 경고만 하고 넘어가기 때문이다. */
export function assertReferences(entries: readonly DocEntry[]): void {
  const ids = new Set(entries.map((e) => e.id));
  for (const e of entries) {
    const targets = [...e.data.related.map((r) => r.id), ...analyzeEntry(e).termSlugs];
    for (const id of targets) {
      if (!ids.has(id)) throw new Error(`[${e.id}] 없거나 공개되지 않은 글을 가리켜요: ${id}`);
    }
  }
}

/** 운영 빌드에서는 초안을 뺀다. 개발 서버에서는 초안도 보인다. */
export async function getPublishedDocs(): Promise<DocEntry[]> {
  const entries = await getCollection('docs', ({ data }) => (import.meta.env.PROD ? !data.draft : true));
  assertReferences(entries);
  return entries;
}

export function toCard(entry: DocEntry): DocCard {
  return {
    id: entry.id,
    domain: entry.data.domain,
    type: entry.data.type,
    order: entry.data.order,
    title: entry.data.title,
    summary: entry.data.summary,
    icon: entry.data.icon,
    updated: entry.data.updated,
    readingMinutes: analyzeEntry(entry).readingMinutes,
    url: docPath(entry.id),
  };
}

export async function getCards(): Promise<DocCard[]> {
  return (await getPublishedDocs()).map(toCard);
}
```

- [ ] **Step 6: 틀 블록 컴포넌트 구현**

`src/components/content/OnDashboard.astro`:

```astro
---
interface Props {
  title: string;
  caption?: string;
}
const { title, caption } = Astro.props;
---
<section class="block" data-block="on-dashboard">
  <h2 class="block-title">대시보드에서는 이렇게 보여요</h2>
  <figure class="widget">
    <figcaption class="widget-title">{title}</figcaption>
    <div class="widget-body"><slot /></div>
  </figure>
  {caption && <p class="block-caption">{caption}</p>}
</section>

<style>
  .widget {
    margin: 0;
    padding: 20px;
    border-radius: var(--radius-card);
    background: var(--color-bg);
  }

  .widget-title {
    margin-bottom: 12px;
    font-size: 15px;
    font-weight: 600;
    color: var(--color-text-sub);
  }

  /* 차트는 한 줄 전체, 숫자 타일은 나란히 */
  .widget-body {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
  }

  .widget-body > :global(*) {
    flex: 1 1 100%;
  }

  .widget-body > :global([data-stat]) {
    flex: 1 1 96px;
  }

  .widget-body > :global(p) {
    margin: 0;
  }
</style>
```

`src/components/content/KeyPoints.astro`:

```astro
<section class="block" data-block="key-points">
  <h2 class="block-title">핵심</h2>
  <ol class="points"><slot /></ol>
</section>

<style>
  .points {
    display: grid;
    gap: 28px;
    margin: 0;
    padding: 0;
    list-style: none;
    counter-reset: point;
  }
</style>
```

`src/components/content/Point.astro`:

```astro
---
interface Props {
  title: string;
}
const { title } = Astro.props;
---
<li class="point" data-point>
  <h3 class="point-title">{title}</h3>
  <div class="point-body"><slot /></div>
</li>

<style>
  .point {
    display: grid;
    grid-template-columns: 28px 1fr;
    column-gap: 12px;
    counter-increment: point;
  }

  .point::before {
    content: counter(point);
    display: grid;
    place-items: center;
    width: 28px;
    height: 28px;
    margin-top: 1px;
    border-radius: 50%;
    background: var(--color-accent-weak);
    color: var(--color-accent);
    font-size: 15px;
    font-weight: 700;
  }

  .point-title {
    grid-column: 2;
    margin: 0 0 6px;
    font-size: 18px;
    font-weight: 700;
    line-height: 1.45;
    letter-spacing: -0.02em;
  }

  .point-body {
    grid-column: 2;
    min-width: 0;
  }

  .point-body > :global(p:last-child) {
    margin-bottom: 0;
  }
</style>
```

`src/components/content/Checkpoints.astro`:

```astro
<section class="block" data-block="checkpoints">
  <h2 class="block-title">이런 걸 보면 다시 확인하세요</h2>
  <ul class="checks"><slot /></ul>
</section>

<style>
  .checks {
    display: grid;
    gap: 8px;
    margin: 0;
    padding: 0;
    list-style: none;
  }
</style>
```

`src/components/content/Check.astro`:

```astro
---
import { TriangleAlert } from '@lucide/astro';
---
<li class="check" data-check>
  <TriangleAlert class="check-icon" size={20} aria-hidden="true" />
  <div class="check-body"><slot /></div>
</li>

<style>
  .check {
    display: flex;
    gap: 12px;
    padding: 16px;
    border-radius: 16px;
    background: var(--color-warn-weak);
  }

  .check-icon {
    flex: none;
    margin-top: 4px;
    color: var(--color-warn);
  }

  .check-body {
    min-width: 0;
  }

  .check-body > :global(p) {
    margin: 0;
  }
</style>
```

`src/components/content/Deeper.astro`:

```astro
---
import { ChevronDown } from '@lucide/astro';
---
<details class="block deeper" data-block="deeper">
  <summary class="deeper-summary pressable">
    <span>더 깊이 알아보기</span>
    <ChevronDown class="deeper-chevron" size={20} aria-hidden="true" />
  </summary>
  <div class="deeper-body"><slot /></div>
</details>

<style>
  .deeper-summary {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-radius: 16px;
    background: var(--color-bg);
    font-weight: 600;
    list-style: none;
  }

  .deeper-summary::-webkit-details-marker {
    display: none;
  }

  .deeper-chevron {
    color: var(--color-text-weak);
    transition: transform 0.2s ease;
  }

  .deeper[open] .deeper-chevron {
    transform: rotate(180deg);
  }

  .deeper-body {
    padding: 20px 4px 0;
  }
</style>
```

`src/components/content/Situation.astro`:

```astro
<section class="block" data-block="situation">
  <h2 class="block-title">상황</h2>
  <div class="situation-card"><slot /></div>
</section>

<style>
  .situation-card {
    padding: 20px;
    border-radius: var(--radius-card);
    background: var(--color-bg);
  }

  .situation-card > :global(p:last-child) {
    margin-bottom: 0;
  }
</style>
```

`src/components/content/FirstLook.astro`:

```astro
<section class="block" data-block="first-look">
  <h2 class="block-title">먼저 볼 것</h2>
  <ol class="items"><slot /></ol>
</section>

<style>
  .items {
    display: grid;
    gap: 12px;
    margin: 0;
    padding: 0;
    list-style: none;
    counter-reset: item;
  }
</style>
```

`src/components/content/Item.astro`:

```astro
---
interface Props {
  title: string;
}
const { title } = Astro.props;
---
<li class="item" data-item>
  <strong class="item-title">{title}</strong>
  <div class="item-body"><slot /></div>
</li>

<style>
  .item {
    display: grid;
    grid-template-columns: 28px 1fr;
    column-gap: 12px;
    counter-increment: item;
  }

  .item::before {
    content: counter(item);
    display: grid;
    grid-row: span 2;
    place-items: center;
    width: 28px;
    height: 28px;
    border-radius: 50%;
    background: var(--color-accent);
    color: #fff;
    font-size: 15px;
    font-weight: 700;
  }

  .item-title {
    font-weight: 700;
  }

  .item-body {
    color: var(--color-text-sub);
  }

  .item-body > :global(p) {
    margin: 0;
  }
</style>
```

`src/components/content/Term.astro`(Task 7에서 미리보기 시트가 이 링크를 가로챈다):

```astro
---
import { docPath } from '../../lib/paths';

interface Props {
  slug: string;
}
const { slug } = Astro.props;
---
<a class="term" href={docPath(slug)} data-term={slug}><slot /></a>

<style>
  .term {
    color: var(--color-accent);
    font-weight: 600;
    text-decoration: underline;
    text-decoration-color: color-mix(in srgb, var(--color-accent) 35%, transparent);
    text-underline-offset: 3px;
  }
</style>
```

`src/components/content/index.ts`:

```ts
import Check from './Check.astro';
import Checkpoints from './Checkpoints.astro';
import Deeper from './Deeper.astro';
import FirstLook from './FirstLook.astro';
import Item from './Item.astro';
import KeyPoints from './KeyPoints.astro';
import OnDashboard from './OnDashboard.astro';
import Point from './Point.astro';
import Situation from './Situation.astro';
import Term from './Term.astro';

/** MDX에서 import 없이 쓰는 컴포넌트. React 데모는 여기 넣지 않는다(client 지시어를 쓸 수 없다). */
export const mdxComponents = { OnDashboard, KeyPoints, Point, Checkpoints, Check, Deeper, Situation, FirstLook, Item, Term };
```

- [ ] **Step 7: 목록 행과 글 주변 컴포넌트 구현**

`src/components/ui/ListRow.astro`:

```astro
---
import { ChevronRight } from '@lucide/astro';
import Icon from './Icon.astro';
import type { IconName } from '../../data/icons';

interface Props {
  href?: string;
  icon?: IconName;
  title: string;
  description?: string;
  meta?: string;
  badge?: string;
}

const { href, icon, title, description, meta, badge } = Astro.props;
const Tag = href ? 'a' : 'div';
---
<Tag class:list={['row', href ? 'pressable' : 'is-disabled']} href={href} aria-disabled={href ? undefined : 'true'} data-row>
  {icon && <span class="row-icon"><Icon name={icon} size={22} /></span>}
  <span class="row-text">
    <span class="row-title">{title}</span>
    {description && <span class="row-desc">{description}</span>}
  </span>
  {meta && <span class="row-meta">{meta}</span>}
  {badge && <span class="row-badge">{badge}</span>}
  {href && <ChevronRight class="row-chevron" size={20} aria-hidden="true" />}
</Tag>

<style>
  .row {
    display: flex;
    align-items: center;
    gap: 14px;
    margin: 0 -12px;
    padding: 14px 12px;
    border-radius: var(--radius-row);
  }

  .row-icon {
    display: grid;
    flex: none;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: var(--color-accent-weak);
    color: var(--color-accent);
  }

  .row-text {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 2px;
    min-width: 0;
  }

  .row-title {
    font-size: 17px;
    font-weight: 600;
    line-height: 1.45;
    letter-spacing: -0.02em;
  }

  .row-desc {
    display: -webkit-box;
    overflow: hidden;
    font-size: 15px;
    line-height: 1.5;
    color: var(--color-text-sub);
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .row-meta {
    flex: none;
    font-size: 13px;
    color: var(--color-text-weak);
  }

  .row-badge {
    flex: none;
    padding: 4px 8px;
    border-radius: 8px;
    background: var(--color-bg);
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-weak);
  }

  .row-chevron {
    flex: none;
    color: var(--color-text-weak);
  }

  .is-disabled {
    opacity: 0.6;
  }
</style>
```

`src/components/doc/DocHeader.astro`:

```astro
---
import { TYPE_LABEL, type DocType } from '../../lib/catalog';

interface Props {
  domainName: string;
  title: string;
  summary: string;
  type: DocType;
  readingMinutes: number;
  updated: Date;
}

const { domainName, title, summary, type, readingMinutes, updated } = Astro.props;
const updatedText = new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(updated);
---
<header class="doc-header">
  <p class="doc-domain" data-pagefind-ignore>{domainName}</p>
  <h1 class="doc-title" data-page-title>{title}</h1>
  <p class="doc-summary" data-doc-summary>{summary}</p>
  <p class="doc-meta" data-pagefind-ignore>
    <span class="pill" data-doc-type>{TYPE_LABEL[type]}</span>
    <span data-reading-time>{readingMinutes}분</span>
    <span aria-hidden="true">·</span>
    <time datetime={updated.toISOString().slice(0, 10)}>{updatedText} 수정</time>
  </p>
</header>

<style>
  .doc-header {
    padding: 16px 0 8px;
  }

  .doc-domain {
    margin: 0;
    font-size: 15px;
    font-weight: 600;
    color: var(--color-accent);
  }

  .doc-title {
    margin: 8px 0 12px;
    font-size: 28px;
    font-weight: 700;
    line-height: 1.35;
    letter-spacing: -0.02em;
  }

  .doc-summary {
    margin: 0;
    font-size: 18px;
    line-height: 1.6;
    color: var(--color-text-sub);
  }

  .doc-meta {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin: 16px 0 0;
    font-size: 14px;
    color: var(--color-text-weak);
  }

  .pill {
    padding: 2px 8px;
    border-radius: 8px;
    background: var(--color-accent-weak);
    font-weight: 600;
    color: var(--color-accent);
  }
</style>
```

`src/components/doc/SourceList.astro`:

```astro
---
interface Props {
  sources: { title: string; url: string }[];
}
const { sources } = Astro.props;
---
<section class="doc-section" data-sources>
  <h2 class="section-title">참고 자료</h2>
  <ul class="sources">
    {sources.map((s) => (
      <li><a class="source-link" href={s.url} target="_blank" rel="noopener">{s.title}</a></li>
    ))}
  </ul>
</section>

<style>
  .sources {
    display: grid;
    gap: 6px;
    margin: 0;
    padding: 0;
    list-style: none;
    font-size: 15px;
  }

  .source-link {
    color: var(--color-text-sub);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
</style>
```

`src/components/doc/RelatedList.astro`:

```astro
---
import ListRow from '../ui/ListRow.astro';
import type { DocCard } from '../../lib/catalog';

interface Props {
  title: string;
  items: DocCard[];
  marker: 'related' | 'used-concepts';
}
const { title, items, marker } = Astro.props;
---
<section class="doc-section" data-related={marker === 'related' ? '' : undefined} data-used-concepts={marker === 'used-concepts' ? '' : undefined}>
  <h2 class="section-title">{title}</h2>
  <div>
    {items.map((d) => <ListRow href={d.url} icon={d.icon} title={d.title} description={d.summary} />)}
  </div>
</section>
```

`src/components/doc/NextCard.astro`:

```astro
---
import type { DocCard } from '../../lib/catalog';

interface Props {
  doc: DocCard;
}
const { doc } = Astro.props;
---
<a class="next-card pressable" href={doc.url} data-next>
  <span class="next-label">다음에 읽을 글</span>
  <span class="next-title">{doc.title}</span>
  <span class="next-summary">{doc.summary}</span>
</a>

<style>
  .next-card {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin-top: 48px;
    padding: 20px;
    border-radius: var(--radius-card);
    background: var(--color-bg);
  }

  .next-label {
    font-size: 14px;
    font-weight: 600;
    color: var(--color-accent);
  }

  .next-title {
    font-size: 18px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .next-summary {
    font-size: 15px;
    color: var(--color-text-sub);
  }
</style>
```

- [ ] **Step 8: 글 레이아웃과 페이지 구현**

`src/layouts/DocLayout.astro`(Task 7에서 미리보기 시트를 더한다):

```astro
---
import BaseLayout from './BaseLayout.astro';
import DocHeader from '../components/doc/DocHeader.astro';
import NextCard from '../components/doc/NextCard.astro';
import RelatedList from '../components/doc/RelatedList.astro';
import SourceList from '../components/doc/SourceList.astro';
import { getDomain } from '../data/domains';
import { nextInDomain, type DocCard } from '../lib/catalog';
import { analyzeEntry, getCards, type DocEntry } from '../lib/content';
import { domainPath } from '../lib/paths';

interface Props {
  entry: DocEntry;
}

const { entry } = Astro.props;
const cards = await getCards();
const byId = new Map(cards.map((c) => [c.id, c]));
const card = byId.get(entry.id)!;
const domain = getDomain(entry.data.domain)!;
const analysis = analyzeEntry(entry);
const pick = (ids: readonly string[]) => ids.map((id) => byId.get(id)).filter((c): c is DocCard => c !== undefined);
const related = pick(entry.data.related.map((r) => r.id));
const usedConcepts = entry.data.type === 'guide' ? pick(analysis.termSlugs) : [];
const next = nextInDomain(cards, entry.id);
---
<BaseLayout title={entry.data.title} description={entry.data.summary} surface="white" backHref={domainPath(domain.id)} barTitle={entry.data.title}>
  <article class="doc" data-pagefind-body>
    {entry.data.keywords.length > 0 && <span hidden data-pagefind-meta={`keywords:${entry.data.keywords.join(', ')}`}></span>}
    <DocHeader
      domainName={domain.name}
      title={entry.data.title}
      summary={entry.data.summary}
      type={entry.data.type}
      readingMinutes={card.readingMinutes}
      updated={entry.data.updated}
    />
    <div class="prose"><slot /></div>
  </article>
  {usedConcepts.length > 0 && <RelatedList title="이 글에 쓰인 개념" items={usedConcepts} marker="used-concepts" />}
  <SourceList sources={entry.data.sources} />
  {related.length > 0 && <RelatedList title="관련 개념" items={related} marker="related" />}
  {next && <NextCard doc={next} />}
</BaseLayout>
```

`src/pages/[domain]/[slug].astro`:

```astro
---
import type { GetStaticPaths } from 'astro';
import { render } from 'astro:content';
import DocLayout from '../../layouts/DocLayout.astro';
import { mdxComponents } from '../../components/content';
import { getPublishedDocs, type DocEntry } from '../../lib/content';

export const getStaticPaths = (async () => {
  const entries = await getPublishedDocs();
  return entries.map((entry) => {
    const [domain, slug] = entry.id.split('/');
    return { params: { domain, slug }, props: { entry } };
  });
}) satisfies GetStaticPaths;

interface Props {
  entry: DocEntry;
}

const { entry } = Astro.props;
const { Content } = await render(entry);
---
<DocLayout entry={entry}>
  <Content components={mdxComponents} />
</DocLayout>
```

- [ ] **Step 9: 테스트 전용 글 쓰기**

`tests/fixtures/docs/foundations/alpha.mdx`:

````mdx
---
title: 알파 개념
summary: 테스트용 개념 글이에요. 백분위수라는 단어를 담고 있어요.
domain: foundations
type: concept
order: 1
icon: chart-column
keywords: [꼬리 지연, tail latency]
related: [foundations/beta]
sources:
  - title: 알파 테스트 출처
    url: https://example.com/alpha
updated: 2026-10-01
---

<OnDashboard title="응답시간" caption="테스트용 위젯 설명이에요.">
  위젯 자리예요.
</OnDashboard>

<KeyPoints>
  <Point title="첫 번째 핵심">
    응답은 보통 1~2초 또는 3~4초예요. 백분위수는 느린 요청을 드러내요. <Term slug="foundations/beta">베타 개념</Term>과 함께 봐요.
  </Point>
  <Point title="긴 이름도 화면을 넘지 않아요">
    `container_cpu_cfs_throttled_periods_total_namespace` 같은 이름도 있어요.
  </Point>
</KeyPoints>

<Checkpoints>
  <Check>평균만 보고 있다면 다시 확인하세요.</Check>
</Checkpoints>

<Deeper>
  표와 코드도 화면을 넘지 않아야 해요.

  | 구분 | 아주 긴 열 이름이 들어간 표 | 또 다른 긴 열 이름 | 세 번째 열 이름 |
  | --- | --- | --- | --- |
  | p50 | 0.1초 | 0.2초 | 0.3초 |

  ```text
  histogram_quantile(0.99, sum by (le) (rate(http_server_request_duration_seconds_bucket[5m])))
  ```
</Deeper>
````

`tests/fixtures/docs/foundations/beta.mdx`:

```mdx
---
title: 베타 개념
summary: 두 번째 테스트용 개념 글이에요.
domain: foundations
type: concept
order: 2
icon: gauge
related: [foundations/alpha]
sources:
  - title: 베타 테스트 출처
    url: https://example.com/beta
updated: 2026-10-02
---

<OnDashboard title="처리량">
  위젯 자리예요.
</OnDashboard>

<KeyPoints>
  <Point title="베타의 첫 핵심">
    베타는 두 번째 글이에요.
  </Point>
  <Point title="베타의 둘째 핵심">
    <Term slug="foundations/gamma-guide">감마 가이드</Term>도 읽어 봐요.
  </Point>
</KeyPoints>

<Checkpoints>
  <Check>처리량만 보고 있다면 다시 확인하세요.</Check>
</Checkpoints>
```

`tests/fixtures/docs/foundations/gamma-guide.mdx`:

```mdx
---
title: 감마 가이드
summary: 테스트용 가이드 글이에요. 개념 두 개를 엮어요.
domain: foundations
type: guide
order: 3
sources:
  - title: 감마 테스트 출처
    url: https://example.com/gamma
updated: 2026-10-03
---

<Situation>
  두 화면의 숫자가 달라요. 어느 쪽을 믿어야 할까요?
</Situation>

<FirstLook>
  <Item title="집계 구간">한 점이 몇 초를 대표하는지 봐요.</Item>
  <Item title="계산 방식">평균인지 p99인지 봐요.</Item>
</FirstLook>

## 1. 구간을 맞춰 보세요

<Term slug="foundations/alpha">알파 개념</Term>을 먼저 떠올려요.

## 2. 계산 방식을 확인하세요

<Term slug="foundations/beta">베타 개념</Term>도 함께 봐요.

<Checkpoints>
  <Check>두 화면의 계산식이 다르다면 문서로 남기세요.</Check>
</Checkpoints>
```

`tests/fixtures/docs/foundations/draft-doc.mdx`:

```mdx
---
title: 초안 글
summary: 운영 빌드에서 빠져야 하는 초안이에요.
domain: foundations
type: concept
order: 9
sources:
  - title: 초안 테스트 출처
    url: https://example.com/draft
updated: 2026-10-04
draft: true
---

<OnDashboard title="초안">
  위젯 자리예요.
</OnDashboard>

<KeyPoints>
  <Point title="초안 핵심">
    아직 공개하지 않는 글이에요.
  </Point>
</KeyPoints>

<Checkpoints>
  <Check>초안이 공개되면 다시 확인하세요.</Check>
</Checkpoints>
```

Run: `$env:DOCS_CONTENT_DIR = './tests/fixtures/docs'; npm run lint:content; Remove-Item Env:DOCS_CONTENT_DIR` (PowerShell) 또는 `DOCS_CONTENT_DIR=./tests/fixtures/docs npm run lint:content` (Git Bash)
Expected: `글 4편 검사, 위반 0건`. 위반이 나오면 테스트 글을 고친다. 검사 규칙은 고치지 않는다.

- [ ] **Step 10: 실패하는 E2E 쓰기**

`tests/e2e/helpers.ts`에 추가:

```ts
/** 넘침 검사를 도는 테스트 페이지 목록. 페이지를 늘리는 Task가 여기에 추가한다. */
export const PAGES = ['./', 'foundations/alpha/', 'foundations/beta/', 'foundations/gamma-guide/'];
```

`tests/e2e/layout.spec.ts`의 마지막 테스트("홈에 가로 스크롤이 없다")를 다음으로 바꾼다:

```ts
for (const path of PAGES) {
  test(`가로 스크롤이 없다: ${path}`, async ({ page }) => {
    await page.goto(path);
    await openAllDetails(page);
    await expectNoHorizontalOverflow(page);
  });
}
```

import도 `import { expectNoHorizontalOverflow, openAllDetails, PAGES } from './helpers';`로 바꾼다.

`tests/e2e/doc-page.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test.describe('개념 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('foundations/alpha/');
  });

  test('제목·요약·종류·읽는 시간을 보여 준다', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('알파 개념');
    await expect(page.locator('[data-doc-summary]')).toHaveText('테스트용 개념 글이에요. 백분위수라는 단어를 담고 있어요.');
    await expect(page.locator('[data-doc-type]')).toHaveText('개념');
    await expect(page.locator('[data-reading-time]')).toHaveText('1분');
    await expect(page).toHaveTitle('알파 개념 · DomainDocs');
  });

  test('틀 블록이 순서대로 나온다', async ({ page }) => {
    const blocks = await page.locator('article [data-block]').evaluateAll((els) => els.map((e) => e.getAttribute('data-block')));
    expect(blocks).toEqual(['on-dashboard', 'key-points', 'checkpoints', 'deeper']);
  });

  test('핵심은 제목이 있는 항목 목록이다', async ({ page }) => {
    await expect(page.locator('[data-point] h3')).toHaveText(['첫 번째 핵심', '긴 이름도 화면을 넘지 않아요']);
  });

  test('더 깊이는 기본으로 접혀 있고 누르면 펼쳐진다', async ({ page }) => {
    const deeper = page.locator('details[data-block="deeper"]');
    await expect(deeper).not.toHaveAttribute('open');
    await deeper.locator('summary').click();
    await expect(deeper).toHaveAttribute('open', '');
  });

  test('물결표 범위가 취소선이 되지 않는다', async ({ page }) => {
    await expect(page.locator('article del')).toHaveCount(0);
    await expect(page.locator('article')).toContainText('1~2초 또는 3~4초');
  });

  test('Term은 대상 글로 가는 링크다', async ({ page }) => {
    await expect(page.locator('a.term[data-term="foundations/beta"]')).toHaveAttribute('href', '/DomainDocs/foundations/beta/');
  });

  test('참고 자료, 관련 개념, 다음 글을 보여 준다', async ({ page }) => {
    await expect(page.locator('[data-sources] a')).toHaveAttribute('href', 'https://example.com/alpha');
    await expect(page.locator('[data-related] [data-row]')).toHaveCount(1);
    await expect(page.locator('[data-related] [data-row]')).toContainText('베타 개념');
    await expect(page.locator('[data-next]')).toContainText('베타 개념');
  });

  test('뒤로 가기는 영역 페이지를 가리킨다', async ({ page }) => {
    await expect(page.getByRole('link', { name: '뒤로 가기' })).toHaveAttribute('href', '/DomainDocs/foundations/');
  });
});

test.describe('가이드 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('foundations/gamma-guide/');
  });

  test('틀 블록과 단계 소제목이 나온다', async ({ page }) => {
    const blocks = await page.locator('article [data-block]').evaluateAll((els) => els.map((e) => e.getAttribute('data-block')));
    expect(blocks).toEqual(['situation', 'first-look', 'checkpoints']);
    await expect(page.locator('[data-item]')).toHaveCount(2);
    await expect(page.locator('article h2', { hasText: '1. 구간을 맞춰 보세요' })).toBeVisible();
    await expect(page.locator('[data-doc-type]')).toHaveText('가이드');
  });

  test('이 글에 쓰인 개념을 본문 등장 순서로 모은다', async ({ page }) => {
    await expect(page.locator('[data-used-concepts] .row-title')).toHaveText(['알파 개념', '베타 개념']);
  });

  test('영역의 마지막 공개 글이면 다음 글이 없다', async ({ page }) => {
    await expect(page.locator('[data-next]')).toHaveCount(0);
  });
});

test('초안 글은 운영 빌드에 없다', async ({ request }) => {
  const res = await request.get('foundations/draft-doc/');
  expect(res.status()).toBe(404);
});
```

- [ ] **Step 11: 통과 확인**

Run: `npm run check`
Expected: `0 errors`.

Run: `npm test`
Expected: PASS(모든 단위 테스트).

Run: `npm run test:e2e`
Expected: PASS. `foundations/draft-doc/`은 404.html이 없어 서버의 텍스트 404를 돌려준다. 그래도 상태 코드는 404라 통과한다.

넘침 테스트가 실패하면 넘치는 요소부터 찾는다: `page.evaluate(() => [...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > document.documentElement.clientWidth).map(e => e.outerHTML.slice(0, 80)))`. 고칠 때는 `global.css`의 `overflow-wrap`·`word-break`·`overflow-x`로 해결하고, 테스트 글은 바꾸지 않는다.

- [ ] **Step 12: 커밋**

```bash
git add -A
git commit -m "feat: 콘텐츠 스키마, 개념·가이드 페이지, 틀 블록 컴포넌트 추가

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: 홈, 영역 페이지, 404

**Files:**
- Create: `src/components/ui/Card.astro`, `src/pages/[domain]/index.astro`, `src/pages/404.astro`
- Modify: `src/pages/index.astro`(임시 홈을 실제 홈으로 교체), `tests/e2e/helpers.ts`(PAGES에 `'foundations/'` 추가)
- Test: `tests/e2e/home.spec.ts`, `tests/e2e/links.spec.ts`

**Interfaces:**
- Consumes: `getCards`(Task 5), `DOMAINS`·`Domain`(Task 5), `inDomain`·`sortByOrder`·`recentlyUpdated`·`TYPE_LABEL`(Task 5), `ListRow`(Task 5), `BaseLayout`(Task 4), `withBase`·`domainPath`(Task 1)
- Produces:
  - `<Card title?: string>`: `<section data-card>`
  - 영역 페이지는 공개 글이 1편 이상인 영역만 만든다. 글이 없는 영역은 홈에서 "준비 중" 행(링크 아님)으로만 보인다.
  - `404.html`

- [ ] **Step 1: 실패하는 E2E 쓰기**

`tests/e2e/home.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

const cardWithTitle = (page: import('@playwright/test').Page, title: string) =>
  page.locator('[data-card]').filter({ has: page.getByRole('heading', { name: title, exact: true }) });

test('홈에 영역 4개가 있고, 글이 없는 영역은 준비 중이다', async ({ page }) => {
  await page.goto('./');
  const rows = cardWithTitle(page, '영역').locator('[data-row]');
  await expect(rows).toHaveCount(4);
  await expect(rows.nth(0)).toHaveAttribute('href', '/DomainDocs/foundations/');
  await expect(rows.nth(0)).toContainText('공통 기초');
  await expect(rows.nth(0)).toContainText('3편');
  for (const i of [1, 2, 3]) {
    await expect(rows.nth(i)).toContainText('준비 중');
    await expect(rows.nth(i)).not.toHaveAttribute('href');
  }
});

test('처음이라면 여기부터는 공통 기초를 순서대로 보여 준다', async ({ page }) => {
  await page.goto('./');
  await expect(cardWithTitle(page, '처음이라면 여기부터').locator('.row-title')).toHaveText(['알파 개념', '베타 개념', '감마 가이드']);
});

test('최근 추가된 글은 수정일이 늦은 순서다', async ({ page }) => {
  await page.goto('./');
  await expect(cardWithTitle(page, '최근 추가된 글').locator('.row-title')).toHaveText(['감마 가이드', '베타 개념', '알파 개념']);
});

test('영역 페이지는 가이드와 개념을 나눠 보여 준다', async ({ page }) => {
  await page.goto('foundations/');
  await expect(page.locator('h1')).toHaveText('공통 기초');
  await expect(cardWithTitle(page, '가이드').locator('.row-title')).toHaveText(['감마 가이드']);
  await expect(cardWithTitle(page, '개념').locator('.row-title')).toHaveText(['알파 개념', '베타 개념']);
  await expect(page.getByRole('link', { name: '뒤로 가기' })).toHaveAttribute('href', '/DomainDocs/');
});

test('준비 중인 영역의 페이지는 없다', async ({ request }) => {
  expect((await request.get('apm/')).status()).toBe(404);
});

test('없는 주소는 404 페이지를 보여 준다', async ({ page }) => {
  const res = await page.goto('no-such-page/');
  expect(res?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText('페이지를 찾을 수 없어요');
  await expect(page.getByRole('link', { name: '홈으로 가기' })).toHaveAttribute('href', '/DomainDocs/');
});
```

`tests/e2e/links.spec.ts`(Review Focus 1):

```ts
import { expect, test } from '@playwright/test';

test('사이트의 모든 내부 링크가 base 경로 안에서 200으로 열린다', async ({ request, baseURL }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', '데스크톱에서 한 번만 돈다');
  const start = new URL(baseURL!);
  const basePath = start.pathname; // '/DomainDocs/'
  const queue = [start.toString()];
  const seen = new Set(queue);
  const escaped: string[] = [];

  while (queue.length > 0) {
    const url = queue.shift()!;
    const res = await request.get(url);
    expect(res.status(), url).toBe(200);
    if (!(res.headers()['content-type'] ?? '').includes('text/html')) continue;
    const html = await res.text();
    for (const [, href] of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
      const target = new URL(href, url);
      if (target.origin !== start.origin) continue;
      if (!target.pathname.startsWith(basePath)) {
        escaped.push(`${url} → ${href}`);
        continue;
      }
      const key = `${target.origin}${target.pathname}`;
      if (!seen.has(key)) {
        seen.add(key);
        queue.push(key);
      }
    }
  }
  expect(escaped, 'base 경로 밖을 가리키는 링크').toEqual([]);
  expect(seen.size).toBeGreaterThan(5);
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx playwright test tests/e2e/home.spec.ts tests/e2e/links.spec.ts`
Expected: FAIL. 홈에 카드가 없고, 영역 페이지와 404 페이지도 아직 없다.

- [ ] **Step 3: Card와 페이지 구현**

`src/components/ui/Card.astro`:

```astro
---
interface Props {
  title?: string;
}
const { title } = Astro.props;
---
<section class="card" data-card>
  {title && <h2 class="card-title">{title}</h2>}
  <slot />
</section>

<style>
  .card {
    margin-top: 12px;
    padding: 20px 20px 8px;
    border-radius: var(--radius-card);
    background: var(--color-card);
  }

  .card-title {
    margin: 0 0 4px;
    font-size: 19px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }
</style>
```

`src/pages/index.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import Card from '../components/ui/Card.astro';
import ListRow from '../components/ui/ListRow.astro';
import { DOMAINS } from '../data/domains';
import { SITE } from '../data/site';
import { inDomain, recentlyUpdated, sortByOrder, TYPE_LABEL, type DocCard } from '../lib/catalog';
import { getCards } from '../lib/content';
import { domainPath } from '../lib/paths';

const cards = await getCards();
const starter = sortByOrder(inDomain(cards, 'foundations')).slice(0, 5);
const recent = recentlyUpdated(cards, 5);
const metaOf = (d: DocCard) => `${TYPE_LABEL[d.type]} · ${d.readingMinutes}분`;
---
<BaseLayout surface="grey">
  <section class="hero">
    <h1 class="hero-title" data-page-title>{SITE.headline.split('\n').map((line) => <span>{line}</span>)}</h1>
    <p class="hero-desc">{SITE.description}</p>
  </section>

  <Card title="영역">
    {
      DOMAINS.map((domain) => {
        const count = inDomain(cards, domain.id).length;
        return count > 0 ? (
          <ListRow href={domainPath(domain.id)} icon={domain.icon} title={domain.name} description={domain.description} meta={`${count}편`} />
        ) : (
          <ListRow icon={domain.icon} title={domain.name} description={domain.description} badge="준비 중" />
        );
      })
    }
  </Card>

  {
    starter.length > 0 && (
      <Card title="처음이라면 여기부터">
        {starter.map((d) => <ListRow href={d.url} icon={d.icon} title={d.title} description={d.summary} meta={metaOf(d)} />)}
      </Card>
    )
  }

  {
    recent.length > 0 && (
      <Card title="최근 추가된 글">
        {recent.map((d) => <ListRow href={d.url} icon={d.icon} title={d.title} description={d.summary} meta={metaOf(d)} />)}
      </Card>
    )
  }
</BaseLayout>
```

`src/pages/[domain]/index.astro`:

```astro
---
import type { GetStaticPaths } from 'astro';
import BaseLayout from '../../layouts/BaseLayout.astro';
import Card from '../../components/ui/Card.astro';
import ListRow from '../../components/ui/ListRow.astro';
import { DOMAINS, type Domain } from '../../data/domains';
import { inDomain, sortByOrder, TYPE_LABEL, type DocCard } from '../../lib/catalog';
import { getCards } from '../../lib/content';
import { withBase } from '../../lib/paths';

export const getStaticPaths = (async () => {
  const cards = await getCards();
  return DOMAINS.filter((d) => inDomain(cards, d.id).length > 0).map((domain) => ({ params: { domain: domain.id }, props: { domain } }));
}) satisfies GetStaticPaths;

interface Props {
  domain: Domain;
}

const { domain } = Astro.props;
const docs = sortByOrder(inDomain(await getCards(), domain.id));
const guides = docs.filter((d) => d.type === 'guide');
const concepts = docs.filter((d) => d.type === 'concept');
const metaOf = (d: DocCard) => `${TYPE_LABEL[d.type]} · ${d.readingMinutes}분`;
---
<BaseLayout title={domain.name} description={domain.description} surface="grey" backHref={withBase()} barTitle={domain.name}>
  <section class="hero">
    <h1 class="hero-title" data-page-title>{domain.name}</h1>
    <p class="hero-desc">{domain.description}</p>
  </section>
  {
    guides.length > 0 && (
      <Card title="가이드">
        {guides.map((d) => <ListRow href={d.url} icon={d.icon} title={d.title} description={d.summary} meta={metaOf(d)} />)}
      </Card>
    )
  }
  {
    concepts.length > 0 && (
      <Card title="개념">
        {concepts.map((d) => <ListRow href={d.url} icon={d.icon} title={d.title} description={d.summary} meta={metaOf(d)} />)}
      </Card>
    )
  }
</BaseLayout>
```

`src/pages/404.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
import { withBase } from '../lib/paths';
---
<BaseLayout title="페이지를 찾을 수 없어요" surface="grey">
  <section class="hero">
    <h1 class="hero-title" data-page-title>페이지를 찾을 수 없어요</h1>
    <p class="hero-desc">주소가 바뀌었거나 아직 없는 글이에요.</p>
  </section>
  <a class="home-button pressable" href={withBase()}>홈으로 가기</a>
</BaseLayout>

<style>
  .home-button {
    display: block;
    margin-top: 24px;
    padding: 16px;
    border-radius: 16px;
    background: var(--color-accent);
    font-weight: 600;
    text-align: center;
    color: #fff;
  }
</style>
```

`tests/e2e/helpers.ts`의 `PAGES`에 `'foundations/'`와 `'no-such-page/'`를 추가한다.

- [ ] **Step 4: 통과 확인**

Run: `npm run check`
Expected: `0 errors`.

Run: `npm run test:e2e`
Expected: PASS(모두). 링크 크롤러가 실패하면 `escaped` 목록의 링크를 `withBase`·`docPath`·`domainPath`로 고친다.

- [ ] **Step 5: 커밋**

```bash
git add -A
git commit -m "feat: 홈, 영역 페이지, 404 페이지 추가

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: 개념 미리보기 시트

**Files:**
- Create: `src/components/ui/BottomSheet.astro`, `src/scripts/dialog.ts`, `src/scripts/term-sheet.ts`, `src/components/doc/TermSheet.astro`
- Modify: `src/lib/content.ts`(`TermPreview`, `getTermPreviews` 추가), `src/layouts/DocLayout.astro`(TermSheet 추가)
- Test: `tests/e2e/term-sheet.spec.ts`

**Interfaces:**
- Consumes: `getPublishedDocs`·`analyzeEntry`(Task 5), `getDomain`(Task 5), `TYPE_LABEL`(Task 5), `docPath`(Task 1), `a.term[data-term]`(Task 5)
- Produces:
  - `interface TermPreview { title: string; summary: string; points: string[]; url: string; meta: string }`: `meta`는 `'공통 기초 · 개념'` 형태
  - `getTermPreviews(slugs: readonly string[]): Promise<Record<string, TermPreview>>`
  - `<BottomSheet id: string label: string variant?: 'sheet' | 'full'>`: `<dialog data-sheet>` 안의 `[data-sheet-panel]`이다. `sheet`일 때만 `[data-sheet-handle]`이 있다. Task 8이 `variant="full"`로 쓴다.
  - `openDialog(dialog: HTMLDialogElement, opener?: HTMLElement | null): void`, `closeDialog(dialog: HTMLDialogElement): void`, `setupDialog(dialog: HTMLDialogElement): void`: 바깥 클릭, `[data-sheet-close]`, 손잡이를 80px 넘게 끌어내리면 닫고, 닫히면 연 요소로 포커스를 돌려준다.
  - 시트 표식: `#term-sheet`, `[data-term-meta]`, `[data-term-title]`, `[data-term-summary]`, `[data-term-points-wrap]`, `[data-term-points]`, `[data-term-link]`

- [ ] **Step 1: 실패하는 E2E 쓰기**

`tests/e2e/term-sheet.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test.describe('개념 미리보기 시트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('foundations/alpha/');
  });

  test('개념 링크를 누르면 페이지를 떠나지 않고 시트가 열린다', async ({ page }) => {
    await page.locator('a.term[data-term="foundations/beta"]').click();
    const sheet = page.locator('#term-sheet');
    await expect(sheet).toBeVisible();
    await expect(sheet.locator('[data-term-meta]')).toHaveText('공통 기초 · 개념');
    await expect(sheet.locator('[data-term-title]')).toHaveText('베타 개념');
    await expect(sheet.locator('[data-term-summary]')).toHaveText('두 번째 테스트용 개념 글이에요.');
    await expect(sheet.locator('[data-term-points] li')).toHaveText(['베타의 첫 핵심', '베타의 둘째 핵심']);
    await expect(page).toHaveURL(/foundations\/alpha\/$/);
  });

  test('Esc로 닫히고 포커스가 링크로 돌아온다', async ({ page }) => {
    const link = page.locator('a.term[data-term="foundations/beta"]');
    await link.focus();
    await page.keyboard.press('Enter');
    const sheet = page.locator('#term-sheet');
    await expect(sheet).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
    await expect(link).toBeFocused();
  });

  test('바깥을 누르거나 닫기 버튼을 누르면 닫힌다', async ({ page }) => {
    const link = page.locator('a.term[data-term="foundations/beta"]');
    const sheet = page.locator('#term-sheet');
    await link.click();
    await page.mouse.click(10, 10);
    await expect(sheet).toBeHidden();
    await link.click();
    await sheet.getByRole('button', { name: '닫기' }).click();
    await expect(sheet).toBeHidden();
  });

  test('전체 보기를 누르면 대상 글로 간다', async ({ page }) => {
    await page.locator('a.term[data-term="foundations/beta"]').click();
    await page.locator('#term-sheet').getByRole('link', { name: '전체 보기' }).click();
    await expect(page).toHaveURL(/foundations\/beta\/$/);
  });

  test('Ctrl/Cmd+클릭은 시트를 열지 않고 새 탭으로 연다', async ({ page, context }) => {
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('a.term[data-term="foundations/beta"]').click({ modifiers: ['ControlOrMeta'] }),
    ]);
    await expect(page.locator('#term-sheet')).toBeHidden();
    await newPage.close();
  });

  test('손잡이를 아래로 끌어내리면 닫힌다', async ({ page }) => {
    await page.locator('a.term[data-term="foundations/beta"]').click();
    const handle = page.locator('#term-sheet [data-sheet-handle]');
    const box = (await handle.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2, box.y + 160, { steps: 6 });
    await page.mouse.up();
    await expect(page.locator('#term-sheet')).toBeHidden();
  });
});

test('핵심이 없는 가이드를 가리키면 핵심 목록을 숨긴다', async ({ page }) => {
  await page.goto('foundations/beta/');
  await page.locator('a.term[data-term="foundations/gamma-guide"]').click();
  const sheet = page.locator('#term-sheet');
  await expect(sheet.locator('[data-term-meta]')).toHaveText('공통 기초 · 가이드');
  await expect(sheet.locator('[data-term-points-wrap]')).toBeHidden();
});

test('글이 아닌 페이지에는 미리보기 시트가 없다', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('#term-sheet')).toHaveCount(0);
});

test.describe('JavaScript가 꺼져 있을 때', () => {
  test.use({ javaScriptEnabled: false });

  test('본문이 그대로 보이고 개념 링크는 일반 링크로 동작한다', async ({ page }) => {
    await page.goto('foundations/alpha/');
    await expect(page.locator('[data-point] h3').first()).toHaveText('첫 번째 핵심');
    await page.locator('a.term[data-term="foundations/beta"]').click();
    await expect(page).toHaveURL(/foundations\/beta\/$/);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx playwright test tests/e2e/term-sheet.spec.ts`
Expected: FAIL. 링크를 누르면 대상 글로 이동해 버려서 `#term-sheet`가 보이지 않는다.

- [ ] **Step 3: 미리보기 데이터 구현**

`src/lib/content.ts`에 추가:

```ts
import { getDomain } from '../data/domains';
import { TYPE_LABEL } from './catalog';

export interface TermPreview {
  title: string;
  summary: string;
  points: string[];
  url: string;
  /** '공통 기초 · 개념' 형태 */
  meta: string;
}

/** 페이지에 쓰인 Term의 미리보기 데이터. 빌드할 때 페이지 안에 넣어 두므로 시트를 열 때 네트워크 요청이 없다. */
export async function getTermPreviews(slugs: readonly string[]): Promise<Record<string, TermPreview>> {
  if (slugs.length === 0) return {};
  const byId = new Map((await getPublishedDocs()).map((e) => [e.id, e]));
  const previews: Record<string, TermPreview> = {};
  for (const slug of slugs) {
    const target = byId.get(slug);
    if (!target) continue;
    previews[slug] = {
      title: target.data.title,
      summary: target.data.summary,
      points: analyzeEntry(target).pointTitles,
      url: docPath(target.id),
      meta: `${getDomain(target.data.domain)?.name ?? target.data.domain} · ${TYPE_LABEL[target.data.type]}`,
    };
  }
  return previews;
}
```

`import type { DocCard } from './catalog';`는 `import { TYPE_LABEL, type DocCard } from './catalog';`로 합친다.

- [ ] **Step 4: 대화상자 공통 동작 구현**

`src/scripts/dialog.ts`:

```ts
const openers = new WeakMap<HTMLDialogElement, HTMLElement | null>();
const DRAG_CLOSE_PX = 80;

export function openDialog(dialog: HTMLDialogElement, opener?: HTMLElement | null): void {
  openers.set(dialog, opener ?? (document.activeElement as HTMLElement | null));
  if (!dialog.open) dialog.showModal();
}

export function closeDialog(dialog: HTMLDialogElement): void {
  if (dialog.open) dialog.close();
}

function enableDragToClose(dialog: HTMLDialogElement, handle: HTMLElement, panel: HTMLElement): void {
  let startY: number | null = null;
  handle.addEventListener('pointerdown', (e) => {
    startY = e.clientY;
    handle.setPointerCapture(e.pointerId);
    panel.style.transition = 'none';
  });
  handle.addEventListener('pointermove', (e) => {
    if (startY === null) return;
    panel.style.transform = `translateY(${Math.max(0, e.clientY - startY)}px)`;
  });
  const end = (e: PointerEvent) => {
    if (startY === null) return;
    const dy = e.clientY - startY;
    startY = null;
    panel.style.transition = '';
    panel.style.transform = '';
    if (dy > DRAG_CLOSE_PX) closeDialog(dialog);
  };
  handle.addEventListener('pointerup', end);
  handle.addEventListener('pointercancel', end);
}

/** 바깥 클릭·닫기 버튼·끌어내리기로 닫고, 닫히면 연 요소로 포커스를 돌려준다. Esc는 브라우저가 처리한다. */
export function setupDialog(dialog: HTMLDialogElement): void {
  if (dialog.dataset.ready === 'true') return;
  dialog.dataset.ready = 'true';
  dialog.addEventListener('close', () => {
    const opener = openers.get(dialog);
    openers.delete(dialog);
    opener?.focus();
  });
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) closeDialog(dialog);
  });
  dialog.querySelectorAll<HTMLElement>('[data-sheet-close]').forEach((b) => b.addEventListener('click', () => closeDialog(dialog)));
  const handle = dialog.querySelector<HTMLElement>('[data-sheet-handle]');
  const panel = dialog.querySelector<HTMLElement>('[data-sheet-panel]');
  if (handle && panel) enableDragToClose(dialog, handle, panel);
}
```

`src/components/ui/BottomSheet.astro`:

```astro
---
interface Props {
  id: string;
  label: string;
  variant?: 'sheet' | 'full';
}
const { id, label, variant = 'sheet' } = Astro.props;
---
<dialog id={id} class:list={['sheet', `sheet-${variant}`]} aria-label={label} data-sheet>
  <div class="sheet-panel" data-sheet-panel>
    {variant === 'sheet' && <div class="sheet-handle" data-sheet-handle aria-hidden="true"></div>}
    <slot />
  </div>
</dialog>

<style>
  .sheet {
    width: 100%;
    max-width: none;
    height: 100%;
    max-height: none;
    margin: 0;
    padding: 0;
    border: 0;
    background: transparent;
  }

  .sheet[open] {
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }

  .sheet::backdrop {
    background: rgba(0, 0, 0, 0.4);
  }

  .sheet-panel {
    width: 100%;
    max-width: var(--content-width);
    max-height: 85vh;
    overflow-y: auto;
    padding: 12px 24px calc(24px + env(safe-area-inset-bottom));
    border-radius: 24px 24px 0 0;
    background: var(--color-card);
    box-shadow: var(--shadow-sheet);
    color: var(--color-text);
    animation: sheet-up 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
  }

  .sheet-handle {
    width: 40px;
    height: 5px;
    margin: 0 auto 16px;
    border-radius: 3px;
    background: var(--color-line);
    cursor: grab;
    touch-action: none;
  }

  /* 검색: 모바일은 화면 전체, 데스크톱은 위쪽 카드 */
  .sheet-full[open] {
    align-items: stretch;
  }

  .sheet-full .sheet-panel {
    height: 100%;
    max-height: none;
    border-radius: 0;
    animation: sheet-fade 0.2s ease;
  }

  @media (min-width: 720px) {
    .sheet-full[open] {
      align-items: flex-start;
      padding-top: 64px;
    }

    .sheet-full .sheet-panel {
      height: auto;
      max-height: 80vh;
      border-radius: 24px;
    }
  }

  @keyframes sheet-up {
    from {
      transform: translateY(100%);
    }
  }

  @keyframes sheet-fade {
    from {
      opacity: 0;
    }
  }
</style>
```

- [ ] **Step 5: 미리보기 시트 구현**

`src/scripts/term-sheet.ts`:

```ts
import { openDialog, setupDialog } from './dialog';

interface TermPreview {
  title: string;
  summary: string;
  points: string[];
  url: string;
  meta: string;
}

export function initTermSheet(): void {
  const dataEl = document.getElementById('term-previews');
  const dialog = document.getElementById('term-sheet') as HTMLDialogElement | null;
  if (!dataEl || !dialog) return;
  const previews = JSON.parse(dataEl.textContent ?? '{}') as Record<string, TermPreview>;
  setupDialog(dialog);
  const part = <T extends HTMLElement>(selector: string) => dialog.querySelector<T>(selector)!;

  document.addEventListener('click', (event) => {
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[data-term]');
    if (!link) return;
    // 새 탭·새 창 열기는 브라우저에 맡긴다.
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const preview = previews[link.dataset.term ?? ''];
    if (!preview) return;
    event.preventDefault();
    part('[data-term-meta]').textContent = preview.meta;
    part('[data-term-title]').textContent = preview.title;
    part('[data-term-summary]').textContent = preview.summary;
    part('[data-term-points]').replaceChildren(
      ...preview.points.map((p) => Object.assign(document.createElement('li'), { textContent: p })),
    );
    part('[data-term-points-wrap]').hidden = preview.points.length === 0;
    part<HTMLAnchorElement>('[data-term-link]').href = preview.url;
    openDialog(dialog, link);
  });
}
```

`src/components/doc/TermSheet.astro`:

```astro
---
import BottomSheet from '../ui/BottomSheet.astro';
import type { TermPreview } from '../../lib/content';

interface Props {
  previews: Record<string, TermPreview>;
}
const { previews } = Astro.props;
const hasPreviews = Object.keys(previews).length > 0;
// </script> 같은 문자열이 JSON 안에서 태그를 닫지 않도록 <를 이스케이프한다.
const json = JSON.stringify(previews).replace(/</g, '\\u003c');
---
{
  hasPreviews && (
    <>
      <script type="application/json" id="term-previews" set:html={json}></script>
      <BottomSheet id="term-sheet" label="개념 미리보기">
        <p class="sheet-meta" data-term-meta></p>
        <h2 class="sheet-title" data-term-title></h2>
        <p class="sheet-summary" data-term-summary></p>
        <div class="sheet-points-wrap" data-term-points-wrap>
          <h3 class="sheet-subtitle">핵심</h3>
          <ol class="sheet-points" data-term-points></ol>
        </div>
        <div class="sheet-actions">
          <a class="sheet-primary pressable" href="#" data-term-link>전체 보기</a>
          <button class="sheet-secondary pressable" type="button" data-sheet-close>닫기</button>
        </div>
      </BottomSheet>
    </>
  )
}

<script>
  import { initTermSheet } from '../../scripts/term-sheet';
  initTermSheet();
</script>

<style>
  .sheet-meta {
    margin: 0;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-accent);
  }

  .sheet-title {
    margin: 6px 0 8px;
    font-size: 22px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .sheet-summary {
    margin: 0;
    color: var(--color-text-sub);
  }

  .sheet-subtitle {
    margin: 24px 0 8px;
    font-size: 15px;
    font-weight: 700;
  }

  .sheet-points {
    margin: 0;
    padding-left: 1.25em;
  }

  /* 목록 항목은 스크립트가 만들어 범위 스타일이 닿지 않는다 */
  .sheet-points :global(li + li) {
    margin-top: 4px;
  }

  .sheet-actions {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 8px;
    margin-top: 28px;
  }

  .sheet-primary,
  .sheet-secondary {
    padding: 14px 18px;
    border: 0;
    border-radius: 14px;
    font-weight: 600;
    text-align: center;
  }

  .sheet-primary {
    background: var(--color-accent);
    color: #fff;
  }

  .sheet-secondary {
    background: var(--color-bg);
    color: var(--color-text);
  }
</style>
```

`src/layouts/DocLayout.astro`를 고친다. 프론트매터에 다음을 더한다:

```ts
import TermSheet from '../components/doc/TermSheet.astro';
import { analyzeEntry, getCards, getTermPreviews, type DocEntry } from '../lib/content';
// …
const termPreviews = await getTermPreviews(analysis.termSlugs);
```

`</BaseLayout>` 바로 앞에 `<TermSheet previews={termPreviews} slot="end" />`을 넣는다.

- [ ] **Step 6: 통과 확인**

Run: `npm run check`
Expected: `0 errors`.

Run: `npx playwright test tests/e2e/term-sheet.spec.ts`
Expected: PASS(두 프로젝트 모두).

Run: `npm run test:e2e`
Expected: PASS(앞선 테스트도 그대로 통과).

- [ ] **Step 7: 커밋**

```bash
git add -A
git commit -m "feat: 개념 링크를 누르면 페이지를 떠나지 않고 미리보기 시트를 연다

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: 검색

**Files:**
- Create: `src/components/ui/SearchOverlay.astro`, `src/scripts/search.ts`
- Modify: `package.json`(pagefind 의존성, build 스크립트), `src/layouts/BaseLayout.astro`(SearchOverlay 추가)
- Test: `tests/e2e/search.spec.ts`

**Interfaces:**
- Consumes: `BottomSheet`(`variant="full"`)·`openDialog`·`setupDialog`(Task 7), TopBar의 `[data-search-open]`(Task 4), DocLayout의 `article[data-pagefind-body]`와 `data-pagefind-meta="keywords:…"`(Task 5), `withBase`(Task 1)
- Produces:
  - `build` 스크립트: `npm run lint:content && astro build && pagefind --site dist`
  - 검색 표식: `#search-dialog`, 입력창(role `searchbox`, 이름 "검색어"), `[data-search-status]`(role `status`), `[data-search-result]`(결과 링크)
  - 단축키 `/`(입력 중이 아닐 때)로 열고, Esc로 닫는다.

- [ ] **Step 1: 실패하는 E2E 쓰기**

`tests/e2e/search.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test.describe('검색', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
  });

  test('검색 버튼으로 열고, 결과를 눌러 글로 간다', async ({ page }) => {
    await page.getByRole('button', { name: '검색' }).click();
    const input = page.getByRole('searchbox', { name: '검색어' });
    await expect(input).toBeFocused();
    await input.fill('백분위수');
    const first = page.locator('[data-search-result]').first();
    await expect(first).toContainText('알파 개념');
    await first.click();
    await expect(page).toHaveURL(/\/DomainDocs\/foundations\/alpha\/$/);
  });

  test('앞부분만 입력해도 찾는다', async ({ page }) => {
    await page.getByRole('button', { name: '검색' }).click();
    await page.getByRole('searchbox', { name: '검색어' }).fill('백분위');
    await expect(page.locator('[data-search-result]').first()).toContainText('알파 개념');
  });

  test('검색용 별칭(keywords)으로도 찾는다', async ({ page }) => {
    await page.getByRole('button', { name: '검색' }).click();
    await page.getByRole('searchbox', { name: '검색어' }).fill('꼬리');
    await expect(page.locator('[data-search-result]').first()).toContainText('알파 개념');
  });

  test('본문 밖(홈 카드 제목)은 색인하지 않는다', async ({ page }) => {
    await page.getByRole('button', { name: '검색' }).click();
    await page.getByRole('searchbox', { name: '검색어' }).fill('처음이라면');
    await expect(page.locator('[data-search-status]')).toContainText('맞는 글이 없어요');
    await expect(page.locator('[data-search-result]')).toHaveCount(0);
  });

  test('/ 키로 열고 Esc로 닫는다', async ({ page }) => {
    await page.keyboard.press('/');
    const dialog = page.locator('#search-dialog');
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });
});

test('검색 색인을 불러오지 못하면 안내 문구를 보여 준다', async ({ page }) => {
  await page.route('**/pagefind/pagefind.js', (route) => route.abort());
  await page.goto('./');
  await page.getByRole('button', { name: '검색' }).click();
  await page.getByRole('searchbox', { name: '검색어' }).fill('백분위수');
  await expect(page.locator('[data-search-status]')).toHaveText('검색 색인을 불러오지 못했어요. 빌드한 사이트에서 다시 시도해 주세요.');
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx playwright test tests/e2e/search.spec.ts`
Expected: FAIL. 검색 버튼을 눌러도 아무 일이 없다.

- [ ] **Step 3: Pagefind 설치와 빌드 스크립트**

```bash
npm install -D pagefind@^1.5.2
```

`package.json`의 `build`를 `"npm run lint:content && astro build && pagefind --site dist"`로 바꾼다.

- [ ] **Step 4: 검색 구현**

`src/scripts/search.ts`:

```ts
import { openDialog, setupDialog } from './dialog';

interface PagefindResultData {
  url: string;
  meta: { title?: string };
  excerpt: string;
}

interface Pagefind {
  init(): Promise<void>;
  options(opts: Record<string, unknown>): Promise<void>;
  search(query: string): Promise<{ results: { data(): Promise<PagefindResultData> }[] }>;
}

const MAX_RESULTS = 10;
let pagefindPromise: Promise<Pagefind> | null = null;

function loadPagefind(url: string): Promise<Pagefind> {
  pagefindPromise ??= (import(/* @vite-ignore */ url) as Promise<Pagefind>)
    .then(async (pf) => {
      // 한국어는 어간 분석이 없어 조사 붙은 단어 점수가 낮다. 유사어 감점을 끈다(사전 실험 결과).
      await pf.options({ ranking: { termSimilarity: 0 } });
      await pf.init();
      return pf;
    })
    .catch((error: unknown) => {
      pagefindPromise = null;
      throw error;
    });
  return pagefindPromise;
}

function renderResult(d: PagefindResultData): HTMLLIElement {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.className = 'search-result pressable';
  a.href = d.url;
  a.dataset.searchResult = '';
  const title = document.createElement('span');
  title.className = 'search-result-title';
  title.textContent = d.meta.title ?? d.url;
  const excerpt = document.createElement('span');
  excerpt.className = 'search-result-excerpt';
  // Pagefind 발췌문은 우리 글에서 뽑은 텍스트에 <mark>만 더한 HTML이다.
  excerpt.innerHTML = d.excerpt;
  a.append(title, excerpt);
  li.append(a);
  return li;
}

export function initSearch(): void {
  const dialog = document.getElementById('search-dialog') as HTMLDialogElement | null;
  const input = dialog?.querySelector<HTMLInputElement>('[data-search-input]');
  const status = dialog?.querySelector<HTMLElement>('[data-search-status]');
  const list = dialog?.querySelector<HTMLOListElement>('[data-search-results]');
  if (!dialog || !input || !status || !list) return;
  setupDialog(dialog);
  const url = input.dataset.pagefindUrl!;

  const open = (opener: HTMLElement | null) => {
    if (dialog.open) return;
    openDialog(dialog, opener);
    input.focus();
    input.select();
    void loadPagefind(url).catch(() => undefined);
  };

  document.querySelectorAll<HTMLElement>('[data-search-open]').forEach((button) => button.addEventListener('click', () => open(button)));
  document.addEventListener('keydown', (e) => {
    if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
    const target = e.target as HTMLElement | null;
    if (target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return;
    e.preventDefault();
    open(null);
  });

  let seq = 0;
  input.addEventListener('input', async () => {
    const query = input.value.trim();
    const mySeq = ++seq;
    if (!query) {
      list.replaceChildren();
      status.textContent = '';
      return;
    }
    let data: PagefindResultData[];
    try {
      const pf = await loadPagefind(url);
      const found = await pf.search(query);
      data = await Promise.all(found.results.slice(0, MAX_RESULTS).map((r) => r.data()));
    } catch {
      if (mySeq !== seq) return;
      list.replaceChildren();
      status.textContent = '검색 색인을 불러오지 못했어요. 빌드한 사이트에서 다시 시도해 주세요.';
      return;
    }
    if (mySeq !== seq) return;
    status.textContent = data.length > 0 ? `${data.length}개를 찾았어요` : `'${query}'에 맞는 글이 없어요`;
    list.replaceChildren(...data.map(renderResult));
  });
}
```

`src/components/ui/SearchOverlay.astro`:

```astro
---
import { Search, X } from '@lucide/astro';
import BottomSheet from './BottomSheet.astro';
import { withBase } from '../../lib/paths';
---
<BottomSheet id="search-dialog" label="검색" variant="full">
  <div class="search-bar">
    <Search class="search-icon" size={20} aria-hidden="true" />
    <input
      class="search-input"
      type="search"
      placeholder="개념이나 지표 이름으로 검색해요"
      aria-label="검색어"
      autocomplete="off"
      enterkeyhint="search"
      data-search-input
      data-pagefind-url={withBase('pagefind/pagefind.js')}
    />
    <button class="search-close pressable" type="button" data-sheet-close aria-label="검색 닫기">
      <X size={22} aria-hidden="true" />
    </button>
  </div>
  <p class="search-status" role="status" aria-live="polite" data-search-status></p>
  <ol class="search-results" data-search-results></ol>
</BottomSheet>

<script>
  import { initSearch } from '../../scripts/search';
  initSearch();
</script>

<style>
  .search-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 4px 4px 14px;
    border-radius: 14px;
    background: var(--color-bg);
  }

  .search-icon {
    flex: none;
    color: var(--color-text-weak);
  }

  .search-input {
    flex: 1;
    min-width: 0;
    padding: 12px 0;
    border: 0;
    outline: none;
    background: transparent;
    font: inherit;
    color: var(--color-text);
  }

  .search-close {
    display: grid;
    flex: none;
    place-items: center;
    width: 40px;
    height: 40px;
    border: 0;
    border-radius: 12px;
    background: transparent;
  }

  .search-status {
    margin: 16px 4px 4px;
    font-size: 14px;
    color: var(--color-text-weak);
  }

  .search-results {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  /* 결과는 스크립트가 만들어 범위 스타일이 닿지 않는다 */
  .search-results :global(.search-result) {
    display: flex;
    flex-direction: column;
    gap: 2px;
    margin: 0 -8px;
    padding: 12px 8px;
    border-radius: var(--radius-row);
  }

  .search-results :global(.search-result-title) {
    font-weight: 600;
  }

  .search-results :global(.search-result-excerpt) {
    display: -webkit-box;
    overflow: hidden;
    font-size: 15px;
    color: var(--color-text-sub);
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .search-results :global(mark) {
    background: transparent;
    font-weight: 600;
    color: var(--color-accent);
  }
</style>
```

`src/layouts/BaseLayout.astro`에서 `import SearchOverlay from '../components/ui/SearchOverlay.astro';`를 더하고, `<slot name="end" />` 바로 앞에 `<SearchOverlay />`를 넣는다.

- [ ] **Step 5: 통과 확인**

Run: `npm run build`(실제 글 기준, 아직 0편)
Expected: 성공한다. 실제 글이 0편이면 `data-pagefind-body`가 있는 페이지가 없다. 이때 Pagefind는 홈과 404를 통째로 색인한다는 안내를 낸다. 실제 글이 들어오는 Task 12부터는 글만 색인하므로 그대로 둔다. 명령이 0이 아닌 코드로 끝나면 오류 메시지를 그대로 기록하고 사이트 주인에게 보고한다.

Run: `npx playwright test tests/e2e/search.spec.ts`
Expected: PASS(두 프로젝트). "앞부분만 입력해도 찾는다" 또는 "검색용 별칭" 테스트가 실패하면 사전 실험 기록(스펙 13장)과 비교한다. 기대값을 바꾸지 말고 사이트 주인에게 보고한다.

Run: `npm run test:e2e`
Expected: PASS(전체).

- [ ] **Step 6: 커밋**

```bash
git add -A
git commit -m "feat: Pagefind 기반 전체 화면 검색 추가

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: 대시보드 미니 차트(MiniLineChart, StatTile)

**Files:**
- Create: `src/lib/viz/line.ts`, `src/components/viz/MiniLineChart.astro`, `src/components/viz/StatTile.astro`
- Modify: `src/components/content/index.ts`(두 컴포넌트 등록), `tests/fixtures/docs/foundations/alpha.mdx`(OnDashboard 안을 차트로)
- Test: `tests/unit/viz-line.test.ts`, `tests/e2e/viz.spec.ts`

**Interfaces:**
- Consumes: `OnDashboard`의 `.widget-body`(차트는 한 줄 전체, `[data-stat]`은 나란히 놓인다. Task 5)
- Produces:
  - `interface ChartBox { width: number; height: number; padding: number }`
  - `niceMax(values: readonly number[]): number`: 최댓값의 1.1배 이상인 1·1.2·1.5·2·2.5·3·4·5·6·8·10 × 10ⁿ 중 가장 작은 값. 비거나 0이면 1이다.
  - `pointsOf(values, max, box): [number, number][]`, `linePath(values: readonly number[], max: number, box: ChartBox): string`: 소수 둘째 자리까지 쓴 `M x y L x y …` 경로. 값이 하나면 가로선, 없으면 `''`이다.
  - `<MiniLineChart series: { label: string; values: number[]; tone?: 'accent' | 'sub' | 'warn'; value?: string }[] ariaLabel: string yMax?: number height?: number />`: `[data-mini-chart]` 안에 `svg[role="img"]`가 있다.
  - `<StatTile label value unit? tone?: 'default' | 'accent' | 'warn' note? />`: `[data-stat]`
  - `mdxComponents`에 `MiniLineChart`, `StatTile`을 추가한다.

- [ ] **Step 0: dataviz 스킬 읽기**

차트 코드를 쓰기 전에 `dataviz` 스킬을 불러 읽는다. 색은 이 스펙의 토큰(`--color-accent`, `--color-text-sub`, `--color-warn`) 세 가지만 쓴다. 스킬의 팔레트는 가져오지 않는다. 마크 굵기, 축 생략, 범례 위치처럼 이 스펙이 정하지 않은 부분만 스킬의 기본값을 따른다.

- [ ] **Step 1: 실패하는 단위 테스트 쓰기**

`tests/unit/viz-line.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { linePath, niceMax, pointsOf } from '../../src/lib/viz/line';

const BOX = { width: 100, height: 50, padding: 0 };

describe('niceMax', () => {
  it.each([
    [[95], 120],
    [[3000], 4000],
    [[187], 250],
    [[45, 41], 50],
  ])('%j → %d', (values, expected) => {
    expect(niceMax(values)).toBe(expected);
  });
  it('값이 없거나 0이면 1이다', () => {
    expect(niceMax([])).toBe(1);
    expect(niceMax([0, 0])).toBe(1);
  });
});

describe('linePath', () => {
  it('왼쪽 아래에서 오른쪽 위로 그린다', () => {
    expect(linePath([0, 10], 10, BOX)).toBe('M0 50 L100 0');
  });
  it('여백을 뺀 안쪽에 그린다', () => {
    expect(linePath([0, 10], 10, { width: 100, height: 50, padding: 10 })).toBe('M10 40 L90 10');
  });
  it('점 사이 간격이 같다', () => {
    expect(pointsOf([0, 0, 0], 10, BOX).map(([x]) => x)).toEqual([0, 50, 100]);
  });
  it('값이 하나면 가로선이다', () => {
    expect(linePath([5], 10, BOX)).toBe('M0 25 L100 25');
  });
  it('최댓값을 넘거나 음수인 값은 경계에 붙인다', () => {
    expect(linePath([20, -5], 10, BOX)).toBe('M0 0 L100 50');
  });
  it('값이 없으면 빈 경로다', () => {
    expect(linePath([], 10, BOX)).toBe('');
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run tests/unit/viz-line.test.ts`
Expected: FAIL. `src/lib/viz/line`을 찾을 수 없다는 오류가 난다.

- [ ] **Step 3: 좌표 계산 구현**

`src/lib/viz/line.ts`:

```ts
export interface ChartBox {
  width: number;
  height: number;
  padding: number;
}

const round = (n: number) => Math.round(n * 100) / 100;
const NICE_STEPS = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];

/** y축 상한. 최댓값의 1.1배 이상인 '보기 좋은' 수 중 가장 작은 값. */
export function niceMax(values: readonly number[]): number {
  const target = Math.max(0, ...values) * 1.1;
  if (target <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(target));
  const step = NICE_STEPS.find((s) => s * magnitude >= target) ?? 10;
  return round(step * magnitude);
}

export function pointsOf(values: readonly number[], max: number, box: ChartBox): [number, number][] {
  const innerW = box.width - box.padding * 2;
  const innerH = box.height - box.padding * 2;
  const n = values.length;
  return values.map((v, i) => {
    const x = box.padding + (n === 1 ? innerW / 2 : (innerW * i) / (n - 1));
    const clamped = Math.min(Math.max(v, 0), max);
    const y = box.height - box.padding - (clamped / max) * innerH;
    return [round(x), round(y)];
  });
}

export function linePath(values: readonly number[], max: number, box: ChartBox): string {
  if (values.length === 0) return '';
  const pts = pointsOf(values, max, box);
  if (pts.length === 1) {
    const y = pts[0][1];
    return `M${box.padding} ${y} L${box.width - box.padding} ${y}`;
  }
  return pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join(' ');
}
```

- [ ] **Step 4: 단위 테스트 통과 확인**

Run: `npx vitest run tests/unit/viz-line.test.ts`
Expected: PASS.

- [ ] **Step 5: 실패하는 E2E 쓰기**

`tests/fixtures/docs/foundations/alpha.mdx`의 OnDashboard 블록을 다음으로 바꾼다:

```mdx
<OnDashboard title="응답시간" caption="테스트용 위젯 설명이에요.">
  <MiniLineChart
    ariaLabel="평균은 잔잔하고 p99만 튀는 응답시간 그래프"
    series={[
      { label: '평균', values: [130, 128, 131, 187, 130, 129], tone: 'sub', value: '187ms' },
      { label: 'p99', values: [160, 158, 160, 3000, 160, 159], tone: 'warn', value: '3,000ms' },
    ]}
  />
  <StatTile label="평균" value="187" unit="ms" />
  <StatTile label="p99" value="3,000" unit="ms" tone="warn" note="평소의 19배" />
</OnDashboard>
```

`tests/e2e/viz.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('foundations/alpha/');
});

test('대시보드 그림에 설명이 붙은 차트와 숫자 타일이 있다', async ({ page }) => {
  const block = page.locator('[data-block="on-dashboard"]');
  await expect(block.getByRole('img', { name: '평균은 잔잔하고 p99만 튀는 응답시간 그래프' })).toBeVisible();
  await expect(block.locator('[data-mini-chart] path.line')).toHaveCount(2);
  await expect(block.locator('[data-mini-chart] .legend li')).toHaveText(['평균187ms', 'p993,000ms']);
  await expect(block.locator('[data-stat]')).toHaveCount(2);
  await expect(block.locator('[data-stat]').nth(1)).toContainText('3,000ms');
  await expect(block.locator('[data-stat]').nth(1)).toContainText('평소의 19배');
});

test('숫자 타일 두 개가 한 줄에 놓인다', async ({ page }) => {
  const tiles = page.locator('[data-block="on-dashboard"] [data-stat]');
  const [a, b] = [await tiles.nth(0).boundingBox(), await tiles.nth(1).boundingBox()];
  expect(Math.abs(a!.y - b!.y)).toBeLessThan(2);
});
```

- [ ] **Step 6: 실패 확인**

Run: `npx playwright test tests/e2e/viz.spec.ts`
Expected: FAIL. 빌드가 `Expected component MiniLineChart to be defined`로 실패한다.

- [ ] **Step 7: 차트 컴포넌트 구현**

`src/components/viz/MiniLineChart.astro`:

```astro
---
import { linePath, niceMax, type ChartBox } from '../../lib/viz/line';

interface Series {
  label: string;
  values: number[];
  tone?: 'accent' | 'sub' | 'warn';
  /** 범례에 표시할 값(예: '3,000ms'). 없으면 범례에 이름만 나온다. */
  value?: string;
}

interface Props {
  series: Series[];
  ariaLabel: string;
  yMax?: number;
  height?: number;
}

const { series, ariaLabel, yMax, height = 120 } = Astro.props;
const box: ChartBox = { width: 320, height, padding: 6 };
const max = yMax ?? niceMax(series.flatMap((s) => s.values));
---
<div class="mini-chart" data-mini-chart>
  <svg viewBox={`0 0 ${box.width} ${box.height}`} preserveAspectRatio="none" role="img" aria-label={ariaLabel} style={`height:${height}px`}>
    <line class="baseline" x1="0" x2={box.width} y1={box.height - box.padding} y2={box.height - box.padding} />
    {series.map((s) => <path class={`line tone-${s.tone ?? 'accent'}`} d={linePath(s.values, max, box)} vector-effect="non-scaling-stroke" />)}
  </svg>
  <ul class="legend">
    {
      series.map((s) => (
        <li>
          <span class={`swatch tone-${s.tone ?? 'accent'}`} aria-hidden="true"></span>
          <span>{s.label}</span>
          {s.value && <strong class="legend-value">{s.value}</strong>}
        </li>
      ))
    }
  </ul>
</div>

<style>
  .mini-chart svg {
    width: 100%;
  }

  .baseline {
    stroke: var(--color-line);
    stroke-width: 1;
    vector-effect: non-scaling-stroke;
  }

  .line {
    fill: none;
    stroke-width: 2.5;
    stroke-linecap: round;
    stroke-linejoin: round;
  }

  .tone-accent {
    stroke: var(--color-accent);
    background: var(--color-accent);
  }

  .tone-sub {
    stroke: var(--color-text-sub);
    background: var(--color-text-sub);
  }

  .tone-warn {
    stroke: var(--color-warn);
    background: var(--color-warn);
  }

  .legend {
    display: flex;
    flex-wrap: wrap;
    gap: 6px 16px;
    margin: 10px 0 0;
    padding: 0;
    list-style: none;
    font-size: 14px;
    color: var(--color-text-sub);
  }

  .legend li {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .swatch {
    display: inline-block;
    width: 12px;
    height: 3px;
    border-radius: 2px;
  }

  .legend-value {
    font-weight: 700;
    color: var(--color-text);
  }
</style>
```

`src/components/viz/StatTile.astro`:

```astro
---
interface Props {
  label: string;
  value: string;
  unit?: string;
  tone?: 'default' | 'accent' | 'warn';
  note?: string;
}
const { label, value, unit, tone = 'default', note } = Astro.props;
---
<div class:list={['stat', `tone-${tone}`]} data-stat>
  <span class="stat-label">{label}</span>
  <span class="stat-value">{value}{unit && <span class="stat-unit">{unit}</span>}</span>
  {note && <span class="stat-note">{note}</span>}
</div>

<style>
  .stat {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 14px 16px;
    border-radius: 16px;
    background: var(--color-card);
  }

  .stat-label {
    font-size: 14px;
    color: var(--color-text-sub);
  }

  .stat-value {
    font-size: 24px;
    font-weight: 700;
    letter-spacing: -0.02em;
    font-variant-numeric: tabular-nums;
  }

  .stat-unit {
    margin-left: 2px;
    font-size: 15px;
    font-weight: 600;
  }

  .stat-note {
    font-size: 13px;
    color: var(--color-text-weak);
  }

  .tone-accent .stat-value {
    color: var(--color-accent);
  }

  .tone-warn .stat-value {
    color: var(--color-warn);
  }
</style>
```

`src/components/content/index.ts`에서 두 컴포넌트를 import하고 `mdxComponents`에 `MiniLineChart, StatTile`을 추가한다.

- [ ] **Step 8: 통과 확인**

Run: `npm run check`
Expected: `0 errors`.

Run: `npm run test:e2e`
Expected: PASS(전체). 범례 텍스트가 `'평균 187ms'`처럼 공백을 포함해 실패하면, 마크업은 그대로 두고 기대값을 실제 렌더링 결과(`compressHTML: 'jsx'`가 줄바꿈 공백을 지운 결과)에 맞춘다. 화면에서 이름과 값 사이 간격은 CSS `gap`이 만든다.

- [ ] **Step 9: 커밋**

```bash
git add -A
git commit -m "feat: 글에서 숫자만 넣어 쓰는 대시보드 미니 차트와 숫자 타일 추가

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: 백분위수 데모(PercentileDemo)

**Files:**
- Create: `src/lib/stats.ts`, `src/lib/demo-data.ts`, `src/components/demos/PercentileDemo.tsx`, `src/components/demos/demo.css`, `tests/fixtures/docs/foundations/demos.mdx`
- Modify: `tests/e2e/helpers.ts`(`waitForIsland` 추가, PAGES에 `'foundations/demos/'` 추가), `tests/e2e/home.spec.ts`(테스트 글이 4편이 되므로 기대값 갱신)
- Test: `tests/unit/stats.test.ts`, `tests/e2e/demos.spec.ts`

**Interfaces:**
- Produces:
  - `mean(values: readonly number[]): number`(비면 `NaN`)
  - `percentile(values: readonly number[], p: number): number`: nearest-rank 방식이다. 오름차순 정렬 뒤 `⌈p/100 × n⌉`번째 값이다. 비면 `NaN`, `p`가 (0, 100] 밖이면 `RangeError`를 던진다.
  - `SLOW_MS = 3000`, `REQUEST_COUNT = 100`, `baseLatencies(): number[]`(`100 + (i × 37) mod 61`, 100~160ms), `latencySample(slowCount: number): number[]`(앞에서부터 `slowCount`개를 3000ms로 바꾼다)
  - 기대값(사전 계산): 느린 요청 0개는 평균 129.56·p50 129·p99 160, 1개는 평균 158.56·p99 160, 2개는 평균 187.19·p99 3000, 10개는 p95 3000이다.
  - `<PercentileDemo />`(React, default export): `[data-demo="percentile"]`, 슬라이더(접근 이름 "느린 요청 수", 0~10), `[data-slow-count]`, `[data-stat="mean|p50|p99"] .demo-stat-value`, `.dot`·`.dot.is-slow`·`.dot.is-p99`, `[data-demo-message]`
  - `waitForIsland(page: Page, componentName: string): Promise<void>`

- [ ] **Step 1: 실패하는 단위 테스트 쓰기**

`tests/unit/stats.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { mean, percentile } from '../../src/lib/stats';
import { baseLatencies, latencySample, REQUEST_COUNT, SLOW_MS } from '../../src/lib/demo-data';

describe('mean', () => {
  it('산술 평균이다', () => {
    expect(mean([1, 2, 3, 4])).toBe(2.5);
  });
  it('비면 NaN이다', () => {
    expect(mean([])).toBeNaN();
  });
});

describe('percentile (nearest-rank)', () => {
  const oneToHundred = Array.from({ length: 100 }, (_, i) => i + 1);
  it('1~100에서 p50은 50, p99는 99, p100은 100이다', () => {
    expect(percentile(oneToHundred, 50)).toBe(50);
    expect(percentile(oneToHundred, 99)).toBe(99);
    expect(percentile(oneToHundred, 100)).toBe(100);
  });
  it('정렬되지 않은 입력도 정렬해서 계산하고, 원본은 바꾸지 않는다', () => {
    const input = [5, 1, 4, 2, 3];
    expect(percentile(input, 50)).toBe(3);
    expect(input).toEqual([5, 1, 4, 2, 3]);
  });
  it('요청이 50개면 p99는 최댓값이다', () => {
    const fifty = Array.from({ length: 50 }, (_, i) => i + 1);
    expect(percentile(fifty, 99)).toBe(50);
  });
  it('비면 NaN, 범위 밖 p는 RangeError다', () => {
    expect(percentile([], 99)).toBeNaN();
    expect(() => percentile([1], 0)).toThrow(RangeError);
    expect(() => percentile([1], 101)).toThrow(RangeError);
  });
});

describe('데모 데이터', () => {
  it('기본 요청 100개는 100~160ms다', () => {
    const base = baseLatencies();
    expect(base).toHaveLength(REQUEST_COUNT);
    expect(Math.min(...base)).toBe(100);
    expect(Math.max(...base)).toBe(160);
  });
  it('느린 요청 0개: 평균 129.56, p50 129, p99 160', () => {
    const s = latencySample(0);
    expect(mean(s)).toBeCloseTo(129.56, 2);
    expect(percentile(s, 50)).toBe(129);
    expect(percentile(s, 99)).toBe(160);
  });
  it('느린 요청 1개(1%): p99는 그대로 160이다', () => {
    const s = latencySample(1);
    expect(mean(s)).toBeCloseTo(158.56, 2);
    expect(percentile(s, 99)).toBe(160);
  });
  it('느린 요청 2개(2%): p99가 3000으로 튀고 평균은 187.19다', () => {
    const s = latencySample(2);
    expect(mean(s)).toBeCloseTo(187.19, 2);
    expect(percentile(s, 99)).toBe(SLOW_MS);
  });
  it('느린 요청 10개: p95도 3000이다', () => {
    expect(percentile(latencySample(10), 95)).toBe(SLOW_MS);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run tests/unit/stats.test.ts`
Expected: FAIL. 모듈을 찾을 수 없다는 오류가 난다.

- [ ] **Step 3: 통계와 데모 데이터 구현**

`src/lib/stats.ts`:

```ts
export function mean(values: readonly number[]): number {
  if (values.length === 0) return Number.NaN;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/** nearest-rank 백분위수: 오름차순으로 줄 세운 뒤 ⌈p/100 × n⌉번째 값. */
export function percentile(values: readonly number[], p: number): number {
  if (!(p > 0 && p <= 100)) throw new RangeError(`p는 0 초과 100 이하여야 해요: ${p}`);
  if (values.length === 0) return Number.NaN;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.ceil((p / 100) * sorted.length) - 1];
}
```

`src/lib/demo-data.ts`:

```ts
export const SLOW_MS = 3000;
export const REQUEST_COUNT = 100;

/** 100~160ms에 고르게 흩어진 요청 100개. 서버와 브라우저가 같은 값을 만들도록 난수를 쓰지 않는다. */
export function baseLatencies(): number[] {
  return Array.from({ length: REQUEST_COUNT }, (_, i) => 100 + ((i * 37) % 61));
}

/** 앞에서부터 slowCount개를 느린 요청(3초)으로 바꾼 표본. */
export function latencySample(slowCount: number): number[] {
  return baseLatencies().map((v, i) => (i < slowCount ? SLOW_MS : v));
}
```

- [ ] **Step 4: 단위 테스트 통과 확인**

Run: `npx vitest run tests/unit/stats.test.ts`
Expected: PASS.

- [ ] **Step 5: 실패하는 E2E 쓰기**

`tests/fixtures/docs/foundations/demos.mdx`:

```mdx
---
title: 데모 모음
summary: 데모 컴포넌트를 시험하는 테스트용 글이에요.
domain: foundations
type: concept
order: 0
icon: gauge
sources:
  - title: 데모 테스트 출처
    url: https://example.com/demos
updated: 2026-09-01
---
import PercentileDemo from '../../../../src/components/demos/PercentileDemo.tsx';

<OnDashboard title="데모">
  위젯 자리예요.
</OnDashboard>

<KeyPoints>
  <Point title="데모 핵심">
    아래 데모를 직접 움직여 봐요.
  </Point>
</KeyPoints>

<PercentileDemo client:visible />

<Checkpoints>
  <Check>데모가 움직이지 않으면 다시 확인하세요.</Check>
</Checkpoints>
```

`tests/e2e/helpers.ts`에 추가하고, `PAGES`에 `'foundations/demos/'`를 추가한다:

```ts
/** client:visible 섬이 화면에 들어와 hydrate될 때까지 기다린다. hydrate되면 ssr 속성이 사라진다. */
export async function waitForIsland(page: Page, componentName: string): Promise<void> {
  const island = page.locator(`astro-island[component-url*="${componentName}"]`);
  await island.scrollIntoViewIfNeeded();
  await expect(island).not.toHaveAttribute('ssr');
}
```

`tests/e2e/home.spec.ts`의 기대값을 바꾼다. "데모 모음"은 order 0, 수정일 2026-09-01이다.
- 영역 행: `'3편'` → `'4편'`
- 처음이라면 여기부터: `['데모 모음', '알파 개념', '베타 개념', '감마 가이드']`
- 최근 추가된 글: `['감마 가이드', '베타 개념', '알파 개념', '데모 모음']`
- 영역 페이지의 개념: `['데모 모음', '알파 개념', '베타 개념']`

`tests/e2e/demos.spec.ts`:

```ts
import { expect, test } from '@playwright/test';
import { waitForIsland } from './helpers';

test.describe('백분위수 데모', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('foundations/demos/');
    await waitForIsland(page, 'PercentileDemo');
  });

  test('처음에는 느린 요청이 없고 p99는 160ms다', async ({ page }) => {
    const demo = page.locator('[data-demo="percentile"]');
    await expect(demo.locator('[data-slow-count]')).toHaveText('0개');
    await expect(demo.locator('[data-stat="mean"] .demo-stat-value')).toHaveText('130ms');
    await expect(demo.locator('[data-stat="p99"] .demo-stat-value')).toHaveText('160ms');
    await expect(demo.locator('.dot')).toHaveCount(100);
    await expect(demo.locator('.dot.is-p99')).toHaveCount(1);
  });

  test('키보드로 느린 요청을 늘리면 2개째에 p99가 3초로 튄다', async ({ page }) => {
    const demo = page.locator('[data-demo="percentile"]');
    const p99 = demo.locator('[data-stat="p99"] .demo-stat-value');
    await demo.getByRole('slider', { name: '느린 요청 수' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(demo.locator('[data-slow-count]')).toHaveText('1개');
    await expect(p99).toHaveText('160ms');
    await expect(demo.locator('[data-demo-message]')).toContainText('p99는 아직 그대로예요');
    await page.keyboard.press('ArrowRight');
    await expect(p99).toHaveText('3,000ms');
    await expect(demo.locator('[data-stat="mean"] .demo-stat-value')).toHaveText('187ms');
    await expect(demo.locator('.dot.is-slow')).toHaveCount(2);
    await expect(demo.locator('.dot.is-p99.is-slow')).toHaveCount(1);
  });
});
```

- [ ] **Step 6: 실패 확인**

Run: `npx playwright test tests/e2e/demos.spec.ts`
Expected: FAIL. `PercentileDemo.tsx`가 없어 빌드가 실패한다.

- [ ] **Step 7: 데모 구현**

`src/components/demos/demo.css`:

```css
.demo {
  margin: 48px 0;
  padding: 20px;
  border-radius: var(--radius-card);
  background: var(--color-bg);
}

.demo-title {
  margin-bottom: 16px;
  font-size: 17px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.demo-legend {
  margin: 10px 0 0;
  font-size: 14px;
  color: var(--color-text-sub);
}

.demo-control {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-top: 20px;
  font-size: 15px;
}

.demo-range {
  width: 100%;
  margin: 8px 0 0;
  accent-color: var(--color-accent);
}

.demo-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(96px, 1fr));
  gap: 8px;
  margin-top: 16px;
}

.demo-stat {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 12px 14px;
  border-radius: 14px;
  background: var(--color-card);
}

.demo-stat-label {
  font-size: 14px;
  color: var(--color-text-sub);
}

.demo-stat-value {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}

.demo-stat-diff {
  font-size: 13px;
  color: var(--color-text-weak);
}

.demo-stat.is-warn .demo-stat-value {
  color: var(--color-warn);
}

.demo-message {
  margin: 16px 0 0;
  font-weight: 600;
}

/* 백분위수 데모: 빠른 순서로 줄 세운 요청 100개 */
.demo-dots {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 6px;
  max-width: 280px;
}

.dot {
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--color-accent);
  opacity: 0.35;
}

.dot.is-slow {
  background: var(--color-warn);
  opacity: 1;
}

.dot.is-p99 {
  outline: 2px solid var(--color-text);
  outline-offset: 2px;
  opacity: 1;
}

/* 다운샘플링 데모(Task 11) */
.demo-chart {
  width: 100%;
  height: 140px;
}

.demo-chart-base {
  stroke: var(--color-line);
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}

.demo-chart-line {
  fill: none;
  stroke: var(--color-accent);
  stroke-width: 2.5;
  stroke-linejoin: round;
}

.demo-segment {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 16px 0 0;
  padding: 0;
  border: 0;
}

.demo-segment legend {
  width: 100%;
  margin-bottom: 8px;
  padding: 0;
  font-size: 15px;
}

.demo-segment label {
  padding: 8px 14px;
  border-radius: 12px;
  background: var(--color-card);
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.demo-segment label.is-active {
  background: var(--color-accent);
  color: #fff;
}

.demo-segment label {
  position: relative;
}

/* 라디오는 숨기되 키보드 포커스와 클릭은 그대로 받는다 */
.demo-segment input {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  margin: 0;
  opacity: 0;
  cursor: pointer;
}

.demo-segment label:has(input:focus-visible) {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
```

`src/components/demos/PercentileDemo.tsx`:

```tsx
import { useId, useMemo, useState } from 'react';
import { latencySample, REQUEST_COUNT, SLOW_MS } from '../../lib/demo-data';
import { mean, percentile } from '../../lib/stats';
import './demo.css';

const MAX_SLOW = 10;
const P99_INDEX = Math.ceil(0.99 * REQUEST_COUNT) - 1;
const ms = (v: number) => `${Math.round(v).toLocaleString('ko-KR')}ms`;

function statsOf(sample: number[]) {
  return { mean: mean(sample), p50: percentile(sample, 50), p99: percentile(sample, 99) };
}

const BASE = statsOf(latencySample(0));

function message(slow: number): string {
  if (slow === 0) return '느린 요청이 없어요. 평균과 p99가 모두 낮아요.';
  if (slow === 1) return '느린 요청이 1%예요. p99는 아직 그대로예요.';
  return `느린 요청이 ${slow}%가 되자 p99가 3초로 튀었어요.`;
}

function Stat({ label, value, base, testId, warn }: { label: string; value: number; base: number; testId: string; warn?: boolean }) {
  const diff = Math.round(value) - Math.round(base);
  return (
    <div className={`demo-stat${warn ? ' is-warn' : ''}`} data-stat={testId}>
      <span className="demo-stat-label">{label}</span>
      <span className="demo-stat-value">{ms(value)}</span>
      <span className="demo-stat-diff">{diff === 0 ? '변화 없음' : `${diff > 0 ? '+' : ''}${diff.toLocaleString('ko-KR')}ms`}</span>
    </div>
  );
}

export default function PercentileDemo() {
  const id = useId();
  const [slow, setSlow] = useState(0);
  const sample = useMemo(() => latencySample(slow), [slow]);
  const sorted = useMemo(() => [...sample].sort((a, b) => a - b), [sample]);
  const stats = statsOf(sample);

  return (
    <figure className="demo" data-demo="percentile">
      <figcaption className="demo-title">직접 해 보기: 느린 요청 늘리기</figcaption>
      <div className="demo-dots" role="img" aria-label={`요청 ${REQUEST_COUNT}개 중 느린 요청 ${slow}개`}>
        {sorted.map((v, i) => (
          <span key={i} className={`dot${v === SLOW_MS ? ' is-slow' : ''}${i === P99_INDEX ? ' is-p99' : ''}`} />
        ))}
      </div>
      <p className="demo-legend">빠른 순서로 줄 세운 요청 100개예요. 테두리가 있는 점이 99번째, 곧 p99예요.</p>
      <label className="demo-control" htmlFor={`${id}-slow`}>
        <span>느린 요청(3초)</span>
        <strong data-slow-count>{slow}개</strong>
      </label>
      <input
        id={`${id}-slow`}
        className="demo-range"
        type="range"
        min={0}
        max={MAX_SLOW}
        step={1}
        value={slow}
        aria-label="느린 요청 수"
        onChange={(e) => setSlow(Number(e.target.value))}
      />
      <div className="demo-stats">
        <Stat label="평균" value={stats.mean} base={BASE.mean} testId="mean" />
        <Stat label="p50" value={stats.p50} base={BASE.p50} testId="p50" />
        <Stat label="p99" value={stats.p99} base={BASE.p99} testId="p99" warn={stats.p99 === SLOW_MS} />
      </div>
      <p className="demo-message" aria-live="polite" data-demo-message>
        {message(slow)}
      </p>
    </figure>
  );
}
```

- [ ] **Step 8: 통과 확인**

Run: `npm run check`
Expected: `0 errors`.

Run: `npm test && npm run test:e2e`
Expected: PASS(전체). hydration 경고(서버·브라우저 값 불일치)가 콘솔에 나오면 난수나 시각을 쓰는 곳이 없는지 확인한다.

- [ ] **Step 9: 커밋**

```bash
git add -A
git commit -m "feat: 느린 요청을 늘려 보는 백분위수 데모 추가

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: 다운샘플링 데모(DownsamplingDemo)

**Files:**
- Create: `src/components/demos/DownsamplingDemo.tsx`
- Modify: `src/lib/stats.ts`(`downsample` 추가), `src/lib/demo-data.ts`(`cpuSeries`, `RESOLUTIONS`, `RAW_PEAK` 추가), `tests/fixtures/docs/foundations/demos.mdx`(데모 추가)
- Test: `tests/unit/stats.test.ts`(추가), `tests/e2e/demos.spec.ts`(추가)

**Interfaces:**
- Consumes: `linePath`·`ChartBox`(Task 9), `demo.css`(Task 10), `waitForIsland`(Task 10)
- Produces:
  - `type Aggregation = 'avg' | 'max'`, `downsample(values: readonly number[], size: number, how: Aggregation): number[]`: 앞에서부터 `size`개씩 묶고, 마지막 묶음은 남은 값만 쓴다. `size`가 1 미만이거나 정수가 아니면 `RangeError`를 던진다.
  - `CPU_STEP_SECONDS = 10`, `cpuSeries(): number[]`: 360개(1시간), 기본 35~45%, 192~194번(30초)만 95%다.
  - `RAW_PEAK = 95`, `RESOLUTIONS = [{ label: '10초', bucket: 1 }, { label: '1분', bucket: 6 }, { label: '5분', bucket: 30 }, { label: '15분', bucket: 90 }]`
  - 기대값(사전 계산): 평균 최고값은 10초 95 / 1분 67.17 / 5분 45.3 / 15분 41.8이다. 최댓값 최고값은 언제나 95이다. 점 개수는 360 / 60 / 12 / 4이다.
  - `<DownsamplingDemo />`: `[data-demo="downsampling"]`, 라디오 "10초|1분|5분|15분", 라디오 "평균|최댓값", `[data-stat="visible-peak"] .demo-stat-value`, `[data-stat="real-peak"]`, `[data-point-count]`, `[data-demo-message]`

- [ ] **Step 1: 실패하는 단위 테스트 추가**

`tests/unit/stats.test.ts`에 추가:

```ts
import { downsample } from '../../src/lib/stats';
import { cpuSeries, RAW_PEAK, RESOLUTIONS } from '../../src/lib/demo-data';

describe('downsample', () => {
  it('size개씩 평균으로 묶고, 마지막 묶음은 남은 값만 쓴다', () => {
    expect(downsample([1, 2, 3, 4, 5], 2, 'avg')).toEqual([1.5, 3.5, 5]);
  });
  it('최댓값으로 묶을 수 있다', () => {
    expect(downsample([1, 9, 3, 4, 5], 2, 'max')).toEqual([9, 4, 5]);
  });
  it('size가 1이면 원본과 같다', () => {
    expect(downsample([3, 1, 2], 1, 'avg')).toEqual([3, 1, 2]);
  });
  it('size가 1 미만이거나 정수가 아니면 RangeError다', () => {
    expect(() => downsample([1], 0, 'avg')).toThrow(RangeError);
    expect(() => downsample([1], 1.5, 'avg')).toThrow(RangeError);
  });
});

describe('CPU 데모 데이터', () => {
  const raw = cpuSeries();
  it('10초 간격 1시간(360개), 기본 35~45%, 피크 95%', () => {
    expect(raw).toHaveLength(360);
    expect(Math.max(...raw)).toBe(RAW_PEAK);
    expect(Math.min(...raw)).toBe(35);
    expect(raw.filter((v) => v === RAW_PEAK)).toHaveLength(3);
  });
  it.each([
    [1, 360, 95],
    [6, 60, 67.17],
    [30, 12, 45.3],
    [90, 4, 41.8],
  ])('평균으로 %d개씩 묶으면 점 %d개, 최고값 %d', (size, points, peak) => {
    const out = downsample(raw, size, 'avg');
    expect(out).toHaveLength(points);
    expect(Math.max(...out)).toBeCloseTo(peak, 2);
  });
  it('최댓값으로 묶으면 어떤 크기든 피크 95%가 남는다', () => {
    for (const { bucket } of RESOLUTIONS) expect(Math.max(...downsample(raw, bucket, 'max'))).toBe(RAW_PEAK);
  });
});
```

(같은 파일 위쪽의 import와 합친다.)

- [ ] **Step 2: 실패 확인**

Run: `npx vitest run tests/unit/stats.test.ts`
Expected: FAIL. `downsample`과 `cpuSeries`가 없다는 오류가 난다.

- [ ] **Step 3: 구현**

`src/lib/stats.ts`에 추가:

```ts
export type Aggregation = 'avg' | 'max';

/** 앞에서부터 size개씩 묶어 평균 또는 최댓값으로 요약한다. 마지막 묶음은 남은 값만 쓴다. */
export function downsample(values: readonly number[], size: number, how: Aggregation): number[] {
  if (!Number.isInteger(size) || size < 1) throw new RangeError(`size는 1 이상의 정수여야 해요: ${size}`);
  const out: number[] = [];
  for (let i = 0; i < values.length; i += size) {
    const bucket = values.slice(i, i + size);
    out.push(how === 'max' ? Math.max(...bucket) : mean(bucket));
  }
  return out;
}
```

`src/lib/demo-data.ts`에 추가:

```ts
export const CPU_STEP_SECONDS = 10;
export const RAW_PEAK = 95;

/** 10초 간격 1시간 CPU 사용률. 평소 35~45%, 32분 무렵 30초(3개)만 95%. */
export function cpuSeries(): number[] {
  return Array.from({ length: 360 }, (_, i) => (i >= 192 && i <= 194 ? RAW_PEAK : 40 + ((i * 7) % 11) - 5));
}

export const RESOLUTIONS = [
  { label: '10초', bucket: 1 },
  { label: '1분', bucket: 6 },
  { label: '5분', bucket: 30 },
  { label: '15분', bucket: 90 },
] as const;
```

Run: `npx vitest run tests/unit/stats.test.ts`
Expected: PASS.

- [ ] **Step 4: 실패하는 E2E 추가**

`tests/fixtures/docs/foundations/demos.mdx`에 import와 데모를 추가한다:

```mdx
import DownsamplingDemo from '../../../../src/components/demos/DownsamplingDemo.tsx';
```

`<PercentileDemo client:visible />` 아래 빈 줄 다음에 `<DownsamplingDemo client:visible />`를 넣는다.

`tests/e2e/demos.spec.ts`에 추가:

```ts
test.describe('다운샘플링 데모', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('foundations/demos/');
    await waitForIsland(page, 'DownsamplingDemo');
  });

  test('원본(10초)에서는 피크 95%가 보인다', async ({ page }) => {
    const demo = page.locator('[data-demo="downsampling"]');
    await expect(demo.locator('[data-stat="visible-peak"] .demo-stat-value')).toHaveText('95%');
    await expect(demo.locator('[data-point-count]')).toContainText('점 360개');
  });

  test('한 점을 5분으로 넓히면 평균에 피크가 묻히고, 최댓값으로 바꾸면 돌아온다', async ({ page }) => {
    const demo = page.locator('[data-demo="downsampling"]');
    const peak = demo.locator('[data-stat="visible-peak"] .demo-stat-value');
    // '5분'은 '15분'에도 들어 있어서 정확히 일치하는 라벨만 고른다.
    await demo.locator('label', { hasText: /^5분$/ }).click();
    await expect(demo.getByRole('radio', { name: '5분', exact: true })).toBeChecked();
    await expect(peak).toHaveText('45%');
    await expect(demo.locator('[data-point-count]')).toContainText('점 12개');
    await expect(demo.locator('[data-demo-message]')).toContainText('45%로 묻혔어요');
    await demo.locator('label', { hasText: /^최댓값$/ }).click();
    await expect(peak).toHaveText('95%');
    await expect(demo.locator('[data-demo-message]')).toContainText('5분 내내 높았던 것처럼');
  });

  test('키보드 화살표로 해상도를 바꿀 수 있다', async ({ page }) => {
    const demo = page.locator('[data-demo="downsampling"]');
    await demo.getByRole('radio', { name: '10초', exact: true }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(demo.getByRole('radio', { name: '1분', exact: true })).toBeChecked();
    await expect(demo.locator('[data-stat="visible-peak"] .demo-stat-value')).toHaveText('67%');
  });
});
```

Run: `npx playwright test tests/e2e/demos.spec.ts`
Expected: FAIL. `DownsamplingDemo.tsx`가 없어 빌드가 실패한다.

- [ ] **Step 5: 데모 구현**

`src/components/demos/DownsamplingDemo.tsx`:

```tsx
import { useId, useMemo, useState } from 'react';
import { cpuSeries, RAW_PEAK, RESOLUTIONS } from '../../lib/demo-data';
import { downsample, type Aggregation } from '../../lib/stats';
import { linePath, type ChartBox } from '../../lib/viz/line';
import './demo.css';

const BOX: ChartBox = { width: 320, height: 140, padding: 6 };
const Y_MAX = 100;
const AGGREGATIONS: { value: Aggregation; label: string }[] = [
  { value: 'avg', label: '평균' },
  { value: 'max', label: '최댓값' },
];

function message(bucket: number, label: string, how: Aggregation, peak: number): string {
  if (bucket === 1) return '10초 단위 원본이에요. 30초 동안 95%까지 올랐어요.';
  if (how === 'avg') return `${label}마다 평균을 내니 30초짜리 피크가 ${peak}%로 묻혔어요.`;
  return `최댓값으로 묶으면 피크는 남아요. 대신 ${label} 내내 높았던 것처럼 보여요.`;
}

export default function DownsamplingDemo() {
  const id = useId();
  const raw = useMemo(() => cpuSeries(), []);
  const [bucket, setBucket] = useState<number>(RESOLUTIONS[0].bucket);
  const [how, setHow] = useState<Aggregation>('avg');
  const series = useMemo(() => downsample(raw, bucket, how), [raw, bucket, how]);
  const peak = Math.round(Math.max(...series));
  const label = RESOLUTIONS.find((r) => r.bucket === bucket)?.label ?? '';

  return (
    <figure className="demo" data-demo="downsampling">
      <figcaption className="demo-title">직접 해 보기: 그래프 한 점의 크기 바꾸기</figcaption>
      <svg
        className="demo-chart"
        viewBox={`0 0 ${BOX.width} ${BOX.height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`CPU 사용률 그래프, 점 ${series.length}개, 보이는 최고값 ${peak}%`}
      >
        <line className="demo-chart-base" x1={0} x2={BOX.width} y1={BOX.height - BOX.padding} y2={BOX.height - BOX.padding} />
        <path className="demo-chart-line" d={linePath(series, Y_MAX, BOX)} vectorEffect="non-scaling-stroke" />
      </svg>
      <p className="demo-legend" data-point-count>
        점 {series.length}개 · 한 점 = {label}
      </p>
      <fieldset className="demo-segment">
        <legend>그래프 한 점이 나타내는 시간</legend>
        {RESOLUTIONS.map((r) => (
          <label key={r.bucket} className={bucket === r.bucket ? 'is-active' : undefined}>
            <input type="radio" name={`${id}-bucket`} value={r.bucket} checked={bucket === r.bucket} onChange={() => setBucket(r.bucket)} />
            {r.label}
          </label>
        ))}
      </fieldset>
      <fieldset className="demo-segment">
        <legend>구간을 묶는 방법</legend>
        {AGGREGATIONS.map((a) => (
          <label key={a.value} className={how === a.value ? 'is-active' : undefined}>
            <input type="radio" name={`${id}-how`} value={a.value} checked={how === a.value} onChange={() => setHow(a.value)} />
            {a.label}
          </label>
        ))}
      </fieldset>
      <div className="demo-stats">
        <div className="demo-stat" data-stat="visible-peak">
          <span className="demo-stat-label">그래프에 보이는 최고값</span>
          <span className="demo-stat-value">{peak}%</span>
        </div>
        <div className="demo-stat is-warn" data-stat="real-peak">
          <span className="demo-stat-label">실제 최고값</span>
          <span className="demo-stat-value">{RAW_PEAK}%</span>
        </div>
      </div>
      <p className="demo-message" aria-live="polite" data-demo-message>
        {message(bucket, label, how, peak)}
      </p>
    </figure>
  );
}
```

- [ ] **Step 6: 통과 확인**

Run: `npm run check`
Expected: `0 errors`.

Run: `npm test && npm run test:e2e`
Expected: PASS(전체).

- [ ] **Step 7: 커밋**

```bash
git add -A
git commit -m "feat: 한 점의 크기를 바꿔 보는 다운샘플링 데모 추가

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### 글 작업(Task 12~15) 공통 사항

이 네 작업의 결과물은 코드가 아니라 글이다. 테스트 대신 **글 검사 통과 + 별도 에이전트의 사실 검토 + 빌드 통과**가 완료 조건이다.

- 쓰기 전에 `docs/writing-guide.md`를 끝까지 읽는다. 각 작업의 **필수 내용**은 반드시 담는다. 문장은 작성자가 다듬는다. 필수 내용에 없는 사실을 더하려면 출처(공식 문서·명세·원 논문)가 있어야 하고, 검토 기록에 남긴다.
- 숫자 예시는 아래 값을 그대로 쓴다. 모두 사전에 계산해서 확인한 값이다. 바꾸면 다시 계산하고 검토자가 재검증하게 한다.
- 사실 검토는 **작성자와 다른 에이전트**가 한다. 서브에이전트 실행 방식이면 컨트롤러가, 직접 실행 방식이면 작성자가 `general-purpose` 서브에이전트를 새로 띄운다. 프롬프트는 이 문서 끝의 **부록 A**를 그대로 쓴다.
- 데모 import 경로는 `src/content/docs/foundations/*.mdx` 기준으로 `'../../../components/demos/…'`이다.
- `updated`는 작업한 날짜(YYYY-MM-DD)로 쓴다.

---

### Task 12: 글 「평균과 백분위수」

**Files:**
- Create: `src/content/docs/foundations/percentiles.mdx`, `docs/reviews/foundations-percentiles.md`

**Interfaces:**
- Consumes: 틀 블록(Task 5), `MiniLineChart`·`StatTile`(Task 9), `PercentileDemo`(Task 10)
- Produces: 글 id `foundations/percentiles`. Task 13~15가 `related`와 `<Term>`으로 가리킨다.

- [ ] **Step 1: 머리말과 대시보드 그림 쓰기**

````mdx
---
title: 평균과 백분위수
summary: 평균은 느린 요청을 숨기고, 백분위수는 드러내요.
domain: foundations
type: concept
order: 1
icon: chart-column
keywords: [p50, p95, p99, 퍼센타일, percentile, 중앙값, 꼬리 지연, tail latency]
sources:
  - title: Prometheus — Histograms and summaries
    url: https://prometheus.io/docs/practices/histograms/
  - title: Google SRE Book — Service Level Objectives
    url: https://sre.google/sre-book/service-level-objectives/
updated: 2026-10-13
---
import PercentileDemo from '../../../components/demos/PercentileDemo.tsx';

<OnDashboard title="응답시간 · 최근 1시간" caption="같은 시간대인데 평균은 잔잔하고 p99만 두 번 튀어 있어요.">
  <MiniLineChart
    ariaLabel="평균 응답시간은 130ms 근처에서 잔잔하고, p99는 두 번 3,000ms까지 튀는 그래프"
    series={[
      { label: '평균', values: [130, 128, 131, 129, 187, 130, 129, 131, 130, 129, 188, 130], tone: 'sub', value: '187ms' },
      { label: 'p99', values: [160, 158, 160, 159, 3000, 160, 158, 160, 159, 160, 3000, 160], tone: 'warn', value: '3,000ms' },
    ]}
  />
  <StatTile label="평균(가장 높을 때)" value="187" unit="ms" />
  <StatTile label="p99(가장 높을 때)" value="3,000" unit="ms" tone="warn" />
</OnDashboard>
````

- [ ] **Step 2: 핵심·데모·확인·더 깊이 쓰기**

필수 내용:

| 블록 | 제목/형태 | 반드시 담을 사실과 숫자 |
| --- | --- | --- |
| `<Point>` 1 | 평균은 아무도 겪지 않은 숫자일 수 있어요 | 요청 100개 중 98개가 0.1초, 2개가 3초면 평균은 0.158초다. 0.158초를 겪은 요청은 하나도 없다. 그래서 평균만 보면 3초를 기다린 사용자가 보이지 않는다. |
| `<Point>` 2 | p99는 요청의 99%가 끝난 시간이에요 | 요청을 빠른 순서로 줄 세웠을 때 99% 위치의 값이다. 요청 100개라면 99번째다. "p99가 1.2초"는 요청의 99%가 1.2초 안에 끝났다는 뜻이다. p50은 가운데 값(중앙값), p95는 95% 위치다. |
| `<Point>` 3 | 느린 요청이 1%를 넘으면 p99가 튀어요 | 100개 중 느린 요청이 1개(1%)면 p99는 그대로다. 2개(2%)가 되는 순간 p99는 느린 요청의 시간이 된다. 그래서 p99가 튀었다면 "느린 요청이 1%를 넘었다"는 신호다. 아래 데모로 확인하게 이끈다. |
| 데모 | `<PercentileDemo client:visible />` | `</KeyPoints>`와 `<Checkpoints>` 사이에 둔다. |
| `<Check>` | 4개 | ① 서버별 p99를 구한 뒤 평균을 냈다면 틀린 값이다. 원본 분포나 히스토그램을 합친 뒤 다시 계산해야 한다. ② 1분짜리 p99 60개를 평균 내서 1시간 p99라고 부르면 틀린다. ③ 응답시간 알림이 평균만 본다면 느린 요청을 놓친다. ④ 요청이 50개뿐인 구간의 p99는 사실상 최댓값이다(⌈0.99×50⌉ = 50번째). 요청 수를 함께 보여 줘야 한다. |
| `<Deeper>` `### 계산 방법` | 문장 + 식 | nearest-rank: 오름차순 정렬 뒤 순위 ⌈p/100 × n⌉의 값. 100개의 p99는 99번째, 50개의 p99는 50번째(최댓값). 도구에 따라 순위 사이를 보간하는 방식도 있어서 같은 데이터라도 p99가 조금 다를 수 있다. |
| `<Deeper>` `### 히스토그램과 summary` | 문장 + 코드 블록 | Prometheus histogram은 미리 정한 구간(bucket)별 개수를 센다. `histogram_quantile()`은 버킷 안에서 선형 보간한 근사값이라 버킷 경계가 정확도를 좌우한다. 히스토그램은 서버별 버킷 개수를 더한 뒤 계산할 수 있어 합칠 수 있다. summary는 각 서버가 계산한 분위수라 합칠 수 없다. 코드: `histogram_quantile(0.99, sum by (le) (rate(http_server_request_duration_seconds_bucket[5m])))`. 이 식은 서버별 버킷의 rate(초당 증가량)를 버킷 경계(`le`)별로 더한 뒤 p99를 구한다고 설명한다. 이 "rate"는 Task 13에서 `<Term>`으로 감싼다. |

- [ ] **Step 3: 글 검사**

Run: `npm run lint:content`
Expected: `글 1편 검사, 위반 0건`. 위반이 나오면 글을 고친다. 규칙이 지나치게 엄격하다고 판단되면 규칙을 바꾸지 말고 위반 내용과 이유를 사이트 주인에게 보고한다.

- [ ] **Step 4: 사실 검토**

부록 A의 프롬프트로 별도 에이전트에게 `src/content/docs/foundations/percentiles.mdx` 검토를 맡긴다. 결과는 `docs/reviews/foundations-percentiles.md`에 남긴다. "틀림"과 "오해 소지"는 모두 고치고, 반영 내용을 같은 파일의 `## 반영`에 적는다. 고친 뒤 Step 3을 다시 돌린다.

- [ ] **Step 5: 빌드와 화면 확인**

Run: `npm run build`
Expected: 성공한다. `dist/foundations/percentiles/index.html`이 생긴다.

Run: `node scripts/serve-dist.mjs 4330`(백그라운드)을 띄우고 `http://localhost:4330/DomainDocs/foundations/percentiles/`를 360px과 1440px에서 연다. 데모가 움직이는지, 넘치는 요소가 없는지 확인한 뒤 서버를 끈다.

Run: `npm run test:e2e`
Expected: PASS(테스트 전용 글 기준이라 영향이 없어야 한다).

- [ ] **Step 6: 커밋**

```bash
git add src/content/docs/foundations/percentiles.mdx docs/reviews/foundations-percentiles.md
git commit -m "docs: 글 「평균과 백분위수」 추가

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 13: 글 「카운터와 rate」

**Files:**
- Create: `src/content/docs/foundations/counters-and-rate.mdx`, `docs/reviews/foundations-counters-and-rate.md`
- Modify: `src/content/docs/foundations/percentiles.mdx`(`related`와 `<Term>` 추가)

**Interfaces:**
- Consumes: `foundations/percentiles`(Task 12)
- Produces: 글 id `foundations/counters-and-rate`

- [ ] **Step 1: 머리말과 대시보드 그림 쓰기**

````mdx
---
title: 카운터와 rate
summary: 카운터는 쌓이기만 하는 값이고, rate는 초당 증가량이에요.
domain: foundations
type: concept
order: 2
icon: trending-up
keywords: [counter, 누적값, 증가율, 초당, increase, irate, 재시작, reset, 게이지, gauge]
related: [foundations/percentiles]
sources:
  - title: Prometheus — Metric types
    url: https://prometheus.io/docs/concepts/metric_types/
  - title: Prometheus — Query functions
    url: https://prometheus.io/docs/prometheus/latest/querying/functions/
  - title: OpenTelemetry — Metrics data model
    url: https://opentelemetry.io/docs/specs/otel/metrics/data-model/
updated: 2026-10-13
---

<OnDashboard title="처리한 요청 수 · 10초마다 수집" caption="위는 카운터를 그대로 그린 선이고, 아래는 rate로 바꾼 선이에요. 재시작한 순간에도 rate는 이어져요.">
  <MiniLineChart
    ariaLabel="카운터 원래 값은 계속 오르다가 재시작 때 0 근처로 떨어지는 톱니 모양 그래프"
    series={[{ label: '카운터 원래 값', values: [1000, 1030, 1060, 1090, 1120, 20, 50, 80, 110, 140], tone: 'sub' }]}
  />
  <MiniLineChart
    ariaLabel="rate로 바꾼 값은 초당 3건 근처에서 고르게 이어지는 그래프"
    yMax={5}
    series={[{ label: 'rate', values: [3, 3, 3, 3, 2, 3, 3, 3, 3], tone: 'accent', value: '초당 3건' }]}
  />
</OnDashboard>
````

그림 숫자의 근거: 10초마다 30씩 늘면 초당 3건이다. 1,120에서 재시작해 20이 되면 그 구간 증가량은 20(초당 2건)으로 센다.

- [ ] **Step 2: 핵심·확인·더 깊이 쓰기**

| 블록 | 제목/형태 | 반드시 담을 사실과 숫자 |
| --- | --- | --- |
| `<Point>` 1 | 카운터는 쌓이기만 해요 | `http_requests_total`처럼 프로세스가 시작된 뒤 처리한 요청의 누적 개수다. 1,000,000이라는 값만으로는 지금 바쁜지 알 수 없다. 값이 줄어드는 건 재시작해서 0부터 다시 셀 때뿐이다. |
| `<Point>` 2 | rate는 1초에 얼마나 늘었는지예요 | 5분(300초) 동안 1,000,000에서 1,030,000이 되면 30,000 ÷ 300 = 초당 100건이다. 대시보드에는 카운터가 아니라 이 값을 그린다. |
| `<Point>` 3 | 재시작하면 카운터는 0부터 다시 세요 | 1,000 → 1,050 → (재시작) → 20. 단순히 빼면 −1,030이다. `rate`·`increase`는 값이 줄어든 순간을 재시작으로 보고 50 + 20 = 70으로 센다. |
| `<Check>` | 4개 | ① 카운터 값을 그대로 그린 그래프는 지금 상태를 말해 주지 않는다. ② rate 결과가 음수라면 재시작 처리가 빠졌다. ③ 여러 서버를 합칠 때 카운터를 먼저 더하고 rate를 구했다면 틀린다. rate를 먼저 구하고 더해야 한다(한 서버의 재시작이 합계 전체를 재시작처럼 보이게 만든다). ④ 메모리 사용량 같은 게이지에 rate를 썼다면 의미 없는 값이다. |
| `<Deeper>` `### rate, increase, irate` | 문장 | rate는 구간 전체의 평균 초당 증가율이다. increase는 구간 전체의 증가량으로, rate × 구간 초와 같다. irate는 마지막 두 샘플만 써서 빠른 변화에 민감하고 흔들린다. |
| `<Deeper>` `### 구간 끝은 추정해요` | 문장 | Prometheus는 구간 경계까지 값을 추정(외삽)한다. 그래서 정수 카운터라도 increase가 소수로 나올 수 있다. |
| `<Deeper>` `### 구간 길이` | 문장 | 구간 안에 샘플이 2개 이상 있어야 계산된다. 그래서 수집 주기보다 충분히 길게 잡는다. Grafana의 `$__rate_interval`은 수집 주기의 4배와 `$__interval + 수집 주기` 중 큰 값이다(검토자가 Grafana 문서로 확인한다). |
| `<Deeper>` `### OpenTelemetry에서는` | 문장 | 카운터는 단조 증가 Sum이다. 시간 기준(temporality)에는 cumulative(시작부터 누적)와 delta(지난 보고 뒤 증가량)가 있다. Prometheus 카운터는 cumulative다. delta는 재시작 문제 대신 보고 누락 문제를 조심해야 한다. |

`foundations/percentiles.mdx`를 고친다. 머리말에 `related: [foundations/counters-and-rate]`를 추가한다. `<Deeper>`의 코드 설명 문장에서 rate를 처음 말하는 곳을 `<Term slug="foundations/counters-and-rate">rate</Term>`로 감싼다.

- [ ] **Step 3: 글 검사**

Run: `npm run lint:content`
Expected: `글 2편 검사, 위반 0건`.

- [ ] **Step 4: 사실 검토**

부록 A의 프롬프트로 `src/content/docs/foundations/counters-and-rate.mdx`를 검토받는다. 결과는 `docs/reviews/foundations-counters-and-rate.md`에 남긴다. 반영한 뒤 Step 3을 다시 돌린다.

- [ ] **Step 5: 빌드와 화면 확인**

Run: `npm run build && npm run test:e2e`
Expected: 둘 다 성공한다. 「평균과 백분위수」의 rate 링크를 누르면 미리보기 시트가 열리는지 화면에서 확인한다.

- [ ] **Step 6: 커밋**

```bash
git add src/content/docs/foundations docs/reviews/foundations-counters-and-rate.md
git commit -m "docs: 글 「카운터와 rate」 추가

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 14: 글 「집계 구간과 다운샘플링」

**Files:**
- Create: `src/content/docs/foundations/aggregation-and-downsampling.mdx`, `docs/reviews/foundations-aggregation-and-downsampling.md`
- Modify: `src/content/docs/foundations/percentiles.mdx`, `src/content/docs/foundations/counters-and-rate.mdx`(`related`에 추가)

**Interfaces:**
- Consumes: `foundations/percentiles`, `foundations/counters-and-rate`, `DownsamplingDemo`(Task 11)
- Produces: 글 id `foundations/aggregation-and-downsampling`

- [ ] **Step 1: 머리말과 대시보드 그림 쓰기**

````mdx
---
title: 집계 구간과 다운샘플링
summary: 기간을 넓히면 점 하나가 더 긴 시간을 대표해서 피크가 묻혀요.
domain: foundations
type: concept
order: 3
icon: layers
keywords: [downsampling, 롤업, rollup, step, 해상도, resolution, 집계 구간, interval, 샘플링]
related: [foundations/percentiles, foundations/counters-and-rate]
sources:
  - title: Prometheus — HTTP API, Range queries
    url: https://prometheus.io/docs/prometheus/latest/querying/api/#range-queries
  - title: Thanos — Compactor, Downsampling
    url: https://thanos.io/tip/components/compact.md/#downsampling
  - title: Grafana — Query options
    url: https://grafana.com/docs/grafana/latest/panels-visualizations/query-transform-data/#query-options
updated: 2026-10-13
---
import DownsamplingDemo from '../../../components/demos/DownsamplingDemo.tsx';

<OnDashboard title="CPU 사용률 · 같은 서버, 같은 시각" caption="1시간으로 보면 95%까지 오른 피크가, 7일로 보면 45% 언저리로 묻혀요.">
  <MiniLineChart
    ariaLabel="최근 1시간 그래프. 한 점이 10초라 95%까지 오른 피크가 보여요"
    yMax={100}
    series={[{ label: '최근 1시간 · 한 점 10초', values: [41, 40, 39, 42, 40, 41, 95, 40, 39, 41, 40, 42], tone: 'accent', value: '최고 95%' }]}
  />
  <MiniLineChart
    ariaLabel="최근 7일 그래프. 한 점이 5분이라 같은 피크가 45%로 낮아져 보여요"
    yMax={100}
    series={[{ label: '최근 7일 · 한 점 5분', values: [41, 40, 42, 41, 40, 45, 41, 40, 41, 42, 40, 41], tone: 'sub', value: '최고 45%' }]}
  />
</OnDashboard>
````

- [ ] **Step 2: 핵심·데모·확인·더 깊이 쓰기**

| 블록 | 제목/형태 | 반드시 담을 사실과 숫자 |
| --- | --- | --- |
| `<Point>` 1 | 그래프의 점 하나는 구간 하나의 요약이에요 | 10초마다 수집하면 1시간에 360개, 7일이면 60,480개다. 화면 폭보다 훨씬 많아서 여러 값을 묶어 점 하나로 그린다. 조회 기간이 길수록 점 하나가 대표하는 시간도 길어진다. |
| `<Point>` 2 | 평균으로 묶으면 짧은 피크가 묻혀요 | 평소 40% 안팎인 서버가 30초 동안 95%였다. 1분으로 묶으면 67%, 5분이면 45%, 15분이면 42%로 보인다. |
| `<Point>` 3 | 최댓값으로 묶으면 피크는 남지만 길이가 부풀어요 | 5분 묶음을 최댓값으로 요약하면 95%가 남는다. 대신 30초짜리 피크가 5분 내내 이어진 것처럼 보인다. |
| 데모 | `<DownsamplingDemo client:visible />` | `</KeyPoints>`와 `<Checkpoints>` 사이에 둔다. |
| `<Check>` | 4개 | ① 1시간 그래프와 7일 그래프의 최고값이 다르면 버그보다 집계 구간부터 확인한다. ② 다운샘플링한 데이터로 알림 조건을 판단하면 짧은 장애를 놓친다. ③ 툴팁에 한 점이 몇 초를 대표하는지 없으면 사용자는 차이를 설명할 수 없다. ④ `<Term slug="foundations/percentiles">p99</Term>`를 평균으로 다시 묶었다면 틀린 값이다. |
| `<Deeper>` `### 조회할 때 정해지는 간격` | 문장 | Prometheus 범위 질의는 start, end, step을 받아 step마다 점 하나를 계산한다. Grafana는 패널 폭(Max data points)과 Min interval로 간격(`$__interval`)을 정한다. |
| `<Deeper>` `### 저장할 때 줄이는 다운샘플링` | 문장 | Thanos compactor는 원본 외에 5분, 1시간 해상도 데이터를 만든다. 각 구간의 count, sum, min, max, counter 값을 보관해서, 줄인 뒤에도 평균·최댓값·rate를 다시 계산할 수 있다(검토자가 Thanos 문서로 확인한다). |
| `<Deeper>` `### rate 구간과 함께 봐요` | 문장 | step이 `<Term slug="foundations/counters-and-rate">rate</Term>` 구간보다 길면, 점과 점 사이 데이터가 계산에서 빠진다. |

`percentiles.mdx`의 `related`를 `[foundations/counters-and-rate, foundations/aggregation-and-downsampling]`로, `counters-and-rate.mdx`의 `related`를 `[foundations/percentiles, foundations/aggregation-and-downsampling]`로 바꾼다.

- [ ] **Step 3: 글 검사**

Run: `npm run lint:content`
Expected: `글 3편 검사, 위반 0건`.

- [ ] **Step 4: 사실 검토**

부록 A의 프롬프트로 검토받는다. 결과는 `docs/reviews/foundations-aggregation-and-downsampling.md`에 남긴다. 반영한 뒤 Step 3을 다시 돌린다.

- [ ] **Step 5: 빌드와 화면 확인**

Run: `npm run build && npm run test:e2e`
Expected: 둘 다 성공한다. 데모의 해상도·묶는 방법 버튼이 360px에서 두 줄 이내로 정리되는지 확인한다.

- [ ] **Step 6: 커밋**

```bash
git add src/content/docs/foundations docs/reviews/foundations-aggregation-and-downsampling.md
git commit -m "docs: 글 「집계 구간과 다운샘플링」 추가

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 15: 가이드 「같은 지표가 화면마다 다르게 보이는 이유」

**Files:**
- Create: `src/content/docs/foundations/why-numbers-differ.mdx`, `docs/reviews/foundations-why-numbers-differ.md`

**Interfaces:**
- Consumes: `foundations/percentiles`, `foundations/counters-and-rate`, `foundations/aggregation-and-downsampling`
- Produces: 글 id `foundations/why-numbers-differ`

- [ ] **Step 1: 머리말 쓰기**

```mdx
---
title: 같은 지표가 화면마다 다르게 보이는 이유
summary: 집계 구간, 계산 방식, 합치는 순서가 다르면 같은 지표도 숫자가 달라져요.
domain: foundations
type: guide
order: 4
icon: hash
keywords: [숫자 불일치, 대시보드 차이, 값이 달라요, mismatch, 정합성]
related: [foundations/percentiles, foundations/counters-and-rate, foundations/aggregation-and-downsampling]
sources:
  - title: Prometheus — Querying basics
    url: https://prometheus.io/docs/prometheus/latest/querying/basics/
  - title: Grafana — Query options
    url: https://grafana.com/docs/grafana/latest/panels-visualizations/query-transform-data/#query-options
updated: 2026-10-13
---
```

- [ ] **Step 2: 본문 쓰기**

| 블록 | 형태 | 반드시 담을 내용 |
| --- | --- | --- |
| `<Situation>` | 두 단락 | 대시보드 위젯은 결제 API의 p99가 1.2초라고 하고, 같은 시간대의 상세 화면은 3.4초라고 한다. 둘 중 하나가 버그일까? 대부분은 둘 다 맞게 계산한 서로 다른 숫자다. |
| `<FirstLook>` | `<Item>` 3개 | "한 점이 대표하는 시간": 두 화면의 집계 구간이 같은지. "계산 방식": 평균·최댓값·p99 중 무엇인지, rate 구간이 몇 분인지. "합치는 순서": 서버별 값을 먼저 계산했는지, 원본을 합친 뒤 계산했는지. |
| `## 1. 한 점이 대표하는 시간을 맞춰 보세요` | 단락 2~3개 | 위젯이 7일, 상세 화면이 1시간이면 한 점이 5분 대 10초다. 짧은 피크는 긴 구간에서 묻힌다(`<Term slug="foundations/aggregation-and-downsampling">`). 확인 방법: 두 화면의 기간을 같게 맞추고, 질의의 step/interval을 본다. |
| `## 2. 같은 계산식인지 확인하세요` | 단락 2~3개 | 같은 "응답시간"이라도 평균과 p99는 다른 질문에 대한 답이다. rate 구간이 1분과 5분이면 5분 쪽이 더 매끄럽고 피크가 낮다(`<Term slug="foundations/counters-and-rate">`). |
| `## 3. 합치는 순서를 확인하세요` | 단락 2~3개 | 서버 A는 요청 1,000개에 p99 0.5초, 서버 B는 요청 10개에 p99 5초다. 두 p99의 평균 2.75초는 어떤 요청 묶음의 p99도 아니다. 전체 1,010개를 합쳐 다시 계산해야 한다(`<Term slug="foundations/percentiles">`). 히스토그램이라면 버킷 개수를 먼저 더한 뒤 분위수를 구한다. |
| `## 4. 그래도 다르면 데이터를 확인하세요` | 단락 1~2개 또는 목록 | 한쪽 화면만 일부 서버를 필터로 빼고 있는지, 늦게 도착한 데이터가 한쪽에만 반영됐는지, 시간대(UTC와 KST)가 다른지 본다. |
| `<Checkpoints>` | `<Check>` 3개 | ① 두 화면이 같은 이름의 지표를 서로 다른 질의로 계산한다면 계산식을 문서로 남긴다. ② 툴팁에 집계 구간과 계산 방식이 없다면 추가한다. ③ 서버별 백분위수를 평균 내서 서비스 전체 값으로 보여 준다면 고친다. |

- [ ] **Step 3: 글 검사**

Run: `npm run lint:content`
Expected: `글 4편 검사, 위반 0건`.

- [ ] **Step 4: 사실 검토**

부록 A의 프롬프트로 검토받는다. 결과는 `docs/reviews/foundations-why-numbers-differ.md`에 남긴다. 반영한 뒤 Step 3을 다시 돌린다.

- [ ] **Step 5: 빌드와 화면 확인**

Run: `npm run build && npm run test:e2e`
Expected: 둘 다 성공한다. 가이드 아래에 "이 글에 쓰인 개념" 3개가 본문 등장 순서(다운샘플링 → 카운터 → 백분위수)로 나오는지 확인한다.

- [ ] **Step 6: 커밋**

```bash
git add src/content/docs/foundations/why-numbers-differ.mdx docs/reviews/foundations-why-numbers-differ.md
git commit -m "docs: 가이드 「같은 지표가 화면마다 다르게 보이는 이유」 추가

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 16: CI·배포 워크플로와 README

**Files:**
- Create: `.github/workflows/site.yml`, `README.md`

**Interfaces:**
- Consumes: npm 스크립트 `check`, `test`, `test:e2e`, `build`(Task 1~8), `astro.config.mjs`의 `SITE_URL`·`BASE_PATH`(Task 1)
- Produces: PR과 `main` 푸시마다 검사를 실행하고, `main`이면 GitHub Pages에 배포한다. 공개 주소는 `https://yeonjin1357.github.io/DomainDocs/`이다.

- [ ] **Step 1: 워크플로 쓰기**

`.github/workflows/site.yml`:

```yaml
name: site

on:
  push:
    branches: [main]
  pull_request:
  workflow_dispatch:

permissions:
  contents: read

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run check
      - run: npm test
      - run: npm run test:e2e

  deploy:
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'
    needs: verify
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    concurrency:
      group: pages
      cancel-in-progress: false
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v7
      - uses: actions/setup-node@v7
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - id: pages
        uses: actions/configure-pages@v6
      - run: npm run build
        env:
          SITE_URL: ${{ steps.pages.outputs.origin }}
          BASE_PATH: ${{ steps.pages.outputs.base_path }}
      - uses: actions/upload-pages-artifact@v5
        with:
          path: dist
      - id: deployment
        uses: actions/deploy-pages@v5
```

- [ ] **Step 2: README 쓰기**

`README.md`(해요체):

````md
# DomainDocs

모니터링 제품을 만들고 판단하는 개발자를 위한 한국어 개념 노트예요.
숫자 뒤의 의미를 짧고 쉽게 정리해요.

- 사이트: https://yeonjin1357.github.io/DomainDocs/
- 지금 있는 영역: 공통 기초 (APM, DB 모니터링, 인프라·쿠버네티스는 준비 중이에요)

## 로컬에서 보기

```bash
npm ci
npm run dev        # http://localhost:4321/DomainDocs/
```

## 글 쓰기

글은 `src/content/docs/{영역}/{글이름}.mdx`예요. 쓰기 전에 [글쓰기 가이드](docs/writing-guide.md)를 읽어 주세요.
`npm run lint:content`가 글의 틀과 문장을 검사해요.

## 검사

| 명령 | 하는 일 |
| --- | --- |
| `npm run check` | 타입 검사 |
| `npm test` | 단위 테스트 |
| `npm run test:e2e` | 화면 테스트(테스트 전용 글로 빌드해서 실행) |
| `npm run build` | 글 검사 → 빌드 → 검색 색인 |
````

- [ ] **Step 3: 전체 검사**

Run: `npm run check && npm test && npm run test:e2e && npm run build`
Expected: 모두 성공한다. 마지막 `build`가 실제 글 4편으로 `dist/`를 다시 만든다.

- [ ] **Step 4: 커밋**

```bash
git add .github/workflows/site.yml README.md
git commit -m "ci: 검사와 GitHub Pages 배포 워크플로, README 추가

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 5: 공개 전에 사이트 주인에게 확인받기(멈춤)**

GitHub에 공개 저장소를 만들고 푸시하는 일은 되돌리기 어렵고 외부에 공개된다. 다음 내용을 사이트 주인에게 보여 주고 **명시적인 승인을 받은 뒤에만** Step 6으로 간다.

- 만들 저장소: `yeonjin1357/DomainDocs`(public)
- 올라갈 내용: 이 저장소 전체(`docs/reviews/`, `docs/superpowers/` 포함)
- 켤 설정: GitHub Pages(GitHub Actions로 빌드)
- 공개 주소: `https://yeonjin1357.github.io/DomainDocs/`

작업 브랜치에서 진행했다면, 승인 전에 `superpowers:finishing-a-development-branch` 스킬로 `main`에 합친다.

- [ ] **Step 6: 저장소 만들기, Pages 켜기, 푸시(승인 뒤에만)**

```bash
gh repo create DomainDocs --public --source . --remote origin --description "모니터링 도메인 지식을 쉽게 정리하는 한국어 개념 노트"
gh api -X POST repos/yeonjin1357/DomainDocs/pages -f build_type=workflow
git push -u origin main
gh run watch "$(gh run list --workflow site.yml --limit 1 --json databaseId --jq '.[0].databaseId')" --exit-status
curl -s -o /dev/null -w "%{http_code}\n" https://yeonjin1357.github.io/DomainDocs/
curl -s -o /dev/null -w "%{http_code}\n" https://yeonjin1357.github.io/DomainDocs/foundations/percentiles/
```

Expected: 워크플로의 `verify`와 `deploy`가 모두 성공하고, 두 `curl`이 `200`을 출력한다. Pages API가 이미 켜져 있다는 오류(409)를 내면 무시하고 다음 줄로 간다. `verify`가 CI에서만 실패하면 로그를 읽고 원인을 고친다. 테스트를 건너뛰게 만들지 않는다.

---

### Task 17: 최종 화면 점검과 보고

**Files:**
- Create: `scripts/capture-screens.mjs`

**Interfaces:**
- Consumes: 실제 글로 빌드한 `dist/`(Task 16), `scripts/serve-dist.mjs`(Task 1)
- Produces: `screenshots/*.png`(git에 넣지 않는다), 사이트 주인에게 보내는 보고

- [ ] **Step 1: 화면 캡처 스크립트 쓰기**

`scripts/capture-screens.mjs`:

```js
// 실제 글로 빌드한 사이트의 주요 화면을 라이트·다크 × 데스크톱·모바일로 캡처한다.
// 사용: node scripts/serve-dist.mjs 4330 & node scripts/capture-screens.mjs http://localhost:4330/DomainDocs/
import { mkdir } from 'node:fs/promises';
import { chromium } from '@playwright/test';

const base = process.argv[2] ?? 'http://localhost:4330/DomainDocs/';
const PAGES = [
  ['home', ''],
  ['foundations', 'foundations/'],
  ['percentiles', 'foundations/percentiles/'],
  ['counters', 'foundations/counters-and-rate/'],
  ['downsampling', 'foundations/aggregation-and-downsampling/'],
  ['guide', 'foundations/why-numbers-differ/'],
];
const VIEWS = [
  ['desktop', { width: 1440, height: 900 }, false],
  ['mobile', { width: 360, height: 740 }, true],
];

await mkdir('screenshots', { recursive: true });
const browser = await chromium.launch();
for (const scheme of ['light', 'dark']) {
  for (const [view, viewport, isMobile] of VIEWS) {
    const context = await browser.newContext({ viewport, isMobile, hasTouch: isMobile, deviceScaleFactor: 2, colorScheme: scheme });
    const page = await context.newPage();
    for (const [name, path] of PAGES) {
      await page.goto(new URL(path, base).toString());
      await page.screenshot({ path: `screenshots/${name}-${view}-${scheme}.png`, fullPage: true });
    }
    // 본문 한 줄에 들어가는 글자 수(한글 한 글자 ≈ 1em)
    await page.goto(new URL('foundations/percentiles/', base).toString());
    const perLine = await page.locator('.point-body p').first().evaluate((p) => p.getBoundingClientRect().width / parseFloat(getComputedStyle(p).fontSize));
    console.log(`${view}/${scheme}: 핵심 본문 한 줄 ≈ ${perLine.toFixed(1)}자`);
    // 미리보기 시트와 검색
    await page.goto(new URL('foundations/why-numbers-differ/', base).toString());
    await page.locator('a.term').first().click();
    await page.locator('#term-sheet').waitFor({ state: 'visible' });
    await page.waitForTimeout(400);
    await page.screenshot({ path: `screenshots/sheet-${view}-${scheme}.png` });
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: '검색' }).click();
    await page.getByRole('searchbox', { name: '검색어' }).fill('백분위수');
    await page.locator('[data-search-result]').first().waitFor();
    await page.screenshot({ path: `screenshots/search-${view}-${scheme}.png` });
    await context.close();
  }
}
await browser.close();
```

- [ ] **Step 2: 캡처하고 직접 살펴보기**

Run: `npm run build`를 실행한 뒤 `node scripts/serve-dist.mjs 4330`을 백그라운드로 띄우고 `node scripts/capture-screens.mjs`를 실행한다.
Expected: `screenshots/`에 PNG 32장이 생긴다. 페이지 6개 × 화면 2 × 테마 2 = 24장에 시트·검색 각 4장이다. 콘솔에는 한 줄 글자 수가 찍힌다(데스크톱 30~40자, 모바일 15~20자 안팎).

캡처를 하나씩 열어 다음을 확인한다. 고칠 것이 있으면 고친 뒤 `npm run test:e2e`를 다시 통과시키고 재캡처한다.

| 확인할 것 | 기준 |
| --- | --- |
| 한 줄 길이 | 데스크톱 본문이 35자 안팎이고, 넓게 퍼지지 않는다 |
| 위계 | 페이지 제목 > 블록 제목(핵심 등) > 핵심 소제목 순으로 크기와 굵기가 분명하다 |
| 여백 | 블록 사이가 충분히 떨어져 있고, 구분선 없이도 영역이 나뉜다 |
| 다크 모드 | 글자와 배경의 대비가 충분하고, 코드 블록·차트·경고 카드 색이 어색하지 않다 |
| 모바일 | 가로 스크롤이 없고, 숫자 타일·데모 버튼이 겹치지 않는다 |
| 시트·검색 | 시트가 아래에서 올라온 모양이고, 검색 결과가 토스 목록처럼 보인다 |

- [ ] **Step 3: 커밋**

```bash
git add scripts/capture-screens.mjs
git commit -m "chore: 주요 화면 캡처 스크립트 추가

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Task 16에서 공개했다면 푸시해서 배포 결과에도 반영한다. 승인받은 같은 저장소라면 다시 확인받지 않아도 된다.

- [ ] **Step 4: 사이트 주인에게 보고**

다음 내용을 짧게 보고한다.

- 공개 주소(또는 공개 전이면 로컬에서 보는 방법)
- 실린 글 4편과 각 글의 사실 검토 결과 요약(수정 건수)
- 한 줄 글자 수 측정값과 Step 2에서 고친 것
- 사이트 주인의 판단이 필요한 것: 사이트 이름·홈 문구(`src/data/site.ts`), 글 검사 기준값이 너무 엄격하거나 느슨했던 곳, 다음 묶음으로 쓸 공통 기초 글 후보

---

## 부록 A: 사실 검토 프롬프트

글 작업(Task 12~15)의 사실 검토 에이전트에게 다음을 그대로 넘긴다. `<…>` 부분만 바꾼다.

```text
너는 한국어 모니터링 지식 사이트의 사실 검토자야. 문체는 평가하지 마. 사실만 본다.

검토할 글: <src/content/docs/foundations/글이름.mdx>
글의 머리말 sources와, 필요하면 네가 찾은 1차 자료(공식 문서, 명세, 원 논문)를 근거로 써.

할 일:
1. 글의 모든 사실 주장, 숫자, 식, 예시 계산을 하나씩 뽑아.
2. 예시 계산은 직접 다시 계산해(예: 평균, 백분위수 순위, 초당 증가량).
3. 각 주장에 판정을 붙여: 맞음 / 틀림 / 오해 소지 / 확인 불가.
   - "오해 소지"는 사실은 맞지만 개발자가 잘못 판단하게 만들 만큼 단순화된 경우야.
4. 틀림·오해 소지에는 해요체 수정 문장을 제안해. 한 문장 80자 이하, 면책 문장 없이.
5. 아래 형식으로 <docs/reviews/foundations-글이름.md>에 저장해. 결과 요약도 함께 돌려줘.

# 사실 검토: <제목>

- 글: <경로>
- 검토일: <YYYY-MM-DD>
- 결과: 수정 필요 N건 / 확인 N건

| 주장(인용) | 판정 | 근거(URL과 짧은 인용) | 수정 제안 |
| --- | --- | --- | --- |

## 반영

(작성자가 채운다)
```

---

## Self-Review 기록

- **스펙 대조**: 4장(페이지·탐색·시트·검색)은 Task 4~8, 5장(틀)은 Task 3·5, 6장(글쓰기 규칙)은 Task 3, 7장(스키마·검사)은 Task 3·5, 8장(디자인)은 Task 4·5·9, 9장(구조)은 전체, 10장(정확성)은 Task 12~15와 부록 A가 맡는다. 11장(범위)은 Task 12~16, 12장(테스트)은 각 Task, 13장(위험)은 Task 1·2·8이 맡는다. 성공 기준 중 "JavaScript 없이 렌더링"은 Task 7의 JS 비활성 테스트, "360px 가로 스크롤 없음"은 Task 5·6·10의 PAGES 넘침 테스트가 확인한다.
- **스펙에서 조정한 점**(스펙 문서에 반영함): `keywords` 필드 추가, 경고 옅은 배경 토큰 추가, MDX 처리기를 unified로 고정, 테스트 전용 글과 base 경로 서버, 마크다운 링크 금지 규칙, 백분위수 데모를 끌어다 놓기 대신 슬라이더로 바꿈(키보드 접근과 같은 학습 효과). Badge는 별도 컴포넌트 없이 ListRow·DocHeader 스타일에 포함했다.
