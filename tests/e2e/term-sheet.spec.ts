import { expect, test } from '@playwright/test';

test.describe('개념 미리보기 시트', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('foundations/alpha/');
  });

  test('개념 링크를 누르면 페이지를 떠나지 않고 시트가 열린다', async ({ page }) => {
    await page.locator('a.term[data-term="foundations/beta"]').click();
    const sheet = page.locator('#term-sheet');
    await expect(sheet).toBeVisible();
    await expect(sheet.locator('[data-term-meta]')).toHaveText('공통 기초 · 개념');
    await expect(sheet.locator('[data-term-title]')).toHaveText('베타 개념');
    await expect(sheet.locator('[data-term-summary]')).toHaveText('두 번째 테스트용 개념 글이에요.');
    await expect(sheet.locator('[data-term-points] li')).toHaveText(['베타의 첫 핵심', '베타의 둘째 핵심']);
    await expect(page).toHaveURL(/foundations\/alpha\/$/);
  });

  test('Esc로 닫히고 포커스가 링크로 돌아온다', async ({ page }) => {
    const link = page.locator('a.term[data-term="foundations/beta"]');
    await link.focus();
    await page.keyboard.press('Enter');
    const sheet = page.locator('#term-sheet');
    await expect(sheet).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(sheet).toBeHidden();
    await expect(link).toBeFocused();
  });

  test('바깥을 누르거나 닫기 버튼을 누르면 닫힌다', async ({ page }) => {
    const link = page.locator('a.term[data-term="foundations/beta"]');
    const sheet = page.locator('#term-sheet');
    await link.click();
    await page.mouse.click(10, 10);
    await expect(sheet).toBeHidden();
    await link.click();
    await sheet.getByRole('button', { name: '닫기' }).click();
    await expect(sheet).toBeHidden();
  });

  test('전체 보기를 누르면 대상 글로 간다', async ({ page }) => {
    await page.locator('a.term[data-term="foundations/beta"]').click();
    await page.locator('#term-sheet').getByRole('link', { name: '전체 보기' }).click();
    await expect(page).toHaveURL(/foundations\/beta\/$/);
  });

  test('Ctrl/Cmd+클릭은 시트를 열지 않고 새 탭으로 연다', async ({ page, context }) => {
    const [newPage] = await Promise.all([
      context.waitForEvent('page'),
      page.locator('a.term[data-term="foundations/beta"]').click({ modifiers: ['ControlOrMeta'] }),
    ]);
    await expect(page.locator('#term-sheet')).toBeHidden();
    await newPage.close();
  });

  test('손잡이를 아래로 끌어내리면 닫힌다', async ({ page }) => {
    await page.locator('a.term[data-term="foundations/beta"]').click();
    const handle = page.locator('#term-sheet [data-sheet-handle]');
    const box = (await handle.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2, box.y + 160, { steps: 6 });
    await page.mouse.up();
    await expect(page.locator('#term-sheet')).toBeHidden();
  });
});

test('핵심이 없는 가이드를 가리키면 핵심 목록을 숨긴다', async ({ page }) => {
  await page.goto('foundations/beta/');
  await page.locator('a.term[data-term="foundations/gamma-guide"]').click();
  const sheet = page.locator('#term-sheet');
  await expect(sheet.locator('[data-term-meta]')).toHaveText('공통 기초 · 가이드');
  await expect(sheet.locator('[data-term-points-wrap]')).toBeHidden();
});

test('글이 아닌 페이지에는 미리보기 시트가 없다', async ({ page }) => {
  await page.goto('./');
  await expect(page.locator('#term-sheet')).toHaveCount(0);
});

test.describe('JavaScript가 꺼져 있을 때', () => {
  test.use({ javaScriptEnabled: false });

  test('본문이 그대로 보이고 개념 링크는 일반 링크로 동작한다', async ({ page }) => {
    await page.goto('foundations/alpha/');
    await expect(page.locator('[data-point] h3').first()).toHaveText('첫 번째 핵심');
    await page.locator('a.term[data-term="foundations/beta"]').click();
    await expect(page).toHaveURL(/foundations\/beta\/$/);
  });
});
