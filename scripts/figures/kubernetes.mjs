// 컨테이너·쿠버네티스 글의 SVG 그림. 실행: node scripts/figures/kubernetes.mjs [이름 접두어...]
import * as g from './lib.mjs';

const { text, tag, line, arrow, zone, table, rect, ladder, xmark, plot } = g;
const D = 'kubernetes';
const figs = {};
const label = (x, y, s, tone = 'sub', weight = 600) => text(x, y, s, { size: 13, weight, tone, anchor: 'middle' });
const t13 = (x, y, s, o = {}) => text(x, y, s, { size: 13, ...o });
// 한 줄 안에서 색·굵기가 다른 글자(tspan으로 이어 붙여 폭 어림에 기대지 않아요)
const spans = (x, y, parts, o = {}) => {
  const ff = o.mono ? ' font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"' : '';
  const body = parts.map(([str, tone = 'text', w]) => `<tspan${w ? ` font-weight="${w}"` : ''} style="fill:${g.color(tone)}">${String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</tspan>`).join('');
  return `<text x="${x}" y="${y}" font-size="13"${ff}>${body}</text>`;
};

// 파드: 둥근 상자. tone은 new(파랑 채움), soft(옅은 파랑), old(회색), warn, ghost(점선)
const POD = {
  new: { fill: 'accent', stroke: 'none', tx: 'card' },
  soft: { fill: 'accentWeak', stroke: 'accent', tx: 'accent' },
  old: { fill: 'card', stroke: 'sub', tx: 'text' },
  warn: { fill: 'warnWeak', stroke: 'warn', tx: 'warn' },
  ghost: { fill: 'none', stroke: 'weak', tx: 'weak', dash: '4 3' },
};
const pod = (cx, cy, s = '파드', o = {}) => {
  const { w = 44, h = 26, tone = 'soft' } = o;
  const st = POD[tone];
  return [
    rect(cx - w / 2, cy - h / 2, w, h, { rx: 8, fill: st.fill, stroke: st.stroke, sw: 1.5, dash: st.dash }),
    s ? text(cx, cy + 4.7, s, { size: 13, weight: 700, tone: st.tx, anchor: 'middle' }) : '',
  ].join('\n');
};
// 이름 상자(제목 + 작은 글)
const box = (x, y, w, h, title, sub, o = {}) => {
  const { tone = 'plain' } = o;
  const fill = { accent: 'accent', soft: 'accentWeak', plain: 'card', warn: 'warnWeak', bg: 'bg' }[tone];
  const stroke = { accent: 'none', soft: 'accent', plain: 'sub', warn: 'warn', bg: 'line' }[tone];
  const tx = { accent: 'card', soft: 'accent', plain: 'text', warn: 'warn', bg: 'text' }[tone];
  const out = [rect(x, y, w, h, { rx: 8, fill, stroke, sw: 1.5 })];
  if (sub) {
    out.push(text(x + w / 2, y + h / 2 - 3, title, { size: 13, weight: 700, tone: tx, anchor: 'middle' }));
    out.push(text(x + w / 2, y + h / 2 + 15, sub, { size: 13, tone: tone === 'accent' ? 'card' : 'sub', anchor: 'middle' }));
  } else {
    out.push(text(x + w / 2, y + h / 2 + 4.7, title, { size: 13, weight: 700, tone: tx, anchor: 'middle' }));
  }
  return out.join('\n');
};

// ── overview ──

