/** 리틀의 법칙 데모. 스레드가 모자라면 처리량이 스레드 수 ÷ 응답시간으로 묶인다. */
export function littlesLaw(arrivalPerSec: number, responseMs: number, threads: number) {
  const seconds = responseMs / 1000;
  const needed = Math.round(arrivalPerSec * seconds * 10) / 10;
  const saturated = needed > threads;
  return { needed, saturated, served: saturated ? Math.round(threads / seconds) : arrivalPerSec };
}

/**
 * 재시도 곱셈 데모. 맨 아래가 계속 실패하는 최악의 경우, 계층마다 받는 요청 수다.
 * [0]은 사용자 동작 1번, [i]는 i번째 계층 아래가 받는 수(attempts^i)다.
 */
export function retryFanout(layers: number, attempts: number): number[] {
  return Array.from({ length: layers + 1 }, (_, i) => attempts ** i);
}

/**
 * rate 구간 데모. 평가 시각이 마지막 수집과 겹친다고 보고, 구간 (지금 − window, 지금]에 든 샘플 수를 센다.
 * missed면 바로 앞 수집(지금 − interval) 하나가 빠진다.
 */
export function samplesInWindow(intervalSec: number, windowSec: number, missed: boolean): number {
  const n = Math.ceil(windowSec / intervalSec);
  return missed && n >= 2 ? n - 1 : n;
}

/** 카디널리티 데모. 레이블마다 값의 수를 곱한 시계열 최대 개수다. */
export function maxSeries(valueCounts: number[]): number {
  return valueCounts.reduce((a, b) => a * b, 1);
}
