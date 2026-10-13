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