// 원하는 상태를 적으면: API 서버를 가운데 두고 맞춰 가요
figs['ov-flow'] = () => {
  const o = [];
  o.push(g.person(118, 24));
  o.push(t13(138, 20, '사용자', { weight: 700 }));
  o.push(t13(138, 38, '① 파드 3개를 원해요', { tone: 'accent', weight: 600 }));
  o.push(zone(4, 54, 292, 160, '컨트롤 플레인', { fill: 'card', dash: null, labelTone: 'text' }));
  o.push(arrow([[118, 42], [118, 82]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(box(70, 84, 96, 30, 'API 서버', null, { tone: 'accent' }));
  o.push(g.db(252, 86));
  o.push(label(252, 120, 'etcd', 'text', 700));
  o.push(label(252, 136, '② 적어 둬요', 'sub', 600));
  o.push(arrow([[166, 92], [232, 92]], { tone: 'sub', sw: 1.8, size: 6, start: true }));
  o.push(box(12, 152, 104, 50, '컨트롤러', '③ 파드를 만들어요'));
  o.push(box(192, 152, 98, 50, '스케줄러', '④ 노드를 정해요'));
  o.push(arrow([[90, 114], [64, 150]], { tone: 'sub', sw: 1.8, size: 6, start: true }));
  o.push(arrow([[150, 114], [222, 150]], { tone: 'sub', sw: 1.8, size: 6, start: true }));
  // 노드
  for (const [x, n, pods] of [[4, '노드 1', [44, 102]], [154, '노드 2', [71]]]) {
    o.push(zone(x, 238, 142, 100, n, { fill: 'card', dash: null, labelTone: 'text' }));
    o.push(box(x + 12, 262, 118, 26, 'kubelet', null, { tone: 'soft' }));
    pods.forEach((dx) => o.push(pod(x + dx, 314)));
  }
  o.push(line(128, 120, 128, 224, { tone: 'accent', sw: 2 }));
  o.push(g.head(128, 115, 128, 125, { tone: 'accent', size: 7 }));
  o.push(arrow([[128, 224], [75, 261]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(arrow([[128, 224], [225, 261]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(t13(150, 360, '⑤ kubelet이 컨테이너를 띄우고 ⑥ 상태를 알려요', { tone: 'accent', weight: 600, anchor: 'middle' }));
  return [300, 368, o];
};

// ── containers ──

// 가상 머신은 운영체제를 통째로, 컨테이너는 커널 하나를 함께
figs['ct-vm-vs-container'] = () => {
  const o = [];
  const layer = (x, y, w, h, s, tone = 'plain') => o.push(box(x, y, w, h, s, null, { tone }));
  const panel = (px, title) => {
    o.push(rect(px, 4, 144, 262, { rx: 12, fill: 'card', stroke: 'none' }));
    o.push(text(px + 72, 26, title, { size: 14, weight: 700, anchor: 'middle' }));
  };
  panel(4, '가상 머신');
  panel(152, '컨테이너');
  // 가상 머신
  for (const [i, a] of [[0, '앱 A'], [1, '앱 B']]) {
    const x = 12 + i * 66;
    layer(x, 64, 62, 28, a, 'soft');
    o.push(rect(x, 96, 62, 52, { rx: 8, fill: 'warnWeak', stroke: 'warn', sw: 1.5 }));
    o.push(label(x + 31, 118, '게스트', 'warn', 700));
    o.push(label(x + 31, 136, 'OS', 'warn', 700));
  }
  layer(12, 152, 128, 28, '하이퍼바이저', 'bg');
  layer(12, 184, 128, 28, '하드웨어', 'bg');
  // 컨테이너
  for (const [i, a] of [[0, '앱 A'], [1, '앱 B']]) layer(160 + i * 66, 64, 62, 28, a, 'soft');
  o.push(g.path('M160 98 h128', { stroke: 'line', sw: 1, dash: '3 3' }));
  layer(160, 120, 128, 28, '컨테이너 런타임', 'bg');
  o.push(rect(160, 152, 128, 28, { rx: 8, fill: 'accentWeak', stroke: 'accent', sw: 1.5 }));
  o.push(label(224, 171, '호스트 OS 커널', 'accent', 700));
  layer(160, 184, 128, 28, '하드웨어', 'bg');
  o.push(label(76, 234, '앱마다 OS를 통째로', 'warn', 700));
  o.push(label(224, 234, '커널 하나를 함께 써요', 'accent', 700));
  o.push(label(76, 254, '무겁지만 격리가 단단해요', 'sub', 400));
  o.push(label(224, 254, '가볍지만 격리는 느슨해요', 'sub', 400));
  return [300, 270, o];
};

// ── pods-and-nodes ──

// 한 파드 안의 두 컨테이너: 같은 IP, localhost, 공유 볼륨
figs['pn-pod'] = () => {
  const o = [];
  o.push(rect(4, 4, 292, 206, { rx: 14, fill: 'accentWeak', stroke: 'accent', sw: 1.6 }));
  o.push(text(18, 28, '파드', { size: 14, weight: 700, tone: 'accent' }));
  o.push(tag(286, 22, 'IP 10.1.2.3', { tone: 'accent', anchor: 'end' }));
  o.push(rect(18, 46, 112, 54, { rx: 9, fill: 'card', stroke: 'accent', sw: 1.5 }));
  o.push(label(74, 68, '앱 컨테이너', 'text', 700));
  o.push(text(74, 88, ':8080', { size: 13, tone: 'sub', anchor: 'middle', mono: true }));
  o.push(rect(170, 46, 112, 54, { rx: 9, fill: 'card', stroke: 'sub', sw: 1.5 }));
  o.push(label(226, 68, '로그 수집', 'text', 700));
  o.push(label(226, 88, '보조 컨테이너', 'sub', 400));
  o.push(arrow([[134, 66], [166, 66]], { tone: 'accent', sw: 1.8, size: 6, start: true }));
  o.push(text(150, 120, 'localhost', { size: 13, weight: 600, tone: 'accent', anchor: 'middle', mono: true }));
  o.push(line(150, 70, 150, 106, { tone: 'accent', sw: 1, dash: '2 3' }));
  o.push(g.folder(150, 166, { tone: 'accent' }));
  o.push(label(150, 198, '공유 볼륨', 'accent', 700));
  o.push(arrow([[74, 102], [74, 166], [128, 166]], { tone: 'sub', sw: 1.8, size: 6 }));
  o.push(t13(80, 148, '로그를 써요', { tone: 'sub' }));
  o.push(arrow([[172, 166], [226, 166], [226, 102]], { tone: 'sub', sw: 1.8, size: 6 }));
  o.push(t13(220, 148, '읽어 가요', { tone: 'sub', anchor: 'end' }));
  return [300, 214, o];
};

// ── workloads ──

// Deployment → ReplicaSet → 파드 셋. 하나가 죽으면 ReplicaSet이 새로 띄워요
figs['wl-owner'] = () => {
  const o = [];
  o.push(box(86, 6, 128, 34, 'Deployment', null, { tone: 'soft' }));
  o.push(arrow([[150, 40], [150, 66]], { tone: 'sub', sw: 2, size: 7 }));
  o.push(t13(158, 58, '만들어요', { tone: 'sub' }));
  o.push(box(86, 68, 128, 34, 'ReplicaSet', null, { tone: 'plain' }));
  o.push(t13(222, 90, '3개를 지켜요', { tone: 'accent', weight: 600 }));
  const X = [52, 116, 180];
  X.forEach((cx) => o.push(arrow([[150, 102], [cx, 136]], { tone: 'sub', sw: 1.8, size: 6 })));
  o.push(pod(X[0], 150, '파드'));
  o.push(pod(X[1], 150, '파드', { tone: 'warn' }));
  o.push(xmark(X[1] + 22, 138, { r: 5 }));
  o.push(pod(X[2], 150, '파드'));
  o.push(arrow([[214, 102], [252, 136]], { tone: 'accent', sw: 1.8, size: 6, dash: '4 3' }));
  o.push(pod(252, 150, '새 파드', { tone: 'new', w: 64 }));
  o.push(label(X[1], 182, '죽었어요', 'warn', 700));
  o.push(label(252, 182, '새로 띄워요', 'accent', 700));
  return [300, 190, o];
};

// 롤링 업데이트: 하나씩 바꿔 끼워요
figs['wl-rolling'] = () => {
  const o = [];
  const rows = [
    ['처음', [['old', 4]], 4, 4],
    ['새 하나 띄움', [['old', 4], ['ghost', 1]], 4, 5],
    ['옛 하나 내림', [['old', 3], ['new', 1]], 4, 4],
    ['새 하나 띄움', [['old', 3], ['new', 1], ['ghost', 1]], 4, 5],
    ['…', null, null, null],
    ['끝', [['new', 4]], 4, 4],
  ];
  o.push(t13(240, 16, '준비', { tone: 'sub', anchor: 'middle', weight: 600 }));
  o.push(t13(280, 16, '모두', { tone: 'sub', anchor: 'middle', weight: 600 }));
  rows.forEach(([n, pods, ready, total], r) => {
    const y = 40 + r * 34;
    if (!pods) {
      o.push(text(64, y + 5, '같은 순서를 되풀이해요', { size: 13, tone: 'sub' }));
      return;
    }
    o.push(t13(8, y + 5, n, { weight: 600 }));
    let i = 0;
    for (const [tone, k] of pods) for (let j = 0; j < k; j++) {
      const cx = 104 + i * 25;
      o.push(rect(cx - 10, y - 10, 20, 20, { rx: 5, fill: POD[tone].fill, stroke: POD[tone].stroke, sw: 1.5, dash: POD[tone].dash }));
      i++;
    }
    o.push(text(240, y + 5, String(ready), { size: 14, weight: 700, tone: 'accent', anchor: 'middle' }));
    o.push(text(280, y + 5, String(total), { size: 14, weight: 700, tone: total > 4 ? 'warn' : 'text', anchor: 'middle' }));
  });
  o.push(line(4, 236, 296, 236, { tone: 'line', sw: 1, cap: 'butt' }));
  o.push(t13(8, 258, '기본 설정에서는', { tone: 'sub' }));
  o.push(t13(292, 258, '준비 3개 이상, 모두 5개 이하', { weight: 700, tone: 'accent', anchor: 'end' }));
  const lg = [['old', '옛 버전'], ['new', '새 버전'], ['ghost', '뜨는 중']];
  lg.forEach(([tone, s], i) => {
    const x = 8 + i * 96;
    o.push(rect(x, 276, 16, 16, { rx: 4, fill: POD[tone].fill, stroke: POD[tone].stroke, sw: 1.5, dash: POD[tone].dash }));
    o.push(t13(x + 22, 289, s, { tone: 'sub' }));
  });
  return [300, 298, o];
};

// CronJob은 날마다 Job을 새로 만들어요
figs['wl-cronjob'] = () => {
  const o = [];
  o.push(rect(70, 6, 160, 44, { rx: 10, fill: 'accentWeak', stroke: 'accent', sw: 1.5 }));
  o.push(g.clock(94, 28, { r: 12, h: 2, m: 0, tone: 'accent' }));
  o.push(text(114, 24, 'CronJob', { size: 13, weight: 700, tone: 'accent' }));
  o.push(t13(114, 42, '매일 새벽 2시', { tone: 'sub' }));
  const days = [[52, '1일', true], [150, '2일', true], [248, '3일', false]];
  days.forEach(([cx, d, ok]) => {
    o.push(arrow([[150, 50], [cx, 80]], { tone: 'sub', sw: 1.6, size: 6 }));
    o.push(label(cx, 96, d, 'sub', 600));
    o.push(box(cx - 40, 104, 80, 30, 'Job', null, { tone: ok ? 'plain' : 'warn' }));
    if (ok) {
      o.push(pod(cx, 162, '파드', { w: 50 }));
      o.push(g.check(cx - 8, 196, { r: 5 }));
      o.push(t13(cx + 2, 201, '성공', { weight: 700, tone: 'accent' }));
    } else {
      for (let i = 0; i < 3; i++) o.push(rect(cx - 38 + i * 20, 152, 16, 20, { rx: 4, fill: 'warnWeak', stroke: 'warn', sw: 1.4 }));
      o.push(t13(cx + 36, 167, '…', { weight: 700, tone: 'warn', anchor: 'end' }));
      o.push(xmark(cx - 8, 196, { r: 5 }));
      o.push(t13(cx + 2, 201, '실패', { weight: 700, tone: 'warn' }));
    }
  });
  o.push(t13(296, 226, '3일 Job은 6번 다시 시도하고도 실패했어요', { tone: 'sub', anchor: 'end' }));
  return [300, 234, o];
};

// ── requests-and-limits ──

// 요청과 한도를 눈금 위에
figs['rl-config'] = () => {
  const o = [];
  const row = (y0, title, conf, max, req, lim, ticks) => {
    const X = (v) => 16 + (v / max) * 268;
    o.push(text(8, y0 + 4, title, { size: 14, weight: 700 }));
    o.push(text(292, y0 + 4, conf, { size: 13, tone: 'sub', anchor: 'end', mono: true }));
    o.push(rect(X(0), y0 + 22, X(max) - X(0), 28, { rx: 5, fill: 'line', stroke: 'none' }));
    o.push(rect(X(0), y0 + 22, X(lim) - X(0), 28, { rx: 5, fill: 'accentWeak', stroke: 'none' }));
    o.push(rect(X(0), y0 + 22, X(req) - X(0), 28, { rx: 5, fill: 'accent', stroke: 'none' }));
    o.push(label((X(0) + X(req)) / 2, y0 + 41, '요청', 'card', 700));
    o.push(line(X(lim), y0 + 16, X(lim), y0 + 56, { tone: 'warn', sw: 2.4 }));
    ticks.forEach(([v, s]) => o.push(t13(X(v), y0 + 72, s, { tone: v === req ? 'accent' : v === lim ? 'warn' : 'sub', weight: v === req || v === lim ? 700 : 400, anchor: v === 0 ? 'start' : v === max ? 'end' : 'middle' })));
  };
  row(14, 'CPU', 'requests 250m · limits 500m', 1000, 250, 500, [[0, '0'], [250, '250m'], [500, '500m'], [750, '750m'], [1000, '1코어']]);
  row(116, '메모리', 'requests 256Mi · limits 512Mi', 512, 256, 512, [[0, '0'], [128, '128Mi'], [256, '256Mi'], [384, '384Mi'], [512, '512Mi']]);
  o.push(rect(8, 214, 14, 14, { rx: 3, fill: 'accent', stroke: 'none' }));
  o.push(t13(28, 226, '요청: 늘 받아요', { tone: 'sub' }));
  o.push(rect(130, 214, 14, 14, { rx: 3, fill: 'accentWeak', stroke: 'none' }));
  o.push(t13(150, 226, '여유가 있으면 써요', { tone: 'sub' }));
  o.push(line(266, 212, 266, 230, { tone: 'warn', sw: 2.4 }));
  o.push(t13(274, 226, '한도', { tone: 'warn', weight: 700 }));
  return [300, 236, o];
};

// 스케줄러는 실제 사용이 아니라 요청 합계로 자리를 봐요
const nodeFit = (o, y0, cores, pods, _used, newReq, unit = 1, title = null, opts = {}) => {
  const X = (v) => 18 + (v / cores) * 228;
  o.push(text(18, y0 + 2, title ?? `노드 · CPU ${cores}코어`, { size: 13, weight: 700 }));
  o.push(rect(X(0), y0 + 12, X(cores) - X(0), 44, { rx: 6, fill: 'card', stroke: 'sub', sw: 1.5 }));
  let at = 0;
  pods.forEach(([n, r, u]) => {
    o.push(rect(X(at) + 2, y0 + 14, X(at + r) - X(at) - 4, 40, { rx: 4, fill: 'accentWeak', stroke: 'none' }));
    o.push(rect(X(at) + 2, y0 + 42, ((X(at + r) - X(at) - 4) * u) / r, 12, { rx: 2, fill: 'accent', stroke: 'none' }));
    o.push(label((X(at) + X(at + r)) / 2, y0 + 34, n, 'accent', 700));
    at += r;
  });
  for (let c = unit; c < cores; c += unit) o.push(line(X(c), y0 + 58, X(c), y0 + 64, { tone: 'weak', sw: 1.2, cap: 'butt' }));
  for (let c = 0; c <= cores; c += 1) o.push(t13(X(c), y0 + 78, String(c), { tone: 'sub', anchor: 'middle' }));
  o.push(label((X(at) + X(cores)) / 2, y0 + 39, opts.remText ?? `남은 ${cores - at}`, 'sub', 600));
  // 새 파드
  const nx = X(at) + 2;
  const nw = X(newReq) - X(0) - 4;
  o.push(rect(nx, y0 - 56, nw, 30, { rx: 6, fill: 'warnWeak', stroke: 'warn', sw: 1.5, dash: '4 3' }));
  o.push(label(nx + nw / 2, y0 - 36, `새 파드 ${newReq}`, 'warn', 700));
  o.push(arrow([[nx + 24, y0 - 26], [nx + 24, y0 + 8]], { tone: 'warn', sw: 1.8, size: 6 }));
  o.push(xmark(nx + 44, y0 - 10, { r: 5 }));
  return X;
};
figs['rl-node-fit'] = () => {
  const o = [];
  nodeFit(o, 74, 4, [['A 1', 1, 0.3], ['B 1', 1, 0.4], ['C 1', 1, 0.3]], 1, 1.5);
  o.push(rect(18, 172, 14, 14, { rx: 3, fill: 'accentWeak', stroke: 'none' }));
  o.push(t13(38, 184, '요청 합계 3코어', { tone: 'sub' }));
  o.push(rect(152, 176, 14, 8, { rx: 2, fill: 'accent', stroke: 'none' }));
  o.push(t13(172, 184, '실제 사용 1코어', { tone: 'sub' }));
  o.push(t13(150, 212, '실제로는 놀고 있어도 요청 자리가 모자라요', { weight: 700, tone: 'warn', anchor: 'middle' }));
  return [300, 220, o];
};

// 한도를 넘으려 할 때: CPU는 느려지고, 메모리는 끝나요
figs['rl-limit-effect'] = () => {
  const o = [];
  const panel = (px, title, cpu) => {
    o.push(rect(px, 4, 144, 248, { rx: 12, fill: 'card', stroke: 'none' }));
    o.push(text(px + 12, 26, title, { size: 14, weight: 700 }));
    const p = plot(px + 14, 44, 116, 80, { x0: 0, x1: 10, y0: 0, y1: 1.3 });
    o.push(p.base());
    o.push(p.hline(1, { tone: 'warn', dash: '5 4' }));
    o.push(t13(px + 16, p.sy(1) - 6, '한도', { tone: 'warn', weight: 700 }));
    if (cpu) {
      o.push(p.line([[0, 0.4], [2, 0.6], [4, 1.15], [6, 1.25], [8, 1.1], [10, 0.7]], { tone: 'weak', sw: 2, dash: '4 3' }));
      o.push(p.line([[0, 0.4], [2, 0.6], [3.5, 1], [8.6, 1], [10, 0.7]], { tone: 'accent', sw: 2.6 }));
      o.push(t13(px + 12, 146, '원한 만큼', { tone: 'weak', weight: 600 }));
      o.push(t13(px + 76, 146, '실제', { tone: 'accent', weight: 700 }));
    } else {
      o.push(p.line([[0, 0.4], [3, 0.7], [5, 1]], { tone: 'accent', sw: 2.6 }));
      o.push(p.line([[5, 1], [5, 0.1]], { tone: 'warn', sw: 2, dash: '3 3' }));
      o.push(p.line([[5, 0.1], [8, 0.5], [10, 0.75]], { tone: 'accent', sw: 2.6 }));
      o.push(xmark(p.sx(5), p.sy(1) - 2, { r: 5 }));
      o.push(t13(px + 12, 146, '넘는 순간 끝내요', { tone: 'warn', weight: 600 }));
    }
    o.push(line(px + 12, 160, px + 132, 160, { tone: 'line', sw: 1, cap: 'butt' }));
    o.push(t13(px + 12, 182, cpu ? '한도까지만 돌려요' : '프로세스를 끝내요', { weight: 700 }));
    o.push(t13(px + 12, 202, cpu ? '→ 앱이 느려져요' : '→ 다시 시작해요', { tone: cpu ? 'accent' : 'warn', weight: 600 }));
    o.push(t13(px + 12, 226, '흔적', { tone: 'sub' }));
    o.push(t13(px + 12, 244, cpu ? '스로틀링 횟수·시간' : 'OOMKilled', { tone: 'sub', weight: 600 }));
  };
  panel(4, 'CPU 한도', true);
  panel(152, '메모리 한도', false);
  return [300, 256, o];
};

// ── pod-status ──

// 재시작 사이 기다림이 두 배씩 늘어요
figs['ps-backoff'] = () => {
  const o = [];
  const S = (s) => 10 + s * 3.1;
  const segs = [[0, 5, 'run'], [5, 15, 'wait', '10초'], [15, 20, 'run'], [20, 40, 'wait', '20초'], [40, 45, 'run'], [45, 85, 'wait', '40초'], [85, 90, 'run']];
  o.push(t13(8, 18, '컨테이너가 5초 돌고 죽기를 되풀이할 때', { weight: 700 }));
  segs.forEach(([a, b, k, s]) => {
    if (k === 'run') {
      o.push(rect(S(a), 34, S(b) - S(a), 28, { rx: 3, fill: 'accent', stroke: 'none' }));
      if (b < 90) o.push(xmark(S(b), 28, { r: 4, sw: 2 }));
    } else {
      o.push(rect(S(a) + 1, 34, S(b) - S(a) - 2, 28, { rx: 3, fill: 'warnWeak', stroke: 'none' }));
      o.push(label((S(a) + S(b)) / 2, 53, s, 'warn', 700));
    }
  });
  [[0, '0초'], [45, '45초'], [90, '90초']].forEach(([v, s]) => o.push(t13(S(v), 82, s, { tone: 'sub', anchor: v === 0 ? 'start' : v === 90 ? 'end' : 'middle' })));
  o.push(rect(8, 98, 12, 12, { rx: 2, fill: 'accent', stroke: 'none' }));
  o.push(t13(26, 109, '실행', { tone: 'sub' }));
  o.push(rect(70, 98, 12, 12, { rx: 2, fill: 'warnWeak', stroke: 'none' }));
  o.push(t13(88, 109, '다시 띄우기 전 기다림', { tone: 'sub' }));
  o.push(t13(8, 138, '두 배씩 늘어 최대 5분', { weight: 700, tone: 'warn' }));
  o.push(t13(8, 158, '10분 동안 잘 돌면 다시 10초부터', { tone: 'sub' }));
  return [300, 166, o];
};

// CrashLoopBackOff: 시작 → 죽음 → 기다림 → 다시 시작
figs['ps-crashloop'] = () => {
  const o = [];
  const C = [150, 112];
  const R = 82;
  const pt = (deg, r = R) => [C[0] + r * Math.cos((deg * Math.PI) / 180), C[1] + r * Math.sin((deg * Math.PI) / 180)];
  const arc = (a0, a1, tone) => {
    const steps = 18;
    const pts = [];
    for (let i = 0; i <= steps; i++) pts.push(pt(a0 + ((a1 - a0) * i) / steps));
    o.push(arrow(pts, { tone, sw: 2.2, size: 8 }));
  };
  arc(-62, 2, 'warn');
  arc(58, 122, 'sub');
  arc(178, 242, 'accent');
  const node = (deg, title, sub, tone) => {
    const [x, y] = pt(deg);
    o.push(box(x - 50, y - 22, 100, 44, title, sub, { tone }));
  };
  node(-90, '시작', '컨테이너가 떠요', 'soft');
  node(30, '죽음', '원인이 그대로', 'warn');
  node(150, '기다림', '10초부터 두 배', 'plain');
  o.push(text(C[0], C[1] - 10, 'CrashLoop', { size: 13, weight: 700, tone: 'warn', anchor: 'middle' }));
  o.push(text(C[0], C[1] + 7, 'BackOff', { size: 13, weight: 700, tone: 'warn', anchor: 'middle' }));
  o.push(rect(4, 222, 292, 46, { rx: 10, fill: 'bg', stroke: 'line', sw: 1.2 }));
  o.push(t13(150, 241, '원인은 죽은 실행의 로그와 종료 이유에', { weight: 600, anchor: 'middle' }));
  o.push(text(150, 259, 'kubectl logs --previous', { size: 13, mono: true, tone: 'accent', anchor: 'middle' }));
  return [300, 272, o];
};

// init 컨테이너 둘과 앱: STATUS가 바뀌는 차례
figs['ps-init'] = () => {
  const o = [];
  const BX = [164, 210, 256];
  o.push(g.path(`M${BX[0] - 20} 30 v-5 H${BX[1] + 20} v5`, { stroke: 'sub', sw: 1.3 }));
  o.push(label((BX[0] + BX[1]) / 2, 16, 'init 컨테이너', 'sub', 600));
  ['config', 'db', '앱'].forEach((s, i) => o.push(text(BX[i], 46, s, { size: 13, weight: 700, anchor: 'middle', mono: i < 2 })));
  o.push(t13(8, 46, 'STATUS 칸', { tone: 'sub', weight: 600 }));
  const cell = (cx, y, st) => {
    const sty = { run: ['accent', 'none'], done: ['accentWeak', 'none'], wait: ['none', 'weak'], fail: ['warnWeak', 'warn'] }[st];
    o.push(rect(cx - 20, y - 13, 40, 26, { rx: 6, fill: sty[0], stroke: sty[1], sw: 1.4, dash: st === 'wait' ? '3 3' : undefined }));
    if (st === 'run') o.push(g.path(`M${cx - 4} ${y - 7} L${cx + 7} ${y} L${cx - 4} ${y + 7} z`, { fill: 'card', stroke: 'none' }));
    if (st === 'done') o.push(g.check(cx, y, { r: 6 }));
    if (st === 'fail') o.push(text(cx, y + 5, '↻', { size: 14, weight: 700, tone: 'warn', anchor: 'middle' }));
  };
  const rows = [
    ['Init:0/2', ['run', 'wait', 'wait']],
    ['Init:1/2', ['done', 'run', 'wait']],
    ['PodInitializing', ['done', 'done', 'run']],
    ['Running', ['done', 'done', 'run']],
  ];
  rows.forEach(([s, cells], i) => {
    const y = 74 + i * 36;
    o.push(text(8, y + 5, s, { size: 13, weight: 700, mono: true, tone: s === 'Running' ? 'accent' : 'text' }));
    cells.forEach((st, j) => cell(BX[j], y, st));
  });
  o.push(line(8, 210, 292, 210, { tone: 'line', sw: 1, dash: '4 3', cap: 'butt' }));
  o.push(t13(8, 230, 'db가 계속 실패하면', { tone: 'warn', weight: 600 }));
  o.push(text(8, 252, 'Init:CrashLoop', { size: 13, weight: 700, mono: true, tone: 'warn' }));
  o.push(text(8, 270, 'BackOff', { size: 13, weight: 700, mono: true, tone: 'warn' }));
  ['done', 'fail', 'wait'].forEach((st, j) => cell(BX[j], 257, st));
  o.push(t13(8, 302, 'Init:으로 시작하는 동안 파드 단계는 Pending이에요', { tone: 'sub' }));
  return [300, 310, o];
};

// ── services-and-ingress ──

// 서비스: 바뀌는 파드 앞의 바뀌지 않는 주소
figs['si-service'] = () => {
  const o = [];
  o.push(pod(40, 96, '주문', { w: 56, h: 34 }));
  o.push(label(40, 132, '주문 파드', 'sub', 600));
  o.push(arrow([[68, 96], [100, 96]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(rect(102, 70, 86, 52, { rx: 10, fill: 'accent', stroke: 'none' }));
  o.push(label(145, 92, '결제 서비스', 'card', 700));
  o.push(text(145, 111, '10.96.0.20', { size: 13, tone: 'card', anchor: 'middle', mono: true, fit: 76 }));
  const P = [[238, 30, '10.244.1.5', 'soft'], [238, 96, '10.244.2.7', 'soft'], [238, 162, '10.244.1.9', 'new']];
  P.forEach(([cx, cy, ip, tone]) => {
    o.push(arrow([[188, 96], [cx - 46, cy]], { tone: 'sub', sw: 1.8, size: 6 }));
    o.push(pod(cx, cy, '결제', { w: 90, h: 30, tone }));
    o.push(text(cx, cy + 30, ip, { size: 13, tone: tone === 'new' ? 'accent' : 'sub', anchor: 'middle', mono: true, weight: tone === 'new' ? 700 : 400 }));
  });
  o.push(t13(238, 214, '다시 떠서 IP가 바뀜', { tone: 'accent', weight: 600, anchor: 'middle' }));
  o.push(t13(8, 238, '레이블 app=pay인 결제 파드 셋', { tone: 'sub' }));
  o.push(t13(292, 238, '주소는 그대로예요', { tone: 'accent', weight: 700, anchor: 'end' }));
  return [300, 246, o];
};

// 셀렉터에 맞고 준비된 파드만 요청을 받아요
figs['si-selector'] = () => {
  const o = [];
  o.push(rect(86, 6, 128, 48, { rx: 10, fill: 'accent', stroke: 'none' }));
  o.push(label(150, 26, '결제 서비스', 'card', 700));
  o.push(text(150, 45, 'app: pay', { size: 13, tone: 'card', anchor: 'middle', mono: true }));
  o.push(t13(222, 34, '← 셀렉터', { tone: 'sub' }));
  const pods = [[52, 'app=pay', '준비 안 됨', 'warn', 'skip'], [150, 'app=pay', '준비됨', 'soft', 'yes'], [248, 'app=web', '레이블 다름', 'old', 'no']];
  pods.forEach(([cx, l, s, tone, k]) => {
    if (k === 'yes') o.push(arrow([[150, 54], [150, 98]], { tone: 'accent', sw: 2.2, size: 7 }));
    if (k === 'skip') {
      o.push(line(120, 54, 76, 92, { tone: 'warn', sw: 1.8, dash: '4 3' }));
      o.push(xmark(98, 73, { r: 5 }));
    }
    o.push(pod(cx, 118, '파드', { w: 80, h: 36, tone }));
    o.push(tag(cx, 152, l, { tone: k === 'no' ? 'sub' : tone === 'warn' ? 'warnSoft' : 'soft', size: 13 }));
    o.push(label(cx, 182, s, tone === 'warn' ? 'warn' : k === 'yes' ? 'accent' : 'sub', 700));
  });
  o.push(t13(166, 80, '요청', { tone: 'accent', weight: 700 }));
  o.push(rect(4, 200, 292, 54, { rx: 10, fill: 'bg', stroke: 'line', sw: 1.2 }));
  o.push(t13(16, 222, '대상 목록(EndpointSlice)', { weight: 700 }));
  o.push(text(16, 243, '10.244.1.6', { size: 13, mono: true, tone: 'accent', weight: 600 }));
  o.push(t13(284, 243, '준비된 파드 하나만', { tone: 'sub', anchor: 'end' }));
  return [300, 258, o];
};

// http://pay를 부를 때: DNS로 서비스 IP를 받고 보내요
figs['si-dns'] = () => {
  const o = [];
  const lanes = [{ x: 46, label: '주문 파드' }, { x: 150, label: '클러스터 DNS' }, { x: 254, label: '결제 서비스' }];
  o.push(ladder(lanes, [
    { from: 0, to: 1, y: 56, label: 'pay는 어디?' },
    { from: 1, to: 0, y: 96, label: '10.96.0.20', dashed: true, tone: 'accent' },
    { from: 0, to: 2, y: 150, label: '10.96.0.20으로 요청', tone: 'accent' },
  ], { top: 18, bottom: 172 }));
  o.push(g.badge(20, 56, 1, { tone: 'sub' }));
  o.push(g.badge(20, 96, 2, { tone: 'accent' }));
  o.push(g.badge(20, 150, 3, { tone: 'accent' }));
  o.push(t13(150, 196, '앱은 http://pay라고만 적어요', { tone: 'sub', anchor: 'middle' }));
  return [300, 204, o];
};

// 인그레스: 바깥 요청을 경로로 나눠요
figs['si-ingress'] = () => {
  const o = [];
  o.push(g.laptop(42, 26));
  o.push(t13(70, 30, '바깥 사용자', { weight: 600 }));
  o.push(arrow([[42, 42], [42, 66]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(rect(4, 68, 292, 96, { rx: 12, fill: 'accentWeak', stroke: 'accent', sw: 1.5 }));
  o.push(g.lb(36, 96, { tone: 'accent' }));
  o.push(t13(66, 92, '인그레스 컨트롤러', { weight: 700, tone: 'accent' }));
  o.push(t13(66, 110, '규칙대로 나눠요', { tone: 'sub' }));
  o.push(text(176, 92, '/api', { size: 13, weight: 700, mono: true, tone: 'accent' }));
  o.push(t13(212, 92, '→ API 서비스', { weight: 600 }));
  o.push(text(176, 112, '/', { size: 13, weight: 700, mono: true, tone: 'sub' }));
  o.push(t13(212, 112, '→ 웹 서비스', { weight: 600 }));
  o.push(t13(16, 152, '컨트롤러가 없으면 규칙만 있고 아무 일도 안 일어나요', { tone: 'sub' }));
  // 서비스와 파드
  [[78, 'API 서비스', '/api'], [222, '웹 서비스', '/']].forEach(([cx, n]) => {
    o.push(arrow([[cx, 164], [cx, 190]], { tone: 'sub', sw: 2, size: 7 }));
    o.push(rect(cx - 62, 192, 124, 30, { rx: 8, fill: 'accent', stroke: 'none' }));
    o.push(label(cx, 212, n, 'card', 700));
    o.push(line(cx - 30, 222, cx - 30, 236, { tone: 'sub', sw: 1.6 }));
    o.push(line(cx + 30, 222, cx + 30, 236, { tone: 'sub', sw: 1.6 }));
    o.push(pod(cx - 30, 250, '파드', { w: 50 }));
    o.push(pod(cx + 30, 250, '파드', { w: 50 }));
  });
  return [300, 268, o];
};

// ── config-and-storage ──

// Secret 값에 닿는 세 갈래
figs['cs-secret'] = () => {
  const o = [];
  o.push(rect(40, 6, 220, 80, { rx: 10, fill: 'warnWeak', stroke: 'warn', sw: 1.5 }));
  o.push(text(54, 28, 'Secret', { size: 14, weight: 700 }));
  o.push(t13(250, 28, '암호화 없이 저장', { tone: 'warn', weight: 700, anchor: 'end' }));
  o.push(text(54, 52, 'password: cGFzc3dvcmQ=', { size: 13, mono: true, weight: 600 }));
  o.push(t13(54, 74, 'base64를 풀면', { tone: 'sub' }));
  o.push(text(150, 74, '→ password', { size: 13, mono: true, weight: 700, tone: 'warn' }));
  const who = [[52, 'API 접근', 'Secret 읽기 권한'], [150, 'etcd 접근', '데이터·백업'], [248, '파드 만들기', '그 네임스페이스']];
  who.forEach(([cx, a, b]) => {
    o.push(arrow([[cx, 132], [cx + (150 - cx) * 0.35, 92]], { tone: 'warn', sw: 2, size: 7 }));
    o.push(g.person(cx, 152));
    o.push(label(cx, 188, a, 'text', 700));
    o.push(label(cx, 206, b, 'sub', 400));
  });
  o.push(t13(150, 236, '하나만 열려 있어도 원래 값을 읽어요', { weight: 700, tone: 'warn', anchor: 'middle' }));
  return [300, 244, o];
};

// 파드 → PVC → PV → 실제 디스크. 파드가 바뀌어도 데이터는 남아요
figs['cs-pvc'] = () => {
  const o = [];
  o.push(pod(44, 40, '옛 파드', { w: 68, tone: 'ghost' }));
  o.push(xmark(80, 26, { r: 5 }));
  o.push(pod(44, 112, '새 파드', { w: 68, tone: 'new' }));
  o.push(line(78, 44, 110, 70, { tone: 'weak', sw: 1.8, dash: '4 3' }));
  o.push(arrow([[78, 108], [110, 84]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(t13(44, 144, '/data에 붙여요', { tone: 'sub', anchor: 'middle' }));
  o.push(g.doc(132, 76, { lines: 3, tone: 'accent' }));
  o.push(label(132, 110, 'PVC', 'accent', 700));
  o.push(label(132, 126, '10Gi 요청서', 'sub', 400));
  o.push(arrow([[150, 76], [178, 76]], { tone: 'sub', sw: 2, size: 7 }));
  o.push(t13(166, 62, '묶여요', { tone: 'sub', anchor: 'middle' }));
  o.push(box(180, 58, 52, 36, 'PV', null, { tone: 'plain' }));
  o.push(label(206, 110, '10Gi', 'sub', 400));
  o.push(arrow([[232, 76], [246, 76]], { tone: 'sub', sw: 2, size: 6 }));
  o.push(g.db(270, 76, { rx: 15 }));
  o.push(label(270, 110, '클라우드', 'text', 600));
  o.push(label(270, 126, '디스크', 'text', 600));
  o.push(rect(4, 160, 292, 40, { rx: 10, fill: 'accentWeak', stroke: 'none' }));
  o.push(t13(150, 185, 'PV는 파드와 따로 살아서 데이터가 남아요', { weight: 700, tone: 'accent', anchor: 'middle' }));
  return [300, 206, o];
};

// ── autoscaling ──

// 수평 확장은 파드 수를, 수직 확장은 파드 크기를
figs['scaling'] = () => {
  const o = [];
  const panel = (px, title, sub, who) => {
    o.push(rect(px, 4, 144, 216, { rx: 12, fill: 'card', stroke: 'none' }));
    o.push(text(px + 12, 26, title, { size: 14, weight: 700 }));
    o.push(t13(px + 12, 44, sub, { tone: 'sub' }));
    o.push(tag(px + 132, 22, who, { tone: 'soft', anchor: 'end' }));
  };
  panel(4, '수평 확장', '파드 수를 늘려요', 'HPA');
  panel(152, '수직 확장', '파드 크기를 키워요', 'VPA');
  // 수평: 3개 → 6개
  for (let i = 0; i < 3; i++) o.push(rect(22 + i * 38, 62, 30, 30, { rx: 7, fill: 'accentWeak', stroke: 'accent', sw: 1.5 }));
  o.push(arrow([[76, 98], [76, 120]], { tone: 'accent', sw: 2, size: 7 }));
  for (let i = 0; i < 6; i++) {
    const c = i % 3;
    const r = Math.floor(i / 3);
    o.push(rect(22 + c * 38, 126 + r * 36, 30, 30, { rx: 7, fill: i < 3 ? 'accentWeak' : 'accent', stroke: i < 3 ? 'accent' : 'none', sw: 1.5 }));
  }
  o.push(label(76, 210, '3개 → 6개', 'accent', 700));
  // 수직: 1코어 → 2코어
  o.push(rect(208, 62, 32, 32, { rx: 7, fill: 'accentWeak', stroke: 'accent', sw: 1.5 }));
  o.push(label(224, 83, '1', 'accent', 700));
  o.push(arrow([[224, 98], [224, 120]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(rect(194, 126, 60, 66, { rx: 10, fill: 'accent', stroke: 'none' }));
  o.push(label(224, 164, '2', 'card', 700));
  o.push(label(224, 210, '1코어 → 2코어', 'accent', 700));
  return [300, 224, o];
};

// VPA updateMode: 추천을 언제, 어떻게 적용하나
figs['as-vpa-modes'] = () => {
  const o = [];
  const rows = [
    ['Off', '추천값만 status에 남겨요', '바꾸지 않음', 'plain'],
    ['Initial', '파드가 새로 뜰 때만 적용해요', '새 파드만', 'plain'],
    ['Recreate', '파드를 내보내고 새로 띄우며 적용', '다시 띄움', 'warnSoft'],
    ['InPlaceOrRecreate', '제자리에서 바꾸고, 안 되면 다시 띄워요', '제자리 먼저', 'accent'],
    ['InPlace', '제자리에서만 바꾸고, 안 되면 기다려요', '알파', 'sub'],
  ];
  o.push(text(8, 16, 'updateMode', { size: 13, weight: 700, mono: true, tone: 'sub' }));
  rows.forEach(([m, s, t, tone], i) => {
    const y = 28 + i * 50;
    o.push(rect(4, y, 292, 44, { rx: 9, fill: tone === 'accent' ? 'accentWeak' : 'card', stroke: 'none' }));
    o.push(text(14, y + 19, m, { size: 13, weight: 700, mono: true, tone: tone === 'warnSoft' ? 'warn' : tone === 'accent' ? 'accent' : 'text' }));
    o.push(t13(14, y + 37, s, { tone: 'sub' }));
    o.push(tag(286, y + 14, t, { tone, anchor: 'end' }));
  });
  return [300, 280, o];
};

// ── cluster-dns ──

// 서비스 이름: 직접 적는 부분과 검색 도메인이 붙여 주는 부분
figs['dns-names'] = () => {
  const o = [];
  const row = (y, title, typed, added) => {
    o.push(t13(8, y, title, { weight: 700 }));
    const fields = [...typed.map((t) => ({ t, tone: 'accent' })), ...added.map((t) => ({ t, tone: 'plain' }))];
    const pk = g.packet(8, y + 12, fields, { h: 28 });
    o.push(pk.svg);
    const tw = g.packet.width(typed.map((t) => ({ t })));
    o.push(g.path(`M8 ${y + 48} v5 H${8 + tw} v-5`, { stroke: 'accent', sw: 1.5 }));
    o.push(t13(8, y + 70, '직접 적어요', { tone: 'accent', weight: 700 }));
    o.push(g.path(`M${8 + tw} ${y + 48} v5 H${8 + pk.w} v-5`, { stroke: 'sub', sw: 1.5 }));
    o.push(t13(8 + pk.w, y + 70, '검색 도메인이 붙여요', { tone: 'sub', weight: 600, anchor: 'end' }));
  };
  row(16, '같은 네임스페이스(shop)의 pay', ['pay'], ['.shop', '.svc', '.cluster.local']);
  row(120, '다른 네임스페이스(billing)의 pay', ['pay', '.billing'], ['.svc', '.cluster.local']);
  return [300, 200, o];
};

// 이름을 찾는 차례: 바깥 이름은 검색 도메인 셋을 다 물어본 뒤에야
figs['dns-search'] = () => {
  const o = [];
  const res = (y, ok, s) => o.push(tag(290, y, s, { tone: ok ? 'soft' : 'warnSoft', anchor: 'end' }));
  const tryRow = (y, n, s, ok, r, mono = true) => {
    o.push(g.badge(18, y, n, { tone: ok ? 'accent' : 'warn' }));
    o.push(text(34, y + 5, s, { size: 13, mono, weight: 600, tone: ok ? 'text' : 'sub' }));
    res(y, ok, r);
  };
  o.push(t13(8, 16, 'pay를 찾을 때', { weight: 700 }));
  tryRow(40, 1, '+ shop.svc.cluster.local', true, '찾음');
  o.push(line(8, 64, 292, 64, { tone: 'line', sw: 1, cap: 'butt' }));
  o.push(t13(8, 88, 'api.example.com을 찾을 때', { weight: 700 }));
  o.push(t13(8, 106, '점이 5개보다 적어서 검색 도메인부터 붙여요', { tone: 'sub' }));
  tryRow(130, 1, '+ shop.svc.cluster.local', false, '없음');
  tryRow(160, 2, '+ svc.cluster.local', false, '없음');
  tryRow(190, 3, '+ cluster.local', false, '없음');
  tryRow(220, 4, '원래 이름 그대로', true, '주소', false);
  o.push(t13(150, 252, '없음 세 번(NXDOMAIN) 뒤에야 주소를 받아요', { tone: 'warn', weight: 600, anchor: 'middle' }));
  return [300, 260, o];
};

// ── container-logs ──

// 컨테이너 로그가 지나는 길
figs['cl-path'] = () => {
  const o = [];
  o.push(zone(4, 4, 214, 236, '노드', { fill: 'card', dash: null, labelTone: 'text' }));
  o.push(rect(16, 32, 92, 46, { rx: 9, fill: 'accentWeak', stroke: 'accent', sw: 1.5 }));
  o.push(label(62, 52, '파드 · 앱', 'accent', 700));
  o.push(text(62, 70, 'stdout', { size: 13, mono: true, tone: 'sub', anchor: 'middle' }));
  o.push(arrow([[108, 55], [138, 55]], { tone: 'sub', sw: 2, size: 7 }));
  o.push(box(140, 38, 68, 34, '런타임', null, { tone: 'plain' }));
  o.push(arrow([[174, 72], [174, 98]], { tone: 'sub', sw: 2, size: 7 }));
  o.push(g.doc(174, 120, { lines: 3, tone: 'accent' }));
  o.push(label(174, 154, '로그 파일', 'accent', 700));
  o.push(arrow([[158, 118], [110, 118]], { tone: 'sub', sw: 2, size: 7 }));
  o.push(box(16, 102, 92, 32, 'kubelet', null, { tone: 'plain' }));
  o.push(arrow([[62, 134], [62, 158]], { tone: 'sub', sw: 2, size: 7 }));
  o.push(text(62, 176, 'kubectl logs', { size: 13, mono: true, weight: 600, anchor: 'middle' }));
  o.push(arrow([[174, 162], [174, 188]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(box(132, 190, 84, 42, '에이전트', 'DaemonSet', { tone: 'soft' }).replace('', ''));
  o.push(arrow([[216, 211], [240, 211]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(g.db(264, 210, { tone: 'accent' }));
  o.push(label(264, 244, '로그 저장소', 'accent', 700));
  o.push(label(264, 260, '노드 밖', 'sub', 400));
  o.push(t13(8, 262, '노드 밖에 남는 건 보낸 것뿐', { weight: 700, tone: 'accent' }));
  return [300, 270, o];
};

// 10Mi씩 5개까지 돌려 써요. kubectl logs는 지금 파일만
figs['cl-rotation'] = () => {
  const o = [];
  const files = [['10:11', '.gz'], ['10:12', '.gz'], ['10:13', '.gz'], ['10:14', '회전됨'], ['지금', '1.log']];
  o.push(tag(292, 16, 'kubectl logs', { tone: 'accent', anchor: 'end' }));
  o.push(arrow([[264, 28], [264, 50]], { tone: 'accent', sw: 2, size: 6 }));
  files.forEach(([t, n], i) => {
    const cx = 36 + i * 57;
    const cur = i === 4;
    o.push(g.doc(cx, 72, { lines: n === '.gz' ? 0 : 3, tone: cur ? 'accent' : undefined }));
    if (n === '.gz') o.push(text(cx, 80, 'gz', { size: 13, weight: 700, tone: 'sub', anchor: 'middle', mono: true }));
    o.push(text(cx, 108, n === '.gz' ? '압축' : n, { size: 13, weight: cur ? 700 : 600, tone: cur ? 'accent' : 'sub', anchor: 'middle', mono: cur }));
    o.push(label(cx, 126, '10Mi', 'weak', 400));
    o.push(label(cx, 146, t, cur ? 'accent' : 'sub', cur ? 700 : 400));
  });
  o.push(g.path('M14 158 v5 H230 v-5', { stroke: 'sub', sw: 1.5 }));
  o.push(label(122, 182, '회전된 옛 파일 · kubectl logs로는 안 보여요', 'sub', 600));
  o.push(rect(4, 196, 292, 34, { rx: 8, fill: 'bg', stroke: 'line', sw: 1.2 }));
  o.push(t13(150, 218, '컨테이너마다 5개, 넘치면 가장 오래된 것부터 지워요', { anchor: 'middle', weight: 600 }));
  return [300, 234, o];
};

// kubectl logs와 노드 밖 저장소가 볼 수 있는 범위
figs['cl-scope'] = () => {
  const o = [];
  const C1 = 168;
  const C2 = 236;
  o.push(rect(4, 4, 292, 32, { rx: 6, fill: 'line', stroke: 'none' }));
  o.push(t13(14, 25, '찾는 로그', { weight: 600, tone: 'sub' }));
  o.push(text(C1, 25, 'kubectl logs', { size: 13, weight: 600, tone: 'sub', anchor: 'middle', mono: true, fit: 64 }));
  o.push(label(C2 + 22, 25, '노드 밖', 'sub', 600));
  const rows = [
    ['지금 컨테이너', 'ok', '최근 파일만'],
    ['바로 전 컨테이너', 'ok', '--previous'],
    ['그보다 앞 컨테이너', 'no'],
    ['지운 파드', 'no'],
    ['사라진 노드', 'no'],
  ];
  rows.forEach(([n, k, note], i) => {
    const y = 36 + i * 40;
    if (i) o.push(line(4, y, 296, y, { tone: 'line', sw: 1, cap: 'butt' }));
    if (k === 'no') o.push(rect(C1 - 34, y, 68, 40, { rx: 0, fill: 'warnWeak', stroke: 'none' }));
    o.push(t13(14, y + 25, n, { weight: 600 }));
    if (k === 'ok') {
      o.push(g.check(C1, y + 15, { r: 5.5 }));
      o.push(text(C1, y + 34, note, { size: 13, tone: 'sub', anchor: 'middle', mono: note.startsWith('--'), fit: note.length * 7.9 > 64 ? 64 : undefined }));
    } else o.push(xmark(C1, y + 20, { r: 5.5 }));
    o.push(g.check(C2 + 22, y + 20, { r: 6 }));
  });
  o.push(rect(4, 4, 292, 32 + 5 * 40, { rx: 6, fill: 'none', stroke: 'line', sw: 1.5 }));
  o.push(t13(296, 254, '노드 밖은 보내 둔 데까지 봐요', { tone: 'sub', anchor: 'end' }));
  return [300, 262, o];
};

// ── images-and-layers ──

// 레이어 케이크: 아래 셋은 읽기 전용, 맨 위에 쓰기 레이어
const slab = (o, x, y, w, h, title, sub, tone = 'plain') => {
  const fill = { plain: 'card', accent: 'accentWeak', warn: 'warnWeak', ghost: 'none' }[tone];
  const stroke = { plain: 'sub', accent: 'accent', warn: 'warn', ghost: 'accent' }[tone];
  o.push(g.path(`M${x} ${y} l8 -8 H${x + w + 8} l-8 8 z`, { fill: tone === 'ghost' ? 'none' : 'line', stroke, sw: 1.3, dash: tone === 'ghost' ? '4 3' : undefined }));
  o.push(g.path(`M${x + w} ${y} l8 -8 V${y + h - 8} l-8 8 z`, { fill: tone === 'ghost' ? 'none' : 'line', stroke, sw: 1.3, dash: tone === 'ghost' ? '4 3' : undefined }));
  o.push(rect(x, y, w, h, { rx: 2, fill, stroke, sw: 1.5, dash: tone === 'ghost' ? '4 3' : undefined }));
  o.push(text(x + 10, y + h / 2 + (sub ? -2 : 5), title, { size: 13, weight: 700, tone: tone === 'warn' ? 'warn' : tone === 'plain' ? 'text' : 'accent', mono: /RUN|big/.test(title) }));
  if (sub) o.push(t13(x + 10, y + h / 2 + 15, sub, { tone: 'sub' }));
};
figs['il-layers'] = () => {
  const o = [];
  const L = [
    ['컨테이너 쓰기 레이어', '실행 중에 바뀐 것', 'ghost', null],
    ['RUN rm /big.bin', '지움 표시만', 'plain', ['4.1kB', 0.3]],
    ['RUN dd … big.bin', '50MB 파일을 만듦', 'warn', ['52.4MB', 52.4]],
    ['alpine 3.20 베이스', '운영체제 파일', 'plain', ['8.47MB', 8.47]],
  ];
  L.forEach(([t, s, tone, size], i) => {
    const y = 20 + i * 50;
    slab(o, 8, y, 168, 40, t, s, tone);
    if (size) {
      const w = Math.max(3, (size[1] / 52.4) * 92);
      o.push(rect(196, y + 12, w, 16, { rx: 3, fill: tone === 'warn' ? 'warn' : 'sub', stroke: 'none' }));
      o.push(t13(196 + w + 6 > 250 ? 196 + w - 4 : 196 + w + 6, y + 25, size[0], { weight: 700, tone: tone === 'warn' ? (w > 60 ? 'card' : 'warn') : 'text', anchor: 196 + w + 6 > 250 ? 'end' : 'start' }));
    }
  });
  o.push(g.path('M296 74 h-4 V212 h4', { stroke: 'sub', sw: 1.4 }));
  o.push(t13(288, 236, '읽기 전용 · 이미지', { tone: 'sub', anchor: 'end', weight: 600 }));
  o.push(t13(288, 16, '크기', { tone: 'sub', anchor: 'end' }));
  return [300, 244, o];
};

// 큰 파일을 다음 RUN에서 지우면 레이어에 남아요
figs['il-rm'] = () => {
  const o = [];
  const col = (px, title, layers, total, tone) => {
    o.push(rect(px, 4, 144, 262, { rx: 12, fill: 'card', stroke: 'none' }));
    o.push(text(px + 12, 26, title, { size: 13, weight: 700 }));
    let y = 196;
    layers.forEach(([t, s, h, lt]) => {
      y -= h;
      o.push(rect(px + 14, y, 116, h - 4, { rx: 4, fill: lt === 'warn' ? 'warnWeak' : 'bg', stroke: lt === 'warn' ? 'warn' : 'line', sw: 1.3 }));
      o.push(text(px + 22, y + (h - 4) / 2 + (s ? -1 : 5), t, { size: 13, weight: 700, mono: true, tone: lt === 'warn' ? 'warn' : 'text' }));
      if (s) o.push(t13(px + 22, y + (h - 4) / 2 + 16, s, { tone: lt === 'warn' ? 'warn' : 'sub' }));
    });
    o.push(t13(px + 12, 216, '레이어를 더하면', { tone: 'sub' }));
    o.push(text(px + 12, 236, total, { size: 15, weight: 700, tone }));
    o.push(t13(px + 12, 256, '컨테이너에선 안 보여요', { tone: 'sub' }));
  };
  col(4, '다음 RUN에서 지움', [['alpine', '8.47MB', 40], ['RUN dd', '52.4MB 남아요', 76, 'warn'], ['RUN rm', '4.1kB', 40]], '약 61MB', 'warn');
  col(152, '같은 RUN에서 지움', [['alpine', '8.47MB', 40], ['RUN dd && rm', '거의 0', 40]], '약 8.5MB', 'accent');
  return [300, 270, o];
};

// 같은 베이스 레이어는 노드에 한 번만
figs['il-share'] = () => {
  const o = [];
  [[76, '이미지 A'], [224, '이미지 B']].forEach(([cx, n]) => {
    o.push(label(cx, 18, n, 'text', 700));
    slab(o, cx - 62, 38, 116, 34, `${n.slice(-1)}의 앱 레이어`, null, 'plain');
    o.push(arrow([[cx, 74], [cx, 106]], { tone: 'accent', sw: 2, size: 7 }));
  });
  slab(o, 14, 112, 264, 44, 'alpine 3.20 베이스', 'sha256:08bc…', 'accent');
  o.push(rect(4, 180, 292, 40, { rx: 10, fill: 'accentWeak', stroke: 'none' }));
  o.push(t13(150, 205, '다이제스트가 같아서 노드에는 한 번만 저장돼요', { weight: 700, tone: 'accent', anchor: 'middle' }));
  return [300, 226, o];
};

// 쓸 때 복사: 고친 파일은 쓰기 레이어에 복사본으로
figs['il-cow'] = () => {
  const o = [];
  o.push(t13(8, 16, '컨테이너가 보는 파일', { weight: 700 }));
  [['/etc/motd', 'accent'], ['/new.txt', 'accent'], ['/bin/sh', 'sub']].forEach(([f, tone], i) => o.push(tag(8 + i * 96, 38, f, { tone: tone === 'accent' ? 'soft' : 'sub', anchor: 'start' })));
  o.push(arrow([[150, 52], [150, 70]], { tone: 'weak', sw: 1.6, size: 6, start: true }));
  slab(o, 8, 84, 276, 64, '', null, 'ghost');
  o.push(t13(18, 102, '쓰기 레이어', { weight: 700, tone: 'accent' }));
  o.push(tag(18, 126, '/etc/motd 복사본', { tone: 'accent', anchor: 'start' }));
  o.push(tag(160, 126, '/new.txt 새 파일', { tone: 'soft', anchor: 'start' }));
  slab(o, 8, 172, 276, 64, '', null, 'plain');
  o.push(t13(18, 190, '이미지 레이어 · 읽기 전용', { weight: 700 }));
  o.push(tag(18, 214, '/etc/motd 원본', { tone: 'sub', anchor: 'start' }));
  o.push(tag(160, 214, '/bin/sh', { tone: 'sub', anchor: 'start' }));
  o.push(arrow([[70, 202], [70, 140]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(t13(80, 162, '복사해서 고쳐요', { tone: 'accent', weight: 600 }));
  o.push(t13(8, 262, '원본은 그대로라 같은 이미지의 다른 컨테이너와 함께 써요', { tone: 'sub' }));
  return [300, 270, o];
};

// ── rbac ──

// 인증(누구?) → 인가(해도 돼?) → 처리 또는 403
figs['rb-authz'] = () => {
  const o = [];
  o.push(pod(40, 40, '파드', { w: 56 }));
  o.push(tag(40, 70, '토큰', { tone: 'sub' }));
  o.push(arrow([[68, 40], [92, 40]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(zone(94, 6, 202, 164, 'API 서버', { fill: 'card', dash: null, labelTone: 'text' }));
  o.push(box(104, 28, 84, 46, '① 인증', '누구예요?', { tone: 'plain' }));
  o.push(arrow([[188, 51], [204, 51]], { tone: 'accent', sw: 2, size: 6 }));
  o.push(box(206, 28, 84, 46, '② 인가', '해도 돼요?', { tone: 'soft' }));
  o.push(t13(248, 92, 'RBAC', { weight: 700, tone: 'accent', anchor: 'middle', mono: true }));
  o.push(arrow([[226, 74], [180, 128]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(arrow([[270, 74], [270, 128]], { tone: 'warn', sw: 2, size: 7 }));
  o.push(g.check(126, 140, { r: 6 }));
  o.push(t13(138, 145, '처리해요', { weight: 700, tone: 'accent' }));
  o.push(xmark(254, 140, { r: 5 }));
  o.push(t13(264, 145, '403', { weight: 700, tone: 'warn', mono: true }));
  o.push(t13(150, 196, '허락하는 규칙이 없으면 거부해요', { tone: 'sub', anchor: 'middle' }));
  return [300, 204, o];
};

// Role은 한 네임스페이스, ClusterRole은 클러스터 전체
figs['rb-scope'] = () => {
  const o = [];
  o.push(zone(4, 4, 292, 240, '클러스터', { fill: 'card', dash: null, labelTone: 'text' }));
  [[16, 'dev'], [154, 'prod']].forEach(([x, n]) => {
    o.push(zone(x, 32, 130, 120, `네임스페이스 ${n}`, { fill: 'bg', labelTone: 'sub' }));
    o.push(pod(x + 36, 128, '파드', { w: 48 }));
    o.push(pod(x + 94, 128, '파드', { w: 48 }));
  });
  o.push(rect(26, 62, 110, 40, { rx: 8, fill: 'accentWeak', stroke: 'accent', sw: 1.5 }));
  o.push(label(81, 80, 'Role', 'accent', 700));
  o.push(label(81, 96, 'dev의 파드 읽기', 'sub', 400));
  for (let i = 0; i < 3; i++) o.push(g.server(212 + i * 30, 200, { tone: 'weak' }));
  o.push(t13(242, 236, '노드', { tone: 'sub', anchor: 'middle' }));
  o.push(rect(16, 168, 160, 46, { rx: 8, fill: 'accent', stroke: 'none' }));
  o.push(label(96, 187, 'ClusterRole', 'card', 700));
  o.push(label(96, 205, '모든 파드와 노드 읽기', 'card', 400));
  o.push(t13(150, 268, '바인딩도 같은 범위로 둘로 나뉘어요', { tone: 'sub', anchor: 'middle' }));
  return [300, 276, o];
};

// 역할 → 바인딩 → 서비스 계정 → 파드의 토큰 → API 서버
figs['rb-chain'] = () => {
  const o = [];
  o.push(box(8, 20, 96, 46, '역할', '파드·노드 읽기', { tone: 'plain' }));
  o.push(arrow([[104, 43], [190, 43]], { tone: 'sub', sw: 2, size: 7 }));
  o.push(t13(147, 35, '바인딩', { tone: 'sub', weight: 700, anchor: 'middle' }));
  o.push(box(192, 20, 100, 46, '서비스 계정', '따로 만든 계정', { tone: 'soft' }));
  o.push(arrow([[242, 66], [242, 110]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(t13(250, 92, '토큰', { tone: 'accent', weight: 700 }));
  o.push(rect(180, 112, 116, 60, { rx: 10, fill: 'accentWeak', stroke: 'accent', sw: 1.5 }));
  o.push(label(238, 134, '파드', 'accent', 700));
  o.push(label(238, 154, 'API를 읽는 앱', 'sub', 400));
  o.push(arrow([[180, 142], [108, 142]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(t13(144, 134, '토큰을 실어', { tone: 'accent', weight: 600, anchor: 'middle' }));
  o.push(box(8, 120, 98, 46, 'API 서버', '역할대로 허락', { tone: 'plain' }));
  o.push(text(8, 200, '/var/run/secrets/kubernetes.io/', { size: 13, mono: true, tone: 'sub', fit: 284 }));
  o.push(t13(8, 220, '파드 안 이 경로에 토큰이 들어가요', { tone: 'sub' }));
  return [300, 228, o];
};

// ── resource-quotas ──

// 할당량은 실제 사용이 아니라 요청 합계로 세요
figs['rq-requests'] = () => {
  const o = [];
  nodeFit(o, 74, 4, [['1', 1, 0.2], ['1', 1, 0.2], ['1', 1, 0.2]], 0.6, 1.5, 1, 'team-a · CPU 요청 할당량 4코어');
  o.push(rect(18, 172, 14, 14, { rx: 3, fill: 'accentWeak', stroke: 'none' }));
  o.push(t13(38, 184, '요청 합계 3코어', { tone: 'sub' }));
  o.push(rect(152, 176, 14, 8, { rx: 2, fill: 'accent', stroke: 'none' }));
  o.push(t13(172, 184, '실제 사용 0.6코어', { tone: 'sub' }));
  o.push(t13(150, 212, '합계가 4.5코어가 되어 새 파드는 거부돼요', { weight: 700, tone: 'warn', anchor: 'middle' }));
  return [300, 220, o];
};

// Deployment는 성공, 파드 만들기는 ReplicaSet 컨트롤러가 거부당해요
figs['rq-denied'] = () => {
  const o = [];
  const lanes = [{ x: 40, label: '사용자' }, { x: 150, label: 'API 서버' }, { x: 256, label: 'ReplicaSet' }];
  o.push(ladder(lanes, [
    { from: 0, to: 1, y: 54, label: 'Deployment 만들기' },
    { from: 1, to: 0, y: 86, label: '성공', dashed: true, tone: 'accent' },
    { from: 2, to: 1, y: 132, label: '파드 만들기' },
    { from: 1, to: 2, y: 166, label: '거부: 할당량 초과', dashed: true, tone: 'warn' },
  ], { top: 18, bottom: 186 }));
  o.push(rect(4, 200, 292, 46, { rx: 10, fill: 'warnWeak', stroke: 'none' }));
  o.push(t13(150, 219, '파드는 만들어지지 않고, 흔적은', { tone: 'sub', anchor: 'middle' }));
  o.push(t13(150, 238, 'ReplicaSet의 FailedCreate 이벤트에만 남아요', { weight: 700, tone: 'warn', anchor: 'middle' }));
  return [300, 252, o];
};

// ── scheduling ──

// 거르고(필터), 점수를 매겨요
figs['sc-filter-score'] = () => {
  const o = [];
  o.push(pod(150, 18, '새 파드', { w: 70, tone: 'new' }));
  o.push(arrow([[150, 32], [150, 50]], { tone: 'accent', sw: 2, size: 6 }));
  o.push(rect(4, 54, 292, 104, { rx: 10, fill: 'card', stroke: 'none' }));
  o.push(t13(12, 72, '① 필터: 놓을 수 있나', { weight: 700 }));
  const N = [[32, '자리 부족'], [91, 'taint'], [150, '레이블 다름'], [209, null], [268, null]];
  N.forEach(([cx, why], i) => {
    o.push(g.server(cx, 102, { tone: why ? 'weak' : 'accent' }));
    o.push(label(cx, 136, `노드 ${i + 1}`, why ? 'weak' : 'text', 700));
    if (why) {
      o.push(xmark(cx + 14, 88, { r: 5 }));
      o.push(label(cx, 152, why, 'warn', 600));
    } else o.push(g.check(cx + 16, 88, { r: 5.5 }));
  });
  o.push(rect(4, 166, 292, 92, { rx: 10, fill: 'card', stroke: 'none' }));
  o.push(t13(12, 184, '② 점수: 어디가 더 낫나', { weight: 700 }));
  o.push(rect(186, 196, 46, 30, { rx: 8, fill: 'accent', stroke: 'none' }));
  o.push(label(209, 216, '80점', 'card', 700));
  o.push(rect(245, 196, 46, 30, { rx: 8, fill: 'bg', stroke: 'line', sw: 1.2 }));
  o.push(label(268, 216, '60점', 'sub', 700));
  o.push(t13(12, 216, '남은 둘에 점수를 매겨요', { tone: 'sub' }));
  o.push(t13(209, 248, '노드 4에 놓아요', { weight: 700, tone: 'accent', anchor: 'middle' }));
  return [300, 262, o];
};

// 맞는 노드가 없을 때: required는 Pending, preferred는 다른 노드로
figs['sc-req-pref'] = () => {
  const o = [];
  const panel = (px, title, kw, stage, ok) => {
    o.push(rect(px, 4, 144, 242, { rx: 12, fill: 'card', stroke: 'none' }));
    o.push(text(px + 12, 26, kw, { size: 13, weight: 700, mono: true, tone: ok ? 'accent' : 'warn' }));
    o.push(t13(px + 12, 44, title, { tone: 'sub' }));
    o.push(tag(px + 132, 21, stage, { tone: 'sub', anchor: 'end' }));
    o.push(pod(px + 72, 80, '파드', { w: 56, tone: ok ? 'new' : 'warn' }));
    o.push(t13(px + 72, 112, 'disktype=ssd 원함', { tone: 'sub', anchor: 'middle' }));
    for (const dx of [40, 104]) {
      o.push(g.server(px + dx, 166));
      o.push(label(px + dx, 198, 'hdd', 'sub', 600));
    }
    if (ok) {
      o.push(arrow([[px + 60, 120], [px + 46, 146]], { tone: 'accent', sw: 2, size: 7 }));
      o.push(t13(px + 12, 230, '다른 노드에라도 놓아요', { weight: 700, tone: 'accent' }));
    } else {
      o.push(line(px + 60, 122, px + 46, 144, { tone: 'warn', sw: 1.8, dash: '3 3' }));
      o.push(line(px + 84, 122, px + 98, 144, { tone: 'warn', sw: 1.8, dash: '3 3' }));
      o.push(xmark(px + 52, 134, { r: 4.5 }));
      o.push(xmark(px + 92, 134, { r: 4.5 }));
      o.push(t13(px + 12, 230, 'Pending에 머물러요', { weight: 700, tone: 'warn' }));
    }
  };
  panel(4, '꼭 지켜요', 'required', '필터', false);
  panel(152, '되도록 지켜요', 'preferred', '점수', true);
  return [300, 250, o];
};

// 가용 영역에 흩어 두면 한 곳이 멈춰도 남아요
figs['sc-spread'] = () => {
  const o = [];
  const row = (y0, title, pods, note, ok) => {
    o.push(t13(8, y0, title, { weight: 700 }));
    ['a', 'b', 'c'].forEach((z, i) => {
      const x = 4 + i * 98;
      const down = (ok && i === 1) || (!ok && i === 0);
      o.push(zone(x, y0 + 10, 92, 88, `영역 ${z}`, { fill: down ? 'warnWeak' : 'card', tone: down ? 'warn' : 'line', labelTone: down ? 'warn' : 'sub' }));
      for (let k = 0; k < pods[i]; k++) o.push(pod(x + 46 + (k - (pods[i] - 1) / 2) * 27, y0 + 48, '', { w: 22, h: 20, tone: down ? 'warn' : 'soft' }));
      if (down) o.push(xmark(x + 78, y0 + 26, { r: 5 }));
      if (down) o.push(label(x + 46, y0 + 84, '멈춤', 'warn', 700));
    });
    o.push(t13(8, y0 + 120, note, { weight: 700, tone: ok ? 'accent' : 'warn' }));
  };
  row(16, '흩어 두면', [1, 1, 1], '한 영역이 멈춰도 파드 둘이 남아요', true);
  row(162, '한 곳에 몰리면', [3, 0, 0], '그 영역이 멈추면 앱 전체가 멈춰요', false);
  return [300, 290, o];
};

// GPU 노드를 한 팀 전용으로: taint와 어피니티를 함께
figs['sc-taint-affinity'] = () => {
  const o = [];
  const panel = (px, title, aff) => {
    o.push(rect(px, 4, 144, 250, { rx: 12, fill: 'card', stroke: 'none' }));
    o.push(text(px + 12, 26, title, { size: 13, weight: 700 }));
    o.push(pod(px + 40, 62, '이 팀', { w: 56, tone: 'new' }));
    o.push(pod(px + 104, 62, '다른 팀', { w: 56, tone: 'old' }));
    o.push(g.server(px + 40, 162, { tone: 'accent' }));
    o.push(label(px + 40, 196, 'GPU 노드', 'accent', 700));
    o.push(tag(px + 40, 128, 'taint', { tone: 'warnSoft', size: 13 }));
    o.push(g.server(px + 104, 162));
    o.push(label(px + 104, 196, '일반 노드', 'text', 600));
    // 다른 팀은 GPU로 못 가요
    o.push(line(px + 98, 76, px + 58, 118, { tone: 'warn', sw: 1.6, dash: '3 3' }));
    o.push(xmark(px + 78, 97, { r: 4.5 }));
    if (aff) {
      o.push(arrow([[px + 40, 76], [px + 40, 116]], { tone: 'accent', sw: 2.2, size: 7 }));
      o.push(t13(px + 12, 222, '이 팀 파드는', { tone: 'sub' }));
      o.push(t13(px + 12, 240, 'GPU 노드로만 가요', { weight: 700, tone: 'accent' }));
    } else {
      o.push(arrow([[px + 30, 76], [px + 30, 116]], { tone: 'accent', sw: 1.8, size: 6, dash: '4 3' }));
      o.push(arrow([[px + 50, 76], [px + 96, 140]], { tone: 'accent', sw: 1.8, size: 6, dash: '4 3' }));
      o.push(t13(px + 12, 222, '이 팀 파드는', { tone: 'sub' }));
      o.push(t13(px + 12, 240, '아무 노드에나 가요', { weight: 700, tone: 'warn' }));
    }
  };
  panel(4, 'taint만 붙이면', false);
  panel(152, 'taint + 어피니티', true);
  return [300, 258, o];
};

// ── service-mesh ──

// 사이드카를 거쳐 mTLS로, istiod가 설정과 인증서를 내려줘요
figs['sm-mesh'] = () => {
  const o = [];
  [[4, '주문 파드', '주문 앱'], [160, '결제 파드', '결제 앱']].forEach(([x, n, a]) => {
    o.push(zone(x, 6, 136, 112, n, { fill: 'card', dash: null, labelTone: 'text' }));
    o.push(box(x + 14, 32, 108, 28, a, null, { tone: 'plain' }));
    o.push(box(x + 14, 78, 108, 28, 'Envoy 사이드카', null, { tone: 'soft' }));
  });
  o.push(arrow([[72, 60], [72, 76]], { tone: 'accent', sw: 2, size: 6 }));
  o.push(arrow([[122, 92], [174, 92]], { tone: 'accent', sw: 2.2, size: 7 }));
  o.push(g.lock(148, 74, { tone: 'accent' }));
  o.push(arrow([[228, 78], [228, 62]], { tone: 'accent', sw: 2, size: 6 }));
  o.push(box(90, 150, 120, 44, 'istiod', '컨트롤 플레인', { tone: 'accent' }));
  o.push(arrow([[110, 150], [72, 108]], { tone: 'sub', sw: 1.6, size: 6, dash: '4 3' }));
  o.push(arrow([[190, 150], [228, 108]], { tone: 'sub', sw: 1.6, size: 6, dash: '4 3' }));
  o.push(t13(150, 136, '설정·인증서', { tone: 'sub', anchor: 'middle', weight: 600 }));
  o.push(t13(150, 216, '사이드카끼리 mTLS로 주고받아요', { weight: 600, tone: 'accent', anchor: 'middle' }));
  return [300, 224, o];
};

// 통신 일은 프록시로, 헤더 넘기기는 여전히 앱이
figs['sm-moves'] = () => {
  const o = [];
  const chip = (x, y, s, tone) => o.push(tag(x, y, s, { tone, size: 13, anchor: 'start' }));
  const panel = (px, title) => {
    o.push(rect(px, 4, 144, 260, { rx: 12, fill: 'card', stroke: 'none' }));
    o.push(text(px + 12, 26, title, { size: 13, weight: 700 }));
  };
  panel(4, '앱 코드에서');
  panel(152, '서비스 메시에서');
  [['Java 앱', 40], ['Go 앱', 140]].forEach(([n, y]) => {
    o.push(rect(14, y, 124, 88, { rx: 8, fill: 'bg', stroke: 'sub', sw: 1.3 }));
    o.push(t13(22, y + 18, n, { weight: 700 }));
    chip(22, y + 40, '재시도', 'sub');
    chip(76, y + 40, '암호화', 'sub');
    chip(22, y + 68, '지표', 'sub');
    chip(76, y + 68, '헤더', 'warnSoft');
  });
  o.push(t13(14, 248, '언어마다 따로 만들어요', { tone: 'sub' }));
  [['Java 앱', 40], ['Go 앱', 140]].forEach(([n, y]) => {
    o.push(rect(162, y, 58, 88, { rx: 8, fill: 'bg', stroke: 'sub', sw: 1.3 }));
    o.push(t13(170, y + 18, n.split(' ')[0], { weight: 700 }));
    chip(168, y + 68, '헤더', 'warnSoft');
    o.push(rect(224, y, 64, 88, { rx: 8, fill: 'accentWeak', stroke: 'accent', sw: 1.3 }));
    o.push(t13(232, y + 18, '프록시', { weight: 700, tone: 'accent' }));
    chip(230, y + 40, '재시도', 'soft');
    chip(230, y + 68, 'mTLS', 'soft');
  });
  o.push(t13(162, 248, '프록시 설정 하나로 같게', { tone: 'accent', weight: 600 }));
  o.push(rect(4, 272, 292, 32, { rx: 8, fill: 'warnWeak', stroke: 'none' }));
  o.push(t13(150, 293, '트레이스를 잇는 헤더 넘기기는 여전히 앱의 일', { weight: 700, tone: 'warn', anchor: 'middle' }));
  return [300, 308, o];
};

// 사이드카 모드와 앰비언트 모드
figs['sm-ambient'] = () => {
  const o = [];
  const row = (y0, title, ambient) => {
    o.push(t13(8, y0, title, { weight: 700 }));
    o.push(zone(4, y0 + 10, 292, ambient ? 104 : 92, '노드', { fill: 'card', dash: null, labelTone: 'sub' }));
    for (let i = 0; i < 3; i++) {
      const x = 14 + i * 94;
      o.push(rect(x, y0 + 34, 84, ambient ? 34 : 56, { rx: 8, fill: 'bg', stroke: 'sub', sw: 1.3 }));
      o.push(t13(x + 10, y0 + 56, '앱', { weight: 700 }));
      if (!ambient) o.push(tag(x + 42, y0 + 76, 'Envoy', { tone: 'soft', size: 13 }));
    }
    if (ambient) {
      o.push(rect(14, y0 + 76, 272, 28, { rx: 7, fill: 'accentWeak', stroke: 'accent', sw: 1.3 }));
      o.push(t13(24, y0 + 95, 'ztunnel · 노드마다 하나 · mTLS', { weight: 700, tone: 'accent' }));
    }
  };
  row(16, '사이드카 모드', false);
  o.push(t13(8, 140, '파드마다 Envoy · 프록시 하나에 약 0.20 vCPU, 60MB', { tone: 'sub' }));
  row(170, '앰비언트 모드', true);
  o.push(t13(8, 306, 'ztunnel 약 0.06 vCPU, 12MB', { tone: 'sub' }));
  o.push(t13(8, 326, 'HTTP 재시도·지표는 waypoint를 따로 둬요', { tone: 'warn', weight: 600 }));
  return [300, 334, o];
};

// 요청 한 건을 두 프록시가 각자 세요
figs['sm-reporter'] = () => {
  const o = [];
  [[4, '주문 파드', 'source'], [160, '결제 파드', 'destination']].forEach(([x, n, rp]) => {
    o.push(zone(x, 6, 136, 76, n, { fill: 'card', dash: null, labelTone: 'text' }));
    o.push(box(x + 14, 32, 108, 30, '프록시', null, { tone: 'soft' }));
    o.push(text(x + 68, 104, `reporter="${rp}"`, { size: 13, mono: true, anchor: 'middle', tone: 'sub', fit: rp === 'destination' ? 132 : undefined }));
    o.push(tag(x + 68, 128, '+1건', { tone: 'warnSoft' }));
  });
  o.push(arrow([[126, 47], [172, 47]], { tone: 'accent', sw: 2.2, size: 7 }));
  o.push(t13(150, 38, '1건', { tone: 'accent', weight: 700, anchor: 'middle' }));
  o.push(line(4, 152, 296, 152, { tone: 'line', sw: 1, cap: 'butt' }));
  o.push(xmark(16, 176, { r: 5 }));
  o.push(t13(30, 181, '그냥 더하면', { tone: 'sub' }));
  o.push(text(288, 182, '2건', { size: 15, weight: 700, tone: 'warn', anchor: 'end' }));
  o.push(g.check(16, 208, { r: 6 }));
  o.push(text(30, 213, 'reporter="destination"', { size: 13, mono: true, tone: 'accent', fit: 172 }));
  o.push(text(288, 214, '1건', { size: 15, weight: 700, tone: 'accent', anchor: 'end' }));
  return [300, 224, o];
};

// 응답 플래그: 앱이 낸 응답인가, 프록시가 붙인 까닭인가
figs['sm-flags'] = () => {
  const o = [];
  const row = (y, f, s, code, tone) => {
    o.push(tag(14, y, f, { tone, anchor: 'start', size: 13 }));
    o.push(t13(70, y + 5, s, { weight: 600 }));
    if (code) o.push(text(288, y + 5, code, { size: 13, weight: 700, mono: true, tone: 'warn', anchor: 'end' }));
  };
  o.push(t13(8, 18, '앱까지 갔어요', { weight: 700, tone: 'sub' }));
  row(42, '-', '앱이 낸 응답 그대로', null, 'soft');
  row(72, 'URX', '앱이 계속 실패해 재시도를 다 씀', null, 'warnSoft');
  o.push(line(8, 92, 292, 92, { tone: 'line', sw: 1, cap: 'butt' }));
  o.push(t13(8, 114, '프록시가 앱에 닿지 못했어요', { weight: 700, tone: 'sub' }));
  row(138, 'UF', '연결 실패', '503', 'warnSoft');
  row(168, 'UH', '건강한 대상이 없음', '503', 'warnSoft');
  row(198, 'UO', '서킷 브레이커가 막음', '503', 'warnSoft');
  row(228, 'NR', '맞는 경로가 없음', '404', 'warnSoft');
  return [300, 244, o];
};

// 재시도는 겹치면 곱해져요: 앱 3번 × 메시 3번 = 9번
figs['sm-retry'] = () => {
  const o = [];
  o.push(t13(8, 16, '주문 앱 시도', { weight: 700 }));
  o.push(t13(132, 16, '메시가 다시', { weight: 700, tone: 'accent' }));
  o.push(t13(292, 16, '결제 앱', { weight: 700, anchor: 'end' }));
  for (let i = 0; i < 3; i++) {
    const y = 46 + i * 54;
    o.push(box(8, y - 15, 78, 30, `시도 ${i + 1}`, null, { tone: 'plain' }));
    o.push(arrow([[86, y], [120, y]], { tone: 'sub', sw: 1.8, size: 6 }));
    o.push(box(122, y - 15, 64, 30, '프록시', null, { tone: 'soft' }));
    for (let k = 0; k < 3; k++) {
      o.push(line(186, y, 230, y - 16 + k * 16, { tone: 'warn', sw: 1.4 }));
      o.push(g.circle(240 + 0, y - 16 + k * 16, 6, { fill: 'warn' }));
    }
    o.push(t13(254, y + 5, '3번', { weight: 700, tone: 'warn' }));
  }
  o.push(rect(4, 186, 292, 66, { rx: 10, fill: 'warnWeak', stroke: 'none' }));
  o.push(text(150, 212, '결제 앱이 받은 요청 3 × 3 = 9번', { size: 14, weight: 700, tone: 'warn', anchor: 'middle' }));
  o.push(t13(150, 238, '재시도 없으면 1번, 메시만이면 3번', { tone: 'sub', anchor: 'middle' }));
  return [300, 258, o];
};

// ── pod-network ──

// 노드마다 파드 IP 범위, 파드끼리는 IP로 바로
figs['pnw-ranges'] = () => {
  const o = [];
  [[4, '노드 1', '10.244.1.0/24', [['A', '10.244.1.5'], ['B', '10.244.1.6']]], [154, '노드 2', '10.244.2.0/24', [['C', '10.244.2.7']]]].forEach(([x, n, cidr, pods]) => {
    o.push(zone(x, 6, 142, 172, n, { fill: 'card', dash: null, labelTone: 'text' }));
    o.push(text(x + 132, 24, cidr, { size: 13, mono: true, tone: 'accent', anchor: 'end', weight: 600, fit: cidr.length * 7.9 > 74 ? 74 : undefined }));
    pods.forEach(([p, ip], i) => {
      const y = 62 + i * 64;
      o.push(pod(x + 71, y, `파드 ${p}`, { w: 76, h: 30 }));
      o.push(text(x + 71, y + 32, ip, { size: 13, mono: true, tone: 'sub', anchor: 'middle' }));
    });
  });
  o.push(arrow([[113, 62], [186, 62]], { tone: 'accent', sw: 2.2, size: 7 }));
  o.push(rect(4, 192, 292, 40, { rx: 10, fill: 'accentWeak', stroke: 'none' }));
  o.push(t13(150, 217, '노드가 달라도 NAT 없이 IP로 바로 닿아요', { weight: 700, tone: 'accent', anchor: 'middle' }));
  return [300, 238, o];
};

// 오버레이: 노드 주소로 한 번 더 감싸요
figs['pnw-overlay'] = () => {
  const o = [];
  const inner = [{ t: '파드 A→C', tone: 'soft' }, { t: '데이터', tone: 'plain' }];
  const row = (y, title, fields, note) => {
    o.push(t13(30, y, title, { weight: 700 }));
    o.push(g.packet(30, y + 10, fields, { h: 26 }).svg);
    if (note) o.push(t13(30, y + 56, note, { tone: 'sub' }));
  };
  o.push(line(14, 10, 14, 236, { tone: 'line', sw: 2 }));
  [[14, 1], [96, 2], [184, 3]].forEach(([y, n]) => o.push(g.badge(14, y + 4, n, { tone: n === 2 ? 'accent' : 'sub' })));
  row(18, '파드 A가 보낸 그대로', inner);
  row(100, '노드 1이 노드 주소로 감싸서 보내요', [{ t: '노드 1→2', tone: 'accent' }, { t: 'VXLAN', tone: 'accent' }, ...inner], '바깥 네트워크는 노드 주소만 봐요');
  row(188, '노드 2가 벗겨서 파드 C에 넘겨요', inner);
  return [300, 232, o];
};

// 오버레이와 라우팅
figs['pnw-routing'] = () => {
  const o = [];
  const panel = (px, title, ex, overlay) => {
    o.push(rect(px, 4, 144, 262, { rx: 12, fill: 'card', stroke: 'none' }));
    o.push(text(px + 12, 26, title, { size: 14, weight: 700 }));
    o.push(t13(px + 12, 44, ex, { tone: 'sub' }));
    // 패킷 크기(MTU 1,500 안에)
    o.push(t13(px + 12, 70, '선 하나에 1,500바이트', { tone: 'sub' }));
    o.push(rect(px + 12, 78, 120, 24, { rx: 4, fill: 'line', stroke: 'none' }));
    if (overlay) {
      o.push(rect(px + 12, 78, 22, 24, { rx: 4, fill: 'accent', stroke: 'none' }));
      o.push(rect(px + 34, 78, 98, 24, { rx: 0, fill: 'accentWeak', stroke: 'none' }));
      o.push(label(px + 83, 95, '파드 1,450', 'accent', 700));
      o.push(t13(px + 12, 122, '머리표만큼 줄어요', { tone: 'warn', weight: 600 }));
    } else {
      o.push(rect(px + 12, 78, 120, 24, { rx: 4, fill: 'accentWeak', stroke: 'none' }));
      o.push(label(px + 72, 95, '파드 1,500', 'accent', 700));
      o.push(t13(px + 12, 122, '실을 자리 그대로예요', { tone: 'accent', weight: 600 }));
    }
    o.push(g.router(px + 40, 172));
    o.push(t13(px + 70, 168, '바깥 네트워크', { weight: 600 }));
    o.push(t13(px + 70, 186, overlay ? '노드 IP만 알면' : '파드 범위를', { tone: 'sub' }));
    o.push(t13(px + 70, 202, overlay ? '돼요' : '알아야 해요', { tone: overlay ? 'accent' : 'warn', weight: 600 }));
    o.push(t13(px + 12, 238, overlay ? '바깥을 안 건드려요' : '감싸는 손해가 없어요', { weight: 700, tone: 'text' }));
  };
  panel(4, '오버레이', 'Flannel VXLAN 등', true);
  panel(152, '라우팅', 'Calico BGP 등', false);
  return [300, 270, o];
};

// NetworkPolicy: 프런트 파드만 들어와요
figs['pnw-policy'] = () => {
  const o = [];
  o.push(pod(56, 46, '프런트', { w: 76, h: 32, tone: 'new' }));
  o.push(text(56, 80, 'app=front', { size: 13, mono: true, tone: 'accent', anchor: 'middle' }));
  o.push(pod(56, 140, '다른 파드', { w: 76, h: 32, tone: 'old' }));
  o.push(text(56, 174, 'app=batch', { size: 13, mono: true, tone: 'sub', anchor: 'middle' }));
  o.push(rect(170, 50, 124, 104, { rx: 14, fill: 'accentWeak', stroke: 'accent', sw: 1.6, dash: '5 4' }));
  o.push(t13(182, 72, '정책', { weight: 700, tone: 'accent' }));
  o.push(text(182, 90, 'from: app=front', { size: 13, mono: true, tone: 'accent', fit: 104 }));
  o.push(pod(232, 124, '주문', { w: 70, h: 32 }));
  o.push(arrow([[94, 46], [196, 118]], { tone: 'accent', sw: 2.2, size: 7 }));
  o.push(g.check(132, 64, { r: 6 }));
  o.push(line(94, 140, 166, 132, { tone: 'warn', sw: 2, dash: '4 3' }));
  o.push(xmark(170, 132, { r: 6 }));
  o.push(t13(150, 206, '정책이 걸리면 허락한 곳만 들어와요', { tone: 'sub', anchor: 'middle' }));
  return [300, 214, o];
};

// ── node-drain ──

// 계획된 중단과 뜻밖의 중단
figs['nd-disruptions'] = () => {
  const o = [];
  const panel = (px, title, en, icon, ex, pdbOk, pdb, prep) => {
    o.push(rect(px, 4, 144, 270, { rx: 12, fill: 'card', stroke: 'none' }));
    o.push(text(px + 12, 26, title, { size: 14, weight: 700 }));
    o.push(text(px + 12, 44, en, { size: 13, tone: 'sub', mono: true }));
    o.push(icon(px + 72, 84));
    ex.forEach((s, i) => o.push(t13(px + 12, 128 + i * 18, s, { weight: 600 })));
    o.push(line(px + 12, 168, px + 132, 168, { tone: 'line', sw: 1, cap: 'butt' }));
    o.push(pdbOk ? g.check(px + 18, 186, { r: 5.5 }) : xmark(px + 18, 186, { r: 5 }));
    o.push(t13(px + 30, 191, pdb, { weight: 700, tone: pdbOk ? 'accent' : 'warn' }));
    o.push(t13(px + 12, 220, '대비', { tone: 'sub' }));
    prep.forEach((s, i) => o.push(t13(px + 12, 240 + i * 18, s, { weight: 600 })));
  };
  panel(4, '계획된 중단', 'voluntary', (x, y) => [g.server(x - 16, y), g.gear(x + 18, y + 6, { r: 11, tone: 'accent' })].join('\n'), ['노드 점검·업그레이드', '노드 줄이기'], true, 'PDB가 막아요', ['PDB를 두고', '한 노드씩 비워요']);
  panel(152, '뜻밖의 중단', 'involuntary', (x, y) => [g.server(x, y, { tone: 'warn' }), xmark(x + 18, y - 14, { r: 5 })].join('\n'), ['하드웨어 고장', '커널 패닉, 압박 축출'], false, 'PDB로 못 막아요', ['복제본 여러 개를', '노드에 나눠 둬요']);
  o.push(t13(150, 296, 'PDB는 축출 요청을 거치는 것만 막아요', { tone: 'sub', anchor: 'middle' }));
  return [300, 304, o];
};

// drain의 축출 요청: PDB 여유가 없으면 429, 잠시 뒤 다시
figs['nd-evict'] = () => {
  const o = [];
  const lanes = [{ x: 40, label: 'drain' }, { x: 160, label: 'API 서버' }, { x: 262, label: '파드' }];
  o.push(ladder(lanes, [
    { from: 0, to: 1, y: 52, label: '파드 축출 요청' },
    { from: 1, to: 0, y: 86, label: '429 · PDB 여유 0', dashed: true, tone: 'warn' },
    { from: 0, to: 1, y: 132, label: '잠시 뒤 다시' },
    { from: 1, to: 0, y: 166, label: '허용', dashed: true, tone: 'accent' },
    { from: 1, to: 2, y: 200, label: '종료 신호', tone: 'accent' },
  ], { top: 18, bottom: 218 }));
  o.push(t13(150, 244, '대신할 파드가 준비되어 여유가 생기면 허용돼요', { tone: 'sub', anchor: 'middle' }));
  return [300, 252, o];
};

// 앱 모양에 맞춘 PDB
figs['nd-pdb'] = () => {
  const o = [];
  const rows = [
    ['상태 없는 웹 서버', '처리량을 10% 넘게 줄이지 않기', 'minAvailable 90%', 'soft'],
    ['쿼럼이 있는 저장소 5개', '과반이 늘 살아 있기', 'minAvailable 3', 'soft'],
    ['복제본 하나', '0으로 두면 drain이 멈춰요', 'PDB 없음 · 0', 'warnSoft'],
    ['다시 돌릴 수 있는 Job', '새 파드가 이어서 해요', 'PDB 없음', 'sub'],
  ];
  rows.forEach(([n, s, t, tone], i) => {
    const y = 6 + i * 58;
    o.push(rect(4, y, 292, 52, { rx: 10, fill: 'card', stroke: 'none' }));
    o.push(t13(14, y + 21, n, { weight: 700 }));
    o.push(t13(14, y + 41, s, { tone: tone === 'warnSoft' ? 'warn' : 'sub' }));
    o.push(tag(288, y + 16, t, { tone, anchor: 'end' }));
  });
  return [300, 238, o];
};

// ── crd-and-operators ──

// 기본 종류와 CRD로 더한 종류를 똑같이 다뤄요
figs['crd-kinds'] = () => {
  const o = [];
  o.push(zone(4, 6, 292, 174, 'API 서버가 다루는 종류', { fill: 'card', dash: null, labelTone: 'text' }));
  o.push(t13(16, 50, '기본 종류', { tone: 'sub', weight: 600 }));
  [['Pod', 16], ['Service', 66], ['Deployment', 146]].forEach(([k, x]) => o.push(tag(x, 70, k, { tone: 'sub', anchor: 'start', size: 13 })));
  o.push(t13(16, 106, 'CRD로 더한 종류', { tone: 'accent', weight: 700 }));
  [['ServiceMonitor', 16, 126], ['PrometheusRule', 142, 126], ['Prometheus', 16, 156]].forEach(([k, x, y]) => o.push(tag(x, y, k, { tone: 'soft', anchor: 'start', size: 13 })));
  const tools = [[52, (x, y) => g.doc(x, y, { lines: 3 }), 'YAML로 만들고'], [150, (x, y) => g.panel(x, y, { w: 40, h: 30, points: null }), 'kubectl로 보고'], [248, (x, y) => g.lock(x, y, { tone: 'accent' }), 'RBAC로 권한']];
  tools.forEach(([cx, ic, s]) => {
    o.push(ic(cx, 214));
    o.push(label(cx, 252, s, 'text', 600));
  });
  o.push(t13(150, 278, '둘 다 같은 방법으로 다뤄요', { tone: 'accent', weight: 700, anchor: 'middle' }));
  return [300, 286, o];
};

// 오퍼레이터의 되맞추기 고리
figs['crd-loop'] = () => {
  const o = [];
  const C = [150, 120];
  const nodes = [[-90, '지켜봐요', '바뀌면 알아요', 'soft'], [0, '견줘요', '원하는 vs 지금', 'plain'], [90, '맞춰요', '실제를 바꿔요', 'plain'], [180, '적어요', 'status에 결과', 'plain']];
  const R = [94, 84];
  const pt = (deg) => [C[0] + R[0] * Math.cos((deg * Math.PI) / 180), C[1] + R[1] * Math.sin((deg * Math.PI) / 180)];
  for (let i = 0; i < 4; i++) {
    const a0 = nodes[i][0] + 28;
    const a1 = nodes[(i + 1) % 4][0] + (i === 3 ? 360 : 0) - 28;
    const pts = [];
    for (let k = 0; k <= 12; k++) pts.push(pt(a0 + ((a1 - a0) * k) / 12));
    o.push(arrow(pts, { tone: 'accent', sw: 2, size: 7 }));
  }
  nodes.forEach(([deg, t, s, tone]) => {
    const [x, y] = pt(deg);
    o.push(box(x - 50, y - 21, 100, 42, t, s, { tone }));
  });
  o.push(text(C[0], C[1] + 5, '오퍼레이터', { size: 14, weight: 700, tone: 'accent', anchor: 'middle' }));
  o.push(t13(150, 254, '리소스가 바뀔 때도, 실제가 달라질 때도 다시 돌아요', { tone: 'sub', anchor: 'middle' }));
  return [300, 262, o];
};

// ── managed-kubernetes ──

// 운영 방식마다 누가 무엇을 맡나: 클라우드 칸이 계단처럼 늘어요
figs['mk-matrix'] = () => {
  const o = [];
  const rows = [['컨트롤', '플레인'], ['etcd'], ['노드 OS'], ['노드 수'], ['파드']];
  const cols = [['직접', '운영'], ['관리형', '노드 그룹'], ['노드까지', '맡김']];
  const cloud = [[0, 0, 0, 0, 0], [1, 1, 0, 0, 0], [1, 1, 1, 1, 0]];
  const CX = (j) => 115 + j * 74;
  const Y = (i) => 52 + i * 40;
  cols.forEach(([a, b], j) => {
    o.push(label(CX(j), 18, a, 'text', 700));
    o.push(label(CX(j), 36, b, 'text', 700));
  });
  rows.forEach((r, i) => {
    const y = Y(i);
    if (r.length === 2) {
      o.push(t13(8, y + 15, r[0], { weight: 600 }));
      o.push(t13(8, y + 31, r[1], { weight: 600 }));
    } else o.push(t13(8, y + 23, r[0], { weight: 600 }));
    cols.forEach((_, j) => {
      const c = cloud[j][i];
      o.push(rect(CX(j) - 33, y + 3, 66, 32, { rx: 7, fill: c ? 'accent' : 'bg', stroke: c ? 'none' : 'line', sw: 1.2 }));
      o.push(label(CX(j), y + 23.5, c ? '클라우드' : '내가', c ? 'card' : 'text', c ? 700 : 600));
    });
  });
  o.push(t13(8, 266, '노드까지 맡김: Fargate, GKE Autopilot', { tone: 'sub' }));
  return [300, 274, o];
};

// EKS 컨트롤 플레인을 보는 길: 클라우드가 열어 준 만큼만 보여요
figs['mk-eks'] = () => {
  const o = [];
  o.push(zone(4, 4, 292, 250, 'AWS가 운영하는 컨트롤 플레인', { fill: 'none', labelTone: 'sub' }));
  const rows = [
    ['API 서버 지표', '/metrics로 그대로 읽어요', '늘', 'accent', 'soft'],
    ['스케줄러·컨트롤러 매니저', 'metrics.eks.amazonaws.com', '1.28부터', 'soft', 'plain'],
    ['컨트롤 플레인 로그', '켜야 CloudWatch Logs로 가요', '기본 꺼짐', 'warnSoft', 'plain'],
    ['etcd', '직접 들어가 볼 수 없어요', '안 보여요', 'sub', 'bg'],
  ];
  rows.forEach(([name, route, st, tagTone, cardTone], i) => {
    const y = 34 + i * 54;
    o.push(rect(12, y, 276, 46, { rx: 8, fill: cardTone === 'soft' ? 'accentWeak' : cardTone === 'bg' ? 'bg' : 'card', stroke: cardTone === 'soft' ? 'accent' : 'line', sw: 1.3 }));
    o.push(t13(22, y + 19, name, { weight: 700, tone: cardTone === 'soft' ? 'accent' : cardTone === 'bg' ? 'sub' : 'text' }));
    o.push(t13(22, y + 37, route, { tone: cardTone === 'soft' ? 'accent' : 'sub' }));
    o.push(tag(280, y + 15, st, { tone: tagTone, anchor: 'end' }));
    if (st === '안 보여요') o.push(g.lock(280 - tag.width(st) - 16, y + 12, { tone: 'sub' }));
  });
  return [300, 260, o];
};

// ── openshift ──

// Route: 라우터가 서비스에서 주소만 얻고, 요청은 파드로 바로
figs['os-route'] = () => {
  const o = [];
  o.push(g.laptop(34, 30));
  o.push(label(34, 60, '사용자', 'text', 600));
  o.push(arrow([[56, 32], [106, 32]], { tone: 'accent', sw: 2.2, size: 8 }));
  o.push(box(108, 12, 84, 42, '라우터', 'HAProxy', { tone: 'accent' }));
  // Route 객체: 라우터가 읽는 규칙
  o.push(g.doc(46, 124, { lines: 3 }));
  o.push(label(46, 160, 'Route', 'text', 700));
  o.push(label(48, 177, '호스트 → 서비스', 'sub', 400));
  o.push(arrow([[62, 112], [116, 58]], { tone: 'sub', sw: 1.6, size: 6, dash: '4 3' }));
  o.push(t13(66, 88, '규칙', { tone: 'sub', anchor: 'end' }));
  o.push(box(108, 112, 84, 42, '서비스', '파드 주소 목록', { tone: 'plain' }));
  o.push(arrow([[150, 112], [150, 58]], { tone: 'sub', sw: 1.6, size: 6, dash: '4 3' }));
  o.push(t13(157, 90, '주소만', { tone: 'sub' }));
  [[258, 30, '파드 1'], [258, 92, '파드 2']].forEach(([cx, cy, n]) => {
    o.push(arrow([[192, 33], [cx - 36, cy]], { tone: 'accent', sw: 2.2, size: 8 }));
    o.push(pod(cx, cy, n, { w: 68, h: 30 }));
  });
  o.push(t13(150, 212, '요청은 서비스를 거치지 않고 파드로 바로 가요', { weight: 700, tone: 'accent', anchor: 'middle' }));
  return [300, 222, o];
};

// SCC 검사: 통과하면 범위의 첫 UID로, 특권 요청이면 파드가 안 생겨요
figs['os-scc'] = () => {
  const o = [];
  o.push(box(6, 20, 84, 40, '파드 만들기', null, { tone: 'plain' }));
  o.push(arrow([[90, 40], [112, 40]], { tone: 'sub', sw: 2, size: 7 }));
  o.push(box(112, 14, 90, 52, 'SCC 검사', 'restricted', { tone: 'soft' }));
  o.push(arrow([[202, 40], [234, 40]], { tone: 'accent', sw: 2.2, size: 8 }));
  o.push(t13(218, 30, '통과', { tone: 'accent', weight: 700, anchor: 'middle' }));
  o.push(pod(262, 40, '파드', { w: 50, h: 30, tone: 'new' }));
  o.push(t13(294, 76, '범위의 첫 UID로', { tone: 'accent', weight: 600, anchor: 'end' }));
  o.push(arrow([[157, 66], [157, 118]], { tone: 'warn', sw: 2.2, size: 8 }));
  o.push(t13(149, 98, '특권 실행 요청', { tone: 'warn', weight: 600, anchor: 'end' }));
  o.push(box(102, 120, 110, 42, '거절', '파드가 없어요', { tone: 'warn' }));
  o.push(rect(230, 122, 50, 30, { rx: 8, fill: 'none', stroke: 'weak', sw: 1.5, dash: '4 3' }));
  o.push(xmark(255, 137, { r: 6 }));
  o.push(t13(8, 196, '이유는 ReplicaSet 같은 위 객체의 이벤트에', { tone: 'sub' }));
  return [300, 204, o];
};

// OpenShift 기본 모니터링 묶음: Operator가 모두 깔고 관리해요
figs['os-monitoring'] = () => {
  const o = [];
  o.push(rect(2, 2, 296, 270, { rx: 12, fill: 'none', stroke: 'accent', sw: 1.5, dash: '5 4' }));
  o.push(box(12, 14, 132, 34, 'Thanos Querier', null, { tone: 'plain' }));
  o.push(box(156, 14, 132, 34, 'Alertmanager', null, { tone: 'plain' }));
  o.push(box(90, 84, 120, 36, 'Prometheus', null, { tone: 'accent' }));
  o.push(arrow([[86, 48], [118, 84]], { tone: 'sub', sw: 1.8, size: 7 }));
  o.push(t13(90, 74, '질의', { tone: 'sub', anchor: 'end' }));
  o.push(arrow([[182, 84], [214, 48]], { tone: 'sub', sw: 1.8, size: 7 }));
  o.push(t13(210, 74, '알림', { tone: 'sub' }));
  const ex = [[54, 'node-', 'exporter'], [150, 'kube-state-', 'metrics'], [246, 'openshift-', 'state-metrics']];
  ex.forEach(([cx, a, b]) => {
    o.push(arrow([[cx, 154], [150 + (cx - 150) * 0.32, 122]], { tone: 'accent', sw: 1.8, size: 7 }));
    o.push(rect(cx - 46, 154, 92, 44, { rx: 8, fill: 'card', stroke: 'sub', sw: 1.4 }));
    o.push(label(cx, 173, a, 'text', 600));
    o.push(label(cx, 190, b, 'text', 600));
  });
  o.push(t13(158, 142, '모아요', { tone: 'accent', weight: 600 }));
  o.push(g.gear(30, 236, { tone: 'accent' }));
  o.push(t13(52, 232, 'Cluster Monitoring Operator', { weight: 700, tone: 'accent' }));
  o.push(t13(52, 252, '위 구성 요소를 모두 깔고 관리해요', { tone: 'sub' }));
  return [300, 276, o];
};

// 일반 쿠버네티스와 OpenShift: 더해진 것만 강조
figs['os-compare'] = () => {
  const o = [];
  const cols = [{ t: '', w: 78 }, { t: '쿠버네티스', w: 98 }, { t: 'OpenShift', w: 116 }];
  const rows = [
    ['바깥 접속', '인그레스', ''],
    ['이름 묶음', '네임스페이스', '프로젝트'],
    ['파드 거절', '권한, 할당량', ''],
  ];
  const T = table(4, 4, cols, rows, { rowH: 36, headH: 30 });
  o.push(T.svg);
  const cx = 4 + 78 + 98;
  const cell = (r, s) => {
    const y = 4 + 30 + r * 36;
    o.push(rect(cx + 5, y + 5, 116 - 10, 26, { rx: 6, fill: 'accentWeak', stroke: 'accent', sw: 1.2 }));
    o.push(t13(cx + 13, y + 23, s, { weight: 700, tone: 'accent' }));
  };
  cell(0, 'Route');
  cell(2, '+ SCC 검사');
  o.push(t13(8, 168, '인그레스를 만들면 Route도 함께 생겨요', { tone: 'sub' }));
  o.push(t13(8, 188, '프로젝트는 주석이 더 붙은 네임스페이스', { tone: 'sub' }));
  return [300, 196, o];
};

// ── metrics-sources ──

// usage는 비울 수 있는 캐시까지, working set은 그 캐시를 빼요
figs['ks-ws'] = () => {
  const o = [];
  const X = (v) => 8 + (v / 1024) * 283;
  const y0 = 32;
  const h = 34;
  o.push(t13(8, 18, '메모리 한도 1Gi인 컨테이너', { weight: 700 }));
  o.push(rect(X(0), y0, X(1024) - X(0), h, { rx: 5, fill: 'bg', stroke: 'line', sw: 1.2 }));
  o.push(rect(X(0), y0, X(600) - X(0), h, { rx: 5, fill: 'accent', stroke: 'none' }));
  o.push(rect(X(600), y0, X(700) - X(600), h, { rx: 0, fill: 'accent', stroke: 'none', op: 0.5 }));
  o.push(rect(X(700), y0, X(900) - X(700), h, { rx: 0, fill: 'sub', stroke: 'none', op: 0.4 }));
  [600, 700, 900].forEach((v) => o.push(line(X(v), y0, X(v), y0 + h, { tone: 'card', sw: 1.5, cap: 'butt' })));
  o.push(line(X(1024), y0 - 8, X(1024), y0 + h + 6, { tone: 'warn', sw: 2.4, cap: 'butt' }));
  o.push(t13(X(1024), 18, '한도', { weight: 700, tone: 'warn', anchor: 'end' }));
  o.push(label(X(300), y0 + 22, '앱 600Mi', 'card', 700));
  // 작은 칸은 끌어낸 선으로 이름을 붙여요
  o.push(line(X(650), y0 + h, X(650), 82, { tone: 'accent', sw: 1.4 }));
  o.push(t13(X(650) + 6, 96, '자주 쓰는 캐시 100Mi', { tone: 'accent', weight: 600, anchor: 'end' }));
  o.push(line(X(800), y0 + h, X(800), 104, { tone: 'sub', sw: 1.4 }));
  o.push(t13(X(800) + 6, 118, '비울 수 있는 캐시 200Mi', { tone: 'sub', weight: 600, anchor: 'end' }));
  // 두 지표가 세는 범위
  o.push(g.path(`M${X(0)} 134 v6 H${X(700)} v-6`, { stroke: 'accent', sw: 1.8 }));
  o.push(t13(X(0), 160, 'working set 700Mi', { weight: 700, tone: 'accent' }));
  o.push(t13(X(0) + g.textWidth('working set 700Mi', 13, 700) + 6, 160, '· kubectl top', { tone: 'sub' }));
  o.push(g.path(`M${X(0)} 176 v6 H${X(900)} v-6`, { stroke: 'warn', sw: 1.8 }));
  o.push(t13(X(0), 202, 'usage 900Mi', { weight: 700, tone: 'warn' }));
  o.push(t13(X(0) + g.textWidth('usage 900Mi', 13, 700) + 6, 202, '· 캐시까지 세요', { tone: 'sub' }));
  return [300, 210, o];
};

// 수집기가 모아야 할 두 곳: 노드마다 kubelet, 클러스터에 하나 kube-state-metrics
figs['ks-two-sources'] = () => {
  const o = [];
  o.push(box(90, 8, 120, 42, '수집기', 'Prometheus 등', { tone: 'accent' }));
  // 왼쪽: 노드마다 kubelet
  o.push(t13(8, 112, '노드마다 있어요', { tone: 'sub' }));
  const ys = [124, 164, 204];
  ys.forEach((y, i) => {
    o.push(rect(8, y, 112, 32, { rx: 8, fill: 'card', stroke: 'sub', sw: 1.4 }));
    o.push(t13(18, y + 21, 'kubelet', { weight: 700, tone: 'accent' }));
    o.push(t13(112, y + 21, `노드 ${i + 1}`, { tone: 'sub', anchor: 'end' }));
    o.push(line(120, y + 16, 138, y + 16, { tone: 'accent', sw: 1.8 }));
  });
  o.push(arrow([[138, ys[2] + 16], [138, 50]], { tone: 'accent', sw: 1.8, size: 7 }));
  o.push(t13(132, 82, '컨테이너 사용량', { tone: 'accent', weight: 700, anchor: 'end' }));
  // 오른쪽: kube-state-metrics 하나
  o.push(t13(176, 112, '클러스터에 하나', { tone: 'sub' }));
  o.push(rect(176, 124, 116, 52, { rx: 8, fill: 'card', stroke: 'sub', sw: 1.4 }));
  o.push(t13(186, 146, 'kube-state-', { weight: 700, tone: 'accent' }));
  o.push(t13(186, 164, 'metrics', { weight: 700, tone: 'accent' }));
  o.push(arrow([[278, 124], [278, 29], [210, 29]], { tone: 'accent', sw: 1.8, size: 7 }));
  o.push(t13(270, 82, '객체의 상태', { tone: 'accent', weight: 700, anchor: 'end' }));
  o.push(g.lock(20, 258, { tone: 'warn' }));
  o.push(t13(36, 264, '둘 다 읽을 역할(RBAC)을 줘야 해요', { tone: 'warn', weight: 600 }));
  return [300, 274, o];
};

// ── topology ──

// 토폴로지: 요청 길(셀렉터)과 소유 관계
figs['tp-graph'] = () => {
  const o = [];
  const L = 44;
  const M = 142;
  const R = 248;
  const P1 = 66;
  const P2 = 146;
  // 선 먼저
  o.push(arrow([[L, 46], [L, 90]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(arrow([[80, 99], [M - 32, P1 + 6]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(arrow([[80, 113], [M - 32, P2 - 6]], { tone: 'warn', sw: 2, size: 7, dash: '4 3' }));
  o.push(arrow([[R, 46], [R, 90]], { tone: 'weak', sw: 1.8, size: 7 }));
  o.push(arrow([[R - 44, 99], [M + 32, P1 + 6]], { tone: 'weak', sw: 1.8, size: 7 }));
  o.push(arrow([[R - 44, 113], [M + 32, P2 - 6]], { tone: 'weak', sw: 1.8, size: 7 }));
  o.push(box(L - 36, 14, 72, 32, '인그레스', null, { tone: 'plain' }));
  o.push(box(L - 36, 90, 72, 32, '서비스', null, { tone: 'soft' }));
  o.push(pod(M, P1, '파드 1', { w: 64, h: 30 }));
  o.push(pod(M, P2, '파드 2', { w: 64, h: 30, tone: 'warn' }));
  o.push(label(M, P2 + 34, '준비 안 됨', 'warn', 700));
  o.push(box(R - 44, 14, 88, 32, 'Deployment', null, { tone: 'plain' }));
  o.push(box(R - 44, 90, 88, 32, 'ReplicaSet', null, { tone: 'plain' }));
  o.push(line(8, 210, 30, 210, { tone: 'accent', sw: 2 }));
  o.push(t13(36, 215, '요청 길(셀렉터)', { tone: 'sub' }));
  o.push(line(168, 210, 190, 210, { tone: 'weak', sw: 1.8 }));
  o.push(t13(196, 215, '소유 관계', { tone: 'sub' }));
  return [300, 222, o];
};

// EndpointSlice 하나에 100개까지: 첫 슬라이스만 읽으면 선이 빠져요
figs['tp-slices'] = () => {
  const o = [];
  o.push(box(80, 6, 140, 34, '서비스 · 끝점 250개', null, { tone: 'soft' }));
  const S = [[52, '슬라이스 1', 9, true], [150, '슬라이스 2', 9, false], [248, '슬라이스 3', 5, false]];
  S.forEach(([cx, n, k, read]) => {
    o.push(line(150, 40, cx, 66, { tone: read ? 'accent' : 'sub', sw: read ? 2 : 1.5 }));
    o.push(box(cx - 44, 66, 88, 42, n, '100개까지', { tone: read ? 'accent' : 'plain' }));
    for (let i = 0; i < k; i++) {
      const x = cx - 22 + (i % 3) * 22;
      const y = 140 + Math.floor(i / 3) * 22;
      if (read) o.push(line(cx, 108, x, y - 7, { tone: 'accent', sw: 1.2 }));
      o.push(g.circle(x, y, 7, { fill: read ? 'accent' : 'card', stroke: read ? 'none' : 'weak', sw: 1.5 }));
    }
  });
  o.push(tag(52, 212, '읽음', { tone: 'accent' }));
  o.push(g.path('M108 200 v6 H290 v-6', { stroke: 'warn', sw: 1.6 }));
  o.push(label(199, 226, '여기 파드로 가는 선이 빠져요', 'warn', 700));
  return [300, 234, o];
};



// ── control-plane-slow ──

// 모두가 API 서버 한 곳으로: 웹훅에 묻고 etcd에 읽고 써요
figs['cps-hub'] = () => {
  const o = [];
  const callers = [
    [40, 'kubectl', '사람', (x, y) => g.laptop(x, y)],
    [113, '컨트롤러', '스케줄러 포함', (x, y) => g.gear(x, y)],
    [187, 'kubelet', '노드마다', (x, y) => g.server(x, y)],
    [260, '에이전트', '모니터링', (x, y) => g.panel(x, y, { w: 40, h: 30 })],
  ];
  callers.forEach(([cx, n, s, icon], i) => {
    o.push(arrow([[cx, 84], [126 + i * 16, 118]], { tone: 'sub', sw: 1.8, size: 7 }));
    o.push(icon(cx, 24));
    o.push(label(cx, 58, n, 'text', 700));
    o.push(label(cx, 75, s, 'sub', 400));
  });
  o.push(box(96, 118, 108, 42, 'API 서버', '모두 여기로', { tone: 'accent' }));
  // 웹훅: 받기 전에 물어봐요
  o.push(arrow([[122, 160], [74, 196]], { tone: 'sub', sw: 1.8, size: 7 }));
  o.push(t13(88, 172, '물어봐요', { tone: 'sub', anchor: 'end' }));
  o.push(box(14, 196, 104, 42, '웹훅', '받기 전 검사', { tone: 'plain' }));
  // etcd: 읽고 써요
  o.push(arrow([[178, 160], [222, 196]], { tone: 'accent', sw: 2, size: 7, start: true }));
  o.push(t13(212, 172, '읽고 써요', { tone: 'accent', weight: 600 }));
  o.push(g.db(236, 218, { tone: 'accent' }));
  o.push(t13(260, 214, 'etcd', { weight: 700 }));
  o.push(t13(260, 232, '모든', { tone: 'sub' }));
  o.push(t13(260, 248, '데이터', { tone: 'sub' }));
  o.push(t13(150, 274, '이 길 어디가 막혀도 모두가 느려져요', { weight: 700, tone: 'warn', anchor: 'middle' }));
  return [300, 284, o];
};

// ── hpa-not-scaling ──

// 사용률 = 사용량 ÷ 요청. 하나라도 없으면 unknown
figs['hpa-calc'] = () => {
  const o = [];
  const card = (x, title, val, src) => {
    o.push(rect(x, 6, 120, 62, { rx: 8, fill: 'card', stroke: 'sub', sw: 1.4 }));
    o.push(t13(x + 10, 26, title, { weight: 700 }));
    o.push(t13(x + 10, 44, val, { weight: 700, tone: 'accent' }));
    o.push(t13(x + 10, 61, src, { tone: 'sub' }));
  };
  card(8, '사용량', '0.45코어', 'Metrics Server');
  card(172, 'CPU 요청', '0.5코어', '파드 명세');
  o.push(g.circle(150, 37, 13, { fill: 'accent' }));
  o.push(label(150, 42, '÷', 'card', 700));
  o.push(arrow([[68, 68], [68, 84], [128, 84], [128, 100]], { tone: 'sub', sw: 1.8, size: 7 }));
  o.push(arrow([[232, 68], [232, 84], [172, 84], [172, 100]], { tone: 'sub', sw: 1.8, size: 7 }));
  o.push(box(84, 100, 132, 42, 'HPA', '사용률 90%', { tone: 'accent' }));
  o.push(arrow([[150, 142], [150, 162]], { tone: 'sub', sw: 1.8, size: 7 }));
  // TARGETS 칸
  const term = (y, s, tone) => {
    o.push(rect(30, y, 240, 32, { rx: 6, fill: 'bg', stroke: tone === 'warn' ? 'warn' : 'line', sw: 1.3 }));
    o.push(text(150, y + 21, s, { size: 13, weight: 700, tone, anchor: 'middle', mono: true }));
  };
  o.push(t13(30, 158, 'TARGETS', { tone: 'sub', weight: 600 }));
  term(164, 'cpu: 90%/60%', 'text');
  o.push(t13(30, 222, '사용량이나 요청 중 하나라도 없으면', { tone: 'warn', weight: 600 }));
  term(230, 'cpu: <unknown>/60%', 'warn');
  return [300, 270, o];
};

// 요청이 너무 크면: 같은 0.8코어를 써도 사용률이 낮아 늘리지 않아요
figs['hpa-big-request'] = () => {
  const o = [];
  const X = (c) => 8 + (c / 2) * 272;
  const bar = (y, req, tone) => {
    const pct = Math.round((0.8 / req) * 100);
    o.push(t13(8, y - 10, `요청 ${req}코어`, { weight: 700 }));
    o.push(rect(X(0), y, X(req) - X(0), 32, { rx: 5, fill: 'bg', stroke: 'sub', sw: 1.3 }));
    o.push(rect(X(0), y, X(0.8) - X(0), 32, { rx: 5, fill: tone, stroke: 'none' }));
    if (req > 1) o.push(label((X(0) + X(0.8)) / 2, y + 21, `0.8코어 = ${pct}%`, 'card', 700));
    else o.push(t13(X(req) + 8, y + 21, `0.8코어 = ${pct}%`, { weight: 700, tone }));
    const tx = X(req * 0.6);
    o.push(line(tx, y - 6, tx, y + 38, { tone: 'warn', sw: 2.4, cap: 'butt' }));
    o.push(t13(tx + 5, y - 10, '목표 60%', { tone: 'warn', weight: 700 }));
    return pct;
  };
  bar(34, 2, 'sub');
  o.push(t13(8, 92, '목표에 못 닿아, 앱이 느려도 늘리지 않아요', { tone: 'warn', weight: 700 }));
  o.push(line(8, 112, 292, 112, { tone: 'line', sw: 1, dash: '3 3' }));
  bar(146, 1, 'accent');
  o.push(t13(8, 204, '같은 사용량, 요청 1코어면 목표를 넘어 늘려요', { tone: 'accent', weight: 700 }));
  return [300, 214, o];
};

// ── job-failed ──

// CronJob이 Job을, Job이 파드를 만들어요. 어디를 볼지 갈라요
figs['jf-chain'] = () => {
  const o = [];
  o.push(rect(8, 44, 78, 60, { rx: 8, fill: 'card', stroke: 'sub', sw: 1.4 }));
  o.push(g.clock(47, 64, { r: 10, h: 2, m: 0 }));
  o.push(label(47, 94, 'CronJob', 'text', 700));
  o.push(arrow([[86, 74], [112, 74]], { tone: 'sub', sw: 2, size: 7 }));
  o.push(box(112, 52, 64, 44, 'Job', '재시도', { tone: 'soft' }));
  const P = [[240, 30, '파드 1', 'warn'], [240, 74, '파드 2', 'warn'], [240, 118, '파드 3', 'soft']];
  P.forEach(([cx, cy, n, tone]) => {
    o.push(arrow([[176, 74], [cx - 38, cy]], { tone: tone === 'warn' ? 'sub' : 'accent', sw: 1.8, size: 7 }));
    o.push(pod(cx, cy, n, { w: 70, h: 30, tone }));
    if (tone === 'warn') o.push(xmark(cx + 46, cy, { r: 5 }));
  });
  o.push(t13(240, 156, '실패하면 새 파드로', { tone: 'sub', anchor: 'middle' }));
  // 어디를 볼지
  o.push(g.path('M8 176 v6 H86 v-6', { stroke: 'warn', sw: 1.6 }));
  o.push(t13(8, 202, 'Job이 없으면', { tone: 'warn', weight: 700 }));
  o.push(t13(8, 220, '여기', { tone: 'warn', weight: 700 }));
  o.push(g.path('M112 176 v6 H292 v-6', { stroke: 'accent', sw: 1.6 }));
  o.push(t13(112, 202, 'Job이 실패했으면', { tone: 'accent', weight: 700 }));
  o.push(t13(112, 220, '여기: 실패 이유와 파드 로그', { tone: 'accent', weight: 700 }));
  return [300, 228, o];
};

// 재시도 앞에 기다리는 시간: 두 배씩 늘어 모두 630초
figs['jf-backoff'] = () => {
  const o = [];
  const W = (s) => (s / 320) * 192;
  o.push(t13(8, 16, '재시도 앞에 기다리는 시간', { weight: 700 }));
  [10, 20, 40, 80, 160, 320].forEach((s, i) => {
    const y = 30 + i * 28;
    const warn = s >= 160;
    o.push(t13(8, y + 15, `${i + 1}번`, { tone: 'sub', weight: 600 }));
    o.push(rect(44, y, Math.max(W(s), 3), 20, { rx: 4, fill: warn ? 'warn' : 'accent', stroke: 'none' }));
    o.push(t13(44 + Math.max(W(s), 3) + 6, y + 15, `${s}초`, { weight: 700, tone: warn ? 'warn' : 'text' }));
  });
  o.push(line(8, 206, 292, 206, { tone: 'line', sw: 1 }));
  o.push(t13(8, 230, '모두 630초', { weight: 700, tone: 'warn' }));
  o.push(t13(8 + g.textWidth('모두 630초', 13, 700) + 6, 230, '· 기다리기만 10분이 넘어요', { tone: 'sub' }));
  return [300, 240, o];
};

// ── node-not-ready ──

// 압박 조건이 켜지면: taint로 새 파드를 막고, kubelet이 있던 파드를 내보내요
figs['nnr-pressure'] = () => {
  const o = [];
  o.push(tag(160, 16, 'DiskPressure: True', { tone: 'warnSoft' }));
  o.push(line(160, 27, 160, 36, { tone: 'warn', sw: 1.5 }));
  o.push(zone(92, 36, 136, 132, '노드', { fill: 'card', tone: 'sub', dash: null, labelTone: 'text' }));
  o.push(pod(132, 84, '파드', { w: 48 }));
  o.push(pod(132, 126, '파드', { w: 48 }));
  // taint: 문 앞에서 막힘
  o.push(line(92, 64, 92, 160, { tone: 'warn', sw: 4, cap: 'butt' }));
  o.push(pod(42, 108, '새 파드', { w: 62, tone: 'ghost' }));
  o.push(arrow([[74, 108], [86, 108]], { tone: 'warn', sw: 2, size: 7, end: false }));
  o.push(xmark(80, 94, { r: 5 }));
  o.push(t13(42, 82, 'taint로', { tone: 'warn', weight: 700, anchor: 'middle' }));
  o.push(t13(42, 142, '못 들어와요', { tone: 'warn', weight: 700, anchor: 'middle' }));
  // 축출: kubelet이 내보냄
  o.push(pod(192, 106, '', { w: 30, h: 26, tone: 'ghost' }));
  o.push(arrow([[210, 106], [252, 106]], { tone: 'warn', sw: 2, size: 7 }));
  o.push(pod(270, 106, '파드', { w: 44, tone: 'warn' }));
  o.push(t13(266, 80, 'kubelet이', { tone: 'warn', weight: 700, anchor: 'middle' }));
  o.push(t13(266, 140, '내보내요', { tone: 'warn', weight: 700, anchor: 'middle' }));
  o.push(t13(150, 194, 'Ready는 True 그대로일 수 있어요', { tone: 'sub', anchor: 'middle' }));
  return [300, 204, o];
};

// ── pod-evicted ──

// OOMKilled와 Evicted: 누가, 무엇을 끝내나
figs['pe-oom-vs-evict'] = () => {
  const o = [];
  const panel = (px, title, who) => {
    o.push(rect(px, 4, 144, 250, { rx: 12, fill: 'card', stroke: 'none' }));
    o.push(text(px + 12, 26, title, { size: 14, weight: 700 }));
    o.push(t13(px + 12, 46, who, { tone: 'sub' }));
  };
  panel(4, 'OOMKilled', '리눅스 커널이');
  panel(152, 'Evicted', 'kubelet이');
  // 왼쪽: 파드 안 컨테이너만 죽고 다시 시작
  o.push(rect(16, 60, 120, 96, { rx: 10, fill: 'accentWeak', stroke: 'accent', sw: 1.4 }));
  o.push(t13(26, 80, '파드', { weight: 700, tone: 'accent' }));
  o.push(rect(30, 90, 92, 54, { rx: 6, fill: 'card', stroke: 'warn', sw: 1.5 }));
  o.push(t13(40, 108, '컨테이너', { weight: 600 }));
  o.push(rect(40, 118, 60, 14, { rx: 3, fill: 'bg', stroke: 'line', sw: 1 }));
  o.push(rect(40, 118, 60, 14, { rx: 3, fill: 'warn', stroke: 'none' }));
  o.push(line(100, 113, 100, 137, { tone: 'warn', sw: 2.4, cap: 'butt' }));
  o.push(xmark(112, 104, { r: 5 }));
  o.push(t13(16, 178, '컨테이너가', { tone: 'warn', weight: 600 }));
  o.push(t13(16, 196, '메모리 한도를 넘어서', { tone: 'warn', weight: 600 }));
  o.push(t13(16, 226, '같은 파드에서', { weight: 700, tone: 'accent' }));
  o.push(t13(16, 244, '다시 시작해요', { weight: 700, tone: 'accent' }));
  // 오른쪽: 노드가 파드째 내보내고, 새 파드가 떠요
  o.push(rect(162, 60, 86, 96, { rx: 10, fill: 'none', stroke: 'sub', sw: 1.4 }));
  o.push(t13(172, 80, '노드', { weight: 700 }));
  o.push(tag(222, 76, '압박', { tone: 'warnSoft' }));
  o.push(pod(196, 128, '파드', { w: 44, h: 26, tone: 'ghost' }));
  o.push(arrow([[219, 128], [262, 128]], { tone: 'warn', sw: 2, size: 7 }));
  o.push(pod(277, 128, '', { w: 26, h: 26, tone: 'warn' }));
  o.push(t13(164, 178, '노드 압박이나', { tone: 'warn', weight: 600 }));
  o.push(t13(164, 196, '임시 저장 한도 초과', { tone: 'warn', weight: 600 }));
  o.push(t13(164, 226, '파드째 끝나고', { weight: 700, tone: 'accent' }));
  o.push(t13(164, 244, '새 파드가 떠요', { weight: 700, tone: 'accent' }));
  return [300, 258, o];
};

// 메모리가 모자랄 때 쫓겨나는 차례: 요청보다 더 쓰는 파드가 먼저
figs['pe-order'] = () => {
  const o = [];
  const cols = [
    [42, 'BestEffort', '요청 없음', null, 0.35, 'warn'],
    [114, '요청 초과', '', 0.35, 0.7, 'warn'],
    [186, '요청 안', '', 0.75, 0.45, 'accent'],
    [258, '요청 안', '', 0.75, 0.6, 'accent'],
  ];
  const top = 24;
  const H = 96;
  cols.forEach(([cx, n, s, req, use, tone]) => {
    o.push(rect(cx - 26, top, 52, H, { rx: 8, fill: 'card', stroke: 'sub', sw: 1.3 }));
    o.push(rect(cx - 18, top + H - 8 - (H - 16) * use, 36, (H - 16) * use, { rx: 3, fill: tone, stroke: 'none', op: tone === 'warn' ? 1 : 0.85 }));
    if (req != null) {
      const ry = top + H - 8 - (H - 16) * req;
      o.push(line(cx - 26, ry, cx + 26, ry, { tone: 'text', sw: 1.8, dash: '4 3', cap: 'butt' }));
    }
    o.push(label(cx, top + H + 20, n, tone === 'warn' ? 'warn' : 'text', 700));
    if (s) o.push(label(cx, top + H + 37, s, 'sub', 400));
  });
  o.push(rect(16, 4, 12, 12, { rx: 2, fill: 'sub', stroke: 'none' }));
  o.push(t13(34, 15, '메모리 사용', { tone: 'sub' }));
  o.push(line(126, 10, 148, 10, { tone: 'text', sw: 1.8, dash: '4 3', cap: 'butt' }));
  o.push(t13(154, 15, '요청', { tone: 'sub' }));
  o.push(g.path('M16 168 v6 H140 v-6', { stroke: 'warn', sw: 1.6 }));
  o.push(t13(16, 192, '먼저 쫓겨나요', { tone: 'warn', weight: 700 }));
  o.push(t13(16, 210, '요청보다 더 씀', { tone: 'sub' }));
  o.push(g.path('M160 168 v6 H284 v-6', { stroke: 'accent', sw: 1.6 }));
  o.push(t13(160, 192, '마지막이에요', { tone: 'accent', weight: 700 }));
  o.push(t13(160, 210, '요청 안에서 씀', { tone: 'sub' }));
  o.push(t13(8, 240, '같은 무리에서는 우선순위가 낮은 파드부터', { tone: 'sub' }));
  return [300, 250, o];
};

// 파드가 노드 디스크를 쓰는 세 곳: 모두 ephemeral-storage
figs['pe-ephemeral'] = () => {
  const o = [];
  o.push(rect(4, 4, 292, 112, { rx: 12, fill: 'accentWeak', stroke: 'accent', sw: 1.4, dash: '5 4' }));
  o.push(t13(14, 24, 'ephemeral-storage', { weight: 700, tone: 'accent' }));
  o.push(t13(286, 24, '요청·한도', { tone: 'accent', anchor: 'end' }));
  const items = [
    [54, '쓰기 레이어', '컨테이너 안', (x, y) => [rect(x - 16, y - 12, 32, 9, { rx: 2, fill: 'warnWeak', stroke: 'warn', sw: 1.3 }), rect(x - 16, y - 1, 32, 9, { rx: 2, fill: 'card', stroke: 'sub', sw: 1.3 }), rect(x - 16, y + 10, 32, 9, { rx: 2, fill: 'card', stroke: 'sub', sw: 1.3 })].join('\n')],
    [150, 'emptyDir', '볼륨', (x, y) => g.folder(x, y)],
    [246, '로그', '컨테이너 로그', (x, y) => g.doc(x, y, { lines: 3 })],
  ];
  items.forEach(([cx, n, s, icon]) => {
    o.push(icon(cx, 54));
    o.push(label(cx, 90, n, 'text', 700));
    o.push(label(cx, 107, s, 'sub', 400));
    o.push(arrow([[cx, 116], [150 + (cx - 150) * 0.4, 150]], { tone: 'warn', sw: 1.8, size: 7 }));
  });
  o.push(rect(70, 150, 160, 44, { rx: 8, fill: 'warnWeak', stroke: 'warn', sw: 1.5 }));
  o.push(g.hdd(100, 172, { tone: 'warn' }));
  o.push(t13(132, 168, '노드 디스크', { weight: 700, tone: 'warn' }));
  o.push(t13(132, 186, '모두 여기에', { tone: 'sub' }));
  return [300, 200, o];
};


// ── pod-pending ──

// 요청 합계 3.5코어라 0.5코어만 남아, 1코어 새 파드는 못 들어가요
figs['pp-fit'] = () => {
  const o = [];
  nodeFit(o, 74, 4, [['A 1.5', 1.5, 0.5], ['B 1', 1, 0.4], ['C 1', 1, 0.3]], 1.2, 1, 0.5, null, { remText: '0.5' });
  o.push(rect(18, 172, 14, 14, { rx: 3, fill: 'accentWeak', stroke: 'none' }));
  o.push(t13(38, 184, '요청 합계 3.5코어', { tone: 'sub' }));
  o.push(rect(160, 176, 14, 8, { rx: 2, fill: 'accent', stroke: 'none' }));
  o.push(t13(180, 184, '실제 사용 1.2코어', { tone: 'sub' }));
  o.push(t13(150, 212, '실제로는 30%만 써도 자리가 없어요', { weight: 700, tone: 'warn', anchor: 'middle' }));
  return [300, 220, o];
};

// ── pod-restarting ──

// 그냥 logs는 지금 실행, --previous는 직전 실행
figs['pr-previous'] = () => {
  const o = [];
  const S = [
    [8, 84, '그 전', 'ghost'],
    [88, 190, '직전 실행', 'warn'],
    [194, 292, '지금 실행', 'soft'],
  ];
  o.push(t13(8, 16, '한 컨테이너의 실행', { weight: 700 }));
  S.forEach(([a, b, n, tone]) => {
    const st = { ghost: ['none', 'weak', 'weak'], warn: ['warnWeak', 'warn', 'warn'], soft: ['accentWeak', 'accent', 'accent'] }[tone];
    o.push(rect(a, 30, b - a, 30, { rx: 6, fill: st[0], stroke: st[1], sw: 1.4, dash: tone === 'ghost' ? '4 3' : undefined }));
    o.push(label((a + b) / 2, 50, n, st[2], 700));
  });
  [86, 192].forEach((x) => o.push(xmark(x, 72, { r: 5 })));
  o.push(xmark(186, 12, { r: 5 }));
  o.push(t13(198, 17, '죽고 다시 시작', { tone: 'warn' }));
  // 실행마다 남는 로그
  o.push(g.doc(46, 122, { tone: 'weak' }));
  o.push(g.doc(139, 122, { tone: 'warn' }));
  o.push(g.doc(243, 122, { tone: 'accent' }));
  o.push(arrow([[139, 186], [139, 144]], { tone: 'warn', sw: 2, size: 7 }));
  o.push(arrow([[243, 186], [243, 144]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(t13(46, 164, 'kubectl로', { tone: 'sub', anchor: 'middle' }));
  o.push(t13(46, 182, '볼 수 없어요', { tone: 'sub', anchor: 'middle' }));
  o.push(text(139, 204, 'kubectl logs', { size: 13, weight: 700, tone: 'warn', anchor: 'middle', mono: true }));
  o.push(text(139, 222, '--previous', { size: 13, weight: 700, tone: 'warn', anchor: 'middle', mono: true }));
  o.push(text(243, 204, 'kubectl logs', { size: 13, weight: 700, tone: 'accent', anchor: 'middle', mono: true }));
  o.push(t13(243, 222, '옵션 없이', { tone: 'sub', anchor: 'middle' }));
  o.push(t13(150, 254, '원인은 대개 직전 실행 로그의 끝에 남아요', { weight: 700, anchor: 'middle' }));
  return [300, 264, o];
};

// liveness가 DB까지 보면: DB가 잠깐 느려도 멀쩡한 앱이 다시 시작돼요
figs['pr-liveness'] = () => {
  const o = [];
  const lanes = [{ x: 40, label: 'kubelet' }, { x: 150, label: '앱' }, { x: 260, label: 'DB' }];
  o.push(ladder(lanes, [
    { from: 0, to: 1, y: 52, label: 'liveness 검사' },
    { from: 1, to: 2, y: 88, label: 'DB도 확인' },
    { from: 2, to: 1, y: 124, label: '잠깐 느림', dashed: true, tone: 'warn' },
    { from: 1, to: 0, y: 160, label: '실패', dashed: true, tone: 'warn' },
    { from: 0, to: 1, y: 196, label: '다시 시작', tone: 'warn' },
  ], { top: 18, bottom: 214 }));
  o.push(tag(150, 236, '앱은 멀쩡했어요', { tone: 'soft' }));
  return [300, 250, o];
};

// ── reading-events ──

// 이유가 똑같이 BackOff여도 메시지로 갈라요
figs['re-backoff'] = () => {
  const o = [];
  const card = (y, word, meaning, next) => {
    o.push(rect(4, y, 292, 104, { rx: 10, fill: 'card', stroke: 'line', sw: 1.4 }));
    o.push(tag(14, y + 20, 'Warning', { tone: 'warnSoft', anchor: 'start' }));
    const tw = tag.width('Warning');
    o.push(t13(14 + tw + 8, y + 25, 'BackOff', { weight: 700 }));
    o.push(spans(14, y + 50, [['Back-off ', 'sub'], [word, 'accent', 700]]));
    o.push(t13(14, y + 70, meaning, { tone: 'sub' }));
    o.push(t13(14, y + 93, '→', { weight: 700, tone: 'accent' }));
    o.push(t13(32, y + 93, next, { weight: 700 }));
  };
  card(4, 'restarting failed container', '컨테이너가 죽어 다시 띄우기를 미뤄요', '파드가 계속 재시작될 때');
  card(118, 'pulling image', '이미지를 못 받아 다시 받기를 미뤄요', '이미지 이름·태그와 인증 정보');
  return [300, 226, o];
};

// ── rollout-stuck ──

// 25%의 3개는 0.75개: maxSurge는 올림해 1개 더, maxUnavailable은 내림해 0개
figs['rs-surge'] = () => {
  const o = [];
  o.push(t13(150, 18, '원하는 3개 × 25% = 0.75개', { weight: 700, anchor: 'middle' }));
  o.push(line(150, 26, 150, 34, { tone: 'sub', sw: 1.5 }));
  o.push(line(77, 34, 223, 34, { tone: 'sub', sw: 1.5 }));
  o.push(arrow([[77, 34], [77, 46]], { tone: 'sub', sw: 1.5, size: 6 }));
  o.push(arrow([[223, 34], [223, 46]], { tone: 'sub', sw: 1.5, size: 6 }));
  o.push(rect(8, 46, 138, 48, { rx: 8, fill: 'card', stroke: 'sub', sw: 1.3 }));
  o.push(t13(77, 66, 'maxUnavailable', { weight: 700, anchor: 'middle' }));
  o.push(t13(77, 85, '내림 → 0개 줄여요', { tone: 'sub', anchor: 'middle' }));
  o.push(rect(154, 46, 138, 48, { rx: 8, fill: 'accentWeak', stroke: 'accent', sw: 1.3 }));
  o.push(t13(223, 66, 'maxSurge', { weight: 700, tone: 'accent', anchor: 'middle' }));
  o.push(t13(223, 85, '올림 → 1개 더 띄워요', { tone: 'accent', anchor: 'middle' }));
  o.push(arrow([[77, 94], [77, 120]], { tone: 'sub', sw: 1.8, size: 7 }));
  o.push(arrow([[223, 94], [236, 120]], { tone: 'accent', sw: 1.8, size: 7 }));
  [30, 84, 138].forEach((cx) => o.push(pod(cx, 138, '옛', { w: 46, h: 30, tone: 'old' })));
  o.push(pod(236, 138, '새', { w: 60, h: 30, tone: 'warn' }));
  o.push(g.path('M8 166 v6 H160 v-6', { stroke: 'sub', sw: 1.6 }));
  o.push(t13(8, 192, '옛 3개 그대로', { weight: 700 }));
  o.push(t13(8, 210, '요청을 받아요', { tone: 'sub' }));
  o.push(g.path('M200 166 v6 H272 v-6', { stroke: 'warn', sw: 1.6 }));
  o.push(t13(200, 192, '새 1개 더', { weight: 700, tone: 'warn' }));
  o.push(t13(200, 210, '준비 안 됨', { tone: 'warn' }));
  return [300, 218, o];
};

// ── service-no-traffic ──

// 셀렉터 app=pay, 레이블 app=payment: 글자가 조금만 달라도 0개
figs['snt-selector'] = () => {
  const o = [];
  const mono = (x, y, s, tone) => text(x, y, s, { size: 13, weight: 700, tone, mono: true });
  o.push(rect(8, 46, 104, 66, { rx: 8, fill: 'accentWeak', stroke: 'accent', sw: 1.4 }));
  o.push(t13(18, 68, '서비스', { weight: 700, tone: 'accent' }));
  o.push(t13(18, 86, '셀렉터', { tone: 'sub' }));
  o.push(mono(18, 104, 'app=pay', 'accent'));
  [[14, '파드 1'], [92, '파드 2']].forEach(([y, n]) => {
    o.push(rect(176, y, 116, 56, { rx: 8, fill: 'card', stroke: 'sub', sw: 1.4 }));
    o.push(t13(186, y + 22, n, { weight: 700 }));
    o.push(spans(186, y + 44, [['app=pay', 'text', 700], ['ment', 'warn', 700]], { mono: true }));
    o.push(line(112, 79, 176, y + 28, { tone: 'weak', sw: 1.6, dash: '4 3' }));
    o.push(xmark(144, (79 + y + 28) / 2, { r: 5 }));
  });
  o.push(t13(150, 176, '고른 파드 0개 · 요청을 넘길 곳이 없어요', { weight: 700, tone: 'warn', anchor: 'middle' }));
  o.push(t13(150, 196, '셀렉터와 레이블을 글자 그대로 견줘요', { tone: 'sub', anchor: 'middle' }));
  return [300, 206, o];
};

// port 80 → targetPort 8080, 앱은 8000에서 들어요
figs['snt-ports'] = () => {
  const o = [];
  o.push(pod(40, 34, '주문 파드', { w: 72, h: 30, tone: 'old' }));
  o.push(arrow([[76, 34], [128, 34]], { tone: 'sub', sw: 2, size: 7 }));
  o.push(t13(102, 24, 'port 80', { tone: 'sub', weight: 600, anchor: 'middle' }));
  o.push(box(130, 14, 100, 40, '서비스 pay', null, { tone: 'plain' }));
  // 결제 파드와 두 포트
  o.push(rect(104, 112, 188, 92, { rx: 12, fill: 'accentWeak', stroke: 'accent', sw: 1.4 }));
  o.push(t13(116, 196, '결제 파드', { weight: 700, tone: 'accent' }));
  o.push(arrow([[180, 54], [180, 104]], { tone: 'warn', sw: 2, size: 7 }));
  o.push(t13(188, 84, 'targetPort 8080', { tone: 'warn', weight: 600 }));
  o.push(rect(166, 104, 28, 16, { rx: 3, fill: 'card', stroke: 'warn', sw: 1.5 }));
  o.push(label(180, 140, '8080', 'warn', 700));
  o.push(xmark(180, 160, { r: 6 }));
  o.push(rect(236, 104, 28, 16, { rx: 3, fill: 'accent', stroke: 'none' }));
  o.push(label(250, 140, '8000', 'accent', 700));
  o.push(line(250, 146, 250, 156, { tone: 'accent', sw: 2 }));
  o.push(box(222, 156, 56, 30, '앱', null, { tone: 'accent' }));
  o.push(t13(8, 104, '받을 곳이', { tone: 'warn', weight: 700 }));
  o.push(t13(8, 122, '없어요', { tone: 'warn', weight: 700 }));
  o.push(arrow([[70, 116], [158, 158]], { tone: 'warn', sw: 1.4, size: 6, dash: '3 3' }));
  return [300, 212, o];
};

// 파드 IP로 직접은 되는데 서비스 IP로는 안 되면: 서비스 규칙(kube-proxy)
figs['snt-direct'] = () => {
  const o = [];
  o.push(pod(42, 44, '주문 파드', { w: 72, h: 30, tone: 'old' }));
  o.push(pod(258, 44, '결제 파드', { w: 72, h: 30 }));
  o.push(arrow([[78, 44], [222, 44]], { tone: 'accent', sw: 2.2, size: 8 }));
  o.push(g.check(118, 24, { tone: 'accent' }));
  o.push(t13(130, 29, '파드 IP로 직접', { tone: 'accent', weight: 700 }));
  o.push(arrow([[42, 59], [42, 132], [98, 132]], { tone: 'sub', sw: 2, size: 7 }));
  o.push(rect(98, 106, 104, 54, { rx: 8, fill: 'warnWeak', stroke: 'warn', sw: 1.5 }));
  o.push(t13(150, 128, '서비스 IP', { weight: 700, tone: 'warn', anchor: 'middle' }));
  o.push(t13(150, 148, 'kube-proxy 규칙', { tone: 'warn', anchor: 'middle' }));
  o.push(arrow([[202, 132], [258, 132], [258, 59]], { tone: 'warn', sw: 2, size: 7, dash: '5 4' }));
  o.push(xmark(230, 132, { r: 6 }));
  o.push(t13(150, 192, '직접은 되고 서비스로는 안 되면', { tone: 'sub', anchor: 'middle' }));
  o.push(t13(150, 212, '그 사이의 서비스 규칙을 봐요', { weight: 700, tone: 'warn', anchor: 'middle' }));
  return [300, 222, o];
};

// ── volume-not-attaching ──

// 볼륨이 파드에 붙는 세 단계와, 멈췄을 때 남는 흔적
figs['vna-steps'] = () => {
  const o = [];
  const rows = [
    ['묶기', 'PVC ↔ PV', 'PVC가 Pending', (y) => [g.doc(196, y, { tone: 'accent' }), label(196, y + 30, 'PVC', 'text', 700), line(212, y, 250, y, { tone: 'accent', sw: 2 }), g.doc(266, y, { tone: 'accent' }), label(266, y + 30, 'PV', 'text', 700)]],
    ['붙이기', '디스크 ↔ 노드', 'FailedAttachVolume', (y) => [g.hdd(196, y, { tone: 'accent' }), label(196, y + 30, '디스크', 'text', 700), line(220, y, 252, y, { tone: 'accent', sw: 2 }), g.server(268, y, { tone: 'accent' }), label(268, y + 30, '노드', 'text', 700)]],
    ['연결', '노드 ↔ 파드', 'FailedMount', (y) => [g.server(196, y, { tone: 'accent' }), label(196, y + 30, '노드', 'text', 700), line(212, y, 244, y, { tone: 'accent', sw: 2 }), pod(268, y, '파드', { w: 44 }), label(268, y + 30, '안에 연결', 'sub', 400)]],
  ];
  rows.forEach(([n, s, fail, icons], i) => {
    const y = 4 + i * 98;
    o.push(rect(4, y, 292, 88, { rx: 10, fill: 'card', stroke: 'line', sw: 1.3 }));
    o.push(g.badge(24, y + 22, i + 1));
    o.push(t13(40, y + 27, n, { weight: 700 }));
    o.push(t13(40, y + 45, s, { tone: 'sub' }));
    o.push(...icons(y + 26));
    o.push(tag(16, y + 74, `멈추면 ${fail}`, { tone: 'warnSoft', anchor: 'start' }));
    if (i < 2) o.push(arrow([[24, y + 88], [24, y + 98]], { tone: 'sub', sw: 1.8, size: 6 }));
  });
  return [300, 292, o];
};


const only = process.argv.slice(2);
for (const [name, fn] of Object.entries(figs)) {
  if (only.length && !only.some((p) => name.startsWith(p))) continue;
  const [w, h, body] = fn();
  g.save(D, name, w, h, body);
}
console.log('done');
