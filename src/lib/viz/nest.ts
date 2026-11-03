import type { FigureTone } from './flow';

export interface NestBox {
  label: string;
  /** 이름 옆(상자) 또는 아래(칸) 작은 글자 */
  note?: string;
  tone?: FigureTone;
  /** 안에 든 상자나 칸. 없으면 맨 안쪽 칸 */
  children?: NestBox[];
  /** 한 줄을 다 차지한다 */
  wide?: boolean;
  /** 테두리를 점선으로(실제 경계가 아닌 묶음) */
  dashed?: boolean;
}

export const NEST_MAX_DEPTH = 4;

/** 상자 깊이를 확인한다. 너무 깊으면 360px에서 안쪽 칸이 좁아져서 빌드를 멈춘다. */
export function checkNest(boxes: readonly NestBox[]): number {
  if (boxes.length === 0) throw new Error('Nest: 상자가 하나도 없어요');
  const walk = (b: NestBox, d: number): number => {
    if (!b.label) throw new Error('Nest: 이름 없는 상자가 있어요');
    if (b.children && b.children.length === 0) throw new Error(`Nest: '${b.label}'의 children이 비어 있어요. 칸이면 children을 빼요`);
    return Math.max(d, ...(b.children ?? []).map((c) => walk(c, d + 1)));
  };
  const depth = Math.max(...boxes.map((b) => walk(b, 1)));
  if (depth > NEST_MAX_DEPTH) throw new Error(`Nest: 깊이가 ${depth}겹이에요. ${NEST_MAX_DEPTH}겹까지만 그려요`);
  return depth;
}
