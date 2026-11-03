import { describe, expect, it } from 'vitest';
import { layoutBars } from '../../src/lib/viz/bars';

describe('layoutBars', () => {
  it('끝값이 없으면 가장 큰 값을 100%로 놓는다', () => {
    const layout = layoutBars([
      { label: 'N+1', value: 23.9, display: '23.9ms', tone: 'warn' },
      { label: '조인', value: 0.7, display: '0.7ms' },
    ]);
    expect(layout.max).toBe(23.9);
    expect(layout.bars.map((b) => b.percent)).toEqual([100, 2.93]);
    expect(layout.bars[0]).toMatchObject({ display: '23.9ms', tone: 'warn' });
  });

  it('끝값을 주면 그 값에 대한 비율로, display가 없으면 값에 단위를 붙인다', () => {
    const layout = layoutBars([{ label: 'a', value: 96 }, { label: 'b', value: 1200 }], 2000, '건');
    expect(layout.bars.map((b) => [b.percent, b.display])).toEqual([
      [4.8, '96건'],
      [60, '1,200건'],
    ]);
  });

  it('0보다 큰 아주 작은 값은 0%로 반올림되지 않는다', () => {
    const layout = layoutBars([{ label: '읽은 행', value: 1_000_000 }, { label: '돌려준 행', value: 1 }, { label: '빈 값', value: 0 }]);
    expect(layout.bars.map((b) => b.percent)).toEqual([100, 0.01, 0]);
  });

  it('막대 수, 음수, 끝값을 넘는 값은 빌드를 멈춘다', () => {
    expect(() => layoutBars([{ label: 'a', value: 1 }])).toThrow(/둘 이상/);
    expect(() => layoutBars([{ label: 'a', value: -1 }, { label: 'b', value: 1 }])).toThrow(/0 이상/);
    expect(() => layoutBars([{ label: 'a', value: 120 }, { label: 'b', value: 1 }], 100)).toThrow(/끝값\(100\)보다 커요/);
    expect(() => layoutBars([{ label: 'a', value: 0 }, { label: 'b', value: 0 }])).toThrow(/0보다 커야/);
  });
});
