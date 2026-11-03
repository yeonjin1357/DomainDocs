import type { FigureTone } from './flow';

export interface StagesCell {
  label: string;
  /** accent는 이 단계에서 새로 붙거나 바뀐 칸, warn은 문제인 칸, sub는 흐린 칸. 없으면 이전 단계에서 온 칸 */
  tone?: FigureTone;
}

export interface StagesRow {
  /** 단계 이름(예: L4 전송) */
  label: string;
  /** 이름 옆 파란 글자. 이 단계에서 하는 일(예: + 포트) */
  note?: string;
  /** 이름 줄 오른쪽 끝의 흐린 글자. 이 단계의 결과를 부르는 이름(예: 세그먼트) */
  end?: string;
  /** 열마다 칸 하나. null이나 빈 글자는 빈자리 */
  cells: (string | StagesCell | null)[];
}

export interface StagesLayout {
  columns: number;
  /** CSS grid-template-columns 값 */
  template: string;
  rows: { label: string; note?: string; end?: string; cells: (StagesCell | null)[] }[];
}

/** 열이 이보다 많으면 360px 화면에서 칸 글자가 읽히지 않는다 */
export const STAGES_MAX_COLUMNS = 6;

/**
 * 단계마다 같은 열에 칸을 맞춰 놓는다. 줄마다 칸 수가 다르면 어느 칸이 어느 열인지 모호해서 빌드를 멈춘다.
 * grow로 고른 열만 남는 폭을 모두 차지하고, 나머지 열은 글자 폭만큼만 쓴다.
 */
export function layoutStages(rows: readonly StagesRow[], grow?: number): StagesLayout {
  if (rows.length === 0) throw new Error('Stages: 단계가 하나도 없어요');
  const columns = rows[0].cells.length;
  if (columns === 0) throw new Error('Stages: 칸이 하나도 없어요');
  if (columns > STAGES_MAX_COLUMNS) throw new Error(`Stages: 열이 ${columns}개예요. ${STAGES_MAX_COLUMNS}개까지만 그려요`);
  for (const r of rows) {
    if (r.cells.length !== columns) throw new Error(`Stages: '${r.label}'의 칸(${r.cells.length}개)이 첫 단계(${columns}개)와 달라요. 빈자리는 null로 채워요`);
  }
  if (grow !== undefined && (!Number.isInteger(grow) || grow < 0 || grow >= columns)) throw new Error(`Stages: 늘릴 열(${grow})이 없어요`);
  const template = Array.from({ length: columns }, (_, i) => (i === grow ? 'minmax(0, 1fr)' : 'auto')).join(' ');
  return {
    columns,
    template,
    rows: rows.map((r) => ({
      label: r.label,
      note: r.note,
      end: r.end,
      cells: r.cells.map((c) => (c === null || c === '' ? null : typeof c === 'string' ? { label: c } : c)),
    })),
  };
}
