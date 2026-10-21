export type FigureTone = 'accent' | 'sub' | 'warn';

export interface FlowNode {
  id: string;
  label: string;
  /** 놓을 칸(왼쪽부터 0) */
  col: number;
  /** 놓을 줄(위부터 0) */
  row: number;
  /** 이름 아래 작은 글자 */
  note?: string;
  tone?: FigureTone;
}

export interface FlowEdge {
  from: string;
  to: string;
  /** 화살표 가운데에 놓을 글자 */
  label?: string;
  tone?: FigureTone;
  /** 양쪽 끝에 화살촉 */
  both?: boolean;
  dashed?: boolean;
}

/** 여러 칸을 감싸는 점선 테두리(예: 서버실, 클러스터) */
export interface FlowGroup {
  label: string;
  cols: [number, number];
  rows: [number, number];
}

/** viewBox 단위. 한 줄에 3칸이면 폭 300이라 360px 화면에서도 글자가 읽힌다. */
export const FLOW = { cellW: 100, cellH: 72, nodeW: 84, nodeH: 40 } as const;

export interface FlowLayout {
  width: number;
  height: number;
  nodes: (FlowNode & { cx: number; cy: number })[];
  edges: { x1: number; y1: number; x2: number; y2: number; lx: number; ly: number; label?: string; tone: FigureTone; both: boolean; dashed: boolean }[];
  groups: { label: string; x: number; y: number; w: number; h: number }[];
}

const round = (n: number) => Math.round(n * 100) / 100;

/** 가운데 (cx, cy)인 상자에서 (dx, dy) 방향으로 나가는 선이 테두리와 만나는 점 */
function edgePoint(cx: number, cy: number, dx: number, dy: number): [number, number] {
  const t = Math.min(dx === 0 ? Infinity : FLOW.nodeW / 2 / Math.abs(dx), dy === 0 ? Infinity : FLOW.nodeH / 2 / Math.abs(dy));
  return [cx + t * dx, cy + t * dy];
}

/** 칸 위치로 상자 가운데를 정하고, 화살표는 상자 테두리에서 테두리까지 긋는다. 잘못된 그림은 글을 고치도록 빌드를 멈춘다. */
export function layoutFlow(nodes: readonly FlowNode[], edges: readonly FlowEdge[], groups: readonly FlowGroup[] = []): FlowLayout {
  const cells = new Set<string>();
  const placed = nodes.map((n) => {
    const cell = `${n.col}, ${n.row}`;
    if (cells.has(cell)) throw new Error(`Flow: 같은 칸에 상자가 둘이에요 (${cell})`);
    cells.add(cell);
    return { ...n, cx: (n.col + 0.5) * FLOW.cellW, cy: (n.row + 0.5) * FLOW.cellH };
  });
  const byId = new Map(placed.map((n) => [n.id, n]));
  const maxCol = Math.max(0, ...nodes.map((n) => n.col), ...groups.map((g) => g.cols[1]));
  const maxRow = Math.max(0, ...nodes.map((n) => n.row), ...groups.map((g) => g.rows[1]));

  return {
    width: (maxCol + 1) * FLOW.cellW,
    height: (maxRow + 1) * FLOW.cellH,
    nodes: placed,
    edges: edges.map((e) => {
      const a = byId.get(e.from);
      const b = byId.get(e.to);
      if (!a || !b) throw new Error(`Flow: 없는 상자를 잇는 화살표예요 (${e.from} → ${e.to})`);
      const dx = b.cx - a.cx;
      const dy = b.cy - a.cy;
      const [x1, y1] = edgePoint(a.cx, a.cy, dx, dy);
      const [x2, y2] = edgePoint(b.cx, b.cy, -dx, -dy);
      return {
        x1: round(x1),
        y1: round(y1),
        x2: round(x2),
        y2: round(y2),
        lx: round((a.cx + b.cx) / 2),
        ly: round((a.cy + b.cy) / 2),
        label: e.label,
        tone: e.tone ?? 'sub',
        both: e.both ?? false,
        dashed: e.dashed ?? false,
      };
    }),
    groups: groups.map((g) => ({
      label: g.label,
      x: g.cols[0] * FLOW.cellW + 4,
      y: g.rows[0] * FLOW.cellH + 4,
      w: (g.cols[1] - g.cols[0] + 1) * FLOW.cellW - 8,
      h: (g.rows[1] - g.rows[0] + 1) * FLOW.cellH - 8,
    })),
  };
}
