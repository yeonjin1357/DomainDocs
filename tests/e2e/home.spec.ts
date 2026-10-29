import { expect, test } from '@playwright/test';

const cardWithTitle = (page: import('@playwright/test').Page, title: string) =>
  page.locator('[data-card]').filter({ has: page.getByRole('heading', { name: title, exact: true }) });

test('홈에 영역 9개가 있고, 글이 없는 영역은 준비 중이다', async ({ page }) => {
  await page.goto('./');
  const rows = cardWithTitle(page, '영역').locator('[data-row]');
  await expect(rows).toHaveCount(9);
  await expect(rows.nth(0)).toHaveAttribute('href', '/DomainDocs/foundations/');
  await expect(rows.nth(0)).toContainText('모니터링 기초');
  await expect(rows.nth(0)).toContainText('6편');
  await expect(rows.nth(1)).toContainText('네트워크');
  for (const i of [1, 2, 3, 4, 5, 6, 7, 8]) {
    await expect(rows.nth(i)).toContainText('준비 중');
    await expect(rows.nth(i)).not.toHaveAttribute('href');
  }
});

test('처음이라면 여기부터는 영역마다 한눈에 보기 글을 보여 준다', async ({ page }) => {
  await page.goto('./');
  await expect(cardWithTitle(page, '처음이라면 여기부터').locator('.row-title')).toHaveText(['지도 글']);
});

test('처음 목록에 이미 있는 글은 최근 추가된 글에 다시 나오지 않는다', async ({ page }) => {
  await page.goto('./');
  const recent = cardWithTitle(page, '최근 추가된 글').locator('.row-title');
  await expect(recent).not.toHaveCount(0);
  await expect(recent.filter({ hasText: '지도 글' })).toHaveCount(0);
});

test('영역 페이지는 한눈에 보기·기초·모니터링에서는·상황 가이드로 묶어 보여 준다', async ({ page }) => {
  await page.goto('foundations/');
  await expect(page.locator('h1')).toHaveText('모니터링 기초');
  await expect(page.locator('[data-card] h2')).toHaveText(['한눈에 보기', '기초', '모니터링에서는', '상황 가이드', '더 알아보기']);
  await expect(cardWithTitle(page, '한눈에 보기').locator('.row-title')).toHaveText(['지도 글']);
  await expect(cardWithTitle(page, '기초').locator('.row-title')).toHaveText(['알파 개념', '그림 모음']);
  await expect(cardWithTitle(page, '모니터링에서는').locator('.row-title')).toHaveText(['데모 모음', '베타 개념']);
  await expect(cardWithTitle(page, '상황 가이드').locator('.row-title')).toHaveText(['감마 가이드']);
  await expect(page.getByRole('link', { name: '뒤로 가기' })).toHaveAttribute('href', '/DomainDocs/');
});

test('준비 중인 영역의 페이지는 없다', async ({ request }) => {
  expect((await request.get('apm/')).status()).toBe(404);
});

test('없는 주소는 404 페이지를 보여 준다', async ({ page }) => {
  const res = await page.goto('no-such-page/');
  expect(res?.status()).toBe(404);
  await expect(page.locator('h1')).toHaveText('페이지를 찾을 수 없어요');
  await expect(page.getByRole('link', { name: '홈으로 가기' })).toHaveAttribute('href', '/DomainDocs/');
});
