import { isInputCorrect } from '../lib/quiz/answer';
import type { QuizQuestion } from '../lib/quiz/bank';
import { parseScope } from '../lib/quiz/scope';
import { applyResult, pickSession, todayString, type Records, type Scope } from '../lib/quiz/schedule';
import { loadRecords, pruneRecords, saveRecords } from '../lib/quiz/storage';

interface Meta {
  domains: Record<string, string>;
  docs: Record<string, string>;
}

type Child = Node | string | null | undefined | false;

/** 조건부로 빠지는 자식(null 등)을 걸러 낸다. append·replaceChildren에 null을 넘기면 "null" 글자가 들어가기 때문이다. */
const nodes = (...children: Child[]) => children.filter((c): c is Node | string => c !== null && c !== undefined && c !== false);

/** 작은 DOM 도우미. attrs의 class는 className으로, 나머지는 속성으로 넣는다. */
function h<K extends keyof HTMLElementTagNameMap>(tag: K, attrs: Record<string, string> = {}, ...children: Child[]): HTMLElementTagNameMap[K] {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === 'class') el.className = v;
    else el.setAttribute(k, v);
  }
  el.append(...nodes(...children));
  return el;
}

const OX_LABELS = ['O', 'X'];

function answerText(q: QuizQuestion): string {
  if (q.type === 'ox') return q.answer ? 'O' : 'X';
  if (q.type === 'choice') return q.choices![q.answer as number];
  return (q.answer as string[])[0];
}

function scopeLabel(scope: Scope, meta: Meta): string {
  if (scope.kind === 'due') return '오늘 다시 볼 문제';
  if (scope.kind === 'new') return '처음 보는 문제';
  if (scope.kind === 'domain') return `${meta.domains[scope.id] ?? scope.id} 퀴즈`;
  return `「${meta.docs[scope.id] ?? scope.id}」 퀴즈`;
}

function emptyMessage(scope: Scope): string {
  if (scope.kind === 'due') return '오늘 다시 볼 문제가 없어요.';
  if (scope.kind === 'new') return '처음 보는 문제를 모두 풀었어요.';
  return '이 범위에는 아직 문제가 없어요.';
}

