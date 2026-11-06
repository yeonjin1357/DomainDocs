// 모니터링 기초 글의 SVG 그림. 실행: node scripts/figures/foundations.mjs [이름 접두어...]
import * as g from './lib.mjs';

const { text, tag, line, arrow, zone, badge, packet, table, rect, bubble, ladder, xmark, plot } = g;
const D = 'foundations';
const figs = {};
const label = (x, y, s, tone = 'sub', weight = 600) => text(x, y, s, { size: 13, weight, tone, anchor: 'middle' });
const t13 = (x, y, s, o = {}) => text(x, y, s, { size: 13, ...o });

// ── overview ──

// 숫자가 화면에 오기까지: 계측 → 수집 → 저장 → 질의 → 화면과 알림
figs['ov-pipeline'] = () => {
  const o = [];
  const rows = [
    ['계측', '카운터·게이지·히스토그램으로 세요', (x, y) => g.server(x, y)],
    ['수집', '정해진 간격마다 가져가거나 받아요', (x, y) => g.server(x, y, { tone: 'accent' })],
    ['저장', '이름·레이블별 시계열에 쌓아요', (x, y) => g.db(x, y)],
    ['질의', 'rate, 백분위수, 구간 묶기로 계산해요', (x, y) => [rect(x - 20, y - 13, 40, 26, { rx: 6, fill: 'accentWeak', stroke: 'accent', sw: 1.5 }), text(x, y + 5, 'rate', { size: 13, weight: 700, tone: 'accent', anchor: 'middle', mono: true })].join('\n')],
    ['화면과 알림', '그래프로 그리고, 조건을 넘으면 알려요', (x, y) => [g.panel(x - 2, y, { w: 44, h: 34 }), g.bell(x + 22, y + 6, { tone: 'warn' })].join('\n')],
  ];
  const Y = (i) => 30 + i * 66;
  for (let i = 0; i < rows.length - 1; i++) o.push(arrow([[56, Y(i) + 22], [56, Y(i + 1) - 22]], { tone: 'weak', sw: 2, size: 7 }));
  rows.forEach(([name, note, icon], i) => {
    o.push(badge(14, Y(i), i + 1, { tone: i === 4 ? 'accent' : 'sub' }));
    o.push(icon(56, Y(i)));
    o.push(text(100, Y(i) - 3, name, { size: 14, weight: 700 }));
    o.push(t13(100, Y(i) + 16, note, { tone: 'sub' }));
  });
  return [300, 312, o];
};

// ── percentiles ──

// 요청 100개: 98개는 0.13초, 2개는 3초. 평균 0.187초에는 아무도 없어요
figs['pct-mean-nobody'] = () => {
  const o = [];
  for (let i = 0; i < 100; i++) {
    const c = i % 20;
    const r = Math.floor(i / 20);
    const slow = i >= 98;
    o.push(rect(14 + c * 13.6, 8 + r * 13.6, 11, 11, { rx: 2.5, fill: slow ? 'warn' : 'accentWeak', stroke: slow ? 'none' : 'accent', sw: 1 }));
  }
  o.push(t13(14, 98, '요청 100개', { weight: 700 }));
  o.push(t13(286, 98, '느린 2개', { weight: 700, tone: 'warn', anchor: 'end' }));
  // 끊긴 눈금자
  const Y = 168;
  const left = (v) => 24 + (v / 0.25) * 150;
  const right = (v) => 236 + (v - 3) * 120;
  o.push(line(24, Y, 184, Y, { tone: 'weak', sw: 2, cap: 'butt' }));
  o.push(g.path(`M184 ${Y} l4 -6 l4 12 l4 -6`, { stroke: 'weak', sw: 2 }));
  o.push(line(196, Y, 280, Y, { tone: 'weak', sw: 2, cap: 'butt' }));
  // 0.13초 98개 더미
  o.push(rect(left(0.13) - 9, Y - 46, 18, 46, { rx: 3, fill: 'accent', stroke: 'none' }));
  o.push(label(left(0.13), Y - 54, '98개', 'accent', 700));
  o.push(label(left(0.13), Y + 20, '0.13초', 'text', 600));
  // 3초 2개
  o.push(rect(right(3) - 9, Y - 6, 18, 6, { rx: 2, fill: 'warn', stroke: 'none' }));
  o.push(label(right(3), Y - 14, '2개', 'warn', 700));
  o.push(label(right(3), Y + 20, '3초', 'text', 600));
  // 평균
  const m = left(0.187);
  o.push(line(m, Y - 72, m, Y + 4, { tone: 'sub', sw: 1.6, dash: '4 3' }));
  o.push(t13(m + 6, Y - 62, '평균 0.187초', { weight: 700 }));
  o.push(t13(m + 6, Y - 44, '여기엔 0개', { tone: 'sub' }));
  return [300, 196, o];
};

// 요청 100개를 빠른 순서로 줄 세우면 99번째가 p99
figs['pct-rank'] = () => {
  const o = [];
  const p = plot(48, 30, 240, 150, { x0: 0.5, x1: 100.5, y0: 0, y1: 1.5 });
  o.push(p.yticks([[0, '0'], [0.5, '0.5초'], [1.2, ''], [1.5, '']]));
  // 1~98: 천천히 오르다 끝에서 가팔라지는 값
  const val = (i) => (i <= 98 ? 0.06 + 0.32 * Math.pow(i / 98, 2.2) + 0.25 * Math.pow(i / 98, 12) : i === 99 ? 1.2 : 1.5);
  for (let i = 1; i <= 100; i++) {
    const tone = i === 99 ? 'accent' : i === 100 ? 'warn' : i === 50 ? 'text' : 'weak';
    o.push(p.bar(i, val(i), i === 99 || i === 100 || i === 50 ? 2.2 : 1.7, { tone, rx: 0.5 }));
  }
  o.push(g.path(`M${p.sx(100) - 4} ${p.sy(1.5) + 1} l4 -5 l4 5`, { stroke: 'card', sw: 2 }));
  o.push(p.hline(1.2, { tone: 'accent', dash: '4 3', to: 99 }));
  o.push(p.base());
  o.push(text(p.sx(99) - 6, p.sy(1.2) - 8, 'p99 = 1.2초', { size: 13, weight: 700, tone: 'accent', anchor: 'end' }));
  o.push(text(p.sx(50), p.sy(val(50)) - 10, 'p50', { size: 13, weight: 700, tone: 'sub', anchor: 'middle' }));
  o.push(text(p.sx(100), p.sy(1.5) - 8, '100번', { size: 13, weight: 600, tone: 'warn', anchor: 'end' }));
  // 아래 괄호
  const by = 198;
  o.push(g.path(`M${p.sx(1) - 1} ${by} v6 H${p.sx(99) + 1} v-6`, { stroke: 'accent', sw: 1.6 }));
  o.push(label(p.sx(50), by + 22, '1~99번 · 요청의 99%', 'accent', 700));
  o.push(g.path(`M${p.sx(100) - 2} ${by} v6 H${p.sx(100) + 2} v-6`, { stroke: 'warn', sw: 1.6 }));
  o.push(text(p.sx(100) + 6, by + 22, '1%', { size: 13, weight: 700, tone: 'warn', anchor: 'end' }));
  o.push(t13(48, 16, '빠른 순서로 줄 세운 요청 100개', { weight: 600, tone: 'sub' }));
  return [300, 228, o];
};

// ── units-and-notation ──

// 디스크(옆에서 본 원통)
const disk = (cx, cy) =>
  [
    rect(cx - 30, cy - 20, 60, 40, { rx: 6, fill: 'card', stroke: 'sub', sw: 1.8 }),
    g.circle(cx - 4, cy, 13, { fill: 'line', stroke: 'sub', sw: 1.6 }),
    g.circle(cx - 4, cy, 3, { fill: 'sub' }),
    line(cx + 8, cy + 6, cx + 22, cy - 12, { tone: 'sub', sw: 2 }),
  ].join('\n');

// 1000씩 세는 단위와 1024씩 세는 단위
figs['unit-kib'] = () => {
  const o = [];
  o.push(disk(50, 46));
  o.push(tag(50, 86, '상자에 1TB', { tone: 'plain' }));
  o.push(arrow([[86, 34], [128, 26]], { tone: 'weak', sw: 2, size: 7 }));
  o.push(arrow([[86, 58], [128, 70]], { tone: 'weak', sw: 2, size: 7 }));
  o.push(t13(136, 24, '1000으로 나누면', { tone: 'sub' }));
  o.push(text(136, 44, '1,000GB', { size: 16, weight: 700 }));
  o.push(t13(206, 44, 'df -H', { tone: 'sub', mono: true }));
  o.push(t13(136, 70, '1024로 나누면', { tone: 'sub' }));
  o.push(text(136, 90, '약 931GiB', { size: 16, weight: 700, tone: 'accent' }));
  o.push(t13(136, 108, 'df -h는 이걸 G라고 적어요', { tone: 'warn', weight: 600 }));
  o.push(line(8, 124, 292, 124, { tone: 'line', sw: 1.5 }));
  o.push(t13(8, 146, '단계가 커질수록 벌어지는 차이', { weight: 700, tone: 'sub' }));
  const rows = [['K와 Ki', 2.4], ['M과 Mi', 4.9], ['G와 Gi', 7.4], ['T와 Ti', 10.0]];
  rows.forEach(([n, pct], i) => {
    const y = 168 + i * 26;
    o.push(t13(8, y + 5, n, { weight: 600 }));
    o.push(rect(70, y - 6, (pct / 10) * 170, 14, { rx: 4, fill: 'accent', stroke: 'none' }));
    o.push(t13(70 + (pct / 10) * 170 + 8, y + 5, `${pct.toFixed(1)}%`, { weight: 700, tone: 'accent' }));
  });
  return [300, 260, o];
};

// 비트와 바이트: 8비트가 1바이트
figs['unit-bits'] = () => {
  const o = [];
  const bits = '0110100111001010';
  for (let i = 0; i < 16; i++) {
    const x = 10 + i * 17.5 + (i >= 8 ? 4 : 0);
    o.push(rect(x, 10, 15, 22, { rx: 3, fill: i < 8 ? 'accentWeak' : 'card', stroke: i < 8 ? 'accent' : 'weak', sw: 1.2 }));
    o.push(text(x + 7.5, 26, bits[i], { size: 13, weight: 700, tone: i < 8 ? 'accent' : 'sub', anchor: 'middle', mono: true }));
  }
  o.push(g.path('M10 40 v6 H149 v-6', { stroke: 'accent', sw: 1.6 }));
  o.push(label(80, 64, '8비트 = 1바이트', 'accent', 700));
  const row = (y, a, an, op, b, bn, tone) => {
    o.push(rect(6, y - 18, 108, 46, { rx: 10, fill: 'card', stroke: 'line' }));
    o.push(label(60, y + 2, a, 'text', 700));
    o.push(label(60, y + 20, an, 'sub', 400));
    o.push(arrow([[118, y + 4], [178, y + 4]], { tone, sw: 2.4, size: 8 }));
    o.push(label(148, y - 6, op, tone, 700));
    o.push(rect(186, y - 18, 108, 46, { rx: 10, fill: tone === 'accent' ? 'accentWeak' : 'card', stroke: tone === 'accent' ? 'none' : 'line' }));
    o.push(label(240, y + 2, b, tone === 'accent' ? 'accent' : 'text', 700));
    o.push(label(240, y + 20, bn, 'sub', 400));
  };
  row(110, '1Gbps 회선', '비트로 세요', '÷ 8', '초당 125MB', '바이트로 세요', 'sub');
  row(178, '바이트 카운터', '바이트로 세요', '× 8', '비트 값', '회선과 견줘요', 'accent');
  return [300, 212, o];
};

// 코어 4개를 다 쓸 때: 프로세스 기준 400%, 서버 전체 기준 100%
figs['unit-percent'] = () => {
  const o = [];
  for (let i = 0; i < 4; i++) {
    const x = 22 + i * 66;
    o.push(rect(x, 28, 50, 70, { rx: 6, fill: 'accent', stroke: 'none' }));
    o.push(label(x + 25, 68, '100%', 'card', 700));
    o.push(label(x + 25, 116, `코어 ${i + 1}`, 'sub', 600));
  }
  o.push(t13(8, 16, '네 코어가 모두 바쁜 같은 순간', { weight: 600, tone: 'sub' }));
  o.push(g.path('M22 128 v6 H270 v-6', { stroke: 'accent', sw: 1.6 }));
  o.push(text(146, 154, '프로세스 기준: 더해서 400%', { size: 14, weight: 700, tone: 'accent', anchor: 'middle' }));
  o.push(t13(146, 172, '코어 하나를 100%로 세요', { tone: 'sub', anchor: 'middle' }));
  o.push(rect(22, 192, 248, 22, { rx: 6, fill: 'text', stroke: 'none' }));
  o.push(label(146, 208, '100%', 'card', 700));
  o.push(text(146, 238, '서버 전체 기준: 100%', { size: 14, weight: 700, anchor: 'middle' }));
  o.push(t13(146, 256, '모든 코어를 합쳐 100%로 세요', { tone: 'sub', anchor: 'middle' }));
  return [300, 264, o];
};

// ── counters-and-rate ──

// rate: 5분 동안 늘어난 양 ÷ 300초
figs['ctr-rate'] = () => {
  const o = [];
  const p = plot(74, 24, 196, 130, { x0: 0, x1: 300, y0: 997000, y1: 1033000 });
  const pts = [[0, 1000000], [60, 1005500], [120, 1012000], [180, 1018000], [240, 1023500], [300, 1030000]];
  o.push(p.yticks([[1000000, '1,000,000'], [1030000, '1,030,000']]));
  o.push(p.line(pts, { tone: 'sub', sw: 2.4 }));
  o.push(line(p.sx(0), p.sy(1000000), p.sx(300), p.sy(1000000), { tone: 'accent', sw: 1.6, dash: '4 3' }));
  o.push(line(p.sx(300), p.sy(1000000), p.sx(300), p.sy(1030000), { tone: 'accent', sw: 1.6, dash: '4 3' }));
  o.push(p.dots([pts[0], pts[5]], { tone: 'accent', r: 4.5 }));
  o.push(t13(p.sx(150), p.sy(1000000) + 20, '300초(5분)', { weight: 700, tone: 'accent', anchor: 'middle' }));
  o.push(t13(p.sx(300) - 8, p.sy(1015000) + 5, '+30,000', { weight: 700, tone: 'accent', anchor: 'end' }));
  o.push(t13(p.sx(0), p.sy(1000000) + 44, '구간 시작', { tone: 'sub', anchor: 'middle' }));
  o.push(t13(p.sx(300), p.sy(1000000) + 44, '구간 끝', { tone: 'sub', anchor: 'middle' }));
  o.push(rect(30, 208, 240, 40, { rx: 10, fill: 'accentWeak', stroke: 'none' }));
  o.push(text(150, 234, 'rate = 30,000 ÷ 300 = 초당 100건', { size: 14, weight: 700, tone: 'accent', anchor: 'middle' }));
  return [300, 254, o];
};

// 재시작한 카운터: 그냥 빼면 −1,030, rate는 +50과 +20을 더해 70
figs['ctr-reset'] = () => {
  const o = [];
  const p = plot(56, 30, 224, 130, { x0: -0.3, x1: 2.3, y0: 0, y1: 1150 });
  o.push(p.yticks([[0, '0'], [1000, '1,000']]));
  o.push(p.base());
  o.push(p.line([[0, 1000], [1, 1050], [1.5, 1050]], { tone: 'sub', sw: 2.4 }));
  o.push(p.line([[1.5, 1050], [1.5, 0]], { tone: 'warn', sw: 2, dash: '4 3' }));
  o.push(p.line([[1.5, 0], [2, 20]], { tone: 'sub', sw: 2.4 }));
  o.push(p.dots([[0, 1000], [1, 1050], [2, 20]], { tone: 'accent', r: 4.5 }));
  o.push(g.circle(p.sx(1.5), p.sy(0), 4.5, { fill: 'card', stroke: 'warn', sw: 1.6 }));
  o.push(label(p.sx(0), p.sy(1000) - 12, '1,000', 'text', 700));
  o.push(label(p.sx(1), p.sy(1050) - 12, '1,050', 'text', 700));
  o.push(text(p.sx(2) + 9, p.sy(20) + 5, '20', { size: 13, weight: 700 }));
  o.push(text(p.sx(1.5) - 6, p.sy(300), '재시작', { size: 13, weight: 700, tone: 'warn', anchor: 'end' }));
  o.push(tag(p.sx(0.5), p.sy(1025) + 28, '+50', { tone: 'soft' }));
  o.push(tag(p.sx(1.75), p.sy(0) - 26, '+20', { tone: 'soft' }));
  o.push(text(150, 208, '그냥 빼면 20 − 1,050 = −1,030', { size: 13, weight: 600, tone: 'warn', anchor: 'middle' }));
  o.push(p.xticks([[0, '1번 수집'], [1, '2번'], [2, '3번']], { dy: 20 }));
  o.push(t13(56, 14, '수집한 카운터 값', { weight: 600, tone: 'sub' }));
  o.push(rect(30, 222, 240, 40, { rx: 10, fill: 'accentWeak', stroke: 'none' }));
  o.push(text(150, 248, 'rate·increase: 50 + 20 = 70', { size: 14, weight: 700, tone: 'accent', anchor: 'middle' }));
  return [300, 268, o];
};


// ── time-series-and-labels ──

// 레이블 조합마다 줄이 따로, 줄마다 값이 시각 순서로 쌓여요
figs['ts-series'] = () => {
  const o = [];
  o.push(t13(8, 18, '지표', { tone: 'sub' }));
  o.push(text(40, 18, 'http_requests_total', { size: 13, weight: 700, mono: true }));
  const X = (s) => 40 + (s / 60) * 240;
  const row = (y, method, vals, tone) => {
    o.push(tag(8, y, `method="${method}"`, { tone: tone === 'accent' ? 'soft' : 'sub', anchor: 'start', weight: 600 }));
    o.push(tag(8 + tag.width(`method="${method}"`, { weight: 600 }) + 6, y, 'status="200"', { tone: tone === 'accent' ? 'soft' : 'sub', anchor: 'start', weight: 600 }));
    o.push(line(X(0), y + 40, X(60), y + 40, { tone: 'line', sw: 2 }));
    vals.forEach((v, i) => {
      o.push(g.circle(X(i * 15), y + 40, 5, { fill: tone, stroke: 'card', sw: 1.5 }));
      o.push(label(X(i * 15), y + 28, String(v), 'text', 700));
    });
  };
  row(46, 'GET', [100, 104, 109, 113, 118], 'accent');
  row(128, 'POST', [20, 21, 21, 23, 24], 'sub');
  [0, 15, 30, 45, 60].forEach((s) => o.push(label(X(s), 214, `${s}초`, 'sub', 400)));
  o.push(t13(292, 116, '줄 1', { tone: 'accent', weight: 700, anchor: 'end' }));
  o.push(t13(292, 198, '줄 2', { tone: 'sub', weight: 700, anchor: 'end' }));
  return [300, 222, o];
};

