import { describe, expect, it } from 'vitest';
import { dueCount, loadRecords, pruneRecords, saveRecords, STORAGE_KEY } from '../../src/lib/quiz/storage';

class MemoryStorage {
  data = new Map<string, string>();
  getItem(k: string) {
    return this.data.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.data.set(k, v);
  }
}

const throwing = {
  getItem() {
    throw new Error('blocked');
  },
  setItem() {
    throw new Error('blocked');
  },
};

const rec = { box: 2, due: '2026-10-20', right: 1, wrong: 0 };

describe('퀴즈 기록 저장', () => {
  it('저장한 기록을 다시 읽는다', () => {
    const s = new MemoryStorage();
    expect(saveRecords({ a: rec }, s as unknown as Storage)).toBe(true);
    expect(JSON.parse(s.data.get(STORAGE_KEY)!)).toEqual({ v: 1, records: { a: rec } });
    expect(loadRecords(s as unknown as Storage)).toEqual({ a: rec });
  });

  it('깨진 값이나 다른 버전은 빈 기록으로 시작한다', () => {
    const s = new MemoryStorage();
    s.setItem(STORAGE_KEY, '{not json');
    expect(loadRecords(s as unknown as Storage)).toEqual({});
    s.setItem(STORAGE_KEY, JSON.stringify({ v: 2, records: { a: rec } }));
    expect(loadRecords(s as unknown as Storage)).toEqual({});
  });

  it('모양이 틀린 기록 하나는 버리고 나머지는 살린다', () => {
    const s = new MemoryStorage();
    s.setItem(STORAGE_KEY, JSON.stringify({ v: 1, records: { a: rec, b: { box: 9, due: 'x' }, c: 'oops' } }));
    expect(loadRecords(s as unknown as Storage)).toEqual({ a: rec });
  });

  it('저장소가 예외를 던져도 빈 기록으로 읽고, 저장 실패만 알린다', () => {
    expect(loadRecords(throwing as unknown as Storage)).toEqual({});
    expect(saveRecords({ a: rec }, throwing as unknown as Storage)).toBe(false);
    expect(loadRecords(undefined)).toEqual({});
  });

  it('지운 문제의 기록을 걸러 내고, 다시 볼 문제 수를 센다', () => {
    const records = { a: rec, gone: rec, later: { ...rec, due: '2026-12-01' } };
    expect(Object.keys(pruneRecords(records, new Set(['a', 'later'])))).toEqual(['a', 'later']);
    expect(dueCount(records, new Set(['a', 'later']), '2026-10-21')).toBe(1);
    expect(dueCount(records, null, '2026-10-21')).toBe(2);
  });
});
