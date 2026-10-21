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

test('SVG 그림은 이름 붙은 그림이다', async ({ page }) => {
  await expect(page.getByRole('img', { name: '테스트용 SVG 그림' })).toBeVisible();
});

test('다크 모드에서도 그림 글자가 본문 색이다', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  const fill = await page.locator('[data-flow] .flow-label').first().evaluate((el) => getComputedStyle(el).fill);
  expect(fill).toBe('rgb(232, 233, 236)');
});
