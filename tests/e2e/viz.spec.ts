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

test('워터폴은 구간마다 이름·시간·막대를 그리고, 막대 위치가 시간에 비례한다', async ({ page }) => {
  await page.goto('foundations/beta/');
  const fall = page.getByRole('img', { name: '요청 1초 중 DB 조회가 0.3초인 워터폴' });
  await expect(fall.locator('.span-row')).toHaveCount(2);
  await expect(fall.locator('.span-time')).toHaveText(['1,000ms', '300ms']);
  const track = await fall.locator('.span-track').nth(1).boundingBox();
  const bar = await fall.locator('.span-bar').nth(1).boundingBox();
  expect(Math.abs(bar!.x - (track!.x + track!.width * 0.1))).toBeLessThan(2);
  expect(Math.abs(bar!.width - track!.width * 0.3)).toBeLessThan(2);
});

test('분포도는 무리마다 점을 찍고, 가로줄 무리는 눈금선 높이에 놓인다', async ({ page }) => {
  await page.goto('foundations/beta/');
  const plot = page.getByRole('img', { name: '평소 요청 아래로 3초 가로줄이 있는 분포도' });
  await expect(plot.locator('.dot')).toHaveCount(52);
  await expect(plot.locator('.dot.tone-warn')).toHaveCount(12);
  const scatter = page.locator('[data-scatter]');
  await expect(scatter.locator('.tick')).toHaveText(['1,000ms', '3,000ms']);
  await expect(scatter.locator('.legend li')).toHaveText(['정상', '타임아웃']);
  const grid = await plot.locator('.grid').nth(1).boundingBox();
  const dot = await plot.locator('.dot.tone-warn').first().boundingBox();
  expect(Math.abs(dot!.y + dot!.height / 2 - grid!.y)).toBeLessThan(2);
  const box = await plot.boundingBox();
  expect(dot!.x).toBeGreaterThan(box!.x + box!.width * 0.4 - 4);
  expect(dot!.x).toBeLessThan(box!.x + box!.width * 0.8);
});

test('서비스 맵은 노드를 위치에 놓고, 선 글자를 두 노드 사이에 둔다', async ({ page }) => {
  await page.goto('foundations/beta/');
  const map = page.getByRole('img', { name: '주문 API가 결제 API와 DB를 부르는 서비스 맵' });
  await expect(map.locator('.node')).toHaveCount(3);
  await expect(map.locator('.edge')).toHaveCount(2);
  await expect(map.locator('.node.virtual')).toHaveText('orders DB');
  await expect(page.locator('[data-service-map] .legend')).toHaveText('점선은 계측되지 않은 곳');
  const box = await map.boundingBox();
  const order = await map.locator('.node').first().boundingBox();
  expect(Math.abs(order!.x + order!.width / 2 - (box!.x + box!.width * 0.2))).toBeLessThan(2);
  const label = await map.locator('.edge-label').boundingBox();
  expect(Math.abs(label!.x + label!.width / 2 - (box!.x + box!.width * 0.5))).toBeLessThan(2);
  expect(Math.abs(label!.y + label!.height / 2 - (box!.y + box!.height * 0.35))).toBeLessThan(2);
});

test('숫자 타일 두 개가 한 줄에 놓인다', async ({ page }) => {
  const tiles = page.locator('[data-block="on-dashboard"] [data-stat]');
  const [a, b] = [await tiles.nth(0).boundingBox(), await tiles.nth(1).boundingBox()];
  expect(Math.abs(a!.y - b!.y)).toBeLessThan(2);
});
