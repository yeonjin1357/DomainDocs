import { describe, expect, it } from 'vitest';
import { littlesLaw, maxSeries, retryFanout, samplesInWindow } from '../../src/lib/demo-models';

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
