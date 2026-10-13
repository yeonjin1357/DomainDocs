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
