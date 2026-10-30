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

test.describe('리틀의 법칙 데모', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('foundations/demos/');
    await waitForIsland(page, 'LittlesLawDemo');
  });

  test('초당 200건을 0.5초씩이면 100건이 처리 중이고, 1.5초로 늘리면 처리량이 133건으로 꺾인다', async ({ page }) => {
    const demo = page.locator('[data-demo="littles-law"]');
    await expect(demo.locator('[data-stat="needed"] .demo-stat-value')).toHaveText('100건');
    await expect(demo.locator('[data-stat="served"] .demo-stat-value')).toHaveText('초당 200건');
    await demo.getByRole('slider', { name: '응답시간' }).focus();
    for (let i = 0; i < 10; i++) await page.keyboard.press('ArrowRight');
    await expect(demo.locator('[data-response]')).toHaveText('1.5초');
    await expect(demo.locator('[data-stat="needed"] .demo-stat-value')).toHaveText('300건');
    await expect(demo.locator('[data-stat="served"] .demo-stat-value')).toHaveText('초당 133건');
    await expect(demo.locator('[data-demo-message]')).toContainText('줄을 서요');
  });
});

test.describe('재시도 곱셈 데모', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('foundations/demos/');
    await waitForIsland(page, 'RetryFanoutDemo');
  });

  test('세 계층이 4번씩 보내면 DB는 64번, 다섯 계층이 3번씩이면 243번 받는다', async ({ page }) => {
    const demo = page.locator('[data-demo="retry-fanout"]');
    const bottom = demo.locator('[data-stat="bottom"] .demo-stat-value');
    await expect(bottom).toHaveText('64번');
    await expect(demo.locator('.demo-bars li')).toHaveCount(4);
    await demo.locator('label', { hasText: /^5계층$/ }).click();
    await demo.locator('label', { hasText: /^3번$/ }).click();
    await expect(bottom).toHaveText('243번');
    await expect(demo.locator('.demo-bars li')).toHaveCount(6);
    await expect(demo.locator('[data-stat="single"] .demo-stat-value')).toHaveText('3번');
  });
});

test.describe('rate 구간 데모', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('foundations/demos/');
    await waitForIsland(page, 'RateWindowDemo');
  });

  test('15초 수집에 [15s]면 비고, [1m]이면 나오며, 수집이 빠지면 샘플이 하나 준다', async ({ page }) => {
    const demo = page.locator('[data-demo="rate-window"]');
    const samples = demo.locator('[data-stat="samples"] .demo-stat-value');
    const rate = demo.locator('[data-stat="rate"] .demo-stat-value');
    await expect(samples).toHaveText('1개');
    await expect(rate).toHaveText('비어요');
    await demo.locator('label', { hasText: /^\[1m\]$/ }).click();
    await expect(samples).toHaveText('4개');
    await expect(rate).toHaveText('나와요');
    await expect(demo.locator('.demo-sample.is-in')).toHaveCount(4);
    await demo.locator('label', { hasText: '바로 앞 수집 한 번 실패' }).click();
    await expect(samples).toHaveText('3개');
    await demo.locator('label', { hasText: /^\[30s\]$/ }).click();
    await expect(rate).toHaveText('비어요');
  });
});

test.describe('카디널리티 데모', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('foundations/demos/');
    await waitForIsland(page, 'CardinalityDemo');
  });

  test('method·status·route는 10,000개, instance를 더하면 500,000개, user_id까지 붙이면 50억 개다', async ({ page }) => {
    const demo = page.locator('[data-demo="cardinality"]');
    const series = demo.locator('[data-stat="series"] .demo-stat-value');
    await expect(series).toHaveText('10,000개');
    await demo.locator('label', { hasText: /^instance/ }).click();
    await expect(series).toHaveText('500,000개');
    await demo.locator('label', { hasText: /^user_id/ }).click();
    await expect(series).toHaveText('5,000,000,000개');
    await expect(demo.locator('[data-demo-message]')).toContainText('user_id는');
  });
});
