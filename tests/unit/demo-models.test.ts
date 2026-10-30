import { describe, expect, it } from 'vitest';
import {
  apdex,
  assignPartitions,
  breakerCall,
  cfsThrottle,
  counterWrapSeconds,
  dnsLookupOrder,
  histogramQuantile,
  hpaDesired,
  lagOutlook,
  littlesLaw,
  maxSeries,
  murmur2,
  partitionForKey,
  rereadHitRatio,
  retryFanout,
  sampledErrorRate,
  samplesInWindow,
  scrapesInSpike,
  sloBudget,
  subnetRange,
  tokenBucket,
  type Breaker,
} from '../../src/lib/demo-models';
import { apdexLatencies, histogramLatencies } from '../../src/lib/demo-data';

describe('littlesLaw', () => {
  it('초당 200건을 0.5초씩 처리하면 100건이 처리 중이고, 스레드 200개 안이라 처리량은 그대로다', () => {
    expect(littlesLaw(200, 500, 200)).toEqual({ needed: 100, saturated: false, served: 200 });
  });
  it('응답이 1.5초로 늘면 300건이 필요하고, 스레드 200개면 처리량은 133건이다', () => {
    expect(littlesLaw(200, 1500, 200)).toEqual({ needed: 300, saturated: true, served: 133 });
  });
  it('필요한 수가 스레드 수와 같으면 아직 포화가 아니다', () => {
    expect(littlesLaw(200, 1000, 200).saturated).toBe(false);
  });
  it('0.1초 단위 곱에서 부동소수점 오차를 남기지 않는다', () => {
    expect(littlesLaw(30, 700, 200).needed).toBe(21);
  });
});

describe('retryFanout', () => {
  it('세 계층이 4번씩 시도하면 4, 16, 64번이다', () => {
    expect(retryFanout(3, 4)).toEqual([1, 4, 16, 64]);
  });
  it('다섯 계층이 3번씩 시도하면 맨 아래는 243번이다', () => {
    expect(retryFanout(5, 3).at(-1)).toBe(243);
  });
  it('재시도가 없으면 모든 계층이 1번이다', () => {
    expect(retryFanout(4, 1)).toEqual([1, 1, 1, 1, 1]);
  });
});

describe('samplesInWindow', () => {
  it('15초마다 수집할 때 [15s]는 1개, [1m]은 4개, [5m]은 20개다', () => {
    expect(samplesInWindow(15, 15, false)).toBe(1);
    expect(samplesInWindow(15, 60, false)).toBe(4);
    expect(samplesInWindow(15, 300, false)).toBe(20);
  });
  it('구간이 수집 주기보다 짧으면 1개다', () => {
    expect(samplesInWindow(60, 30, false)).toBe(1);
  });
  it('수집이 한 번 빠지면 구간 안 샘플이 하나 준다. 1개뿐이면 그대로다', () => {
    expect(samplesInWindow(15, 30, true)).toBe(1);
    expect(samplesInWindow(15, 60, true)).toBe(3);
    expect(samplesInWindow(15, 15, true)).toBe(1);
  });
});

describe('maxSeries', () => {
  it('method 5 × status 10 × route 200은 10,000이다', () => {
    expect(maxSeries([5, 10, 200])).toBe(10_000);
  });
  it('레이블이 없으면 시계열 1개다', () => {
    expect(maxSeries([])).toBe(1);
  });
});

describe('sloBudget', () => {
  it('30일 99.9%의 버짓은 43.2분이고, 에러율 0.1%는 burn rate 1, 1%는 10이라 3일 만에 다 써요', () => {
    expect(sloBudget(0.001, 0.001)).toEqual({ budgetMinutes: 43.2, burnRate: 1, exhaustHours: 720 });
    expect(sloBudget(0.001, 0.01).exhaustHours).toBe(72);
  });
  it('모든 요청이 실패하면 43.2분, 10%면 7.2시간 만에 다 써요', () => {
    expect(sloBudget(0.001, 1).exhaustHours * 60).toBeCloseTo(43.2);
    expect(sloBudget(0.001, 0.1).exhaustHours).toBeCloseTo(7.2);
  });
});

describe('histogramQuantile', () => {
  const values = histogramLatencies();
  const base = [0.1, 0.25, 0.5, 1, 2.5];
  it('글의 버킷이면 p99는 0.75초다', () => {
    expect(values).toHaveLength(1000);
    expect(histogramQuantile(0.99, values, base)).toBeCloseTo(0.75);
  });
  it('실제 990번째 요청은 0.92초다', () => {
    expect([...values].sort((a, b) => a - b)[989]).toBe(0.92);
  });
  it('0.75초, 0.9초 경계를 더하면 실제에 가까워진다', () => {
    expect(histogramQuantile(0.99, values, [0.1, 0.25, 0.5, 0.75, 1, 2.5])).toBeCloseTo(0.875);
    expect(histogramQuantile(0.99, values, [0.1, 0.25, 0.5, 0.9, 1, 2.5])).toBeCloseTo(0.9286, 3);
  });
  it('순위가 +Inf 버킷에 들면 바로 앞 경계를 돌려준다', () => {
    expect(histogramQuantile(0.9995, values, base)).toBe(2.5);
  });
});

