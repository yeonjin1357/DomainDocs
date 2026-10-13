import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('foundations/alpha/');
});

test('대시보드 그림에 설명이 붙은 차트와 숫자 타일이 있다', async ({ page }) => {
  const block = page.locator('[data-block="on-dashboard"]');
  await expect(block.getByRole('img', { name: '평균은 잔잔하고 p99만 튀는 응답시간 그래프' })).toBeVisible();
  await expect(block.locator('[data-mini-chart] path.line')).toHaveCount(2);
  await expect(block.locator('[data-mini-chart] .legend li')).toHaveText(['평균 187ms', 'p99 3,000ms']);
  await expect(block.locator('[data-stat]')).toHaveCount(2);
  await expect(block.locator('[data-stat]').nth(1)).toContainText('3,000ms');
  await expect(block.locator('[data-stat]').nth(1)).toContainText('평소의 19배');
});

test('숫자 타일 두 개가 한 줄에 놓인다', async ({ page }) => {
  const tiles = page.locator('[data-block="on-dashboard"] [data-stat]');
  const [a, b] = [await tiles.nth(0).boundingBox(), await tiles.nth(1).boundingBox()];
  expect(Math.abs(a!.y - b!.y)).toBeLessThan(2);
});
