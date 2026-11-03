import type { FigureTone } from './flow';

export interface StripCell {
  label: string;
  tone?: FigureTone;
  /** 0~1. 히트맵처럼 값이 클수록 진하게 칠한다(tone 대신) */
  heat?: number;
}

export interface StripRow {
  /** 줄 위에 쓸 이름(예: 파티션 0) */
  label?: string;
  cells: (string | StripCell)[];
  /** 칸마다 위에 붙일 작은 글자(예: 버킷 경계). 빈 글자는 비워 둔다 */
  heads?: string[];
  /** 칸마다 위에 세울 막대의 값. 줄에서 가장 큰 값이 막대 높이 끝이다(예: 구간별 요청 수) */
  bars?: number[];
}

/** 칸 하나를 위에서 가리키는 표시(예: 커밋 위치) */
export interface StripMark {
  /** 몇째 줄인지(0부터). 없으면 첫 줄 */
  row?: number;
  /** 몇째 칸인지(0부터) */
  at: number;
  label: string;
  tone?: FigureTone;
}

/** 여러 칸을 아래에서 묶는 괄호(예: 지연 3건) */
export interface StripRange {
  row?: number;
  /** 첫 칸과 끝 칸(둘 다 포함, 0부터) */
  from: number;
  to: number;
  label: string;
  tone?: FigureTone;
}

export interface StripLayout {
  columns: number;
  rows: {
    label?: string;
    cells: { label: string; tone?: FigureTone; heat?: number }[];
    heads?: string[];
    /** 막대 높이(줄의 가장 큰 값에 대한 %) */
    bars?: number[];
    marks: { column: number; label: string; tone: FigureTone }[];
    ranges: { column: number; span: number; label: string; tone: FigureTone }[];
  }[];
}

/** 칸이 이보다 많으면 360px 화면에서 칸 글자가 읽히지 않는다 */
export const STRIP_MAX_COLUMNS = 12;

/**
 * 줄마다 칸을 같은 폭으로 늘어놓고, 표시와 괄호를 그 줄의 칸 위치(CSS grid 열 번호, 1부터)로 바꾼다.
 * 없는 칸을 가리키면 글을 고치도록 빌드를 멈춘다.
 */
export function layoutStrip(
  rows: readonly StripRow[],
  marks: readonly StripMark[] = [],
  ranges: readonly StripRange[] = [],
): StripLayout {
  if (rows.length === 0) throw new Error('Strip: 줄이 하나도 없어요');
  const columns = Math.max(...rows.map((r) => r.cells.length));
  if (columns > STRIP_MAX_COLUMNS) throw new Error(`Strip: 칸이 ${columns}개예요. ${STRIP_MAX_COLUMNS}개까지만 그려요`);

  const rowOf = (row: number | undefined, what: string) => {
    const r = row ?? 0;
    if (!rows[r]) throw new Error(`Strip: ${what}이 없는 줄(${r})을 가리켜요`);
    return r;
  };
  const cellOf = (r: number, at: number, what: string) => {
    if (!Number.isInteger(at) || at < 0 || at >= rows[r].cells.length) throw new Error(`Strip: ${what}이 줄 ${r}에 없는 칸(${at})을 가리켜요`);
    return at + 1;
  };

  const out: StripLayout['rows'] = rows.map((r, i) => {
    if (r.heads && r.heads.length !== r.cells.length) throw new Error(`Strip: 줄 ${i}의 머리글(${r.heads.length}개)과 칸(${r.cells.length}개) 수가 달라요`);
    if (r.bars && r.bars.length !== r.cells.length) throw new Error(`Strip: 줄 ${i}의 막대(${r.bars.length}개)와 칸(${r.cells.length}개) 수가 달라요`);
    if (r.bars && (r.bars.some((v) => !(v >= 0)) || Math.max(...r.bars) <= 0)) throw new Error(`Strip: 줄 ${i}의 막대 값은 0 이상이고 하나는 0보다 커야 해요`);
    for (const c of r.cells) {
      if (typeof c !== 'string' && c.heat !== undefined && !(c.heat >= 0 && c.heat <= 1)) throw new Error(`Strip: 칸 '${c.label}'의 heat(${c.heat})는 0~1이어야 해요`);
    }
    const top = r.bars ? Math.max(...r.bars) : 0;
    return {
      label: r.label,
      cells: r.cells.map((c) => (typeof c === 'string' ? { label: c } : c)),
      heads: r.heads,
      bars: r.bars?.map((v) => Math.round((v / top) * 10000) / 100),
      marks: [],
      ranges: [],
    };
  });
  for (const m of marks) {
    const r = rowOf(m.row, `표시 '${m.label}'`);
    out[r].marks.push({ column: cellOf(r, m.at, `표시 '${m.label}'`), label: m.label, tone: m.tone ?? 'accent' });
  }
  for (const g of ranges) {
    const r = rowOf(g.row, `괄호 '${g.label}'`);
    if (g.to < g.from) throw new Error(`Strip: 괄호 '${g.label}'의 끝 칸(${g.to})이 첫 칸(${g.from})보다 앞이에요`);
    const column = cellOf(r, g.from, `괄호 '${g.label}'`);
    cellOf(r, g.to, `괄호 '${g.label}'`);
    out[r].ranges.push({ column, span: g.to - g.from + 1, label: g.label, tone: g.tone ?? 'sub' });
  }
  return { columns, rows: out };
}
