import type { QuizQuestion } from './bank';

/** 상자 1~5마다 다시 나오기까지의 날 수 */
export const BOX_DAYS = [1, 3, 7, 14, 30] as const;
export const SESSION_SIZE = 10;

export interface QuizRecord {
  box: number;
  /** 다시 나올 날(YYYY-MM-DD, 기기 날짜 기준) */
  due: string;
  right: number;
  wrong: number;
}

export type Records = Record<string, QuizRecord>;

export type Scope = { kind: 'due' } | { kind: 'new' } | { kind: 'domain'; id: string } | { kind: 'doc'; id: string };

const pad = (n: number) => String(n).padStart(2, '0');

/** 기기의 날짜를 YYYY-MM-DD로 */
export function todayString(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export function addDays(date: string, n: number): string {
  const [y, m, d] = date.split('-').map(Number);
  const t = new Date(Date.UTC(y, m - 1, d + n));
  return `${t.getUTCFullYear()}-${pad(t.getUTCMonth() + 1)}-${pad(t.getUTCDate())}`;
}

/**
 * 처음 보는 문제는 상자 1에 있다고 본다. 맞히면 한 칸 위, 틀리면 1로.
 * 때가 되기 전에 다시 풀어 맞히면(틀린 문제 바로 다시 풀기 등) 상자와 날짜는 그대로 둔다.
 */
export function applyResult(rec: QuizRecord | undefined, correct: boolean, today: string): QuizRecord {
  if (correct && rec && !isDue(rec, today)) return { ...rec, right: rec.right + 1 };
  const box = correct ? Math.min((rec?.box ?? 1) + 1, BOX_DAYS.length) : 1;
  return {
    box,
    due: addDays(today, BOX_DAYS[box - 1]),
    right: (rec?.right ?? 0) + (correct ? 1 : 0),
    wrong: (rec?.wrong ?? 0) + (correct ? 0 : 1),
  };
}

export function isDue(rec: QuizRecord, today: string): boolean {
  return rec.due <= today;
}

function shuffle<T>(xs: readonly T[], rng: () => number): T[] {
  const a = [...xs];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * 한 번 풀 문제를 고른다. 다시 볼 문제(오래 밀린 순) → 처음 보는 문제(섞어서) 순.
 * 글·영역에서 시작하면 남는 자리를 그 범위의 나머지 문제로 채워, 다 푼 글도 다시 풀 수 있게 한다.
 */
export function pickSession(
  bank: readonly QuizQuestion[],
  records: Records,
  scope: Scope,
  today: string,
  rng: () => number = Math.random,
  size = SESSION_SIZE,
): QuizQuestion[] {
  const inScope = bank.filter((q) =>
    scope.kind === 'domain' ? q.domain === scope.id : scope.kind === 'doc' ? q.docId === scope.id : true,
  );
  const due = inScope
    .filter((q) => records[q.key] && isDue(records[q.key], today))
    .sort((a, b) => records[a.key].due.localeCompare(records[b.key].due) || a.key.localeCompare(b.key));
  const fresh = shuffle(
    inScope.filter((q) => !records[q.key]),
    rng,
  );
  const rest = shuffle(
    inScope.filter((q) => records[q.key] && !isDue(records[q.key], today)),
    rng,
  );
  const ordered = scope.kind === 'due' ? due : scope.kind === 'new' ? fresh : [...due, ...fresh, ...rest];
  return ordered.slice(0, size);
}
