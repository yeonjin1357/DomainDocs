import { BOX_DAYS, isDue, type QuizRecord, type Records } from './schedule';

/** 형식이 바뀌면 버전을 올리고, 옛 버전은 빈 기록으로 시작한다. */
export const STORAGE_KEY = 'domaindocs.quiz.v1';
const VERSION = 1;

/** 사생활 보호 모드처럼 저장소 접근 자체가 예외를 던지는 환경도 있다. */
function defaultStorage(): Storage | undefined {
  try {
    return globalThis.localStorage;
  } catch {
    return undefined;
  }
}

function isRecord(v: unknown): v is QuizRecord {
  if (typeof v !== 'object' || v === null) return false;
  const r = v as Record<string, unknown>;
  return (
    Number.isInteger(r.box) &&
    (r.box as number) >= 1 &&
    (r.box as number) <= BOX_DAYS.length &&
    typeof r.due === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(r.due) &&
    Number.isInteger(r.right) &&
    Number.isInteger(r.wrong)
  );
}

export function loadRecords(storage: Storage | undefined = defaultStorage()): Records {
  try {
    const raw = storage?.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as { v?: unknown; records?: unknown };
    if (parsed?.v !== VERSION || typeof parsed.records !== 'object' || parsed.records === null) return {};
    return Object.fromEntries(Object.entries(parsed.records as Record<string, unknown>).filter((e): e is [string, QuizRecord] => isRecord(e[1])));
  } catch {
    return {};
  }
}

/** 저장에 실패하면 false. 문제 풀이는 저장과 상관없이 이어진다. */
export function saveRecords(records: Records, storage: Storage | undefined = defaultStorage()): boolean {
  try {
    if (!storage) return false;
    storage.setItem(STORAGE_KEY, JSON.stringify({ v: VERSION, records }));
    return true;
  } catch {
    return false;
  }
}

/** 지운 문제의 기록을 버린다. */
export function pruneRecords(records: Records, keys: ReadonlySet<string>): Records {
  return Object.fromEntries(Object.entries(records).filter(([k]) => keys.has(k)));
}

/** 오늘 다시 볼 문제 수. keys가 없으면 기록만 보고 센다. */
export function dueCount(records: Records, keys: ReadonlySet<string> | null, today: string): number {
  return Object.entries(records).filter(([k, r]) => (keys ? keys.has(k) : true) && isDue(r, today)).length;
}
