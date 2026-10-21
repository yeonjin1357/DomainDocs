import { expect, test } from '@playwright/test';

test.describe('개념 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('foundations/alpha/');
  });

  test('제목·요약·종류·읽는 시간을 보여 준다', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('알파 개념');
    await expect(page.locator('[data-doc-summary]')).toHaveText('테스트용 개념 글이에요. 백분위수라는 단어를 담고 있어요.');
    await expect(page.locator('[data-doc-type]')).toHaveText('개념');
    await expect(page.locator('[data-reading-time]')).toHaveText('1분');
    await expect(page).toHaveTitle('알파 개념 · DomainDocs');
  });

  test('틀 블록이 순서대로 나온다', async ({ page }) => {
    const blocks = await page.locator('article [data-block]').evaluateAll((els) => els.map((e) => e.getAttribute('data-block')));
    expect(blocks).toEqual(['on-dashboard', 'key-points', 'checkpoints', 'deeper']);
  });

  test('핵심은 제목이 있는 항목 목록이다', async ({ page }) => {
    await expect(page.locator('[data-point] h3')).toHaveText(['첫 번째 핵심', '긴 이름도 화면을 넘지 않아요']);
  });

  test('더 깊이는 기본으로 접혀 있고 누르면 펼쳐진다', async ({ page }) => {
    const deeper = page.locator('details[data-block="deeper"]');
    await expect(deeper).not.toHaveAttribute('open');
    await deeper.locator('summary').click();
    await expect(deeper).toHaveAttribute('open', '');
  });

  test('더 깊이 제목은 h2라서 안의 ### 소제목이 그 아래에 놓인다', async ({ page }) => {
    const title = page.locator('details[data-block="deeper"] > summary > h2.deeper-title');
    await expect(title).toHaveText('더 깊이 알아보기');
    // 보이는 모양은 예전 요약 줄 글자와 같다.
    await expect(title).toHaveCSS('font-size', '17px');
    await expect(title).toHaveCSS('font-weight', '600');
    await expect(title).toHaveCSS('margin-top', '0px');
  });

  test('물결표 범위가 취소선이 되지 않는다', async ({ page }) => {
    await expect(page.locator('article del')).toHaveCount(0);
    await expect(page.locator('article')).toContainText('1~2초 또는 3~4초');
  });

  test('Term은 대상 글로 가는 링크다', async ({ page }) => {
    await expect(page.locator('a.term[data-term="foundations/beta"]')).toHaveAttribute('href', '/DomainDocs/foundations/beta/');
  });

  test('참고 자료, 관련 개념, 다음 글을 보여 준다', async ({ page }) => {
    await expect(page.locator('[data-sources] a')).toHaveAttribute('href', 'https://example.com/alpha');
    await expect(page.locator('[data-related] [data-row]')).toHaveCount(1);
    await expect(page.locator('[data-related] [data-row]')).toContainText('베타 개념');
    await expect(page.locator('[data-next]')).toContainText('데모 모음');
  });

  test('뒤로 가기는 영역 페이지를 가리킨다', async ({ page }) => {
    await expect(page.getByRole('link', { name: '뒤로 가기' })).toHaveAttribute('href', '/DomainDocs/foundations/');
  });
});

test.describe('한눈에 보기 페이지', () => {
  test('종류는 한눈에 보기이고, 다음 글은 첫 기초 글이다', async ({ page }) => {
    await page.goto('foundations/map/');
    await expect(page.locator('[data-doc-type]')).toHaveText('한눈에 보기');
    await expect(page.locator('article [data-block="figure"]')).toHaveCount(1);
    await expect(page.locator('[data-next]')).toContainText('알파 개념');
  });
});

test.describe('가이드 페이지', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('foundations/gamma-guide/');
  });

  test('틀 블록과 단계 소제목이 나온다', async ({ page }) => {
    const blocks = await page.locator('article [data-block]').evaluateAll((els) => els.map((e) => e.getAttribute('data-block')));
    expect(blocks).toEqual(['situation', 'first-look', 'checkpoints']);
    await expect(page.locator('[data-item]')).toHaveCount(2);
    await expect(page.locator('article h2', { hasText: '1. 구간을 맞춰 보세요' })).toBeVisible();
    await expect(page.locator('[data-doc-type]')).toHaveText('가이드');
  });

  test('이 글에 쓰인 개념을 본문 등장 순서로 모은다', async ({ page }) => {
    await expect(page.locator('[data-used-concepts] .row-title')).toHaveText(['알파 개념', '베타 개념']);
  });

  test('영역의 마지막 공개 글이면 다음 글이 없다', async ({ page }) => {
    await expect(page.locator('[data-next]')).toHaveCount(0);
  });
});

test('초안 글은 운영 빌드에 없다', async ({ request }) => {
  const res = await request.get('foundations/draft-doc/');
  expect(res.status()).toBe(404);
});
