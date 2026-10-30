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

/** SLO 데모. 기간 동안의 에러 버짓(분), 지금 에러율의 burn rate, 그 속도로 버짓을 다 쓰는 시간(시간)이다. */
export function sloBudget(budgetFraction: number, errorRate: number, periodDays = 30) {
  const burnRate = errorRate / budgetFraction;
  return {
    budgetMinutes: Math.round(periodDays * 1440 * budgetFraction * 100) / 100,
    burnRate: Math.round(burnRate * 100) / 100,
    exhaustHours: (periodDays * 24) / burnRate,
  };
}

/**
 * Prometheus histogram_quantile과 같은 셈. bounds는 유한 경계(오름차순)이고 +Inf 버킷은 저절로 붙는다.
 * 순위가 든 버킷 안을 고르게 나누고, 첫 버킷의 아래 경계는 0, +Inf 버킷이면 바로 앞 경계를 돌려준다.
 */
export function histogramQuantile(q: number, values: number[], bounds: number[]): number {
  const cum = bounds.map((b) => values.filter((v) => v <= b).length);
  const rank = q * values.length;
  const i = cum.findIndex((c) => c >= rank);
  if (i === -1) return bounds.at(-1)!;
  const lower = i === 0 ? 0 : bounds[i - 1];
  const below = i === 0 ? 0 : cum[i - 1];
  return lower + ((bounds[i] - lower) * (rank - below)) / (cum[i] - below);
}

/** 수집 주기 데모. offset초부터 interval마다 span초 동안 수집할 때, [start, start + length) 스파이크에 걸린 수집 시각이다. */
export function scrapesInSpike(interval: number, offset: number, span: number, start: number, length: number): number[] {
  const times = Array.from({ length: Math.ceil((span - offset) / interval) }, (_, k) => offset + k * interval);
  return times.filter((t) => t >= start && t < start + length);
}

/** Apdex 점수. T 이하 만족(1), 4T 이하 허용(0.5), 그 위는 불만(0)이다. */
export function apdex(values: number[], t: number) {
  const satisfied = values.filter((v) => v <= t).length;
  const tolerating = values.filter((v) => v > t && v <= 4 * t).length;
  return { satisfied, tolerating, frustrated: values.length - satisfied - tolerating, score: (satisfied + tolerating / 2) / values.length };
}

/** 샘플링 데모(기댓값). head는 모든 요청을 같은 비율로, tail은 에러를 모두 남기고 나머지만 비율로 남긴다. */
export function sampledErrorRate(total: number, errorRate: number, keepRate: number, policy: 'head' | 'tail') {
  const errors = total * errorRate;
  const keptErrors = policy === 'head' ? errors * keepRate : errors;
  const kept = keptErrors + (total - errors) * keepRate;
  return { kept: Math.round(kept), keptErrors: Math.round(keptErrors), rate: keptErrors / kept };
}

/** 버퍼 캐시 데모. 블록 4개 중 2개만 캐시에 있을 때, 같은 블록을 passes번 읽은 결과다. 처음 빼고는 모두 캐시에서 찾아요. */
export function rereadHitRatio(passes: number) {
  const logical = 4 * passes;
  const physical = 2;
  return { logical, physical, ratio: 1 - physical / logical };
}

/**
 * CPU 한도 데모. 100ms 주기마다 한도 × 100ms의 CPU 시간을 모든 스레드가 함께 써요(코어는 넉넉하다고 봐요).
 * 스레드마다 cpuMsPerThread만큼 일할 때, 주기마다 일한 시간과 멈춘 시간이다.
 */
export function cfsThrottle(limitCores: number, threads: number, cpuMsPerThread: number, periodMs = 100) {
  const quota = limitCores * periodMs;
  const periods: { run: number; throttled: number }[] = [];
  let left = cpuMsPerThread;
  while (left > 1e-9) {
    const run = Math.min(left, quota / threads, periodMs);
    left -= run;
    periods.push({ run, throttled: left > 1e-9 && run < periodMs ? periodMs - run : 0 });
  }
  const wallMs = periods.reduce((a, p) => a + p.run + p.throttled, 0);
  return { periods, wallMs: Math.round(wallMs), throttledPeriods: periods.filter((p) => p.throttled > 0).length };
}

/** HPA 데모. 사용률 = 사용량 ÷ 요청이고, 비율이 1 ± tolerance 안이면 그대로, 아니면 올림(파드 × 비율)을 [1, max]로 자른다. */
export function hpaDesired(pods: number, usageMilli: number, requestMilli: number, targetPct: number, maxPods: number, tolerance = 0.1) {
  const utilization = Math.round((usageMilli / requestMilli) * 100);
  const ratio = utilization / targetPct;
  if (Math.abs(ratio - 1) <= tolerance) return { utilization, desired: pods, reason: 'tolerance' as const };
  const raw = Math.ceil(pods * ratio - 1e-9);
  if (raw > maxPods) return { utilization, desired: maxPods, reason: 'max' as const };
  const reason = raw > pods ? ('up' as const) : raw < pods ? ('down' as const) : ('same' as const);
  return { utilization, desired: Math.max(1, raw), reason };
}

/**
 * 클러스터 DNS 데모. 점이 ndots보다 적으면 검색 도메인부터, 아니면 이름 그대로부터 물어요. 끝에 점이 있으면 그대로만 물어요.
 * exists에 있는 이름에서 답을 받으면 멈춘다.
 */
export function dnsLookupOrder(name: string, ndots: number, search: string[], exists: ReadonlySet<string>) {
  const absolute = name.endsWith('.');
  const bare = absolute ? name.slice(0, -1) : name;
  const dots = bare.split('.').length - 1;
  const withSearch = search.map((s) => `${bare}.${s}`);
  const order = absolute ? [bare] : dots >= ndots ? [bare, ...withSearch] : [...withSearch, bare];
  const out: { query: string; found: boolean }[] = [];
  for (const query of order) {
    const found = exists.has(query);
    out.push({ query, found });
    if (found) break;
  }
  return out;
}

