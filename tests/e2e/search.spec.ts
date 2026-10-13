import { expect, test } from '@playwright/test';

test.describe('검색', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('./');
  });

  test('검색 버튼으로 열고, 결과를 눌러 글로 간다', async ({ page }) => {
    await page.getByRole('button', { name: '검색' }).click();
    const input = page.getByRole('searchbox', { name: '검색어' });
    await expect(input).toBeFocused();
    await input.fill('백분위수');
    const first = page.locator('[data-search-result]').first();
    await expect(first).toContainText('알파 개념');
    await first.click();
    await expect(page).toHaveURL(/\/DomainDocs\/foundations\/alpha\/$/);
  });

  test('앞부분만 입력해도 찾는다', async ({ page }) => {
    await page.getByRole('button', { name: '검색' }).click();
    await page.getByRole('searchbox', { name: '검색어' }).fill('백분위');
    await expect(page.locator('[data-search-result]').first()).toContainText('알파 개념');
  });

  test('검색용 별칭(keywords)으로도 찾는다', async ({ page }) => {
    await page.getByRole('button', { name: '검색' }).click();
    await page.getByRole('searchbox', { name: '검색어' }).fill('꼬리');
    await expect(page.locator('[data-search-result]').first()).toContainText('알파 개념');
  });

  test('본문 밖(홈 카드 제목)은 색인하지 않는다', async ({ page }) => {
    await page.getByRole('button', { name: '검색' }).click();
    await page.getByRole('searchbox', { name: '검색어' }).fill('처음이라면');
    await expect(page.locator('[data-search-status]')).toContainText('맞는 글이 없어요');
    await expect(page.locator('[data-search-result]')).toHaveCount(0);
  });

  test('/ 키로 열고 Esc로 닫는다', async ({ page }) => {
    await page.keyboard.press('/');
    const dialog = page.locator('#search-dialog');
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });
});

test('검색 색인을 불러오지 못하면 안내 문구를 보여 준다', async ({ page }) => {
  await page.route('**/pagefind/pagefind.js', (route) => route.abort());
  await page.goto('./');
  await page.getByRole('button', { name: '검색' }).click();
  await page.getByRole('searchbox', { name: '검색어' }).fill('백분위수');
  await expect(page.locator('[data-search-status]')).toHaveText('검색 색인을 불러오지 못했어요. 빌드한 사이트에서 다시 시도해 주세요.');
});
