import type { FigureTone } from './flow';

export interface TimelineSegment {
  start: number;
  end: number;
  /** 띠 안에 쓸 짧은 글자 */
  label?: string;
  tone?: FigureTone;
}

export interface TimelineLane {
  label: string;
  segments: TimelineSegment[];
}

/** 모든 줄을 세로로 가로지르는 선(예: 배포 시각) */
export interface TimelineMark {
  at: number;
  label: string;
  tone?: FigureTone;
}

/** 아래 시간축 눈금 */
export interface TimelineTick {
  at: number;
  label: string;
}

/** 글자를 가운데 두면 띠 밖으로 나가는 양 끝에서는 안쪽으로 붙인다 */
export type TimelineAlign = 'start' | 'center' | 'end';

export interface TimelineLayout {
  lanes: { label: string; segments: { left: number; width: number; label?: string; tone: FigureTone }[] }[];
  marks: { left: number; label: string; tone: FigureTone; align: TimelineAlign }[];
  ticks: { left: number; label: string; align: TimelineAlign }[];
}

const round = (n: number) => Math.round(n * 100) / 100;
const alignOf = (left: number): TimelineAlign => (left < 12 ? 'start' : left > 88 ? 'end' : 'center');

/**
 * 시작~끝을 띠 폭 0~100%로 보고, 구간·선·눈금을 %로 바꾼다.
 * 범위 밖 구간이나 거꾸로 된 구간은 글을 고치도록 빌드를 멈춘다.
 */
export function layoutTimeline(
  lanes: readonly TimelineLane[],
  options: { start?: number; end?: number; marks?: readonly TimelineMark[]; ticks?: readonly TimelineTick[] } = {},
): TimelineLayout {
  const start = options.start ?? 0;
  const end = options.end ?? Math.max(start, ...lanes.flatMap((l) => l.segments.map((s) => s.end)));
  if (end <= start) throw new Error(`Timeline: 끝(${end})이 시작(${start})보다 뒤여야 해요`);
  const span = end - start;
  const pos = (at: number, what: string) => {
    if (at < start || at > end) throw new Error(`Timeline: ${what}(${at})이 범위 ${start}~${end} 밖이에요`);
    return round(((at - start) / span) * 100);
  };

  return {
    lanes: lanes.map((lane) => ({
      label: lane.label,
      segments: lane.segments.map((s) => {
        if (s.end <= s.start) throw new Error(`Timeline: '${lane.label}'의 구간 끝(${s.end})이 시작(${s.start})보다 뒤여야 해요`);
        const left = pos(s.start, `'${lane.label}'의 구간 시작`);
        return { left, width: round(pos(s.end, `'${lane.label}'의 구간 끝`) - left), label: s.label, tone: s.tone ?? 'sub' };
      }),
    })),
    marks: (options.marks ?? []).map((m) => {
      const left = pos(m.at, `선 '${m.label}'`);
      return { left, label: m.label, tone: m.tone ?? 'sub', align: alignOf(left) };
    }),
    ticks: (options.ticks ?? []).map((t) => {
      const left = pos(t.at, `눈금 '${t.label}'`);
      return { left, label: t.label, align: alignOf(left) };
    }),
  };
}
