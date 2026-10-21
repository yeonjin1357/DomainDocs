import { describe, expect, it } from 'vitest';
import { layoutSequence } from '../../src/lib/viz/sequence';

describe('layoutSequence', () => {
  it('참여자를 고르게 놓고 화살표를 아래로 쌓는다', () => {
    const l = layoutSequence(['관리 서버', '장비'], [
      { from: '관리 서버', to: '장비', label: 'GET' },
      { from: '장비', to: '관리 서버', label: '응답' },
    ]);
    expect(l.lanes.map((x) => x.x)).toEqual([88, 232]);
    expect(l.arrows.map((x) => [x.x1, x.x2, x.y])).toEqual([
      [88, 232, 64],
      [232, 88, 108],
    ]);
    expect(l.height).toBe(136);
  });

  it('참여자 4명이면 52, 124, 196, 268에 놓는다', () => {
    expect(layoutSequence(['a', 'b', 'c', 'd'], [{ from: 'a', to: 'd', label: 'x' }]).lanes.map((x) => x.x)).toEqual([52, 124, 196, 268]);
  });

  it('색과 점선을 정하지 않은 화살표는 흐린 실선이다', () => {
    expect(layoutSequence(['a', 'b'], [{ from: 'a', to: 'b', label: 'x' }]).arrows[0]).toMatchObject({ tone: 'sub', dashed: false });
  });

  it('참여자가 2~4명이 아니거나, 없는 참여자거나, 자기에게 보내면 오류를 낸다', () => {
    expect(() => layoutSequence(['a'], [])).toThrow('2~4');
    expect(() => layoutSequence(['a', 'b'], [{ from: 'a', to: 'z', label: 'x' }])).toThrow('z');
    expect(() => layoutSequence(['a', 'b'], [{ from: 'a', to: 'a', label: 'x' }])).toThrow('자기');
  });
});