describe('scrapesInSpike', () => {
  it('15초마다 0초부터 수집하면 20~23초의 스파이크를 놓친다', () => {
    expect(scrapesInSpike(15, 0, 60, 20, 3)).toEqual([]);
  });
  it('수집 시각을 6초 미루면 21초에 걸린다', () => {
    expect(scrapesInSpike(15, 6, 60, 20, 3)).toEqual([21]);
  });
});

describe('apdex', () => {
  const values = apdexLatencies();
  it('T = 0.5초면 만족 800, 허용 100, 불만 100이라 0.85다', () => {
    expect(apdex(values, 0.5)).toEqual({ satisfied: 800, tolerating: 100, frustrated: 100, score: 0.85 });
  });
  it('T = 4초면 3초 요청도 만족이다', () => {
    expect(apdex(values, 4).frustrated).toBe(0);
  });
});

describe('sampledErrorRate', () => {
  it('에러를 모두 남기고 나머지 10%를 남기면 1,045건 중 50건이라 4.8%로 보인다', () => {
    const r = sampledErrorRate(10_000, 0.005, 0.1, 'tail');
    expect([r.kept, r.keptErrors]).toEqual([1045, 50]);
    expect(r.rate * 100).toBeCloseTo(4.78, 2);
  });
  it('head 샘플링은 비율이 그대로다', () => {
    expect(sampledErrorRate(10_000, 0.005, 0.1, 'head').rate).toBeCloseTo(0.005);
  });
});

describe('rereadHitRatio', () => {
  it('한 번 읽으면 50%, 4번 읽으면 87.5%이고 디스크 쪽 읽기는 2번 그대로다', () => {
    expect(rereadHitRatio(1).ratio).toBe(0.5);
    expect(rereadHitRatio(4)).toEqual({ logical: 16, physical: 2, ratio: 0.875 });
  });
});

describe('cfsThrottle', () => {
  it('한도 1코어에 스레드 4개가 50ms씩 일하면 25ms 만에 몫을 다 써서 125ms 걸린다', () => {
    const r = cfsThrottle(1, 4, 50);
    expect(r.wallMs).toBe(125);
    expect(r.throttledPeriods).toBe(1);
  });
  it('스레드 하나가 200ms 일하면 1코어 한도에서는 멈추지 않는다', () => {
    expect(cfsThrottle(1, 1, 200)).toMatchObject({ wallMs: 200, throttledPeriods: 0 });
  });
  it('0.5코어 한도면 주기마다 50ms만 일해서 350ms 걸린다', () => {
    expect(cfsThrottle(0.5, 1, 200)).toMatchObject({ wallMs: 350, throttledPeriods: 3 });
  });
});

describe('hpaDesired', () => {
  it('요청 500m에 450m을 쓰면 90%라, 목표 60%에서 파드 4개가 6개가 된다', () => {
    expect(hpaDesired(4, 450, 500, 60, 10)).toEqual({ utilization: 90, desired: 6, reason: 'up' });
  });
  it('비율이 0.9~1.1이면 그대로 둔다', () => {
    expect(hpaDesired(4, 320, 500, 60, 10).reason).toBe('tolerance');
  });
  it('요청이 2코어면 800m을 써도 40%라 줄이려 한다', () => {
    expect(hpaDesired(4, 800, 2000, 60, 10)).toEqual({ utilization: 40, desired: 3, reason: 'down' });
  });
  it('최대값에서 멈춘다', () => {
    expect(hpaDesired(4, 900, 500, 60, 5)).toMatchObject({ desired: 5, reason: 'max' });
  });
});

