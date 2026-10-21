import { expect, test } from '@playwright/test';

test.describe('용어 미리보기', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('foundations/beta/');
  });

  test('용어를 누르면 이름·영어·뜻·비유가 나온다', async ({ page }) => {
    await page.locator('a.term[data-term="term:foundations/snmp"]').click();
    const sheet = page.locator('#term-sheet');
    await expect(sheet).toBeVisible();
    await expect(sheet.locator('[data-term-meta]')).toHaveText('모니터링 기초 · 용어');
    await expect(sheet.locator('[data-term-title]')).toHaveText('SNMP');
    await expect(sheet.locator('[data-term-en]')).toHaveText('Simple Network Management Protocol');
    await expect(sheet.locator('[data-term-summary]')).toHaveText('장비의 상태를 묻고 답하는 표준 규약이에요.');
    await expect(sheet.locator('[data-term-analogy]')).toHaveText('관리 서버가 장비마다 놓인 문진표를 돌며 읽는 것과 같아요.');
    await expect(sheet.locator('[data-term-points-wrap]')).toBeHidden();
  });

  test('글이 없는 용어는 용어 사전의 그 위치로 간다', async ({ page }) => {
    await page.locator('a.term[data-term="term:foundations/snmp"]').click();
    await page.locator('#term-sheet').getByRole('link', { name: '용어 사전에서 보기' }).click();
    await expect(page).toHaveURL(/terms\/foundations\/#term-snmp$/);
  });

  test('같은 키의 글과 용어는 각자 맞는 시트를 연다', async ({ page }) => {
    const sheet = page.locator('#term-sheet');
    await page.locator('a.term[data-term="foundations/alpha"]').click();
    await expect(sheet.locator('[data-term-meta]')).toHaveText('모니터링 기초 · 개념');
    await expect(sheet.locator('[data-term-en]')).toBeHidden();
    await expect(sheet.locator('[data-term-analogy-wrap]')).toBeHidden();
    await page.keyboard.press('Escape');
    await page.locator('a.term[data-term="term:foundations/alpha"]').click();
    await expect(sheet.locator('[data-term-meta]')).toHaveText('모니터링 기초 · 용어');
    await sheet.getByRole('link', { name: '전체 보기' }).click();
    await expect(page).toHaveURL(/foundations\/alpha\/$/);
  });
});

test.describe('자바스크립트 없이', () => {
  test.use({ javaScriptEnabled: false });

  test('용어 링크는 용어 사전의 그 위치로 간다', async ({ page }) => {
    await page.goto('foundations/beta/');
    await page.locator('a.term[data-term="term:foundations/snmp"]').click();
    await expect(page).toHaveURL(/terms\/foundations\/#term-snmp$/);
  });
});

test('용어 사전은 가나다 다음 ABC 순이고, 글이 있으면 자세히 보기로 잇는다', async ({ page }) => {
  await page.goto('terms/foundations/');
  await expect(page.locator('h1')).toHaveText('모니터링 기초 용어 사전');
  await expect(page.locator('[data-term-entry] h2')).toHaveText(['스위치', '알파', 'ICMP', 'SNMP']);
  await expect(page.locator('#term-alpha').getByRole('link', { name: '자세히 보기' })).toHaveAttribute('href', '/DomainDocs/foundations/alpha/');
  await expect(page.locator('#term-snmp')).toContainText('Simple Network Management Protocol');
  await expect(page.locator('#term-snmp')).toContainText('관리 서버가 장비마다 놓인 문진표를 돌며 읽는 것과 같아요.');
  await expect(page.getByRole('link', { name: '뒤로 가기' })).toHaveAttribute('href', '/DomainDocs/foundations/');
});

test('용어 사전도 검색된다', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: '검색' }).click();
  await page.getByRole('searchbox', { name: '검색어' }).fill('문진표');
  await expect(page.locator('[data-search-result]').first()).toContainText('용어 사전');
});

test('영역 페이지에 용어 사전 줄이 있다', async ({ page }) => {
  await page.goto('foundations/');
  await expect(page.getByRole('link', { name: /용어 사전/ })).toHaveAttribute('href', '/DomainDocs/terms/foundations/');
});
