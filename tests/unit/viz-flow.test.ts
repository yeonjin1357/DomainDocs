import { describe, expect, it } from 'vitest';
import { layoutFlow } from '../../src/lib/viz/flow';

const a = { id: 'a', label: 'A', col: 0, row: 0 };

describe('layoutFlow', () => {
  it('가로로 이웃한 상자는 테두리끼리 잇는다', () => {
    const l = layoutFlow([a, { id: 'b', label: 'B', col: 1, row: 0 }], [{ from: 'a', to: 'b' }]);
    expect(l.edges[0]).toMatchObject({ x1: 92, y1: 36, x2: 108, y2: 36, lx: 100, ly: 36, tone: 'sub', both: false, dashed: false });
    expect([l.width, l.height]).toEqual([200, 72]);
  });

  it('세로로 이웃한 상자도 테두리끼리 잇는다', () => {
    expect(layoutFlow([a, { id: 'b', label: 'B', col: 0, row: 1 }], [{ from: 'a', to: 'b' }]).edges[0]).toMatchObject({ x1: 50, y1: 56, x2: 50, y2: 88 });
  });

  it('대각선은 먼저 닿는 테두리에서 자른다', () => {
    expect(layoutFlow([a, { id: 'b', label: 'B', col: 1, row: 1 }], [{ from: 'a', to: 'b' }]).edges[0]).toMatchObject({ x1: 77.78, y1: 56, x2: 122.22, y2: 88 });
  });

  it('상자 가운데를 칸 가운데에 둔다', () => {
    expect(layoutFlow([{ id: 'b', label: 'B', col: 2, row: 1 }], []).nodes[0]).toMatchObject({ cx: 250, cy: 108 });
  });

  it('묶음 테두리는 칸 범위를 4씩 안쪽으로 감싼다', () => {
    const l = layoutFlow([a, { id: 'b', label: 'B', col: 1, row: 0 }], [], [{ label: '서버실', cols: [0, 1], rows: [0, 0] }]);
    expect(l.groups[0]).toEqual({ label: '서버실', x: 4, y: 4, w: 192, h: 64 });
  });

  it('없는 상자를 이으면 오류를 낸다', () => {
    expect(() => layoutFlow([a], [{ from: 'a', to: 'z' }])).toThrow('a → z');
  });

  it('같은 칸에 상자가 둘이면 오류를 낸다', () => {
    expect(() => layoutFlow([a, { id: 'b', label: 'B', col: 0, row: 0 }], [])).toThrow('같은 칸');
  });
});
