import { describe, expect, it } from 'vitest';
import { linePath, niceMax, pointsOf } from '../../src/lib/viz/line';

const BOX = { width: 100, height: 50, padding: 0 };

describe('niceMax', () => {
  it.each([
    [[95], 120],
    [[3000], 4000],
    [[187], 250],
    [[45, 41], 50],
  ])('%j → %d', (values, expected) => {
    expect(niceMax(values)).toBe(expected);
  });
  it('값이 없거나 0이면 1이다', () => {
    expect(niceMax([])).toBe(1);
    expect(niceMax([0, 0])).toBe(1);
  });
});

describe('linePath', () => {
  it('왼쪽 아래에서 오른쪽 위로 그린다', () => {
    expect(linePath([0, 10], 10, BOX)).toBe('M0 50 L100 0');
  });
  it('여백을 뺀 안쪽에 그린다', () => {
    expect(linePath([0, 10], 10, { width: 100, height: 50, padding: 10 })).toBe('M10 40 L90 10');
  });
  it('점 사이 간격이 같다', () => {
    expect(pointsOf([0, 0, 0], 10, BOX).map(([x]) => x)).toEqual([0, 50, 100]);
  });
  it('값이 하나면 가로선이다', () => {
    expect(linePath([5], 10, BOX)).toBe('M0 25 L100 25');
  });
  it('최댓값을 넘거나 음수인 값은 경계에 붙인다', () => {
    expect(linePath([20, -5], 10, BOX)).toBe('M0 0 L100 50');
  });
  it('값이 없으면 빈 경로다', () => {
    expect(linePath([], 10, BOX)).toBe('');
  });
});