/** 컨슈머 그룹 데모. 파티션을 차례로 나눠 맡긴 예시이고, 컨슈머마다 맡은 파티션 번호 목록이다. */
export function assignPartitions(partitions: number, consumers: number): number[][] {
  const out: number[][] = Array.from({ length: consumers }, () => []);
  for (let p = 0; p < partitions; p++) out[p % consumers].push(p);
  return out;
}

/** Kafka Utils.murmur2와 같은 해시(시드 0x9747b28c, 4바이트씩 little-endian). */
export function murmur2(data: Uint8Array): number {
  const m = 0x5bd1e995;
  let h = 0x9747b28c ^ data.length;
  const length4 = data.length >> 2;
  for (let i = 0; i < length4; i++) {
    const i4 = i << 2;
    let k = data[i4] | (data[i4 + 1] << 8) | (data[i4 + 2] << 16) | (data[i4 + 3] << 24);
    k = Math.imul(k, m);
    k ^= k >>> 24;
    k = Math.imul(k, m);
    h = Math.imul(h, m);
    h ^= k;
  }
  const index = length4 << 2;
  const rest = data.length - index;
  if (rest === 3) h ^= data[index + 2] << 16;
  if (rest >= 2) h ^= data[index + 1] << 8;
  if (rest >= 1) {
    h ^= data[index];
    h = Math.imul(h, m);
  }
  h ^= h >>> 13;
  h = Math.imul(h, m);
  h ^= h >>> 15;
  return h | 0;
}

/** Kafka 기본 파티셔너가 키 있는 이벤트에 고르는 파티션. toPositive(murmur2(UTF-8 키)) % 파티션 수예요. */
export function partitionForKey(key: string, partitions: number): number {
  return (murmur2(new TextEncoder().encode(key)) & 0x7fffffff) % partitions;
}

/** lag 데모. 방금 들어온 메시지가 기다릴 시간(초)과 lag이 0이 되기까지의 시간(초, 못 따라잡으면 Infinity)이다. */
export function lagOutlook(lag: number, inPerSec: number, outPerSec: number) {
  return { waitSec: lag / outPerSec, drainSec: outPerSec > inPerSec ? lag / (outPerSec - inPerSec) : Infinity };
}

/** 토큰 바구니 데모. 가득 찬 바구니에서 시작해 초마다 rate번 부를 때, 초마다 받아 준 수와 거절된 수다. */
export function tokenBucket(capacity: number, refillPerSec: number, ratePerSec: number, seconds: number) {
  let tokens = capacity;
  return Array.from({ length: seconds }, () => {
    const accepted = Math.min(ratePerSec, tokens);
    tokens = Math.min(capacity, tokens - accepted + refillPerSec);
    return { accepted, rejected: ratePerSec - accepted };
  });
}

/** 카운터 데모. bits비트 바이트 카운터가 한 바퀴 도는 데 걸리는 초다. */
export function counterWrapSeconds(bits: number, speedBps: number, utilization: number): number {
  return 2 ** bits / ((speedBps / 8) * utilization);
}

/** 서브넷 데모. IPv4 주소와 접두사 길이로 그 네트워크의 첫 주소, 마지막 주소, 주소 수를 구한다. */
export function subnetRange(ip: string, prefix: number) {
  const n = ip.split('.').reduce((a, o) => a * 256 + Number(o), 0);
  const size = 2 ** (32 - prefix);
  const first = Math.floor(n / size) * size;
  const dotted = (v: number) => [24, 16, 8, 0].map((s) => Math.floor(v / 2 ** s) % 256).join('.');
  return { first: dotted(first), last: dotted(first + size - 1), size };
}

export type BreakerState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';
export interface Breaker {
  state: BreakerState;
  /** 닫힘에선 최근 호출 창, 반열림에선 시험 호출 결과. true가 실패다. */
  calls: boolean[];
  /** 열림에서 기다리는 시간이 지났는지 */
  waited: boolean;
}
/** 글의 재현과 같은 설정: 창 10, 최소 호출 10, 실패율 50%, 반열림 시험 3번 */
export const BREAKER_CONFIG = { window: 10, minCalls: 10, failurePct: 50, halfOpenCalls: 3 };

/**
 * 서킷 브레이커 데모(Resilience4j 횟수 창). 호출 하나를 넣고 다음 상태와 그 호출이 거절됐는지를 돌려준다.
 * 열림에선 기다림이 지난 뒤 들어온 호출이 상태를 반열림으로 바꾸고 첫 시험 호출이 된다.
 */
export function breakerCall(b: Breaker, failed: boolean, cfg = BREAKER_CONFIG): { next: Breaker; rejected: boolean } {
  if (b.state === 'OPEN' && !b.waited) return { next: b, rejected: true };
  const halfOpen = b.state !== 'CLOSED';
  const calls = b.state === 'OPEN' ? [failed] : [...b.calls, failed].slice(-cfg.window);
  const needed = halfOpen ? cfg.halfOpenCalls : cfg.minCalls;
  if (calls.length < needed) return { next: { state: halfOpen ? 'HALF_OPEN' : 'CLOSED', calls, waited: false }, rejected: false };
  const pct = (calls.filter(Boolean).length / calls.length) * 100;
  if (pct >= cfg.failurePct) return { next: { state: 'OPEN', calls: [], waited: false }, rejected: false };
  return { next: { state: 'CLOSED', calls: halfOpen ? [] : calls, waited: false }, rejected: false };
}