// 레이블 값의 수를 곱하면 시계열 수의 최대치
figs['ts-multiply'] = () => {
  const o = [];
  const tile = (x, y, name, n, tone = 'plain') => {
    const s = `${name} ${n}`;
    o.push(tag(x, y, s, { tone, anchor: 'start', weight: 600 }));
    return x + tag.width(s, { weight: 600 });
  };
  const times = (x, y) => text(x + 9, y + 5, '×', { size: 15, weight: 700, tone: 'sub', anchor: 'middle' });
  o.push(t13(8, 14, '레이블마다 값의 수', { tone: 'sub', weight: 600 }));
  let x = 8;
  x = tile(x, 36, 'method', '5');
  o.push(times(x, 36));
  x = tile(x + 18, 36, 'status', '10');
  o.push(times(x, 36));
  tile(x + 18, 36, 'route', '200');
  o.push(text(8, 72, '= 최대 10,000개', { size: 16, weight: 700, tone: 'accent' }));
  o.push(t13(150, 72, '서버 한 대', { tone: 'sub' }));
  o.push(times(4, 104));
  tile(26, 104, 'instance', '50');
  o.push(text(8, 144, '= 최대 500,000개', { size: 16, weight: 700, tone: 'accent' }));
  o.push(t13(166, 144, '서버 50대', { tone: 'sub' }));
  o.push(times(4, 182));
  tile(26, 182, '레이블 하나 더', '10', 'warnSoft');
  o.push(text(8, 222, '= 최대 5,000,000개', { size: 16, weight: 700, tone: 'warn' }));
  o.push(line(8, 86, 292, 86, { tone: 'line', sw: 1 }));
  o.push(line(8, 160, 292, 160, { tone: 'line', sw: 1 }));
  return [300, 232, o];
};

// 값이 정해진 레이블과 끝없이 늘어나는 레이블
figs['ts-bounded'] = () => {
  const o = [];
  const panel = (px, title, sub, pills, rising, dest, destTone) => {
    o.push(rect(px, 4, 144, 236, { rx: 12, fill: 'card', stroke: 'none' }));
    o.push(text(px + 12, 26, title, { size: 13, weight: 700 }));
    o.push(t13(px + 12, 44, sub, { tone: 'sub' }));
    let x = px + 10;
    let y = 66;
    pills.forEach((s) => {
      const w = tag.width(s, { size: 13, weight: 600 });
      if (x + w > px + 136) { x = px + 10; y += 26; }
      o.push(tag(x, y, s, { tone: s === '…' ? 'sub' : rising ? 'warnSoft' : 'soft', anchor: 'start', weight: 600 }));
      x += w + 4;
    });
    const p = plot(px + 14, 128, 118, 54, { x0: 0, x1: 10, y0: 0, y1: 10 });
    o.push(p.base());
    o.push(p.line(rising ? [[0, 1], [2, 2.4], [4, 4.2], [6, 6], [8, 8], [10, 9.8]] : [[0, 3], [10, 3]], { tone: rising ? 'warn' : 'accent', sw: 2.6 }));
    o.push(t13(px + 12, 120, '시계열 수', { tone: 'sub' }));
    o.push(t13(px + 132, 200, rising ? '새 값마다 +1' : '3개 그대로', { weight: 700, tone: rising ? 'warn' : 'accent', anchor: 'end' }));
    o.push(tag(px + 72, 224, dest, { tone: destTone }));
  };
  panel(4, '값이 정해진 것', '응답 상태 코드', ['200', '404', '500'], false, '지표 레이블에', 'accent');
  panel(152, '끝없이 늘어나는 것', '사용자 ID, 요청 ID', ['u1', 'u2', 'u3', 'u4', 'u5', '…'], true, '로그·트레이스에', 'plain');
  return [300, 244, o];
};

// ── promql-basics ──

// 질의를 안쪽부터: 고르기 → 구간 → rate → sum by
figs['pq-nesting'] = () => {
  const o = [];
  const boxes = [
    [4, 4, 292, 230, 'sum by (job)', 4, '서비스마다 더해요 → 2줄', 'accent'],
    [16, 40, 268, 182, 'rate( … )', 3, '초당 증가량 → 3줄', 'sub'],
    [28, 76, 244, 134, '[5m]', 2, '5분 치 값을 잡아요', 'sub'],
    [40, 112, 220, 86, '', 1, '시계열 고르기 → 3줄', 'sub'],
  ];
  boxes.forEach(([x, y, w, h, kw, n, note, tone], i) => {
    o.push(rect(x, y, w, h, { rx: 10, fill: i === 3 ? 'accentWeak' : 'card', stroke: i === 0 ? 'accent' : 'weak', sw: 1.5 }));
    o.push(badge(x + 16, y + 17, n, { tone: i === 0 ? 'accent' : 'sub' }));
    let tx = x + 32;
    if (kw) {
      o.push(text(tx, y + 22, kw, { size: 13, weight: 700, mono: true, tone: i === 0 ? 'accent' : 'text' }));
      tx += kw.length * 7.9 + 8;
    }
    o.push(t13(tx, y + 22, note, { tone: 'sub', weight: 600 }));
  });
  o.push(text(56, 160, 'http_requests_total', { size: 13, weight: 700, mono: true }));
  o.push(text(56, 182, '{status=~"5.."}', { size: 13, weight: 700, mono: true, tone: 'accent' }));
  return [300, 238, o];
};

