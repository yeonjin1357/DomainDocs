import { expect, test, type Locator, type Page } from '@playwright/test';
import { waitForIsland } from './helpers';

test.describe('백분위수 데모', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('foundations/demos/');
    await waitForIsland(page, 'PercentileDemo');
  });

  test('처음에는 느린 요청이 없고 p99는 160ms다', async ({ page }) => {
    const demo = page.locator('[data-demo="percentile"]');
    await expect(demo.locator('[data-slow-count]')).toHaveText('0개');
    await expect(demo.locator('[data-stat="mean"] .demo-stat-value')).toHaveText('130ms');
    await expect(demo.locator('[data-stat="p99"] .demo-stat-value')).toHaveText('160ms');
    await expect(demo.locator('.dot')).toHaveCount(100);
    await expect(demo.locator('.dot.is-p99')).toHaveCount(1);
  });

  test('키보드로 느린 요청을 늘리면 2개째에 p99가 3초로 튄다', async ({ page }) => {
    const demo = page.locator('[data-demo="percentile"]');
    const p99 = demo.locator('[data-stat="p99"] .demo-stat-value');
    await demo.getByRole('slider', { name: '느린 요청 수' }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(demo.locator('[data-slow-count]')).toHaveText('1개');
    await expect(p99).toHaveText('160ms');
    await expect(demo.locator('[data-demo-message]')).toContainText('p99는 아직 그대로예요');
    await page.keyboard.press('ArrowRight');
    await expect(p99).toHaveText('3,000ms');
    await expect(demo.locator('[data-stat="mean"] .demo-stat-value')).toHaveText('187ms');
    await expect(demo.locator('.dot.is-slow')).toHaveCount(2);
    await expect(demo.locator('.dot.is-p99.is-slow')).toHaveCount(1);
  });
});

test.describe('다운샘플링 데모', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('foundations/demos/');
    await waitForIsland(page, 'DownsamplingDemo');
  });

  test('원본(10초)에서는 피크 95%가 보인다', async ({ page }) => {
    const demo = page.locator('[data-demo="downsampling"]');
    await expect(demo.locator('[data-stat="visible-peak"] .demo-stat-value')).toHaveText('95%');
    await expect(demo.locator('[data-point-count]')).toContainText('점 360개');
  });

  test('한 점을 5분으로 넓히면 평균에 피크가 묻히고, 최댓값으로 바꾸면 돌아온다', async ({ page }) => {
    const demo = page.locator('[data-demo="downsampling"]');
    const peak = demo.locator('[data-stat="visible-peak"] .demo-stat-value');
    // '5분'은 '15분'에도 들어 있어서 정확히 일치하는 라벨만 고른다.
    await demo.locator('label', { hasText: /^5분$/ }).click();
    await expect(demo.getByRole('radio', { name: '5분', exact: true })).toBeChecked();
    await expect(peak).toHaveText('45%');
    await expect(demo.locator('[data-point-count]')).toContainText('점 12개');
    await expect(demo.locator('[data-demo-message]')).toContainText('45%로 묻혔어요');
    await demo.locator('label', { hasText: /^최댓값$/ }).click();
    await expect(peak).toHaveText('95%');
    await expect(demo.locator('[data-demo-message]')).toContainText('5분 내내 높았던 것처럼');
  });

  test('키보드 화살표로 해상도를 바꿀 수 있다', async ({ page }) => {
    const demo = page.locator('[data-demo="downsampling"]');
    await demo.getByRole('radio', { name: '10초', exact: true }).focus();
    await page.keyboard.press('ArrowRight');
    await expect(demo.getByRole('radio', { name: '1분', exact: true })).toBeChecked();
    await expect(demo.locator('[data-stat="visible-peak"] .demo-stat-value')).toHaveText('67%');
  });
});

test.describe('리틀의 법칙 데모', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('foundations/demos/');
    await waitForIsland(page, 'LittlesLawDemo');
  });

  test('초당 200건을 0.5초씩이면 100건이 처리 중이고, 1.5초로 늘리면 처리량이 133건으로 꺾인다', async ({ page }) => {
    const demo = page.locator('[data-demo="littles-law"]');
    await expect(demo.locator('[data-stat="needed"] .demo-stat-value')).toHaveText('100건');
    await expect(demo.locator('[data-stat="served"] .demo-stat-value')).toHaveText('초당 200건');
    await demo.getByRole('slider', { name: '응답시간' }).focus();
    for (let i = 0; i < 10; i++) await page.keyboard.press('ArrowRight');
    await expect(demo.locator('[data-response]')).toHaveText('1.5초');
    await expect(demo.locator('[data-stat="needed"] .demo-stat-value')).toHaveText('300건');
    await expect(demo.locator('[data-stat="served"] .demo-stat-value')).toHaveText('초당 133건');
    await expect(demo.locator('[data-demo-message]')).toContainText('줄을 서요');
  });
});

