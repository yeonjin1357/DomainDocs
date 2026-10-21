import { expect, test, type Page } from '@playwright/test';
import { expectNoHorizontalOverflow } from './helpers';

const DOC_QUIZ = 'quiz/play/?scope=doc%3Afoundations%2Falpha';
/** index는 OX(O=0, X=1), choice는 정답 보기의 글(보기 순서는 풀 때마다 섞여요), text는 주관식 정답 */
const ANSWERS: Record<string, { index?: number; choice?: string; text?: string }> = {
  'foundations/alpha#alpha-ox': { index: 0 },
  'foundations/alpha#alpha-choice': { choice: '모니터링 기초' },
  'foundations/alpha#alpha-input': { text: 'SNMP' },
};

/** 지금 화면에서 정답 보기의 순서(0부터) */
async function rightIndex(page: Page, key: string): Promise<number> {
  const a = ANSWERS[key];
  if (a.choice === undefined) return a.index!;
  const texts = await page.locator('[data-quiz-choice]').allInnerTexts();
  return texts.findIndex((t) => t.includes(a.choice!));
}

/** 지금 문제를 맞히거나 일부러 틀린다. 문제 순서는 섞이므로 키를 읽어 답을 고른다. */
async function answer(page: Page, correct: boolean): Promise<string> {
  const q = page.locator('[data-quiz-question]');
  const key = (await q.getAttribute('data-key'))!;
  const a = ANSWERS[key];
  if (a.text !== undefined) {
    await page.locator('[data-quiz-input]').fill(correct ? a.text : '전혀 다른 답');
    await page.getByRole('button', { name: '확인' }).click();
  } else {
    const right = await rightIndex(page, key);
    await q.locator('[data-quiz-choice]').nth(correct ? right : right === 0 ? 1 : 0).click();
  }
  return key;
}

const next = (page: Page) => page.locator('[data-quiz-next]').click();

