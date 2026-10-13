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
