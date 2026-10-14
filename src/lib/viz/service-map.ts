export type MapTone = 'accent' | 'sub' | 'warn';

export interface MapNode {
  id: string;
  label: string;
  /** 노드 가운데 위치(그림 폭 대비 %) */
  x: number;
  /** 노드 가운데 위치(그림 높이 대비 %) */
  y: number;
  /** 노드 이름 아래 작은 글자(예: 처리량) */
  note?: string;
  tone?: MapTone;
  /** 계측되지 않아 부른 쪽 span으로만 아는 노드. 점선으로 그린다. */
  virtual?: boolean;
}

export interface MapEdge {
  from: string;
  to: string;
  /** 선 가운데에 놓을 글자(예: 응답시간, 에러율) */
  label?: string;
  tone?: MapTone;
}

export interface EdgeLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  /** 글자를 놓을 선 가운데 */
  mx: number;
  my: number;
  label?: string;
  tone: MapTone;
}

const round = (n: number) => Math.round(n * 100) / 100;

/** 선을 노드 가운데끼리 잇는다. 없는 노드를 가리키면 글을 고치도록 빌드를 멈춘다. */
export function edgeLines(nodes: readonly MapNode[], edges: readonly MapEdge[]): EdgeLine[] {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  return edges.map((e) => {
    const a = byId.get(e.from);
    const b = byId.get(e.to);
    if (!a || !b) throw new Error(`ServiceMap: 없는 노드를 잇는 선이에요 (${e.from} → ${e.to})`);
    return {
      x1: a.x,
      y1: a.y,
      x2: b.x,
      y2: b.y,
      mx: round((a.x + b.x) / 2),
      my: round((a.y + b.y) / 2),
      label: e.label,
      tone: e.tone ?? 'sub',
    };
  });
}
