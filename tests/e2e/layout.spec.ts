import { expect, test } from '@playwright/test';
import { expectNoHorizontalOverflow } from './helpers';

test('본문 글꼴은 Pretendard, 17px, 행간 1.7이다', async ({ page }) => {
  await page.goto('./');
  const style = await page.evaluate(() => {
    const s = getComputedStyle(document.body);
    return { family: s.fontFamily, size: s.fontSize, lineHeight: s.lineHeight };
  });
  expect(style.family).toContain('Pretendard Variable');
  expect(style.size).toBe('17px');
  expect(parseFloat(style.lineHeight)).toBeCloseTo(17 * 1.7, 1);
});

test('라이트 모드 배경은 #F2F4F6이다', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'light' });
  await page.goto('./');
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(242, 244, 246)');
});

test('다크 모드 배경은 #101013이다', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('./');
  expect(await page.evaluate(() => getComputedStyle(document.body).backgroundColor)).toBe('rgb(16, 16, 19)');
});

test('본문 칼럼은 640px을 넘지 않는다', async ({ page }) => {
  await page.goto('./');
  const width = await page.locator('main.page').evaluate((el) => el.getBoundingClientRect().width);
  expect(width).toBeLessThanOrEqual(640);
});

test('상단 바에 사이트 이름과 검색 버튼이 있다', async ({ page }) => {
  await page.goto('./');
  await expect(page.getByRole('link', { name: 'DomainDocs' })).toHaveAttribute('href', '/DomainDocs/');
  await expect(page.getByRole('button', { name: '검색' })).toBeVisible();
});

test('홈에 가로 스크롤이 없다', async ({ page }) => {
  await page.goto('./');
  await expectNoHorizontalOverflow(page);
});
