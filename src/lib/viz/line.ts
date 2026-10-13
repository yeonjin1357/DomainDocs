export interface ChartBox {
  width: number;
  height: number;
  padding: number;
}

const round = (n: number) => Math.round(n * 100) / 100;
const NICE_STEPS = [1, 1.2, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10];

/** y축 상한. 최댓값의 1.1배 이상인 '보기 좋은' 수 중 가장 작은 값. */
export function niceMax(values: readonly number[]): number {
  const target = Math.max(0, ...values) * 1.1;
  if (target <= 0) return 1;
  const magnitude = 10 ** Math.floor(Math.log10(target));
  const step = NICE_STEPS.find((s) => s * magnitude >= target) ?? 10;
  return round(step * magnitude);
}

export function pointsOf(values: readonly number[], max: number, box: ChartBox): [number, number][] {
  const innerW = box.width - box.padding * 2;
  const innerH = box.height - box.padding * 2;
  const n = values.length;
  return values.map((v, i) => {
    const x = box.padding + (n === 1 ? innerW / 2 : (innerW * i) / (n - 1));
    const clamped = Math.min(Math.max(v, 0), max);
    const y = box.height - box.padding - (clamped / max) * innerH;
    return [round(x), round(y)];
  });
}

export function linePath(values: readonly number[], max: number, box: ChartBox): string {
  if (values.length === 0) return '';
  const pts = pointsOf(values, max, box);
  if (pts.length === 1) {
    const y = pts[0][1];
    return `M${box.padding} ${y} L${box.width - box.padding} ${y}`;
  }
  return pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x} ${y}`).join(' ');
}
