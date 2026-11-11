// 클라우드 글의 SVG 그림. 실행: node scripts/figures/cloud.mjs [이름 접두어...]
import * as g from './lib.mjs';

const { text, line, arrow, zone, rect, xmark, plot, badge } = g;
const D = 'cloud';
const figs = {};
const label = (x, y, s, tone = 'sub', weight = 600) => text(x, y, s, { size: 13, weight, tone, anchor: 'middle' });
const t13 = (x, y, s, o = {}) => text(x, y, s, { size: 13, ...o });
const mono = (x, y, s, o = {}) => text(x, y, s, { size: 13, mono: true, ...o });
// 계단 모양 선(시각마다 값이 바뀌는 대수). pts는 [[x, 값], …]이고 다음 x까지 값을 유지한다.
const stepPts = (pts, end) => {
  const out = [];
  pts.forEach(([x, v], i) => {
    if (i) out.push([x, pts[i - 1][1]]);
    out.push([x, v]);
  });
  out.push([end, pts[pts.length - 1][1]]);
  return out;
};

// ── auto-scaling ──

// 시작 템플릿대로 두 AZ에 2대씩, 최소 2 · 원하는 4 · 최대 6
figs['asg-capacity'] = () => {
  const o = [];
  o.push(g.doc(20, 24));
  o.push(t13(44, 19, '시작 템플릿', { weight: 700 }));
  o.push(t13(44, 38, '이미지 · 인스턴스 유형 · 보안 그룹', { tone: 'sub' }));
  o.push(arrow([[76, 46], [76, 64]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(arrow([[224, 46], [224, 64]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(label(150, 60, '이대로 띄워요', 'accent', 700));
  [[4, 'AZ a', [34, 76, 118]], [152, 'AZ b', [182, 224, 266]]].forEach(([x, name, xs]) => {
    o.push(zone(x, 70, 144, 88, name));
    xs.forEach((cx, i) => {
      if (i < 2) o.push(g.server(cx, 126, { tone: 'accent' }));
      else o.push(rect(cx - 13, 109, 26, 34, { rx: 3.5, fill: 'none', stroke: 'weak', sw: 1.5, dash: '4 3' }));
    });
  });
  // 대수 눈금
  const x0 = 34;
  const u = 38;
  const X = (n) => x0 + n * u;
  const y = 202;
  o.push(rect(X(0), y - 7, X(6) - X(0), 14, { rx: 7, fill: 'bg', stroke: 'line', sw: 1.2 }));
  o.push(rect(X(0), y - 7, X(4) - X(0), 14, { rx: 7, fill: 'accentWeak', stroke: 'accent', sw: 1.5 }));
  for (let n = 0; n <= 6; n++) o.push(label(X(n), y + 26, String(n), 'sub', 600));
  [[2, '최소 2', 'sub', 600], [4, '원하는 4', 'accent', 700], [6, '최대 6', 'sub', 600]].forEach(([n, s, tone, w]) => {
    o.push(line(X(n), y - 14, X(n), y + 9, { tone: tone === 'accent' ? 'accent' : 'sub', sw: 1.8, cap: 'butt' }));
    o.push(label(X(n), y - 20, s, tone, w));
  });
  // 범례
  o.push(rect(30, 248, 14, 14, { rx: 3, fill: 'accentWeak', stroke: 'accent', sw: 1.5 }));
  o.push(t13(50, 260, '서비스 중', { tone: 'sub' }));
  o.push(rect(130, 248, 14, 14, { rx: 3, fill: 'none', stroke: 'weak', sw: 1.5, dash: '4 3' }));
  o.push(t13(150, 260, '최대까지 늘릴 수 있는 자리', { tone: 'sub' }));
  return [300, 270, o];
};

// 목표 추적: 평균 CPU가 75%가 되자 2대를 더하고, 부하가 줄자 1대씩 줄여요
figs['asg-tracking'] = () => {
  const o = [];
  const p1 = plot(44, 26, 232, 92, { x0: 0, x1: 60, y0: 0, y1: 100 });
  o.push(t13(44, 14, '평균 CPU(%)', { weight: 700 }));
  o.push(p1.yticks([[0, '0'], [50, '50'], [100, '100']]));
  o.push(p1.base());
  o.push(p1.hline(50, { tone: 'accent', dash: '6 4', sw: 1.6 }));
  o.push(text(276, p1.sy(50) - 6, '목표 50%', { size: 13, weight: 700, tone: 'accent', anchor: 'end', halo: true }));
  const cpu = [[0, 45], [5, 46], [10, 75], [12, 76], [15, 74], [17, 51], [22, 50], [30, 49], [38, 50], [40, 30], [46, 30], [47, 36], [52, 36], [53, 45], [60, 45]];
  o.push(p1.line(cpu, { tone: 'text', sw: 2.2 }));
  const p2 = plot(44, 160, 232, 56, { x0: 0, x1: 60, y0: 0, y1: 8 });
  o.push(t13(44, 148, '서버 대수', { weight: 700 }));
  o.push(p2.yticks([[0, '0'], [4, '4'], [8, '8']]));
  o.push(p2.base());
  const cnt = stepPts([[0, 4], [12, 6], [46, 5], [52, 4]], 60);
  o.push(p2.line(cnt, { tone: 'accent', sw: 2.6 }));
  [[5, 4, '4대'], [28, 6, '6대'], [49, 5, '5대'], [56, 4, '4대']].forEach(([x, v, s]) => o.push(text(p2.sx(x), p2.sy(v) - 7, s, { size: 13, weight: 700, tone: 'accent', anchor: 'middle' })));
  // 표시선
  [[12, '2대 더해요', 'start', 40], [46, '1대씩 줄여요', 'end', 138]].forEach(([x, s, anchor, y]) => {
    o.push(line(p1.sx(x), 26, p1.sx(x), 216, { tone: 'sub', sw: 1.3, dash: '3 4', cap: 'butt' }));
    o.push(text(p1.sx(x) + (anchor === 'end' ? -5 : 5), y, s, { size: 13, weight: 600, tone: 'sub', anchor, halo: true }));
  });
  o.push(p2.xticks([[0, '0분'], [20, '20분'], [40, '40분'], [60, '60분']], { dy: 20 }));
  return [300, 244, o];
};

// 서버 하나의 일생: 대기 → 서비스 중 → 종료 중 → 종료, 옆에 훅과 로드 밸런서
figs['asg-lifecycle'] = () => {
  const o = [];
  const st = [
    { y: 6, ko: '대기', en: 'Pending', tone: 'plain' },
    { y: 76, ko: '서비스 중', en: 'InService', tone: 'accent' },
    { y: 146, ko: '종료 중', en: 'Terminating', tone: 'plain' },
    { y: 226, ko: '종료', en: 'Terminated', tone: 'sub' },
  ];
  st.forEach(({ y, ko, en, tone }) => {
    const fill = tone === 'accent' ? 'accentWeak' : tone === 'sub' ? 'bg' : 'card';
    const stroke = tone === 'accent' ? 'accent' : tone === 'sub' ? 'line' : 'sub';
    o.push(rect(6, y, 144, 44, { rx: 8, fill, stroke, sw: 1.6 }));
    o.push(t13(18, y + 19, ko, { weight: 700, tone: tone === 'accent' ? 'accent' : tone === 'sub' ? 'sub' : 'text' }));
    o.push(mono(18, y + 36, en, { tone: 'sub' }));
  });
  for (let i = 0; i < 3; i++) o.push(arrow([[78, st[i].y + 46], [78, st[i + 1].y - 2]], { tone: 'sub', sw: 2, size: 7 }));
  // 오른쪽 설명
  const note = (y, head, sub, tone = 'accent') => {
    o.push(line(84, y - 4, 166, y - 4, { tone: 'weak', sw: 1.2, dash: '3 3', cap: 'butt' }));
    o.push(t13(172, y - 8, head, { weight: 700, tone }));
    o.push(t13(172, y + 10, sub, { tone: 'sub' }));
  };
  note(64, '시작 훅', '준비 작업을 해요');
  o.push(t13(172, 94, '로드 밸런서에', { weight: 700 }));
  o.push(t13(172, 112, '등록된 뒤 받아요', { tone: 'sub' }));
  o.push(t13(172, 160, '등록을 풀어요', { weight: 700 }));
  o.push(t13(172, 178, '하던 요청은 마저', { tone: 'sub' }));
  note(214, '종료 훅', '로그를 옮겨요');
  return [300, 276, o];
};

// 원하는 대수는 6인데 서비스 중은 4에 머물러요
figs['asg-gap'] = () => {
  const o = [];
  const p = plot(40, 34, 236, 120, { x0: 0, x1: 40, y0: 0, y1: 8 });
  o.push(p.yticks([[0, '0'], [4, '4'], [8, '8']]));
  o.push(p.base());
  const want = stepPts([[0, 4], [10, 6]], 40);
  const have = stepPts([[0, 4]], 40);
  o.push(p.area(want.filter(([x]) => x >= 10), { fill: 'warnWeak', base: [[10, 4], [40, 4]] }));
  o.push(p.line(have, { tone: 'text', sw: 2.4 }));
  o.push(p.line(want, { tone: 'accent', sw: 2.6, dash: '7 4' }));
  o.push(text(p.sx(25), p.sy(5) + 5, '뜨지 못한 2대', { size: 13, weight: 700, tone: 'warn', anchor: 'middle' }));
  o.push(p.xticks([[0, '0분'], [10, '10분'], [20, '20분'], [30, '30분'], [40, '40분']], { dy: 20 }));
  // 범례
  o.push(line(40, 12, 62, 12, { tone: 'accent', sw: 2.6, dash: '7 4', cap: 'butt' }));
  o.push(t13(68, 17, '원하는 대수', { tone: 'sub' }));
  o.push(line(160, 12, 182, 12, { tone: 'text', sw: 2.4, cap: 'butt' }));
  o.push(t13(188, 17, '서비스 중', { tone: 'sub' }));
  return [300, 184, o];
};

// ── pricing-models ──

// 시간당 10달러 약정: 모자란 시간은 버려지고, 넘친 몫은 온디맨드 요금
figs['pm-hourly'] = () => {
  const o = [];
  const use = [[0, 6], [4, 5], [8, 12], [12, 15], [16, 13], [20, 8]];
  const p = plot(44, 30, 244, 140, { x0: -2, x1: 22, y0: 0, y1: 16 });
  o.push(p.yticks([[0, '0'], [10, '10'], [15, '15']]));
  o.push(p.base());
  const bw = 26;
  use.forEach(([h, v]) => {
    const x = p.sx(h) - bw / 2;
    const top = Math.min(v, 10);
    o.push(rect(x, p.sy(top), bw, p.sy(0) - p.sy(top), { rx: 0, fill: 'accent', stroke: 'none' }));
    if (v > 10) o.push(rect(x, p.sy(v), bw, p.sy(10) - p.sy(v), { rx: 0, fill: 'sub', stroke: 'none' }));
    if (v < 10) o.push(rect(x, p.sy(10), bw, p.sy(v) - p.sy(10), { rx: 0, fill: 'warnWeak', stroke: 'warn', sw: 1.2, dash: '3 3' }));
  });
  o.push(p.hline(10, { tone: 'text', dash: '6 4', sw: 1.6 }));
  o.push(p.xticks(use.map(([h]) => [h, `${h}시`]), { dy: 20 }));
  o.push(t13(44, 16, '시간당 사용(달러)', { tone: 'sub' }));
  o.push(line(184, 11, 204, 11, { tone: 'text', sw: 1.6, dash: '6 4', cap: 'butt' }));
  o.push(t13(210, 16, '약정 10달러', { weight: 700 }));
  // 범례
  const lg = [['accent', null, '약정으로 낸 몫'], ['warnWeak', 'warn', '버려진 약정'], ['sub', null, '넘친 몫: 온디맨드 요금']];
  let x = 44;
  lg.forEach(([fill, stroke, s], i) => {
    const yy = i < 2 ? 214 : 236;
    if (i === 2) x = 44;
    o.push(rect(x, yy - 11, 14, 14, { rx: 2, fill, stroke: stroke ?? 'none', sw: 1.2, dash: stroke ? '3 3' : undefined }));
    o.push(t13(x + 20, yy, s, { tone: 'sub' }));
    x += 130;
  });
  return [300, 246, o];
};

// ── database-migration ──

// 원본 DB → 복제 인스턴스 → 대상 DB, ① 전체 적재 ② 변경 로그
figs['dms-flow'] = () => {
  const o = [];
  o.push(g.db(44, 56));
  o.push(label(44, 94, '원본 DB', 'text', 700));
  o.push(g.doc(44, 138));
  o.push(label(44, 172, '변경 로그', 'text', 700));
  o.push(text(46, 190, 'binlog·WAL', { size: 13, tone: 'sub', anchor: 'middle', mono: true }));
  // 복제 인스턴스
  o.push(rect(102, 20, 96, 170, { rx: 10, fill: 'bg', stroke: 'sub', sw: 1.6 }));
  o.push(label(150, 40, '복제 인스턴스', 'text', 700));
  o.push(g.app(150, 70, '작업', { w: 60, tone: 'accent' }));
  o.push(g.ram(150, 114));
  o.push(label(150, 146, '메모리', 'sub', 600));
  o.push(label(150, 170, '넘치면 디스크', 'sub', 600));
  o.push(g.db(256, 56, { tone: 'accent' }));
  o.push(label(256, 94, '대상 DB', 'accent', 700));
  // 화살표
  o.push(arrow([[64, 56], [100, 56]], { tone: 'sub', sw: 2.2, size: 7 }));
  o.push(badge(82, 42, 1));
  o.push(arrow([[62, 138], [100, 138]], { tone: 'accent', sw: 2.2, size: 7 }));
  o.push(badge(82, 124, 2));
  o.push(arrow([[200, 62], [236, 62]], { tone: 'accent', sw: 2.2, size: 7 }));
  o.push(label(218, 50, '적용', 'accent', 700));
  // 범례
  o.push(badge(16, 216, 1));
  o.push(t13(32, 221, '있는 데이터를 통째로 옮겨요'));
  o.push(badge(16, 240, 2));
  o.push(t13(32, 245, '변경 로그를 읽어 계속 따라 적어요'));
  return [300, 254, o];
};

// 지연 두 가지: 원본 지연은 원본→DMS, 대상 지연은 원본→대상
figs['cdc-latency'] = () => {
  const o = [];
  o.push(g.db(40, 30));
  o.push(label(40, 66, '원본 DB', 'text', 700));
  o.push(g.server(150, 30, { tone: 'accent' }));
  o.push(label(150, 66, 'DMS', 'accent', 700));
  o.push(g.db(260, 30));
  o.push(label(260, 66, '대상 DB', 'text', 700));
  o.push(arrow([[60, 30], [134, 30]], { tone: 'sub', sw: 2, size: 7 }));
  o.push(arrow([[166, 30], [240, 30]], { tone: 'sub', sw: 2, size: 7 }));
  const brace = (x1, x2, y, s, tone) => {
    o.push(line(x1, y, x2, y, { tone, sw: 2, cap: 'butt' }));
    o.push(line(x1, y - 6, x1, y + 6, { tone, sw: 2, cap: 'butt' }));
    o.push(line(x2, y - 6, x2, y + 6, { tone, sw: 2, cap: 'butt' }));
    o.push(text((x1 + x2) / 2, y + 22, s, { size: 13, weight: 700, tone, anchor: 'middle', mono: true }));
  };
  brace(40, 150, 86, 'CDCLatencySource', 'accent');
  brace(40, 260, 128, 'CDCLatencyTarget', 'warn');
  const tb = g.table(4, 168, [{ t: '원본 지연', w: 82, align: 'right' }, { t: '대상 지연', w: 82, align: 'right' }, { t: '먼저 볼 곳', w: 128 }], [['900초', '920초', '원본 쪽 읽기'], ['3초', '840초', '대상 쪽 적용']], { hl: [1], hlTone: 'warn' });
  o.push(tb.svg);
  return [300, 244, o];
};

// ── audit-logs ──

// 콘솔·스크립트·AWS 서비스가 부른 API를 CloudTrail이 남겨요. 90일 기록과 trail
figs['trail-flow'] = () => {
  const o = [];
  o.push(g.person(50, 26));
  o.push(label(50, 62, '콘솔', 'text', 600));
  o.push(g.laptop(150, 26));
  o.push(label(150, 62, '스크립트·SDK', 'text', 600));
  o.push(g.gear(250, 26, { r: 13 }));
  o.push(label(250, 62, 'AWS 서비스', 'text', 600));
  o.push(arrow([[50, 70], [50, 86], [130, 86], [130, 96]], { tone: 'sub', sw: 1.8, size: 6 }));
  o.push(arrow([[150, 70], [150, 96]], { tone: 'sub', sw: 1.8, size: 6 }));
  o.push(arrow([[250, 70], [250, 86], [170, 86], [170, 96]], { tone: 'sub', sw: 1.8, size: 6 }));
  o.push(rect(90, 98, 120, 30, { rx: 8, fill: 'card', stroke: 'sub', sw: 1.6 }));
  o.push(label(150, 118, '클라우드 API', 'text', 700));
  o.push(arrow([[150, 130], [150, 150]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(rect(54, 152, 192, 34, { rx: 8, fill: 'accentWeak', stroke: 'accent', sw: 1.6 }));
  o.push(label(150, 174, 'CloudTrail이 한 줄씩 남겨요', 'accent', 700));
  o.push(arrow([[110, 188], [70, 210]], { tone: 'sub', sw: 2, size: 7 }));
  o.push(arrow([[190, 188], [230, 210]], { tone: 'sub', sw: 2, size: 7 }));
  o.push(rect(4, 212, 140, 76, { rx: 8, fill: 'card', stroke: 'line', sw: 1.5 }));
  o.push(mono(14, 232, 'Event history', { weight: 700 }));
  o.push(t13(14, 252, '최근 90일 관리 이벤트', { tone: 'sub' }));
  o.push(t13(14, 272, '따로 켜지 않아도 무료', { tone: 'sub' }));
  o.push(rect(156, 212, 140, 76, { rx: 8, fill: 'card', stroke: 'line', sw: 1.5 }));
  o.push(mono(166, 232, 'trail', { weight: 700 }));
  o.push(t13(166, 252, 'S3나 CloudWatch', { tone: 'sub' }));
  o.push(t13(166, 272, 'Logs로 오래 보관', { tone: 'sub' }));
  return [300, 292, o];
};

// 에러율이 튀기 2분 전에 deploy-bot이 DB를 바꿨어요
figs['trail-overlay'] = () => {
  const o = [];
  const p = plot(40, 26, 236, 92, { x0: 0, x1: 30, y0: 0, y1: 10 });
  o.push(t13(40, 14, 'API 에러율(%)', { weight: 700 }));
  o.push(p.yticks([[0, '0'], [5, '5'], [10, '10']]));
  o.push(p.base());
  const err = [[0, 0.6], [4, 0.5], [8, 0.7], [11, 0.6], [12, 0.7], [13, 6.8], [15, 8.2], [18, 7.6], [19, 3], [21, 0.8], [25, 0.6], [30, 0.5]];
  o.push(p.line(err, { tone: 'warn', sw: 2.4 }));
  [[5, 'sub'], [11, 'accent'], [19, 'sub']].forEach(([x, tone]) => {
    o.push(line(p.sx(x), 26, p.sx(x), 118, { tone, sw: tone === 'accent' ? 2 : 1.3, dash: '4 3', cap: 'butt' }));
  });
  o.push(text(p.sx(11) - 5, 44, '변경', { size: 13, weight: 700, tone: 'accent', anchor: 'end', halo: true }));
  o.push(p.xticks([[0, '13:50'], [10, '14:00'], [20, '14:10'], [30, '14:20']], { dy: 20 }));
  o.push(t13(4, 164, '같은 시간의 감사 로그', { weight: 700 }));
  const tb = g.table(4, 172, [{ t: '시각', w: 56 }, { t: 'eventName', w: 146 }, { t: '누가', w: 94 }], [['13:55', 'PutMetricAlarm', 'ops-user'], ['14:01', 'ModifyDBInstance', 'deploy-bot'], ['14:09', 'RebootDBInstance', 'ops-user']], { hl: [1], mono: true });
  o.push(tb.svg);
  return [300, 272, o];
};

// ── provider-health ──

// 공개 상태판은 모두에게 같고, 내 계정 소식은 내 자원 이름까지 알려 줘요
figs['health-scope'] = () => {
  const o = [];
  const card = (y, icon, head, sub, ex, tone) => {
    o.push(rect(4, y, 292, 96, { rx: 12, fill: 'card', stroke: tone === 'accent' ? 'accent' : 'line', sw: 1.5 }));
    o.push(icon);
    o.push(t13(78, y + 24, head, { weight: 700, tone: tone === 'accent' ? 'accent' : 'text' }));
    o.push(t13(78, y + 44, sub, { tone: 'sub' }));
    o.push(rect(78, y + 56, 206, 28, { rx: 6, fill: tone === 'accent' ? 'accentWeak' : 'bg', stroke: 'none' }));
    o.push(t13(88, y + 75, ex, { weight: 600, tone: tone === 'accent' ? 'accent' : 'text' }));
  };
  card(4, g.cloud(40, 52), '공개 상태판', '모든 고객에게 같은 공지', 'us-east-1 · EC2 API 지연', 'plain');
  card(110, [g.person(32, 156), g.server(54, 162, { tone: 'accent' })].join('\n'), '내 계정 소식', '영향받는 내 자원까지 알려요', 'i-0a1b2c · 퇴역 예정 11/20', 'accent');
  return [300, 212, o];
};

// AZ b만 한꺼번에 빨개지면 사업자 소식부터, 서버 하나면 서버 안부터
figs['health-grid'] = () => {
  const o = [];
  const grid = (x0, title, bad, verdict, vtone) => {
    o.push(t13(x0, 16, title, { weight: 700 }));
    ['a', 'b', 'c'].forEach((az, j) => o.push(label(x0 + 58 + j * 30, 40, az, 'sub', 600)));
    ['EC2', 'RDS', 'ELB'].forEach((svc, i) => {
      const y = 50 + i * 30;
      o.push(mono(x0, y + 19, svc, { tone: 'sub' }));
      for (let j = 0; j < 3; j++) {
        const isBad = bad(i, j);
        o.push(rect(x0 + 44 + j * 30, y, 26, 26, { rx: 5, fill: isBad ? 'warn' : 'accentWeak', stroke: 'none' }));
      }
    });
    o.push(t13(x0, 160, verdict, { weight: 700, tone: vtone }));
  };
  grid(6, 'AZ 하나가 한꺼번에', (_i, j) => j === 1, '사업자 소식부터', 'accent');
  grid(162, '서버 하나만', (i, j) => i === 0 && j === 0, '서버 안부터', 'text');
  return [300, 170, o];
};

// ── storage: 저장 등급 ──

// 수명 주기 규칙: 30일 뒤 Standard-IA, 1년 뒤 Glacier Flexible, 3년 뒤 지움
figs['s3-lifecycle'] = () => {
  const o = [];
  const step = (x, y, name, get, min, tone) => {
    o.push(rect(x, y, 170, 62, { rx: 8, fill: tone === 'accent' ? 'accentWeak' : 'card', stroke: tone === 'accent' ? 'accent' : 'sub', sw: 1.5 }));
    o.push(text(x + 10, y + 20, name, { size: 13, weight: 700, tone: tone === 'accent' ? 'accent' : 'text' }));
    o.push(t13(x + 10, y + 38, get, { tone: 'sub' }));
    o.push(t13(x + 10, y + 55, min, { tone: 'sub' }));
  };
  step(4, 4, 'S3 Standard', '꺼내기: 바로', '최소 보관: 없음', 'accent');
  step(64, 88, 'S3 Standard-IA', '꺼내기: 바로, GB당 요금', '최소 보관: 30일', 'plain');
  step(126, 172, 'Glacier Flexible', '꺼내기: 몇 분~몇 시간', '최소 보관: 90일', 'plain');
  o.push(arrow([[40, 66], [40, 118], [62, 118]], { tone: 'sub', sw: 2, size: 7 }));
  o.push(text(46, 84, '30일 뒤', { size: 13, weight: 700, tone: 'text' }));
  o.push(arrow([[100, 150], [100, 202], [124, 202]], { tone: 'sub', sw: 2, size: 7 }));
  o.push(text(106, 168, '1년 뒤', { size: 13, weight: 700, tone: 'text' }));
  o.push(arrow([[160, 234], [160, 262], [190, 262]], { tone: 'sub', sw: 2, size: 7 }));
  o.push(g.trash(206, 262));
  o.push(text(224, 267, '3년 뒤 지워요', { size: 13, weight: 700, tone: 'warn' }));
  return [300, 284, o];
};

// 버킷 크기 지표는 하루에 점 하나
figs['s3-daily'] = () => {
  const o = [];
  const p = plot(52, 24, 224, 100, { x0: 0, x1: 72, y0: 1.15, y1: 1.45 });
  o.push(t13(52, 14, 'BucketSizeBytes', { weight: 700, mono: true }));
  o.push(p.yticks([[1.2, '1.2TB'], [1.3, '1.3TB'], [1.4, '1.4TB']]));
  o.push(p.base());
  const pts = [[0, 1.21], [24, 1.27], [48, 1.32], [72, 1.39]];
  o.push(p.line(pts, { tone: 'weak', sw: 1.6, dash: '4 5' }));
  o.push(p.dots(pts, { r: 5, tone: 'accent', ring: true }));
  o.push(p.xticks([[0, '11/8'], [24, '11/9'], [48, '11/10'], [72, '11/11']], { dy: 20 }));
  o.push(text(p.sx(36), p.sy(1.21), '점 사이엔 값이 없어요', { size: 13, weight: 600, tone: 'sub', anchor: 'middle', halo: true }));
  return [300, 152, o];
};

// ── networking: VPC 밖과 잇기 ──

const vpcBox = (o, x, y, name, cidr, tone = 'plain') => {
  o.push(rect(x, y, 120, 62, { rx: 10, fill: tone === 'accent' ? 'accentWeak' : 'card', stroke: tone === 'accent' ? 'accent' : 'sub', sw: 1.5 }));
  o.push(t13(x + 10, y + 22, name, { weight: 700, tone: tone === 'accent' ? 'accent' : 'text' }));
  o.push(mono(x + 10, y + 44, cidr, { tone: 'sub' }));
};

// A–B, A–C 피어링이 있어도 B에서 A를 거쳐 C로는 못 가요
figs['vpc-peering'] = () => {
  const o = [];
  vpcBox(o, 90, 4, 'VPC A', '10.0.0.0/16', 'accent');
  vpcBox(o, 4, 150, 'VPC B', '10.1.0.0/16');
  vpcBox(o, 176, 150, 'VPC C', '10.2.0.0/16');
  o.push(line(118, 66, 70, 150, { tone: 'accent', sw: 2.4 }));
  o.push(line(182, 66, 230, 150, { tone: 'accent', sw: 2.4 }));
  o.push(text(86, 112, '피어링', { size: 13, weight: 700, tone: 'accent', anchor: 'end', halo: true }));
  o.push(text(214, 112, '피어링', { size: 13, weight: 700, tone: 'accent', halo: true }));
  o.push(line(124, 181, 176, 181, { tone: 'warn', sw: 2, dash: '5 4' }));
  o.push(xmark(150, 181, { r: 6 }));
  o.push(text(150, 238, 'B에서 A를 거쳐 C로는 못 가요', { size: 13, weight: 700, tone: 'warn', anchor: 'middle' }));
  return [300, 248, o];
};

// Transit Gateway 하나에 VPC들과 사내망을 이어요. 사내망은 VPN 터널 둘이나 전용선
figs['vpc-hub'] = () => {
  const o = [];
  vpcBox(o, 4, 4, 'VPC A', '10.0.0.0/16');
  vpcBox(o, 176, 4, 'VPC B', '10.1.0.0/16');
  o.push(line(64, 66, 136, 104, { tone: 'sub', sw: 2.2 }));
  o.push(line(236, 66, 164, 104, { tone: 'sub', sw: 2.2 }));
  o.push(g.router(150, 116, { tone: 'accent' }));
  o.push(text(182, 121, 'Transit Gateway', { size: 13, weight: 700, tone: 'accent' }));
  // 사내망
  o.push(zone(30, 196, 252, 62, '사내 데이터센터'));
  o.push(g.router(164, 234));
  o.push(g.server(226, 230));
  o.push(g.server(258, 230));
  // VPN 터널 두 개
  o.push(line(137, 129, 146, 220, { tone: 'sub', sw: 1.8, dash: '5 4' }));
  o.push(line(145, 131, 155, 220, { tone: 'sub', sw: 1.8, dash: '5 4' }));
  o.push(text(126, 162, 'VPN', { size: 13, weight: 700, tone: 'text', anchor: 'end', halo: true }));
  o.push(text(126, 180, '터널 2개', { size: 13, tone: 'sub', anchor: 'end', halo: true }));
  // 전용선
  o.push(line(160, 131, 176, 220, { tone: 'text', sw: 4 }));
  o.push(text(184, 162, '전용선', { size: 13, weight: 700, tone: 'text', halo: true }));
  o.push(text(184, 180, 'Direct Connect', { size: 13, tone: 'sub', halo: true }));
  return [300, 262, o];
};

// 비공개 서브넷의 수집기가 CloudWatch API에 닿는 두 길
figs['vpc-endpoint'] = () => {
  const o = [];
  o.push(g.cloud(150, 30, { tone: 'accent' }));
  o.push(text(196, 36, 'CloudWatch API', { size: 13, weight: 700, tone: 'accent' }));
  o.push(zone(4, 70, 292, 196, 'VPC'));
  // 왼쪽: NAT 길
  o.push(rect(16, 106, 120, 48, { rx: 8, fill: 'card', stroke: 'sub', sw: 1.5 }));
  o.push(label(76, 126, 'NAT 게이트웨이', 'text', 700));
  o.push(label(76, 145, 'GB당 처리 요금', 'warn', 600));
  o.push(arrow([[76, 104], [76, 56], [118, 36]], { tone: 'sub', sw: 2, size: 7, dash: '5 4' }));
  o.push(text(84, 86, '인터넷 쪽', { size: 13, tone: 'sub', halo: true }));
  // 오른쪽: 인터페이스 엔드포인트
  o.push(rect(164, 106, 120, 48, { rx: 8, fill: 'accentWeak', stroke: 'accent', sw: 1.5 }));
  o.push(label(224, 126, '인터페이스', 'accent', 700));
  o.push(label(224, 145, '엔드포인트', 'accent', 700));
  o.push(arrow([[224, 104], [224, 72], [182, 44]], { tone: 'accent', sw: 2.4, size: 7 }));
  o.push(text(230, 88, '사설 IP로', { size: 13, weight: 600, tone: 'accent', halo: true }));
  // 비공개 서브넷의 수집기
  o.push(zone(60, 176, 180, 82, '비공개 서브넷', { dash: null, fill: 'bg', labelPos: 'bottom' }));
  o.push(g.server(150, 210));
  o.push(label(194, 215, '수집기', 'text', 700));
  o.push(arrow([[138, 192], [92, 156]], { tone: 'sub', sw: 2, size: 7, dash: '5 4' }));
  o.push(arrow([[162, 192], [208, 156]], { tone: 'accent', sw: 2.4, size: 7 }));
  return [300, 272, o];
};

// ── iam: 계정이 여러 개일 때 ──

// 조직의 관리 계정 아래 OU와 계정들, 모니터링 계정이 계정마다 역할을 맡아 읽어요
figs['org-accounts'] = () => {
  const o = [];
  const node = (x, y, w, s, sub, tone = 'plain') => {
    o.push(rect(x, y, w, sub ? 44 : 30, { rx: 8, fill: tone === 'accent' ? 'accentWeak' : tone === 'bg' ? 'bg' : 'card', stroke: tone === 'accent' ? 'accent' : 'sub', sw: 1.5 }));
    o.push(label(x + w / 2, y + 20, s, tone === 'accent' ? 'accent' : 'text', 700));
    if (sub) o.push(label(x + w / 2, y + 37, sub, 'sub', 600));
  };
  node(86, 4, 128, '관리 계정', '조직 · 청구서 하나');
  o.push(line(150, 48, 150, 60, { tone: 'sub', sw: 1.6 }));
  o.push(line(66, 60, 234, 60, { tone: 'sub', sw: 1.6 }));
  o.push(line(66, 60, 66, 72, { tone: 'sub', sw: 1.6 }));
  o.push(line(234, 60, 234, 72, { tone: 'sub', sw: 1.6 }));
  node(16, 72, 100, '운영 OU', null, 'bg');
  node(184, 72, 100, '개발 OU', null, 'bg');
  o.push(line(66, 102, 66, 114, { tone: 'sub', sw: 1.6 }));
  o.push(line(36, 114, 112, 114, { tone: 'sub', sw: 1.6 }));
  o.push(line(36, 114, 36, 126, { tone: 'sub', sw: 1.6 }));
  o.push(line(112, 114, 112, 126, { tone: 'sub', sw: 1.6 }));
  o.push(line(234, 102, 234, 126, { tone: 'sub', sw: 1.6 }));
  const acc = [[4, 'prod-a', 36], [80, 'prod-b', 112], [202, 'dev', 234]];
  acc.forEach(([x, s]) => {
    o.push(rect(x, 126, 64, 50, { rx: 8, fill: 'card', stroke: 'sub', sw: 1.5 }));
    o.push(text(x + 32, 146, s, { size: 13, weight: 700, tone: 'text', anchor: 'middle', mono: true }));
    o.push(g.lock(x + 32, 160, { tone: 'accent' }));
  });
  // 모니터링 계정
  node(4, 236, 140, '모니터링 계정', null, 'accent');
  acc.forEach(([, , cx]) => o.push(arrow([[74, 234], [cx, 180]], { tone: 'accent', sw: 1.8, size: 7, dash: '5 4' })));
  o.push(t13(156, 248, '계정마다 역할을', { weight: 700, tone: 'accent' }));
  o.push(t13(156, 266, '맡아 지표를 읽어요', { weight: 700, tone: 'accent' }));
  return [300, 272, o];
};

const only = process.argv.slice(2);
for (const [name, fn] of Object.entries(figs)) {
  if (only.length && !only.some((p) => name.startsWith(p))) continue;
  const [w, h, body] = fn();
  g.save(D, name, w, h, body);
}
console.log('done');
