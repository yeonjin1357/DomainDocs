import { describe, expect, it } from 'vitest';
import { layoutTimeline } from '../../src/lib/viz/timeline';

describe('layoutTimeline', () => {
  it('시작~끝을 0~100%로 보고 구간의 위치와 길이를 %로 바꾼다', () => {
    const layout = layoutTimeline(
      [
        { label: '앱', segments: [{ start: 0, end: 400, tone: 'accent' }, { start: 400, end: 700, label: '멈춤', tone: 'warn' }] },
        { label: '요청', segments: [{ start: 350, end: 800 }] },
      ],
      { end: 1000 },
    );
    expect(layout.lanes[0].segments).toEqual([
      { left: 0, width: 40, label: undefined, tone: 'accent' },
      { left: 40, width: 30, label: '멈춤', tone: 'warn' },
    ]);
    expect(layout.lanes[1].segments).toEqual([{ left: 35, width: 45, label: undefined, tone: 'sub' }]);
  });

  it('끝을 주지 않으면 가장 늦게 끝나는 구간이 끝이다', () => {
    const layout = layoutTimeline([{ label: 'a', segments: [{ start: 10, end: 60 }] }], { start: 10 });
    expect(layout.lanes[0].segments[0]).toMatchObject({ left: 0, width: 100 });
  });

  it('세로선과 눈금은 위치에 따라 글자를 안쪽으로 붙인다', () => {
    const layout = layoutTimeline([{ label: 'a', segments: [{ start: 0, end: 100 }] }], {
      marks: [{ at: 50, label: '배포' }],
      ticks: [
        { at: 0, label: '0초' },
        { at: 50, label: '50초' },
        { at: 100, label: '100초' },
      ],
    });
    expect(layout.marks).toEqual([{ left: 50, label: '배포', tone: 'sub', align: 'center' }]);
    expect(layout.ticks.map((t) => t.align)).toEqual(['start', 'center', 'end']);
  });

  it('범위 밖이나 거꾸로 된 구간은 빌드를 멈춘다', () => {
    expect(() => layoutTimeline([{ label: 'a', segments: [{ start: 0, end: 120 }] }], { end: 100 })).toThrow(/범위 0~100 밖/);
    expect(() => layoutTimeline([{ label: 'a', segments: [{ start: 50, end: 50 }] }], { end: 100 })).toThrow(/뒤여야/);
    expect(() => layoutTimeline([{ label: 'a', segments: [] }])).toThrow(/뒤여야/);
    expect(() => layoutTimeline([{ label: 'a', segments: [{ start: 0, end: 10 }] }], { marks: [{ at: 20, label: 'x' }] })).toThrow(/선 'x'/);
  });
});
