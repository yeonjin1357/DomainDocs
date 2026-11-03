import type { FigureTone } from './flow';

/** accent는 강조, weak는 옅은 강조, warn은 문제, sub는 회색, plain은 빈 칸처럼 옅은 회색 */
export type PartTone = 'accent' | 'weak' | 'warn' | 'sub' | 'plain';

export interface PartSegment {
  label: string;
  value: number;
  /** 범례에 쓸 값 글자(예: 9.8GB). 없으면 value에 unit을 붙인다 */
  display?: string;
  tone?: PartTone;
}

export interface PartRow {
  /** 막대 위 이름 */
  label?: string;
  /** 막대 위 오른쪽 글자(예: 합계 16GB) */
  total?: string;
  segments: PartSegment[];
}

/** 막대 아래 괄호. 칸 경계와 상관없이 값 단위로 걸친다(예: available 10.1GB) */
export interface PartRange {
  row?: number;
  /** 막대 왼쪽 끝부터 센 값 */
  from: number;
  to: number;
  label: string;
  tone?: FigureTone;
}

export interface PartsLayout {
  rows: {
    label?: string;
    total?: string;
    segments: { label: string; display: string; tone: PartTone; percent: number; inside: boolean }[];
    ranges: { left: number; width: number; label: string; tone: FigureTone; align: 'start' | 'center' | 'end' }[];
  }[];
}

export const PARTS_MAX_SEGMENTS = 6;

const pct = (v: number) => Math.round(v * 100) / 100;

/**
 * 줄마다 칸 값을 그 줄 합계에 대한 %로 바꾼다. 줄끼리는 합계가 달라도 모두 100% 폭이라, 비율(구성)을 견준다.
 * 칸 안에 글자가 들어갈 만큼 넓은 칸만 inside로 표시한다(360px 본문 약 280px 기준, 한 글자 약 7px).
 */
export function layoutParts(rows: readonly PartRow[], ranges: readonly PartRange[] = [], unit = ''): PartsLayout {
  if (rows.length === 0) throw new Error('Parts: 줄이 하나도 없어요');
  const out: PartsLayout['rows'] = rows.map((r, i) => {
    if (r.segments.length < 2) throw new Error(`Parts: 줄 ${i}의 칸이 둘 이상이어야 나눈 비율이 보여요`);
    if (r.segments.length > PARTS_MAX_SEGMENTS) throw new Error(`Parts: 줄 ${i}의 칸이 ${r.segments.length}개예요. ${PARTS_MAX_SEGMENTS}개까지만 그려요`);
    for (const s of r.segments) {
      if (!Number.isFinite(s.value) || s.value < 0) throw new Error(`Parts: '${s.label}'의 값(${s.value})은 0 이상의 수여야 해요`);
    }
    const sum = r.segments.reduce((a, s) => a + s.value, 0);
    if (!(sum > 0)) throw new Error(`Parts: 줄 ${i}의 합계가 0보다 커야 해요`);
    return {
      label: r.label,
      total: r.total,
      segments: r.segments.map((s) => {
        const percent = pct((s.value / sum) * 100);
        return {
          label: s.label,
          display: s.display ?? `${s.value.toLocaleString('en-US')}${unit}`,
          tone: s.tone ?? 'sub',
          percent,
          inside: (percent / 100) * 280 >= s.label.length * 7.5 + 12,
        };
      }),
      ranges: [],
    };
  });
  for (const g of ranges) {
    const r = g.row ?? 0;
    if (!rows[r]) throw new Error(`Parts: 괄호 '${g.label}'이 없는 줄(${r})을 가리켜요`);
    const sum = rows[r].segments.reduce((a, s) => a + s.value, 0);
    if (!(g.from >= 0 && g.to <= sum && g.to > g.from)) throw new Error(`Parts: 괄호 '${g.label}'의 범위(${g.from}~${g.to})가 줄 합계(${sum}) 안에 있어야 해요`);
    const left = pct((g.from / sum) * 100);
    const width = pct(((g.to - g.from) / sum) * 100);
    out[r].ranges.push({ left, width, label: g.label, tone: g.tone ?? 'sub', align: left < 15 && width < 40 ? 'start' : left + width > 85 && width < 40 ? 'end' : 'center' });
  }
  return { rows: out };
}
