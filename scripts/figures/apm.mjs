// 애플리케이션(APM) 글의 SVG 그림. 실행: node scripts/figures/apm.mjs [이름 접두어...]
import * as g from './lib.mjs';

const { text, tag, line, arrow, zone, rect, ladder, xmark } = g;
const D = 'apm';
const figs = {};
const label = (x, y, s, tone = 'sub', weight = 600) => text(x, y, s, { size: 13, weight, tone, anchor: 'middle' });
const t13 = (x, y, s, o = {}) => text(x, y, s, { size: 13, ...o });
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';
const mono = (x, y, s, o = {}) => text(x, y, s, { size: 13, mono: true, ...o });
// 한 줄 안에서 색·굵기가 다른 글자(tspan으로 이어 붙여 폭 어림에 기대지 않아요)
const spans = (x, y, parts, o = {}) => {
  const ff = o.mono ? ` font-family="${MONO}"` : '';
  const anchor = o.anchor ? ` text-anchor="${o.anchor}"` : '';
  const body = parts.map(([str, tone = 'text', w]) => `<tspan${w ? ` font-weight="${w}"` : ''} style="fill:${g.color(tone)}">${String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</tspan>`).join('');
  return `<text x="${x}" y="${y}" font-size="13"${ff}${anchor}>${body}</text>`;
};
// 이름 상자(제목 + 작은 글). tone: accent|soft|plain|warn|bg
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
// 괄호(아래로 열린 ㄷ자). (x1..x2)를 y에 그어요
const brace = (x1, x2, y, tone = 'sub', up = false) => g.path(up ? `M${x1} ${y} v-6 H${x2} v6` : `M${x1} ${y} v6 H${x2} v-6`, { stroke: tone, sw: 1.6 });

// ── overview ──

