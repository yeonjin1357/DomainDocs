export interface WaterfallSpan {
  label: string;
  /** 트레이스 시작부터 이 구간이 시작하기까지의 시간 */
  start: number;
  duration: number;
  /** 부모-자식 깊이. 이름을 이만큼 들여 쓴다. */
  depth?: number;
  tone?: 'accent' | 'sub' | 'warn';
}

export interface SpanBar {
  /** 막대 시작 위치(트랙 폭 대비 %) */
  left: number;
  /** 막대 길이(트랙 폭 대비 %) */
  width: number;
}

const round = (n: number) => Math.round(n * 100) / 100;

/**
 * 가장 늦게 끝나는 구간을 트랙 끝(100%)으로 보고, 구간마다 막대 위치와 길이를 %로 바꾼다.
 * 몇 ms짜리 구간도 보이게 막대에 최소 폭을 두고, 그만큼 트랙 밖으로 나가지 않게 왼쪽으로 당긴다.
 */
export function spanBars(spans: readonly WaterfallSpan[], minWidth = 0.6): SpanBar[] {
  const end = Math.max(0, ...spans.map((s) => s.start + s.duration));
  if (end <= 0) return spans.map(() => ({ left: 0, width: minWidth }));
  return spans.map((s) => {
    const width = Math.max((s.duration / end) * 100, minWidth);
    const left = Math.min((s.start / end) * 100, 100 - width);
    return { left: round(left), width: round(width) };
  });
}
