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
  ['time-series', 'foundations/time-series-and-labels/'],
  ['collection', 'foundations/collection-interval/'],
  ['no-data', 'foundations/no-data-vs-zero/'],
  ['empty-graph', 'foundations/empty-graph/'],
  ['slo', 'foundations/slo-and-error-budget/'],
  ['red-use', 'foundations/red-and-use/'],
  ['alert-conditions', 'foundations/alert-conditions/'],
  ['alert-fatigue', 'foundations/alert-fatigue/'],
  ['histograms', 'foundations/histograms/'],
  ['p99-wrong', 'foundations/p99-looks-wrong/'],
  ['lmt', 'foundations/logs-metrics-traces/'],
  ['cardinality', 'foundations/cardinality-explosion/'],
  ['apm', 'apm/'],
  ['apm-transactions', 'apm/transactions-and-response-time/'],
  ['apm-throughput', 'apm/throughput-and-concurrency/'],
  ['apm-waterfall', 'apm/trace-waterfall/'],
  ['apm-slow', 'apm/slow-response/'],
  ['apm-apdex', 'apm/apdex/'],
  ['apm-distribution', 'apm/response-time-distribution/'],
  ['apm-errors', 'apm/errors-and-exceptions/'],
  ['apm-error-spike', 'apm/error-spike/'],
  ['apm-service-map', 'apm/service-map/'],
  ['apm-sampling', 'apm/sampling/'],
  ['apm-connection-pool', 'apm/connection-pool/'],
  ['apm-broken-traces', 'apm/broken-traces/'],
  ['apm-gc-pause', 'apm/gc-pause/'],
  ['apm-timeouts', 'apm/timeouts-and-retries/'],
  ['apm-consumer-lag', 'apm/consumer-lag/'],
  ['apm-cascading', 'apm/cascading-failure/'],
  ['database', 'database/'],
  ['db-active-sessions', 'database/active-sessions/'],
  ['db-top-sql', 'database/top-sql/'],
  ['db-execution-plans', 'database/execution-plans/'],
  ['db-slow', 'database/slow-database/'],
  ['db-locks', 'database/locks-and-blocking/'],
  ['db-replication', 'database/replication-lag/'],
  ['db-cache-hit', 'database/buffer-cache-hit-ratio/'],
  ['db-connections', 'database/too-many-connections/'],
];
// 미리보기 시트를 여는 링크. 가이드의 첫 링크는 다른 가이드라서, 핵심 목록이 나오는 개념 글 링크를 고른다.
const SHEETS = [
  ['sheet', 'foundations/why-numbers-differ/', 'a.term'],
  ['sheet-empty-graph', 'foundations/empty-graph/', 'a.term[data-term="foundations/no-data-vs-zero"]'],
  ['sheet-alert-fatigue', 'foundations/alert-fatigue/', 'a.term[data-term="foundations/alert-conditions"]'],
  ['sheet-p99-wrong', 'foundations/p99-looks-wrong/', 'a.term[data-term="foundations/histograms"]'],
  ['sheet-error-spike', 'apm/error-spike/', 'a.term[data-term="apm/errors-and-exceptions"]'],
  ['sheet-broken-traces', 'apm/broken-traces/', 'a.term[data-term="apm/service-map"]'],
  ['sheet-cascading', 'apm/cascading-failure/', 'a.term[data-term="apm/timeouts-and-retries"]'],
  ['sheet-db-slow', 'database/slow-database/', 'a.term[data-term="database/active-sessions"]'],
  ['sheet-db-connections', 'database/too-many-connections/', 'a.term[data-term="database/locks-and-blocking"]'],
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
    // 미리보기 시트
    for (const [name, path, link] of SHEETS) {
      await page.goto(new URL(path, base).toString());
      await page.locator(link).first().click();
      await page.locator('#term-sheet').waitFor({ state: 'visible' });
      await page.waitForTimeout(400);
      await page.screenshot({ path: `screenshots/${name}-${view}-${scheme}.png` });
      await page.keyboard.press('Escape');
    }
    // 검색
    await page.getByRole('button', { name: '검색' }).click();
    await page.getByRole('searchbox', { name: '검색어' }).fill('백분위수');
    await page.locator('[data-search-result]').first().waitFor();
    await page.screenshot({ path: `screenshots/search-${view}-${scheme}.png` });
    await context.close();
  }
}
await browser.close();