describe('dnsLookupOrder', () => {
  const search = ['shop.svc.cluster.local', 'svc.cluster.local', 'cluster.local'];
  const exists = new Set(['pay.shop.svc.cluster.local', 'pay.billing.svc.cluster.local', 'api.example.com']);
  it('ndots 5에서 바깥 이름은 검색 도메인 셋을 거쳐 4번째에 찾는다', () => {
    expect(dnsLookupOrder('api.example.com', 5, search, exists).map((q) => q.query)).toEqual([
      'api.example.com.shop.svc.cluster.local',
      'api.example.com.svc.cluster.local',
      'api.example.com.cluster.local',
      'api.example.com',
    ]);
  });
  it('끝에 점을 붙이면 한 번에 찾는다', () => {
    expect(dnsLookupOrder('api.example.com.', 5, search, exists)).toEqual([{ query: 'api.example.com', found: true }]);
  });
  it('점이 ndots 이상이면 이름 그대로부터 묻는다', () => {
    expect(dnsLookupOrder('pay.billing', 1, search, exists).map((q) => q.found)).toEqual([false, false, true]);
    expect(dnsLookupOrder('api.example.com', 2, search, exists)).toHaveLength(1);
  });
});

describe('assignPartitions', () => {
  it('파티션 4개를 컨슈머 6개에 나누면 2개는 논다', () => {
    expect(assignPartitions(4, 6).filter((a) => a.length === 0)).toHaveLength(2);
  });
});

describe('murmur2·partitionForKey', () => {
  it('Kafka UtilsTest의 값과 같다', () => {
    const cases: [string, number][] = [
      ['21', -973932308],
      ['foobar', -790332482],
      ['a-little-bit-long-string', -985981536],
      ['a-little-bit-longer-string', -1486304829],
      ['lkjh234lh9fiuh90y23oiuhsafujhadof229phr9h19h89h8', -58897971],
      ['abc', 479470107],
    ];
    for (const [s, h] of cases) expect(murmur2(new TextEncoder().encode(s))).toBe(h);
  });
  it('같은 키는 늘 같은 파티션이고, 범위 안이다', () => {
    expect(partitionForKey('user-1', 4)).toBe(partitionForKey('user-1', 4));
    expect(partitionForKey('user-1', 4)).toBeGreaterThanOrEqual(0);
    expect(partitionForKey('user-1', 4)).toBeLessThan(4);
  });
});

describe('lagOutlook', () => {
  it('lag 60,000건을 초당 400건으로 처리하면 150초를 기다리고, 500건씩 들어오면 따라잡지 못한다', () => {
    expect(lagOutlook(60_000, 500, 400)).toEqual({ waitSec: 150, drainSec: Infinity });
  });
  it('처리가 100건 빠르면 600초 뒤 0이 된다', () => {
    expect(lagOutlook(60_000, 300, 400).drainSec).toBe(600);
  });
});

describe('tokenBucket', () => {
  it('바구니 100, 초당 20을 채울 때 초당 20번은 늘 받아 준다', () => {
    expect(tokenBucket(100, 20, 20, 10).every((s) => s.rejected === 0)).toBe(true);
  });
  it('초당 50번이면 처음엔 받다가 결국 초당 20번만 받는다', () => {
    const s = tokenBucket(100, 20, 50, 10);
    expect(s[0]).toEqual({ accepted: 50, rejected: 0 });
    expect(s.at(-1)).toEqual({ accepted: 20, rejected: 30 });
  });
});

describe('counterWrapSeconds', () => {
  it('32비트 카운터는 1Gbps로 가득 오가면 약 34초에 한 바퀴 돈다', () => {
    expect(counterWrapSeconds(32, 1e9, 1)).toBeCloseTo(34.36, 1);
  });
});

describe('subnetRange', () => {
  it('192.168.10.25/24는 192.168.10.0~255, 256개다', () => {
    expect(subnetRange('192.168.10.25', 24)).toEqual({ first: '192.168.10.0', last: '192.168.10.255', size: 256 });
  });
  it('/28이면 16개다', () => {
    expect(subnetRange('192.168.10.25', 28)).toEqual({ first: '192.168.10.16', last: '192.168.10.31', size: 16 });
  });
});

describe('breakerCall', () => {
  const closed: Breaker = { state: 'CLOSED', calls: [], waited: false };
  const run = (b: Breaker, outcomes: boolean[]) => outcomes.reduce((s, f) => breakerCall(s, f).next, b);
  it('9번 모두 실패해도 최소 10번이 차기 전엔 닫혀 있다', () => {
    expect(run(closed, Array(9).fill(true)).state).toBe('CLOSED');
  });
  it('10번 중 7번 실패하면 열리고, 열린 동안 호출은 거절된다', () => {
    const open = run(closed, [true, true, true, true, true, true, true, false, false, false]);
    expect(open.state).toBe('OPEN');
    expect(breakerCall(open, false).rejected).toBe(true);
  });
  it('기다린 뒤 시험 3번이 성공하면 닫힌다', () => {
    const half = breakerCall({ state: 'OPEN', calls: [], waited: true }, false).next;
    expect(half.state).toBe('HALF_OPEN');
    expect(run(half, [false, false]).state).toBe('CLOSED');
  });
});
