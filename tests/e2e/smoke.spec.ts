import { expect, test } from '@playwright/test';

test('홈이 base 경로 아래에서 열린다', async ({ page }) => {
  const res = await page.goto('./');
  expect(res?.status()).toBe(200);
  await expect(page.locator('html')).toHaveAttribute('lang', 'ko');
});

test('base 밖의 경로는 404다', async ({ request }) => {
  const res = await request.get('/');
  expect(res.status()).toBe(404);
});
