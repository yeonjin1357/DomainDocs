import { expect, test } from '@playwright/test';

// 헤드리스 Chromium은 기본으로 스크롤바를 숨긴다. 이 파일만 스크롤바를 보이게 띄워서,
// 시트가 올라오는 동안 대화상자에 스크롤바가 잠깐 생겼다 사라지는지 잰다.
test.use({ launchOptions: { ignoreDefaultArgs: ['--hide-scrollbars'] } });

test('시트가 올라오는 동안 대화상자에 스크롤바가 생기지 않는다', async ({ page }) => {
  await page.goto('foundations/alpha/');
  await page.evaluate(() => {
    const dialog = document.getElementById('term-sheet') as HTMLDialogElement;
    const w = window as unknown as { maxBar: number; t0: number };
    w.maxBar = 0;
    const sample = () => {
      if (dialog.open) w.maxBar = Math.max(w.maxBar, dialog.offsetWidth - dialog.clientWidth);
      if (performance.now() - w.t0 < 500) requestAnimationFrame(sample);
    };
    document.addEventListener('click', () => {
      w.t0 = performance.now();
      requestAnimationFrame(sample);
    }, true);
  });
  await page.locator('a.term[data-term="foundations/beta"]').click();
  await expect(page.locator('#term-sheet')).toBeVisible();
  await page.waitForTimeout(600);
  expect(await page.evaluate(() => (window as unknown as { maxBar: number }).maxBar)).toBe(0);
});

// 열 때 브라우저가 시트 안 첫 버튼에 포커스를 주며, 아직 화면 아래에 있는 버튼을 보이려고 dialog를 스크롤한다.
// 그 스크롤이 올라오는 애니메이션과 엇갈리면 시트가 위로 떴다가 내려앉아 보인다.
test('시트가 올라오는 동안 대화상자가 스크롤되지 않는다', async ({ page }) => {
  await page.goto('foundations/alpha/');
  await page.evaluate(() => {
    const dialog = document.getElementById('term-sheet') as HTMLDialogElement;
    const w = window as unknown as { maxScroll: number; t0: number };
    w.maxScroll = 0;
    const sample = () => {
      if (dialog.open) w.maxScroll = Math.max(w.maxScroll, dialog.scrollTop);
      if (performance.now() - w.t0 < 500) requestAnimationFrame(sample);
    };
    document.addEventListener('click', () => {
      w.t0 = performance.now();
      requestAnimationFrame(sample);
    }, true);
  });
  await page.locator('a.term[data-term="foundations/beta"]').click();
  await expect(page.locator('#term-sheet')).toBeVisible();
  await page.waitForTimeout(600);
  expect(await page.evaluate(() => (window as unknown as { maxScroll: number }).maxScroll)).toBe(0);
});
