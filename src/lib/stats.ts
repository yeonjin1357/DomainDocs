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

export type Aggregation = 'avg' | 'max';

/** 앞에서부터 size개씩 묶어 평균 또는 최댓값으로 요약한다. 마지막 묶음은 남은 값만 쓴다. */
export function downsample(values: readonly number[], size: number, how: Aggregation): number[] {
  if (!Number.isInteger(size) || size < 1) throw new RangeError(`size는 1 이상의 정수여야 해요: ${size}`);
  const out: number[] = [];
  for (let i = 0; i < values.length; i += size) {
    const bucket = values.slice(i, i + size);
    out.push(how === 'max' ? Math.max(...bucket) : mean(bucket));
  }
  return out;
}
