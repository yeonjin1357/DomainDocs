import { describe, expect, it } from 'vitest';
import { edgeLines } from '../../src/lib/viz/service-map';

const nodes = [
  { id: 'web', label: '웹', x: 10, y: 50 },
  { id: 'order', label: '주문 API', x: 40, y: 50 },
  { id: 'pay', label: '결제 API', x: 85, y: 15 },
];

describe('edgeLines', () => {
  it('노드 가운데끼리 잇고, 글자는 선 가운데에 둔다', () => {
    expect(edgeLines(nodes, [{ from: 'order', to: 'pay', label: '에러 4%', tone: 'warn' }])).toEqual([
      { x1: 40, y1: 50, x2: 85, y2: 15, mx: 62.5, my: 32.5, label: '에러 4%', tone: 'warn' },
    ]);
  });

  it('색을 정하지 않은 선은 흐린 색이다', () => {
    expect(edgeLines(nodes, [{ from: 'web', to: 'order' }])[0].tone).toBe('sub');
  });

  it('없는 노드를 가리키면 오류를 낸다', () => {
    expect(() => edgeLines(nodes, [{ from: 'order', to: 'stock' }])).toThrow('order → stock');
  });
});