// 요청이 지나는 길: 브라우저 → 로드 밸런서 → 웹 서버 → WAS → DB·외부 API
figs['ov-path'] = () => {
  const o = [];
  o.push(arrow([[52, 36], [86, 36]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(arrow([[138, 36], [178, 36]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(arrow([[206, 56], [206, 98]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(g.laptop(30, 36));
  o.push(label(30, 72, '브라우저', 'text', 700));
  o.push(g.lb(112, 36));
  o.push(label(112, 72, '로드 밸런서', 'text', 700));
  o.push(g.server(206, 36));
  o.push(label(246, 41, '웹 서버', 'text', 700));
  o.push(box(156, 100, 100, 44, 'WAS', '앱 코드 실행', { tone: 'accent' }));
  o.push(arrow([[180, 144], [146, 186]], { tone: 'sub', sw: 1.8, size: 7 }));
  o.push(arrow([[232, 144], [254, 180]], { tone: 'sub', sw: 1.8, size: 7 }));
  o.push(g.db(130, 206));
  o.push(label(130, 244, 'DB', 'text', 700));
  o.push(g.cloud(258, 202));
  o.push(label(258, 244, '외부 API', 'text', 700));
  // 응답은 같은 길로 돌아가요
  o.push(arrow([[154, 112], [30, 112], [30, 84]], { tone: 'accent', sw: 1.6, size: 6, dash: '5 4' }));
  o.push(t13(40, 132, '응답은 같은 길로', { tone: 'accent', weight: 600 }));
  o.push(t13(40, 150, '돌아가요', { tone: 'accent', weight: 600 }));
  return [300, 254, o];
};

// ── http-basics ──

// 요청과 응답의 생김새: 첫 줄만 다르고 헤더·빈 줄·본문 순서는 같아요
figs['http-msg'] = () => {
  const o = [];
  const card = (y, title, rows) => {
    const h = 30 + rows.length * 24 + 6;
    o.push(rect(4, y, 292, h, { rx: 10, fill: 'card', stroke: 'line', sw: 1.4 }));
    o.push(t13(14, y + 20, title, { weight: 700 }));
    rows.forEach(([s, part, kind], i) => {
      const ry = y + 30 + i * 24;
      if (kind === 'first') o.push(rect(8, ry, 284, 22, { rx: 4, fill: 'accentWeak', stroke: 'none' }));
      if (kind === 'blank') o.push(t13(14, ry + 16, '(빈 줄)', { tone: 'weak' }));
      else if (kind === 'none') o.push(t13(14, ry + 16, '이 예에는 없어요', { tone: 'weak' }));
      else o.push(mono(14, ry + 16, s, { weight: kind === 'first' ? 700 : 400, tone: kind === 'first' ? 'accent' : 'text' }));
      o.push(t13(286, ry + 16, part, { tone: kind === 'first' ? 'accent' : 'sub', anchor: 'end', weight: kind === 'first' ? 700 : 400 }));
    });
    return h;
  };
  const h1 = card(4, '요청', [
    ['GET /orders/42 HTTP/1.1', '첫 줄', 'first'],
    ['Host: shop.example.com', '헤더'],
    ['Accept: application/json', '헤더'],
    ['', '', 'blank'],
    ['', '본문', 'none'],
  ]);
  card(4 + h1 + 10, '응답', [
    ['HTTP/1.1 200 OK', '첫 줄', 'first'],
    ['Content-Type: application/json', '헤더'],
    ['', '', 'blank'],
    ['{"id": 42, "status": "paid"}', '본문'],
  ]);
  return [300, 4 + h1 + 10 + 30 + 4 * 24 + 6 + 4, o];
};

// HTTP/1.1은 연결 셋, HTTP/2는 연결 하나에 섞어서
figs['http-versions'] = () => {
  const o = [];
  const ends = (y0, h) => {
    o.push(g.laptop(24, y0 + h / 2));
    o.push(g.server(278, y0 + h / 2));
  };
  const frame = (x, y, n, w = 22) => {
    o.push(rect(x, y - 8, w, 16, { rx: 3, fill: ['accent', 'sub', 'text'][n - 1], stroke: 'none' }));
    o.push(text(x + w / 2, y + 4.6, String(n), { size: 13, weight: 700, tone: 'card', anchor: 'middle' }));
  };
  // HTTP/1.1
  o.push(t13(8, 18, 'HTTP/1.1', { weight: 700 }));
  o.push(t13(292, 18, '연결 셋', { weight: 700, anchor: 'end' }));
  ends(30, 84);
  [44, 72, 100].forEach((y, i) => {
    o.push(rect(50, y - 11, 204, 22, { rx: 11, fill: 'bg', stroke: 'line', sw: 1.3 }));
    frame(140, y, i + 1);
  });
  o.push(t13(8, 138, '연결 하나에 응답이 순서대로 하나씩', { tone: 'sub' }));
  o.push(line(8, 152, 292, 152, { tone: 'line', sw: 1, dash: '3 3' }));
  // HTTP/2
  o.push(t13(8, 176, 'HTTP/2', { weight: 700 }));
  o.push(t13(292, 176, '연결 하나', { weight: 700, anchor: 'end' }));
  ends(188, 40);
  o.push(rect(50, 196, 204, 24, { rx: 12, fill: 'bg', stroke: 'line', sw: 1.3 }));
  [1, 2, 3, 1, 2, 3, 2, 1].forEach((n, i) => frame(62 + i * 23.5, 208, n, 18));
  o.push(t13(8, 252, '잘게 나눠 섞어 보내요', { tone: 'sub' }));
  o.push(t13(8, 272, '연결 맺는 왕복: 1.1은 연결마다, 2는 처음 한 번', { tone: 'sub' }));
  return [300, 280, o];
};

// ── web-server-and-was ──

// 웹 서버는 정적 파일을 바로 주고, 나머지는 WAS의 스레드 하나가 맡아요
figs['was-flow'] = () => {
  const o = [];
  o.push(t13(8, 42, '요청', { weight: 700 }));
  o.push(arrow([[42, 37], [78, 37]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(box(80, 16, 92, 42, '웹 서버', null, { tone: 'accent' }));
  o.push(arrow([[172, 37], [214, 37]], { tone: 'sub', sw: 1.8, size: 7 }));
  o.push(g.folder(236, 36));
  o.push(t13(258, 32, '정적', { weight: 700 }));
  o.push(t13(258, 50, '파일', { weight: 700 }));
  o.push(t13(236, 74, '바로 응답해요', { tone: 'sub', anchor: 'middle' }));
  o.push(arrow([[126, 58], [126, 110]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(t13(134, 90, '나머지', { tone: 'accent', weight: 600 }));
  // WAS: 스레드 풀
  o.push(zone(8, 112, 284, 160, 'WAS', { tone: 'sub', dash: null, labelTone: 'text' }));
  o.push(t13(286, 130, '스레드 풀 · 최대 200개', { tone: 'sub', anchor: 'end' }));
  const xs = [40, 66, 92, 118, 144, 170];
  xs.forEach((x, i) => o.push(g.thread(x, 146, 54, { tone: i === 3 ? 'accent' : 'weak', sw: i === 3 ? 2.4 : 1.8 })));
  o.push(t13(196, 160, '…', { tone: 'weak', weight: 700 }));
  o.push(box(64, 214, 108, 44, '앱 코드', 'DB·API 호출', { tone: 'soft' }));
  o.push(t13(196, 196, '스레드 하나가', { tone: 'accent', weight: 700 }));
  o.push(t13(196, 214, '요청 하나를', { tone: 'accent', weight: 700 }));
  o.push(t13(196, 232, '맡아요', { tone: 'accent', weight: 700 }));
  return [300, 278, o];
};

// ── transactions-and-response-time ──

// 번호만 다른 요청이 경로 틀 하나로 모여요
figs['tx-name'] = () => {
  const o = [];
  const ids = ['1234', '5678', '42'];
  ids.forEach((id, i) => {
    const y = 18 + i * 46;
    o.push(rect(8, y, 120, 32, { rx: 8, fill: 'card', stroke: 'sub', sw: 1.3 }));
    o.push(spans(18, y + 21, [['/orders/', 'text'], [id, 'warn', 700]], { mono: true }));
    o.push(arrow([[128, y + 16], [178, 98]], { tone: 'sub', sw: 1.6, size: 6 }));
  });
  o.push(t13(234, 70, '트랜잭션 이름', { tone: 'accent', weight: 700, anchor: 'middle' }));
  o.push(rect(180, 80, 112, 36, { rx: 8, fill: 'accent', stroke: 'none' }));
  o.push(spans(236, 103, [['/orders/', 'card'], ['{id}', 'card', 700]], { mono: true, anchor: 'middle' }));
  o.push(t13(8, 176, '바뀌는 번호는 {id}로 묶어 같은 기능끼리 봐요', { tone: 'sub' }));
  return [300, 186, o];
};

// 사용자가 기다린 시간 가운데 APM이 재는 건 트랜잭션 한 구간
figs['tx-wait'] = () => {
  const o = [];
  const X = (p) => 8 + p * 2.84;
  const segs = [
    [0, 8, '', 'sub', 0.45],
    [8, 32, '앞단 대기', 'sub', 0.25],
    [32, 62, '트랜잭션', 'accent', 1],
    [62, 70, '', 'sub', 0.45],
    [70, 100, '화면 그리기', 'sub', 0.25],
  ];
  o.push(brace(X(0), X(100), 28, 'text', true));
  o.push(t13(150, 14, '사용자가 기다린 시간', { weight: 700, anchor: 'middle' }));
  segs.forEach(([a, b, n, tone, op]) => {
    o.push(rect(X(a) + 1, 32, X(b) - X(a) - 2, 34, { rx: 4, fill: tone, stroke: 'none', op }));
    if (n) o.push(label((X(a) + X(b)) / 2, 54, n, tone === 'accent' ? 'card' : 'text', 700));
  });
  [4, 66].forEach((p) => {
    o.push(line(X(p), 66, X(p), 82, { tone: 'sub', sw: 1.3 }));
    o.push(t13(p < 10 ? 8 : X(p), 96, '네트워크', { tone: 'sub', anchor: p < 10 ? 'start' : 'middle' }));
  });
  o.push(brace(X(32), X(62), 110, 'accent'));
  o.push(t13((X(32) + X(62)) / 2, 134, 'APM이 재는 건 여기뿐', { tone: 'accent', weight: 700, anchor: 'middle' }));
  o.push(t13(8, 164, '앞뒤 네트워크, 앞단 대기, 화면 그리기는 빠져요', { tone: 'sub' }));
  return [300, 172, o];
};

// 평균은 구간을 더하면 전체와 같지만, p95는 달라요
figs['tx-p95'] = () => {
  const o = [];
  const X = (ms) => 96 + ms * 0.17;
  o.push(rect(8, 6, 12, 12, { rx: 2, fill: 'accent', stroke: 'none' }));
  o.push(t13(26, 17, 'DB', { tone: 'sub' }));
  o.push(rect(60, 6, 12, 12, { rx: 2, fill: 'sub', stroke: 'none', op: 0.55 }));
  o.push(t13(78, 17, '외부 API', { tone: 'sub' }));
  o.push(t13(292, 17, '요청 100건', { tone: 'sub', anchor: 'end' }));
  const rows = [
    ['90건', '200ms', 100, 100],
    ['5건', '1,100ms', 1000, 100],
    ['5건', '1,100ms', 100, 1000],
  ];
  rows.forEach(([n, total, db, api], i) => {
    const y = 32 + i * 34;
    o.push(t13(8, y + 16, n, { weight: 700 }));
    o.push(t13(88, y + 16, total, { tone: 'sub', anchor: 'end' }));
    o.push(rect(X(0), y, X(db) - X(0), 22, { rx: 3, fill: 'accent', stroke: 'none' }));
    o.push(rect(X(db) + 1, y, X(db + api) - X(db) - 1, 22, { rx: 3, fill: 'sub', stroke: 'none', op: 0.55 }));
  });
  const card = (x, title, sum, real, ok) => {
    const tone = ok ? 'accent' : 'warn';
    o.push(rect(x, 146, 140, 100, { rx: 10, fill: ok ? 'accentWeak' : 'warnWeak', stroke: tone, sw: 1.4 }));
    o.push(t13(x + 12, 168, title, { weight: 700, tone }));
    o.push(t13(x + 12, 190, '두 구간을 더하면', { tone: 'sub' }));
    o.push(t13(x + 12, 208, sum, { weight: 700 }));
    o.push(t13(x + 12, 234, real, { weight: 700, tone }));
    o.push(ok ? g.check(x + 124, 165, { tone }) : xmark(x + 124, 165, { r: 5 }));
  };
  card(4, '평균', '145 + 145 = 290ms', '실제 전체 290ms', true);
  card(156, 'p95', '100 + 100 = 200ms', '실제 전체 1,100ms', false);
  return [300, 252, o];
};

// ── throughput-and-concurrency ──

// 요청이 들어오면 활성 +1, 끝나면 활성 −1·처리량 +1
figs['tc-counter'] = () => {
  const o = [];
  const lcd = (cx, y, title, val, tone) => {
    o.push(t13(cx, y, title, { tone: 'sub', anchor: 'middle' }));
    o.push(rect(cx - 40, y + 8, 80, 32, { rx: 6, fill: tone === 'accent' ? 'accent' : 'bg', stroke: tone === 'accent' ? 'none' : 'sub', sw: 1.4 }));
    o.push(text(cx, y + 30, val, { size: 15, weight: 700, tone: tone === 'accent' ? 'card' : 'text', anchor: 'middle', mono: true }));
  };
  lcd(150, 16, '활성 트랜잭션', '3', 'accent');
  o.push(rect(96, 84, 108, 66, { rx: 10, fill: 'accentWeak', stroke: 'accent', sw: 1.4 }));
  o.push(t13(150, 100, '처리 중', { tone: 'accent', weight: 700, anchor: 'middle' }));
  [118, 150, 182].forEach((x) => o.push(rect(x - 12, 112, 24, 26, { rx: 5, fill: 'accent', stroke: 'none' })));
  o.push(line(150, 56, 150, 84, { tone: 'accent', sw: 1.4, dash: '3 3' }));
  o.push(rect(14, 106, 24, 26, { rx: 5, fill: 'card', stroke: 'sub', sw: 1.4 }));
  o.push(arrow([[40, 119], [94, 119]], { tone: 'sub', sw: 2, size: 7 }));
  o.push(t13(26, 164, '시작', { weight: 700, anchor: 'middle' }));
  o.push(t13(26, 182, '활성 +1', { tone: 'accent', weight: 600, anchor: 'middle' }));
  o.push(arrow([[206, 119], [258, 119]], { tone: 'sub', sw: 2, size: 7 }));
  o.push(rect(262, 106, 24, 26, { rx: 5, fill: 'card', stroke: 'sub', sw: 1.4 }));
  o.push(g.check(274, 119, { tone: 'accent', r: 5 }));
  o.push(t13(274, 164, '끝', { weight: 700, anchor: 'middle' }));
  o.push(t13(274, 182, '활성 −1', { tone: 'accent', weight: 600, anchor: 'middle' }));
  lcd(208, 200, '처리량 카운터', '+1', 'plain');
  o.push(line(274, 190, 274, 226, { tone: 'sub', sw: 1.4 }));
  o.push(arrow([[274, 226], [250, 226]], { tone: 'sub', sw: 1.4, size: 6 }));
  o.push(t13(8, 264, '밀리면 끝나는 요청이 줄어 처리량부터 줄어요', { tone: 'sub' }));
  return [300, 272, o];
};

// ── response-time-distribution ──

// 시간 띠 위의 요청이 끝나는 순간, 분포도에 점이 찍혀요
const dotFigure = (o, { tMax, X, lanes, yMax, yTicks, dots, axisTicks, extra }) => {
  const laneY = (i) => 14 + i * 26;
  lanes.forEach(([name, a, b, tone, txt], i) => {
    const y = laneY(i);
    o.push(t13(8, y + 13, name, { tone: 'sub', weight: 600 }));
    o.push(rect(X(0), y, X(tMax) - X(0), 18, { rx: 9, fill: 'bg', stroke: 'none' }));
    const st = { accent: ['accentWeak', 'accent'], warn: ['warnWeak', 'warn'], lock: ['warn', 'none'] }[tone];
    o.push(rect(X(a), y, X(b) - X(a), 18, { rx: 6, fill: st[0], stroke: st[1], sw: 1.4 }));
    if (txt) o.push(label((X(a) + X(b)) / 2, y + 13.5, txt, tone === 'lock' ? 'card' : tone === 'warn' ? 'warn' : 'accent', 700));
  });
  const top = laneY(lanes.length) + 18;
  const bot = top + 104;
  const Y = (d) => bot - (d / yMax) * 96;
  o.push(t13(8, top - 4, '분포도', { weight: 700 }));
  o.push(line(X(0), top + 2, X(0), bot, { tone: 'line', sw: 1.2, cap: 'butt' }));
  o.push(line(X(0), bot, X(tMax), bot, { tone: 'line', sw: 1.2, cap: 'butt' }));
  yTicks.forEach((d) => o.push(t13(X(0) - 6, Y(d) + 4.5, `${d}초`, { tone: 'sub', anchor: 'end' })));
  if (extra) extra(o, Y, top, bot);
  dots.forEach(([lane, t, d]) => {
    o.push(line(X(t), laneY(lane) + 18, X(t), Y(d) - 7, { tone: 'weak', sw: 1.2, dash: '3 3' }));
    o.push(g.circle(X(t), Y(d), 6, { fill: lanes[lane][3] === 'warn' ? 'warn' : 'accent' }));
  });
  axisTicks.forEach((t) => o.push(t13(X(t), bot + 18, `${t}초`, { tone: 'sub', anchor: 'middle' })));
  return { top, bot, Y };
};
figs['rtd-dot'] = () => {
  const o = [];
  const X = (t) => 64 + t * 22;
  const { bot, Y } = dotFigure(o, {
    tMax: 10,
    X,
    lanes: [['요청 A', 1, 3, 'accent', '2초'], ['요청 B', 2, 10, 'warn', '아직 안 끝남'], ['요청 C', 6, 7, 'accent', '']],
    yMax: 3,
    yTicks: [1, 2, 3],
    dots: [[0, 3, 2], [2, 7, 1]],
    axisTicks: [0, 5, 10],
  });
  // 점의 높이 = 걸린 시간
  o.push(arrow([[X(3) + 12, bot], [X(3) + 12, Y(2) + 2]], { tone: 'accent', sw: 1.5, size: 6, start: true }));
  o.push(t13(X(3) + 20, Y(2) + 22, '높이 =', { tone: 'accent', weight: 600 }));
  o.push(t13(X(3) + 20, Y(2) + 40, '걸린 시간', { tone: 'accent', weight: 600 }));
  o.push(line(X(10), 10, X(10), bot, { tone: 'warn', sw: 1.4, dash: '4 3' }));
  o.push(t13(X(10), bot + 34, '지금', { tone: 'warn', weight: 700, anchor: 'middle' }));
  o.push(t13(8, bot + 54, '끝난 순간에 점이 찍혀요. B는 아직 점이 없어요', { tone: 'sub' }));
  return [300, bot + 62, o];
};
figs['rtd-lock'] = () => {
  const o = [];
  const X = (t) => 64 + t * 36;
  const { bot } = dotFigure(o, {
    tMax: 6,
    X,
    lanes: [['잠금', 1, 5, 'lock', '잠금 4초'], ['요청 A', 1.5, 5, 'accent', '3.5초'], ['요청 B', 2.5, 5, 'accent', '2.5초'], ['요청 C', 4, 5, 'accent', '']],
    yMax: 4,
    yTicks: [1, 2, 3, 4],
    dots: [[1, 5, 3.5], [2, 5, 2.5], [3, 5, 1]],
    axisTicks: [0, 3, 6],
  });
  o.push(t13(X(5) + 12, bot - 50, '세로줄', { tone: 'accent', weight: 700 }));
  o.push(t13(8, bot + 40, '잠금이 풀리는 순간 함께 끝나 점이 세로로 서요', { tone: 'sub' }));
  return [300, bot + 48, o];
};
figs['rtd-timeout'] = () => {
  const o = [];
  const X = (t) => 64 + t * 22;
  const { bot } = dotFigure(o, {
    tMax: 10,
    X,
    lanes: [['요청 D', 0, 5, 'warn', '5초'], ['요청 E', 2, 7, 'warn', '5초'], ['요청 F', 4, 9, 'warn', '5초']],
    yMax: 6,
    yTicks: [5],
    dots: [[0, 5, 5], [1, 7, 5], [2, 9, 5]],
    axisTicks: [0, 5, 10],
    extra: (oo, Y) => {
      oo.push(line(X(0), Y(5), X(10), Y(5), { tone: 'warn', sw: 1.2, dash: '4 3' }));
    },
  });
  o.push(t13(X(0) + 6, bot - 18, '타임아웃 5초에서 가로줄', { tone: 'warn', weight: 700 }));
  o.push(t13(8, bot + 40, '끝난 시각은 달라도 모두 5초를 기다리다 끝나요', { tone: 'sub' }));
  return [300, bot + 48, o];
};

// 1분 × 응답시간 구간으로 나눈 히트맵
figs['rtd-heatmap'] = () => {
  const o = [];
  const rows = [
    ['1초 넘음', [0, 1, 0, 2, 110, 1]],
    ['0.5~1초', [8, 10, 7, 9, 12, 8]],
    ['0.5초 아래', [120, 125, 118, 122, 30, 121]],
  ];
  const x0 = 80;
  const cw = 35;
  const ch = 40;
  const y0 = 34;
  o.push(t13(8, 16, '응답시간', { tone: 'sub' }));
  o.push(t13(292, 16, '많을수록 진하게', { tone: 'sub', anchor: 'end' }));
  rows.forEach(([n, vals], r) => {
    const y = y0 + r * ch;
    o.push(t13(x0 - 8, y + ch / 2 + 4.5, n, { tone: 'text', anchor: 'end', weight: 600 }));
    vals.forEach((v, c) => {
      const heat = v / 125;
      const x = x0 + c * cw;
      o.push(rect(x, y, cw, ch, { rx: 0, fill: 'bg', stroke: 'card', sw: 1.5 }));
      o.push(rect(x + 1, y + 1, cw - 2, ch - 2, { rx: 2, fill: 'accent', stroke: 'none', op: Math.max(0.06, heat).toFixed(2) }));
      o.push(text(x + cw / 2, y + ch / 2 + 4.5, String(v), { size: 13, weight: 700, tone: heat > 0.5 ? 'card' : 'text', anchor: 'middle' }));
    });
  });
  const yb = y0 + 3 * ch;
  ['14:00', '', '14:02', '', '14:04', ''].forEach((t, c) => t && o.push(text(x0 + c * cw + cw / 2, yb + 18, t, { size: 13, tone: c === 4 ? 'warn' : 'sub', weight: c === 4 ? 700 : 400, anchor: 'middle' })));
  o.push(rect(x0 + 4 * cw - 2, y0 - 4, cw + 4, 3 * ch + 8, { rx: 4, fill: 'none', stroke: 'warn', sw: 2 }));
  o.push(t13(8, yb + 46, '14:04에 1초 넘는 칸으로 몰렸어요', { tone: 'warn', weight: 700 }));
  return [300, yb + 54, o];
};

// ── runtimes ──

// Gunicorn: 마스터가 워커 프로세스를 띄우고, 워커마다 GIL·메모리·지표가 따로
figs['rt-gunicorn'] = () => {
  const o = [];
  o.push(zone(4, 4, 292, 214, '서버 · 코어 2개', { tone: 'sub', dash: null, labelTone: 'text' }));
  o.push(box(92, 32, 116, 44, '마스터', '띄우고 지켜봐요', { tone: 'accent' }));
  const xs = [36, 93, 150, 207, 264];
  xs.forEach((cx, i) => {
    o.push(arrow([[150 + (cx - 150) * 0.25, 76], [cx, 108]], { tone: 'sub', sw: 1.5, size: 6 }));
    o.push(rect(cx - 26, 110, 52, 84, { rx: 8, fill: 'card', stroke: 'sub', sw: 1.4 }));
    o.push(label(cx, 128, `워커 ${i + 1}`, 'text', 700));
    o.push(tag(cx, 148, 'GIL', { tone: 'sub' }));
    o.push(g.panel(cx, 176, { w: 34, h: 24, points: [0.2, 0.5, 0.3, 0.7] }));
  });
  o.push(t13(150, 240, '워커마다 GIL·메모리·지표가 따로예요', { tone: 'sub', anchor: 'middle' }));
  return [300, 248, o];
};

// GOMAXPROCS = 2: 한순간에 Go 코드를 돌리는 건 둘뿐
figs['rt-gomaxprocs'] = () => {
  const o = [];
  const G = (cx, cy, n, tone) => {
    const st = { run: ['accent', 'none', 'card'], wait: ['card', 'sub', 'text'], io: ['none', 'weak', 'sub'] }[tone];
    o.push(rect(cx - 17, cy - 13, 34, 26, { rx: 13, fill: st[0], stroke: st[1], sw: 1.4, dash: tone === 'io' ? '4 3' : undefined }));
    o.push(label(cx, cy + 4.7, n, st[2], 700));
  };
  o.push(t13(8, 18, 'GOMAXPROCS = 2', { weight: 700, mono: true }));
  [[56, ['G4', 'G3', 'G2'], 'G1', 1], [118, ['G8', 'G7', 'G6'], 'G5', 2]].forEach(([y, waits, run, n]) => {
    waits.forEach((w, i) => G(24 + i * 40, y, w, 'wait'));
    o.push(arrow([[124, y], [150, y]], { tone: 'sub', sw: 1.6, size: 6 }));
    o.push(rect(152, y - 24, 140, 48, { rx: 10, fill: 'accentWeak', stroke: 'accent', sw: 1.4 }));
    G(184, y, run, 'run');
    o.push(t13(210, y - 3, `실행 칸 ${n}`, { weight: 700, tone: 'accent' }));
    o.push(t13(210, y + 14, '스레드', { tone: 'sub' }));
  });
  o.push(t13(64, 162, '차례를 기다려요', { tone: 'sub', anchor: 'middle' }));
  o.push(line(8, 178, 292, 178, { tone: 'line', sw: 1, dash: '3 3' }));
  G(24, 204, 'G9', 'io');
  G(64, 204, 'G10', 'io');
  o.push(t13(92, 209, 'I/O를 기다리면 칸을 쓰지 않아요', { tone: 'sub' }));
  return [300, 226, o];
};

// ── agents ──

// JVM은 에이전트를 먼저 띄우고, 클래스를 올릴 때마다 고쳐요
figs['ag-steps'] = () => {
  const o = [];
  const step = (i, title, draw) => {
    const y = 6 + i * 54;
    o.push(g.badge(18, y + 16, i + 1));
    o.push(t13(34, y + 21, title, { weight: 700 }));
    draw(y);
    if (i < 4) o.push(line(18, y + 28, 18, y + 52, { tone: 'line', sw: 2 }));
  };
  step(0, 'JVM 시작', (y) => {
    o.push(rect(34, y + 28, 206, 20, { rx: 4, fill: 'bg', stroke: 'line', sw: 1 }));
    o.push(mono(40, y + 43, '-javaagent:otel-agent.jar', { tone: 'accent', weight: 700 }));
  });
  step(1, '에이전트를 먼저 띄워요', (y) => {
    o.push(tag(34, y + 38, '에이전트', { tone: 'accent', anchor: 'start' }));
    o.push(arrow([[106, y + 38], [126, y + 38]], { tone: 'sub', sw: 1.5, size: 6 }));
    o.push(tag(130, y + 38, '앱의 main', { tone: 'sub', anchor: 'start' }));
  });
  step(2, '클래스를 올릴 때마다 고쳐요', (y) => {
    o.push(tag(34, y + 38, '.class', { tone: 'sub', anchor: 'start' }));
    o.push(arrow([[86, y + 38], [104, y + 38]], { tone: 'sub', sw: 1.5, size: 6 }));
    o.push(g.gear(118, y + 38, { tone: 'accent', r: 9 }));
    o.push(arrow([[132, y + 38], [150, y + 38]], { tone: 'sub', sw: 1.5, size: 6 }));
    o.push(tag(154, y + 38, '고친 클래스', { tone: 'accent', anchor: 'start' }));
  });
  step(3, '요청마다 시작·끝을 기록해요', (y) => {
    o.push(tag(34, y + 38, '시작', { tone: 'soft', anchor: 'start' }));
    o.push(tag(80, y + 38, '메서드', { tone: 'plain', anchor: 'start' }));
    o.push(tag(138, y + 38, '끝', { tone: 'soft', anchor: 'start' }));
  });
  step(4, '모은 기록을 보내요', (y) => {
    o.push(tag(34, y + 38, '에이전트', { tone: 'accent', anchor: 'start' }));
    o.push(arrow([[106, y + 38], [138, y + 38]], { tone: 'accent', sw: 1.8, size: 7 }));
    o.push(tag(142, y + 38, '수집 서버', { tone: 'plain', anchor: 'start' }));
  });
  return [300, 6 + 4 * 54 + 56, o];
};

// 고친 메서드: 원래 코드 앞뒤에 시작·끝 기록이 붙어요
figs['ag-wrap'] = () => {
  const o = [];
  const card = (y, title, lines) => {
    const h = 30 + lines.length * 22 + 8;
    o.push(rect(4, y, 292, h, { rx: 10, fill: 'card', stroke: 'line', sw: 1.4 }));
    o.push(t13(14, y + 20, title, { weight: 700 }));
    lines.forEach(([s, add], i) => {
      const ly = y + 30 + i * 22;
      if (add) o.push(rect(8, ly, 284, 20, { rx: 4, fill: 'accentWeak', stroke: 'none' }));
      const ind = s.startsWith('  ') ? 30 : 14;
      if (add) o.push(t13(ind, ly + 15, s.trim(), { tone: 'accent', weight: 700 }));
      else o.push(mono(ind, ly + 15, s.trim()));
      if (add) o.push(t13(286, ly + 15, '붙었어요', { tone: 'accent', anchor: 'end', weight: 600 }));
    });
    return h;
  };
  const h1 = card(4, '원래 메서드', [['findOrder(id) {'], ['  // 주문 조회 코드'], ['}']]);
  o.push(arrow([[150, 4 + h1 + 2], [150, 4 + h1 + 20]], { tone: 'sub', sw: 1.8, size: 7 }));
  o.push(t13(160, 4 + h1 + 16, '클래스를 메모리에 올릴 때', { tone: 'sub' }));
  const y2 = 4 + h1 + 24;
  const h2 = card(y2, '에이전트가 고친 뒤', [['findOrder(id) {'], ['  시작 기록', true], ['  // 주문 조회 코드'], ['  끝 기록', true], ['}']]);
  o.push(t13(8, y2 + h2 + 22, '디스크의 파일은 그대로, 메모리의 클래스만 바뀌어요', { tone: 'sub' }));
  return [300, y2 + h2 + 30, o];
};

// 앱과 에이전트는 같은 JVM 안에, 기록은 수집 서버로
figs['ag-arch'] = () => {
  const o = [];
  o.push(zone(4, 4, 140, 172, 'JVM 하나', { tone: 'sub', dash: null, labelTone: 'text' }));
  o.push(box(20, 34, 108, 40, '앱 코드', null, { tone: 'plain' }));
  o.push(arrow([[74, 76], [74, 110]], { tone: 'sub', sw: 1.6, size: 6, start: true }));
  o.push(t13(82, 97, '감싸요', { tone: 'sub' }));
  o.push(box(20, 112, 108, 46, '에이전트', '시작·끝 기록', { tone: 'accent' }));
  o.push(arrow([[128, 135], [198, 135]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(t13(163, 126, '보내요', { tone: 'accent', weight: 600, anchor: 'middle' }));
  o.push(g.server(222, 135));
  o.push(label(222, 172, '수집 서버', 'text', 700));
  o.push(arrow([[222, 114], [222, 74]], { tone: 'sub', sw: 1.8, size: 7 }));
  o.push(g.panel(222, 46, { w: 56, h: 40 }));
  o.push(t13(256, 40, 'APM', { weight: 700 }));
  o.push(t13(256, 58, '화면', { weight: 700 }));
  o.push(t13(150, 204, '화면은 수집 서버에 모인 기록으로 그려요', { tone: 'sub', anchor: 'middle' }));
  return [300, 212, o];
};

// ── sampling ──

// head 10%: 10건 중 1건만 남기고, 남은 1건에 10을 곱해 어림해요
figs['sp-head'] = () => {
  const o = [];
  o.push(t13(8, 16, '요청 10건 · head 10%', { weight: 700 }));
  for (let i = 0; i < 10; i++) {
    const x = 8 + i * 28.6;
    const keep = i === 0;
    o.push(rect(x, 30, 24, 30, { rx: 6, fill: keep ? 'accent' : 'none', stroke: keep ? 'none' : 'weak', sw: 1.4, dash: keep ? undefined : '4 3' }));
    o.push(label(x + 12, 50, String(i + 1), keep ? 'card' : 'weak', 700));
  }
  o.push(g.check(20, 76, { tone: 'accent', r: 5 }));
  o.push(t13(20, 96, '남김', { tone: 'accent', weight: 700, anchor: 'middle' }));
  o.push(brace(37, 292, 72));
  o.push(t13(165, 96, '버린 9건', { tone: 'sub', anchor: 'middle' }));
  o.push(arrow([[20, 108], [20, 136]], { tone: 'accent', sw: 1.8, size: 7 }));
  o.push(rect(8, 140, 24, 30, { rx: 6, fill: 'accent', stroke: 'none' }));
  o.push(label(20, 160, '1', 'card', 700));
  o.push(t13(42, 161, '× 10', { weight: 700, tone: 'accent' }));
  o.push(t13(84, 161, '=', { weight: 700, tone: 'sub' }));
  for (let i = 0; i < 10; i++) o.push(rect(100 + i * 19, 146, 15, 18, { rx: 4, fill: 'accentWeak', stroke: 'accent', sw: 1 }));
  o.push(t13(8, 198, '남은 1건에 10을 곱해 요청 10건으로 어림해요', { tone: 'sub' }));
  return [300, 206, o];
};

// head는 시작할 때 확률로, tail은 다 모은 뒤 정책으로
figs['sp-head-tail'] = () => {
  const o = [];
  const X0 = 64;
  const X1 = 268;
  const trace = (y, tone, kept, txt) => {
    o.push(rect(X0, y - 7, X1 - X0, 14, { rx: 4, fill: kept ? (tone === 'warn' ? 'warnWeak' : 'accentWeak') : 'none', stroke: kept ? (tone === 'warn' ? 'warn' : 'accent') : 'weak', sw: 1.3, dash: kept ? undefined : '4 3' }));
    if (txt) o.push(t13(X0 + 8, y + 4.5, txt, { tone: tone === 'warn' ? 'warn' : kept ? 'accent' : 'weak', weight: 600 }));
  };
  // head
  o.push(t13(8, 18, 'head 샘플링', { weight: 700 }));
  o.push(t13(292, 18, '시작할 때 확률로', { tone: 'sub', anchor: 'end' }));
  [[44, true, '남김'], [66, false, '버림'], [88, false, '버림']].forEach(([y, k, t]) => {
    trace(y, 'accent', k, t);
    o.push(g.circle(X0 - 14, y, 7, { fill: k ? 'accent' : 'card', stroke: k ? 'none' : 'sub', sw: 1.4 }));
  });
  o.push(t13(36, 110, '정하는 곳', { tone: 'sub', anchor: 'middle' }));
  o.push(t13(8, 132, '× 1/확률로 되돌려 셀 수 있어요', { tone: 'accent', weight: 600 }));
  o.push(line(8, 148, 292, 148, { tone: 'line', sw: 1, dash: '3 3' }));
  // tail
  o.push(t13(8, 172, 'tail 샘플링', { weight: 700 }));
  o.push(t13(292, 172, '다 모은 뒤 정책으로', { tone: 'sub', anchor: 'end' }));
  [[198, 'warn', true, '에러 · 남김'], [220, 'accent', false, '정상 · 버림'], [242, 'accent', false, '정상 · 버림']].forEach(([y, tone, k, t]) => {
    trace(y, tone, true, t);
    o.push(g.circle(X1 + 14, y, 7, { fill: k ? 'warn' : 'card', stroke: k ? 'none' : 'sub', sw: 1.4 }));
  });
  o.push(t13(282, 264, '정하는 곳', { tone: 'sub', anchor: 'end' }));
  o.push(t13(8, 286, '에러 쪽으로 쏠려 되돌릴 수 없어요', { tone: 'warn', weight: 600 }));
  return [300, 294, o];
};

// ── trace-waterfall ──

// 목록 질의 하나 뒤에 같은 질의가 75ms씩 8번
figs['tw-repeat'] = () => {
  const o = [];
  const X = (ms) => 8 + ms * 0.43;
  o.push(rect(X(0), 10, X(40) - X(0), 16, { rx: 3, fill: 'accent', stroke: 'none' }));
  o.push(t13(X(40) + 6, 23, 'SELECT orders · 40ms', { tone: 'accent', weight: 600 }));
  for (let i = 0; i < 8; i++) {
    const a = 40 + i * 75;
    const y = 34 + i * 18;
    o.push(rect(X(a) + 0.5, y, X(a + 75) - X(a) - 1, 14, { rx: 3, fill: 'warn', stroke: 'none' }));
  }
  o.push(t13(140, 50, 'SELECT order_items', { tone: 'warn', weight: 700 }));
  o.push(t13(140, 68, '75ms씩, 항목마다 한 번', { tone: 'sub' }));
  o.push(brace(X(40), X(640), 182));
  o.push(t13((X(40) + X(640)) / 2, 206, '같은 질의 8번 · 합 600ms', { tone: 'warn', weight: 700, anchor: 'middle' }));
  [0, 300, 640].forEach((ms) => {
    o.push(line(X(ms), 222, X(ms), 228, { tone: 'sub', sw: 1.2, cap: 'butt' }));
    o.push(t13(X(ms), 244, `${ms}ms`, { tone: 'sub', anchor: ms === 0 ? 'start' : ms === 640 ? 'end' : 'middle' }));
  });
  o.push(line(X(0), 225, X(640), 225, { tone: 'line', sw: 1.2, cap: 'butt' }));
  return [300, 252, o];
};

// ── service-map ──

// CLIENT span과 SERVER span의 짝이 맵의 선 하나
figs['sm-edge'] = () => {
  const o = [];
  o.push(zone(4, 4, 292, 94, '트레이스 하나', { tone: 'sub', labelTone: 'sub' }));
  o.push(rect(14, 32, 250, 22, { rx: 4, fill: 'accentWeak', stroke: 'accent', sw: 1.3 }));
  o.push(t13(22, 48, '주문 API · CLIENT span', { tone: 'accent', weight: 700 }));
  o.push(line(28, 54, 28, 74, { tone: 'sub', sw: 1.3 }));
  o.push(line(28, 74, 44, 74, { tone: 'sub', sw: 1.3 }));
  o.push(rect(46, 63, 190, 22, { rx: 4, fill: 'card', stroke: 'sub', sw: 1.3 }));
  o.push(t13(54, 79, '결제 API · SERVER span', { weight: 700 }));
  o.push(t13(286, 79, '자식', { tone: 'sub', anchor: 'end' }));
  o.push(arrow([[150, 100], [150, 128]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(t13(160, 119, '이 짝이 선 하나', { tone: 'accent', weight: 600 }));
  o.push(g.circle(52, 160, 26, { fill: 'card', stroke: 'sub', sw: 1.5 }));
  o.push(label(52, 156, '주문', 'text', 700));
  o.push(label(52, 172, 'API', 'text', 700));
  o.push(g.circle(248, 160, 26, { fill: 'card', stroke: 'sub', sw: 1.5 }));
  o.push(label(248, 156, '결제', 'text', 700));
  o.push(label(248, 172, 'API', 'text', 700));
  o.push(arrow([[80, 160], [220, 160]], { tone: 'accent', sw: 2.4, size: 8 }));
  o.push(rect(98, 176, 104, 62, { rx: 6, fill: 'bg', stroke: 'line', sw: 1 }));
  ['요청 수', '실패 수', '응답시간'].forEach((s, i) => o.push(t13(150, 196 + i * 17, s, { tone: 'sub', anchor: 'middle' })));
  return [300, 244, o];
};

// span을 보내는 건 주문 API뿐: 양옆은 추정한 노드
figs['sm-virtual'] = () => {
  const o = [];
  o.push(`<circle cx="40" cy="60" r="26" stroke-width="1.5" stroke-dasharray="4 3" style="fill:none;stroke:${g.color('weak')}" />`);
  o.push(label(40, 65, 'user', 'sub', 700));
  o.push(g.circle(150, 60, 30, { fill: 'accent' }));
  o.push(label(150, 56, '주문', 'card', 700));
  o.push(label(150, 72, 'API', 'card', 700));
  o.push(g.db(260, 60, { tone: 'weak' }));
  o.push(arrow([[68, 60], [116, 60]], { tone: 'sub', sw: 1.8, size: 7 }));
  o.push(arrow([[182, 60], [238, 60]], { tone: 'sub', sw: 1.8, size: 7 }));
  o.push(label(40, 108, '부른 쪽', 'sub', 600));
  o.push(label(40, 125, '미계측', 'sub', 600));
  o.push(label(150, 108, 'span을', 'accent', 700));
  o.push(label(150, 125, '보내요', 'accent', 700));
  o.push(label(260, 108, 'orders DB', 'text', 700));
  o.push(label(260, 125, '가상 노드', 'sub', 600));
  o.push(rect(8, 146, 284, 30, { rx: 6, fill: 'bg', stroke: 'line', sw: 1 }));
  o.push(spans(150, 166, [['DB 노드는 span의 ', 'sub'], ['db.system', 'accent', 700], [' 속성으로', 'sub']], { anchor: 'middle' }));
  o.push(t13(8, 206, '양옆은 주문 API의 span으로 짐작해 그린 노드예요', { tone: 'sub' }));
  return [300, 214, o];
};

// ── broken-traces ──

// 프록시가 traceparent를 빼먹으면 결제 API는 새 트레이스를 시작해요
figs['bt-proxy'] = () => {
  const o = [];
  o.push(box(8, 20, 76, 40, '주문 API', null, { tone: 'plain' }));
  o.push(box(112, 20, 76, 40, '프록시', null, { tone: 'warn' }));
  o.push(box(216, 20, 76, 40, '결제 API', null, { tone: 'plain' }));
  o.push(arrow([[84, 40], [110, 40]], { tone: 'sub', sw: 1.8, size: 7 }));
  o.push(arrow([[188, 40], [214, 40]], { tone: 'sub', sw: 1.8, size: 7 }));
  // 요청 머리말
  const hdr = (x, has) => {
    o.push(rect(x, 76, 92, 58, { rx: 6, fill: 'bg', stroke: 'line', sw: 1 }));
    o.push(t13(x + 8, 94, '머리말', { tone: 'sub' }));
    o.push(rect(x + 6, 102, 80, 22, { rx: 4, fill: has ? 'accentWeak' : 'none', stroke: has ? 'accent' : 'warn', sw: 1.2, dash: has ? undefined : '4 3' }));
    o.push(text(x + 46, 117.5, 'traceparent', { size: 13, weight: 700, tone: has ? 'accent' : 'warn', anchor: 'middle', mono: true, fit: 72 }));
    if (!has) o.push(xmark(x + 84, 102, { r: 5 }));
  };
  hdr(46, true);
  hdr(160, false);
  o.push(t13(8, 162, '트레이스 둘로 나뉘어요', { weight: 700 }));
  o.push(rect(8, 174, 200, 22, { rx: 4, fill: 'accentWeak', stroke: 'accent', sw: 1.3 }));
  o.push(t13(16, 190, 'trace A · 주문 API', { tone: 'accent', weight: 600 }));
  o.push(rect(92, 204, 200, 22, { rx: 4, fill: 'warnWeak', stroke: 'warn', sw: 1.3 }));
  o.push(t13(100, 220, 'trace B · 결제 API(부모 모름)', { tone: 'warn', weight: 600 }));
  return [300, 234, o];
};

// 스레드 풀로 넘길 때 컨텍스트를 함께 넘기나
figs['bt-context'] = () => {
  const o = [];
  const panel = (y, title, code, wrap) => {
    o.push(rect(4, y, 292, 132, { rx: 10, fill: 'card', stroke: 'line', sw: 1.3 }));
    o.push(t13(14, y + 20, title, { weight: 700 }));
    code.forEach((c, i) => o.push(mono(c.startsWith('  ') ? 30 : 14, y + 40 + i * 18, c.trim(), { tone: 'sub' })));
    const ly = y + (code.length > 1 ? 82 : 66);
    o.push(t13(14, ly + 5, '요청 스레드', { tone: 'sub' }));
    o.push(tag(114, ly, 'trace A', { tone: 'accent' }));
    o.push(arrow([[148, ly], [166, ly]], { tone: 'sub', sw: 1.6, size: 6 }));
    o.push(t13(170, ly + 5, '풀 스레드', { tone: 'sub' }));
    if (wrap) o.push(tag(260, ly, 'trace A', { tone: 'accent' }));
    else o.push(tag(260, ly, '없음', { tone: 'warnSoft' }));
    o.push(t13(14, y + 122, wrap ? '뒤쪽 span이 같은 트레이스에 이어져요' : '뒤쪽 span의 트레이스가 끊길 수 있어요', { tone: wrap ? 'accent' : 'warn', weight: 700 }));
  };
  panel(4, '그냥 넘길 때', ['executorService'], false);
  panel(146, '감싸서 넘길 때', ['Context.current()', '  .wrap(executorService)'], true);
  return [300, 282, o];
};


// ── errors-and-exceptions ──

// 예외는 4번, 실패한 요청은 1건: 에러율은 1 ÷ 5
figs['ee-count'] = () => {
  const o = [];
  const ex = [0, 1, 3, 0, 0];
  ex.forEach((n, i) => {
    const x = 6 + i * 58;
    const fail = i === 2;
    o.push(rect(x, 8, 52, 112, { rx: 8, fill: fail ? 'warnWeak' : 'card', stroke: fail ? 'warn' : 'line', sw: 1.4 }));
    o.push(label(x + 26, 28, `요청 ${i + 1}`, fail ? 'warn' : 'text', 700));
    for (let k = 0; k < n; k++) {
      o.push(g.circle(x + 26, 46 + k * 18, 7, { fill: 'warn' }));
      o.push(label(x + 26, 50.5 + k * 18, '!', 'card', 700));
    }
    if (!n) o.push(label(x + 26, 62, '–', 'weak', 400));
    o.push(tag(x + 26, 106, fail ? '실패' : '성공', { tone: fail ? 'warn' : 'soft' }));
  });
  o.push(g.circle(14, 146, 7, { fill: 'warn' }));
  o.push(label(14, 150.5, '!', 'card', 700));
  o.push(t13(28, 151, '예외 · 모두 4번', { tone: 'sub' }));
  o.push(t13(8, 184, '실패한 요청 1건 ÷ 요청 5건 = 에러율 20%', { weight: 700, tone: 'warn' }));
  o.push(t13(8, 204, '예외 수가 아니라 실패한 요청 수를 세요', { tone: 'sub' }));
  return [300, 212, o];
};

// 같은 호출을 양쪽 span에서: 5xx는 둘 다 에러, 4xx는 부른 쪽만
figs['ee-sides'] = () => {
  const o = [];
  o.push(box(8, 10, 108, 44, '부른 쪽', 'CLIENT span', { tone: 'plain' }));
  o.push(box(184, 10, 108, 44, '받은 쪽', 'SERVER span', { tone: 'plain' }));
  o.push(arrow([[116, 24], [182, 24]], { tone: 'sub', sw: 1.6, size: 6 }));
  o.push(arrow([[182, 42], [118, 42]], { tone: 'sub', sw: 1.6, size: 6, dash: '4 3' }));
  o.push(t13(150, 60, '응답 코드', { tone: 'sub', anchor: 'middle' }));
  const cell = (cx, y, err, txt) => {
    o.push(rect(cx - 52, y, 104, 34, { rx: 8, fill: err ? 'warnWeak' : 'bg', stroke: err ? 'warn' : 'line', sw: 1.3 }));
    o.push(label(cx, y + 22, txt, err ? 'warn' : 'sub', 700));
  };
  [['5xx', true, '에러', true, '에러'], ['4xx', true, '에러', false, '에러 아님']].forEach(([code, a, ta, b, tb], r) => {
    const y = 76 + r * 46;
    o.push(t13(150, y + 22, code, { weight: 700, anchor: 'middle', mono: true }));
    cell(62, y, a, ta);
    cell(238, y, b, tb);
  });
  o.push(t13(292, 172, '받은 쪽은 상태를 비워 둬요', { tone: 'sub', anchor: 'end' }));
  return [300, 180, o];
};

// 재시도로 성공한 호출: 로그에 예외 한 줄, 에러율에는 안 들어가요
figs['ee-retry'] = () => {
  const o = [];
  const lanes = [{ x: 40, label: '로그' }, { x: 150, label: '앱' }, { x: 260, label: '외부 API' }];
  o.push(ladder(lanes, [
    { from: 1, to: 2, y: 50, label: '호출' },
    { from: 2, to: 1, y: 84, label: '실패', dashed: true, tone: 'warn' },
    { from: 1, to: 0, y: 118, label: '예외 한 줄', tone: 'warn' },
    { from: 1, to: 2, y: 152, label: '다시 호출' },
    { from: 2, to: 1, y: 186, label: '성공', dashed: true, tone: 'accent' },
  ], { top: 18, bottom: 204 }));
  o.push(tag(150, 228, '요청은 성공 1건 · 에러율에는 안 들어가요', { tone: 'soft' }));
  return [300, 244, o];
};

// ── apdex ──

// T 0.5초: 만족 ×1, 허용 ×0.5, 불만 ×0
figs['ax-zones'] = () => {
  const o = [];
  const X = (s) => 8 + s * 92;
  const zones = [[0, 0.5, '만족', '×1', '800건', 'accent'], [0.5, 2, '허용', '×0.5', '100건', 'sub'], [2, 3.06, '불만', '×0', '100건', 'warn']];
  zones.forEach(([a, b, n, w, c, tone]) => {
    const fill = tone === 'accent' ? 'accent' : tone === 'warn' ? 'warnWeak' : 'bg';
    o.push(rect(X(a), 26, X(b) - X(a), 40, { rx: 0, fill, stroke: tone === 'sub' ? 'line' : tone === 'warn' ? 'warn' : 'none', sw: 1.2 }));
    const cx = (X(a) + X(b)) / 2;
    if (b - a >= 1) {
      o.push(label(cx, 43, n, tone === 'warn' ? 'warn' : 'text', 700));
      o.push(label(cx, 60, w, tone === 'warn' ? 'warn' : 'sub', 600));
    }
    o.push(label(cx, 120, c, tone === 'accent' ? 'accent' : tone === 'warn' ? 'warn' : 'text', 700));
  });
  o.push(label((X(0) + X(0.5)) / 2 + 6, 138, '0.5초 이하', 'sub', 400));
  o.push(label((X(0.5) + X(2)) / 2, 138, '0.5~2초', 'sub', 400));
  o.push(label((X(2) + X(3.06)) / 2, 138, '2초 넘음·에러', 'sub', 400));
  // 만족 칸은 좁아서 위에 이름을 붙여요
  o.push(label((X(0) + X(0.5)) / 2, 18, '만족 ×1', 'accent', 700));
  [[0, '0'], [0.5, 'T 0.5초'], [2, '4T 2초']].forEach(([s, t]) => {
    o.push(line(X(s), 66, X(s), 74, { tone: 'sub', sw: 1.4, cap: 'butt' }));
    o.push(t13(X(s), 88, t, { tone: 'sub', anchor: s === 0 ? 'start' : 'middle' }));
  });
  o.push(line(8, 154, 292, 154, { tone: 'line', sw: 1, dash: '3 3' }));
  o.push(t13(8, 178, 'Apdex = (800 + 100 × 0.5) ÷ 1,000', { weight: 600 }));
  o.push(t13(8, 200, '= 0.85', { weight: 700, tone: 'accent' }));
  return [300, 208, o];
};

// 같은 3초 요청이 T에 따라 만족도, 불만도 돼요
figs['ax-defaults'] = () => {
  const o = [];
  const row = (y, title, bounds, hit) => {
    o.push(t13(8, y, title, { weight: 700 }));
    const names = [['만족', 'accent'], ['허용', 'sub'], ['불만', 'warn']];
    names.forEach(([n, tone], i) => {
      const x = 8 + i * 95;
      const fill = tone === 'accent' ? 'accentWeak' : tone === 'warn' ? 'warnWeak' : 'bg';
      o.push(rect(x, y + 26, 93, 34, { rx: 6, fill, stroke: tone === 'sub' ? 'line' : tone, sw: 1.3 }));
      o.push(label(x + 46.5, y + 48, n, tone === 'sub' ? 'text' : tone, 700));
    });
    bounds.forEach((b, i) => o.push(label(8 + (i + 1) * 95 - 1, y + 78, b, 'sub', 400)));
    const hx = 8 + hit * 95 + 46.5;
    o.push(g.path(`M${hx} ${y + 22} l-7 -10 h14 z`, { fill: 'text', stroke: 'none' }));
  };
  o.push(t13(292, 16, '▼ 3초 걸린 요청', { tone: 'text', weight: 700, anchor: 'end' }));
  row(44, '명세 권장 · T 4초', ['4초', '16초'], 0);
  row(146, 'New Relic 앱 서버 · T 0.5초', ['0.5초', '2초'], 2);
  return [300, 232, o];
};

// 불만 100건이 3초든 30초든 Apdex는 0.85, p99만 달라요
figs['ax-same'] = () => {
  const o = [];
  const X = (s) => 20 + s * 8.6;
  const row = (y, title, slow) => {
    o.push(t13(8, y, title, { weight: 700 }));
    o.push(line(X(0), y + 50, X(30), y + 50, { tone: 'line', sw: 1.4, cap: 'butt' }));
    [0, 10, 20, 30].forEach((s) => o.push(t13(X(s), y + 66, `${s}초`, { tone: 'sub', anchor: s === 0 ? 'start' : s === 30 ? 'end' : 'middle' })));
    o.push(rect(X(0), y + 14, 8, 36, { rx: 2, fill: 'accent', stroke: 'none' }));
    o.push(t13(X(0) + 14, y + 28, '900건 · 2초 안', { tone: 'accent', weight: 600 }));
    o.push(rect(X(slow) - 4, y + 34, 8, 16, { rx: 2, fill: 'warn', stroke: 'none' }));
    o.push(t13(X(slow) + (slow > 20 ? -8 : 8), y + 46, '100건', { tone: 'warn', weight: 700, anchor: slow > 20 ? 'end' : 'start' }));
  };
  row(16, '느린 요청이 3초', 3);
  row(104, '느린 요청이 30초', 30);
  const res = (y, k, a, b, same) => {
    o.push(t13(8, y, k, { tone: 'sub' }));
    o.push(t13(150, y, a, { weight: 700, tone: same ? 'accent' : 'warn', anchor: 'middle' }));
    o.push(t13(250, y, b, { weight: 700, tone: same ? 'accent' : 'warn', anchor: 'middle' }));
  };
  o.push(rect(4, 190, 292, 72, { rx: 8, fill: 'bg', stroke: 'line', sw: 1 }));
  o.push(t13(150, 210, '3초', { tone: 'sub', anchor: 'middle' }));
  o.push(t13(250, 210, '30초', { tone: 'sub', anchor: 'middle' }));
  res(232, 'Apdex', '0.85', '0.85', true);
  res(254, 'p99', '3초', '30초', false);
  return [300, 268, o];
};

// ── business-metrics ──

// HTTP 200이지만 본문은 거절: APM은 성공, 결제 지표는 실패
figs['bm-declined'] = () => {
  const o = [];
  const lanes = [{ x: 36, label: '사용자' }, { x: 150, label: '앱' }, { x: 264, label: '결제사' }];
  o.push(ladder(lanes, [
    { from: 0, to: 1, y: 50, label: '결제하기' },
    { from: 1, to: 2, y: 84, label: '결제 요청' },
    { from: 2, to: 1, y: 118, label: '200 OK', dashed: true, tone: 'sub' },
    { from: 1, to: 0, y: 166, label: '결제 실패 안내', dashed: true, tone: 'warn' },
  ], { top: 18, bottom: 180 }));
  o.push(rect(170, 126, 112, 22, { rx: 4, fill: 'warnWeak', stroke: 'warn', sw: 1.2 }));
  o.push(t13(178, 142, '본문: 결과 거절', { tone: 'warn', weight: 700 }));
  const card = (x, title, val, tone) => {
    o.push(rect(x, 198, 140, 56, { rx: 8, fill: tone === 'warn' ? 'warnWeak' : 'bg', stroke: tone === 'warn' ? 'warn' : 'line', sw: 1.3 }));
    o.push(t13(x + 10, 218, title, { tone: 'sub' }));
    o.push(t13(x + 10, 242, val, { weight: 700, tone: tone === 'warn' ? 'warn' : 'text' }));
  };
  card(4, 'APM', '성공한 호출 +1', 'plain');
  card(156, '결제 결과 지표', '결제 실패 +1', 'warn');
  return [300, 260, o];
};

// ── thread-pools ──

// 자바 표준 스레드 풀: 기본 스레드 → 대기열 → 추가 스레드 → 거부
figs['tp-java'] = () => {
  const o = [];
  const stage = (y, n, title, note, draw) => {
    o.push(g.badge(18, y + 14, n, { tone: n === 4 ? 'warn' : 'accent' }));
    o.push(t13(34, y + 19, title, { weight: 700, tone: n === 4 ? 'warn' : 'text' }));
    if (note) o.push(t13(292, y + 19, note, { tone: 'sub', anchor: 'end' }));
    draw(y);
  };
  stage(4, 1, '기본 스레드', 'core 수만큼', (y) => {
    for (let i = 0; i < 4; i++) o.push(g.thread(46 + i * 24, y + 30, 34, { tone: 'accent', amp: 3, waves: 2 }));
    o.push(t13(150, y + 54, '다 바쁘면 ↓', { tone: 'sub' }));
  });
  stage(78, 2, '대기열', '차례를 기다려요', (y) => {
    o.push(rect(34, y + 30, 200, 26, { rx: 6, fill: 'bg', stroke: 'sub', sw: 1.3 }));
    for (let i = 0; i < 8; i++) o.push(rect(40 + i * 24, y + 35, 18, 16, { rx: 3, fill: 'accentWeak', stroke: 'accent', sw: 1 }));
    o.push(t13(242, y + 48, '가득', { tone: 'sub' }));
    o.push(t13(150, y + 76, '가득 차면 ↓', { tone: 'sub' }));
  });
  stage(166, 3, '추가 스레드', 'max까지', (y) => {
    for (let i = 0; i < 4; i++) o.push(g.thread(46 + i * 24, y + 30, 34, { tone: 'accent', amp: 3, waves: 2 }));
    for (let i = 0; i < 3; i++) o.push(g.thread(142 + i * 24, y + 30, 34, { tone: 'sub', amp: 3, waves: 2 }));
    o.push(t13(214, y + 54, 'max도 차면 ↓', { tone: 'sub' }));
  });
  stage(240, 4, '거부', '새 작업을 받지 않아요', (y) => {
    o.push(xmark(46, y + 38, { r: 6 }));
  });
  return [300, 292, o];
};

// Tomcat 기본값: 스레드 200 → 받아 둔 연결 8,192 → OS 대기열 100 → 거절
figs['tp-tomcat'] = () => {
  const o = [];
  const room = (y, w, title, cap, tone, fill) => {
    const x = 150 - w / 2;
    o.push(rect(x, y, w, 44, { rx: 8, fill: tone === 'accent' ? 'accentWeak' : tone === 'warn' ? 'warnWeak' : 'card', stroke: tone, sw: 1.4 }));
    o.push(t13(x + 12, y + 19, title, { weight: 700, tone: tone === 'sub' ? 'text' : tone }));
    o.push(t13(x + 12, y + 36, cap, { tone: 'sub' }));
    if (fill) o.push(rect(x + w - 62, y + 14, 50, 16, { rx: 3, fill: tone === 'accent' ? 'accent' : 'sub', stroke: 'none', op: 0.85 }));
    if (fill) o.push(label(x + w - 37, y + 26.5, '가득', 'card', 700));
  };
  room(8, 200, '처리 중', '스레드 200개', 'accent', true);
  o.push(arrow([[150, 82], [150, 54]], { tone: 'sub', sw: 1.6, size: 6 }));
  o.push(t13(158, 72, '스레드를 기다려요', { tone: 'sub' }));
  room(84, 240, '받아 둔 연결', '8,192개까지', 'sub', true);
  o.push(arrow([[150, 158], [150, 130]], { tone: 'sub', sw: 1.6, size: 6 }));
  o.push(t13(158, 148, '자리가 나면', { tone: 'sub' }));
  room(160, 280, 'OS 대기열', '100개까지', 'sub', true);
  o.push(arrow([[150, 234], [150, 206]], { tone: 'sub', sw: 1.6, size: 6 }));
  room(236, 280, '그것도 차면', '새 연결은 거절되거나 끊겨요', 'warn', false);
  o.push(xmark(272, 258, { r: 6 }));
  return [300, 286, o];
};

// ── connection-pool ──

// 필요한 개수 = 빌리는 횟수 × 쥐는 시간
figs['cp-need'] = () => {
  const o = [];
  const pool = (y, title, formula, used, wait) => {
    o.push(t13(8, y, title, { weight: 700 }));
    o.push(t13(292, y, formula, { tone: 'sub', anchor: 'end' }));
    o.push(rect(8, y + 12, 172, 40, { rx: 8, fill: 'bg', stroke: 'sub', sw: 1.3 }));
    for (let i = 0; i < 10; i++) {
      const on = i < used;
      o.push(rect(14 + i * 16.4, y + 20, 13, 24, { rx: 3, fill: on ? 'accent' : 'card', stroke: on ? 'none' : 'line', sw: 1 }));
    }
    o.push(t13(94, y + 70, `풀 10개 중 ${Math.min(used, 10)}개 사용`, { tone: 'sub', anchor: 'middle' }));
    if (wait) {
      for (let i = 0; i < wait; i++) o.push(rect(190 + (i % 5) * 20, y + 14 + Math.floor(i / 5) * 20, 16, 16, { rx: 8, fill: 'warnWeak', stroke: 'warn', sw: 1.2 }));
      o.push(t13(240, y + 70, `${wait}개 몫이 기다려요`, { tone: 'warn', weight: 700, anchor: 'middle' }));
    } else {
      o.push(t13(240, y + 37, '안에 들어요', { tone: 'accent', weight: 700, anchor: 'middle' }));
    }
  };
  o.push(t13(8, 16, '초당 400번 빌리는 풀 · 최대 10개', { tone: 'sub' }));
  pool(44, '쥐는 시간 20ms', '400 × 0.02초 = 8개', 8, 0);
  pool(140, '쥐는 시간 50ms', '400 × 0.05초 = 20개', 10, 10);
  return [300, 222, o];
};

// 큰 풀은 DB 안에서, 작은 풀은 풀에서 기다려요
figs['cp-size'] = () => {
  const o = [];
  const panel = (y, title, inDb, inPool, note, tone) => {
    o.push(t13(8, y, title, { weight: 700 }));
    // 풀 앞에서 기다리는 스레드
    for (let i = 0; i < 6; i++) o.push(g.thread(16 + i * 14, y + 14, 34, { tone: inPool ? 'sub' : tone, amp: 2.5, waves: 2, sw: 1.6 }));
    o.push(t13(8, y + 64, inPool ? '풀에서 차례로' : '모두 DB로', { tone: inPool ? 'sub' : tone }));
    o.push(arrow([[96, y + 32], [124, y + 32]], { tone: 'sub', sw: 1.6, size: 6 }));
    o.push(rect(126, y + 8, 166, 50, { rx: 8, fill: tone === 'warn' ? 'warnWeak' : 'accentWeak', stroke: tone, sw: 1.4 }));
    o.push(t13(134, y + 24, 'DB · 코어 4개', { weight: 700, tone }));
    for (let i = 0; i < inDb; i++) o.push(rect(134 + (i % 12) * 12.5, y + 32 + Math.floor(i / 12) * 11, 10, 8, { rx: 2, fill: tone, stroke: 'none', op: 0.85 }));
    o.push(t13(126, y + 76, note, { tone, weight: 600 }));
  };
  panel(16, '큰 풀', 24, 0, '번갈아 처리하느라 느려져요', 'warn');
  panel(126, '작은 풀', 4, 6, '처리할 만큼만 받아요', 'accent');
  return [300, 216, o];
};

// ── cache ──

// cache-aside: 캐시에 없으면 DB에서 가져와 넣어 둬요
figs['ca-aside'] = () => {
  const o = [];
  const lanes = [{ x: 40, label: '앱' }, { x: 150, label: '캐시' }, { x: 260, label: 'DB' }];
  o.push(ladder(lanes, [
    { from: 0, to: 1, y: 48, label: '상품 42 있어요?' },
    { from: 1, to: 0, y: 78, label: '없어요(miss)', dashed: true, tone: 'warn' },
    { from: 0, to: 2, y: 108, label: '상품 42 조회', dx: 50 },
    { from: 2, to: 0, y: 138, label: '결과', dashed: true, dx: 50 },
    { from: 0, to: 1, y: 168, label: '저장(TTL 5분)', tone: 'accent' },
    { from: 0, to: 1, y: 222, label: '상품 42 있어요?' },
    { from: 1, to: 0, y: 252, label: '있어요(hit)', dashed: true, tone: 'accent' },
  ], { top: 18, bottom: 264 }));
  o.push(line(8, 188, 292, 188, { tone: 'line', sw: 1, dash: '3 3' }));
  o.push(t13(292, 206, '다음 같은 요청', { tone: 'sub', anchor: 'end' }));
  o.push(t13(292, 240, 'DB까지 안 가요', { tone: 'accent', weight: 600, anchor: 'end' }));
  return [300, 272, o];
};

// 앱 안의 캐시와 따로 띄운 캐시 서버
figs['ca-local-remote'] = () => {
  const o = [];
  const appBox = (x, y, inner) => {
    o.push(rect(x, y, 62, 66, { rx: 8, fill: 'card', stroke: 'sub', sw: 1.4 }));
    o.push(label(x + 31, y + 20, '앱 서버', 'text', 700));
    if (inner) {
      o.push(rect(x + 8, y + 32, 46, 24, { rx: 5, fill: 'accentWeak', stroke: 'accent', sw: 1.2 }));
      o.push(label(x + 31, y + 49, '캐시', 'accent', 700));
    }
  };
  o.push(t13(8, 16, '앱 안의 캐시', { weight: 700 }));
  appBox(8, 28, true);
  appBox(78, 28, true);
  o.push(t13(150, 46, '네트워크 없이', { tone: 'accent', weight: 600 }));
  o.push(t13(150, 64, '바로 읽어요', { tone: 'accent', weight: 600 }));
  o.push(t13(150, 88, '서버마다 따로,', { tone: 'sub' }));
  o.push(t13(150, 106, '다시 시작하면 비어요', { tone: 'sub' }));
  o.push(line(8, 124, 292, 124, { tone: 'line', sw: 1, dash: '3 3' }));
  o.push(t13(8, 148, '캐시 서버(Redis 등)', { weight: 700 }));
  appBox(8, 160, false);
  appBox(78, 160, false);
  o.push(rect(186, 168, 96, 50, { rx: 8, fill: 'accentWeak', stroke: 'accent', sw: 1.4 }));
  o.push(label(234, 190, '캐시 서버', 'accent', 700));
  o.push(label(234, 208, '함께 써요', 'sub', 400));
  o.push(arrow([[39, 226], [39, 240], [234, 240], [234, 220]], { tone: 'sub', sw: 1.5, size: 6, start: true }));
  o.push(arrow([[140, 193], [184, 193]], { tone: 'sub', sw: 1.5, size: 6, start: true }));
  o.push(t13(8, 268, '네트워크를 한 번 오가지만, 다시 시작해도 남아요', { tone: 'sub' }));
  return [300, 276, o];
};


// ── circuit-breaker ──

// 서킷 브레이커의 세 상태: 닫힘 → 열림 → 반열림 → 닫힘·열림
figs['cb-states'] = () => {
  const o = [];
  // 스위치 그림: 닫힘은 이어지고, 열림은 끊겨요
  const sw = (cx, cy, mode, tone) => {
    o.push(g.circle(cx - 14, cy, 3, { fill: tone }));
    o.push(g.circle(cx + 14, cy, 3, { fill: tone }));
    if (mode === 'closed') o.push(line(cx - 14, cy, cx + 14, cy, { tone, sw: 2.4 }));
    if (mode === 'open') o.push(line(cx - 14, cy, cx + 10, cy - 12, { tone, sw: 2.4 }));
    if (mode === 'half') o.push(line(cx - 14, cy, cx + 13, cy - 5, { tone, sw: 2.4, dash: '3 2' }));
  };
  const state = (x, y, title, l1, l2, mode, tone) => {
    const fill = tone === 'accent' ? 'accentWeak' : tone === 'warn' ? 'warnWeak' : 'card';
    o.push(rect(x, y, 100, 76, { rx: 12, fill, stroke: tone, sw: 1.6 }));
    sw(x + 50, y + 18, mode, tone);
    o.push(label(x + 50, y + 42, title, tone === 'sub' ? 'text' : tone, 700));
    o.push(label(x + 50, y + 58, l1, 'sub', 400));
    o.push(label(x + 50, y + 72, l2, 'sub', 400));
  };
  state(6, 62, '닫힘', '호출하며', '실패율을 세요', 'closed', 'accent');
  state(194, 62, '열림', '부르지 않고', '바로 실패', 'open', 'warn');
  state(100, 190, '반열림', '몇 개만', '시험해요', 'half', 'sub');
  o.push(arrow([[106, 88], [192, 88]], { tone: 'warn', sw: 2, size: 7 }));
  o.push(t13(150, 30, '실패율이', { tone: 'warn', weight: 600, anchor: 'middle' }));
  o.push(t13(150, 48, '기준을 넘으면', { tone: 'warn', weight: 600, anchor: 'middle' }));
  o.push(arrow([[226, 140], [184, 188]], { tone: 'sub', sw: 1.8, size: 7 }));
  o.push(t13(212, 176, '기다린 뒤', { tone: 'sub' }));
  o.push(arrow([[202, 222], [262, 222], [262, 142]], { tone: 'warn', sw: 1.8, size: 7 }));
  o.push(t13(270, 250, '시험 실패', { tone: 'warn', weight: 600, anchor: 'end' }));
  o.push(arrow([[98, 222], [38, 222], [38, 142]], { tone: 'accent', sw: 1.8, size: 7 }));
  o.push(t13(30, 250, '시험 성공', { tone: 'accent', weight: 600 }));
  return [300, 274, o];
};

// ── cascading-failure ──

// 결제 API가 느려지면 스레드가 모두 결제 응답을 기다려요
figs['cf-threads'] = () => {
  const o = [];
  const slot = (x, y, kind) => {
    const st = { work: ['accentWeak', 'accent'], idle: ['none', 'line'], wait: ['warnWeak', 'warn'] }[kind];
    o.push(rect(x, y, 30, 44, { rx: 6, fill: st[0], stroke: st[1], sw: 1.3, dash: kind === 'idle' ? '4 3' : undefined }));
    if (kind !== 'idle') o.push(g.thread(x + 15, y + 6, 32, { tone: kind === 'work' ? 'accent' : 'warn', amp: 2.5, waves: 2, sw: 1.6 }));
  };
  o.push(t13(8, 16, '평소', { weight: 700 }));
  for (let i = 0; i < 8; i++) slot(8 + i * 35, 26, i < 3 ? 'work' : 'idle');
  o.push(brace(113, 288, 76));
  o.push(t13(200, 100, '빈 스레드 5개', { tone: 'sub', anchor: 'middle' }));
  o.push(t13(8, 136, '결제 API가 느릴 때', { weight: 700, tone: 'warn' }));
  for (let i = 0; i < 8; i++) slot(8 + i * 35, 146, 'wait');
  o.push(t13(8, 212, '8개 모두 결제 응답을 기다려요', { tone: 'warn', weight: 600 }));
  o.push(rect(8, 226, 82, 26, { rx: 6, fill: 'card', stroke: 'sub', sw: 1.3 }));
  o.push(label(49, 244, '다른 요청', 'text', 700));
  o.push(arrow([[92, 239], [118, 239]], { tone: 'sub', sw: 1.6, size: 6, end: false }));
  o.push(xmark(126, 239, { r: 6 }));
  o.push(t13(140, 244, '쓸 스레드가 없어요', { tone: 'sub' }));
  return [300, 260, o];
};

// 무너지는 동안은 건강한 서버가 10%뿐이라 받아 낼 양도 줄어요
figs['cf-capacity'] = () => {
  const o = [];
  const X = (n) => 84 + (n / 11000) * 180;
  const panel = (y, title, healthy, cap, ok) => {
    o.push(t13(8, y, title, { weight: 700 }));
    for (let i = 0; i < 10; i++) {
      const good = i < healthy;
      o.push(rect(8 + i * 22, y + 12, 16, 22, { rx: 3, fill: good ? 'accentWeak' : 'warnWeak', stroke: good ? 'accent' : 'warn', sw: 1.2 }));
      if (!good) o.push(xmark(16 + i * 22, y + 23, { r: 4, sw: 2 }));
    }
    o.push(t13(232, y + 28, `건강 ${healthy * 10}%`, { tone: ok ? 'accent' : 'warn', weight: 700 }));
    // 받아 낼 수 있는 양과 들어오는 양
    o.push(t13(8, y + 57, '받아 낼 양', { tone: 'sub' }));
    o.push(rect(X(0), y + 46, X(cap) - X(0), 14, { rx: 3, fill: ok ? 'accent' : 'warn', stroke: 'none', op: 0.85 }));
    o.push(t13(X(cap) + 6, y + 57, cap.toLocaleString('en-US'), { tone: ok ? 'accent' : 'warn', weight: 700 }));
    o.push(t13(8, y + 77, '들어오는 양', { tone: 'sub' }));
    o.push(rect(X(0), y + 66, X(9000) - X(0), 14, { rx: 3, fill: 'sub', stroke: 'none', op: 0.5 }));
    o.push(t13(X(9000) + 6, y + 77, '9,000', { tone: 'sub', weight: 700 }));
    o.push(t13(8, y + 100, ok ? '초당 9,000건이면 버텨요' : '9,000건으로 줄여도 살아나지 않아요', { tone: ok ? 'accent' : 'warn', weight: 700 }));
  };
  panel(16, '멀쩡할 때', 10, 10000, true);
  panel(146, '무너지는 동안', 1, 1000, false);
  o.push(t13(8, 268, '초당 1,000건 정도로 크게 줄여야 안정돼요', { tone: 'sub' }));
  return [300, 276, o];
};

// ── api-gateway ──

// 모바일 앱과 웹이 게이트웨이 하나로, 게이트웨이가 경로대로 나눠요
figs['gw-route'] = () => {
  const o = [];
  o.push(g.phone(90, 26));
  o.push(label(90, 58, '모바일 앱', 'text', 700));
  o.push(g.laptop(210, 26));
  o.push(label(210, 58, '웹', 'text', 700));
  o.push(arrow([[96, 64], [136, 92]], { tone: 'sub', sw: 1.8, size: 7 }));
  o.push(arrow([[204, 64], [164, 92]], { tone: 'sub', sw: 1.8, size: 7 }));
  o.push(box(82, 94, 136, 44, 'API 게이트웨이', '인증·제한·경로', { tone: 'accent' }));
  const svc = [[50, '주문', '/orders'], [150, '회원', '/users'], [250, '결제', '/payments']];
  svc.forEach(([cx, n, p]) => {
    o.push(arrow([[150 + (cx - 150) * 0.3, 138], [cx, 196]], { tone: 'accent', sw: 1.8, size: 7 }));
    const lx = cx === 150 ? 156 : cx < 150 ? 86 : 218;
    o.push(mono(lx, cx === 150 ? 172 : 164, p, { tone: 'accent', weight: 700, anchor: cx < 150 ? 'end' : 'start' }));
    o.push(box(cx - 44, 198, 88, 36, `${n} 서비스`, null, { tone: 'plain' }));
  });
  return [300, 242, o];
};

// 게이트웨이가 요청 하나를 처리하는 순서: 걸리면 뒤쪽에 닿지 않아요
figs['gw-pipeline'] = () => {
  const o = [];
  const steps = [
    ['경로 찾기', '/orders → 주문', [['맞는 경로 없음', '404']]],
    ['인증 확인', 'API 키, 토큰', [['없거나 틀림', '401·403']]],
    ['호출 제한', '키마다 한도', [['한도를 넘음', '429']]],
    ['뒤쪽으로 전달', '정한 시간까지', [['시간을 넘김', '504'], ['연결 실패', '502·503']]],
  ];
  let y = 8;
  steps.forEach(([n, note, exits], i) => {
    o.push(rect(8, y, 120, 44, { rx: 8, fill: 'card', stroke: 'sub', sw: 1.4 }));
    o.push(t13(18, y + 19, n, { weight: 700 }));
    o.push(t13(18, y + 36, note, { tone: 'sub' }));
    exits.forEach(([w, code], k) => {
      const ey = y + 14 + k * 22;
      o.push(arrow([[128, ey], [148, ey]], { tone: 'warn', sw: 1.5, size: 6 }));
      o.push(t13(152, ey + 4.5, w, { tone: 'sub' }));
      o.push(tag(292, ey, code, { tone: 'warnSoft', anchor: 'end' }));
    });
    const h = exits.length > 1 ? 58 : 44;
    o.push(arrow([[40, y + 44], [40, y + h + 14]], { tone: 'accent', sw: 1.8, size: 6 }));
    if (i === 0) o.push(t13(48, y + 58, '통과', { tone: 'accent', weight: 600 }));
    y += h + 14;
  });
  o.push(box(8, y, 120, 40, '응답 돌려주기', null, { tone: 'accent' }));
  o.push(t13(8, y + 66, '앞에서 걸린 요청은 뒤쪽 서비스에 닿지 않아요', { tone: 'sub' }));
  return [300, y + 74, o];
};

// 초당 5개 제한: 토큰 5개를 쓴 요청만 통과, 나머지는 바로 429
figs['gw-ratelimit'] = () => {
  const o = [];
  o.push(t13(8, 16, '한꺼번에 보낸 요청 10개', { weight: 700 }));
  for (let i = 0; i < 10; i++) {
    const x = 8 + i * 28.6;
    const pass = i < 5;
    o.push(rect(x, 28, 24, 26, { rx: 6, fill: pass ? 'accentWeak' : 'warnWeak', stroke: pass ? 'accent' : 'warn', sw: 1.3 }));
    o.push(label(x + 12, 46, String(i + 1), pass ? 'accent' : 'warn', 700));
  }
  // 토큰 통
  o.push(g.path('M20 84 v46 q0 8 8 8 h96 q8 0 8 -8 v-46', { stroke: 'sub', sw: 2 }));
  for (let i = 0; i < 5; i++) {
    o.push(g.circle(38 + i * 19, 122, 8, { fill: 'accent' }));
  }
  o.push(t13(76, 156, '토큰 5개(초당 5개)', { tone: 'accent', weight: 600, anchor: 'middle' }));
  o.push(arrow([[76, 58], [76, 80]], { tone: 'accent', sw: 1.6, size: 6 }));
  o.push(t13(84, 74, '1~5번이 하나씩 써요', { tone: 'accent' }));
  o.push(arrow([[226, 58], [226, 84]], { tone: 'warn', sw: 1.6, size: 6 }));
  o.push(tag(226, 100, '429 · 0ms', { tone: 'warn' }));
  o.push(t13(226, 128, '6~10번은', { tone: 'warn', anchor: 'middle' }));
  o.push(t13(226, 146, '토큰이 없어요', { tone: 'warn', anchor: 'middle' }));
  o.push(line(8, 172, 292, 172, { tone: 'line', sw: 1, dash: '3 3' }));
  o.push(spans(8, 196, [['뒤쪽 서비스가 받은 요청: ', 'sub'], ['5번', 'accent', 700]]));
  return [300, 204, o];
};

// 로드 밸런서, API 게이트웨이, 서비스 메시가 맡는 곳
figs['gw-layers'] = () => {
  const o = [];
  const role = (y, t1, t2) => {
    o.push(t13(178, y, t1, { weight: 700 }));
    o.push(t13(178, y + 17, t2, { tone: 'sub' }));
  };
  o.push(g.laptop(84, 20));
  o.push(label(84, 48, '클라이언트', 'text', 600));
  o.push(arrow([[84, 54], [84, 70]], { tone: 'sub', sw: 1.6, size: 6 }));
  o.push(g.lb(84, 86));
  role(84, '로드 밸런서', '연결을 나눠요');
  o.push(arrow([[84, 100], [84, 120]], { tone: 'sub', sw: 1.6, size: 6 }));
  o.push(box(24, 122, 120, 38, 'API 게이트웨이', null, { tone: 'accent' }));
  role(138, '경로·키·한도', '규칙을 걸어요');
  o.push(arrow([[60, 160], [60, 186]], { tone: 'accent', sw: 1.8, size: 6 }));
  o.push(box(8, 188, 104, 38, '주문 서비스', null, { tone: 'plain' }));
  o.push(box(188, 188, 104, 38, '결제 서비스', null, { tone: 'plain' }));
  o.push(arrow([[112, 207], [186, 207]], { tone: 'sub', sw: 1.6, size: 6, dash: '4 3' }));
  o.push(t13(150, 246, '서비스 메시: 안쪽 서비스끼리', { tone: 'sub', anchor: 'middle' }));
  o.push(t13(150, 200, '메시', { tone: 'sub', anchor: 'middle' }));
  return [300, 254, o];
};

// ── grpc-graphql-websocket ──

// gRPC 호출 한 번: HTTP 상태는 200, 결과는 트레일러에
figs['gq-grpc'] = () => {
  const o = [];
  const lanes = [{ x: 40, label: '클라이언트' }, { x: 262, label: '서버' }];
  o.push(ladder(lanes, [
    { from: 0, to: 1, y: 48, label: 'POST /shop.Orders/Get' },
    { from: 0, to: 1, y: 82, label: '요청 메시지' },
    { from: 1, to: 0, y: 124, label: ':status 200', dashed: true, tone: 'sub' },
    { from: 1, to: 0, y: 158, label: '응답 메시지(있으면)', dashed: true, tone: 'sub' },
    { from: 1, to: 0, y: 200, label: '트레일러 grpc-status: 5', dashed: true, tone: 'warn' },
  ], { top: 18, bottom: 214 }));
  o.push(t13(150, 238, 'HTTP는 성공이어도 결과는 트레일러에', { tone: 'warn', weight: 700, anchor: 'middle' }));
  return [300, 246, o];
};

// grpc-status를 서버 쪽에서 나누기
figs['gq-status'] = () => {
  const o = [];
  const row = (y, code, name, note, tone) => {
    o.push(tag(28, y, code, { tone: tone === 'warn' ? 'warnSoft' : tone === 'accent' ? 'soft' : 'sub' }));
    o.push(mono(52, y + 4.5, name, { weight: 600, tone: tone === 'warn' ? 'warn' : tone === 'accent' ? 'accent' : 'text' }));
    if (note) o.push(t13(292, y + 4.5, note, { tone: 'sub', anchor: 'end' }));
  };
  row(18, '0', 'OK', '', 'accent');
  o.push(rect(4, 36, 292, 152, { rx: 10, fill: 'warnWeak', stroke: 'warn', sw: 1.2 }));
  o.push(t13(14, 56, '서버 쪽 에러로 쳐요', { weight: 700, tone: 'warn' }));
  [['2', 'UNKNOWN', '처리 안 된 예외'], ['4', 'DEADLINE_EXCEEDED', ''], ['12', 'UNIMPLEMENTED', ''], ['13', 'INTERNAL', ''], ['14', 'UNAVAILABLE', '닿지 못함'], ['15', 'DATA_LOSS', '']].forEach(([c, n, note], i) => row(76 + i * 20, c, n, note, 'warn'));
  o.push(rect(4, 196, 292, 112, { rx: 10, fill: 'bg', stroke: 'line', sw: 1.2 }));
  o.push(t13(14, 216, '부른 쪽 문제로 봐요', { weight: 700 }));
  o.push(t13(286, 216, '예시', { tone: 'sub', anchor: 'end' }));
  [['3', 'INVALID_ARGUMENT'], ['5', 'NOT_FOUND'], ['7', 'PERMISSION_DENIED'], ['16', 'UNAUTHENTICATED']].forEach(([c, n], i) => row(236 + i * 20, c, n, '', 'sub'));
  return [300, 312, o];
};

// WebSocket 연결 하나: HTTP 응답은 처음의 101 하나뿐
figs['gq-ws'] = () => {
  const o = [];
  const lanes = [{ x: 40, label: '클라이언트' }, { x: 262, label: '서버' }];
  o.push(ladder(lanes, [
    { from: 0, to: 1, y: 48, label: 'GET /live (Upgrade)' },
    { from: 1, to: 0, y: 82, label: '101 Switching Protocols', dashed: true, tone: 'sub' },
    { from: 1, to: 0, y: 146, label: '메시지', tone: 'accent' },
    { from: 1, to: 0, y: 168, label: '', tone: 'accent' },
    { from: 0, to: 1, y: 190, label: '', tone: 'accent' },
    { from: 0, to: 1, y: 228, label: '닫힘 1000' },
    { from: 1, to: 0, y: 262, label: '닫힘 1000', dashed: true, tone: 'sub' },
  ], { top: 18, bottom: 274 }));
  o.push(line(8, 100, 292, 100, { tone: 'line', sw: 1, dash: '3 3' }));
  o.push(t13(150, 118, '여기부터 HTTP 응답 없이 메시지만', { tone: 'sub', anchor: 'middle' }));
  return [300, 282, o];
};

// 세 방식을 한 대시보드에: 줄마다 실패가 적히는 곳을 따로
figs['gq-dashboard'] = () => {
  const o = [];
  const rows = [
    ['gRPC', '메서드별', [['호출 수', ''], ['상태 코드별', '비율'], ['단발 호출', 'p99']], 1],
    ['GraphQL', 'operation별', [['호출 수', ''], ['errors 있는', '응답'], ['필드별', '시간']], 1],
    ['WebSocket', '', [['열린 연결 수', ''], ['초당 메시지', ''], ['닫힘 코드별', '수']], 2],
  ];
  o.push(rect(4, 4, 292, 274, { rx: 10, fill: 'bg', stroke: 'line', sw: 1.2 }));
  rows.forEach(([n, note, tiles, fail], r) => {
    const y = 12 + r * 88;
    o.push(t13(14, y + 16, n, { weight: 700 }));
    if (note) o.push(t13(14 + g.textWidth(n, 13, 700) + 8, y + 16, note, { tone: 'sub' }));
    tiles.forEach(([a, b], c) => {
      const x = 12 + c * 94;
      o.push(rect(x, y + 24, 88, 56, { rx: 6, fill: 'card', stroke: 'line', sw: 1 }));
      o.push(t13(x + 8, y + 42, a, { weight: 600 }));
      if (b) o.push(t13(x + 8, y + 58, b, { weight: 600 }));
      o.push(g.path(`M${x + 8} ${y + 74} l14 -6 l14 3 l14 -8 l14 4 l14 -5`, { stroke: c === fail ? 'warn' : 'accent', sw: 1.6 }));
    });
  });
  return [300, 282, o];
};


// ── jvm-memory ──

// JVM 프로세스 메모리 = 힙 + 메타스페이스 + 스레드 스택 + 그 밖의 네이티브
figs['jm-process'] = () => {
  const o = [];
  const x = 8;
  const w = 112;
  const parts = [
    [16, 100, '힙', ['객체가 담기는 곳', '최대 크기 -Xmx'], 'accent'],
    [124, 42, '메타스페이스', ['클래스 정보 · 기본 제한 없음'], 'plain'],
    [174, 42, '스레드 스택', ['스레드마다 하나 · -Xss'], 'plain'],
    [224, 42, '그 밖의 네이티브', ['JVM 자체, 직접 버퍼 등'], 'plain'],
  ];
  parts.forEach(([y, h, n, notes, tone], i) => {
    o.push(rect(x, y, w, h, { rx: i === 0 ? 8 : 4, fill: tone === 'accent' ? 'accentWeak' : 'card', stroke: tone === 'accent' ? 'accent' : 'sub', sw: 1.4 }));
    if (i === 0) for (let k = 0; k < 9; k++) o.push(g.circle(x + 22 + (k % 3) * 34, y + 24 + Math.floor(k / 3) * 26, 7, { fill: 'accent' }));
    if (i === 2) for (let k = 1; k < 5; k++) o.push(line(x + k * (w / 5), y + 4, x + k * (w / 5), y + h - 4, { tone: 'line', sw: 1.4 }));
    o.push(t13(132, y + 18, n, { weight: 700, tone: tone === 'accent' ? 'accent' : 'text' }));
    notes.forEach((t, k) => o.push(t13(132, y + 36 + k * 18, t, { tone: 'sub' })));
  });
  o.push(t13(8, 290, '이 모두를 더한 만큼 서버 메모리를 써요', { tone: 'sub' }));
  return [300, 298, o];
};

// young에 담긴 새 객체: 안 쓰면 치우고, 살아남으면 old로
figs['jm-gen'] = () => {
  const o = [];
  o.push(t13(8, 16, '새 객체', { weight: 700 }));
  [74, 92, 110].forEach((x) => o.push(g.circle(x, 12, 6, { fill: 'accent' })));
  o.push(arrow([[60, 24], [60, 46]], { tone: 'accent', sw: 1.8, size: 6 }));
  o.push(zone(8, 48, 124, 110, 'young', { tone: 'accent', dash: null, labelTone: 'accent', fill: 'accentWeak' }));
  o.push(zone(168, 48, 124, 110, 'old', { tone: 'sub', dash: null, labelTone: 'text', fill: 'card' }));
  const objs = [[36, 92, 1], [70, 92, 0], [104, 92, 0], [36, 128, 0], [70, 128, 1], [104, 128, 0]];
  objs.forEach(([cx, cy, live]) => {
    if (live) o.push(g.circle(cx, cy, 9, { fill: 'accent' }));
    else {
      o.push(`<circle cx="${cx}" cy="${cy}" r="9" stroke-width="1.4" stroke-dasharray="3 2" style="fill:none;stroke:${g.color('weak')}" />`);
      o.push(xmark(cx, cy, { r: 4, sw: 1.8, tone: 'weak' }));
    }
  });
  [[200, 92], [236, 92], [270, 92], [200, 128], [236, 128]].forEach(([cx, cy], i) => {
    if (i === 4) {
      o.push(`<circle cx="${cx}" cy="${cy}" r="9" stroke-width="1.4" stroke-dasharray="3 2" style="fill:none;stroke:${g.color('weak')}" />`);
      o.push(xmark(cx, cy, { r: 4, sw: 1.8, tone: 'weak' }));
    } else o.push(g.circle(cx, cy, 9, { fill: 'sub' }));
  });
  o.push(arrow([[132, 104], [166, 104]], { tone: 'accent', sw: 1.8, size: 7 }));
  o.push(t13(150, 182, '살아남으면 old로 옮겨요', { tone: 'accent', weight: 600, anchor: 'middle' }));
  o.push(g.trash(28, 218));
  o.push(t13(48, 214, '안 쓰는 객체는', { tone: 'sub' }));
  o.push(t13(48, 232, 'young에서도 old에서도 GC가 치워요', { tone: 'sub' }));
  return [300, 242, o];
};

// ── gc-logs ──

// 산 객체를 옮길 빈 영역이 없으면 Evacuation Failure
figs['gl-evac'] = () => {
  const o = [];
  const row = (y, title, kinds, warnRow) => {
    o.push(t13(8, y, title, { weight: 700, tone: warnRow ? 'warn' : 'text' }));
    kinds.forEach((k, i) => {
      const x = 8 + i * 48;
      const st = { clean: [warnRow ? 'warnWeak' : 'accentWeak', warnRow ? 'warn' : 'accent'], used: ['card', 'sub'], free: ['none', 'weak'] }[k];
      o.push(rect(x, y + 10, 42, 42, { rx: 6, fill: st[0], stroke: st[1], sw: 1.4, dash: k === 'free' ? '4 3' : undefined }));
      if (k !== 'free') for (let d = 0; d < 4; d++) o.push(g.circle(x + 12 + (d % 2) * 18, y + 22 + Math.floor(d / 2) * 18, 5, { fill: k === 'clean' ? (d % 2 ? (warnRow ? 'warn' : 'accent') : 'weak') : 'sub' }));
      o.push(label(x + 21, y + 70, { clean: '치울', used: '사용', free: '빔' }[k], k === 'clean' ? (warnRow ? 'warn' : 'accent') : 'sub', 600));
    });
  };
  row(34, '평소', ['clean', 'clean', 'used', 'used', 'free', 'free'], false);
  o.push(g.path('M50 42 C 90 22, 190 22, 222 40', { stroke: 'accent', sw: 1.8 }));
  o.push(g.head(224, 43, 218, 34, { tone: 'accent', size: 7 }));
  o.push(t13(150, 14, '산 객체를 빈 영역으로', { tone: 'accent', weight: 600, anchor: 'middle' }));
  row(150, '거의 찼을 때 · 126M/128M', ['clean', 'clean', 'used', 'used', 'used', 'used'], true);
  o.push(t13(8, 246, '옮길 빈 영역이 없어요 → Evacuation Failure', { tone: 'warn', weight: 700 }));
  return [300, 254, o];
};

// 작은 컨테이너에서는 G1이 아니라 Serial
figs['gl-gc-choice'] = () => {
  const o = [];
  const card = (x, mem, gc, l1, l2, tone) => {
    o.push(rect(x, 8, 140, 182, { rx: 10, fill: 'card', stroke: 'line', sw: 1.3 }));
    o.push(t13(x + 12, 30, '컨테이너', { tone: 'sub' }));
    o.push(t13(x + 12, 50, 'CPU 2개', { weight: 700 }));
    o.push(t13(x + 12, 70, `메모리 ${mem}`, { weight: 700, tone }));
    o.push(rect(x + 8, 84, 124, 26, { rx: 4, fill: 'bg', stroke: 'line', sw: 1 }));
    o.push(mono(x + 16, 102, `Using ${gc}`, { weight: 700, tone }));
    o.push(t13(x + 12, 136, '수집하는 동안', { tone: 'sub' }));
    o.push(t13(x + 12, 156, l1, { weight: 600 }));
    if (l2) o.push(t13(x + 12, 174, l2, { weight: 600 }));
  };
  card(4, '1791MB', 'Serial', '앱 스레드를', '모두 멈춰요', 'warn');
  card(156, '1792MB', 'G1', 'young·mixed만 멈춰요', '표시는 앱과 함께', 'accent');
  o.push(t13(150, 214, '메모리 1MB 차이로 GC가 달라져요', { tone: 'sub', anchor: 'middle' }));
  return [300, 222, o];
};

// ── gc-pause ──

// GC 멈춤이 풀린 순간 함께 끝나 분포도에 세로줄
figs['gp-stop'] = () => {
  const o = [];
  const X = (t) => 64 + t * 110;
  const { bot } = dotFigure(o, {
    tMax: 2,
    X,
    lanes: [['앱 스레드', 0.6, 1.8, 'lock', 'GC 멈춤 1.2초'], ['요청 A', 0.45, 1.85, 'accent', '1.4초'], ['요청 B', 0.55, 1.88, 'accent', '1.3초'], ['요청 C', 0.9, 1.9, 'accent', '1.0초'], ['요청 D', 1.85, 1.95, 'accent', '']],
    yMax: 1.5,
    yTicks: [0.5, 1, 1.5],
    dots: [[1, 1.85, 1.4], [2, 1.88, 1.33], [3, 1.9, 1.0], [4, 1.95, 0.1]],
    axisTicks: [0, 1, 2],
  });
  o.push(t13(X(1.85) - 10, bot - 44, '세로줄', { tone: 'accent', weight: 700, anchor: 'end' }));
  o.push(t13(8, bot + 40, '멈춤에 걸친 요청이 풀린 직후 함께 끝나요', { tone: 'sub' }));
  return [300, bot + 48, o];
};

// G1과 ZGC의 멈춤
figs['gp-compare'] = () => {
  const o = [];
  const lane = (y, title, note, pauses, goal, real) => {
    o.push(t13(8, y, title, { weight: 700 }));
    o.push(t13(292, y, note, { tone: 'sub', anchor: 'end' }));
    o.push(rect(8, y + 10, 284, 22, { rx: 4, fill: 'accentWeak', stroke: 'none' }));
    pauses.forEach(([at, w]) => o.push(rect(8 + at, y + 8, w, 26, { rx: 2, fill: 'warn', stroke: 'none' })));
    o.push(t13(8, y + 54, '멈춤 목표', { tone: 'sub' }));
    o.push(t13(80, y + 54, goal, { weight: 700 }));
    o.push(t13(8, y + 74, '실제 멈춤', { tone: 'sub' }));
    o.push(t13(80, y + 74, real, { weight: 700, tone: 'warn' }));
  };
  lane(16, 'G1', '1792MB 이상이면 기본', [[40, 6], [120, 12], [210, 34]], '200ms · 보장은 아님', '밀리초에서 초 단위');
  lane(124, 'ZGC', '직접 골라요', [[40, 1.5], [120, 1.5], [210, 1.5]], '1ms 넘지 않기', '마이크로초 단위');
  o.push(rect(232, 212, 12, 12, { rx: 2, fill: 'warn', stroke: 'none' }));
  o.push(t13(250, 222, '멈춤', { tone: 'sub' }));
  return [300, 230, o];
};

// GC 한 주기: 응답시간에 더해지는 건 앱을 세운 멈춤뿐
figs['gp-cycle'] = () => {
  const o = [];
  const X = (t) => 80 + t * 0.21;
  const seg = (y, a, b, kind, txt) => {
    const st = { pause: ['warn', 'none'], conc: ['bg', 'sub'], work: ['accentWeak', 'accent'] }[kind];
    o.push(rect(X(a), y, X(b) - X(a), 24, { rx: 3, fill: st[0], stroke: st[1], sw: 1.2 }));
    if (txt) o.push(label((X(a) + X(b)) / 2, y + 16.5, txt, kind === 'conc' ? 'sub' : 'accent', 600));
  };
  o.push(t13(8, 52, 'GC', { tone: 'sub', weight: 600 }));
  seg(36, 100, 140, 'pause');
  seg(36, 200, 760, 'conc', '앱과 함께 표시');
  seg(36, 760, 800, 'pause');
  seg(36, 860, 890, 'pause');
  o.push(t13(8, 94, '앱 스레드', { tone: 'sub', weight: 600 }));
  seg(78, 0, 100, 'work');
  seg(78, 140, 760, 'work', '일해요');
  seg(78, 800, 860, 'work');
  seg(78, 890, 1000, 'work');
  [[100, 140], [760, 800], [860, 890]].forEach(([a, b]) => {
    o.push(line(X((a + b) / 2), 62, X((a + b) / 2), 76, { tone: 'warn', sw: 1.2, dash: '2 2' }));
  });
  o.push(tag(X(120), 18, '멈춤', { tone: 'warn' }));
  o.push(tag(X(820), 18, '멈춤 두 번', { tone: 'warn' }));
  o.push(t13(8, 136, '앱 스레드가 비는 곳은 멈춤뿐이라', { tone: 'sub' }));
  o.push(t13(8, 156, '응답시간에는 멈춤만 더해져요', { weight: 700, tone: 'warn' }));
  return [300, 166, o];
};

// ── memory-growing ──

// 컨테이너 한도 2Gi: 최대 힙은 25%인 512Mi, 나머지 자리에 힙 밖 메모리
figs['mg-limit'] = () => {
  const o = [];
  const X = (mi) => 8 + (mi / 2400) * 280;
  o.push(t13(8, 16, '컨테이너 메모리 한도 2Gi · -Xmx 없음', { weight: 700 }));
  o.push(rect(X(0), 30, X(2048) - X(0), 36, { rx: 5, fill: 'bg', stroke: 'sub', sw: 1.3 }));
  o.push(rect(X(0), 30, X(512) - X(0), 36, { rx: 5, fill: 'accent', stroke: 'none' }));
  o.push(label((X(0) + X(512)) / 2, 53, '최대 힙', 'card', 700));
  o.push(rect(X(512), 30, X(2048) - X(512), 36, { rx: 0, fill: 'sub', stroke: 'none', op: 0.25 }));
  o.push(label((X(512) + X(2048)) / 2, 53, '힙 밖 메모리도 여기에', 'text', 600));
  o.push(rect(X(2048), 30, X(2300) - X(2048), 36, { rx: 0, fill: 'warn', stroke: 'none', op: 0.85 }));
  o.push(line(X(2048), 22, X(2048), 74, { tone: 'warn', sw: 2.4, cap: 'butt' }));
  [[0, '0'], [512, '512Mi'], [2048, '2Gi']].forEach(([v, t]) => o.push(t13(X(v), 92, t, { tone: v === 2048 ? 'warn' : 'sub', anchor: v === 0 ? 'start' : 'middle', weight: v === 2048 ? 700 : 400 })));
  o.push(brace(X(0), X(512), 104, 'accent'));
  o.push(t13(X(0), 128, '한도의 25%', { tone: 'accent', weight: 700 }));
  o.push(t13(X(2300), 128, '넘으면 OOMKilled', { tone: 'warn', weight: 700, anchor: 'end' }));
  o.push(t13(8, 158, '힙과 힙 밖을 더한 크기가 한도를 넘으면 끝나요', { tone: 'sub' }));
  return [300, 166, o];
};

// ── thread-dumps ──

// 덤프의 스택: 맨 위가 지금 멈춘 곳, 아래가 부른 곳
figs['td-stack'] = () => {
  const o = [];
  o.push(mono(8, 16, '"http-nio-8080-exec-12"', { weight: 700 }));
  o.push(tag(292, 12, 'BLOCKED', { tone: 'warnSoft', anchor: 'end' }));
  const frame = (y, cls, m, ln, note, tone) => {
    o.push(rect(8, y, 284, 52, { rx: 8, fill: tone === 'warn' ? 'warnWeak' : tone === 'weak' ? 'none' : 'card', stroke: tone === 'warn' ? 'warn' : tone === 'weak' ? 'weak' : 'sub', sw: 1.4, dash: tone === 'weak' ? '4 3' : undefined }));
    o.push(spans(18, y + 21, [[cls, tone === 'weak' ? 'weak' : 'text', 700], [`.${m}`, tone === 'warn' ? 'warn' : tone === 'weak' ? 'weak' : 'accent', 700]], { mono: true }));
    o.push(t13(282, y + 21, ln, { tone: tone === 'warn' ? 'warn' : 'sub', anchor: 'end', weight: 600 }));
    o.push(t13(18, y + 41, note, { tone: tone === 'warn' ? 'warn' : 'sub' }));
  };
  frame(30, 'OrderService', 'reserve', '88번째 줄', '맨 위 · 지금 여기서 잠금을 기다려요', 'warn');
  o.push(g.lock(270, 70, { tone: 'warn' }));
  o.push(arrow([[40, 140], [40, 86]], { tone: 'sub', sw: 1.8, size: 7 }));
  o.push(t13(50, 118, '불렀어요', { tone: 'sub' }));
  frame(142, 'OrderController', 'create', '41번째 줄', '위 메서드를 부른 곳', 'plain');
  o.push(t13(150, 218, '위로 갈수록 지금 실행 중인 곳', { tone: 'sub', anchor: 'middle' }));
  return [300, 226, o];
};

// top -H의 스레드 번호를 덤프에서 찾기: JDK 17까지는 16진수
figs['td-jdk'] = () => {
  const o = [];
  o.push(rect(70, 6, 160, 44, { rx: 6, fill: 'bg', stroke: 'line', sw: 1 }));
  o.push(mono(80, 24, 'top -H', { tone: 'sub' }));
  o.push(spans(80, 42, [['PID ', 'sub'], ['612', 'accent', 700], ['  CPU 98%', 'sub']], { mono: true }));
  o.push(arrow([[120, 50], [78, 84]], { tone: 'sub', sw: 1.6, size: 6 }));
  o.push(arrow([[180, 50], [222, 84]], { tone: 'sub', sw: 1.6, size: 6 }));
  const card = (x, title, step, find, tone) => {
    o.push(rect(x, 86, 140, 116, { rx: 10, fill: 'card', stroke: 'line', sw: 1.3 }));
    o.push(t13(x + 12, 108, title, { weight: 700 }));
    o.push(t13(x + 12, 132, step, { tone: tone === 'warn' ? 'warn' : 'accent', weight: 600 }));
    o.push(t13(x + 12, 156, '덤프에서 찾을 글자', { tone: 'sub' }));
    find.forEach((f, i) => o.push(mono(x + 12, 176 + i * 18, f, { weight: 700, tone: tone === 'warn' ? 'warn' : 'accent' })));
  };
  card(4, 'JDK 11·17', '16진수로: 612 → 264', ['nid=0x264'], 'warn');
  card(156, 'JDK 21·25', '그대로 써요', ['nid=612', '[612]'], 'accent');
  return [300, 210, o];
};

// ── n-plus-one ──

// 코드에는 SQL이 없어도, 고객을 읽을 때마다 ORM이 SQL을 보내요
figs['np-seq'] = () => {
  const o = [];
  const lanes = [{ x: 40, label: '반복문' }, { x: 150, label: 'ORM' }, { x: 260, label: 'DB' }];
  o.push(ladder(lanes, [
    { from: 0, to: 1, y: 48, label: '주문 목록' },
    { from: 1, to: 2, y: 78, label: '목록 SQL 1번' },
    { from: 0, to: 1, y: 116, label: '주문 1 고객' },
    { from: 1, to: 2, y: 146, label: '고객 SQL', tone: 'warn' },
    { from: 0, to: 1, y: 184, label: '주문 2 고객' },
    { from: 1, to: 2, y: 214, label: '고객 SQL', tone: 'warn' },
  ], { top: 18, bottom: 236 }));
  o.push(t13(205, 238, '… 주문 수만큼', { tone: 'warn', weight: 700, anchor: 'middle' }));
  o.push(t13(8, 266, '코드에는 SQL이 없어요. 읽는 순간 ORM이 보내요', { tone: 'sub' }));
  return [300, 274, o];
};

// ── consumer-lag ──

// 기록한 위치 2, 로그 끝 4: 그 사이 2건이 lag
figs['lag-offsets'] = () => {
  const o = [];
  o.push(t13(8, 16, '파티션 0', { weight: 700 }));
  const cells = [['0', 'done'], ['1', 'done'], ['2', 'lag'], ['3', 'lag'], ['4', 'next']];
  cells.forEach(([n, k], i) => {
    const x = 20 + i * 52;
    const st = { done: ['accentWeak', 'accent'], lag: ['warnWeak', 'warn'], next: ['none', 'weak'] }[k];
    o.push(rect(x, 54, 48, 40, { rx: 6, fill: st[0], stroke: st[1], sw: 1.4, dash: k === 'next' ? '4 3' : undefined }));
    o.push(label(x + 24, 79, n, k === 'done' ? 'accent' : k === 'lag' ? 'warn' : 'weak', 700));
  });
  const mark = (x, t, tone) => {
    o.push(line(x, 40, x, 100, { tone, sw: 2.2, cap: 'butt' }));
    o.push(g.path(`M${x} 46 l-6 -10 h12 z`, { fill: tone, stroke: 'none' }));
    o.push(t13(x, 30, t, { tone, weight: 700, anchor: 'middle' }));
  };
  mark(124, '기록한 위치 2', 'accent');
  mark(228, '로그 끝 4', 'sub');
  o.push(brace(20, 120, 108));
  o.push(t13(70, 132, '처리함', { tone: 'accent', weight: 600, anchor: 'middle' }));
  o.push(brace(126, 226, 108, 'warn'));
  o.push(t13(176, 132, 'lag 2건', { tone: 'warn', weight: 700, anchor: 'middle' }));
  o.push(t13(254, 132, '다음 자리', { tone: 'weak', anchor: 'middle' }));
  o.push(t13(8, 162, 'lag = 로그 끝 4 − 기록한 위치 2 = 2', { weight: 600 }));
  return [300, 170, o];
};

// 들어오는 500건보다 처리 400건이 적어 1초마다 100건씩 쌓여요
figs['lag-rate'] = () => {
  const o = [];
  o.push(box(100, 8, 90, 36, '생산자', null, { tone: 'plain' }));
  o.push(arrow([[145, 44], [145, 70]], { tone: 'sub', sw: 2, size: 7 }));
  o.push(t13(154, 62, '초당 500건', { weight: 700 }));
  // 큐: 쌓이는 통
  o.push(rect(100, 72, 90, 88, { rx: 8, fill: 'card', stroke: 'sub', sw: 1.6 }));
  o.push(label(145, 92, '큐', 'text', 700));
  o.push(rect(102, 100, 86, 58, { rx: 6, fill: 'warn', stroke: 'none', op: 0.2 }));
  for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) o.push(rect(108 + c * 13, 106 + r * 13, 9, 9, { rx: 2, fill: 'warn', stroke: 'none', op: 0.8 }));
  o.push(t13(198, 116, 'lag 60,000건', { weight: 700, tone: 'warn' }));
  o.push(t13(198, 134, '1초마다 +100건', { tone: 'warn' }));
  o.push(arrow([[145, 160], [145, 186]], { tone: 'warn', sw: 2, size: 7 }));
  o.push(t13(154, 178, '초당 400건', { weight: 700, tone: 'warn' }));
  o.push(box(100, 188, 90, 36, '컨슈머', null, { tone: 'plain' }));
  o.push(t13(150, 252, '들어오는 게 멈춰도 다 비우려면 60,000 ÷ 400 = 150초', { tone: 'sub', anchor: 'middle' }));
  return [300, 260, o];
};


// ── slow-after-deploy ──

// 배포 중에는 옛 버전과 새 버전이 섞여, 전체 그래프는 서서히 바뀌어요
figs['sd-mixed'] = () => {
  const o = [];
  const stages = [['배포 전', 0], ['배포 중', 2], ['배포 뒤', 4]];
  stages.forEach(([n, k], s) => {
    const cx = 52 + s * 98;
    o.push(label(cx, 18, n, 'text', 700));
    for (let i = 0; i < 4; i++) {
      const isNew = i < k;
      const y = 30 + i * 34;
      o.push(rect(cx - 36, y, 72, 28, { rx: 6, fill: isNew ? 'accent' : 'card', stroke: isNew ? 'none' : 'sub', sw: 1.3 }));
      o.push(label(cx, y + 19, isNew ? 'v42' : 'v41', isNew ? 'card' : 'text', 700));
    }
    if (s < 2) o.push(arrow([[cx + 40, 92], [cx + 58, 92]], { tone: 'sub', sw: 1.6, size: 6 }));
  });
  // 전체 그래프: 서서히 바뀌어요
  o.push(t13(8, 196, '전체 지표', { tone: 'sub' }));
  o.push(line(16, 236, 288, 236, { tone: 'line', sw: 1.2, cap: 'butt' }));
  o.push(g.path('M16 226 H90 C 140 226, 170 206, 210 206 H288', { stroke: 'accent', sw: 2.2 }));
  o.push(t13(150, 256, '한 번에 바뀌지 않고 서서히 바뀌어요', { tone: 'sub', anchor: 'middle' }));
  return [300, 264, o];
};

// 같은 시간대에 새 버전만 느리면 새 버전 탓
figs['sd-version'] = () => {
  const o = [];
  o.push(rect(8, 6, 12, 12, { rx: 2, fill: 'sub', stroke: 'none', op: 0.6 }));
  o.push(t13(26, 17, '옛 버전 v41', { tone: 'sub' }));
  o.push(rect(122, 6, 12, 12, { rx: 2, fill: 'warn', stroke: 'none' }));
  o.push(t13(140, 17, '새 버전 v42', { tone: 'sub' }));
  const metric = (y, title, a, b, max, fa, fb, same) => {
    o.push(t13(8, y, title, { weight: 700 }));
    const W = (v) => (v / max) * 200;
    o.push(rect(8, y + 10, Math.max(W(a), 3), 16, { rx: 3, fill: 'sub', stroke: 'none', op: 0.6 }));
    o.push(t13(14 + Math.max(W(a), 3), y + 23, fa, { tone: 'sub', weight: 600 }));
    o.push(rect(8, y + 30, Math.max(W(b), 3), 16, { rx: 3, fill: same ? 'sub' : 'warn', stroke: 'none', op: same ? 0.6 : 1 }));
    o.push(t13(14 + Math.max(W(b), 3), y + 43, fb, { tone: same ? 'sub' : 'warn', weight: 700 }));
  };
  metric(44, 'p99 응답시간', 410, 920, 920, '410ms', '920ms', false);
  metric(112, '요청당 SQL 수', 3, 41, 41, '3번', '41번', false);
  metric(180, '에러율', 0.2, 0.2, 1, '0.2%', '0.2%', true);
  o.push(t13(8, 250, '같은 시간대에 새 버전만 느려졌어요', { tone: 'warn', weight: 700 }));
  return [300, 258, o];
};

// 실패율 20%인 버전도 5%에만 내보내면 전체는 1%
figs['sd-canary'] = () => {
  const o = [];
  const waffle = (x0, title, newN, failN) => {
    o.push(t13(x0, 18, title, { weight: 700 }));
    for (let i = 0; i < 100; i++) {
      const c = i % 10;
      const r = Math.floor(i / 10);
      const isNew = i < newN;
      const fail = i < failN;
      o.push(rect(x0 + c * 13, 30 + r * 13, 11, 11, { rx: 2, fill: fail ? 'warn' : isNew ? 'accent' : 'line', stroke: 'none', op: fail ? 1 : isNew ? 0.55 : 1 }));
    }
  };
  waffle(8, '모두에게', 100, 20);
  waffle(162, '5%에만', 5, 1);
  o.push(t13(8, 178, '전체 실패율 20%', { weight: 700, tone: 'warn' }));
  o.push(t13(162, 178, '전체 실패율 1%', { weight: 700, tone: 'accent' }));
  o.push(t13(162, 198, '5% × 20% = 1%', { tone: 'sub' }));
  o.push(rect(8, 214, 11, 11, { rx: 2, fill: 'accent', stroke: 'none', op: 0.55 }));
  o.push(t13(24, 224, '새 버전', { tone: 'sub' }));
  o.push(rect(84, 214, 11, 11, { rx: 2, fill: 'warn', stroke: 'none' }));
  o.push(t13(100, 224, '새 버전의 실패', { tone: 'sub' }));
  o.push(rect(200, 214, 11, 11, { rx: 2, fill: 'line', stroke: 'none' }));
  o.push(t13(216, 224, '옛 버전', { tone: 'sub' }));
  return [300, 232, o];
};

// ── error-spike ──

// 같은 에러 300건, 요청 수에 따라 뜻이 달라요
figs['es-rate'] = () => {
  const o = [];
  const card = (y, title, req, err, rate, next, tone) => {
    o.push(rect(4, y, 292, 116, { rx: 10, fill: tone === 'warn' ? 'warnWeak' : 'card', stroke: tone === 'warn' ? 'warn' : 'line', sw: 1.3 }));
    o.push(t13(14, y + 22, title, { weight: 700, tone: tone === 'warn' ? 'warn' : 'text' }));
    o.push(t13(14, y + 46, '요청(분당)', { tone: 'sub' }));
    o.push(t13(120, y + 46, req, { weight: 600 }));
    o.push(t13(14, y + 66, '에러(분당)', { tone: 'sub' }));
    o.push(t13(120, y + 66, err, { weight: 600 }));
    o.push(t13(14, y + 86, '에러율', { tone: 'sub' }));
    o.push(t13(120, y + 86, rate, { weight: 700, tone }));
    o.push(t13(14, y + 106, `다음: ${next}`, { tone: 'sub' }));
  };
  card(4, '요청도 늘었을 때', '6,000 → 60,000건', '30 → 300건', '0.5% 그대로', '요청이 왜 늘었나', 'accent');
  card(128, '에러만 늘었을 때', '6,000건 그대로', '30 → 300건', '0.5% → 5%', '2단계 에러 종류', 'warn');
  return [300, 248, o];
};

// ── deploy-errors ──

// SIGTERM에 바로 끝날 때 0.5초마다 센 에러: 끊김 3개, 붙지 못함 46개
figs['de-sigterm'] = () => {
  const o = [];
  const X = (t) => 30 + (t + 1) * 74;
  const base = 170;
  const H = (n) => n * 4.6;
  const bins = [[-0.5, 3, 'uc'], [0, 23, 'uf'], [0.5, 20, 'uf'], [1, 2, 'uf']];
  bins.forEach(([t, n, k]) => {
    o.push(rect(X(t) + 3, base - H(n), 74 / 2 - 6, H(n), { rx: 3, fill: k === 'uc' ? 'sub' : 'warn', stroke: 'none', op: k === 'uc' ? 0.7 : 0.9 }));
    o.push(label(X(t) + 74 / 4, base - H(n) - 6, String(n), k === 'uc' ? 'sub' : 'warn', 700));
  });
  o.push(line(X(-1), base, X(2.5), base, { tone: 'line', sw: 1.4, cap: 'butt' }));
  [-1, -0.5, 0, 0.5, 1, 1.5, 2].forEach((t) => {
    o.push(line(X(t), base, X(t), base + 5, { tone: 'sub', sw: 1.2, cap: 'butt' }));
    if (Number.isInteger(t)) o.push(t13(X(t), base + 20, `${t}초`, { tone: 'sub', anchor: 'middle' }));
  });
  o.push(line(X(0), 26, X(0), base, { tone: 'accent', sw: 2, dash: '4 3', cap: 'butt' }));
  o.push(t13(X(0), 18, 'SIGTERM', { tone: 'accent', weight: 700, mono: true, anchor: 'middle' }));
  o.push(rect(8, 206, 12, 12, { rx: 2, fill: 'sub', stroke: 'none', op: 0.7 }));
  o.push(t13(26, 217, '처리 중 끊김(UC) 3개 · 직전에 시작한 요청', { tone: 'sub' }));
  o.push(rect(8, 226, 12, 12, { rx: 2, fill: 'warn', stroke: 'none' }));
  o.push(t13(26, 237, '붙지 못함(UF) 46개 · 꺼진 A로 간 새 요청', { tone: 'sub' }));
  return [300, 246, o];
};

// ── gateway-errors ──

// WAS가 쉬던 연결을 먼저 닫는 순간 그 연결로 요청을 보내면 502
figs['ge-keepalive'] = () => {
  const o = [];
  const lanes = [{ x: 36, label: '사용자' }, { x: 150, label: '웹 서버' }, { x: 264, label: 'WAS' }];
  o.push(rect(100, 120, 196, 36, { rx: 6, fill: 'bg', stroke: 'line', sw: 1, dash: '3 3' }));
  o.push(ladder(lanes, [
    { from: 0, to: 1, y: 48, label: '요청 1' },
    { from: 1, to: 2, y: 74, label: '요청 1' },
    { from: 2, to: 1, y: 100, label: '응답', dashed: true },
    { from: 0, to: 1, y: 178, label: '요청 2' },
    { from: 1, to: 2, y: 208, label: '쉬던 연결로', tone: 'warn' },
    { from: 2, to: 1, y: 238, label: '그 순간 닫음', tone: 'warn' },
    { from: 1, to: 0, y: 268, label: '502', dashed: true, tone: 'warn' },
  ], { top: 18, bottom: 282 }));
  o.push(t13(198, 143, '연결이 쉬어요', { tone: 'sub', anchor: 'middle' }));
  return [300, 290, o];
};

// ── pool-exhausted ──

// 최대 10개 풀: 평소엔 쉬는 커넥션이 남고, 바닥나면 active 10 · idle 0
figs['px-pool'] = () => {
  const o = [];
  const pool = (y, title, active, tone, extra) => {
    o.push(t13(8, y, title, { weight: 700, tone: tone === 'warn' ? 'warn' : 'text' }));
    o.push(rect(8, y + 10, 214, 40, { rx: 8, fill: 'bg', stroke: 'sub', sw: 1.3 }));
    for (let i = 0; i < 10; i++) {
      const on = i < active;
      o.push(rect(14 + i * 20.6, y + 18, 16, 24, { rx: 3, fill: on ? tone : 'card', stroke: on ? 'none' : 'line', sw: 1 }));
    }
    o.push(t13(230, y + 26, `active ${active}`, { tone: tone === 'warn' ? 'warn' : 'accent', weight: 700 }));
    o.push(t13(230, y + 44, `idle ${10 - active}`, { tone: active === 10 ? 'warn' : 'sub', weight: 700 }));
    if (extra) extra(y);
  };
  pool(18, '평소', 6, 'accent');
  pool(100, '바닥났을 때', 10, 'warn', (y) => {
    for (let i = 0; i < 6; i++) o.push(g.thread(20 + i * 16, y + 62, 30, { tone: 'sub', amp: 2.5, waves: 2, sw: 1.5 }));
    o.push(t13(118, y + 84, '스레드가 커넥션을 기다려요', { tone: 'sub' }));
  });
  return [300, 202, o];
};

// ── rum ──

// RUM 스크립트는 모았다가 페이지가 숨겨질 때 보내요
figs['rum-seq'] = () => {
  const o = [];
  const lanes = [{ x: 40, label: '브라우저' }, { x: 154, label: 'RUM 스크립트' }, { x: 262, label: '수집 서버' }];
  o.push(ladder(lanes, [
    { from: 0, to: 1, y: 52, label: '시각·지표 기록' },
    { from: 0, to: 1, y: 88, label: '에러 이벤트' },
    { from: 1, to: 2, y: 176, label: '모은 것을 전송', tone: 'accent' },
  ], { top: 18, bottom: 190 }));
  o.push(rect(118, 104, 72, 30, { rx: 6, fill: 'accentWeak', stroke: 'accent', sw: 1.2 }));
  o.push(label(154, 124, '모아 둬요', 'accent', 700));
  o.push(line(8, 146, 292, 146, { tone: 'warn', sw: 1.2, dash: '4 3' }));
  o.push(t13(292, 141, '페이지가 숨겨질 때', { tone: 'warn', weight: 600, anchor: 'end', halo: 'bg' }));
  o.push(t13(8, 214, '탭을 옮기거나 닫으면 그때 한꺼번에 보내요', { tone: 'sub' }));
  return [300, 222, o];
};

// RUM에 담기는 사용자는 안으로 갈수록 줄어요
figs['rum-funnel'] = () => {
  const o = [];
  const rows = [
    [284, '실제 사용자 전체', '', 'line'],
    [240, '스크립트가 막히지 않은 사용자', '광고·추적 차단에서 빠져요', 'sub'],
    [196, '전송이 닿은 페이지 보기', '보내기 전에 꺼지면 빠져요', 'sub'],
    [152, 'RUM 화면의 데이터', '샘플링하면 더 줄어요', 'accent'],
  ];
  rows.forEach(([w, n, note, tone], i) => {
    const y = 6 + i * 58;
    const x = 150 - w / 2;
    o.push(rect(x, y, w, 34, { rx: 8, fill: tone === 'accent' ? 'accent' : tone === 'sub' ? 'accentWeak' : 'bg', stroke: tone === 'line' ? 'line' : 'none', sw: 1.2 }));
    o.push(label(150, y + 22, n, tone === 'accent' ? 'card' : 'text', 700));
    if (note) o.push(label(150, y - 7, note, 'warn', 400));
  });
  return [300, 6 + 3 * 58 + 40, o];
};

// ── browser-errors ──

// fetch가 실패로 끝나는 건 요청 자체가 실패할 때뿐
figs['be-fetch'] = () => {
  const o = [];
  const panel = (y, title, draw, result, auto, fix, tone, autoKey = '저절로 남는 에러') => {
    o.push(rect(4, y, 292, 128, { rx: 10, fill: 'card', stroke: 'line', sw: 1.3 }));
    o.push(t13(14, y + 22, title, { weight: 700 }));
    draw(y);
    o.push(t13(14, y + 82, 'fetch', { tone: 'sub', mono: true }));
    o.push(t13(70, y + 82, result, { weight: 700, tone }));
    o.push(t13(14, y + 100, autoKey, { tone: 'sub' }));
    o.push(t13(124, y + 100, auto, { weight: 600, tone: auto === '없어요' ? 'warn' : 'text' }));
    o.push(t13(14, y + 118, '잡는 법', { tone: 'sub' }));
    o.push(t13(124, y + 118, fix, { weight: 600, tone: 'accent' }));
  };
  panel(4, '서버가 404·500을 줌', (y) => {
    o.push(g.laptop(40, y + 46));
    o.push(arrow([[64, y + 46], [222, y + 46]], { tone: 'sub', sw: 1.6, size: 6, start: true }));
    o.push(tag(143, y + 46, '500', { tone: 'warnSoft' }));
    o.push(g.server(254, y + 46));
  }, '정상 응답, ok는 false', '없어요', 'ok나 status 확인', 'text');
  panel(140, '네트워크가 끊김', (y) => {
    o.push(g.laptop(40, y + 46));
    o.push(line(64, y + 46, 130, y + 46, { tone: 'sub', sw: 1.6 }));
    o.push(xmark(143, y + 46, { r: 7 }));
    o.push(line(156, y + 46, 222, y + 46, { tone: 'sub', sw: 1.6, dash: '4 3' }));
    o.push(g.server(254, y + 46, { tone: 'weak' }));
  }, '거부(TypeError)', 'unhandledrejection', 'catch로 잡기', 'warn', '안 잡으면 남는 것');
  return [300, 272, o];
};

// 에러 수가 아니라 겪은 사용자 수로 줄 세워요
figs['be-groups'] = () => {
  const o = [];
  const panel = (x, title, errs, users, order, tone, nUsers) => {
    o.push(rect(x, 4, 140, 210, { rx: 10, fill: tone === 'accent' ? 'accentWeak' : 'card', stroke: tone === 'accent' ? 'accent' : 'line', sw: 1.3 }));
    o.push(t13(x + 12, 26, title, { weight: 700 }));
    for (let i = 0; i < nUsers; i++) o.push(g.person(x + 22 + (i % 5) * 24, 56 + Math.floor(i / 5) * 34, { tone: tone === 'accent' ? 'accent' : 'sub' }));
    o.push(t13(x + 12, 140, '에러 수', { tone: 'sub' }));
    o.push(t13(x + 128, 140, errs, { weight: 700, anchor: 'end' }));
    o.push(t13(x + 12, 162, '겪은 사용자', { tone: 'sub' }));
    o.push(t13(x + 128, 162, users, { weight: 700, anchor: 'end', tone }));
    o.push(tag(x + 70, 192, order, { tone: tone === 'accent' ? 'accent' : 'sub' }));
  };
  panel(4, '묶음 A', '5,000번', '3명', '나중에', 'sub', 3);
  panel(156, '묶음 B', '400번', '350명', '먼저 고쳐요', 'accent', 10);
  o.push(t13(150, 236, 'A는 3명이 되풀이해 낸 에러예요', { tone: 'sub', anchor: 'middle' }));
  return [300, 244, o];
};

// ── synthetic-monitoring ──

// 응답 코드만 보면 200으로 온 에러 화면도 성공
figs['sy-check'] = () => {
  const o = [];
  const pages = [
    ['정상 주문 페이지', '200', 'ok', true, true],
    ['에러 화면', '200', 'err', true, false],
    ['서버 에러', '500', 'down', false, false],
  ];
  o.push(t13(170, 18, '코드만', { tone: 'sub', anchor: 'middle', weight: 600 }));
  o.push(t13(250, 18, "본문 '주문하기'", { tone: 'sub', anchor: 'middle', weight: 600 }));
  pages.forEach(([n, code, kind, a, b], i) => {
    const y = 30 + i * 70;
    // 작은 화면
    o.push(rect(8, y, 56, 58, { rx: 6, fill: 'card', stroke: 'sub', sw: 1.3 }));
    o.push(line(8, y + 12, 64, y + 12, { tone: 'sub', sw: 1.1, cap: 'butt' }));
    if (kind === 'ok') o.push(rect(16, y + 32, 40, 14, { rx: 4, fill: 'accent', stroke: 'none' }));
    if (kind === 'err') o.push(t13(36, y + 44, '!', { weight: 700, tone: 'warn', anchor: 'middle' }));
    if (kind === 'down') o.push(t13(36, y + 44, '500', { weight: 700, tone: 'warn', anchor: 'middle' }));
    o.push(t13(72, y + 26, n, { weight: 700 }));
    o.push(tag(72, y + 44, code, { tone: code === '200' ? 'soft' : 'warnSoft', anchor: 'start' }));
    const mark = (cx, okv, missed) => {
      if (okv) o.push(g.check(cx, y + 30, { tone: missed ? 'warn' : 'accent', r: 7 }));
      else o.push(xmark(cx, y + 30, { r: 6 }));
      o.push(t13(cx, y + 52, okv ? (missed ? '성공으로 놓쳐요' : '성공') : '실패', { tone: missed ? 'warn' : okv ? 'accent' : 'warn', anchor: 'middle', weight: missed ? 700 : 400 }));
    };
    mark(170, a, kind === 'err');
    mark(250, b, false);
  });
  return [300, 240, o];
};

// 세 지역의 점검 위치와 회사 안의 점검 위치
figs['sy-locations'] = () => {
  const o = [];
  const probe = (cx, n) => {
    o.push(g.path(`M${cx} 40 c-9 -10 -9 -24 0 -24 c9 0 9 14 0 24 z`, { fill: 'accentWeak', stroke: 'accent', sw: 1.6 }));
    o.push(g.circle(cx, 25, 3.5, { fill: 'accent' }));
    o.push(label(cx, 58, n, 'text', 700));
  };
  probe(50, '서울');
  probe(150, '도쿄');
  probe(250, '싱가포르');
  [50, 150, 250].forEach((x) => o.push(arrow([[x, 64], [150 + (x - 150) * 0.35, 96]], { tone: 'accent', sw: 1.6, size: 6 })));
  o.push(box(90, 98, 120, 40, '주문 페이지', '공개 주소', { tone: 'soft' }));
  o.push(zone(4, 158, 292, 72, '회사 안', { tone: 'sub', labelTone: 'sub' }));
  o.push(g.path('M52 216 c-9 -10 -9 -24 0 -24 c9 0 9 14 0 24 z', { fill: 'card', stroke: 'sub', sw: 1.6 }));
  o.push(g.circle(52, 201, 3.5, { fill: 'sub' }));
  o.push(t13(70, 204, '안쪽 위치', { weight: 700 }));
  o.push(arrow([[140, 199], [190, 199]], { tone: 'accent', sw: 1.6, size: 6 }));
  o.push(box(192, 182, 94, 36, '사내 주소', null, { tone: 'plain' }));
  return [300, 236, o];
};

// 평균으로 걸면 한 곳만 막혀도, 위치를 따로 세면 두 곳부터 울려요
figs['sy-alert'] = () => {
  const o = [];
  const scenario = (y, title, blocked, rules) => {
    o.push(t13(8, y, title, { weight: 700 }));
    ['서울', '도쿄', '싱가포르'].forEach((n, i) => {
      const bad = blocked.includes(i);
      o.push(tag(148 + [0, 44, 88][i], y - 4, n, { tone: bad ? 'warn' : 'soft', anchor: 'start' }));
    });
    rules.forEach(([rule, val, ring], k) => {
      const ry = y + 30 + k * 26;
      o.push(t13(14, ry, rule, { tone: 'sub' }));
      o.push(t13(150, ry, val, { weight: 700, tone: ring ? 'warn' : 'text' }));
      o.push(tag(292, ry - 4.5, ring ? '울려요' : '안 울려요', { tone: ring ? 'warn' : 'sub', anchor: 'end' }));
    });
  };
  scenario(20, '싱가포르만 막힘', [2], [['평균 < 90%', '66.7%', true], ['80% 아래 ≥ 2곳', '1곳', false]]);
  o.push(line(8, 100, 292, 100, { tone: 'line', sw: 1, dash: '3 3' }));
  scenario(126, '두 곳이 막힘', [1, 2], [['평균 < 90%', '33.3%', true], ['80% 아래 ≥ 2곳', '2곳', true]]);
  return [300, 192, o];
};

// ── llm-apps ──

// LLM 앱 대시보드 배치: 사용자 체감 → 토큰과 비용 → 에이전트와 품질
figs['llm-dashboard'] = () => {
  const o = [];
  const rows = [
    ['① 사용자 체감', '', [['요청·에러', '429·529 포함'], ['TTFT p95', ''], ['응답시간', 'p95']], 'accent'],
    ['② 토큰과 비용', '모델·기능마다', [['분당 입력·', '출력 토큰'], ['하루 비용', ''], ['캐시 적중률', '']], 'text'],
    ['③ 에이전트와 품질', '', [['실행당', 'LLM 호출'], ['잘린 응답', '비율'], ['사용자 평가', '']], 'text'],
  ];
  o.push(rect(4, 4, 292, 274, { rx: 10, fill: 'bg', stroke: 'line', sw: 1.2 }));
  rows.forEach(([n, note, tiles, tone], r) => {
    const y = 12 + r * 88;
    o.push(t13(14, y + 16, n, { weight: 700, tone }));
    if (note) o.push(t13(286, y + 16, note, { tone: 'sub', anchor: 'end' }));
    tiles.forEach(([a, b], c) => {
      const x = 12 + c * 94;
      o.push(rect(x, y + 24, 88, 56, { rx: 6, fill: 'card', stroke: r === 0 ? 'accent' : 'line', sw: r === 0 ? 1.3 : 1 }));
      o.push(t13(x + 8, y + 42, a, { weight: 600 }));
      if (b) o.push(t13(x + 8, y + 58, b, { weight: b.includes('포함') ? 400 : 600, tone: b.includes('포함') ? 'sub' : 'text' }));
      o.push(g.path(`M${x + 8} ${y + 74} l14 -6 l14 3 l14 -8 l14 4 l14 -5`, { stroke: 'accent', sw: 1.6 }));
    });
  });
  return [300, 282, o];
};


const only = process.argv.slice(2);
for (const [name, fn] of Object.entries(figs)) {
  if (only.length && !only.some((p) => name.startsWith(p))) continue;
  const [w, h, body] = fn();
  g.save(D, name, w, h, body);
}
console.log('done');
