import { describe, expect, it } from 'vitest';
import { layoutStages } from '../../src/lib/viz/stages';

describe('layoutStages', () => {
  it('글자만 준 칸을 칸 객체로, null과 빈 글자를 빈자리로 바꾼다', () => {
    const layout = layoutStages([
      { label: 'L7', cells: [null, { label: 'HTTP', tone: 'accent' }] },
      { label: 'L4', note: '+ 포트', end: '세그먼트', cells: [{ label: 'TCP', tone: 'accent' }, 'HTTP'] },
      { label: 'L3', cells: ['', 'HTTP'] },
    ]);
    expect(layout.columns).toBe(2);
    expect(layout.rows[0].cells).toEqual([null, { label: 'HTTP', tone: 'accent' }]);
    expect(layout.rows[1]).toEqual({ label: 'L4', note: '+ 포트', end: '세그먼트', cells: [{ label: 'TCP', tone: 'accent' }, { label: 'HTTP' }] });
    expect(layout.rows[2].cells).toEqual([null, { label: 'HTTP' }]);
  });

  it('늘릴 열만 남는 폭을 차지하고 나머지는 글자 폭만큼 쓴다', () => {
    const rows = [{ label: 'a', cells: ['1', '2', '3'] }];
    expect(layoutStages(rows, 1).template).toBe('auto minmax(0, 1fr) auto');
    expect(layoutStages(rows).template).toBe('auto auto auto');
    expect(() => layoutStages(rows, 3)).toThrow(/늘릴 열\(3\)/);
  });

  it('단계마다 칸 수가 다르거나 열이 너무 많으면 빌드를 멈춘다', () => {
    expect(() => layoutStages([{ label: 'a', cells: ['1', '2'] }, { label: 'b', cells: ['1'] }])).toThrow(/'b'의 칸\(1개\)이 첫 단계\(2개\)와 달라요/);
    expect(() => layoutStages([{ label: 'a', cells: Array.from({ length: 7 }, (_, i) => String(i)) }])).toThrow(/6개까지만/);
    expect(() => layoutStages([])).toThrow(/단계가 하나도/);
  });
});