test.describe('재시도 곱셈 데모', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('foundations/demos/');
    await waitForIsland(page, 'RetryFanoutDemo');
  });

  test('세 계층이 4번씩 보내면 DB는 64번, 다섯 계층이 3번씩이면 243번 받는다', async ({ page }) => {
    const demo = page.locator('[data-demo="retry-fanout"]');
    const bottom = demo.locator('[data-stat="bottom"] .demo-stat-value');
    await expect(bottom).toHaveText('64번');
    await expect(demo.locator('.demo-bars li')).toHaveCount(4);
    await demo.locator('label', { hasText: /^5계층$/ }).click();
    await demo.locator('label', { hasText: /^3번$/ }).click();
    await expect(bottom).toHaveText('243번');
    await expect(demo.locator('.demo-bars li')).toHaveCount(6);
    await expect(demo.locator('[data-stat="single"] .demo-stat-value')).toHaveText('3번');
  });
});

test.describe('rate 구간 데모', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('foundations/demos/');
    await waitForIsland(page, 'RateWindowDemo');
  });

  test('15초 수집에 [15s]면 비고, [1m]이면 나오며, 수집이 빠지면 샘플이 하나 준다', async ({ page }) => {
    const demo = page.locator('[data-demo="rate-window"]');
    const samples = demo.locator('[data-stat="samples"] .demo-stat-value');
    const rate = demo.locator('[data-stat="rate"] .demo-stat-value');
    await expect(samples).toHaveText('1개');
    await expect(rate).toHaveText('비어요');
    await demo.locator('label', { hasText: /^\[1m\]$/ }).click();
    await expect(samples).toHaveText('4개');
    await expect(rate).toHaveText('나와요');
    await expect(demo.locator('.demo-sample.is-in')).toHaveCount(4);
    await demo.locator('label', { hasText: '바로 앞 수집 한 번 실패' }).click();
    await expect(samples).toHaveText('3개');
    await demo.locator('label', { hasText: /^\[30s\]$/ }).click();
    await expect(rate).toHaveText('비어요');
  });
});

test.describe('카디널리티 데모', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('foundations/demos/');
    await waitForIsland(page, 'CardinalityDemo');
  });

  test('method·status·route는 10,000개, instance를 더하면 500,000개, user_id까지 붙이면 50억 개다', async ({ page }) => {
    const demo = page.locator('[data-demo="cardinality"]');
    const series = demo.locator('[data-stat="series"] .demo-stat-value');
    await expect(series).toHaveText('10,000개');
    await demo.locator('label', { hasText: /^instance/ }).click();
    await expect(series).toHaveText('500,000개');
    await demo.locator('label', { hasText: /^user_id/ }).click();
    await expect(series).toHaveText('5,000,000,000개');
    await expect(demo.locator('[data-demo-message]')).toContainText('user_id는');
  });
});

/** 데모 페이지를 열고 그 데모가 hydrate될 때까지 기다린 뒤, 데모 영역을 돌려준다. */
async function openDemo(page: Page, component: string, name: string) {
  await page.goto('foundations/demos/');
  await waitForIsland(page, component);
  return page.locator(`[data-demo="${name}"]`);
}
const stat = (demo: Locator, name: string) => demo.locator(`[data-stat="${name}"] .demo-stat-value`);
const pick = (demo: Locator, text: string | RegExp) => demo.locator('label', { hasText: text }).click();

test('SLO 데모: 99.9%에 에러율 1%면 3일, 100%면 43.2분 만에 버짓을 다 쓴다', async ({ page }) => {
  const demo = await openDemo(page, 'SloBudgetDemo', 'slo-budget');
  await expect(stat(demo, 'budget')).toHaveText('43.2분');
  await expect(stat(demo, 'burn')).toHaveText('10');
  await expect(stat(demo, 'exhaust')).toHaveText('3일');
  await pick(demo, /^100%$/);
  await expect(stat(demo, 'exhaust')).toHaveText('43.2분');
});