export async function initQuiz(): Promise<void> {
  const app = document.getElementById('quiz-app');
  if (!app) return;
  const meta = JSON.parse(document.getElementById('quiz-meta')?.textContent ?? '{}') as Meta;
  const scope = parseScope(new URLSearchParams(location.search).get('scope'));
  const homeUrl = app.dataset.home ?? '../';
  const newUrl = app.dataset.new ?? homeUrl;
  const scopeEl = h('p', { class: 'quiz-scope', 'data-quiz-scope': '' }, scopeLabel(scope, meta));

  let bank: QuizQuestion[];
  try {
    const res = await fetch(app.dataset.bank ?? '');
    if (!res.ok) throw new Error(String(res.status));
    bank = (await res.json()) as QuizQuestion[];
  } catch {
    app.replaceChildren(scopeEl, h('p', { class: 'quiz-message' }, '문제를 불러오지 못했어요. 잠시 뒤 다시 열어 주세요.'));
    return;
  }

  // 지운 문제의 기록은 여기서 정리한다(홈은 문제 은행을 받지 않는다).
  const loaded = loadRecords();
  let records: Records = pruneRecords(loaded, new Set(bank.map((q) => q.key)));
  if (Object.keys(records).length !== Object.keys(loaded).length) saveRecords(records);
  const today = todayString();

  let questions: QuizQuestion[] = [];
  let index = 0;
  let answered = false;
  let results: { q: QuizQuestion; correct: boolean }[] = [];
  let choose: ((i: number) => void) | null = null;
  let goNext: (() => void) | null = null;

  const links = (...items: [string, string, boolean?][]) =>
    h('div', { class: 'quiz-actions' }, ...items.map(([label, href, sub]) => h('a', { class: `quiz-button${sub ? ' is-sub' : ''}`, href }, label)));

  function showEmpty(): void {
    const items: [string, string, boolean?][] = [];
    if (scope.kind !== 'new') items.push(['처음 보는 문제 풀기', newUrl]);
    items.push(['퀴즈 홈', homeUrl, items.length > 0]);
    app!.replaceChildren(scopeEl, h('div', { 'data-quiz-empty': '' }, h('p', { class: 'quiz-message' }, emptyMessage(scope)), links(...items)));
  }

  function start(list: QuizQuestion[]): void {
    questions = list;
    index = 0;
    results = [];
    if (questions.length === 0) showEmpty();
    else renderQuestion();
  }

  function progress(done: number): HTMLElement {
    const total = questions.length;
    const bar = h('div', { class: 'quiz-progress-bar' });
    bar.style.width = `${Math.round((done / total) * 100)}%`;
    return h(
      'div',
      { class: 'quiz-progress', role: 'progressbar', 'aria-label': '푼 문제', 'aria-valuemin': '0', 'aria-valuemax': String(total), 'aria-valuenow': String(done) },
      bar,
    );
  }

  function renderQuestion(): void {
    const q = questions[index];
    answered = false;
    const feedback = h('div', { class: 'quiz-feedback', 'aria-live': 'polite' });
    let body: HTMLElement;
    const buttons: HTMLButtonElement[] = [];

    const finish = (correct: boolean, chosen?: number, typed?: HTMLInputElement) => {
      if (answered) return;
      answered = true;
      results.push({ q, correct });
      records = { ...records, [q.key]: applyResult(records[q.key], correct, today) };
      saveRecords(records);
      buttons.forEach((b) => (b.disabled = true));
      if (q.type === 'input' && typed) {
        typed.readOnly = true;
        typed.classList.add(correct ? 'is-correct' : 'is-wrong');
      } else {
        const right = q.type === 'ox' ? (q.answer ? 0 : 1) : (q.answer as number);
        buttons[right]?.classList.add('is-correct');
        if (!correct && chosen !== undefined) buttons[chosen]?.classList.add('is-wrong');
      }
      const last = index === questions.length - 1;
      const next = h('button', { class: 'quiz-button quiz-next', type: 'button', 'data-quiz-next': '' }, last ? '결과 보기' : '다음');
      goNext = () => {
        goNext = null;
        if (last) renderResult();
        else {
          index += 1;
          renderQuestion();
        }
      };
      next.addEventListener('click', () => goNext?.());
      feedback.replaceChildren(
        ...nodes(
          h('p', { class: `quiz-verdict ${correct ? 'is-correct' : 'is-wrong'}`, 'data-quiz-verdict': '' }, correct ? '정답이에요' : '아쉬워요'),
          !correct || q.type === 'input' ? h('p', { class: 'quiz-answer' }, `정답: ${answerText(q)}`) : null,
          h('p', { class: 'quiz-explain', 'data-quiz-explain': '' }, q.explain),
          h('a', { class: 'quiz-link', href: q.link.url, 'data-quiz-link': '' }, `관련 글: ${q.link.title}`),
          next,
        ),
      );
      next.focus();
    };

    if (q.type === 'input') {
      choose = null;
      const input = h('input', { class: 'quiz-input', type: 'text', 'aria-label': '답', autocomplete: 'off', autocapitalize: 'off', spellcheck: 'false', 'data-quiz-input': '' });
      const submit = h('button', { class: 'quiz-button', type: 'submit' }, '확인');
      buttons.push(submit);
      const form = h('form', { class: 'quiz-input-form' }, input, submit);
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (input.value.trim() === '') return;
        finish(isInputCorrect(input.value, q.answer as string[]), undefined, input);
      });
      body = form;
      requestAnimationFrame(() => input.focus());
    } else {
      const labels = q.type === 'ox' ? OX_LABELS : q.choices!;
      labels.forEach((label, i) => {
        const b = h('button', { class: 'quiz-choice', type: 'button', 'data-quiz-choice': '' }, h('span', { class: 'quiz-choice-key', 'aria-hidden': 'true' }, String(i + 1)), label);
        b.addEventListener('click', () => finish(q.type === 'ox' ? (i === 0) === q.answer : i === q.answer, i));
        buttons.push(b);
      });
      choose = (i) => buttons[i]?.click();
      body = h('div', { class: `quiz-choices${q.type === 'ox' ? ' is-ox' : ''}` }, ...buttons);
    }

    app!.replaceChildren(
      scopeEl,
      progress(index),
      h('p', { class: 'quiz-count', 'data-quiz-count': '' }, `${index + 1} / ${questions.length}`),
      h(
        'div',
        { class: 'quiz-question', 'data-quiz-question': '', 'data-key': q.key, 'data-type': q.type },
        h('p', { class: 'quiz-prompt' }, q.prompt),
        body,
      ),
      feedback,
    );
    window.scrollTo({ top: 0 });
  }

  function renderResult(): void {
    choose = null;
    const right = results.filter((r) => r.correct).length;
    const wrong = results.filter((r) => !r.correct).map((r) => r.q);
    const actions: Child[] = [];
    if (wrong.length > 0) {
      const retry = h('button', { class: 'quiz-button', type: 'button' }, '틀린 문제 다시 풀기');
      retry.addEventListener('click', () => start(wrong));
      actions.push(retry);
    }
    app!.replaceChildren(
      scopeEl,
      progress(questions.length),
      h(
        'section',
        { class: 'quiz-result', 'data-quiz-result': '' },
        h('h2', {}, `${questions.length}문제 중 ${right}문제 맞혔어요`),
        h('p', { class: 'quiz-message' }, wrong.length > 0 ? '틀린 문제는 내일 다시 나와요.' : '모두 맞혔어요. 맞힌 문제는 며칠 뒤에 다시 나와요.'),
        wrong.length > 0 ? h('h3', {}, '틀린 문제') : null,
        wrong.length > 0
          ? h(
              'ul',
              { class: 'quiz-wrong', 'data-quiz-wrong': '' },
              ...wrong.map((q) =>
                h(
                  'li',
                  {},
                  h('p', {}, q.prompt),
                  h('p', { class: 'quiz-answer' }, `정답: ${answerText(q)}`),
                  h('a', { class: 'quiz-link', href: q.link.url }, q.link.title),
                ),
              ),
            )
          : null,
        h('div', { class: 'quiz-actions' }, ...actions, h('a', { class: `quiz-button${wrong.length > 0 ? ' is-sub' : ''}`, href: homeUrl }, '퀴즈 홈')),
      ),
    );
    window.scrollTo({ top: 0 });
  }

  document.addEventListener('keydown', (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    const target = e.target as HTMLElement | null;
    const typing = target instanceof HTMLInputElement;
    if (!answered && choose && !typing && /^[1-9]$/.test(e.key)) {
      e.preventDefault();
      choose(Number(e.key) - 1);
      return;
    }
    // 버튼·링크에 초점이 있으면 Enter는 그 요소가 처리한다.
    if (answered && e.key === 'Enter' && goNext && !(target instanceof HTMLButtonElement) && !(target instanceof HTMLAnchorElement)) {
      e.preventDefault();
      goNext();
    }
  });

  start(pickSession(bank, records, scope, today));
}
