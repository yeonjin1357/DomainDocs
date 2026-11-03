import { describe, expect, it } from 'vitest';
import { layoutTriage } from '../../src/lib/viz/triage';

describe('layoutTriage', () => {
  it('단계에 1부터 번호를 매기고, 다음 단계로 잇는 조건을 정한다', () => {
    const layout = layoutTriage([
      { label: 'available', tone: 'warn', next: '바닥 가까움' },
      { label: '스왑' },
      { label: 'RSS', next: false },
      { label: 'OOM' },
    ]);
    expect(layout.steps.map((s) => [s.number, s.label, s.next])).toEqual([
      [1, 'available', '바닥 가까움'],
      [2, '스왑', ''],
      [3, 'RSS', null],
      [4, 'OOM', null],
    ]);
  });

  it('숫자로 가리킨 길은 그 단계로, 글자로 쓴 길은 그대로 둔다', () => {
    const layout = layoutTriage([
      { label: '에러 로그', exits: [{ when: '시간 초과', to: 3 }, { when: '넉넉함', to: '알림 기준', note: 'free?', tone: 'accent' }] },
      { label: '느린 요청' },
      { label: 'WAS', when: '연결 거부일 때' },
    ]);
    expect(layout.steps[0].exits).toEqual([
      { when: '시간 초과', to: '3단계', toStep: 3, note: undefined, tone: undefined },
      { when: '넉넉함', to: '알림 기준', note: 'free?', tone: 'accent' },
    ]);
    expect(layout.steps[2].when).toBe('연결 거부일 때');
  });

  it('번호 없이 그리면 다른 단계를 가리키는 길을 그 단계 이름으로 쓴다', () => {
    const layout = layoutTriage(
      [
        { label: '닫힘', next: '실패율 초과' },
        { label: '열림', next: '기다린 뒤' },
        { label: '반열림', exits: [{ when: '성공', to: 1 }, { when: '실패', to: 2 }] },
      ],
      false,
    );
    expect(layout.steps[2].exits.map((e) => [e.to, e.toStep])).toEqual([
      ['닫힘', 1],
      ['열림', 2],
    ]);
  });

  it('없는 단계나 자기 단계를 가리키면 빌드를 멈춘다', () => {
    expect(() => layoutTriage([{ label: 'a', exits: [{ when: 'x', to: 3 }] }, { label: 'b' }])).toThrow(/없는 단계\(3\)/);
    expect(() => layoutTriage([{ label: 'a', exits: [{ when: 'x', to: 1 }] }, { label: 'b' }])).toThrow(/자기 단계/);
    expect(() => layoutTriage([{ label: 'a' }, { label: 'b', next: '더' }])).toThrow(/마지막 단계 'b'/);
  });

  it('단계 수가 2~8개가 아니면 빌드를 멈춘다', () => {
    expect(() => layoutTriage([{ label: 'a' }])).toThrow(/둘 이상/);
    expect(() => layoutTriage(Array.from({ length: 9 }, (_, i) => ({ label: String(i) })))).toThrow(/8개까지만/);
  });
});
