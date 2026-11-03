import type { FigureTone } from './flow';

export interface StacksBlock {
  label: string;
  /** 몇 줄을 차지하는지. 없으면 1 */
  span?: number;
  /** accent는 강조, warn은 문제, sub는 흐린 칸. 없으면 보통 칸 */
  tone?: FigureTone;
  /** 이름 앞 작은 글자(예: 층 번호) */
  tag?: string;
}

export interface StacksColumn {
  /** 기둥 위 이름 */
  title: string;
  /** 위에서부터 쌓을 칸. null은 한 줄짜리 빈자리 */
  blocks: (string | StacksBlock | null)[];
}

export interface StacksLayout {
  rows: number;
  columns: {
    title: string;
    blocks: { label: string; tone?: FigureTone; tag?: string; row: number; span: number }[];
  }[];
}

/** 기둥이 이보다 많으면 360px 화면에서 칸 글자가 읽히지 않는다 */
export const STACKS_MAX_COLUMNS = 4;
export const STACKS_MAX_ROWS = 12;

/**
 * 기둥마다 칸을 위에서부터 쌓아 같은 줄 눈금에 맞춘다. 칸 위치는 CSS grid 줄 번호(머리 줄 다음인 2부터)다.
 * 기둥마다 줄 수의 합이 다르면 어느 칸이 어디에 걸치는지 모호해서 빌드를 멈춘다.
 */
export function layoutStacks(columns: readonly StacksColumn[]): StacksLayout {
  if (columns.length < 2) throw new Error('Stacks: 기둥이 둘 이상이어야 견줘 볼 수 있어요');
  if (columns.length > STACKS_MAX_COLUMNS) throw new Error(`Stacks: 기둥이 ${columns.length}개예요. ${STACKS_MAX_COLUMNS}개까지만 그려요`);
  const out = columns.map((c) => {
    let row = 2;
    const blocks: StacksLayout['columns'][number]['blocks'] = [];
    for (const b of c.blocks) {
      if (b === null) {
        row += 1;
        continue;
      }
      const block = typeof b === 'string' ? { label: b } : b;
      const span = block.span ?? 1;
      if (!Number.isInteger(span) || span < 1) throw new Error(`Stacks: '${block.label}'의 줄 수(${span})는 1 이상의 정수여야 해요`);
      blocks.push({ label: block.label, tone: block.tone, tag: block.tag, row, span });
      row += span;
    }
    return { title: c.title, blocks, rows: row - 2 };
  });
  const rows = out[0].rows;
  for (const c of out) {
    if (c.rows !== rows) throw new Error(`Stacks: 기둥마다 줄 수의 합이 같아야 해요(${out.map((o) => `${o.title} ${o.rows}줄`).join(', ')})`);
  }
  if (rows === 0) throw new Error('Stacks: 칸이 하나도 없어요');
  if (rows > STACKS_MAX_ROWS) throw new Error(`Stacks: 줄이 ${rows}개예요. ${STACKS_MAX_ROWS}개까지만 그려요`);
  return { rows, columns: out.map(({ title, blocks }) => ({ title, blocks })) };
}
