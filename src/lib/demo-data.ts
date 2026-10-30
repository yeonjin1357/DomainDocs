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

const spread = (n: number, from: number, step: number, kinds: number) =>
  Array.from({ length: n }, (_, i) => Math.round((from + (i % kinds) * step) * 1000) / 1000);

/**
 * 히스토그램 글의 요청 1,000건. 0.1초 이하 700, 0.25초 이하 200, 0.5초 이하 85, 1초 이하 10, 2.5초 이하 4, 그 위 1건이에요.
 * 0.5~1초 칸의 10건은 0.86~0.99초에 몰려 있어서, 실제 p99(990번째)는 0.92초예요.
 */
export function histogramLatencies(): number[] {
  return [
    ...spread(700, 0.02, 0.01, 9),
    ...spread(200, 0.11, 0.01, 15),
    ...spread(85, 0.26, 0.01, 25),
    0.86, 0.88, 0.9, 0.91, 0.92, 0.93, 0.94, 0.95, 0.97, 0.99,
    1.2, 1.5, 1.8, 2.2,
    3,
  ];
}

/** Apdex 글의 요청 1,000건. T = 0.5초로 보면 만족 800, 허용 100, 불만 100이라 점수가 0.85예요. */
export function apdexLatencies(): number[] {
  return [...spread(800, 0.1, 0.01, 41), ...spread(100, 0.6, 0.1, 15), ...spread(100, 2.5, 0.5, 8)];
}

export const RESOLUTIONS = [
  { label: '10초', bucket: 1 },
  { label: '1분', bucket: 6 },
  { label: '5분', bucket: 30 },
  { label: '15분', bucket: 90 },
] as const;
