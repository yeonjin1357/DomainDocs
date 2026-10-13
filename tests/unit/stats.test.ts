import { describe, expect, it } from 'vitest';
import { downsample, mean, percentile } from '../../src/lib/stats';
import { baseLatencies, cpuSeries, latencySample, RAW_PEAK, REQUEST_COUNT, RESOLUTIONS, SLOW_MS } from '../../src/lib/demo-data';

describe('mean', () => {
  it('산술 평균이다', () => {
    expect(mean([1, 2, 3, 4])).toBe(2.5);
  });
  it('비면 NaN이다', () => {
    expect(mean([])).toBeNaN();
  });
});

describe('percentile (nearest-rank)', () => {
  const oneToHundred = Array.from({ length: 100 }, (_, i) => i + 1);
  it('1~100에서 p50은 50, p99는 99, p100은 100이다', () => {
    expect(percentile(oneToHundred, 50)).toBe(50);
    expect(percentile(oneToHundred, 99)).toBe(99);
    expect(percentile(oneToHundred, 100)).toBe(100);
  });
  it('부동소수점 오차가 나는 p(7, 29)도 정확한 순위를 고른다', () => {
    expect(percentile(oneToHundred, 7)).toBe(7);
    expect(percentile(oneToHundred, 29)).toBe(29);
  });
  it('정렬되지 않은 입력도 정렬해서 계산하고, 원본은 바꾸지 않는다', () => {
    const input = [5, 1, 4, 2, 3];
    expect(percentile(input, 50)).toBe(3);
    expect(input).toEqual([5, 1, 4, 2, 3]);
  });
  it('요청이 50개면 p99는 최댓값이다', () => {
    const fifty = Array.from({ length: 50 }, (_, i) => i + 1);
    expect(percentile(fifty, 99)).toBe(50);
  });
  it('비면 NaN, 범위 밖 p는 RangeError다', () => {
    expect(percentile([], 99)).toBeNaN();
    expect(() => percentile([1], 0)).toThrow(RangeError);
    expect(() => percentile([1], 101)).toThrow(RangeError);
  });
});

describe('데모 데이터', () => {
  it('기본 요청 100개는 100~160ms다', () => {
    const base = baseLatencies();
    expect(base).toHaveLength(REQUEST_COUNT);
    expect(Math.min(...base)).toBe(100);
    expect(Math.max(...base)).toBe(160);
  });
  it('느린 요청 0개: 평균 129.56, p50 129, p99 160', () => {
    const s = latencySample(0);
    expect(mean(s)).toBeCloseTo(129.56, 2);
    expect(percentile(s, 50)).toBe(129);
    expect(percentile(s, 99)).toBe(160);
  });
  it('느린 요청 1개(1%): p99는 그대로 160이다', () => {
    const s = latencySample(1);
    expect(mean(s)).toBeCloseTo(158.56, 2);
    expect(percentile(s, 99)).toBe(160);
  });
  it('느린 요청 2개(2%): p99가 3000으로 튀고 평균은 187.19다', () => {
    const s = latencySample(2);
    expect(mean(s)).toBeCloseTo(187.19, 2);
    expect(percentile(s, 99)).toBe(SLOW_MS);
  });
  it('느린 요청 10개: p95도 3000이다', () => {
    expect(percentile(latencySample(10), 95)).toBe(SLOW_MS);
  });
});

describe('downsample', () => {
  it('size개씩 평균으로 묶고, 마지막 묶음은 남은 값만 쓴다', () => {
    expect(downsample([1, 2, 3, 4, 5], 2, 'avg')).toEqual([1.5, 3.5, 5]);
  });
  it('최댓값으로 묶을 수 있다', () => {
    expect(downsample([1, 9, 3, 4, 5], 2, 'max')).toEqual([9, 4, 5]);
  });
  it('size가 1이면 원본과 같다', () => {
    expect(downsample([3, 1, 2], 1, 'avg')).toEqual([3, 1, 2]);
  });
  it('size가 1 미만이거나 정수가 아니면 RangeError다', () => {
    expect(() => downsample([1], 0, 'avg')).toThrow(RangeError);
    expect(() => downsample([1], 1.5, 'avg')).toThrow(RangeError);
  });
});

describe('CPU 데모 데이터', () => {
  const raw = cpuSeries();
  it('10초 간격 1시간(360개), 기본 35~45%, 피크 95%', () => {
    expect(raw).toHaveLength(360);
    expect(Math.max(...raw)).toBe(RAW_PEAK);
    expect(Math.min(...raw)).toBe(35);
    expect(raw.filter((v) => v === RAW_PEAK)).toHaveLength(3);
  });
  it.each([
    [1, 360, 95],
    [6, 60, 67.17],
    [30, 12, 45.3],
    [90, 4, 41.8],
  ])('평균으로 %d개씩 묶으면 점 %d개, 최고값 %d', (size, points, peak) => {
    const out = downsample(raw, size, 'avg');
    expect(out).toHaveLength(points);
    expect(Math.max(...out)).toBeCloseTo(peak, 2);
  });
  it('최댓값으로 묶으면 어떤 크기든 피크 95%가 남는다', () => {
    for (const { bucket } of RESOLUTIONS) expect(Math.max(...downsample(raw, bucket, 'max'))).toBe(RAW_PEAK);
  });
});