test('히스토그램 데모: 0.9초 경계를 더하면 추정이 0.75초에서 0.93초로 실제에 가까워진다', async ({ page }) => {
  const demo = await openDemo(page, 'HistogramQuantileDemo', 'histogram-quantile');
  await expect(stat(demo, 'estimate')).toHaveText('0.75초');
  await expect(stat(demo, 'actual')).toHaveText('0.92초');
  await pick(demo, /^0\.9초$/);
  await expect(stat(demo, 'estimate')).toHaveText('0.93초');
});

test('수집 주기 데모: 15초마다 0초에 시작하면 3초 스파이크를 놓치고, 6초 미루면 잡는다', async ({ page }) => {
  const demo = await openDemo(page, 'ScrapeSpikeDemo', 'scrape-spike');
  await expect(stat(demo, 'recorded')).toHaveText('40%');
  await expect(stat(demo, 'chance')).toHaveText('20%');
  await demo.getByRole('slider', { name: '첫 수집 시각' }).focus();
  for (let i = 0; i < 6; i++) await page.keyboard.press('ArrowRight');
  await expect(stat(demo, 'recorded')).toHaveText('100%');
});

test('Apdex 데모: T 0.5초면 0.85, T 4초면 불만이 없다', async ({ page }) => {
  const demo = await openDemo(page, 'ApdexDemo', 'apdex');
  await expect(demo.locator('[data-score]')).toHaveText('0.85 [0.5]');
  await pick(demo, /^4초$/);
  await expect(stat(demo, 'frustrated')).toHaveText('0건');
});

test('샘플링 데모: 에러를 모두 남기면 4.8%로 보이고, head로 바꾸면 실제와 같다', async ({ page }) => {
  const demo = await openDemo(page, 'TailSamplingDemo', 'tail-sampling');
  await expect(stat(demo, 'kept')).toHaveText('1,045건');
  await expect(stat(demo, 'traced')).toHaveText('4.8%');
  await pick(demo, 'head(확률로)');
  await expect(stat(demo, 'traced')).toHaveText('0.5%');
});

test('버퍼 캐시 데모: 같은 블록을 4번 읽으면 적중률이 87.5%로 오르고 디스크 쪽 읽기는 그대로다', async ({ page }) => {
  const demo = await openDemo(page, 'CacheRereadDemo', 'cache-reread');
  await expect(stat(demo, 'ratio')).toHaveText('50%');
  await demo.getByRole('slider', { name: '같은 블록을 읽는 횟수' }).focus();
  for (let i = 0; i < 3; i++) await page.keyboard.press('ArrowRight');
  await expect(stat(demo, 'ratio')).toHaveText('87.5%');
  await expect(stat(demo, 'physical')).toHaveText('2번');
});

test('CPU 한도 데모: 1코어에 스레드 4개면 125ms, 스레드 1개면 멈추지 않는다', async ({ page }) => {
  const demo = await openDemo(page, 'CpuThrottleDemo', 'cpu-throttle');
  await expect(stat(demo, 'wall')).toHaveText('125ms');
  await expect(stat(demo, 'unlimited')).toHaveText('50ms');
  await pick(demo, /^1개$/);
  await expect(stat(demo, 'wall')).toHaveText('200ms');
  await expect(stat(demo, 'throttled')).toHaveText('0번');
});

test('HPA 데모: 요청 500m에 450m이면 6개, 요청을 2코어로 키우면 2개로 줄이려 한다', async ({ page }) => {
  const demo = await openDemo(page, 'HpaDemo', 'hpa');
  await expect(stat(demo, 'utilization')).toHaveText('90%');
  await expect(stat(demo, 'desired')).toHaveText('6개');
  await pick(demo, /^2코어$/);
  await expect(stat(demo, 'desired')).toHaveText('2개');
  await expect(demo.locator('[data-demo-message]')).toContainText('5분');
});

test('DNS 데모: ndots 5에서 바깥 이름은 4번 묻고, 끝에 점을 붙이면 1번이다', async ({ page }) => {
  const demo = await openDemo(page, 'DnsSearchDemo', 'dns-search');
  await expect(stat(demo, 'queries')).toHaveText('4번');
  await expect(stat(demo, 'with-aaaa')).toHaveText('8번');
  await pick(demo, /^api\.example\.com\.$/);
  await expect(stat(demo, 'queries')).toHaveText('1번');
});