// 나누기: 레이블이 같은 줄끼리 짝, ignoring(status)로 status를 빼면 api 두 줄이 api 한 줄과 짝
figs['pq-match'] = () => {
  const o = [];
  o.push(text(8, 18, '왼쪽 5xx', { size: 13, weight: 700 }));
  o.push(t13(8, 36, 'by (job, status)', { mono: true, tone: 'sub' }));
  o.push(text(196, 18, '오른쪽 전체', { size: 13, weight: 700 }));
  o.push(t13(196, 36, 'by (job)', { mono: true, tone: 'sub' }));
  const left = table(4, 48, [{ t: 'job·status', w: 80 }, { t: '건/초', w: 46, align: 'right' }], [['api·500', '0.2'], ['api·503', '0.3'], ['web·500', '0.05']], { hl: [0, 1], rowH: 26 });
  const right = table(196, 48, [{ t: 'job', w: 50 }, { t: '건/초', w: 50, align: 'right' }], [['api', '20'], ['web', '5']], { hl: [0], rowH: 26 });
  o.push(left.svg, right.svg);
  const ly = (i) => 48 + 24 + i * 26 + 13;
  o.push(arrow([[132, ly(0)], [190, ly(0)]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(arrow([[132, ly(1)], [190, ly(0) + 4]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(arrow([[132, ly(2)], [190, ly(1)]], { tone: 'sub', sw: 2, size: 7 }));
  o.push(t13(150, 168, 'ignoring(status)로 status를 빼고 짝지어요', { weight: 600, tone: 'accent', anchor: 'middle' }));
  o.push(t13(150, 186, 'api 두 줄이 api 한 줄과 짝 → group_left', { tone: 'sub', anchor: 'middle' }));
  const res = table(4, 200, [{ t: '결과', w: 120 }, { t: '5xx 비율', w: 172, align: 'right' }], [['api·500', '0.2 ÷ 20 = 1%'], ['api·503', '0.3 ÷ 20 = 1.5%'], ['web·500', '0.05 ÷ 5 = 1%']], { rowH: 24 });
  o.push(res.svg);
  return [300, 298, o];
};

// ── collection-interval ──

// 게이지: 수집하는 순간의 값만 남아요
figs['ci-gauge-miss'] = () => {
  const o = [];
  const p = plot(44, 26, 236, 120, { x0: 0, x1: 30, y0: 0, y1: 110 });
  o.push(p.yticks([[0, '0'], [40, '40%'], [100, '100%']]));
  o.push(p.base());
  for (const s of [0, 15, 30]) o.push(p.vline(s, { tone: 'accent', dash: '3 3', top: 20 }));

  o.push(p.line([[0, 40], [9, 40], [9.2, 100], [11.8, 100], [12, 40], [30, 40]], { tone: 'warn', sw: 2 }));
  o.push(p.line([[0, 40], [15, 40], [30, 40]], { tone: 'accent', sw: 3 }));
  o.push(p.dots([[0, 40], [15, 40], [30, 40]], { tone: 'accent', r: 5, ring: true }));
  o.push(text(p.sx(10.5), p.sy(100) - 8, '3초 동안 100%', { size: 13, weight: 700, tone: 'warn', anchor: 'middle' }));
  o.push(p.xticks([[0, '0초'], [15, '15초'], [30, '30초']]));
  for (const s of [0, 15, 30]) o.push(t13(p.sx(s), 16, '수집', { tone: 'accent', weight: 600, anchor: s === 0 ? 'start' : s === 30 ? 'end' : 'middle' }));
  o.push(g.circle(56, 186, 4, { fill: 'warn' }));
  o.push(t13(66, 191, '실제 CPU', { tone: 'warn', weight: 600 }));
  o.push(g.circle(150, 186, 4, { fill: 'accent' }));
  o.push(t13(160, 191, '기록에 남은 값 40%', { tone: 'accent', weight: 600 }));
  return [300, 200, o];
};

// 게이지와 카운터: 같은 1분, 같은 3초 스파이크
figs['ci-gauge-counter'] = () => {
  const o = [];
  o.push(t13(8, 16, '실제 CPU 사용률 · 1분', { weight: 700 }));
  const a = plot(44, 26, 236, 56, { x0: 0, x1: 60, y0: 0, y1: 110 });
  const real = [[0, 40], [30, 40], [30.2, 100], [32.8, 100], [33, 40], [60, 40]];
  o.push(a.yticks([[40, '40%'], [100, '100%']]));
  o.push(a.base());

  o.push(a.line(real, { tone: 'warn', sw: 2 }));
  // 게이지
  o.push(line(8, 104, 292, 104, { tone: 'line', sw: 1 }));
  o.push(t13(8, 126, '게이지로 받으면', { weight: 700 }));
  const b = plot(44, 136, 236, 30, { x0: 0, x1: 60, y0: 0, y1: 60 });
  o.push(b.base());
  o.push(b.line([[0, 40], [60, 40]], { tone: 'accent', sw: 2 }));
  o.push(b.dots([[0, 40], [15, 40], [30, 40], [45, 40], [60, 40]], { tone: 'accent', r: 4.5, ring: true }));
  o.push(t13(292, 126, '1분 동안 40% · 스파이크 빠짐', { weight: 600, tone: 'sub', anchor: 'end' }));
  // 카운터
  o.push(line(8, 188, 292, 188, { tone: 'line', sw: 1 }));
  o.push(t13(8, 210, '카운터로 받으면', { weight: 700 }));
  const c = plot(44, 222, 236, 62, { x0: 0, x1: 60, y0: 0, y1: 27 });
  const cum = [[0, 0], [30, 12], [33, 15], [60, 25.8]];
  o.push(c.base());
  o.push(c.line(cum, { tone: 'sub', sw: 2.4 }));
  o.push(c.line([[30, 12], [33, 15]], { tone: 'warn', sw: 3 }));
  o.push(c.dots([[0, 0], [60, 25.8]], { tone: 'accent', r: 4.5, ring: true }));
  o.push(t13(c.sx(0) + 8, c.sy(22), 'CPU가 일한 시간 누적', { tone: 'sub' }));
  o.push(t13(c.sx(60) - 8, c.sy(25.8) + 4, '25.8초', { weight: 700, tone: 'accent', anchor: 'end' }));
  o.push(rect(30, 296, 240, 40, { rx: 10, fill: 'accentWeak', stroke: 'none' }));
  o.push(text(150, 322, '25.8초 ÷ 60초 = 1분 평균 43%', { size: 14, weight: 700, tone: 'accent', anchor: 'middle' }));
  return [300, 342, o];
};

// 넓이(일한 시간)가 같으면 카운터 값도 같아요
figs['ci-same-area'] = () => {
  const o = [];
  const row = (y0, title, pts, tone) => {
    o.push(t13(8, y0 + 4, title, { weight: 700 }));
    const p = plot(44, y0 + 14, 236, 64, { x0: 0, x1: 15, y0: 0, y1: 110 });
    o.push(p.yticks([[0, '0'], [100, '100%']]));
    o.push(p.base());
    o.push(p.area(pts, { fill: 'accentWeak' }));
    o.push(p.line(pts, { tone, sw: 2.2 }));
    o.push(p.vline(0, { tone: 'accent', top: y0 + 10 }));
    o.push(p.vline(15, { tone: 'accent', top: y0 + 10 }));
    o.push(t13(p.sx(4.5), p.sy(18), '일한 시간 7.8초', { weight: 700, tone: 'accent', anchor: 'middle' }));
    return p;
  };
  const p1 = row(8, '12초는 40%, 3초는 100%', [[0, 40], [12, 40], [12, 100], [15, 100]], 'warn');
  o.push(t13(p1.sx(13.5), p1.sy(100) - 6, '100%', { weight: 700, tone: 'warn', anchor: 'middle' }));
  const p2 = row(104, '15초 내내 52%', [[0, 52], [15, 52]], 'sub');
  o.push(p2.xticks([[0, '0초 수집']], { anchor: 'start' }));
  o.push(p2.xticks([[15, '15초 수집']], { anchor: 'end' }));
  o.push(rect(30, 214, 240, 40, { rx: 10, fill: 'accentWeak', stroke: 'none' }));
  o.push(text(150, 240, '카운터로 구하면 둘 다 52%', { size: 14, weight: 700, tone: 'accent', anchor: 'middle' }));
  return [300, 260, o];
};

// ── time-and-timezones ──

// 시간대 없이 찍힌 로그 한 줄이 화면에 뜨기까지
figs['tz-pipeline'] = () => {
  const o = [];
  const rows = [
    ['앱이 써요', '2026-11-05 09:00:00', '시간대 없음', 'warn', (x, y) => g.server(x, y)],
    ['에이전트가 읽어요', '…T09:00:00+09:00', '여기서 시간대를 정해요', 'accent', (x, y) => g.server(x, y, { tone: 'accent' })],
    ['저장소', '1793836800', 'UTC 기준 초', 'text', (x, y) => g.db(x, y)],
  ];
  const Y = (i) => 28 + i * 64;
  for (let i = 0; i < 2; i++) o.push(arrow([[36, Y(i) + 22], [36, Y(i + 1) - 20]], { tone: 'weak', sw: 2, size: 7 }));
  rows.forEach(([name, val, note, tone, icon], i) => {
    o.push(icon(36, Y(i)));
    o.push(t13(70, Y(i) - 8, name, { weight: 700 }));
    o.push(text(70, Y(i) + 12, val, { size: 13, weight: 700, mono: true, tone: tone === 'text' ? 'text' : tone }));
    o.push(t13(292, Y(i) - 8, note, { tone: tone === 'text' ? 'sub' : tone, anchor: 'end', weight: 600 }));
  });
  // 저장소에서 화면 둘로 갈라져요
  o.push(line(36, Y(2) + 20, 36, 200, { tone: 'weak', sw: 2 }));
  o.push(line(36, 200, 222, 200, { tone: 'weak', sw: 2 }));
  o.push(arrow([[80, 200], [80, 216]], { tone: 'weak', sw: 2, size: 7 }));
  o.push(arrow([[222, 200], [222, 216]], { tone: 'weak', sw: 2, size: 7 }));
  const screen = (cx, title, val, tone) => {
    o.push(g.panel(cx, 248, { w: 132, h: 56, points: null }));
    o.push(text(cx, 263, val, { size: 15, weight: 700, tone, anchor: 'middle' }));
    o.push(t13(cx, 294, title, { weight: 700, anchor: 'middle' }));
  };
  screen(80, '한국 브라우저', '11-05 09:00', 'accent');
  screen(222, 'UTC 대시보드', '11-05 00:00', 'warn');
  return [300, 302, o];
};

// ── tsdb-storage ──

// 샘플 하나가 지나는 길: 메모리(head)와 WAL, 2시간마다 블록
figs['tsdb-path'] = () => {
  const o = [];
  o.push(tag(8, 16, '수집한 샘플', { tone: 'accent', anchor: 'start' }));
  o.push(zone(16, 34, 280, 180, '', { fill: 'card', dash: null }));
  o.push(t13(286, 54, 'Prometheus', { weight: 700, anchor: 'end' }));
  o.push(arrow([[32, 26], [32, 84], [50, 84]], { tone: 'accent', sw: 2.2, size: 7 }));
  o.push(arrow([[32, 84], [32, 168], [56, 168]], { tone: 'accent', sw: 2.2, size: 7 }));
  // 메모리
  o.push(g.ram(76, 84));
  o.push(t13(104, 80, '메모리(head)', { weight: 700 }));
  o.push(t13(104, 98, '최근 몇 시간', { tone: 'sub' }));
  o.push(line(44, 124, 290, 124, { tone: 'line', sw: 1.5, dash: '5 4' }));
  o.push(t13(44, 142, '디스크', { tone: 'sub', weight: 600 }));
  // WAL
  o.push(g.doc(76, 172, { lines: 3 }));
  o.push(t13(98, 168, 'WAL', { weight: 700 }));
  o.push(t13(98, 186, '같은 내용의 사본', { tone: 'sub' }));
  // 블록
  for (let i = 0; i < 3; i++) o.push(rect(222 + i * 6, 158 - i * 6, 52, 32, { rx: 4, fill: 'card', stroke: 'sub', sw: 1.6 }));
  o.push(text(248, 179, '2시간', { size: 13, weight: 700, anchor: 'middle' }));
  o.push(t13(254, 206, '블록 파일', { weight: 700, anchor: 'middle' }));
  o.push(arrow([[192, 84], [250, 84], [250, 140]], { tone: 'sub', sw: 2, size: 7 }));
  o.push(t13(244, 112, '2시간마다', { weight: 600, tone: 'sub', anchor: 'end' }));
  // 원격
  o.push(arrow([[76, 192], [76, 238]], { tone: 'weak', sw: 2, size: 7, dash: '4 3' }));
  o.push(g.db(76, 258, { rx: 14 }));
  o.push(t13(100, 254, '원격 저장소(선택)', { weight: 700 }));
  o.push(t13(100, 272, 'WAL을 읽어 보내요', { tone: 'sub' }));
  return [300, 282, o];
};


// ── aggregation-and-downsampling ──

// 10초마다 모은 값 12개를 막대로, 고른 점과 그 점을 이은 선
const pickChart = (o, y0, title, vals, picks, o2 = {}) => {
  o.push(t13(8, y0, title, { weight: 700 }));
  const p = plot(30, y0 + 12, 256, 70, { x0: -0.5, x1: 11.5, y0: 0, y1: 100 });
  o.push(p.base());
  vals.forEach((v, i) => {
    const picked = picks.includes(i);
    const peak = v >= 80;
    o.push(p.bar(i, v, 13, { tone: peak ? 'warn' : picked ? 'accent' : 'line', op: peak && !picked ? 0.35 : undefined }));
  });
  if (o2.line !== false) o.push(p.line(picks.map((i) => [i, vals[i]]), { tone: 'accent', sw: 2, dash: '5 3' }));
  picks.forEach((i) => {
    o.push(g.circle(p.sx(i), p.sy(vals[i]), 5, { fill: vals[i] >= 80 ? 'warn' : 'accent', stroke: 'card', sw: 1.5 }));
    o.push(text(p.sx(i), p.sy(vals[i]) - 10, `${vals[i]}`, { size: 13, weight: 700, tone: vals[i] >= 80 ? 'warn' : 'accent', anchor: 'middle' }));
  });
  return p;
};

// 점 하나만 고르면 짧은 피크가 빠져요
figs['agg-pick'] = () => {
  const o = [];
  const a = [40, 41, 95, 95, 95, 40, 39, 41, 40, 42, 40, 41];
  const b = [40, 41, 40, 42, 95, 95, 95, 40, 39, 41, 40, 41];
  const p1 = pickChart(o, 16, '피크가 점 사이에 들 때', a, [5, 11]);
  o.push(t13(292, 16, '피크가 빠져요', { weight: 700, tone: 'warn', anchor: 'end' }));
  o.push(p1.xticks([[5, '1분'], [11, '2분']]));
  const p2 = pickChart(o, 136, '피크가 점에 걸릴 때', b, [5, 11]);
  o.push(t13(292, 136, '95%가 보여요', { weight: 700, tone: 'accent', anchor: 'end' }));
  o.push(p2.xticks([[5, '1분'], [11, '2분']]));
  return [300, 250, o];
};

// 평균으로 묶으면 같은 30초 피크가 낮아져요
figs['agg-average'] = () => {
  const o = [];
  const rows = [
    ['원본 10초', 95, [[0, 40], [7, 40], [7, 95], [7.5, 95], [7.5, 40], [15, 40]], 'warn'],
    ['1분 평균', 67, [[0, 40], [7, 40], [7, 67], [8, 67], [8, 40], [15, 40]], 'accent'],
    ['5분 평균', 45, [[0, 40], [5, 40], [5, 45], [10, 45], [10, 40], [15, 40]], 'accent'],
    ['15분 평균', 42, [[0, 42], [15, 42]], 'accent'],
  ];
  rows.forEach(([name, peak, pts, tone], i) => {
    const y = 10 + i * 62;
    o.push(t13(8, y + 30, name, { weight: 700 }));
    const p = plot(84, y, 136, 50, { x0: 0, x1: 15, y0: 0, y1: 100 });
    o.push(p.hline(100, { tone: 'line', dash: '3 4' }));
    o.push(p.base({ tone: 'line' }));
    o.push(p.line(pts, { tone, sw: 2.4 }));
    o.push(text(292, y + 30, `최고 ${peak}%`, { size: 13, weight: 700, tone, anchor: 'end' }));
  });
  const p = plot(84, 196, 136, 50, { x0: 0, x1: 15 });
  o.push(p.xticks([[0, '0분'], [7, '7분'], [15, '15분']], { dy: 70 }));
  return [300, 274, o];
};

// ── no-data-vs-zero ──

// 0은 재 본 값, 데이터 없음은 원인을 몰라요
figs['nd-zero-vs-none'] = () => {
  const o = [];
  const panel = (px, title, none) => {
    o.push(rect(px, 4, 144, 246, { rx: 12, fill: 'card', stroke: 'none' }));
    o.push(text(px + 12, 26, title, { size: 14, weight: 700, tone: none ? 'warn' : 'accent' }));
    const p = plot(px + 14, 40, 118, 70, { x0: 0, x1: 9, y0: 0, y1: 4 });
    o.push(p.base());
    if (none) {
      o.push(p.span(4.5, 9, { fill: 'warnWeak' }));
      o.push(p.line([[0, 1.2], [1, 1.4], [2, 1.1], [3, 1.3], [4, 1.2]], { tone: 'sub', sw: 2 }));
      o.push(p.dots([[0, 1.2], [1, 1.4], [2, 1.1], [3, 1.3], [4, 1.2]], { tone: 'sub', r: 3 }));
      o.push(text(p.sx(6.75), p.sy(2.2), '?', { size: 22, weight: 700, tone: 'warn', anchor: 'middle' }));
    } else {
      const pts = Array.from({ length: 10 }, (_, i) => [i, 0]);
      o.push(p.line(pts, { tone: 'accent', sw: 2 }));
      o.push(p.dots(pts, { tone: 'accent', r: 3.2 }));
    }
    o.push(t13(px + 12, 132, none ? '점이 없어요' : '점마다 0이 찍혀요', { weight: 600 }));
    if (none) {
      ['수집 멈춤', '서버 내려감', '아직 기록 전'].forEach((s, i) => o.push(tag(px + 12, 156 + i * 24, s, { tone: 'sub', anchor: 'start', weight: 600 })));
      o.push(t13(px + 12, 234, '어느 쪽인지 몰라요', { weight: 700, tone: 'warn' }));
    } else {
      o.push(t13(px + 12, 158, '재 봤더니 에러 0', { tone: 'sub' }));
      o.push(tag(px + 12, 196, '에러율 0%', { tone: 'accent', anchor: 'start' }));
      o.push(t13(px + 12, 234, '좋은 소식이에요', { weight: 700, tone: 'accent' }));
    }
  };
  panel(4, '0이에요', false);
  panel(152, '데이터 없음', true);
  return [300, 254, o];
};

// 시계열 줄: 값이 있는 칸과 없는 칸
const seriesRow = (o, x, y, w, name, cells, tone = 'accent') => {
  o.push(text(x, y, name, { size: 13, weight: 700, mono: true, tone: 'text' }));
  const n = cells.length;
  const step = w / n;
  cells.forEach((c, i) => {
    const cx = x + step * i + step / 2;
    if (c == null) {
      o.push(rect(cx - step / 2 + 2, y + 10, step - 4, 24, { rx: 5, fill: 'none', stroke: 'weak', sw: 1.2, dash: '3 3' }));
      o.push(text(cx, y + 27, '없음', { size: 13, weight: 600, tone: 'weak', anchor: 'middle' }));
    } else {
      o.push(rect(cx - step / 2 + 2, y + 10, step - 4, 24, { rx: 5, fill: typeof c === 'object' ? c.fill : tone === 'warn' ? 'warnWeak' : 'accentWeak', stroke: 'none' }));
      o.push(text(cx, y + 27, typeof c === 'object' ? c.t : String(c), { size: 13, weight: 700, tone: typeof c === 'object' ? c.tone : tone, anchor: 'middle' }));
    }
  });
};

// 한 번도 안 생긴 시계열은 없어요
figs['nd-series'] = () => {
  const o = [];
  const panel = (y0, title, zero) => {
    o.push(rect(4, y0, 292, 140, { rx: 12, fill: 'card', stroke: 'none' }));
    o.push(text(16, y0 + 22, title, { size: 14, weight: 700 }));
    seriesRow(o, 16, y0 + 44, 160, 'status="200"', [120, 240, 360, 480]);
    seriesRow(o, 16, y0 + 96, 160, 'status="500"', zero ? [0, 0, 0, 0] : [null, null, null, null], zero ? 'accent' : 'sub');
    o.push(arrow([[184, y0 + 84], [204, y0 + 84]], { tone: 'weak', sw: 2, size: 7 }));
    o.push(t13(246, y0 + 74, '에러율 질의', { tone: 'sub', anchor: 'middle' }));
    o.push(tag(246, y0 + 98, zero ? '0%' : '빈 결과', { tone: zero ? 'accent' : 'warnSoft' }));
  };
  panel(4, '그냥 둘 때', false);
  panel(152, '미리 0으로 내보낼 때', true);
  return [300, 296, o];
};

// 빈 값을 0으로 채우면: Stat 패널 기본은 마지막 값, Instant는 No data
figs['nd-stat'] = () => {
  const o = [];
  o.push(t13(8, 14, '점 간격마다 계산한 에러율(%)', { weight: 600, tone: 'sub' }));
  const p = plot(30, 30, 256, 80, { x0: -0.5, x1: 5.5, y0: 0, y1: 0.7 });
  o.push(p.span(2.5, 5.5, { fill: 'warnWeak' }));
  o.push(p.base());
  const pts = [[0, 0.4], [1, 0.5], [2, 0.4]];
  o.push(p.line(pts, { tone: 'accent', sw: 2.2 }));
  o.push(p.dots(pts, { tone: 'accent', r: 4.5 }));
  pts.forEach(([x, v]) => o.push(label(p.sx(x), p.sy(v) - 10, `${v}`, 'text', 700)));
  o.push(text(p.sx(4), p.sy(0.38), '수집 멈춤', { size: 13, weight: 700, tone: 'warn', anchor: 'middle' }));
  o.push(text(p.sx(4), p.sy(0.38) + 18, '값 없음', { size: 13, tone: 'warn', anchor: 'middle' }));
  // Stat 패널 둘
  const stat = (cx, title, val, tone, note) => {
    o.push(rect(cx - 68, 150, 136, 74, { rx: 10, fill: 'card', stroke: tone === 'warn' ? 'warn' : 'line', sw: 1.5 }));
    o.push(t13(cx - 58, 170, title, { weight: 600, tone: 'sub' }));
    o.push(text(cx, 204, val, { size: 20, weight: 700, tone, anchor: 'middle' }));
    o.push(t13(cx, 244, note, { weight: 600, tone, anchor: 'middle' }));
  };
  o.push(arrow([[p.sx(2), p.sy(0.4) + 10], [78, 146]], { tone: 'accent', sw: 1.8, size: 7, dash: '4 3' }));
  o.push(arrow([[p.sx(5), p.sy(0) + 4], [224, 146]], { tone: 'warn', sw: 1.8, size: 7, dash: '4 3' }));
  stat(76, '기본: 마지막 값', '0.4%', 'accent', '장애를 가려요');
  stat(224, 'Instant', 'No data', 'warn', '멈춘 게 보여요');
  return [300, 252, o];
};

// ── deployments ──

// 배포 방식 넷: 새 버전이 받는 몫
figs['dep-styles'] = () => {
  const o = [];
  const rows = [
    ['한꺼번에', [0, -1, 100, 100, 100]],
    ['롤링', [0, 25, 50, 75, 100]],
    ['블루·그린', [0, 0, 0, 100, 100]],
    ['카나리', [0, 5, 5, 50, 100]],
  ];
  const X = (i) => 104 + i * 38;
  o.push(rect(8, 6, 12, 12, { rx: 3, fill: 'accent', stroke: 'none' }));
  o.push(t13(24, 17, '새 버전 몫', { weight: 600 }));
  o.push(rect(108, 6, 12, 12, { rx: 3, fill: 'line', stroke: 'none' }));
  o.push(t13(124, 17, '옛 버전', { weight: 600, tone: 'sub' }));
  o.push(rect(186, 6, 12, 12, { rx: 3, fill: 'warn', stroke: 'none' }));
  o.push(t13(202, 17, '끊김', { weight: 600, tone: 'warn' }));
  rows.forEach(([name, vals], r) => {
    const y = 34 + r * 54;
    o.push(t13(8, y + 26, name, { weight: 700 }));
    vals.forEach((v, i) => {
      const H = 40;
      if (v < 0) {
        o.push(rect(X(i), y, 30, H, { rx: 4, fill: 'warn', stroke: 'none' }));
        return;
      }
      const h = (H * v) / 100;
      o.push(rect(X(i), y, 30, H, { rx: 4, fill: 'line', stroke: 'none' }));
      if (h > 0) o.push(rect(X(i), y + H - h, 30, h, { rx: v === 100 ? 4 : 2, fill: 'accent', stroke: 'none' }));
      if (v > 0 && v < 100) o.push(h >= 18 ? text(X(i) + 15, y + H - h + 15, `${v}`, { size: 13, weight: 700, tone: 'card', anchor: 'middle' }) : text(X(i) + 15, y + H - h - 4, `${v}`, { size: 13, weight: 700, tone: 'accent', anchor: 'middle' }));
    });
  });
  ['시작', '', '', '', '끝'].forEach((s, i) => s && o.push(label(X(i) + 15, 262, s, 'sub', 400)));
  o.push(t13(186, 262, '시간 →', { tone: 'sub', anchor: 'middle' }));
  return [300, 268, o];
};

// 카나리와 옛 버전을 같은 10분끼리 견줘요
figs['dep-canary'] = () => {
  const o = [];
  o.push(rect(8, 6, 12, 12, { rx: 3, fill: 'weak', stroke: 'none' }));
  o.push(t13(24, 17, '옛 버전 v1.4(95%)', { weight: 600, tone: 'sub' }));
  o.push(rect(160, 6, 12, 12, { rx: 3, fill: 'text', stroke: 'none' }));
  o.push(t13(176, 17, '카나리 v1.5(5%)', { weight: 600 }));
  const groups = [
    ['에러율', [0.2, 1.7], ['0.2%', '1.7%'], true],
    ['p99 응답시간', [310, 890], ['310ms', '890ms'], true],
    ['주문 완료율', [3.1, 3.0], ['3.1%', '3.0%'], false],
    ['같은 10분의 요청', [57000, 3000], ['57,000건', '3,000건'], false],
  ];
  groups.forEach(([name, vals, disp, bad], gi) => {
    const y = 40 + gi * 60;
    o.push(t13(8, y, name, { weight: 700 }));
    const max = Math.max(...vals);
    vals.forEach((v, j) => {
      const w = Math.max(3, (v / max) * 196);
      const tone = j === 0 ? 'weak' : bad ? 'warn' : 'text';
      o.push(rect(8, y + 8 + j * 20, w, 14, { rx: 4, fill: tone, stroke: 'none' }));
      o.push(t13(8 + w + 6, y + 20 + j * 20, disp[j], { weight: 700, tone: j === 0 ? 'sub' : bad ? 'warn' : 'text' }));
    });
  });
  return [300, 276, o];
};

// 열 이름 바꾸기: 넷으로 나눠 마지막 전까지는 되돌릴 수 있어요
figs['dep-columns'] = () => {
  const o = [];
  const steps = [
    ['처음', 'n', '-', 'tel', 'tel', null],
    ['1. 새 열 더하기', 'n', 'new', 'tel', 'tel', true],
    ['2. 두 열에 쓰기', 'n', 'n', 'both', 'tel', true],
    ['3. 읽기 옮기기', 'n', 'n', 'both', 'phone', true],
    ['4. 옛 열 지우기', 'del', 'n', 'phone', 'phone', false],
  ];
  const TX = 128;
  const PX = 188;
  o.push(t13(TX + 26, 14, 'DB의 열', { weight: 600, tone: 'sub', anchor: 'middle' }).replace('', ''));
  steps.forEach(([name, tel, phone, write, read, ok], i) => {
    const y = 26 + i * 54;
    o.push(t13(8, y + 18, name, { weight: 700 }));
    const col = (x, s, state) => {
      if (state === '-') return;
      const fill = state === 'new' ? 'accentWeak' : state === 'del' ? 'warnWeak' : 'card';
      const stroke = state === 'new' ? 'accent' : state === 'del' ? 'warn' : 'sub';
      o.push(rect(x, y + 2, 52, 24, { rx: 5, fill, stroke, sw: 1.5, dash: state === 'del' ? '3 3' : undefined }));
      o.push(text(x + 26, y + 19, s, { size: 13, weight: 700, mono: true, anchor: 'middle', tone: state === 'del' ? 'warn' : state === 'new' ? 'accent' : 'text' }));
      if (state === 'del') o.push(line(x + 8, y + 14, x + 44, y + 14, { tone: 'warn', sw: 1.6 }));
    };
    col(TX, 'tel', tel);
    col(PX, 'phone', phone);
    const chip = (x, s, tone) => o.push(tag(x + 26, y + 38, s, { tone, size: 13 }));
    const wTel = write === 'tel' || write === 'both';
    const wPh = write === 'phone' || write === 'both';
    const changedW = i === 2 || i === 4;
    const changedR = i === 3;
    if (tel !== 'del') {
      if (wTel && read === 'tel') chip(TX, '쓰기·읽기', changedW ? 'soft' : 'sub');
      else if (wTel) chip(TX, '쓰기', changedW ? 'soft' : 'sub');
    }
    if (wPh && read === 'phone') chip(PX, '쓰기·읽기', changedR ? 'soft' : 'sub');
    else if (wPh) chip(PX, '쓰기', changedW ? 'soft' : 'sub');
    if (ok === true) o.push(g.check(276, y + 14, { r: 6 }));
    if (ok === false) o.push(xmark(276, y + 14, { r: 5 }));
  });
  o.push(t13(292, 14, '되돌리기', { weight: 600, tone: 'sub', anchor: 'end' }));
  return [300, 292, o];
};

// ── why-numbers-differ ──

// 값 12개를 점 3개로: 마지막 값을 고르면 피크가 사라지고, 평균하면 30
figs['wnd-pick'] = () => {
  const o = [];
  const vals = [10, 10, 10, 10, 10, 90, 10, 10, 10, 10, 10, 10];
  const p = plot(30, 36, 256, 100, { x0: -0.5, x1: 11.5, y0: 0, y1: 100 });
  for (const b of [3.5, 7.5]) o.push(p.vline(b, { tone: 'line', dash: '3 3', top: 26 }));
  o.push(p.base());
  vals.forEach((v, i) => o.push(p.bar(i, v, 13, { tone: v > 50 ? 'warn' : [3, 7, 11].includes(i) ? 'accent' : 'line', op: v > 50 ? 0.35 : undefined })));
  [3, 7, 11].forEach((i) => o.push(g.circle(p.sx(i), p.sy(10), 4.5, { fill: 'accent', stroke: 'card', sw: 1.5 })));
  // 평균 선
  [[0, 3, 10], [4, 7, 30], [8, 11, 10]].forEach(([a, b, m]) => {
    o.push(line(p.sx(a) - 7, p.sy(m), p.sx(b) + 7, p.sy(m), { tone: m > 10 ? 'warn' : 'sub', sw: 2.4, dash: '6 3', cap: 'butt' }));
  });
  o.push(t13(p.sx(5.5), p.sy(30) - 8, '평균 30', { weight: 700, tone: 'warn', anchor: 'middle' }));
  o.push(t13(p.sx(5), p.sy(90) - 8, '90', { weight: 700, tone: 'warn', anchor: 'middle' }));
  ['점 1', '점 2', '점 3'].forEach((s, k) => o.push(label(p.sx([3, 7, 11][k]), 156, s, 'accent', 700)));
  o.push(t13(8, 18, '10초마다 모은 값 12개 → 점 3개', { weight: 600, tone: 'sub' }));
  o.push(g.circle(16, 186, 4.5, { fill: 'accent' }));
  o.push(t13(26, 191, '마지막 값만 고르면 10, 10, 10', { weight: 600, tone: 'accent' }));
  o.push(line(10, 210, 22, 210, { tone: 'warn', sw: 2.4, dash: '6 3' }));
  o.push(t13(26, 215, '평균으로 묶으면 10, 30, 10', { weight: 600, tone: 'warn' }));
  return [300, 224, o];
};

// ── empty-graph ──

// 500 시계열은 첫 500 응답 때 생겨요
figs['eg-series'] = () => {
  const o = [];
  seriesRow(o, 8, 16, 284, 'status="200"', [120, 240, 360, 480, 600, 720]);
  seriesRow(o, 8, 76, 284, 'status="500"', [null, null, null, null, { t: '1', tone: 'warn', fill: 'warnWeak' }, { t: '1', tone: 'warn', fill: 'warnWeak' }]);
  const step = 284 / 6;
  o.push(g.path(`M${8 + 2} 116 v6 H${8 + step * 4 - 2} v-6`, { stroke: 'sub', sw: 1.6 }));
  o.push(t13(8 + step * 2, 140, '0이 아니라 빈 결과', { weight: 700, tone: 'sub', anchor: 'middle' }));
  o.push(t13(8 + step * 4.5, 140, '첫 500', { weight: 700, tone: 'warn', anchor: 'middle' }));
  ['1분', '2분', '3분', '4분', '5분', '6분'].forEach((s, i) => o.push(label(8 + step * i + step / 2, 164, s, 'sub', 400)));
  return [300, 170, o];
};


// ── slo-and-error-budget ──

// 같은 99.9%라도 기간이 길면 허용하는 실패도 길어요
figs['slo-window'] = () => {
  const o = [];
  const X = (m) => 16 + (m / 46) * 270;
  const row = (y, name, budget, ok) => {
    o.push(t13(8, y, name, { weight: 700 }));
    o.push(t13(292, y, ok ? '허용 범위 안이에요' : '목표를 깨요', { weight: 700, tone: ok ? 'accent' : 'warn', anchor: 'end' }));
    o.push(rect(X(0), y + 10, X(budget) - X(0), 22, { rx: 4, fill: 'accentWeak', stroke: 'accent', sw: 1.5 }));
    o.push(rect(X(0), y + 38, X(30) - X(0), 14, { rx: 4, fill: 'warn', stroke: 'none' }));
    o.push(budget > 10 ? t13(X(budget) - 8, y + 26, `허용 ${budget}분`, { weight: 700, tone: 'accent', anchor: 'end' }) : t13(X(budget) + 6, y + 26, `허용 ${budget}분`, { weight: 700, tone: 'accent' }));
  };
  row(20, '하루 기준', 1.44, false);
  row(100, '30일 기준', 43.2, true);
  o.push(t13(X(30) + 6, 72, '30분 실패', { weight: 700, tone: 'warn' }));
  o.push(t13(X(30) + 6, 152, '30분 실패', { weight: 700, tone: 'warn' }));
  o.push(line(X(0), 172, X(45), 172, { tone: 'weak', sw: 1.5, cap: 'butt' }));
  [0, 10, 20, 30, 40].forEach((m) => o.push(label(X(m), 190, `${m}분`, 'sub', 400)));
  return [300, 198, o];
};

// SLI가 떨어지면 내부 SLO가 먼저, SLA가 뒤에 깨져요
figs['slo-sla'] = () => {
  const o = [];
  const p = plot(84, 20, 204, 140, { x0: -0.3, x1: 5.3, y0: 99.85, y1: 100 });
  o.push(p.band(99.9, 99.95, { fill: 'accentWeak' }));
  o.push(p.hline(99.95, { tone: 'accent', dash: '5 4' }));
  o.push(p.hline(99.9, { tone: 'warn', dash: '5 4' }));
  o.push(text(78, p.sy(99.95) + 4.5, 'SLO 99.95', { size: 13, weight: 700, tone: 'accent', anchor: 'end' }));
  o.push(text(78, p.sy(99.9) + 4.5, 'SLA 99.9', { size: 13, weight: 700, tone: 'warn', anchor: 'end' }));
  const vals = [99.98, 99.97, 99.96, 99.94, 99.92, 99.88];
  const pts = vals.map((v, i) => [i, v]);
  o.push(p.line(pts, { tone: 'sub', sw: 2.2 }));
  pts.forEach(([i, v]) => o.push(g.circle(p.sx(i), p.sy(v), 4.5, { fill: v < 99.9 ? 'warn' : v < 99.95 ? 'accent' : 'sub', stroke: 'card', sw: 1.5 })));
  pts.forEach(([i, v]) => o.push(t13(p.sx(i), v < 99.9 ? p.sy(v) + 20 : p.sy(v) - 10, `${v}`, { weight: 600, tone: v < 99.9 ? 'warn' : v < 99.95 ? 'accent' : 'sub', anchor: 'middle' })));
  o.push(t13(p.sx(1), p.sy(99.925) + 5, '계약 전에 손볼 때', { weight: 700, tone: 'accent', anchor: 'middle' }));
  o.push(t13(84, 190, 'SLI가 조금씩 떨어지는 예시(%)', { tone: 'sub' }));
  return [300, 194, o];
};

// 에러 버짓 0.1%를 확대하면
figs['slo-budget'] = () => {
  const o = [];
  o.push(t13(8, 18, '30일, SLO 99.9%', { weight: 700 }));
  o.push(rect(8, 28, 284, 22, { rx: 4, fill: 'accent', stroke: 'none' }));
  o.push(rect(284, 28, 8, 22, { rx: 2, fill: 'warn', stroke: 'none' }));
  o.push(text(140, 44, '성공해야 할 몫 99.9%', { size: 13, weight: 700, tone: 'card', anchor: 'middle' }));
  // 확대
  o.push(g.path('M284 50 L40 84 M292 50 L292 84', { stroke: 'warn', sw: 1.2, dash: '3 3' }));
  o.push(rect(16, 84, 276, 126, { rx: 12, fill: 'warnWeak', stroke: 'warn', sw: 1.5 }));
  o.push(text(30, 108, '에러 버짓 0.1%', { size: 15, weight: 700, tone: 'warn' }));
  o.push(t13(30, 126, '= 100% − SLO', { tone: 'sub' }));
  o.push(t13(28, 154, '요청으로 세면', { tone: 'sub' }));
  o.push(text(28, 174, '100만 건 중 1,000건', { size: 14, weight: 700 }));
  o.push(t13(162, 154, '시간으로 재면', { tone: 'sub' }));
  o.push(text(162, 174, '43,200분 중 43.2분', { size: 14, weight: 700 }));
  o.push(line(152, 142, 152, 190, { tone: 'warn', sw: 1, dash: '3 3' }));
  return [300, 218, o];
};

// ── availability-math ──

const nodeTag = (o, x, y, s, tone = 'sub') => o.push(tag(x, y, s, { tone: tone === 'warn' ? 'warnSoft' : tone === 'accent' ? 'soft' : 'plain' }));

// 줄로 이으면 곱해요
figs['avail-series'] = () => {
  const o = [];
  o.push(line(10, 50, 290, 50, { tone: 'weak', sw: 2.5 }));
  o.push(g.circle(10, 50, 4.5, { fill: 'sub' }));
  o.push(arrow([[270, 50], [292, 50]], { tone: 'weak', sw: 2.5, size: 8 }));
  const items = [[62, '웹', (x, y) => g.server(x, y)], [150, 'API', (x, y) => g.server(x, y)], [238, 'DB', (x, y) => g.db(x, y)]];
  items.forEach(([x, name, icon]) => {
    o.push(rect(x - 26, 22, 52, 56, { rx: 8, fill: 'bg', stroke: 'none' }));
    o.push(icon(x, 50));
    o.push(label(x, 98, name, 'text', 700));
    nodeTag(o, x, 120, '99.9%');
  });
  o.push(t13(150, 158, '셋 다 살아야 성공', { tone: 'sub', anchor: 'middle', weight: 600 }));
  o.push(text(150, 184, '0.999 × 0.999 × 0.999', { size: 15, anchor: 'middle' }));
  o.push(text(150, 210, '≈ 99.7%', { size: 18, weight: 700, tone: 'warn', anchor: 'middle' }));
  return [300, 218, o];
};

// 나란히 두면 실패를 곱해요
figs['avail-parallel'] = () => {
  const o = [];
  o.push(g.circle(14, 70, 4.5, { fill: 'sub' }));
  o.push(g.path('M14 70 H60 V36 H120 M60 70 V104 H120', { stroke: 'weak', sw: 2.5 }));
  o.push(g.path('M180 36 H240 V70 H270 M180 104 H240 V70', { stroke: 'weak', sw: 2.5 }));
  o.push(arrow([[262, 70], [290, 70]], { tone: 'weak', sw: 2.5, size: 8 }));
  for (const [y] of [[36], [104]]) {
    o.push(rect(122, y - 28, 56, 56, { rx: 8, fill: 'bg', stroke: 'none' }));
    o.push(g.server(150, y));
    o.push(tag(204, y - 20, '99%', { tone: 'plain' }));
  }
  o.push(t13(150, 158, '하나만 살아도 성공', { tone: 'sub', anchor: 'middle', weight: 600 }));
  o.push(text(150, 184, '둘 다 멈출 확률 1% × 1% = 0.01%', { size: 14, anchor: 'middle' }));
  o.push(text(150, 210, '→ 99.99%', { size: 18, weight: 700, tone: 'accent', anchor: 'middle' }));
  return [300, 218, o];
};

// 함께 멈추면 중복이 소용없어요
figs['avail-mixed'] = () => {
  const o = [];
  o.push(g.circle(10, 70, 4.5, { fill: 'sub' }));
  o.push(g.path('M10 70 H34 V36 H66 M34 70 V104 H66', { stroke: 'weak', sw: 2.5 }));
  o.push(g.path('M118 36 H150 V70 H200 M118 104 H150 V70', { stroke: 'weak', sw: 2.5 }));
  o.push(arrow([[256, 70], [292, 70]], { tone: 'weak', sw: 2.5, size: 8 }));
  for (const y of [36, 104]) {
    o.push(g.server(92, y));
    o.push(tag(92, y + 28, '99.5%', { tone: 'plain' }));
  }
  o.push(rect(202, 40, 56, 60, { rx: 10, fill: 'warnWeak', stroke: 'warn', sw: 1.5 }));
  o.push(g.db(230, 70, { tone: 'warn', rx: 15 }));
  o.push(tag(230, 116, 'DB 99.9%', { tone: 'warnSoft' }));
  o.push(t13(92, 160, '둘이면 99.9975%', { tone: 'sub', anchor: 'middle', weight: 600 }));
  o.push(t13(230, 160, '하나뿐', { tone: 'warn', anchor: 'middle', weight: 700 }));
  o.push(text(150, 186, '99.9975% × 99.9%', { size: 15, anchor: 'middle' }));
  o.push(text(150, 212, '≈ 99.9% (DB와 같아요)', { size: 17, weight: 700, tone: 'warn', anchor: 'middle' }));
  return [300, 220, o];
};

// 없어도 되는 의존은 곱하지 않아요
figs['avail-optional'] = () => {
  const o = [];
  // 상품 페이지
  o.push(rect(84, 6, 132, 104, { rx: 8, fill: 'card', stroke: 'sub', sw: 1.8 }));
  o.push(line(84, 20, 216, 20, { tone: 'sub', sw: 1.2, cap: 'butt' }));
  o.push(g.circle(92, 13, 1.6, { fill: 'sub' }));
  o.push(g.circle(98, 13, 1.6, { fill: 'sub' }));
  o.push(rect(94, 28, 112, 40, { rx: 5, fill: 'accentWeak', stroke: 'none' }));
  o.push(text(150, 53, '상품 정보', { size: 13, weight: 700, tone: 'accent', anchor: 'middle' }));
  o.push(rect(94, 74, 112, 28, { rx: 5, fill: 'none', stroke: 'weak', sw: 1.4, dash: '4 3' }));
  o.push(text(150, 93, '추천 칸 비움', { size: 13, weight: 600, tone: 'weak', anchor: 'middle' }));
  o.push(label(150, 128, '상품 페이지', 'text', 700));
  // 의존 둘
  o.push(arrow([[110, 112], [58, 168]], { tone: 'warn', sw: 2.4, size: 8 }));
  o.push(arrow([[190, 112], [232, 168]], { tone: 'weak', sw: 2, size: 8, dash: '5 4' }));
  o.push(g.db(52, 194, { tone: 'warn' }));
  o.push(label(52, 232, '상품 DB', 'text', 700));
  o.push(tag(52, 256, '꼭 필요 · 곱해요', { tone: 'warnSoft' }));
  o.push(g.server(232, 194));
  o.push(xmark(250, 178, { r: 5 }));
  o.push(label(232, 232, '추천 서비스', 'text', 700));
  o.push(tag(232, 256, '멈추면 칸만 비워요', { tone: 'plain' }));
  return [300, 270, o];
};

// ── red-and-use ──

// RED는 서비스 쪽 증상, USE는 자원 쪽 원인
figs['red-use'] = () => {
  const o = [];
  o.push(rect(4, 4, 292, 120, { rx: 12, fill: 'card', stroke: 'none' }));
  o.push(text(16, 26, 'RED', { size: 15, weight: 700, tone: 'accent' }));
  o.push(t13(56, 26, '서비스 · 사용자가 겪는 증상', { tone: 'sub', weight: 600 }));
  o.push(g.person(34, 70));
  o.push(arrow([[52, 66], [160, 66]], { tone: 'accent', sw: 2.4, size: 8 }));
  o.push(rect(164, 46, 120, 40, { rx: 8, fill: 'accentWeak', stroke: 'accent', sw: 1.5 }));
  o.push(text(224, 71, '주문 API', { size: 14, weight: 700, tone: 'accent', anchor: 'middle' }));
  [['R', '요청 수'], ['E', '실패한 요청'], ['D', '응답시간']].forEach(([k, s], i) => {
    const x = 16 + i * 92;
    o.push(g.circle(x + 8, 104, 9, { fill: 'accent' }));
    o.push(text(x + 8, 108.5, k, { size: 13, weight: 700, tone: 'card', anchor: 'middle' }));
    o.push(t13(x + 22, 109, s, { weight: 600 }));
  });
  o.push(rect(4, 134, 292, 150, { rx: 12, fill: 'card', stroke: 'none' }));
  o.push(text(16, 156, 'USE', { size: 15, weight: 700, tone: 'warn' }));
  o.push(t13(56, 156, '자원 · 문제의 원인', { tone: 'sub', weight: 600 }));
  const res = [['CPU', (x, y) => [rect(x - 14, y - 14, 28, 28, { rx: 4, fill: 'card', stroke: 'sub', sw: 1.8 }), rect(x - 7, y - 7, 14, 14, { rx: 2, fill: 'line', stroke: 'none' })].join('\n')], ['메모리', (x, y) => g.ram(x, y)], ['디스크', (x, y) => g.db(x, y, { rx: 13 })], ['네트워크', (x, y) => g.sw(x - 3, y, { ports: 4 })]];
  res.forEach(([n, icon], i) => {
    const x = 40 + i * 72;
    o.push(icon(x, 194));
    o.push(label(x, 230, n, 'text', 600));
  });
  [['U', '사용률'], ['S', '밀린 일'], ['E', '자원 에러']].forEach(([k, s], i) => {
    const x = 16 + i * 92;
    o.push(g.circle(x + 8, 264, 9, { fill: 'warn' }));
    o.push(text(x + 8, 268.5, k, { size: 13, weight: 700, tone: 'card', anchor: 'middle' }));
    o.push(t13(x + 22, 269, s, { weight: 600 }));
  });
  return [300, 288, o];
};

// ── capacity-planning ──

// 용량 계획의 흐름
figs['cap-flow'] = () => {
  const o = [];
  const box = (x, y, w, h, l1, l2, tone) => {
    o.push(rect(x, y, w, h, { rx: 10, fill: tone === 'accent' ? 'accentWeak' : 'card', stroke: tone === 'accent' ? 'accent' : 'line', sw: 1.5 }));
    o.push(text(x + w / 2, y + h / 2 - 2, l1, { size: 13, weight: 700, tone: tone === 'accent' ? 'accent' : 'text', anchor: 'middle' }));
    o.push(text(x + w / 2, y + h / 2 + 16, l2, { size: 13, tone: 'sub', anchor: 'middle' }));
  };
  box(8, 8, 136, 50, '자연 증가', '지난 추세');
  box(156, 8, 136, 50, '계획된 수요', '출시·행사');
  o.push(arrow([[76, 58], [130, 82]], { tone: 'weak', sw: 2, size: 7 }));
  o.push(arrow([[224, 58], [170, 82]], { tone: 'weak', sw: 2, size: 7 }));
  box(70, 84, 160, 50, '수요 예측', '피크 2,010 요청/초', 'accent');
  o.push(arrow([[150, 134], [150, 158]], { tone: 'weak', sw: 2, size: 7 }));
  box(8, 160, 136, 50, '부하 테스트', '한 대 320 요청/초');
  o.push(arrow([[144, 185], [160, 185]], { tone: 'weak', sw: 2, size: 7 }));
  box(162, 160, 130, 50, '필요한 대수', '2,010 ÷ 320 → 7대');
  o.push(arrow([[227, 210], [227, 232]], { tone: 'weak', sw: 2, size: 7 }));
  for (let i = 0; i < 8; i++) o.push(g.server(40 + i * 31, 256, { tone: i < 7 ? 'accent' : 'weak' }));
  o.push(text(150, 296, '여유 1대를 더해 8대, 리드 타임 전에 늘려요', { size: 13, weight: 700, tone: 'accent', anchor: 'middle' }));
  return [300, 304, o];
};

// 사용률에 따른 평균 응답시간(M/M/1): 처리 시간의 1/(1-사용률)배
figs['cap-queue'] = () => {
  const o = [];
  const p = plot(44, 24, 236, 150, { x0: 0, x1: 100, y0: 0, y1: 22 });
  o.push(p.yticks([[0, '0'], [10, '10배'], [20, '20배']]));
  o.push(p.span(80, 100, { fill: 'warnWeak' }));
  o.push(p.base());
  const curve = [];
  for (let u = 0; u <= 95.6; u += 1.5) curve.push([u, Math.min(22, 1 / (1 - u / 100))]);
  curve.push([95.5, 1 / (1 - 0.955)]);
  o.push(p.line(curve, { tone: 'sub', sw: 2.4 }));
  const pts = [[50, 2, '2배'], [70, 3.33, '3.3배'], [80, 5, '5배'], [90, 10, '10배'], [95, 20, '20배']];
  pts.forEach(([u, v, s]) => {
    o.push(g.circle(p.sx(u), p.sy(v), 4.5, { fill: u >= 90 ? 'warn' : 'accent', stroke: 'card', sw: 1.5 }));
    o.push(t13(p.sx(u) - 8, p.sy(v) - 2, s, { weight: 700, tone: u >= 90 ? 'warn' : 'accent', anchor: 'end' }));
  });
  o.push(p.xticks([[0, '0%'], [50, '50%'], [80, '80%'], [100, '100%']]));
  o.push(t13(p.sx(90), p.sy(1.5), '가팔라져요', { weight: 700, tone: 'warn', anchor: 'middle' }));
  o.push(t13(44, 214, '사용률 →  응답시간이 처리 시간의 몇 배인지', { tone: 'sub' }));
  return [300, 222, o];
};

// 보내는 양에 따른 p99: 목표 100ms 안의 마지막 점이 한 대 용량
figs['cap-p99'] = () => {
  const o = [];
  const p = plot(50, 24, 230, 150, { x0: 180, x1: 400, y0: 0, y1: 300 });
  o.push(p.yticks([[0, '0'], [100, '100ms'], [300, '300ms']]));
  o.push(p.hline(100, { tone: 'accent', dash: '5 4' }));
  o.push(p.base());
  const pts = [[200, 48], [280, 55], [320, 70], [360, 126], [380, 284]];
  o.push(p.line(pts, { tone: 'sub', sw: 2.4 }));
  pts.forEach(([x, v]) => {
    o.push(g.circle(p.sx(x), p.sy(v), 4.5, { fill: v > 100 ? 'warn' : x === 320 ? 'accent' : 'sub', stroke: 'card', sw: 1.5 }));
    o.push(t13(p.sx(x) + (x === 380 ? -8 : 0), x === 320 ? p.sy(v) + 20 : p.sy(v) - 10, `${v}`, { weight: 700, tone: v > 100 ? 'warn' : x === 320 ? 'accent' : 'sub', anchor: x === 380 ? 'end' : 'middle' }));
  });
  o.push(p.vline(320, { tone: 'accent', top: p.sy(70) + 26 }));
  o.push(t13(p.sx(200), p.sy(100) - 8, '목표 p99 100ms', { weight: 700, tone: 'accent' }));
  o.push(p.xticks([[200, '200'], [280, '280'], [320, '320'], [380, '380']]));
  o.push(t13(p.sx(320), 214, '한 대 용량 320 요청/초', { weight: 700, tone: 'accent', anchor: 'middle' }));
  return [300, 222, o];
};

// 피크 2,010을 한 대 320씩: 7대 + 여유 1대
figs['cap-servers'] = () => {
  const o = [];
  for (let i = 0; i < 8; i++) {
    const x = 26 + i * 35;
    if (i === 7) o.push(rect(x - 16, 18, 32, 46, { rx: 6, fill: 'none', stroke: 'weak', sw: 1.4, dash: '4 3' }));
    o.push(g.server(x, 41, { tone: i < 7 ? 'accent' : 'weak' }));
    o.push(label(x, 84, i < 7 ? `${i + 1}` : '+1', i < 7 ? 'accent' : 'sub', 700));
  }
  o.push(g.path('M10 96 v6 H254 v-6', { stroke: 'accent', sw: 1.6 }));
  o.push(text(132, 124, '2,010 ÷ 320 = 6.3 → 7대', { size: 14, weight: 700, tone: 'accent', anchor: 'middle' }));
  o.push(t13(271, 124, '여유', { weight: 700, tone: 'sub', anchor: 'middle' }));
  o.push(t13(150, 152, '한 대가 고장 나도 남은 7대가 피크를 받아요', { tone: 'sub', anchor: 'middle' }));
  return [300, 160, o];
};


// ── dashboard-design ──

// 대시보드를 위에서 아래로: 서비스 상태 → 요청 흐름 → 자원 → 의존 서비스
figs['dash-layout'] = () => {
  const o = [];
  o.push(rect(26, 4, 270, 300, { rx: 10, fill: 'card', stroke: 'sub', sw: 1.6 }));
  o.push(line(26, 22, 296, 22, { tone: 'sub', sw: 1.2, cap: 'butt' }));
  o.push(t13(36, 17, '결제 서비스', { weight: 700, tone: 'sub' }).replace('font-size="13"', 'font-size="13"'));
  const tile = (x, y, w, h, l, v, tone) => {
    o.push(rect(x, y, w, h, { rx: 6, fill: 'bg', stroke: 'none' }));
    o.push(t13(x + 7, y + 17, l, { tone: 'sub', weight: 600 }));
    if (v) o.push(text(x + 7, y + h - 9, v, { size: 16, weight: 700, tone }));
  };
  // ① 서비스 상태
  const W3 = (270 - 16 - 12) / 3;
  tile(34, 30, W3, 52, '버짓', '62%', 'accent');
  tile(34 + W3 + 6, 30, W3, 52, '에러율', '0.02%', 'text');
  tile(34 + 2 * (W3 + 6), 30, W3, 52, 'p99', '820ms', 'text');
  // ② 요청 흐름
  ['요청', '에러', '지연'].forEach((l, i) => {
    const x = 34 + i * (W3 + 6);
    o.push(rect(x, 90, W3, 60, { rx: 6, fill: 'bg', stroke: 'none' }));
    o.push(t13(x + 7, 106, l, { tone: 'sub', weight: 600 }));
    const pts = [[0, 0.4], [1, 0.5], [2, 0.45], [3, 0.6], [4, 0.55], [5, 0.7]];
    const p = plot(x + 8, 114, W3 - 16, 28, { x0: 0, x1: 5 });
    o.push(p.line(pts, { tone: 'accent', sw: 1.8 }));
  });
  // ③ 자원
  const W4 = (270 - 16 - 18) / 4;
  ['CPU', '메모리', '스레드', '커넥션 풀'].forEach((l, i) => {
    const x = 34 + i * (W4 + 6);
    o.push(rect(x, 158, W4, 52, { rx: 6, fill: 'bg', stroke: 'none' }));
    o.push(t13(x + 6, 174, l, { tone: 'sub', weight: 600 }));
    o.push(rect(x + 6, 190, W4 - 12, 8, { rx: 4, fill: 'line', stroke: 'none' }));
    o.push(rect(x + 6, 190, (W4 - 12) * [0.55, 0.7, 0.4, 0.85][i], 8, { rx: 4, fill: i === 3 ? 'warn' : 'accent', stroke: 'none' }));
  });
  // ④ 의존 서비스
  ['DB', '캐시', '외부 API'].forEach((l, i) => {
    const x = 34 + i * (W3 + 6);
    o.push(rect(x, 218, W3, 34, { rx: 6, fill: 'bg', stroke: 'none' }));
    o.push(g.circle(x + 12, 235, 4.5, { fill: i === 2 ? 'warn' : 'accent' }));
    o.push(t13(x + 22, 240, l, { weight: 600 }));
  });
  [[1, 56], [2, 120], [3, 184], [4, 235]].forEach(([n, y]) => o.push(badge(12, y, n, { tone: n === 1 ? 'accent' : 'sub' })));
  o.push(t13(161, 274, '위: 지금 괜찮은가', { weight: 700, tone: 'accent', anchor: 'middle' }));
  o.push(t13(161, 294, '아래로 갈수록 원인 찾기', { tone: 'sub', anchor: 'middle' }));
  return [300, 308, o];
};

// 서버마다 복사하면 고칠 때마다 모두, 변수로 한 벌이면 한 번에
figs['dash-variables'] = () => {
  const o = [];
  const mini = (x, y, name, tone) => {
    o.push(rect(x, y, 78, 52, { rx: 6, fill: 'card', stroke: tone, sw: 1.5 }));
    o.push(line(x, y + 12, x + 78, y + 12, { tone, sw: 1, cap: 'butt' }));
    o.push(text(x + 6, y + 9.5, name, { size: 13, weight: 600, tone: 'sub' }).replace('font-size="13"', 'font-size="13"'));
    const p = plot(x + 8, y + 18, 62, 26, { x0: 0, x1: 4 });
    o.push(p.line([[0, 0.3], [1, 0.5], [2, 0.4], [3, 0.7], [4, 0.6]], { tone: 'accent', sw: 1.6 }));
  };
  // 왼쪽
  o.push(rect(4, 4, 144, 230, { rx: 12, fill: 'card', stroke: 'none' }));
  o.push(text(16, 26, '서버마다 복사', { size: 14, weight: 700 }));
  [0, 1, 2].forEach((i) => {
    o.push(rect(20 + i * 10, 44 + i * 26, 92, 60, { rx: 6, fill: 'card', stroke: 'sub', sw: 1.4 }));
    o.push(t13(28 + i * 10, 62 + i * 26, `server-${i + 1}`, { weight: 600, tone: 'sub' }));
    o.push(g.path(`M${100 + i * 10} ${62 + i * 26} l8 -8 l4 4 l-8 8 z`, { fill: 'warnWeak', stroke: 'warn', sw: 1.3 }));
  });
  o.push(t13(76, 172, '패널 하나를 고치면', { tone: 'sub', anchor: 'middle' }));
  o.push(t13(76, 192, '모두 따로 고쳐요', { weight: 700, tone: 'warn', anchor: 'middle' }));
  o.push(t13(76, 218, '대시보드 = 서버 수', { tone: 'sub', anchor: 'middle' }));
  // 오른쪽
  o.push(rect(152, 4, 144, 230, { rx: 12, fill: 'card', stroke: 'none' }));
  o.push(text(164, 26, '변수로 한 벌', { size: 14, weight: 700, tone: 'accent' }));
  o.push(rect(168, 44, 112, 104, { rx: 6, fill: 'card', stroke: 'accent', sw: 1.6 }));
  o.push(rect(176, 52, 96, 22, { rx: 4, fill: 'accentWeak', stroke: 'none' }));
  o.push(t13(183, 68, 'server: 1 ▾', { weight: 700, tone: 'accent' }));
  const p = plot(180, 86, 88, 50, { x0: 0, x1: 4 });
  o.push(p.line([[0, 0.3], [1, 0.5], [2, 0.4], [3, 0.7], [4, 0.6]], { tone: 'accent', sw: 1.8 }));
  o.push(g.path('M262 104 l8 -8 l4 4 l-8 8 z', { fill: 'accentWeak', stroke: 'accent', sw: 1.3 }));
  o.push(t13(224, 172, '한 번 고치면', { tone: 'sub', anchor: 'middle' }));
  o.push(t13(224, 192, '모든 서버에 반영', { weight: 700, tone: 'accent', anchor: 'middle' }));
  o.push(t13(224, 218, '서버는 변수에서 골라요', { tone: 'sub', anchor: 'middle' }));
  return [300, 238, o];
};

// ── chart-types ──

// 질문마다 맞는 차트
figs['chart-catalog'] = () => {
  const o = [];
  const cards = [
    ['선 그래프', '바뀌는 모습', (p) => [p.line([[0, 0.3], [1, 0.45], [2, 0.35], [3, 0.7], [4, 0.6]], { tone: 'accent', sw: 2 }), p.line([[0, 0.15], [1, 0.2], [2, 0.18], [3, 0.25], [4, 0.22]], { tone: 'sub', sw: 2 })]],
    ['누적 영역', '나뉘는 몫', (p) => [p.area([[0, 0.9], [2, 0.95], [4, 0.85]], { fill: 'accentWeak' }), p.area([[0, 0.5], [2, 0.6], [4, 0.5]], { fill: 'accent' }), p.line([[0, 0.9], [2, 0.95], [4, 0.85]], { tone: 'accent', sw: 1.6 })]],
    ['막대', '가장 큰 것', (p) => [0.9, 0.7, 0.55, 0.4].map((v, i) => p.bar(0.5 + i, v, 9, { tone: i ? 'sub' : 'accent' }))],
    ['히트맵', '퍼진 모습', (p) => { const r = []; for (let i = 0; i < 5; i++) for (let j = 0; j < 3; j++) r.push(rect(p.sx(i * 0.8), p.y + j * 10, p.w / 5 - 2, 9, { rx: 1.5, fill: 'accent', stroke: 'none', op: [[0.9, 0.3, 0.1], [0.8, 0.4, 0.1], [0.3, 0.5, 0.8], [0.9, 0.3, 0.1], [0.85, 0.3, 0.1]][i][2 - j] })); return r; }],
    ['숫자 카드', '지금 값 하나', (p) => [text(p.x + p.w / 2, p.y + 24, '820', { size: 20, weight: 700, tone: 'accent', anchor: 'middle' })]],
    ['표', '정확한 값', (p) => [0, 1, 2].map((j) => [line(p.x, p.y + 4 + j * 11, p.x + p.w, p.y + 4 + j * 11, { tone: 'line', sw: 1.2, cap: 'butt' }), rect(p.x, p.y + 6 + j * 11, 24, 6, { rx: 2, fill: 'sub', stroke: 'none' }), rect(p.x + p.w - 18, p.y + 6 + j * 11, 18, 6, { rx: 2, fill: 'accent', stroke: 'none' })].join('\n'))],
  ];
  cards.forEach(([name, q, draw], i) => {
    const x = 4 + (i % 2) * 148;
    const y = 4 + Math.floor(i / 2) * 98;
    o.push(rect(x, y, 144, 92, { rx: 10, fill: 'card', stroke: i === 0 ? 'accent' : 'none', sw: 1.5 }));
    const p = plot(x + 12, y + 12, 64, 34, { x0: 0, x1: 4, y0: 0, y1: 1 });
    o.push(draw(p).flat().join('\n'));
    o.push(text(x + 12, y + 66, name, { size: 14, weight: 700, tone: i === 0 ? 'accent' : 'text' }));
    o.push(t13(x + 12, y + 84, q, { tone: 'sub' }));
  });
  return [300, 300, o];
};

// 더해서 전체가 되면 쌓고, 아니면 선을 겹쳐요
figs['chart-stack-ok'] = () => {
  const o = [];
  const panel = (px, title, ok) => {
    o.push(rect(px, 4, 144, 210, { rx: 12, fill: 'card', stroke: 'none' }));
    o.push(text(px + 12, 26, title, { size: 13, weight: 700 }));
    const p = plot(px + 14, 44, 116, 90, { x0: 0, x1: 5, y0: 0, y1: 1 });
    o.push(p.base());
    const L1 = [[0, 0.28], [1, 0.3], [2, 0.33], [3, 0.3], [4, 0.32], [5, 0.3]];
    const L2 = L1.map(([x, v]) => [x, v + 0.22 + (x === 3 ? 0.05 : 0)]);
    const L3 = L2.map(([x, v]) => [x, v + 0.18 + (x === 3 ? 0.06 : 0)]);
    o.push(p.area(L3, { fill: ok ? 'warn' : 'sub', base: L2 }).replace('style="', 'style="fill-opacity:0.35;'));
    o.push(p.area(L2, { fill: ok ? 'weak' : 'sub', base: L1 }).replace('style="', 'style="fill-opacity:0.4;'));
    o.push(p.area(L1, { fill: ok ? 'accent' : 'sub' }).replace('style="', 'style="fill-opacity:0.55;'));
    o.push(p.line(L3, { tone: ok ? 'accent' : 'warn', sw: 2.2 }));
    o.push(t13(px + 12, 156, ok ? '맨 위 = 전체 요청' : '맨 위 = 뜻 없는 합', { weight: 700, tone: ok ? 'accent' : 'warn' }));
    o.push(t13(px + 12, 176, ok ? '200 + 404 + 500' : 'p99를 더하면 안 돼요', { tone: 'sub' }));
    o.push(ok ? g.check(px + 19, 198, { r: 6 }) : xmark(px + 19, 198, { r: 5 }));
    o.push(t13(px + 32, 203, ok ? '쌓아도 돼요' : '선을 겹쳐 그려요', { weight: 700, tone: ok ? 'accent' : 'warn' }));
  };
  panel(4, '상태 코드별 요청 수', true);
  panel(152, '서버별 p99', false);
  return [300, 218, o];
};

// 축을 자르면 2%p 차이가 세 배처럼
figs['chart-axis'] = () => {
  const o = [];
  const panel = (px, title, y0, note, tone) => {
    o.push(rect(px, 4, 144, 220, { rx: 12, fill: 'card', stroke: 'none' }));
    o.push(text(px + 12, 26, title, { size: 13, weight: 700 }));
    const p = plot(px + 44, 46, 86, 120, { x0: 0, x1: 2, y0, y1: 100 });
    o.push(p.yticks([[y0, `${y0}%`], [100, '100%']]));
    o.push(p.base());
    o.push(p.bar(0.5, 96, 26, { tone: 'sub' }));
    o.push(p.bar(1.5, 98, 26, { tone }));
    o.push(label(p.sx(0.5), p.sy(96) - 6, '96%', 'text', 700));
    o.push(label(p.sx(1.5), p.sy(98) - 6, '98%', tone, 700));
    o.push(label(p.sx(0.5), 186, 'A', 'sub', 600));
    o.push(label(p.sx(1.5), 186, 'B', 'sub', 600));
    o.push(t13(px + 72, 212, note, { weight: 700, tone, anchor: 'middle' }));
  };
  panel(4, '축을 95%에서 자르면', 95, '세 배 차이처럼 보여요', 'warn');
  panel(152, '0부터 그리면', 0, '거의 같아요', 'accent');
  return [300, 228, o];
};

// 퍼진 모습은 히트맵
figs['chart-heatmap'] = () => {
  const o = [];
  const rows = [
    ['1초 넘음', [0, 0.02, 0, 0.03, 0.9, 0.02]],
    ['0.5~1초', [0.08, 0.1, 0.07, 0.09, 0.12, 0.08]],
    ['0.5초 아래', [1, 0.97, 0.95, 0.98, 0.25, 0.96]],
  ];
  const X0 = 88;
  const cw = 34;
  rows.forEach(([name, vals], r) => {
    const y = 14 + r * 40;
    o.push(t13(X0 - 8, y + 24, name, { weight: 600, anchor: 'end' }));
    vals.forEach((v, c) => {
      o.push(rect(X0 + c * cw, y, cw - 3, 36, { rx: 4, fill: 'line', stroke: 'none' }));
      if (v > 0) o.push(rect(X0 + c * cw, y, cw - 3, 36, { rx: 4, fill: r === 0 && c === 4 ? 'warn' : 'accent', stroke: 'none', op: Math.max(0.08, v) }));
    });
  });
  o.push(rect(X0 + 4 * cw - 2, 10, cw + 1, 124, { rx: 6, fill: 'none', stroke: 'warn', sw: 1.8 }));
  ['14:00', '', '14:02', '', '14:04', ''].forEach((s, c) => s && o.push(label(X0 + c * cw + cw / 2 - 1, 152, s, c === 4 ? 'warn' : 'sub', c === 4 ? 700 : 400)));
  o.push(t13(8, 178, '진할수록 요청이 많아요', { tone: 'sub' }));
  o.push(t13(292, 178, '14:04에 1초 넘는 칸으로', { weight: 700, tone: 'warn', anchor: 'end' }));
  return [300, 186, o];
};

// ── alert-conditions ──

// 지속 시간 3분: 조건이 한 번 깨지면 처음부터 다시 세요
figs['ac-pending'] = () => {
  const o = [];
  const vals = [2.3, 2.4, 1.5, 2.2, 2.5, 2.6, 2.4, 2.7, 2.5];
  const p = plot(40, 20, 244, 100, { x0: -0.3, x1: 8.3, y0: 1, y1: 3 });
  o.push(p.hline(2, { tone: 'warn', dash: '5 4' }));
  o.push(t13(36, p.sy(2) + 4.5, '2%', { weight: 700, tone: 'warn', anchor: 'end' }));
  o.push(p.line(vals.map((v, i) => [i, v]), { tone: 'sub', sw: 2 }));
  vals.forEach((v, i) => o.push(g.circle(p.sx(i), p.sy(v), 4.5, { fill: v > 2 ? 'warn' : 'accent', stroke: 'card', sw: 1.5 })));
  o.push(t13(40, 14, '1분마다 평가한 에러율', { tone: 'sub', weight: 600 }));
  // 상태 띠
  const Y = 140;
  o.push(t13(36, Y + 16, '상태', { weight: 700, anchor: 'end' }));
  const seg = (a, b, s, fill, tx) => {
    o.push(rect(p.sx(a), Y, p.sx(b) - p.sx(a) - 2, 24, { rx: 5, fill, stroke: 'none' }));
    if (s) o.push(text((p.sx(a) + p.sx(b)) / 2, Y + 17, s, { size: 13, weight: 700, tone: tx, anchor: 'middle' }));
  };
  seg(-0.3, 2, 'pending', 'line', 'sub');
  seg(3, 6, 'pending', 'line', 'sub');
  seg(6, 8.3, '울림', 'warn', 'card');
  o.push(xmark(p.sx(2.5), Y + 12, { r: 5 }));
  o.push(t13(p.sx(3), Y + 44, '3분: 처음부터 다시 세요', { weight: 600, tone: 'sub' }));
  o.push(t13(292, Y + 64, '6분: 3분을 채워 울려요', { weight: 700, tone: 'warn', anchor: 'end' }));
  [0, 2, 3, 6, 8].forEach((m) => o.push(label(p.sx(m), 132, `${m}분`, 'sub', 400)));
  return [300, 212, o];
};

// 증상에는 사람을 부르는 알림, 원인은 대시보드에서
figs['ac-symptom'] = () => {
  const o = [];
  o.push(rect(4, 4, 292, 112, { rx: 12, fill: 'card', stroke: 'none' }));
  o.push(text(16, 26, '증상', { size: 14, weight: 700, tone: 'warn' }));
  o.push(t13(56, 26, '사용자가 겪는 일', { tone: 'sub' }));
  o.push(g.person(40, 74));
  o.push(bubble(112, 58, '에러, 느린 응답', { tone: 'warn', tail: 'down', tailX: 80 }));
  o.push(arrow([[164, 74], [214, 74]], { tone: 'warn', sw: 2.2, size: 8 }));
  o.push(g.bell(240, 72));
  o.push(t13(240, 104, '사람을 부르는 알림', { weight: 700, tone: 'warn', anchor: 'middle' }));
  o.push(rect(4, 124, 292, 124, { rx: 12, fill: 'card', stroke: 'none' }));
  o.push(text(16, 146, '원인', { size: 14, weight: 700 }));
  o.push(t13(56, 146, '그 일의 이유', { tone: 'sub' }));
  o.push(rect(22, 166, 28, 28, { rx: 4, fill: 'card', stroke: 'sub', sw: 1.8 }));
  o.push(rect(29, 173, 14, 14, { rx: 2, fill: 'line', stroke: 'none' }));
  o.push(label(40, 214, 'CPU 과부하', 'text', 600));
  o.push(g.db(122, 180));
  o.push(label(122, 214, 'DB 연결 거부', 'text', 600));
  o.push(arrow([[170, 180], [214, 180]], { tone: 'sub', sw: 2.2, size: 8 }));
  o.push(g.panel(250, 180, { w: 52, h: 38 }));
  o.push(t13(250, 214, '대시보드', { weight: 700, anchor: 'middle' }));
  o.push(t13(150, 238, '아주 분명하고 임박한 원인에만 알림을 걸어요', { tone: 'sub', anchor: 'middle' }));
  return [300, 252, o];
};

// ── anomaly-detection ──

// 고정 임계값과 기준선 비교: 같은 오늘 값
figs['an-fixed-vs-baseline'] = () => {
  const o = [];
  const today = [42, 18, 16, 28, 125, 255, 310, 150, 140, 290, 245, 155, 58];
  const last = [40, 20, 15, 30, 120, 260, 320, 300, 280, 300, 250, 150, 60];
  const panel = (y0, title, base) => {
    o.push(rect(4, y0, 292, 156, { rx: 12, fill: 'card', stroke: 'none' }));
    o.push(text(16, y0 + 22, title, { size: 14, weight: 700 }));
    const p = plot(20, y0 + 34, 260, 76, { x0: 0, x1: 12, y0: 0, y1: 340 });
    if (base) {
      o.push(p.area(last.map((v, i) => [i, v * 1.2]), { fill: 'accentWeak', base: last.map((v, i) => [i, v * 0.8]) }));
      o.push(p.line(last.map((v, i) => [i, v]), { tone: 'accent', sw: 1.4, dash: '4 3' }));
    } else {
      o.push(p.hline(10, { tone: 'accent', dash: '5 4' }));
      o.push(t13(p.sx(12) - 4, p.sy(10) - 6, '10건', { weight: 700, tone: 'accent', anchor: 'end' }));
    }
    o.push(p.base());
    o.push(p.line(today.map((v, i) => [i, v]), { tone: 'text', sw: 2 }));
    const hit = base ? [7, 8] : [];
    today.forEach((v, i) => { if (hit.includes(i)) o.push(g.circle(p.sx(i), p.sy(v), 5, { fill: 'warn', stroke: 'card', sw: 1.5 })); });
    o.push(t13(16, y0 + 130, base ? '기준: 지난주 같은 시각(띠)' : '기준: 10건 아래면 울림', { tone: 'sub' }));
    o.push(t13(16, y0 + 148, base ? '14·16시 절반으로 줄어 → 잡아요' : '14시 150건 → 울리지 않아요', { weight: 700, tone: base ? 'warn' : 'sub' }));
  };
  panel(4, '고정 임계값', false);
  panel(166, '기준선 비교', true);
  return [300, 326, o];
};

// ── alert-fatigue ──

// 같은 장애의 알림을 묶어요
figs['af-grouping'] = () => {
  const o = [];
  const ys = [34, 108, 186];
  ys.forEach((y, i) => {
    o.push(g.server(30, y));
    o.push(g.bell(58, y - 12, { tone: 'warn' }));
    o.push(t13(30, y + 32, i === 2 ? '서버 N' : `서버 ${i + 1}`, { weight: 600, anchor: 'middle' }));
    o.push(arrow([[74, y], [136, 112]], { tone: 'warn', sw: 1.8, size: 7 }));
  });
  o.push(text(30, 160, '⋮', { size: 16, weight: 700, tone: 'sub', anchor: 'middle' }));
  o.push(rect(138, 80, 92, 64, { rx: 10, fill: 'accentWeak', stroke: 'accent', sw: 1.5 }));
  o.push(text(184, 104, '알림 묶기', { size: 13, weight: 700, tone: 'accent', anchor: 'middle' }));
  o.push(t13(184, 122, 'cluster,', { tone: 'accent', anchor: 'middle', mono: true }));
  o.push(t13(184, 138, 'alertname', { tone: 'accent', anchor: 'middle', mono: true }));
  o.push(arrow([[232, 112], [256, 112]], { tone: 'accent', sw: 2.2, size: 8 }));
  o.push(g.phone(276, 112, { tone: 'accent' }));
  o.push(t13(276, 146, '알림 1개', { weight: 700, tone: 'accent', anchor: 'middle' }));
  o.push(t13(150, 246, '같은 클러스터의 같은 규칙 알림은 한 묶음', { tone: 'sub', anchor: 'middle' }));
  return [300, 254, o];
};

// ── alert-routing ──

// 경로 나무와 알림 넷이 닿은 곳
figs['ar-landing'] = () => {
  const o = [];
  const node = (x, y, w, name, match, dest, tone) => {
    o.push(rect(x, y, w, 46, { rx: 8, fill: tone === 'warn' ? 'warnWeak' : 'card', stroke: tone === 'warn' ? 'warn' : 'sub', sw: 1.5 }));
    o.push(text(x + 10, y + 19, name, { size: 13, weight: 700, tone: tone === 'warn' ? 'warn' : 'text' }));
    if (match) o.push(text(x + w - 8, y + 19, match, { size: 13, tone: 'sub', anchor: 'end', mono: match.includes('=') }));
    o.push(t13(x + 10, y + 38, `→ ${dest}`, { tone: tone === 'warn' ? 'warn' : 'accent', weight: 600 }));
  };
  node(4, 6, 292, '기본 경로', '맞는 곳이 없으면', '운영 채팅방');
  o.push(g.path('M20 52 V86 H34', { stroke: 'weak', sw: 1.8 }));
  node(34, 64, 262, '결제 팀', 'team=payment', '결제 채팅방');
  o.push(g.path('M50 110 V144 H64', { stroke: 'weak', sw: 1.8 }));
  node(64, 122, 232, 'critical', 'severity=critical', '결제 당직 호출', 'warn');
  // 닿은 알림
  o.push(t13(8, 196, '알림 넷이 닿은 곳', { weight: 700, tone: 'sub' }));
  const rows = [
    ['payment · critical', '결제 당직', 'warn'],
    ['payment · warning', '결제 채팅방', 'accent'],
    ['팀 레이블 없음', '운영 채팅방', 'sub'],
    ['team=Payment', '운영 채팅방', 'sub'],
  ];
  rows.forEach(([a, b, tone], i) => {
    const y = 214 + i * 26;
    o.push(envelopeSmall(o, 16, y));
    o.push(t13(30, y + 5, a, { weight: 600, mono: i === 3 }));
    o.push(t13(292, y + 5, b, { weight: 700, tone: tone === 'sub' ? 'text' : tone, anchor: 'end' }));
    o.push(line(160, y, 214, y, { tone: 'weak', sw: 1.4, dash: '2 3' }));
  });
  o.push(t13(292, 328, '대문자 하나만 달라도 결제 경로에 안 맞아요', { tone: 'warn', anchor: 'end', weight: 600 }));
  return [300, 336, o];
};
function envelopeSmall(o, x, y) {
  return [rect(x - 8, y - 6, 16, 12, { rx: 2, fill: 'card', stroke: 'sub', sw: 1.3 }), g.path(`M${x - 8} ${y - 5} L${x} ${y + 1} L${x + 8} ${y - 5}`, { stroke: 'sub', sw: 1.2 })].join('\n');
}

// ── incident-response ──

// 장애 10건이 걸린 시간: 평균 35분은 어느 장애와도 닮지 않았어요
figs['ir-durations'] = () => {
  const o = [];
  const vals = [8, 9, 10, 11, 12, 13, 14, 15, 20, 240];
  const p = plot(44, 24, 240, 150, { x0: -0.6, x1: 9.6, y0: 0, y1: 250 });
  o.push(p.yticks([[0, '0'], [100, '100분'], [200, '200분']]));
  o.push(p.base());
  vals.forEach((v, i) => o.push(p.bar(i, v, 16, { tone: i === 9 ? 'warn' : 'sub', rx: 3 })));
  vals.forEach((v, i) => o.push(i === 9 ? label(p.sx(i), p.sy(v) - 6, `${v}`, 'warn', 700) : label(p.sx(i), p.sy(0) + 18, `${v}`, 'text', 600)));
  o.push(p.hline(35.2, { tone: 'accent', dash: '5 4' }));
  o.push(t13(p.sx(4), p.sy(35.2) - 8, '평균 35분', { weight: 700, tone: 'accent', anchor: 'middle' }));
  o.push(g.path(`M${p.sx(0) - 8} 204 v6 H${p.sx(8) + 8} v-6`, { stroke: 'sub', sw: 1.6 }));
  o.push(label(p.sx(4), 228, '9건은 20분 안에 끝났어요', 'sub', 600));
  o.push(label(p.sx(9), 228, '1건', 'warn', 700));
  return [300, 236, o];
};


// ── root-cause ──

// 알림 셋, 원인 후보 하나
figs['rc-map'] = () => {
  const o = [];
  const N = { web: [150, 34], api: [150, 112], pay: [62, 196], db: [238, 196], disk: [238, 272] };
  const link = (a, b, tone = 'weak') => o.push(arrow([[N[a][0], N[a][1] + 20], [N[b][0], N[b][1] - 22]], { tone, sw: 2, size: 7 }));
  link('web', 'api', 'warn');
  link('api', 'pay');
  link('api', 'db', 'warn');
  link('db', 'disk');
  o.push(g.panel(N.web[0], N.web[1], { w: 46, h: 34 }));
  o.push(g.server(N.api[0], N.api[1]));
  o.push(g.server(N.pay[0], N.pay[1]));
  o.push(rect(N.db[0] - 26, N.db[1] - 24, 52, 48, { rx: 10, fill: 'warnWeak', stroke: 'warn', sw: 1.8 }));
  o.push(g.db(N.db[0], N.db[1], { tone: 'warn', rx: 15 }));
  o.push(g.doc(N.disk[0], N.disk[1], { lines: 2 }));
  const bellAt = (k, dx) => o.push(g.bell(N[k][0] + dx, N[k][1] - 14, { tone: 'warn' }));
  bellAt('web', 36);
  bellAt('api', 30);
  bellAt('db', 36);
  o.push(t13(N.web[0] - 34, N.web[1] - 4, '웹', { weight: 700, anchor: 'end' }));
  o.push(t13(N.web[0] - 34, N.web[1] + 14, '에러율', { tone: 'warn', anchor: 'end' }));
  o.push(t13(N.api[0] - 26, N.api[1] - 4, '주문 API', { weight: 700, anchor: 'end' }));
  o.push(t13(N.api[0] - 26, N.api[1] + 14, 'p99', { tone: 'warn', anchor: 'end' }));
  o.push(label(N.pay[0], N.pay[1] + 34, '결제 API', 'text', 700));
  o.push(label(N.pay[0], N.pay[1] + 52, '정상', 'sub', 600));
  o.push(t13(N.db[0] - 34, N.db[1] - 2, '주문 DB', { weight: 700, anchor: 'end' }));
  o.push(t13(N.db[0] - 34, N.db[1] + 16, '활성 세션', { tone: 'warn', anchor: 'end' }));
  o.push(t13(N.disk[0] - 22, N.disk[1] - 2, 'DB 디스크', { weight: 700, anchor: 'end' }));
  o.push(t13(N.disk[0] - 22, N.disk[1] + 16, '정상', { tone: 'sub', anchor: 'end' }));
  o.push(tag(176, 238, '원인 후보', { tone: 'warn' }));
  o.push(line(196, 228, 214, 214, { tone: 'warn', sw: 1.5 }));
  return [300, 296, o];
};

// 같이 움직였다고 원인은 아니에요: 둘 다 트래픽 때문
figs['rc-common'] = () => {
  const o = [];
  const card = (x, y, title, tone, pts) => {
    o.push(rect(x, y, 120, 76, { rx: 10, fill: 'card', stroke: tone === 'accent' ? 'accent' : 'none', sw: 1.5 }));
    o.push(t13(x + 10, y + 20, title, { weight: 700, tone: tone === 'accent' ? 'accent' : 'text' }));
    const p = plot(x + 12, y + 30, 96, 36, { x0: 0, x1: 5 });
    o.push(p.line(pts, { tone: tone === 'accent' ? 'accent' : 'sub', sw: 2.2 }));
  };
  const rise = [[0, 0.2], [1, 0.22], [2, 0.3], [3, 0.6], [4, 0.85], [5, 0.9]];
  card(90, 6, '트래픽 증가', 'accent', rise);
  card(8, 150, 'CPU 상승', 'sub', rise.map(([x, v]) => [x, v * 0.9 + 0.05]));
  card(172, 150, 'p99 상승', 'sub', rise.map(([x, v]) => [x, v * 0.8 + 0.1]));
  o.push(arrow([[120, 82], [76, 146]], { tone: 'accent', sw: 2.2, size: 8 }));
  o.push(arrow([[180, 82], [224, 146]], { tone: 'accent', sw: 2.2, size: 8 }));
  o.push(t13(150, 116, '공통 원인', { weight: 700, tone: 'accent', anchor: 'middle' }));
  o.push(line(130, 188, 170, 188, { tone: 'weak', sw: 1.8, dash: '4 4' }));
  o.push(t13(150, 248, 'CPU와 p99는 같이 오를 뿐', { weight: 700, tone: 'sub', anchor: 'middle' }));
  o.push(t13(150, 266, '서로의 원인이 아니에요', { tone: 'sub', anchor: 'middle' }));
  return [300, 274, o];
};

// 무관한 지표 199개 중 우연히 상관계수 0.8을 넘은 14개
figs['rc-chance'] = () => {
  const o = [];
  const hit = new Set([7, 23, 38, 52, 66, 81, 97, 112, 128, 141, 157, 170, 183, 196]);
  for (let i = 0; i < 199; i++) {
    const c = i % 20;
    const r = Math.floor(i / 20);
    o.push(g.circle(16 + c * 14, 16 + r * 14, 5, { fill: hit.has(i) ? 'warn' : 'line' }));
  }
  o.push(g.circle(16, 172, 5, { fill: 'warn' }));
  o.push(t13(28, 177, '우연히 상관계수 0.8 넘음 14개', { weight: 700, tone: 'warn' }));
  o.push(g.circle(16, 196, 5, { fill: 'line' }));
  o.push(t13(28, 201, '나머지 185개', { weight: 600, tone: 'sub' }));
  o.push(t13(8, 228, '모두 아무 관계 없는 무작위 지표예요', { tone: 'sub' }));
  return [300, 236, o];
};

// 근거가 튼튼한지 가르는 넷
figs['rc-evidence'] = () => {
  const o = [];
  const card = (y, title, rows, good) => {
    o.push(rect(4, y, 292, 126, { rx: 12, fill: good ? 'accentWeak' : 'card', stroke: good ? 'none' : 'line', sw: 1.2 }));
    o.push(text(16, y + 22, title, { size: 14, weight: 700, tone: good ? 'accent' : 'warn' }));
    rows.forEach(([k, s], i) => {
      const yy = y + 46 + i * 22;
      o.push(good ? g.check(22, yy - 4, { r: 5 }) : xmark(22, yy - 4, { r: 4.5 }));
      o.push(t13(36, yy, k, { weight: 700, tone: 'sub' }));
      o.push(t13(104, yy, s, { weight: 600 }));
    });
  };
  card(4, '튼튼한 근거 · 모두 갖춰야 해요', [['시각', '증상보다 먼저 변했어요'], ['위치', '증상의 의존 경로 위에 있어요'], ['설명', '모든 증상이 설명돼요'], ['되돌리면', '증상이 사라져요']], true);
  card(138, '약한 근거', [['시각', '같은 시각에 함께 튀었을 뿐'], ['위치', '증상과 이어지지 않은 곳'], ['설명', '일부 증상만 설명돼요'], ['되돌리면', '그대로예요']], false);
  return [300, 268, o];
};

// ── histograms ──

// 버킷은 그 경계 이하를 모두 세요
figs['hist-buckets'] = () => {
  const o = [];
  const counts = [700, 200, 85, 10, 4, 1];
  const names = ['~0.1초', '~0.25', '~0.5', '~1', '~2.5', '그 위'];
  const BW = 44;
  const X = (i) => 20 + i * BW;
  const H = 100;
  counts.forEach((c, i) => {
    const h = Math.max(3, (c / 700) * H);
    o.push(rect(X(i) + 4, 20 + H - h, BW - 8, h, { rx: 3, fill: i === 3 ? 'accent' : 'sub', stroke: 'none', op: i === 3 ? undefined : 0.55 }));
    o.push(label(X(i) + BW / 2, 20 + H - h - 6, `${c}`, i === 3 ? 'accent' : 'text', 700));
    o.push(label(X(i) + BW / 2, 20 + H + 18, names[i], 'sub', 400));
  });
  o.push(line(20, 20 + H, 20 + 6 * BW, 20 + H, { tone: 'weak', sw: 1.5, cap: 'butt' }));
  const cum = [[1, 'le="0.25"', '900'], [2, 'le="0.5"', '985'], [3, 'le="1"', '995'], [5, 'le="+Inf"', '1,000']];
  cum.forEach(([to, nm, v], k) => {
    const y = 172 + k * 28;
    const tone = to === 3 ? 'accent' : 'sub';
    o.push(g.path(`M${X(0) + 4} ${y - 6} v6 H${X(to) + BW - 4} v-6`, { stroke: tone, sw: 1.6 }));
    o.push(text(X(to) + BW - 4, y - 11, `${nm} ${v}`, { size: 13, weight: 700, tone, anchor: 'end' }));
  });
  o.push(t13(X(3) + BW / 2, 74, '990번째', { weight: 700, tone: 'accent', anchor: 'middle' }));
  o.push(line(X(3) + BW / 2, 80, X(3) + BW / 2, 96, { tone: 'accent', sw: 1.5 }));
  return [300, 264, o];
};

// p99는 버킷 안에서 고르게 있다고 보고 추정해요
figs['hist-interp'] = () => {
  const o = [];
  const X = (s) => 30 + ((s - 0.5) / 0.5) * 240;
  o.push(rect(X(0.5), 40, X(1) - X(0.5), 40, { rx: 8, fill: 'accentWeak', stroke: 'accent', sw: 1.4 }));
  o.push(t13(X(0.75), 30, '0.5~1초 칸의 10건', { weight: 700, tone: 'accent', anchor: 'middle' }));
  for (let i = 0; i < 10; i++) {
    const s = 0.55 + i * 0.05;
    const hit = i === 4;
    o.push(g.circle(X(s), 60, hit ? 7 : 5, { fill: hit ? 'accent' : 'card', stroke: 'accent', sw: 1.6 }));
  }
  o.push(label(X(0.55), 100, '986', 'sub', 600));
  o.push(label(X(0.75), 100, '990', 'accent', 700));
  o.push(label(X(1.0), 100, '995', 'sub', 600));
  o.push(line(X(0.5), 118, X(1), 118, { tone: 'weak', sw: 1.5, cap: 'butt' }));
  [[0.5, '0.5초'], [0.75, '0.75'], [1, '1초']].forEach(([s, t]) => {
    o.push(line(X(s), 114, X(s), 122, { tone: 'weak', sw: 1.5 }));
    o.push(label(X(s), 140, t, s === 0.75 ? 'accent' : 'sub', s === 0.75 ? 700 : 400));
  });
  o.push(rect(30, 156, 240, 40, { rx: 10, fill: 'accentWeak', stroke: 'none' }));
  o.push(text(150, 182, 'p99 추정값 0.75초', { size: 14, weight: 700, tone: 'accent', anchor: 'middle' }));
  o.push(t13(150, 218, '0.05초 간격으로 고르게 있다고 보고 계산해요', { tone: 'sub', anchor: 'middle' }));
  o.push(t13(150, 238, '실제로는 0.5~1초 어디든 될 수 있어요', { weight: 600, tone: 'warn', anchor: 'middle' }));
  return [300, 246, o];
};

// OpenTelemetry 기본 경계(밀리초용)에 초 단위 값을 넣으면
figs['hist-otel'] = () => {
  const o = [];
  o.push(t13(8, 16, '버킷 경계: 0, 5, 10, 25, … 10,000', { weight: 600, tone: 'sub' }));
  const cells = [['~0', 0], ['~5', 1], ['~10', 0], ['…', -1], ['~10,000', 0], ['그 위', 0]];
  cells.forEach(([n, v], i) => {
    const x = 8 + i * 48;
    o.push(rect(x, 28, 44, 36, { rx: 6, fill: v > 0 ? 'warn' : 'card', stroke: v < 0 ? 'none' : 'line', sw: 1.2 }));
    o.push(label(x + 22, 51, v > 0 ? '모두' : v < 0 ? '…' : '0', v > 0 ? 'card' : 'sub', 700));
    o.push(label(x + 22, 82, n, v > 0 ? 'warn' : 'sub', v > 0 ? 700 : 400));
  });
  // 확대
  o.push(g.path('M56 66 L20 108 M100 66 L280 108', { stroke: 'warn', sw: 1.2, dash: '3 3' }));
  const X = (s) => 20 + (s / 5) * 260;
  o.push(rect(20, 108, 260, 54, { rx: 8, fill: 'warnWeak', stroke: 'none' }));
  for (let i = 0; i < 9; i++) o.push(g.circle(X(0.2) + (i % 3) * 5 - 5, 128 + Math.floor(i / 3) * 8, 3, { fill: 'accent' }));
  o.push(t13(X(0.2) + 12, 140, '실제 0.2초', { weight: 700, tone: 'accent' }));
  o.push(line(X(4.95), 112, X(4.95), 158, { tone: 'warn', sw: 2.4 }));
  o.push(t13(X(4.95) - 6, 140, 'p99 4.95초', { weight: 700, tone: 'warn', anchor: 'end' }));
  [[0, '0'], [5, '5']].forEach(([s, t]) => o.push(label(X(s), 180, t, 'sub', 400)));
  o.push(t13(150, 206, '칸 하나에 몰리면 그 칸의 끝 쪽을 골라요', { tone: 'sub', anchor: 'middle' }));
  return [300, 214, o];
};

// ── p99-looks-wrong ──

// 990번째가 위 끝이 없는 칸에 들면 p99는 2.5초에 붙어요
figs['p99-inf'] = () => {
  const o = [];
  o.push(rect(8, 30, 170, 54, { rx: 8, fill: 'accentWeak', stroke: 'accent', sw: 1.4 }));
  o.push(text(93, 54, '2.5초 이하', { size: 13, weight: 700, tone: 'accent', anchor: 'middle' }));
  o.push(text(93, 74, '980건', { size: 15, weight: 700, tone: 'accent', anchor: 'middle' }));
  o.push(g.path('M178 30 H270 M178 84 H270', { stroke: 'warn', sw: 1.6 }));
  o.push(rect(178, 30, 92, 54, { rx: 0, fill: 'warnWeak', stroke: 'none' }));
  o.push(arrow([[270, 57], [294, 57]], { tone: 'warn', sw: 2, size: 8 }));
  o.push(text(224, 54, '그 위(+Inf)', { size: 13, weight: 700, tone: 'warn', anchor: 'middle' }));
  o.push(text(224, 74, '20건', { size: 15, weight: 700, tone: 'warn', anchor: 'middle' }));
  o.push(tag(224, 16, '990번째', { tone: 'warn' }));
  o.push(line(178, 92, 178, 112, { tone: 'text', sw: 2 }));
  o.push(t13(178, 130, 'p99 = 2.5초에 붙어요', { weight: 700, anchor: 'middle' }));
  o.push(t13(224, 160, '3초든 30초든', { weight: 600, tone: 'warn', anchor: 'middle' }));
  o.push(t13(224, 178, '같은 칸이에요', { tone: 'warn', anchor: 'middle' }));
  o.push(t13(8, 170, '5분 동안 1,000건', { tone: 'sub' }));
  return [300, 186, o];
};

// 서버마다 버킷 경계가 다르면 더한 값이 거꾸로 줄어요
figs['p99-merge'] = () => {
  const o = [];
  const t = table(4, 4, [{ t: '', w: 104 }, { t: 'le 2.5', w: 62, align: 'right' }, { t: 'le 5.0', w: 62, align: 'right' }, { t: 'le +Inf', w: 64, align: 'right' }], [
    ['새 서버 A', '980', '995', '1,000'],
    ['옛 서버 B', '980', '없음', '1,000'],
    ['같은 le끼리 합', '1,960', '995', '2,000'],
  ], { hl: [2], hlTone: 'warn', rowH: 26 });
  o.push(t.svg);
  const p = plot(50, 130, 220, 70, { x0: 0, x1: 2, y0: 900, y1: 2100 });
  o.push(p.base());
  const pts = [[0, 1960], [1, 995], [2, 2000]];
  o.push(p.line(pts, { tone: 'warn', sw: 2.2 }));
  pts.forEach(([x, v]) => o.push(g.circle(p.sx(x), p.sy(v), 5, { fill: x === 1 ? 'warn' : 'sub', stroke: 'card', sw: 1.5 })));
  o.push(p.xticks([[0, 'le 2.5'], [1, 'le 5.0'], [2, 'le +Inf']]));
  o.push(t13(p.sx(1), p.sy(1600), '앞 칸보다 적어요', { weight: 700, tone: 'warn', anchor: 'middle' }));
  o.push(t13(150, 242, '누적 개수는 오른쪽으로 갈수록 커야 해요', { tone: 'sub', anchor: 'middle' }));
  return [300, 250, o];
};

// ── logs-metrics-traces ──

// 메트릭은 요청을 숫자 하나로 합쳐요
figs['lmt-metric'] = () => {
  const o = [];
  [[50, true], [150, false], [250, true]].forEach(([x, ok]) => {
    o.push(g.envelope(x, 28, { tone: ok ? undefined : 'warn' }));
    o.push(label(x, 58, ok ? '성공' : '실패', ok ? 'sub' : 'warn', 700));
    o.push(arrow([[x, 66], [x < 150 ? 128 : x > 150 ? 172 : 150, 104]], { tone: 'weak', sw: 2, size: 7 }));
  });
  o.push(rect(96, 108, 108, 56, { rx: 10, fill: 'accentWeak', stroke: 'accent', sw: 1.5 }));
  o.push(t13(150, 128, '요청 수', { weight: 600, tone: 'accent', anchor: 'middle' }));
  o.push(text(150, 154, '3', { size: 22, weight: 700, tone: 'accent', anchor: 'middle' }));
  o.push(t13(150, 190, '요청이 늘어도 남는 건 숫자 하나', { weight: 600, anchor: 'middle' }));
  o.push(t13(150, 210, '어느 요청이 실패했는지는 남지 않아요', { tone: 'sub', anchor: 'middle' }));
  return [300, 218, o];
};

// 요청 하나가 남기는 세 신호
figs['lmt-three'] = () => {
  const o = [];
  o.push(g.envelope(150, 22, { tone: 'accent' }));
  o.push(t13(172, 27, '결제 요청 하나', { weight: 700, tone: 'accent' }));
  const X = [52, 150, 248];
  X.forEach((x) => o.push(arrow([[150, 36], [x, 64]], { tone: 'weak', sw: 2, size: 7 })));
  const box = (x) => o.push(rect(x - 46, 68, 92, 64, { rx: 10, fill: 'card', stroke: 'line', sw: 1.2 }));
  // 메트릭
  box(X[0]);
  o.push(t13(X[0], 88, '에러 수', { tone: 'sub', anchor: 'middle' }));
  o.push(text(X[0], 116, '+1', { size: 20, weight: 700, tone: 'warn', anchor: 'middle' }));
  // 트레이스
  box(X[1]);
  [[0, 70, 'sub'], [8, 14, 'sub'], [22, 46, 'warn']].forEach(([s, w, tone], i) => o.push(rect(X[1] - 36 + s, 80 + i * 14, w, 9, { rx: 2, fill: tone, stroke: 'none' })));
  // 로그
  box(X[2]);
  [56, 70, 44].forEach((w, i) => o.push(rect(X[2] - 36, 82 + i * 13, w, 6, { rx: 2, fill: 'sub', stroke: 'none' })));
  o.push(t13(X[2] - 36, 126, 'trace_id', { tone: 'accent', mono: true }).replace('font-size="13"', 'font-size="13"'));
  o.push(line(X[1] + 48, 100, X[2] - 48, 100, { tone: 'accent', sw: 1.6, dash: '3 3' }));
  [['메트릭', '얼마나', '에러율 4.8%'], ['트레이스', '어디서', 'DB 조회 2.1초'], ['로그', '왜', '시간 초과']].forEach(([n, q, a], i) => {
    o.push(label(X[i], 152, n, 'text', 700));
    o.push(label(X[i], 176, q, 'accent', 700));
    o.push(label(X[i], 196, a, 'sub', 600));
  });
  return [300, 204, o];
};


// ── opentelemetry ──

// 데이터가 지나는 길: 앱 SDK → 같은 서버의 Collector(에이전트) → Collector(게이트웨이) → 백엔드
figs['otel-path'] = () => {
  const o = [];
  o.push(zone(4, 4, 140, 170, '서버', { fill: 'card', dash: null, labelTone: 'text' }));
  o.push(g.app(74, 56, '앱 + SDK', { w: 104, tone: 'accent' }));
  o.push(arrow([[74, 70], [74, 112]], { tone: 'accent', sw: 2.2, size: 8 }));
  o.push(t13(82, 96, 'OTLP', { weight: 700, tone: 'accent', mono: true }));
  o.push(g.app(74, 128, 'Collector', { w: 104 }));
  o.push(t13(74, 160, '에이전트', { tone: 'sub', anchor: 'middle', weight: 600 }));
  o.push(arrow([[128, 128], [196, 128]], { tone: 'sub', sw: 2.2, size: 8 }));
  o.push(arrow([[256, 20], [234, 104]], { tone: 'weak', sw: 1.8, size: 7, dash: '4 3' }));
  o.push(t13(292, 18, '다른 서버들', { tone: 'sub', anchor: 'end' }));
  o.push(g.server(222, 128, { tone: 'accent' }));
  o.push(t13(222, 166, 'Collector', { weight: 700, tone: 'accent', anchor: 'middle' }));
  o.push(t13(222, 184, '게이트웨이', { tone: 'sub', anchor: 'middle', weight: 600 }));
  o.push(arrow([[222, 194], [222, 214]], { tone: 'accent', sw: 2.2, size: 8 }));
  o.push(g.db(196, 240, { rx: 14 }));
  o.push(g.panel(248, 240, { w: 44, h: 32 }));
  o.push(t13(222, 278, '백엔드 · 저장과 화면', { weight: 700, anchor: 'middle' }));
  return [300, 286, o];
};

// Collector 안: receiver가 받고, processor가 가공하고, exporter가 내보내요
figs['otel-collector'] = () => {
  const o = [];
  o.push(zone(4, 60, 292, 104, 'Collector 파이프라인', { fill: 'card', dash: null, labelTone: 'sub' }));
  o.push(g.app(60, 20, '앱 + SDK', { w: 96 }));
  o.push(arrow([[60, 34], [60, 88]], { tone: 'sub', sw: 2.2, size: 8 }));
  const st = [[54, 'receiver', '받기'], [150, 'processor', '가공'], [246, 'exporter', '내보내기']];
  st.forEach(([x, n, k], i) => {
    o.push(rect(x - 42, 90, 84, 44, { rx: 8, fill: i === 1 ? 'card' : 'accentWeak', stroke: i === 1 ? 'sub' : 'accent', sw: 1.5 }));
    o.push(text(x, 110, n, { size: 13, weight: 700, mono: true, tone: i === 1 ? 'text' : 'accent', anchor: 'middle' }));
    o.push(t13(x, 127, k, { tone: 'sub', anchor: 'middle', weight: 600 }));
    if (i < 2) o.push(arrow([[x + 42, 112], [x + 54, 112]], { tone: 'accent', sw: 2, size: 7 }));
  });
  o.push(t13(16, 154, '셋을 파이프라인으로 이어야 흘러요', { weight: 600, tone: 'sub' }));
  o.push(arrow([[246, 134], [246, 188]], { tone: 'sub', sw: 2.2, size: 8 }));
  o.push(g.db(246, 208, { rx: 14 }));
  o.push(t13(222, 212, '백엔드', { weight: 700, anchor: 'end' }));
  return [300, 232, o];
};

// ── service-tags ──

const sigIcon = (o, kind, x, y) => {
  if (kind === 'metric') {
    const p = plot(x - 18, y - 12, 36, 24, { x0: 0, x1: 4 });
    o.push(rect(x - 22, y - 16, 44, 32, { rx: 6, fill: 'card', stroke: 'sub', sw: 1.5 }));
    o.push(p.line([[0, 0.2], [1, 0.5], [2, 0.4], [3, 0.8], [4, 0.6]], { tone: 'accent', sw: 1.8 }));
  } else if (kind === 'trace') {
    o.push(rect(x - 22, y - 16, 44, 32, { rx: 6, fill: 'card', stroke: 'sub', sw: 1.5 }));
    [[0, 30], [6, 12], [14, 18]].forEach(([s, w], i) => o.push(rect(x - 16 + s, y - 10 + i * 7, w, 5, { rx: 1.5, fill: 'accent', stroke: 'none' })));
  } else {
    o.push(g.doc(x, y, { lines: 3 }));
  }
};

// 이름표가 같아야 신호가 한 화면에 모여요
figs['st-mismatch'] = () => {
  const o = [];
  const rows = [['metric', '지표', 'checkout', 'soft'], ['trace', '트레이스', 'checkout', 'soft'], ['log', '로그', 'checkout-api', 'warnSoft']];
  rows.forEach(([k, n, nm, tone], i) => {
    const y = 34 + i * 62;
    sigIcon(o, k, 28, y);
    o.push(t13(58, y - 4, n, { weight: 700 }));
    o.push(tag(58, y + 16, nm, { tone, anchor: 'start', weight: 600 }));
  });
  o.push(arrow([[150, 34], [204, 70]], { tone: 'accent', sw: 2.2, size: 8 }));
  o.push(arrow([[150, 96], [204, 86]], { tone: 'accent', sw: 2.2, size: 8 }));
  o.push(arrow([[160, 158], [204, 186]], { tone: 'warn', sw: 2, size: 8, dash: '4 3' }));
  o.push(g.panel(250, 80, { w: 80, h: 58 }));
  o.push(t13(250, 128, 'checkout 화면', { weight: 700, tone: 'accent', anchor: 'middle' }));
  o.push(t13(250, 146, '로그가 없어요', { weight: 600, tone: 'warn', anchor: 'middle' }));
  o.push(g.panel(250, 196, { w: 64, h: 40, points: null }));
  o.push(t13(250, 234, '다른 서비스로', { weight: 600, tone: 'warn', anchor: 'middle' }));
  return [300, 244, o];
};

// namespace 안의 서비스, 서비스 안의 인스턴스
figs['st-tree'] = () => {
  const o = [];
  o.push(zone(4, 4, 292, 168, '', { fill: 'card', dash: null }));
  o.push(t13(16, 24, 'shop', { weight: 700 }));
  o.push(tag(54, 20, 'namespace', { tone: 'sub', anchor: 'start', weight: 600 }));
  const svc = (x, w, name, pods, accent) => {
    o.push(rect(x, 40, w, 120, { rx: 10, fill: accent ? 'accentWeak' : 'bg', stroke: accent ? 'accent' : 'line', sw: 1.4 }));
    o.push(t13(x + 10, 60, name, { weight: 700, tone: accent ? 'accent' : 'text' }));
    if (accent) o.push(t13(x + w - 10, 60, 'service', { tone: 'sub', anchor: 'end' }));
    pods.forEach((pd, i) => {
      const cx = x + (w / (pods.length + 1)) * (i + 1);
      o.push(rect(cx - 22, 76, 44, 44, { rx: 8, fill: 'card', stroke: 'sub', sw: 1.5 }));
      o.push(g.server(cx, 98, { tone: accent ? 'accent' : undefined }).replace(/stroke-width="1.8"/, 'stroke-width="1.6"'));
      o.push(label(cx, 138, pd, 'text', 600));
    });
    o.push(t13(x + w / 2, 154, 'instance', { tone: 'sub', anchor: 'middle' }));
  };
  svc(14, 168, 'checkout', ['pod-a', 'pod-b'], true);
  svc(190, 96, 'payment', ['pod-c'], false);
  o.push(t13(150, 196, '인스턴스가 몇 개든 서비스 이름은 하나예요', { weight: 600, tone: 'sub', anchor: 'middle' }));
  return [300, 204, o];
};

// 이름표는 앱과 에이전트에서 붙어요
figs['st-attach'] = () => {
  const o = [];
  const card = (y, title, note, pills) => {
    o.push(t13(8, y, title, { weight: 700 }));
    o.push(t13(292, y, note, { tone: 'sub', anchor: 'end' }));
    o.push(rect(4, y + 10, 292, 72, { rx: 10, fill: 'card', stroke: 'line', sw: 1.2 }));
    let x = 14;
    let yy = y + 32;
    pills.forEach(([s, isNew]) => {
      const w = tag.width(s, { size: 13, weight: 600 });
      if (x + w > 288) { x = 14; yy += 28; }
      o.push(tag(x, yy, s, { tone: isNew ? 'accent' : 'sub', anchor: 'start', weight: 600 }));
      x += w + 6;
    });
  };
  card(18, '앱 SDK', '환경 변수로 정해요', [['service=checkout', true], ['version=1.4.2', true], ['env=prod', true]]);
  o.push(arrow([[150, 104], [150, 124]], { tone: 'weak', sw: 2, size: 7 }));
  card(144, '에이전트·Collector', '어디서 도는지 덧붙여요', [['service=checkout'], ['version=1.4.2'], ['env=prod'], ['pod=pod-a', true], ['node=node-3', true]]);
  return [300, 232, o];
};

// 알림의 서비스 이름표로 카탈로그를 찾아 주인 팀에게
figs['st-catalog'] = () => {
  const o = [];
  o.push(g.bell(26, 34));
  o.push(t13(46, 30, '알림', { weight: 700, tone: 'warn' }));
  o.push(tag(46, 46, 'service=checkout', { tone: 'warnSoft', anchor: 'start', weight: 600 }));
  o.push(arrow([[100, 60], [100, 84]], { tone: 'sub', sw: 2, size: 7 }));
  o.push(t13(110, 78, '이름으로 찾아요', { tone: 'sub', weight: 600 }));
  o.push(t13(8, 104, '서비스 카탈로그', { weight: 700, tone: 'sub' }));
  const t = table(4, 112, [{ t: '서비스', w: 92 }, { t: '주인', w: 70 }, { t: '런북', w: 130 }], [['checkout', '결제팀', '결제 장애 대응'], ['payment', '정산팀', '정산 지연 대응']], { hl: [0], rowH: 26 });
  o.push(t.svg);
  o.push(arrow([[120, 190], [80, 218]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(arrow([[230, 190], [230, 218]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(g.phone(60, 240, { tone: 'accent' }));
  o.push(t13(76, 236, '결제팀 당직', { weight: 700, tone: 'accent' }));
  o.push(t13(76, 254, '호출해요', { tone: 'sub' }));
  o.push(g.doc(206, 242, { lines: 3 }));
  o.push(t13(226, 238, '런북', { weight: 700, tone: 'accent' }));
  o.push(t13(226, 256, '대응 절차', { tone: 'sub' }));
  return [300, 266, o];
};

// ── log-collection ──

// 로그가 지나는 길
figs['lc-path'] = () => {
  const o = [];
  o.push(g.server(36, 40));
  o.push(label(36, 76, '앱', 'text', 700));
  o.push(arrow([[56, 40], [104, 40]], { tone: 'sub', sw: 2, size: 7 }));
  o.push(t13(80, 32, '써요', { tone: 'sub', anchor: 'middle' }));
  o.push(g.doc(130, 40, { lines: 3 }));
  o.push(label(130, 76, '로그 파일', 'text', 700));
  o.push(label(130, 94, '회전돼요', 'sub', 400));
  o.push(arrow([[150, 40], [214, 40]], { tone: 'accent', sw: 2.2, size: 7 }));
  o.push(t13(182, 32, '따라 읽어요', { tone: 'accent', anchor: 'middle', weight: 600 }));
  o.push(g.server(242, 40, { tone: 'accent' }));
  o.push(g.path('M258 18 v14 l4 -3 l4 3 v-14 z', { fill: 'accent', stroke: 'none' }));
  o.push(label(242, 76, '수집 에이전트', 'accent', 700));
  o.push(label(242, 94, '위치 기록', 'sub', 400));
  o.push(arrow([[242, 104], [242, 140]], { tone: 'accent', sw: 2.2, size: 8 }));
  o.push(g.db(242, 164));
  o.push(label(242, 200, '저장소 · 색인', 'text', 700));
  o.push(arrow([[218, 164], [146, 164]], { tone: 'sub', sw: 2, size: 7 }));
  o.push(g.magnifier(104, 162));
  o.push(g.bell(132, 166, { tone: 'warn' }));
  o.push(label(116, 200, '검색·알림', 'text', 700));
  o.push(t13(8, 228, '검색과 알림은 저장소에 들어간 로그만 봐요', { tone: 'sub' }));
  return [300, 236, o];
};

// 어디까지 읽었는지 기록해요
figs['lc-position'] = () => {
  const o = [];
  const CW = 26;
  const X = (i) => 8 + i * CW;
  const row = (y, title, cells, mark, rangeA, rangeB, rangeLabel, rangeTone) => {
    o.push(t13(8, y, title, { weight: 700 }));
    cells.forEach((c, i) => {
      const fill = c === 's' ? 'line' : c === 'a' ? 'accent' : c === 'w' ? 'warn' : 'card';
      o.push(rect(X(i), y + 20, CW - 4, 26, { rx: 4, fill, stroke: c === 'n' ? 'line' : 'none', sw: 1.2 }));
      o.push(text(X(i) + (CW - 4) / 2, y + 38, String(i + 1), { size: 13, weight: 700, tone: c === 'a' || c === 'w' ? 'card' : 'sub', anchor: 'middle' }));
    });
    if (mark != null) o.push(g.path(`M${X(mark) + 5} ${y + 18} v-12 h12 v12 l-6 -4 z`, { fill: 'accent', stroke: 'none' }));
    o.push(g.path(`M${X(rangeA) + 2} ${y + 52} v5 H${X(rangeB) + CW - 6} v-5`, { stroke: rangeTone, sw: 1.6 }));
    o.push(t13(X(8) + 4, y + 38, rangeLabel, { weight: 700, tone: rangeTone }));
  };
  row(16, '위치 기록이 있으면', ['s', 's', 's', 's', 'a', 'a', 'a', 'a'], 3, 4, 7, '이어 읽음', 'accent');
  row(92, '위치 기록이 없으면', ['s', 's', 's', 's', 'w', 'w', 'w', 'w'], null, 4, 7, '놓침', 'warn');
  o.push(t13(292, 92, '파일 끝부터 읽어서', { tone: 'warn', weight: 600, anchor: 'end' }));
  row(168, '갑자기 죽었다가 다시 켜면', ['s', 's', 's', 's', 'w', 'w', 'n', 'n'], 3, 4, 5, '다시 보냄', 'warn');
  o.push(rect(8, 250, 16, 12, { rx: 3, fill: 'line', stroke: 'none' }));
  o.push(t13(30, 261, '이미 보낸 줄', { tone: 'sub' }));
  o.push(g.path('M130 262 v-12 h12 v12 l-6 -4 z', { fill: 'accent', stroke: 'none' }));
  o.push(t13(148, 261, '기록한 위치', { tone: 'sub' }));
  return [300, 270, o];
};

// 회전 방식 두 가지
figs['lc-rotation'] = () => {
  const o = [];
  const panel = (y0, title, copy) => {
    o.push(rect(4, y0, 292, 128, { rx: 12, fill: 'card', stroke: 'none' }));
    o.push(text(16, y0 + 22, title, { size: 14, weight: 700 }));
    o.push(g.server(34, y0 + 72));
    o.push(label(34, y0 + 108, '앱', 'text', 600));
    o.push(g.doc(196, y0 + 54, { lines: copy ? 0 : 1 }));
    o.push(t13(216, y0 + 52, 'app.log', { weight: 700, mono: true }));
    o.push(t13(216, y0 + 70, copy ? '비웠어요' : '새 빈 파일', { tone: 'sub' }));
    o.push(g.doc(196, y0 + 100, { lines: 3 }));
    o.push(t13(216, y0 + 98, 'app.log.1', { weight: 700, mono: true }));
    o.push(t13(216, y0 + 116, copy ? '복사본' : '옛 파일', { tone: 'sub' }));
    if (copy) {
      o.push(arrow([[56, y0 + 66], [176, y0 + 54]], { tone: 'sub', sw: 2, size: 7 }));
      o.push(t13(116, y0 + 50, '같은 파일에 써요', { tone: 'sub', anchor: 'middle' }));
      o.push(xmark(68, y0 + 94, { r: 4.5 }));
      o.push(t13(78, y0 + 99, '그 틈의 줄을 잃어요', { weight: 700, tone: 'warn' }));
    } else {
      o.push(arrow([[56, y0 + 78], [176, y0 + 98]], { tone: 'warn', sw: 2, size: 7 }));
      o.push(t13(64, y0 + 52, '다시 열기 전까지', { weight: 700, tone: 'warn' }));
    }
  };
  panel(4, '이름 바꾸기', false);
  o.push(t13(80, 74, '옛 파일에 써요', { weight: 700, tone: 'warn' }));
  panel(140, '복사 후 비우기', true);
  return [300, 272, o];
};

// 저장소가 막히면 쌓였다가 버려져요
figs['lc-retry'] = () => {
  const o = [];
  o.push(g.server(36, 60, { tone: 'accent' }));
  o.push(label(36, 96, '에이전트', 'accent', 700));
  // 버퍼
  o.push(rect(78, 30, 70, 60, { rx: 8, fill: 'card', stroke: 'sub', sw: 1.4 }));
  o.push(t13(113, 24, '버퍼', { weight: 700, anchor: 'middle' }));
  for (let i = 0; i < 3; i++) o.push(rect(88, 40 + i * 16, 50, 12, { rx: 3, fill: i === 0 ? 'warn' : 'accentWeak', stroke: 'none' }));
  o.push(arrow([[148, 52], [226, 52]], { tone: 'sub', sw: 2.2, size: 8 }));
  o.push(t13(188, 44, '묶음 보내기', { tone: 'sub', anchor: 'middle' }));
  o.push(g.db(254, 60, { tone: 'warn' }));
  o.push(xmark(274, 40, { r: 5 }));
  o.push(label(254, 96, '응답 없음', 'warn', 700));
  o.push(g.path('M226 72 Q188 100 150 78', { stroke: 'warn', sw: 2, dash: '4 3' }));
  o.push(g.head(150, 78, 160, 86, { tone: 'warn', size: 7 }));
  o.push(t13(188, 112, '실패하면 다시', { weight: 600, tone: 'warn', anchor: 'middle' }));
  o.push(arrow([[113, 92], [113, 146]], { tone: 'warn', sw: 2, size: 8 }));
  o.push(g.trash(113, 168));
  o.push(t13(136, 164, '재시도 한도를 넘기면 버려요', { weight: 700, tone: 'warn' }));
  o.push(t13(136, 182, 'Fluent Bit 기본 한도 1', { tone: 'sub' }));
  return [300, 194, o];
};

// 여러 줄 스택 트레이스: 묶지 않으면 로그 4개
figs['lc-multiline'] = () => {
  const o = [];
  const lines = ['Exception: timeout', '  at db.query', '  at order.save', '  at http.handle'];
  o.push(rect(4, 4, 292, 92, { rx: 8, fill: 'card', stroke: 'line', sw: 1.2 }));
  lines.forEach((s, i) => o.push(text(16, 26 + i * 20, s, { size: 13, mono: true, weight: i ? 400 : 700, tone: i ? 'sub' : 'warn' })));
  o.push(t13(8, 120, '묶지 않으면 로그 4개', { weight: 700, tone: 'warn' }));
  lines.forEach((s, i) => {
    o.push(rect(4, 128 + i * 26, 140, 22, { rx: 5, fill: 'warnWeak', stroke: 'none' }));
    o.push(text(12, 143 + i * 26, i ? s.trim() : 'Exception', { size: 13, mono: true, tone: i ? 'sub' : 'warn' }));
  });
  o.push(t13(156, 120, '묶으면 로그 하나', { weight: 700, tone: 'accent' }));
  o.push(rect(156, 128, 140, 100, { rx: 6, fill: 'accentWeak', stroke: 'accent', sw: 1.4 }));
  lines.forEach((s, i) => o.push(text(164, 148 + i * 22, i ? s.trim() : 'Exception', { size: 13, mono: true, tone: i ? 'sub' : 'accent' })));
  o.push(t13(8, 248, "'at' 줄만 보면 어느 예외인지 몰라요", { tone: 'sub' }));
  return [300, 256, o];
};

// ── cardinality-explosion ──

// 경로 틀과 실제 경로
figs['card-route'] = () => {
  const o = [];
  const panel = (px, title, series, grow) => {
    o.push(rect(px, 4, 144, 244, { rx: 12, fill: 'card', stroke: 'none' }));
    o.push(text(px + 12, 26, title, { size: 13, weight: 700 }));
    [0, 1, 2].forEach((i) => {
      o.push(g.person(px + 30 + i * 40, 62));
      o.push(label(px + 30 + i * 40, 94, `u${i + 1}`, 'sub', 600));
    });
    o.push(arrow([[px + 72, 102], [px + 72, 122]], { tone: 'weak', sw: 2, size: 7 }));
    series.forEach((s, i) => {
      o.push(rect(px + 10, 128 + i * 26, 124, 22, { rx: 5, fill: grow ? 'warnWeak' : 'accentWeak', stroke: 'none' }));
      o.push(text(px + 18, 143 + i * 26, s, { size: 13, mono: true, weight: 600, tone: grow ? 'warn' : 'accent' }));
    });
    o.push(t13(px + 72, 236, grow ? '사용자 수만큼 늘어요' : '있던 시계열에 더해요', { weight: 700, tone: grow ? 'warn' : 'accent', anchor: 'middle' }));
  };
  panel(4, '경로 틀을 넣을 때', ['/users/:id'], false);
  panel(152, '실제 경로를 넣을 때', ['/users/1', '/users/2', '/users/3'], true);
  o.push(t13(224, 214, '…', { weight: 700, tone: 'warn', anchor: 'middle' }));
  return [300, 252, o];
};

// route를 지우면 남은 레이블이 같아져 한 조합으로 겹쳐요
figs['card-merge'] = () => {
  const o = [];
  ['/users/1', '/users/2', '/users/3'].forEach((r, i) => {
    const y = 10 + i * 34;
    o.push(rect(4, y, 150, 28, { rx: 6, fill: 'card', stroke: 'line', sw: 1.2 }));
    o.push(text(12, y + 19, 'GET', { size: 13, weight: 700, mono: true, tone: 'accent' }));
    o.push(text(48, y + 19, r, { size: 13, mono: true, tone: 'sub' }));
    o.push(line(46, y + 15, 46 + r.length * 7.9, y + 15, { tone: 'warn', sw: 1.6 }));
    o.push(arrow([[158, y + 14], [196, 52]], { tone: 'warn', sw: 1.8, size: 7 }));
  });
  o.push(rect(200, 34, 96, 36, { rx: 8, fill: 'warnWeak', stroke: 'warn', sw: 1.6 }));
  o.push(text(248, 57, 'GET', { size: 14, weight: 700, mono: true, tone: 'warn', anchor: 'middle' }));
  o.push(t13(248, 92, '같은 조합 하나', { weight: 700, tone: 'warn', anchor: 'middle' }));
  o.push(t13(150, 136, 'route를 지우면 셋 다 method="GET"만 남아요', { tone: 'sub', anchor: 'middle' }));
  o.push(t13(150, 156, '값이 하나만 남고 나머지는 덮여요', { weight: 700, tone: 'warn', anchor: 'middle' }));
  return [300, 164, o];
};

// ── monitoring-ha ──

// 같은 대상을 Prometheus 두 대가 수집하고, 둘 다 중앙 저장소와 Alertmanager 두 대에 보내요
figs['ha-topology'] = () => {
  const o = [];
  const T = [36, 124];
  const A = [138, 54];
  const B = [138, 194];
  const S = [254, 54];
  const M = [254, 194];
  [[T, A], [T, B]].forEach(([a, b]) => o.push(arrow([[a[0] + 16, a[1]], [b[0] - 18, b[1]]], { tone: 'sub', sw: 2, size: 7 })));
  [[A, S], [B, S]].forEach(([a, b]) => o.push(arrow([[a[0] + 18, a[1]], [b[0] - 22, b[1] + (a === B ? 10 : 0)]], { tone: 'accent', sw: 2, size: 7 })));
  [[A, M], [B, M]].forEach(([a, b]) => o.push(arrow([[a[0] + 18, a[1] + 4], [b[0] - 30, b[1] - (a === A ? 10 : 0)]], { tone: 'warn', sw: 1.8, size: 7, dash: '4 3' })));
  o.push(g.server(T[0], T[1]));
  o.push(label(T[0], T[1] + 34, '수집 대상', 'text', 700));
  for (const [P, n, r] of [[A, '수집 A', 'replica=a'], [B, '수집 B', 'replica=b']]) {
    o.push(g.server(P[0], P[1], { tone: 'accent' }));
    o.push(label(P[0], P[1] + 34, n, 'accent', 700));
    o.push(text(P[0], P[1] + 52, r, { size: 13, tone: 'sub', anchor: 'middle', mono: true }));
  }
  o.push(g.db(S[0], S[1], { tone: 'accent' }));
  o.push(t13(294, S[1] + 34, '중앙 저장소', { weight: 700, tone: 'accent', anchor: 'end' }));
  o.push(t13(294, S[1] + 52, 'Thanos·Mimir', { tone: 'sub', anchor: 'end' }));
  o.push(g.bell(M[0] - 14, M[1]));
  o.push(g.bell(M[0] + 14, M[1]));
  o.push(t13(294, M[1] + 34, 'Alertmanager', { weight: 700, tone: 'warn', anchor: 'end' }));
  o.push(t13(294, M[1] + 52, '두 대', { tone: 'sub', anchor: 'end' }));
  return [300, 252, o];
};


const only = process.argv.slice(2);
for (const [name, fn] of Object.entries(figs)) {
  if (only.length && !only.some((p) => name.startsWith(p))) continue;
  const [w, h, body] = fn();
  g.save(D, name, w, h, body);
}
console.log('done');
