import { describe, expect, it } from 'vitest';
import { layoutStacks } from '../../src/lib/viz/stacks';

describe('layoutStacks', () => {
  it('기둥마다 위에서부터 쌓아 grid 줄 번호(머리 줄 다음인 2부터)와 줄 수를 정한다', () => {
    const layout = layoutStacks([
      { title: 'OSI', blocks: [{ tag: '7', label: '응용' }, { label: '표현', tone: 'sub' }, '세션', '전송'] },
      { title: 'TCP/IP', blocks: [{ label: '응용', span: 3, tone: 'accent' }, '전송'] },
    ]);
    expect(layout.rows).toBe(4);
    expect(layout.columns[0].blocks.map((b) => [b.label, b.row, b.span])).toEqual([
      ['응용', 2, 1],
      ['표현', 3, 1],
      ['세션', 4, 1],
      ['전송', 5, 1],
    ]);
    expect(layout.columns[0].blocks[0].tag).toBe('7');
    expect(layout.columns[1].blocks).toEqual([
      { label: '응용', tone: 'accent', tag: undefined, row: 2, span: 3 },
      { label: '전송', tone: undefined, tag: undefined, row: 5, span: 1 },
    ]);
  });

  it('null은 한 줄짜리 빈자리라 다음 칸을 한 줄 내린다', () => {
    const layout = layoutStacks([
      { title: 'a', blocks: ['1', '2', '3'] },
      { title: 'b', blocks: [null, { label: '나머지', span: 2 }] },
    ]);
    expect(layout.columns[1].blocks).toEqual([{ label: '나머지', tone: undefined, tag: undefined, row: 3, span: 2 }]);
  });

  it('기둥마다 줄 수의 합이 다르면 빌드를 멈춘다', () => {
    expect(() =>
      layoutStacks([
        { title: 'a', blocks: ['1', '2'] },
        { title: 'b', blocks: ['1'] },
      ]),
    ).toThrow(/a 2줄, b 1줄/);
  });

  it('기둥 수, 줄 수, 걸치는 줄 수가 맞지 않으면 빌드를 멈춘다', () => {
    expect(() => layoutStacks([{ title: 'a', blocks: ['1'] }])).toThrow(/둘 이상/);
    expect(() => layoutStacks(Array.from({ length: 5 }, (_, i) => ({ title: String(i), blocks: ['1'] })))).toThrow(/4개까지만/);
    expect(() => layoutStacks([{ title: 'a', blocks: [{ label: 'x', span: 0 }] }, { title: 'b', blocks: [] }])).toThrow(/1 이상의 정수/);
    const many = Array.from({ length: 13 }, (_, i) => String(i));
    expect(() => layoutStacks([{ title: 'a', blocks: many }, { title: 'b', blocks: many }])).toThrow(/12개까지만/);
  });
});
