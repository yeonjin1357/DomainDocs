import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('foundations/figures/');
});

test('비유 블록은 비유와 안 맞는 곳을 보여 준다', async ({ page }) => {
  const block = page.locator('[data-block="analogy"]');
  await expect(block.getByRole('heading', { name: '비유하면' })).toBeVisible();
  await expect(block).toContainText('비유가 안 맞는 곳');
  await expect(block).toContainText('테스트용 한계 문장이에요.');
});

test('구조도는 상자·화살표·묶음을 그린다', async ({ page }) => {
  const flow = page.getByRole('img', { name: '서버 둘이 스위치 하나에 꽂힌 구조도' });
  await expect(flow.locator('.flow-node')).toHaveCount(3);
  await expect(flow.locator('.flow-edge')).toHaveCount(2);
  await expect(flow.locator('.flow-edge').first()).toHaveAttribute('marker-end', /url\(#/);
  await expect(flow.locator('.flow-group')).toHaveCount(1);
  await expect(flow).toContainText('1Gbps');
});

test('주고받기는 참여자와 화살표를 순서대로 그린다', async ({ page }) => {
  const seq = page.getByRole('img', { name: '관리 서버가 묻고 장비가 답하는 순서' });
  await expect(seq.locator('.seq-lane')).toHaveCount(2);
  await expect(seq.locator('.seq-arrow')).toHaveCount(2);
});

test('계층도와 비교는 글자를 순서대로 보여 준다', async ({ page }) => {
  await expect(page.locator('[data-layers] .layer-label')).toHaveText(['응용', '전송', '네트워크']);
  await expect(page.locator('[data-compare] [data-compare-head]')).toHaveText(['폴링', 'Trap']);
  await expect(page.locator('[data-compare] [data-compare-row]')).toHaveCount(2);
});

test('시간 띠는 줄마다 구간을 시간에 비례해 놓고, 세로선이 모든 줄을 가로지른다', async ({ page }) => {
  const tl = page.getByRole('img', { name: '앱이 400ms부터 300ms 멈추고 요청이 그동안 기다리는 시간 띠' });
  await expect(tl.locator('.tl-lane-label')).toHaveText(['앱', '요청']);
  await expect(tl.locator('.tl-seg')).toHaveCount(4);
  await expect(tl.locator('.tl-tick')).toHaveText(['0ms', '500ms', '1초']);
  const track = await tl.locator('.tl-track').first().boundingBox();
  const pause = await tl.locator('.tl-seg.tone-warn').boundingBox();
  expect(Math.abs(pause!.x - (track!.x + track!.width * 0.4))).toBeLessThan(2);
  expect(Math.abs(pause!.width - track!.width * 0.3)).toBeLessThan(2);
  const line = await tl.locator('.tl-line').boundingBox();
  const lastTrack = await tl.locator('.tl-track').nth(1).boundingBox();
  expect(Math.abs(line!.x - pause!.x)).toBeLessThan(2);
  expect(line!.y).toBeLessThanOrEqual(track!.y);
  expect(line!.y + line!.height).toBeGreaterThanOrEqual(lastTrack!.y + lastTrack!.height);
});

test('칸 띠는 칸을 같은 폭으로 놓고, 표시와 괄호를 가리킨 칸에 맞춘다', async ({ page }) => {
  const strip = page.getByRole('img', { name: '오프셋 0부터 5까지 중 커밋 위치는 3이고 3부터 5까지 3건이 지연인 칸 띠' });
  await expect(strip.locator('.strip-row-label')).toHaveText('파티션 0');
  await expect(strip.locator('.strip-cell')).toHaveText(['0', '1', '2', '3', '4', '5']);
  await expect(strip.locator('.strip-cell.tone-warn')).toHaveCount(3);
  const cell = await strip.locator('.strip-cell').nth(3).boundingBox();
  const arrow = await strip.locator('.strip-mark-arrow').boundingBox();
  expect(Math.abs(arrow!.x + arrow!.width / 2 - (cell!.x + cell!.width / 2))).toBeLessThan(2);
  const last = await strip.locator('.strip-cell').nth(5).boundingBox();
  const range = await strip.locator('.strip-range-bracket').boundingBox();
  expect(Math.abs(range!.x - cell!.x)).toBeLessThan(2);
  expect(Math.abs(range!.x + range!.width - (last!.x + last!.width))).toBeLessThan(2);
  await expect(strip.locator('.strip-range-text')).toHaveText('지연 3건');
});

test('SVG 그림은 이름 붙은 그림이다', async ({ page }) => {
  await expect(page.getByRole('img', { name: '테스트용 SVG 그림' })).toBeVisible();
});

test('다크 모드에서도 그림 글자가 본문 색이다', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  const fill = await page.locator('[data-flow] .flow-label').first().evaluate((el) => getComputedStyle(el).fill);
  expect(fill).toBe('rgb(232, 233, 236)');
});