test.describe('퀴즈 풀이', () => {
  test('글 퀴즈를 끝까지 풀면 맞힌 수와 틀린 문제가 나온다', async ({ page }) => {
    await page.goto(DOC_QUIZ);
    await expect(page.locator('[data-quiz-count]')).toHaveText('1 / 3');
    for (let i = 0; i < 3; i++) {
      const key = await answer(page, i !== 0);
      const verdict = page.locator('[data-quiz-verdict]');
      await expect(verdict).toHaveText(i !== 0 ? '정답이에요' : '아쉬워요');
      await expect(page.locator('[data-quiz-explain]')).not.toBeEmpty();
      await expect(page.locator('.quiz-feedback')).not.toContainText('null');
      await expect(page.locator('[data-quiz-link]')).toHaveAttribute('href', /\/DomainDocs\//);
      expect(key).toMatch(/^foundations\/alpha#/);
      await expectNoHorizontalOverflow(page);
      await next(page);
    }
    const result = page.locator('[data-quiz-result]');
    await expect(result.locator('h2')).toHaveText('3문제 중 2문제 맞혔어요');
    await expect(result.locator('[data-quiz-wrong] li')).toHaveCount(1);
    await expect(result.getByRole('link', { name: '퀴즈 홈' })).toHaveAttribute('href', '/DomainDocs/quiz/');
    await expectNoHorizontalOverflow(page);
  });

  test('키보드만으로 풀 수 있다', async ({ page }) => {
    await page.goto(DOC_QUIZ);
    for (let i = 0; i < 3; i++) {
      const q = page.locator('[data-quiz-question]');
      const key = (await q.getAttribute('data-key'))!;
      if (ANSWERS[key].text !== undefined) {
        await page.locator('[data-quiz-input]').fill(' snmp ');
        await page.keyboard.press('Enter');
      } else {
        await page.keyboard.press(String((await rightIndex(page, key)) + 1));
      }
      await expect(page.locator('[data-quiz-verdict]')).toHaveText('정답이에요');
      await page.keyboard.press('Enter');
    }
    await expect(page.locator('[data-quiz-result] h2')).toHaveText('3문제 중 3문제 맞혔어요');
  });

  test('객관식 보기는 섞여서 나오고, 섞인 자리로 채점한다', async ({ page }) => {
    // Math.random이 늘 0이면 보기 [모니터링 기초, 네트워크, 서버·OS, 데이터베이스]는 정답이 맨 뒤로 가요.
    await page.addInitScript(() => {
      Math.random = () => 0;
    });
    await page.goto(DOC_QUIZ);
    for (let i = 0; i < 3; i++) {
      const q = page.locator('[data-quiz-question]');
      if ((await q.getAttribute('data-key')) === 'foundations/alpha#alpha-choice') {
        await expect(q.locator('[data-quiz-choice]')).toHaveText([/네트워크/, /서버·OS/, /데이터베이스/, /모니터링 기초/]);
        await q.locator('[data-quiz-choice]').nth(3).click();
        await expect(page.locator('[data-quiz-verdict]')).toHaveText('정답이에요');
        return;
      }
      await answer(page, true);
      await next(page);
    }
    throw new Error('객관식 문제가 나오지 않았어요');
  });

  test('틀린 문제만 다시 풀 수 있다', async ({ page }) => {
    await page.goto(DOC_QUIZ);
    for (let i = 0; i < 3; i++) {
      await answer(page, i === 0);
      await next(page);
    }
    await page.getByRole('button', { name: '틀린 문제 다시 풀기' }).click();
    await expect(page.locator('[data-quiz-count]')).toHaveText('1 / 2');
  });

  test('기록이 남고, 날짜가 지난 기록은 다시 볼 문제로 나온다', async ({ page }) => {
    await page.goto(DOC_QUIZ);
    const key = await answer(page, true);
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('domaindocs.quiz.v1') ?? '{}'));
    expect(saved.v).toBe(1);
    expect(saved.records[key].box).toBe(2);

    await page.evaluate(() =>
      localStorage.setItem(
        'domaindocs.quiz.v1',
        JSON.stringify({ v: 1, records: { 'foundations/alpha#alpha-ox': { box: 2, due: '2000-01-01', right: 1, wrong: 0 } } }),
      ),
    );
    await page.goto('./');
    await expect(page.locator('[data-quiz-due="home"] .row-title')).toHaveText('오늘 다시 볼 문제 1개');
    await page.goto('quiz/');
    await expect(page.locator('[data-quiz-due="quiz"] .row-desc')).toHaveText('오늘 다시 볼 문제가 1개 있어요.');
    await page.goto('quiz/play/?scope=due');
    await expect(page.locator('[data-quiz-question]')).toHaveAttribute('data-key', 'foundations/alpha#alpha-ox');
    await expect(page.locator('[data-quiz-count]')).toHaveText('1 / 1');
  });

  test('저장소를 쓸 수 없어도 끝까지 풀린다', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(window, 'localStorage', {
        get() {
          throw new Error('blocked');
        },
      });
    });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(DOC_QUIZ);
    for (let i = 0; i < 3; i++) {
      await answer(page, true);
      await next(page);
    }
    await expect(page.locator('[data-quiz-result] h2')).toHaveText('3문제 중 3문제 맞혔어요');
    expect(errors).toEqual([]);
  });

  test('풀 문제가 없으면 안내와 다른 풀기 링크가 나온다', async ({ page }) => {
    await page.goto('quiz/play/?scope=due');
    const empty = page.locator('[data-quiz-empty]');
    await expect(empty).toContainText('오늘 다시 볼 문제가 없어요.');
    await expect(empty.getByRole('link', { name: '처음 보는 문제 풀기' })).toHaveAttribute('href', /scope=new$/);
  });
});

test.describe('퀴즈로 가는 길', () => {
  test('글 끝에 이 글 퀴즈 카드가 있다', async ({ page }) => {
    await page.goto('foundations/alpha/');
    const card = page.locator('[data-quiz-card]');
    await expect(card).toContainText('3문제');
    await card.getByRole('link').click();
    await expect(page).toHaveURL(/quiz\/play\/\?scope=doc%3Afoundations%2Falpha$/);
    await expect(page.locator('[data-quiz-question]')).toBeVisible();
  });

  test('문제가 없는 글에는 퀴즈 카드가 없다', async ({ page }) => {
    await page.goto('foundations/beta/');
    await expect(page.locator('[data-quiz-card]')).toHaveCount(0);
  });

  test('영역 페이지와 퀴즈 홈에서 영역 퀴즈로 간다', async ({ page }) => {
    await page.goto('foundations/');
    await expect(page.getByRole('link', { name: /퀴즈/ })).toHaveAttribute('href', /quiz\/play\/\?scope=domain%3Afoundations$/);
    await page.goto('quiz/');
    await expect(page.getByRole('link', { name: /모니터링 기초/ })).toHaveAttribute('href', /scope=domain%3Afoundations$/);
    await expectNoHorizontalOverflow(page);
  });

  test('퀴즈 페이지는 검색 색인에 들어가지 않는다', async ({ page }) => {
    await page.goto('quiz/');
    await expect(page.locator('[data-pagefind-body]')).toHaveCount(0);
    await page.goto(DOC_QUIZ);
    await expect(page.locator('[data-pagefind-body]')).toHaveCount(0);
  });
});
