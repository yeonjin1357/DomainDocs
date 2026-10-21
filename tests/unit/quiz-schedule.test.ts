import { describe, expect, it } from 'vitest';
import type { QuizQuestion } from '../../src/lib/quiz/bank';
import { addDays, applyResult, isDue, pickSession, todayString, type Records } from '../../src/lib/quiz/schedule';

const q = (key: string, domain = 'network', docId = `${domain}/overview`): QuizQuestion => ({
  key,
  domain,
  docId,
  type: 'ox',
  prompt: key,
  answer: true,
  explain: '해설이에요.',
  link: { url: '/x/', title: 'x' },
});

describe('날짜', () => {
  it('날짜에 날 수를 더한다(달·해 넘김 포함)', () => {
    expect(addDays('2026-10-21', 1)).toBe('2026-10-22');
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01');
    expect(addDays('2026-12-25', 30)).toBe('2027-01-24');
  });

  it('오늘 날짜는 기기의 날짜로 YYYY-MM-DD다', () => {
    expect(todayString(new Date(2026, 0, 5, 23, 59))).toBe('2026-01-05');
  });
});

describe('상자 옮기기', () => {
  it('처음 맞히면 상자 2로 가고 3일 뒤에 다시 나온다', () => {
    expect(applyResult(undefined, true, '2026-10-21')).toEqual({ box: 2, due: '2026-10-24', right: 1, wrong: 0 });
  });

  it('틀리면 상자 1로 돌아가고 다음 날 다시 나온다', () => {
    const rec = { box: 4, due: '2026-10-21', right: 3, wrong: 0 };
    expect(applyResult(rec, false, '2026-10-21')).toEqual({ box: 1, due: '2026-10-22', right: 3, wrong: 1 });
  });

  it('상자마다 간격은 1·3·7·14·30일이고, 5에서 맞혀도 5에 머문다', () => {
    let rec = applyResult(undefined, false, '2026-01-01');
    expect([rec.box, rec.due]).toEqual([1, '2026-01-02']);
    rec = applyResult(rec, true, rec.due);
    expect([rec.box, rec.due]).toEqual([2, '2026-01-05']);
    rec = applyResult(rec, true, rec.due);
    expect([rec.box, rec.due]).toEqual([3, '2026-01-12']);
    rec = applyResult(rec, true, rec.due);
    expect([rec.box, rec.due]).toEqual([4, '2026-01-26']);
    rec = applyResult(rec, true, rec.due);
    expect([rec.box, rec.due]).toEqual([5, '2026-02-25']);
    rec = applyResult(rec, true, rec.due);
    expect([rec.box, rec.due]).toEqual([5, '2026-03-27']);
  });

  it('때가 되기 전에 다시 풀어 맞히면 상자와 다시 나올 날은 그대로다', () => {
    // 틀린 문제를 결과 화면에서 바로 다시 풀어 맞혀도, 내일 다시 나와야 한다.
    const wrongToday = applyResult(undefined, false, '2026-10-21');
    expect(applyResult(wrongToday, true, '2026-10-21')).toEqual({ box: 1, due: '2026-10-22', right: 1, wrong: 1 });
    const box3 = { box: 3, due: '2026-10-25', right: 2, wrong: 0 };
    expect(applyResult(box3, true, '2026-10-21')).toEqual({ box: 3, due: '2026-10-25', right: 3, wrong: 0 });
  });

  it('때가 되기 전에 다시 풀어 틀리면 상자 1로 돌아간다', () => {
    const box3 = { box: 3, due: '2026-10-25', right: 2, wrong: 0 };
    expect(applyResult(box3, false, '2026-10-21')).toEqual({ box: 1, due: '2026-10-22', right: 2, wrong: 1 });
  });

  it('due가 오늘이거나 지났으면 다시 볼 문제다', () => {
    expect(isDue({ box: 1, due: '2026-10-21', right: 0, wrong: 1 }, '2026-10-21')).toBe(true);
    expect(isDue({ box: 1, due: '2026-10-20', right: 0, wrong: 1 }, '2026-10-21')).toBe(true);
    expect(isDue({ box: 1, due: '2026-10-22', right: 0, wrong: 1 }, '2026-10-21')).toBe(false);
  });
});

describe('한 번 풀 문제 고르기', () => {
  const bank = [q('a'), q('b'), q('c'), q('d', 'server'), q('e', 'network', 'network/snmp'), q('f', 'network', 'network/snmp')];
  const records: Records = {
    a: { box: 2, due: '2026-10-20', right: 1, wrong: 0 },
    b: { box: 1, due: '2026-10-19', right: 0, wrong: 1 },
    c: { box: 3, due: '2026-10-30', right: 2, wrong: 0 },
    e: { box: 2, due: '2026-10-25', right: 1, wrong: 0 },
  };
  const fixed = () => 0;
  const keys = (qs: QuizQuestion[]) => qs.map((x) => x.key);

  it('다시 볼 문제는 오래 밀린 것부터, 다시 볼 문제만 고른다', () => {
    expect(keys(pickSession(bank, records, { kind: 'due' }, '2026-10-21', fixed))).toEqual(['b', 'a']);
  });

  it('처음 보는 문제는 기록이 없는 문제만 고른다', () => {
    expect(keys(pickSession(bank, records, { kind: 'new' }, '2026-10-21', fixed)).sort()).toEqual(['d', 'f']);
  });

  it('영역에서 시작하면 그 영역 안에서 다시 볼 문제 → 처음 보는 문제 → 나머지 순으로 채운다', () => {
    const picked = keys(pickSession(bank, records, { kind: 'domain', id: 'network' }, '2026-10-21', fixed));
    expect(picked.slice(0, 2)).toEqual(['b', 'a']);
    expect(picked[2]).toBe('f');
    expect(picked.slice(3).sort()).toEqual(['c', 'e']);
  });

  it('글에서 시작하면 그 글의 문제만 고른다', () => {
    expect(keys(pickSession(bank, records, { kind: 'doc', id: 'network/snmp' }, '2026-10-21', fixed))).toEqual(['f', 'e']);
  });

  it('한 번에 고르는 문제 수를 넘지 않는다', () => {
    const many = Array.from({ length: 25 }, (_, i) => q(`n${i}`));
    expect(pickSession(many, {}, { kind: 'new' }, '2026-10-21', Math.random)).toHaveLength(10);
    expect(pickSession(many, {}, { kind: 'new' }, '2026-10-21', Math.random, 5)).toHaveLength(5);
  });
});
