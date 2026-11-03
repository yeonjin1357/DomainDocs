import { describe, expect, it } from 'vitest';
import { layoutParts } from '../../src/lib/viz/parts';

describe('layoutParts', () => {
  it('줄마다 칸 값을 그 줄 합계에 대한 %로 바꾸고, 넓은 칸만 안에 글자를 둔다', () => {
    const layout = layoutParts([
      { label: '요청', segments: [{ label: '에러', value: 50, tone: 'warn' }, { label: '정상', value: 9950 }] },
      { segments: [{ label: '에러', value: 50 }, { label: '정상', value: 995, display: '995건' }] },
    ], [], '건');
    expect(layout.rows[0].segments.map((s) => [s.percent, s.inside, s.display])).toEqual([
      [0.5, false, '50건'],
      [99.5, true, '9,950건'],
    ]);
    expect(layout.rows[1].segments[0].percent).toBe(4.78);
    expect(layout.rows[1].segments[1].display).toBe('995건');
    expect(layout.rows[0].segments[1].tone).toBe('sub');
  });

  it('괄호는 칸 경계와 상관없이 값 단위로 걸치고, 끝에 붙은 짧은 괄호는 글자를 안쪽으로 붙인다', () => {
    const rows = [{ segments: [{ label: '씀', value: 5 }, { label: '캐시', value: 9.8 }, { label: 'free', value: 1.2 }] }];
    const layout = layoutParts(rows, [{ from: 5.9, to: 16, label: 'available', tone: 'accent' }, { from: 14.8, to: 16, label: 'free' }]);
    expect(layout.rows[0].ranges).toEqual([
      { left: 36.88, width: 63.13, label: 'available', tone: 'accent', align: 'center' },
      { left: 92.5, width: 7.5, label: 'free', tone: 'sub', align: 'end' },
    ]);
  });

  it('칸이 하나뿐이거나, 합계가 0이거나, 괄호가 밖으로 나가면 빌드를 멈춘다', () => {
    expect(() => layoutParts([{ segments: [{ label: 'a', value: 1 }] }])).toThrow(/둘 이상/);
    expect(() => layoutParts([{ segments: [{ label: 'a', value: 0 }, { label: 'b', value: 0 }] }])).toThrow(/0보다 커야/);
    expect(() => layoutParts([{ segments: [{ label: 'a', value: 1 }, { label: 'b', value: 1 }] }], [{ from: 0, to: 3, label: 'x' }])).toThrow(/줄 합계\(2\)/);
    expect(() => layoutParts([])).toThrow(/줄이 하나도/);
  });
});
