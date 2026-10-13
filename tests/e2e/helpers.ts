import { expect, type Page } from '@playwright/test';

/** 넘침 검사를 도는 테스트 페이지 목록. 페이지를 늘리는 Task가 여기에 추가한다. */
export const PAGES = ['./', 'foundations/alpha/', 'foundations/beta/', 'foundations/gamma-guide/'];

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
