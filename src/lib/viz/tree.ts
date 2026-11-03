import type { FigureTone } from './flow';

export interface TreeNode {
  label: string;
  /** 이름 아래 작은 글자 */
  note?: string;
  /** 이름 오른쪽 고정폭 글자(예: OID 번호, 값) */
  tag?: string;
  tone?: FigureTone;
  children?: TreeNode[];
}

/** 깊이가 이보다 깊으면 360px 화면에서 들여쓰기 때문에 이름 칸이 너무 좁아진다 */
export const TREE_MAX_DEPTH = 4;
export const TREE_MAX_NODES = 16;

/** 나무의 깊이와 마디 수를 확인한다. 너무 깊거나 많으면 그림을 나누도록 빌드를 멈춘다. */
export function checkTree(root: TreeNode): { depth: number; nodes: number } {
  let nodes = 0;
  const walk = (n: TreeNode, d: number): number => {
    if (!n.label) throw new Error('Tree: 이름 없는 마디가 있어요');
    nodes += 1;
    return Math.max(d, ...(n.children ?? []).map((c) => walk(c, d + 1)));
  };
  const depth = walk(root, 1);
  if (depth > TREE_MAX_DEPTH) throw new Error(`Tree: 깊이가 ${depth}단이에요. ${TREE_MAX_DEPTH}단까지만 그려요`);
  if (nodes > TREE_MAX_NODES) throw new Error(`Tree: 마디가 ${nodes}개예요. ${TREE_MAX_NODES}개까지만 그려요`);
  return { depth, nodes };
}
