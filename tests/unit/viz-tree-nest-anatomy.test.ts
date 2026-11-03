import { describe, expect, it } from 'vitest';
import { checkTree } from '../../src/lib/viz/tree';
import { checkNest } from '../../src/lib/viz/nest';
import { layoutAnatomy } from '../../src/lib/viz/anatomy';

describe('checkTree', () => {
  it('깊이와 마디 수를 센다', () => {
    expect(checkTree({ label: 'a', children: [{ label: 'b', children: [{ label: 'c' }] }, { label: 'd' }] })).toEqual({ depth: 3, nodes: 4 });
  });

  it('너무 깊거나 마디가 많거나 이름이 없으면 빌드를 멈춘다', () => {
    const deep = { label: '1', children: [{ label: '2', children: [{ label: '3', children: [{ label: '4', children: [{ label: '5' }] }] }] }] };
    expect(() => checkTree(deep)).toThrow(/5단이에요/);
    expect(() => checkTree({ label: 'r', children: Array.from({ length: 16 }, (_, i) => ({ label: String(i) })) })).toThrow(/17개예요/);
    expect(() => checkTree({ label: 'r', children: [{ label: '' }] })).toThrow(/이름 없는/);
  });
});

describe('checkNest', () => {
  it('가장 깊은 겹 수를 돌려준다', () => {
    expect(checkNest([{ label: 'a', children: [{ label: 'b', children: [{ label: 'c' }] }] }, { label: 'd' }])).toBe(3);
  });

  it('빈 children, 너무 깊은 상자, 빈 목록은 빌드를 멈춘다', () => {
    expect(() => checkNest([{ label: 'a', children: [] }])).toThrow(/children이 비어/);
    const deep = [{ label: '1', children: [{ label: '2', children: [{ label: '3', children: [{ label: '4', children: [{ label: '5' }] }] }] }] }];
    expect(() => checkNest(deep)).toThrow(/5겹이에요/);
    expect(() => checkNest([])).toThrow(/하나도/);
    expect(() => checkNest([{ label: 'a', cols: 5, children: [{ label: 'b' }] }])).toThrow(/1~4/);
  });
});

describe('layoutAnatomy', () => {
  it('조각을 이어 전체 이름을 만들고, 흐린 조각을 빼고 번호를 매긴다', () => {
    const layout = layoutAnatomy([
      { text: 'c', label: '시리즈' },
      { text: '7', label: '세대' },
      { text: '.', label: '', tone: 'sub' },
      { text: '4xlarge', label: '크기' },
    ]);
    expect(layout.text).toBe('c7.4xlarge');
    expect(layout.parts.map((p) => p.number)).toEqual([1, 2, undefined, 3]);
  });

  it('조각이 하나뿐이거나, 비었거나, 너무 많으면 빌드를 멈춘다', () => {
    expect(() => layoutAnatomy([{ text: 'a', label: 'x' }])).toThrow(/둘 이상/);
    expect(() => layoutAnatomy([{ text: '', label: 'x' }, { text: 'b', label: 'y' }])).toThrow(/빈 조각/);
    expect(() => layoutAnatomy(Array.from({ length: 7 }, (_, i) => ({ text: String(i), label: 'x' })))).toThrow(/6개까지만/);
  });
});
