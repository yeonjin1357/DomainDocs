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
