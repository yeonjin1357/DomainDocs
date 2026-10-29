import { describe, expect, it } from 'vitest';
import { layoutStrip } from '../../src/lib/viz/strip';

describe('layoutStrip', () => {
  it('가장 긴 줄의 칸 수로 열을 정하고, 글자만 준 칸을 칸 객체로 바꾼다', () => {
    const layout = layoutStrip([
      { label: '파티션 0', cells: ['0', '1', { label: '2', tone: 'accent' }] },
      { label: '파티션 1', cells: ['0'] },
    ]);
    expect(layout.columns).toBe(3);
    expect(layout.rows[0].cells).toEqual([{ label: '0' }, { label: '1' }, { label: '2', tone: 'accent' }]);
    expect(layout.rows[1].cells).toEqual([{ label: '0' }]);
  });

  it('표시와 괄호를 그 줄의 grid 열 번호(1부터)로 바꾼다', () => {
    const layout = layoutStrip(
      [{ cells: ['0', '1', '2', '3', '4'] }, { cells: ['0', '1'] }],
      [{ at: 2, label: '커밋 위치' }, { row: 1, at: 1, label: '끝', tone: 'warn' }],
      [{ from: 2, to: 4, label: '지연 3건', tone: 'warn' }],
    );
    expect(layout.rows[0].marks).toEqual([{ column: 3, label: '커밋 위치', tone: 'accent' }]);
    expect(layout.rows[1].marks).toEqual([{ column: 2, label: '끝', tone: 'warn' }]);
    expect(layout.rows[0].ranges).toEqual([{ column: 3, span: 3, label: '지연 3건', tone: 'warn' }]);
  });

  it('없는 칸이나 줄을 가리키면 빌드를 멈춘다', () => {
    const rows = [{ cells: ['0', '1'] }];
    expect(() => layoutStrip(rows, [{ at: 2, label: 'x' }])).toThrow(/없는 칸\(2\)/);
    expect(() => layoutStrip(rows, [{ row: 1, at: 0, label: 'x' }])).toThrow(/없는 줄\(1\)/);
    expect(() => layoutStrip(rows, [], [{ from: 1, to: 0, label: 'y' }])).toThrow(/앞이에요/);
    expect(() => layoutStrip([])).toThrow(/줄이 하나도/);
  });

  it('칸이 12개를 넘으면 빌드를 멈춘다', () => {
    expect(() => layoutStrip([{ cells: Array.from({ length: 13 }, (_, i) => String(i)) }])).toThrow(/12개까지만/);
  });
});
