import { describe, expect, it } from 'vitest';
import { scatterDots } from '../../src/lib/viz/scatter';

describe('scatterDots', () => {
  it('무리마다 개수만큼 점을 찍고, 범위 안에 둔다', () => {
    const dots = scatterDots(
      [
        { count: 30, x: [0, 10], y: [100, 500] },
        { count: 5, x: [2, 4], y: [900, 1000], tone: 'warn' },
      ],
      10,
      1000,
    );
    expect(dots).toHaveLength(35);
    for (const d of dots.slice(0, 30)) {
      expect(d.left).toBeGreaterThanOrEqual(0);
      expect(d.left).toBeLessThanOrEqual(100);
      expect(d.top).toBeGreaterThanOrEqual(50);
      expect(d.top).toBeLessThanOrEqual(90);
      expect(d.tone).toBe('accent');
    }
    for (const d of dots.slice(30)) {
      expect(d.left).toBeGreaterThanOrEqual(20);
      expect(d.left).toBeLessThanOrEqual(40);
      expect(d.top).toBeLessThanOrEqual(10);
      expect(d.tone).toBe('warn');
    }
  });

  it('같은 입력이면 늘 같은 점을 찍는다', () => {
    const groups = [{ count: 20, x: [0, 10] as [number, number], y: [0, 300] as [number, number], skew: 2 }];
    expect(scatterDots(groups, 10, 1000)).toEqual(scatterDots(groups, 10, 1000));
  });

  it('범위의 두 값이 같으면 가로줄·세로줄이 된다', () => {
    const [h, v] = [
      scatterDots([{ count: 10, x: [0, 10], y: [3000, 3000] }], 10, 4000),
      scatterDots([{ count: 10, x: [7, 7], y: [0, 4000] }], 10, 4000),
    ];
    expect(new Set(h.map((d) => d.top))).toEqual(new Set([25]));
    expect(new Set(v.map((d) => d.left))).toEqual(new Set([70]));
  });

  it('skew가 크면 점이 아래쪽에 몰린다', () => {
    const groups = (skew: number) => [{ count: 200, x: [0, 10] as [number, number], y: [0, 1000] as [number, number], skew }];
    const mean = (skew: number) => scatterDots(groups(skew), 10, 1000).reduce((s, d) => s + d.top, 0) / 200;
    expect(mean(3)).toBeGreaterThan(mean(1) + 15);
  });

  it('범위를 벗어난 점은 그림 가장자리에 붙인다', () => {
    const [d] = scatterDots([{ count: 1, x: [20, 20], y: [5000, 5000] }], 10, 1000);
    expect(d).toEqual({ left: 100, top: 0, tone: 'accent' });
  });
});
