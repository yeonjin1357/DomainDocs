export function mean(values: readonly number[]): number {
  if (values.length === 0) return Number.NaN;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/** nearest-rank 백분위수: 오름차순으로 줄 세운 뒤 ⌈p/100 × n⌉번째 값. */
export function percentile(values: readonly number[], p: number): number {
  if (!(p > 0 && p <= 100)) throw new RangeError(`p는 0 초과 100 이하여야 해요: ${p}`);
  if (values.length === 0) return Number.NaN;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.ceil((p * sorted.length) / 100) - 1];
}
