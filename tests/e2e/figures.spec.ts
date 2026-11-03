import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('foundations/figures/');
});

test('비유 블록은 비유와 안 맞는 곳을 보여 준다', async ({ page }) => {
  const block = page.locator('[data-block="analogy"]');
  await expect(block.getByRole('heading', { name: '비유하면' })).toBeVisible();
  await expect(block).toContainText('비유가 안 맞는 곳');
  await expect(block).toContainText('테스트용 한계 문장이에요.');
});

test('구조도는 상자·화살표·묶음을 그린다', async ({ page }) => {
  const flow = page.getByRole('img', { name: '서버 둘이 스위치 하나에 꽂힌 구조도' });
  await expect(flow.locator('.flow-node')).toHaveCount(3);
  await expect(flow.locator('.flow-edge')).toHaveCount(2);
  await expect(flow.locator('.flow-edge').first()).toHaveAttribute('marker-end', /url\(#/);
  await expect(flow.locator('.flow-group')).toHaveCount(1);
  await expect(flow).toContainText('1Gbps');
});

test('주고받기는 참여자와 화살표를 순서대로 그린다', async ({ page }) => {
  const seq = page.getByRole('img', { name: '관리 서버가 묻고 장비가 답하는 순서' });
  await expect(seq.locator('.seq-lane')).toHaveCount(2);
  await expect(seq.locator('.seq-arrow')).toHaveCount(2);
});

test('계층도와 비교는 글자를 순서대로 보여 준다', async ({ page }) => {
  await expect(page.locator('[data-layers] .layer-label')).toHaveText(['응용', '전송', '네트워크']);
  await expect(page.locator('[data-compare] [data-compare-head]')).toHaveText(['폴링', 'Trap']);
  await expect(page.locator('[data-compare] [data-compare-row]')).toHaveCount(2);
});

test('시간 띠는 줄마다 구간을 시간에 비례해 놓고, 세로선이 모든 줄을 가로지른다', async ({ page }) => {
  const tl = page.getByRole('img', { name: '앱이 400ms부터 300ms 멈추고 요청이 그동안 기다리는 시간 띠' });
  await expect(tl.locator('.tl-lane-label')).toHaveText(['앱', '요청']);
  await expect(tl.locator('.tl-seg')).toHaveCount(4);
  await expect(tl.locator('.tl-tick')).toHaveText(['0ms', '500ms', '1초']);
  const track = await tl.locator('.tl-track').first().boundingBox();
  const pause = await tl.locator('.tl-seg.tone-warn').boundingBox();
  expect(Math.abs(pause!.x - (track!.x + track!.width * 0.4))).toBeLessThan(2);
  expect(Math.abs(pause!.width - track!.width * 0.3)).toBeLessThan(2);
  const line = await tl.locator('.tl-line').boundingBox();
  const lastTrack = await tl.locator('.tl-track').nth(1).boundingBox();
  expect(Math.abs(line!.x - pause!.x)).toBeLessThan(2);
  expect(line!.y).toBeLessThanOrEqual(track!.y);
  expect(line!.y + line!.height).toBeGreaterThanOrEqual(lastTrack!.y + lastTrack!.height);
});

test('칸 띠는 칸을 같은 폭으로 놓고, 표시와 괄호를 가리킨 칸에 맞춘다', async ({ page }) => {
  const strip = page.getByRole('img', { name: '오프셋 0부터 5까지 중 커밋 위치는 3이고 3부터 5까지 3건이 지연인 칸 띠' });
  await expect(strip.locator('.strip-row-label')).toHaveText('파티션 0');
  await expect(strip.locator('.strip-cell')).toHaveText(['0', '1', '2', '3', '4', '5']);
  await expect(strip.locator('.strip-cell.tone-warn')).toHaveCount(3);
  const cell = await strip.locator('.strip-cell').nth(3).boundingBox();
  const arrow = await strip.locator('.strip-mark-arrow').boundingBox();
  expect(Math.abs(arrow!.x + arrow!.width / 2 - (cell!.x + cell!.width / 2))).toBeLessThan(2);
  const last = await strip.locator('.strip-cell').nth(5).boundingBox();
  const range = await strip.locator('.strip-range-bracket').boundingBox();
  expect(Math.abs(range!.x - cell!.x)).toBeLessThan(2);
  expect(Math.abs(range!.x + range!.width - (last!.x + last!.width))).toBeLessThan(2);
  await expect(strip.locator('.strip-range-text')).toHaveText('지연 3건');
});

test('단계 칸은 단계가 달라도 같은 열의 칸을 위아래로 맞춘다', async ({ page }) => {
  const stages = page.getByRole('img', { name: 'L7의 HTTP 앞에 L4가 TCP를 붙이는 단계 칸' });
  await expect(stages.locator('.stages-name')).toHaveText(['L7', 'L4']);
  await expect(stages.locator('.stages-cell.tone-accent')).toHaveText(['HTTP', 'TCP']);
  await expect(stages.locator('.stages-end')).toHaveText('세그먼트');
  const top = await stages.locator('.stages-cell').nth(0).boundingBox();
  const bottom = await stages.locator('.stages-cell').nth(2).boundingBox();
  expect(Math.abs(top!.x - bottom!.x)).toBeLessThan(1);
  expect(Math.abs(top!.width - bottom!.width)).toBeLessThan(1);
});

test('나란한 기둥은 여러 줄에 걸친 칸을 옆 기둥의 그 줄들과 맞춘다', async ({ page }) => {
  const stacks = page.getByRole('img', { name: '왼쪽 세 층 중 위 두 층에 오른쪽 응용이 걸친 기둥' });
  await expect(stacks.locator('.stacks-title')).toHaveText(['OSI', 'TCP/IP']);
  const left = stacks.locator('.stacks-block').filter({ hasText: /^7/ });
  const second = stacks.locator('.stacks-block').filter({ hasText: '표현' });
  const span = await stacks.locator('.stacks-block.tone-accent').filter({ hasText: '응용' }).boundingBox();
  const a = await left.boundingBox();
  const b = await second.boundingBox();
  expect(Math.abs(span!.y - a!.y)).toBeLessThan(1);
  expect(Math.abs(span!.y + span!.height - (b!.y + b!.height))).toBeLessThan(1);
});

test('점검 순서는 단계 번호, 옆길, 다음 단계로 잇는 선을 보여 준다', async ({ page }) => {
  const triage = page.getByRole('list', { name: '1단계 available이 넉넉하면 알림 기준을, 바닥에 가까우면 2단계 스왑으로 가는 점검 순서' });
  await expect(triage.locator('.triage-label')).toHaveText(['available', '스왑', 'OOM 기록']);
  await expect(triage.locator('.triage-badge')).toHaveText(['1', '2', '3']);
  await expect(triage.locator('.triage-exit').first()).toContainText('넉넉함');
  await expect(triage.locator('.triage-exit.to-step .triage-to')).toHaveText('3단계');
  await expect(triage.locator('.triage-next')).toContainText('바닥 가까움');
  await expect(triage.locator('.triage-when')).toHaveText('급할 때');
  // 1단계만 다음 단계와 이어지고, 갈래 끝인 2단계와 마지막 3단계는 선이 없다
  await expect(triage.locator('.triage-step.has-next')).toHaveCount(1);
});

test('나무는 아이 마디를 부모보다 안쪽에 들여 놓는다', async ({ page }) => {
  const tree = page.getByRole('list', { name: '세션이 실행과 기다림으로, 기다림이 Lock과 IO로 갈리는 나무' });
  await expect(tree.locator('.tree-label')).toHaveText(['세션', '실행', '기다림', 'Lock', 'IO']);
  await expect(tree.locator('.tree-tag')).toHaveText('L1');
  const root = await tree.locator('.tree-node').first().boundingBox();
  const child = await tree.locator('.tree-node').nth(2).boundingBox();
  const grandchild = await tree.locator('.tree-node').nth(3).boundingBox();
  expect(child!.x).toBeGreaterThan(root!.x + 10);
  expect(grandchild!.x).toBeGreaterThan(child!.x + 10);
});

test('포함 상자는 안에 든 칸을 바깥 상자 안에 그린다', async ({ page }) => {
  const nest = page.getByRole('img', { name: '스위치 안에 VLAN 10과 VLAN 20이 있는 상자 그림' });
  const outer = await nest.locator('.nest-box').first().boundingBox();
  const leaf = await nest.locator('.nest-leaf').filter({ hasText: 'PC 2' }).boundingBox();
  expect(leaf!.x).toBeGreaterThan(outer!.x);
  expect(leaf!.x + leaf!.width).toBeLessThan(outer!.x + outer!.width);
  expect(leaf!.y + leaf!.height).toBeLessThan(outer!.y + outer!.height);
});

test('이름 뜯어보기는 뜻 있는 조각에만 번호를 붙여 목록과 짝짓는다', async ({ page }) => {
  const anatomy = page.getByRole('img', { name: 'c7.large를 시리즈 c, 세대 7, 크기 large로 나눠 읽는 그림' });
  await expect(anatomy.locator('.anatomy-text')).toHaveText(['c', '7', '.', 'large']);
  await expect(anatomy.locator('.anatomy-legend li')).toHaveCount(3);
  await expect(anatomy.locator('.anatomy-legend .anatomy-label')).toHaveText(['시리즈', '세대', '크기']);
});

test('막대는 값에 비례한 길이로 그린다', async ({ page }) => {
  const bars = page.getByRole('img', { name: 'N+1 20ms와 조인 5ms를 견준 막대' });
  await expect(bars.locator('.bar-value')).toHaveText(['20ms', '5ms']);
  const long = await bars.locator('.bar-fill').nth(0).boundingBox();
  const short = await bars.locator('.bar-fill').nth(1).boundingBox();
  expect(Math.abs(short!.width * 4 - long!.width)).toBeLessThan(2);
});

test('비율 막대는 칸 폭을 값의 비율로 나누고, 괄호를 값 위치에 맞춘다', async ({ page }) => {
  const parts = page.getByRole('img', { name: '에러 1과 정상 3으로 나눈 비율 막대' });
  await expect(parts.locator('.parts-legend-label')).toHaveText(['에러', '정상']);
  const bar = await parts.locator('.parts-bar').boundingBox();
  const err = await parts.locator('.parts-seg').nth(0).boundingBox();
  const ok = await parts.locator('.parts-seg').nth(1).boundingBox();
  expect(Math.abs(ok!.width - err!.width * 3)).toBeLessThan(4);
  const range = await parts.locator('.parts-range').boundingBox();
  expect(Math.abs(range!.x - (bar!.x + bar!.width * 0.25))).toBeLessThan(2);
});

test('SVG 그림은 이름 붙은 그림이다', async ({ page }) => {
  await expect(page.getByRole('img', { name: '테스트용 SVG 그림' })).toBeVisible();
});

test('다크 모드에서도 그림 글자가 본문 색이다', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  const fill = await page.locator('[data-flow] .flow-label').first().evaluate((el) => getComputedStyle(el).fill);
  expect(fill).toBe('rgb(232, 233, 236)');
});
