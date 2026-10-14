import { describe, expect, it } from 'vitest';
import { spanBars } from '../../src/lib/viz/waterfall';

describe('spanBars', () => {
  it('가장 늦게 끝나는 구간을 100%로 보고 위치와 길이를 %로 바꾼다', () => {
    const bars = spanBars([
      { label: 'GET /orders', start: 0, duration: 1000 },
      { label: 'SELECT', start: 100, duration: 300 },
      { label: 'POST /pay', start: 600, duration: 400 },
    ]);
    expect(bars).toEqual([
      { left: 0, width: 100 },
      { left: 10, width: 30 },
      { left: 60, width: 40 },
    ]);
  });

  it('아주 짧은 구간도 최소 폭으로 보이고, 트랙 밖으로 나가지 않는다', () => {
    const bars = spanBars(
      [
        { label: 'root', start: 0, duration: 1000 },
        { label: 'cache', start: 999, duration: 1 },
      ],
      0.6,
    );
    expect(bars[1]).toEqual({ left: 99.4, width: 0.6 });
  });

  it('부모보다 늦게 끝나는 구간이 있으면 그 끝을 100%로 본다', () => {
    const bars = spanBars([
      { label: 'root', start: 0, duration: 800 },
      { label: 'async', start: 600, duration: 400 },
    ]);
    expect(bars).toEqual([
      { left: 0, width: 80 },
      { left: 60, width: 40 },
    ]);
  });

  it('구간이 모두 0이면 최소 폭 막대를 왼쪽에 둔다', () => {
    expect(spanBars([{ label: 'x', start: 0, duration: 0 }])).toEqual([{ left: 0, width: 0.6 }]);
  });
});
