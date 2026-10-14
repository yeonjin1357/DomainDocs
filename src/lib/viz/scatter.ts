export interface ScatterGroup {
  /** 이 무리에 찍을 점 개수 */
  count: number;
  /** 점이 놓일 x 범위 [시작, 끝]. 두 값이 같으면 세로줄이 된다. */
  x: [number, number];
  /** 점이 놓일 y 범위 [아래, 위]. 두 값이 같으면 가로줄이 된다. */
  y: [number, number];
  /** 1보다 크면 점이 y 범위의 아래쪽에 몰린다. 기본 1(고르게) */
  skew?: number;
  tone?: 'accent' | 'sub' | 'warn';
  /** 범례에 쓸 이름. 없으면 범례에 나오지 않는다. */
  label?: string;
}

export interface ScatterDot {
  /** 점 위치(그림 폭 대비 %) */
  left: number;
  /** 점 위치(그림 높이 대비 %, 위에서부터) */
  top: number;
  tone: 'accent' | 'sub' | 'warn';
}

const round = (n: number) => Math.round(n * 100) / 100;
const clamp = (n: number) => Math.min(Math.max(n, 0), 100);

/** 같은 입력에 늘 같은 점을 찍도록, 무리 순서로 씨앗을 정하는 의사 난수(mulberry32) */
function random(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * 무리마다 범위 안에 점을 흩뿌려 % 위치로 바꾼다. x는 0~xMax, y는 0~yMax를 그림 전체로 본다.
 * 범위를 벗어난 점은 그림 가장자리에 붙인다.
 */
export function scatterDots(groups: readonly ScatterGroup[], xMax: number, yMax: number): ScatterDot[] {
  return groups.flatMap((g, gi) => {
    const next = random(gi + 1);
    const skew = g.skew ?? 1;
    return Array.from({ length: g.count }, () => {
      const x = g.x[0] + (g.x[1] - g.x[0]) * next();
      const y = g.y[0] + (g.y[1] - g.y[0]) * next() ** skew;
      return {
        left: round(clamp(xMax > 0 ? (x / xMax) * 100 : 0)),
        top: round(clamp(yMax > 0 ? 100 - (y / yMax) * 100 : 100)),
        tone: g.tone ?? 'accent',
      };
    });
  });
}
