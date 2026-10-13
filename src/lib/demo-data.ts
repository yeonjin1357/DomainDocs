export const SLOW_MS = 3000;
export const REQUEST_COUNT = 100;

/** 100~160ms에 고르게 흩어진 요청 100개. 서버와 브라우저가 같은 값을 만들도록 난수를 쓰지 않는다. */
export function baseLatencies(): number[] {
  return Array.from({ length: REQUEST_COUNT }, (_, i) => 100 + ((i * 37) % 61));
}

/** 앞에서부터 slowCount개를 느린 요청(3초)으로 바꾼 표본. */
export function latencySample(slowCount: number): number[] {
  return baseLatencies().map((v, i) => (i < slowCount ? SLOW_MS : v));
}

export const CPU_STEP_SECONDS = 10;
export const RAW_PEAK = 95;

/** 10초 간격 1시간 CPU 사용률. 평소 35~45%, 32분 무렵 30초(3개)만 95%. */
export function cpuSeries(): number[] {
  return Array.from({ length: 360 }, (_, i) => (i >= 192 && i <= 194 ? RAW_PEAK : 40 + ((i * 7) % 11) - 5));
}

export const RESOLUTIONS = [
  { label: '10초', bucket: 1 },
  { label: '1분', bucket: 6 },
  { label: '5분', bucket: 30 },
  { label: '15분', bucket: 90 },
] as const;