test('컨슈머 그룹 데모: 파티션 4개에 컨슈머 6개면 2개가 논다', async ({ page }) => {
  const demo = await openDemo(page, 'ConsumerGroupDemo', 'consumer-group');
  await expect(stat(demo, 'idle')).toHaveText('0개');
  await demo.getByRole('slider', { name: '컨슈머 수' }).focus();
  for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowRight');
  await expect(stat(demo, 'idle')).toHaveText('2개');
});

test('파티션 키 데모: 파티션을 8개로 늘리면 키 5개의 자리가 바뀐다', async ({ page }) => {
  const demo = await openDemo(page, 'PartitionKeyDemo', 'partition-key');
  await expect(stat(demo, 'moved')).toHaveText('0/8개');
  await pick(demo, /^8개$/);
  await expect(stat(demo, 'moved')).toHaveText('5/8개');
});

test('lag 데모: 초당 500건이 들어오고 400건을 처리하면 줄지 않고, 600건을 처리하면 10분 뒤 0이 된다', async ({ page }) => {
  const demo = await openDemo(page, 'LagDrainDemo', 'lag-drain');
  await expect(stat(demo, 'wait')).toHaveText('2.5분');
  await expect(stat(demo, 'drain')).toHaveText('줄지 않아요');
  await demo.getByRole('slider', { name: '처리 속도' }).focus();
  for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowRight');
  await expect(stat(demo, 'drain')).toHaveText('10분');
});

test('토큰 바구니 데모: 초당 50번이면 220번이 거절되고, 20번이면 하나도 거절되지 않는다', async ({ page }) => {
  const demo = await openDemo(page, 'TokenBucketDemo', 'token-bucket');
  await expect(stat(demo, 'accepted')).toHaveText('280번');
  await expect(stat(demo, 'rejected')).toHaveText('220번');
  await pick(demo, /^20번$/);
  await expect(stat(demo, 'rejected')).toHaveText('0번');
});

test('카운터 데모: 1Gbps를 가득 쓰면 32비트는 34.4초에 돌고, 100Mbps면 5.7분이다', async ({ page }) => {
  const demo = await openDemo(page, 'CounterWrapDemo', 'counter-wrap');
  await expect(stat(demo, 'wrap32')).toHaveText('34.4초');
  await expect(stat(demo, 'wrap64')).toHaveText('4,680년');
  await pick(demo, /^100Mbps$/);
  await expect(stat(demo, 'wrap32')).toHaveText('5.7분');
});

test('서브넷 데모: /24는 256개, /28은 16개다', async ({ page }) => {
  const demo = await openDemo(page, 'SubnetDemo', 'subnet');
  await expect(stat(demo, 'range')).toHaveText('192.168.10.0 ~ 192.168.10.255');
  await expect(stat(demo, 'size')).toHaveText('256개');
  await expect(demo.locator('.demo-chip.is-bit.is-accent')).toHaveCount(24);
  await demo.getByRole('slider', { name: '접두사 길이' }).focus();
  for (let i = 0; i < 4; i++) await page.keyboard.press('ArrowRight');
  await expect(stat(demo, 'size')).toHaveText('16개');
});

test('서킷 브레이커 데모: 9번 실패해도 닫혀 있고, 10번째에 열리며, 기다린 뒤 시험 3번이 성공하면 닫힌다', async ({ page }) => {
  const demo = await openDemo(page, 'CircuitBreakerDemo', 'circuit-breaker');
  const fail = demo.getByRole('button', { name: '실패 호출' });
  const ok = demo.getByRole('button', { name: '성공 호출' });
  for (let i = 0; i < 9; i++) await fail.click();
  await expect(stat(demo, 'state')).toHaveText('닫힘');
  await fail.click();
  await expect(stat(demo, 'state')).toHaveText('열림');
  await ok.click();
  await expect(stat(demo, 'rejected')).toHaveText('1번');
  await demo.getByRole('button', { name: '기다리는 시간 지나기' }).click();
  await ok.click();
  await expect(stat(demo, 'state')).toHaveText('반열림');
  await ok.click();
  await ok.click();
  await expect(stat(demo, 'state')).toHaveText('닫힘');
});
