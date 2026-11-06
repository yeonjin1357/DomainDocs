// 서버·OS 글의 SVG 그림. 실행: node scripts/figures/server.mjs [이름 접두어...]
import * as g from './lib.mjs';

const { text, tag, line, arrow, zone, table, rect, bubble, ladder, xmark, plot } = g;
const D = 'server';
const figs = {};
const label = (x, y, s, tone = 'sub', weight = 600) => text(x, y, s, { size: 13, weight, tone, anchor: 'middle' });
const t13 = (x, y, s, o = {}) => text(x, y, s, { size: 13, ...o });

// ── overview ──

// 앱 → 커널 → 하드웨어, 세 층
figs['srv-layers'] = () => {
  const o = [];
  // 앱
  o.push(rect(4, 4, 292, 70, { rx: 12, fill: 'card', stroke: 'line', sw: 1.2 }));
  o.push(t13(16, 24, '앱(프로세스)', { weight: 700 }));
  [['웹 서버', 62], ['DB', 150], ['에이전트', 238]].forEach(([s, cx]) => o.push(g.app(cx, 50, s, { w: 78 })));
  // 앱 → 커널
  o.push(arrow([[40, 76], [40, 102]], { tone: 'accent', sw: 2.2, size: 7 }));
  o.push(arrow([[260, 76], [260, 102]], { tone: 'accent', sw: 2.2, size: 7 }));
  o.push(label(150, 94, '시스템 콜로 부탁해요', 'accent', 700));
  // 커널
  o.push(rect(4, 104, 292, 70, { rx: 12, fill: 'accentWeak', stroke: 'accent', sw: 1.5 }));
  o.push(t13(16, 124, '운영체제 커널', { weight: 700, tone: 'accent' }));
  [['일정 짜기', 62], ['메모리 나누기', 150], ['입출력', 238]].forEach(([s, cx]) => o.push(tag(cx, 150, s, { tone: 'plain', weight: 600 })));
  // 커널 → 하드웨어
  o.push(arrow([[40, 176], [40, 202]], { tone: 'sub', sw: 2.2, size: 7 }));
  o.push(arrow([[260, 176], [260, 202]], { tone: 'sub', sw: 2.2, size: 7 }));
  o.push(label(150, 194, '하드웨어를 나눠 줘요', 'sub', 700));
  // 하드웨어
  o.push(rect(4, 204, 292, 92, { rx: 12, fill: 'card', stroke: 'line', sw: 1.2 }));
  o.push(t13(16, 224, '하드웨어', { weight: 700 }));
  o.push(g.chip(46, 252));
  o.push(g.ram(116, 250));
  o.push(g.hdd(186, 252));
  o.push(g.jack(256, 252));
  [['CPU', 46], ['메모리', 116], ['디스크', 186], ['네트워크', 256]].forEach(([s, cx]) => o.push(label(cx, 286, s, 'text', 600)));
  return [300, 300, o];
};

// ── processes-and-threads ──

// 프로세스 A의 스레드 둘은 메모리 A를 함께, 프로세스 B는 A의 메모리를 못 봐요
figs['pt-isolation'] = () => {
  const o = [];
  o.push(zone(4, 4, 186, 184, '프로세스 A', { fill: 'card', dash: null, labelTone: 'text' }));
  o.push(zone(198, 4, 98, 184, '프로세스 B', { fill: 'card', dash: null, labelTone: 'text' }));
  const thr = (cx, name) => {
    o.push(label(cx, 44, name, 'text', 700));
    o.push(g.thread(cx - 14, 54, 52, { tone: 'accent' }));
    o.push(rect(cx - 2, 62, 34, 22, { rx: 4, fill: 'bg', stroke: 'line', sw: 1.2 }));
    o.push(label(cx + 15, 78, '스택', 'sub', 600));
  };
  thr(52, '스레드 1');
  thr(138, '스레드 2');
  thr(240, '스레드');
  // 메모리
  o.push(rect(18, 122, 158, 52, { rx: 8, fill: 'accentWeak', stroke: 'accent', sw: 1.5 }));
  o.push(label(97, 144, '메모리 A', 'accent', 700));
  o.push(label(97, 163, '코드 · 데이터 · 힙', 'sub', 600));
  o.push(rect(208, 122, 78, 52, { rx: 8, fill: 'bg', stroke: 'sub', sw: 1.5 }));
  o.push(label(247, 144, '메모리 B', 'text', 700));
  o.push(label(247, 163, '자기 것만', 'sub', 600));
  // 막힘
  o.push(arrow([[226, 108], [182, 134]], { tone: 'warn', sw: 1.8, size: 7, dash: '4 3', end: false }));
  o.push(xmark(193, 128, { r: 5 }));
  o.push(t13(150, 214, '스레드는 메모리를 함께 쓰고, 스택만 따로 가져요', { tone: 'sub', anchor: 'middle' }));
  o.push(t13(150, 234, 'B는 A의 메모리를 볼 수 없어요', { weight: 700, tone: 'warn', anchor: 'middle' }));
  return [300, 242, o];
};

// ── cpu-usage ──

// 물리 코어 2개 × 흐름 2개 = 논리 CPU 4개
figs['cpu-logical'] = () => {
  const o = [];
  o.push(t13(8, 18, 'CPU 칩 하나', { weight: 700 }));
  o.push(t13(292, 18, '코어마다 실행 흐름 2개(SMT)', { tone: 'sub', anchor: 'end' }));
  o.push(rect(6, 28, 288, 108, { rx: 12, fill: 'card', stroke: 'sub', sw: 1.8 }));
  const flows = [];
  [[18, '물리 코어 1'], [154, '물리 코어 2']].forEach(([x, name]) => {
    o.push(rect(x, 40, 128, 84, { rx: 8, fill: 'bg', stroke: 'line', sw: 1.2 }));
    o.push(t13(x + 10, 58, name, { weight: 700 }));
    for (const dx of [36, 92]) {
      o.push(g.thread(x + dx, 66, 44, { tone: 'accent', amp: 3.5 }));
      flows.push(x + dx);
    }
  });
  flows.forEach((cx, i) => {
    o.push(line(cx, 118, cx, 152, { tone: 'accent', sw: 1.8, dash: '3 3' }));
    o.push(g.head(cx, 160, cx, 150, { tone: 'accent', size: 7 }));
    o.push(rect(cx - 25, 162, 50, 30, { rx: 6, fill: 'accent', stroke: 'none' }));
    o.push(text(cx, 182, `cpu${i}`, { size: 13, weight: 700, tone: 'card', anchor: 'middle', mono: true }));
  });
  o.push(text(150, 220, '운영체제에는 논리 CPU 4개로 보여요', { size: 14, weight: 700, tone: 'accent', anchor: 'middle' }));
  o.push(t13(150, 240, 'nproc → 4', { tone: 'sub', anchor: 'middle', mono: true }));
  return [300, 248, o];
};

// CPU가 바쁠 때와 디스크를 기다릴 때: 사용률과 부하가 세는 것
const cpuScene = (o, y0, title, run, ready, disk, use, load) => {
  o.push(rect(4, y0, 292, 134, { rx: 12, fill: 'card', stroke: 'none' }));
  o.push(text(16, y0 + 22, title, { size: 14, weight: 700 }));
  for (let i = 0; i < 4; i++) {
    const x = 16 + i * 38;
    const busy = i < run;
    o.push(rect(x, y0 + 36, 32, 32, { rx: 6, fill: busy ? 'accentWeak' : 'bg', stroke: busy ? 'accent' : 'line', sw: 1.5 }));
    if (busy) o.push(g.circle(x + 16, y0 + 52, 7, { fill: 'accent' }));
    else o.push(label(x + 16, y0 + 57, '쉼', 'weak', 600));
  }
  o.push(t13(16, y0 + 88, '코어 4개', { tone: 'sub' }));
  o.push(t13(176, y0 + 40, 'CPU 차례 기다림', { tone: 'sub' }));
  if (ready) for (let j = 0; j < ready; j++) o.push(g.circle(182 + j * 14, y0 + 56, 5.5, { fill: 'card', stroke: 'accent', sw: 1.8 }));
  else o.push(t13(176, y0 + 61, '없음', { tone: 'weak' }));
  o.push(t13(176, y0 + 80, '디스크 기다림', { tone: 'sub' }));
  if (disk) for (let j = 0; j < disk; j++) o.push(g.circle(182 + j * 14, y0 + 96, 5.5, { fill: 'warnWeak', stroke: 'warn', sw: 1.8 }));
  else o.push(t13(176, y0 + 101, '없음', { tone: 'weak' }));
  o.push(line(16, y0 + 106, 284, y0 + 106, { tone: 'line', sw: 1, cap: 'butt' }));
  o.push(t13(16, y0 + 124, `사용률 ${use}`, { weight: 700, tone: 'accent' }));
  o.push(t13(284, y0 + 124, load, { weight: 700, tone: 'warn', anchor: 'end' }));
};
figs['cpu-load'] = () => {
  const o = [];
  cpuScene(o, 4, 'CPU가 바쁠 때', 4, 4, 0, '100%', '부하 8 = 실행 4 + 기다림 4');
  cpuScene(o, 146, '디스크를 기다릴 때', 1, 0, 8, '25%', '부하 9 = 실행 1 + 디스크 8');
  o.push(g.circle(20, 300, 5, { fill: 'accent' }));
  o.push(t13(30, 305, '실행 중', { tone: 'sub' }));
  o.push(g.circle(100, 300, 5, { fill: 'card', stroke: 'accent', sw: 1.8 }));
  o.push(t13(110, 305, '차례 기다림', { tone: 'sub' }));
  o.push(g.circle(204, 300, 5, { fill: 'warnWeak', stroke: 'warn', sw: 1.8 }));
  o.push(t13(214, 305, '디스크 기다림', { tone: 'sub' }));
  return [300, 312, o];
};

// ── memory ──

// 주소 공간과 실제 메모리: RSS는 올라온 칸, 공유 칸은 양쪽 RSS에
figs['mem-rss'] = () => {
  const o = [];
  const CH = 24;
  const GAP = 5;
  const Y = (i) => 48 + i * (CH + GAP);
  const col = (x, w, title, sub, cells) => {
    o.push(label(x + w / 2, 16, title, 'text', 700));
    o.push(label(x + w / 2, 34, sub, 'sub', 400));
    cells.forEach(([s, kind], i) => {
      const solid = kind !== 'addr';
      const fill = kind === 'shared' ? 'warnWeak' : solid ? 'accentWeak' : 'none';
      const stroke = kind === 'shared' ? 'warn' : solid ? 'accent' : 'weak';
      o.push(rect(x, Y(i), w, CH, { rx: 5, fill, stroke, sw: 1.4, dash: solid ? undefined : '4 3' }));
      o.push(label(x + w / 2, Y(i) + 17, s, kind === 'shared' ? 'warn' : solid ? 'accent' : 'weak', solid ? 700 : 600));
    });
  };
  col(6, 78, '프로세스 A', '주소 공간', [['A', 'a'], ['A', 'a'], ['공유', 'shared'], ['주소만', 'addr'], ['주소만', 'addr'], ['주소만', 'addr']]);
  col(111, 78, '실제 메모리', 'RAM', [['A', 'a'], ['A', 'a'], ['공유', 'shared'], ['B', 'a']]);
  col(216, 78, '프로세스 B', '주소 공간', [['공유', 'shared'], ['B', 'a'], ['주소만', 'addr'], ['주소만', 'addr']]);
  const mid = (i) => Y(i) + CH / 2;
  [[0, 0], [1, 1], [2, 2]].forEach(([a, b]) => o.push(arrow([[84, mid(a)], [111, mid(b)]], { tone: a === 2 ? 'warn' : 'accent', sw: 1.6, size: 6 })));
  [[0, 2], [1, 3]].forEach(([a, b]) => o.push(arrow([[216, mid(a)], [189, mid(b)]], { tone: a === 0 ? 'warn' : 'accent', sw: 1.6, size: 6 })));
  o.push(label(45, Y(6) + 14, 'RSS 3칸', 'accent', 700));
  o.push(label(45, Y(6) + 32, 'VmSize 6칸', 'sub', 600));
  o.push(label(150, Y(4) + 14, '실제로 4칸', 'text', 700));
  o.push(label(255, Y(4) + 14, 'RSS 2칸', 'accent', 700));
  o.push(label(255, Y(4) + 32, 'VmSize 4칸', 'sub', 600));
  o.push(rect(102, Y(5) + 8, 192, 50, { rx: 10, fill: 'warnWeak', stroke: 'none' }));
  o.push(label(198, Y(5) + 29, 'RSS를 더하면 3 + 2 = 5칸', 'warn', 700));
  o.push(label(198, Y(5) + 48, '공유 칸을 두 번 세요', 'sub', 600));
  return [300, Y(6) + 42, o];
};

// 메모리가 모자라면: 되찾기(스왑·캐시 비우기) → OOM killer
figs['mem-pressure'] = () => {
  const o = [];
  o.push(t13(8, 16, '메모리가 거의 찼어요', { weight: 700 }));
  const X = (p) => 8 + p * 2.84;
  o.push(rect(X(0), 26, X(55) - X(0), 28, { rx: 4, fill: 'line', stroke: 'none' }));
  o.push(rect(X(55), 26, X(97) - X(55), 28, { rx: 0, fill: 'accentWeak', stroke: 'none' }));
  o.push(rect(X(97), 26, X(100) - X(97), 28, { rx: 2, fill: 'warn', stroke: 'none' }));
  o.push(rect(X(0), 26, X(100) - X(0), 28, { rx: 4, fill: 'none', stroke: 'sub', sw: 1.5 }));
  o.push(label(X(27.5), 45, '프로그램', 'text', 700));
  o.push(label(X(76), 45, '파일 캐시', 'accent', 700));
  o.push(t13(292, 72, 'free 거의 0', { tone: 'warn', weight: 600, anchor: 'end' }));
  // 1. 되찾기
  o.push(g.badge(84, 104, 1, { tone: 'sub' }));
  o.push(t13(98, 109, '커널이 되찾아요', { weight: 700 }));
  o.push(arrow([[X(27.5), 56], [X(27.5), 70], [56, 70], [56, 124]], { tone: 'sub', sw: 2, size: 7 }));
  o.push(g.hdd(56, 146));
  o.push(label(56, 180, '덜 쓰는 메모리를', 'text', 600));
  o.push(label(56, 198, '스왑(디스크)으로', 'text', 600));
  o.push(arrow([[X(76), 56], [X(76), 124]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(g.trash(X(76), 146, { tone: 'sub' }));
  o.push(label(X(76), 180, '파일 캐시를', 'text', 600));
  o.push(label(X(76), 198, '비워요', 'text', 600));
  // 2. OOM
  o.push(line(8, 214, 292, 214, { tone: 'line', sw: 1, cap: 'butt' }));
  o.push(g.badge(18, 236, 2, { tone: 'warn' }));
  o.push(t13(34, 241, '그래도 모자라면 OOM killer', { weight: 700, tone: 'warn' }));
  [[60, '점수 120', false], [150, '점수 870', true], [240, '점수 40', false]].forEach(([cx, s, kill]) => {
    o.push(g.app(cx, 270, s, { w: 80, tone: kill ? 'warn' : undefined }));
    if (kill) o.push(label(cx, 300, '끝내요', 'warn', 700));
  });
  o.push(t13(150, 322, '점수(0~1000)가 가장 높은 프로세스를 골라요', { tone: 'sub', anchor: 'middle' }));
  return [300, 330, o];
};

// ── disk-io ──

// 작은 요청을 많이 vs 큰 요청을 적게
figs['dio-size'] = () => {
  const o = [];
  const lane = (y0, title, ex, boxes, bs, formula, result, limit) => {
    o.push(rect(4, y0, 292, 126, { rx: 12, fill: 'card', stroke: 'none' }));
    o.push(text(16, y0 + 22, title, { size: 14, weight: 700 }));
    o.push(t13(284, y0 + 22, ex, { tone: 'sub', anchor: 'end' }));
    const cy = y0 + 52;
    let x = 16;
    for (let i = 0; i < boxes; i++) {
      o.push(rect(x, cy - bs / 2, bs, bs, { rx: bs > 12 ? 4 : 2, fill: 'accentWeak', stroke: 'accent', sw: 1.2 }));
      x += bs + (bs > 12 ? 8 : 4);
    }
    o.push(arrow([[x + 2, cy], [226, cy]], { tone: 'accent', sw: 2, size: 7 }));
    o.push(g.hdd(258, cy));
    o.push(t13(16, y0 + 92, formula, { weight: 600 }));
    o.push(t13(284, y0 + 92, result, { weight: 700, tone: 'accent', anchor: 'end' }));
    o.push(t13(16, y0 + 114, limit, { tone: 'sub' }));
  };
  lane(4, '작은 요청을 많이', 'DB의 무작위 읽기', 14, 7, '4KB × 초당 1,000번', '≈ 4MB/초', '먼저 닿는 한계: 초당 횟수(IOPS)');
  lane(138, '큰 요청을 적게', '백업, 큰 파일 복사', 4, 28, '1MB × 초당 200번', '≈ 200MB/초', '먼저 닿는 한계: 처리량');
  return [300, 268, o];
};

// ── filesystem-and-capacity ──

// 이름 → inode → 데이터 블록
figs['fs-inode'] = () => {
  const o = [];
  o.push(t13(4, 14, '디렉터리 /var/log', { weight: 700 }));
  const t = table(4, 24, [{ t: '이름', w: 86 }, { t: 'inode', w: 56, align: 'right' }], [['syslog', '1801'], ['app.log', '2049'], ['auth.log', '1777']], { hl: [1], mono: true });
  o.push(t.svg);
  const ry = 24 + 24 + 24 + 12;
  o.push(arrow([[146, ry], [168, ry]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(rect(168, 24, 128, 120, { rx: 8, fill: 'accentWeak', stroke: 'accent', sw: 1.5 }));
  o.push(t13(178, 44, 'inode 2049', { weight: 700, tone: 'accent' }));
  [['크기', '8KB'], ['권한', 'rw-r-----'], ['시각', '10:02']].forEach(([k, v], i) => {
    o.push(t13(178, 68 + i * 22, k, { tone: 'sub' }));
    o.push(text(214, 68 + i * 22, v, { size: 13, weight: 600, mono: k === '권한' }));
  });
  o.push(t13(178, 134, '블록', { tone: 'sub' }));
  o.push(t13(214, 134, '5, 9', { weight: 700, tone: 'accent' }));
  o.push(t13(4, 172, '데이터 블록', { weight: 700 }));
  const BX = (i) => 6 + i * 24;
  for (let i = 0; i < 12; i++) {
    const hit = i === 5 || i === 9;
    o.push(rect(BX(i), 182, 22, 26, { rx: 3, fill: hit ? 'accent' : 'bg', stroke: hit ? 'none' : 'line', sw: 1.2 }));
    o.push(label(BX(i) + 11, 200, String(i), hit ? 'card' : 'weak', hit ? 700 : 400));
  }
  o.push(arrow([[226, 146], [BX(5) + 11, 180]], { tone: 'accent', sw: 1.8, size: 7 }));
  o.push(arrow([[240, 146], [BX(9) + 11, 180]], { tone: 'accent', sw: 1.8, size: 7 }));
  o.push(t13(150, 230, 'app.log의 내용은 블록 5와 9에 있어요', { tone: 'sub', anchor: 'middle' }));
  return [300, 238, o];
};

// 용량이 찰 때와 inode가 찰 때
figs['fs-two-full'] = () => {
  const o = [];
  const panel = (px, title, inodeUsed, blockUsed, cause, cmd, blocked) => {
    o.push(rect(px, 4, 144, 262, { rx: 12, fill: 'card', stroke: 'none' }));
    o.push(text(px + 12, 26, title, { size: 14, weight: 700 }));
    const grid = (y, n, used, warnFull) => {
      for (let i = 0; i < n; i++) {
        const c = i % 6;
        const r = Math.floor(i / 6);
        const on = i < used;
        o.push(rect(px + 12 + c * 20, y + r * 17, 16, 13, { rx: 2, fill: on ? (warnFull ? 'warn' : 'accent') : 'bg', stroke: on ? 'none' : 'line', sw: 1, op: on && !warnFull ? 0.75 : undefined }));
      }
    };
    o.push(t13(px + 12, 48, 'inode', { tone: 'sub', weight: 600 }));
    o.push(t13(px + 132, 48, `${Math.round((inodeUsed / 12) * 100)}%`, { weight: 700, tone: inodeUsed === 12 ? 'warn' : 'sub', anchor: 'end' }));
    grid(56, 12, inodeUsed, inodeUsed === 12);
    o.push(t13(px + 12, 110, '데이터 블록', { tone: 'sub', weight: 600 }));
    o.push(t13(px + 132, 110, `${Math.round((blockUsed / 18) * 100)}%`, { weight: 700, tone: blockUsed === 18 ? 'warn' : 'sub', anchor: 'end' }));
    grid(118, 18, blockUsed, blockUsed === 18);
    o.push(line(px + 12, 178, px + 132, 178, { tone: 'line', sw: 1, cap: 'butt' }));
    o.push(t13(px + 12, 198, cause, { weight: 600 }));
    o.push(t13(px + 12, 220, blocked, { tone: 'warn', weight: 600 }));
    o.push(tag(px + 12, 246, cmd, { tone: 'soft', anchor: 'start' }));
    o.push(t13(px + 14 + tag.width(cmd), 251, '로 봐요', { tone: 'sub' }));
  };
  panel(4, '용량이 찰 때', 2, 18, '큰 로그, 백업 파일', 'df', '파일에 더 못 써요');
  panel(152, 'inode가 찰 때', 12, 4, '작은 파일 수십만 개', 'df -i', '새 파일을 못 만들어요');
  o.push(bubble(150, 290, '둘 다 No space left on device', { tone: 'warn', tail: 'up' }));
  return [300, 308, o];
};

// ── services-and-logs ──

// systemd가 서비스를 띄우고, 로그는 journald로
figs['svc-systemd'] = () => {
  const o = [];
  o.push(rect(70, 6, 160, 50, { rx: 10, fill: 'accentWeak', stroke: 'accent', sw: 1.5 }));
  o.push(g.gear(94, 31, { tone: 'accent' }));
  o.push(text(114, 27, 'systemd', { size: 14, weight: 700, tone: 'accent' }));
  o.push(t13(114, 45, 'PID 1', { tone: 'sub' }));
  o.push(arrow([[118, 56], [70, 96]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(arrow([[182, 56], [230, 96]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(label(150, 86, '띄워요', 'accent', 700));
  o.push(g.app(70, 112, '수집 에이전트', { w: 116 }));
  o.push(g.app(230, 112, '웹 서버', { w: 116 }));
  // journald
  o.push(rect(100, 196, 100, 50, { rx: 10, fill: 'card', stroke: 'sub', sw: 1.5 }));
  o.push(g.doc(124, 221, { lines: 3 }));
  o.push(text(142, 217, 'journald', { size: 13, weight: 700 }));
  o.push(t13(142, 235, '로그 모음', { tone: 'sub' }));
  o.push(arrow([[86, 126], [128, 194]], { tone: 'sub', sw: 1.8, size: 7, dash: '4 3' }));
  o.push(arrow([[214, 126], [172, 194]], { tone: 'sub', sw: 1.8, size: 7, dash: '4 3' }));
  o.push(label(150, 170, '표준 출력·에러', 'sub', 600));
  o.push(g.chip(30, 221, { size: 24 }));
  o.push(label(30, 254, '커널', 'text', 700));
  o.push(arrow([[48, 221], [98, 221]], { tone: 'sub', sw: 1.8, size: 7, dash: '4 3' }));
  o.push(g.doc(262, 221, { lines: 2 }));
  o.push(t13(296, 254, 'access.log', { weight: 600, anchor: 'end' }));
  o.push(arrow([[262, 126], [262, 200]], { tone: 'weak', sw: 1.6, size: 6 }));
  o.push(t13(292, 284, '파일에 쓴 로그는 journald를 안 거쳐요', { tone: 'sub', anchor: 'end' }));
  return [300, 292, o];
};

// 다시 띄우기를 끔(no)과 켬(on-failure)
figs['svc-restart'] = () => {
  const o = [];
  const X0 = 74;
  const X1 = 286;
  const panel = (y0, title, runs, deadFrom, state, note, noteTone) => {
    o.push(rect(4, y0, 292, 136, { rx: 12, fill: 'card', stroke: 'none' }));
    o.push(text(16, y0 + 22, title, { size: 14, weight: 700 }));
    o.push(t13(16, y0 + 64, '프로세스', { tone: 'sub' }));
    runs.forEach(([a, b], i) => {
      o.push(rect(a, y0 + 52, b - a, 16, { rx: 4, fill: 'accent', stroke: 'none' }));
      o.push(xmark(b + 1, y0 + 60, { r: 4.5, sw: 2.2 }));
      if (i < runs.length - 1) o.push(text((b + runs[i + 1][0]) / 2 + 1, y0 + 46, '↻', { size: 13, weight: 700, tone: 'accent', anchor: 'middle' }));
    });
    if (deadFrom) o.push(line(deadFrom + 8, y0 + 60, X1, y0 + 60, { tone: 'weak', sw: 1.6, dash: '3 4', cap: 'butt' }));
    o.push(t13(16, y0 + 98, '상태', { tone: 'sub' }));
    state.forEach(([a, b, s, tone]) => {
      o.push(rect(a, y0 + 82, b - a - 2, 22, { rx: 5, fill: tone === 'warn' ? 'warnWeak' : 'accentWeak', stroke: 'none' }));
      o.push(text((a + b) / 2 - 1, y0 + 98, s, { size: 13, weight: 700, tone: tone === 'warn' ? 'warn' : 'accent', anchor: 'middle' }));
    });
    o.push(t13(16, y0 + 126, note, { weight: 600, tone: noteTone }));
  };
  panel(4, '끔(Restart=no, 기본값)', [[X0, 150]], 150, [[X0, 152, 'active'], [152, X1 + 2, 'failed', 'warn']], '상태가 failed인지 보면 돼요', 'text');
  panel(148, '켬(Restart=on-failure)', [[X0, 112], [128, 166], [182, 220], [236, 270]], null, [[X0, X1 + 2, '대부분 active']], '재시작 횟수와 켜진 시각을 봐요', 'warn');
  o.push(t13(150, 302, '↻ 죽고 100ms 뒤 다시 띄워요', { tone: 'sub', anchor: 'middle' }));
  return [300, 310, o];
};

// 링 버퍼: 가득 차면 가장 오래된 메시지가 밀려나요
const sector = (cx, cy, r0, r1, a0, a1) => {
  const p = (r, a) => `${(cx + r * Math.cos(a)).toFixed(1)} ${(cy + r * Math.sin(a)).toFixed(1)}`;
  return `M${p(r1, a0)} A${r1} ${r1} 0 0 1 ${p(r1, a1)} L${p(r0, a1)} A${r0} ${r0} 0 0 0 ${p(r0, a0)} z`;
};
figs['svc-ring'] = () => {
  const o = [];
  const ring = (cx, cy, vals, hl) => {
    const n = 6;
    vals.forEach((v, i) => {
      const a0 = -Math.PI / 2 + (i / n) * Math.PI * 2 + 0.04;
      const a1 = -Math.PI / 2 + ((i + 1) / n) * Math.PI * 2 - 0.04;
      const isNew = hl === i;
      o.push(g.path(sector(cx, cy, 30, 56, a0, a1), { fill: isNew ? 'accent' : 'accentWeak', stroke: isNew ? 'accent' : 'none', sw: 1 }));
      const am = (a0 + a1) / 2;
      o.push(text(cx + 43 * Math.cos(am), cy + 43 * Math.sin(am) + 5, String(v), { size: 14, weight: 700, tone: isNew ? 'card' : 'accent', anchor: 'middle' }));
    });
  };
  o.push(label(64, 18, '가득 찬 링 버퍼', 'text', 700));
  ring(64, 96, [1, 2, 3, 4, 5, 6]);
  o.push(t13(64, 101, '6칸', { tone: 'sub', anchor: 'middle', weight: 600 }));
  o.push(arrow([[124, 96], [142, 96]], { tone: 'sub', sw: 2, size: 7 }));
  o.push(label(202, 18, '7이 들어온 뒤', 'text', 700));
  ring(202, 96, [7, 2, 3, 4, 5, 6], 0);
  o.push(t13(202, 101, '6칸', { tone: 'sub', anchor: 'middle', weight: 600 }));
  // 밀려난 1
  o.push(g.circle(280, 52, 11, { fill: 'none', stroke: 'weak', sw: 1.5, dash: '3 3' }));
  o.push(text(280, 57, '1', { size: 13, weight: 700, tone: 'weak', anchor: 'middle' }));
  o.push(arrow([[246, 60], [266, 55]], { tone: 'warn', sw: 1.6, size: 6, dash: '3 3' }));
  o.push(label(278, 84, '밀려남', 'warn', 700));
  o.push(t13(150, 182, '크기가 정해져 있어서, 가득 차면', { tone: 'sub', anchor: 'middle' }));
  o.push(t13(150, 202, '가장 오래된 메시지 자리에 새 메시지를 써요', { weight: 700, anchor: 'middle' }));
  return [300, 210, o];
};

// ── windows ──

// 리눅스와 윈도우: 숫자, 서비스, 기록, 에이전트
figs['win-map'] = () => {
  const o = [];
  const L = 58;
  const W = 117;
  const R = L + W + 4;
  o.push(rect(L, 4, W, 30, { rx: 8, fill: 'line', stroke: 'none' }));
  o.push(rect(R, 4, W, 30, { rx: 8, fill: 'line', stroke: 'none' }));
  o.push(label(L + W / 2, 24, '리눅스', 'text', 700));
  o.push(label(R + W / 2, 24, '윈도우', 'text', 700));
  const rows = [
    ['숫자', (x, y) => g.panel(x, y, { w: 32, h: 24 }), ['/proc · /sys', '가상 파일'], ['성능 카운터', 'Get-Counter']],
    ['서비스', (x, y) => g.gear(x, y, { r: 10 }), ['systemd', 'systemctl'], ['SCM', '서비스 제어 관리자']],
    ['기록', (x, y) => g.doc(x, y, { lines: 3 }), ['journald', '커널 로그도 모아요'], ['이벤트 로그', 'System 로그 등']],
    ['에이전트', (x, y) => g.server(x, y), ['node_exporter', 'Prometheus용'], ['windows_exporter', 'Prometheus용']],
  ];
  rows.forEach(([name, icon, a, b], i) => {
    const y = 40 + i * 60;
    o.push(rect(4, y, 292, 56, { rx: 10, fill: 'card', stroke: 'none' }));
    o.push(icon(30, y + 19));
    o.push(label(30, y + 52, name, 'sub', 600));
    [[L, a], [R, b]].forEach(([x, [m, s]]) => {
      const mono = /_/.test(m);
      const fit = mono && m.length * 7.9 > W - 14 ? W - 14 : undefined;
      o.push(text(x + 8, y + 24, m, { size: 13, weight: 700, mono, fit }));
      o.push(t13(x + 8, y + 43, s, { tone: 'sub', mono: s === 'Get-Counter' || s === 'systemctl' }));
    });
    o.push(line(R - 2, y + 10, R - 2, y + 46, { tone: 'line', sw: 1, cap: 'butt' }));
  });
  return [300, 40 + 4 * 60 - 4, o];
};

// 같은 순간을 리눅스 부하와 윈도우 프로세서 큐 길이로 세면
figs['win-queue'] = () => {
  const o = [];
  o.push(rect(4, 4, 292, 112, { rx: 12, fill: 'card', stroke: 'none' }));
  o.push(text(16, 26, '같은 순간의 서버', { size: 14, weight: 700 }));
  o.push(t13(284, 26, '논리 CPU 4개', { tone: 'sub', anchor: 'end' }));
  for (let i = 0; i < 4; i++) {
    const x = 16 + i * 38;
    o.push(rect(x, 40, 32, 32, { rx: 6, fill: 'accentWeak', stroke: 'accent', sw: 1.5 }));
    o.push(g.circle(x + 16, 56, 7, { fill: 'accent' }));
  }
  o.push(t13(16, 92, '실행 중 4', { tone: 'sub' }));
  o.push(t13(176, 46, 'CPU 차례 기다림', { tone: 'sub' }));
  for (let j = 0; j < 3; j++) o.push(g.circle(182 + j * 14, 62, 5.5, { fill: 'card', stroke: 'accent', sw: 1.8 }));
  o.push(t13(176, 86, '디스크 기다림', { tone: 'sub' }));
  for (let j = 0; j < 2; j++) o.push(g.circle(182 + j * 14, 102, 5.5, { fill: 'warnWeak', stroke: 'warn', sw: 1.8 }));
  const dots = (x, y, kinds) => kinds.forEach((k, i) => o.push(g.circle(x + 6 + i * 13, y, 5, k === 'r' ? { fill: 'accent' } : k === 'q' ? { fill: 'card', stroke: 'accent', sw: 1.8 } : { fill: 'warnWeak', stroke: 'warn', sw: 1.8 })));
  const card = (px, l1, l2, num, kinds, what, note) => {
    o.push(rect(px, 124, 144, 160, { rx: 12, fill: 'card', stroke: 'none' }));
    o.push(text(px + 12, 146, l1, { size: 13, weight: 700 }));
    o.push(t13(px + 12, 164, l2, { tone: 'sub', weight: 600 }));
    o.push(text(px + 12, 202, num, { size: 28, weight: 700, tone: 'accent' }));
    dots(px + 10, 222, kinds);
    o.push(t13(px + 12, 250, what, { weight: 600 }));
    o.push(t13(px + 12, 270, note, { tone: 'sub' }));
  };
  card(4, '리눅스 부하', 'load average', '9', ['r', 'r', 'r', 'r', 'q', 'q', 'q', 'd', 'd'], '셋을 모두 세요', '1·5·15분 평균');
  card(152, '윈도우 Processor', 'Queue Length', '3', ['q', 'q', 'q'], '차례 기다림만', 'CPU 수로 나눠 봐요');
  return [300, 288, o];
};

// System 로그에서 먼저 보는 이벤트 ID
figs['win-events'] = () => {
  const o = [];
  const cols = [{ t: 'ID', w: 56 }, { t: '원본', w: 92 }, { t: '뜻', w: 144 }];
  o.push(t13(4, 16, '서버가 다시 켜졌을 때', { weight: 700 }));
  o.push(table(4, 26, cols, [['6008', 'EventLog', '갑자기 꺼졌어요'], ['1074', 'User32', '누가 재시작·종료함']], { hl: [0], hlTone: 'warn', rowH: 28 }).svg);
  o.push(t13(4, 130, '서비스가 죽었을 때', { weight: 700 }));
  o.push(table(4, 140, cols, [['7034', 'SCM', '갑자기 끝났어요'], ['7031', 'SCM', '끝나서 복구 동작']], { hl: [0], hlTone: 'warn', rowH: 28 }).svg);
  o.push(t13(296, 236, 'SCM: 서비스 제어 관리자', { tone: 'sub', anchor: 'end' }));
  return [300, 244, o];
};

// ── metrics-sources ──

// 커널 → 에이전트 → 모니터링 서버 → 화면
figs['ms-path'] = () => {
  const o = [];
  o.push(zone(4, 4, 168, 206, '서버', { fill: 'card', dash: null, labelTone: 'text' }));
  o.push(g.app(88, 52, '에이전트', { w: 100, tone: 'accent' }));
  o.push(arrow([[88, 104], [88, 68]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(t13(80, 84, '간격마다', { tone: 'accent', weight: 600, anchor: 'end' }));
  o.push(t13(80, 101, '읽어요', { tone: 'accent', weight: 600, anchor: 'end' }));
  o.push(g.doc(50, 130, { lines: 3 }));
  o.push(g.doc(126, 130, { lines: 3 }));
  o.push(text(50, 162, '/proc', { size: 13, weight: 700, anchor: 'middle', mono: true }));
  o.push(text(126, 162, '/sys', { size: 13, weight: 700, anchor: 'middle', mono: true }));
  o.push(rect(14, 172, 148, 30, { rx: 6, fill: 'bg', stroke: 'line', sw: 1.2 }));
  o.push(g.chip(34, 187, { size: 16 }));
  o.push(t13(50, 192, '커널이 내놓은 값', { weight: 600 }));
  // 모니터링 서버
  o.push(arrow([[138, 40], [216, 40]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(t13(178, 30, '보내요(push)', { tone: 'accent', weight: 600, anchor: 'middle', halo: 'bg' }));
  o.push(arrow([[216, 62], [138, 62]], { tone: 'sub', sw: 1.8, size: 7, dash: '4 3' }));
  o.push(t13(162, 80, '가져가요(pull)', { tone: 'sub', weight: 600, anchor: 'middle', halo: 'bg' }));
  o.push(g.db(250, 50));
  o.push(label(250, 92, '모니터링 서버', 'text', 700));
  o.push(label(250, 110, '시계열 저장', 'sub', 400));
  o.push(arrow([[250, 118], [250, 140]], { tone: 'sub', sw: 2, size: 7 }));
  o.push(g.panel(250, 164, { w: 60, h: 42 }));
  o.push(label(250, 204, '화면', 'text', 700));
  o.push(label(250, 222, '계산해 그려요', 'sub', 400));
  return [300, 228, o];
};

// 컨테이너 안에서 /proc 파일과 cgroup 파일
figs['ms-container'] = () => {
  const o = [];
  o.push(zone(4, 4, 292, 262, '서버 · 메모리 64GB', { fill: 'card', dash: null, labelTone: 'text' }));
  o.push(rect(20, 32, 260, 70, { rx: 10, fill: 'accentWeak', stroke: 'accent', sw: 1.5 }));
  o.push(t13(32, 52, '컨테이너', { weight: 700, tone: 'accent' }));
  o.push(t13(268, 52, '한도 2GB', { tone: 'sub', anchor: 'end' }));
  o.push(g.app(150, 78, '프로그램', { w: 96 }));
  o.push(arrow([[130, 92], [80, 138]], { tone: 'warn', sw: 2, size: 7 }));
  o.push(arrow([[170, 92], [220, 138]], { tone: 'accent', sw: 2, size: 7 }));
  const file = (cx, kind, name, val, tone) => {
    o.push(g.doc(cx, 158, { lines: 3 }));
    o.push(label(cx, 194, kind, 'text', 700));
    o.push(text(cx, 212, name, { size: 13, anchor: 'middle', mono: true, tone: 'sub' }));
    o.push(tag(cx, 240, val, { tone }));
  };
  file(76, '/proc 파일', 'meminfo', '서버 전체 64GB', 'warnSoft');
  file(224, 'cgroup 파일', 'memory.current', '이 컨테이너 1.2GB', 'soft');
  return [300, 270, o];
};

// ── users-and-permissions ──

// 권한 9칸을 세 칸씩 더해 숫자 한 자리로
figs['perm-octal'] = () => {
  const o = [];
  const bits = ['r', 'w', '-', 'r', '-', '-', '-', '-', '-'];
  const wts = [4, 2, 1, 4, 2, 1, 4, 2, 1];
  const X = (i) => 21 + i * 26 + Math.floor(i / 3) * 12;
  ['주인', '그룹', '나머지'].forEach((s, gi) => o.push(label(X(gi * 3) + 37, 16, s, 'text', 700)));
  bits.forEach((b, i) => {
    const on = b !== '-';
    o.push(rect(X(i), 26, 24, 32, { rx: 5, fill: on ? 'accent' : 'bg', stroke: on ? 'none' : 'line', sw: 1.2 }));
    o.push(text(X(i) + 12, 48, b, { size: 16, weight: 700, tone: on ? 'card' : 'weak', anchor: 'middle', mono: true }));
    o.push(label(X(i) + 12, 76, String(wts[i]), on ? 'accent' : 'weak', on ? 700 : 400));
  });
  const sums = [['4 + 2 + 0', '6'], ['4 + 0 + 0', '4'], ['0 + 0 + 0', '0']];
  sums.forEach(([e, n], gi) => {
    const cx = X(gi * 3) + 37;
    o.push(g.path(`M${X(gi * 3)} 86 v5 H${X(gi * 3) + 74} v-5`, { stroke: 'sub', sw: 1.4 }));
    o.push(label(cx, 110, e, 'sub', 600));
    o.push(text(cx, 140, n, { size: 22, weight: 700, tone: 'accent', anchor: 'middle' }));
  });
  o.push(rect(70, 156, 160, 34, { rx: 10, fill: 'accentWeak', stroke: 'none' }));
  o.push(text(150, 178, 'chmod 640', { size: 15, weight: 700, tone: 'accent', anchor: 'middle', mono: true }));
  return [300, 196, o];
};

// 커널은 주인 → 그룹 → 나머지 순서로 맞는 칸 하나만 봐요
figs['perm-slot'] = () => {
  const o = [];
  const slots = [[70, '주인 칸'], [156, '그룹 칸'], [242, '나머지 칸']];
  const slotRow = (y, vals, hl) => slots.forEach(([cx], i) => {
    o.push(rect(cx - 38, y, 76, 32, { rx: 6, fill: hl?.[i] ?? 'card', stroke: 'sub', sw: 1.4 }));
    o.push(text(cx, y + 22, vals[i], { size: 16, weight: 700, anchor: 'middle', mono: true, tone: vals[i] === '---' ? 'weak' : 'text' }));
  });
  slots.forEach(([cx, name]) => o.push(label(cx, 16, name, 'sub', 600)));
  slotRow(24, ['rw-', 'r--', '---']);
  const who = [['① 주인이면', 'syslog'], ['② 그룹이면', 'adm 그룹'], ['③ 둘 다 아니면', '그 밖의 사용자']];
  slots.forEach(([cx], i) => {
    o.push(arrow([[cx, 96], [cx, 62]], { tone: 'accent', sw: 2, size: 7 }));
    o.push(g.person(cx, 112));
    o.push(label(cx, 146, who[i][0], 'text', 700));
    o.push(label(cx, 164, who[i][1], 'sub', 400));
  });
  o.push(t13(150, 192, '앞에서 맞으면 뒤 칸은 보지 않아요', { weight: 700, tone: 'accent', anchor: 'middle' }));
  // 예: -------r--
  o.push(line(8, 208, 292, 208, { tone: 'line', sw: 1, cap: 'butt' }));
  o.push(t13(8, 232, '권한이', { tone: 'sub' }));
  o.push(text(54, 232, '-------r--', { size: 14, weight: 700, mono: true }));
  o.push(t13(140, 232, '일 때', { tone: 'sub' }));
  slotRow(244, ['---', '---', 'r--'], ['warnWeak', null, 'accentWeak']);
  o.push(label(70, 298, '주인은 못 읽어요', 'warn', 700));
  o.push(label(242, 298, '나머지는 읽어요', 'accent', 700));
  return [300, 306, o];
};

// 경로의 디렉터리마다 x가 있어야 지나가요
figs['perm-path'] = () => {
  const o = [];
  const items = [['/', 'r-x'], ['srv', 'r-x'], ['app', '---'], ['logs', 'r-x'], ['app.log', 'r--']];
  const X = (i) => 30 + i * 60;
  o.push(t13(8, 16, '다른 사용자가 app.log를 읽으려면', { weight: 700 }));
  items.forEach(([n, p], i) => {
    const block = i === 2;
    const after = i > 2;
    if (i === 4) o.push(g.doc(X(i), 58, { lines: 3, tone: after ? 'weak' : undefined }));
    else o.push(g.folder(X(i), 58, { tone: block ? 'warn' : after ? 'weak' : undefined }));
    if (block) o.push(g.lock(X(i) + 12, 66));
    o.push(text(X(i), 96, n, { size: 13, weight: 700, anchor: 'middle', mono: true, tone: block ? 'warn' : after ? 'weak' : 'text' }));
    o.push(text(X(i), 118, p, { size: 14, weight: 700, anchor: 'middle', mono: true, tone: block ? 'warn' : 'sub' }));
    if (i < 4) {
      const tone = i < 1 ? 'accent' : i === 1 ? 'accent' : 'weak';
      if (i === 1) {
        o.push(arrow([[X(i) + 18, 58], [X(i + 1) - 20, 58]], { tone: 'accent', sw: 2, size: 7 }));
      } else if (i === 0) {
        o.push(arrow([[X(i) + 18, 58], [X(i + 1) - 18, 58]], { tone, sw: 2, size: 7 }));
      } else {
        o.push(line(X(i) + 18, 58, X(i + 1) - 18, 58, { tone: 'weak', sw: 1.8, dash: '3 4' }));
      }
    }
  });
  o.push(t13(8, 140, '아래 글자: 나머지 칸의 권한', { tone: 'sub' }));
  o.push(rect(4, 154, 292, 50, { rx: 10, fill: 'warnWeak', stroke: 'none' }));
  o.push(t13(150, 175, 'app에 x가 없어서 여기서 막혀요', { weight: 700, tone: 'warn', anchor: 'middle' }));
  o.push(t13(150, 195, 'app.log가 r--여도 못 읽어요', { tone: 'sub', anchor: 'middle' }));
  return [300, 210, o];
};

// root의 힘 41조각 중 모니터링에서 자주 만나는 다섯
figs['perm-caps'] = () => {
  const o = [];
  o.push(t13(8, 16, 'root의 힘 = capability 41조각', { weight: 700 }));
  const hit = { 3: 1, 13: 2, 18: 3, 25: 4, 33: 5 };
  for (let i = 0; i < 41; i++) {
    const c = i % 14;
    const r = Math.floor(i / 14);
    const x = 8 + c * 20.5;
    const y = 28 + r * 22;
    const n = hit[i];
    o.push(rect(x, y, 17, 18, { rx: 3, fill: n === 1 ? 'accent' : n ? 'sub' : 'line', stroke: 'none' }));
    if (n) o.push(text(x + 8.5, y + 14, String(n), { size: 13, weight: 700, tone: 'card', anchor: 'middle' }));
  }
  const rows = [
    ['CAP_NET_RAW', '패킷을 직접 보내고 받기'],
    ['CAP_NET_BIND_SERVICE', '1024 아래 포트 열기'],
    ['CAP_DAC_READ_SEARCH', '모든 파일 읽기'],
    ['CAP_DAC_OVERRIDE', '모든 파일 읽고 쓰기'],
    ['CAP_SYS_PTRACE', '다른 프로세스 들여다보기'],
  ];
  rows.forEach(([nm, s], i) => {
    const y = 106 + i * 42;
    if (i === 0) o.push(rect(4, y - 6, 292, 42, { rx: 8, fill: 'accentWeak', stroke: 'none' }));
    o.push(g.badge(20, y + 9, i + 1, { tone: i === 0 ? 'accent' : 'sub' }));
    o.push(text(36, y + 13, nm, { size: 13, weight: 700, mono: true, tone: i === 0 ? 'accent' : 'text' }));
    o.push(t13(36, y + 30, s, { tone: 'sub' }));
  });
  o.push(tag(290, 115, '에이전트엔 이것만', { tone: 'accent', anchor: 'end', size: 13 }));
  return [300, 316, o];
};

// 일반 사용자로 PID 1의 /proc 파일 읽기
figs['perm-proc'] = () => {
  const o = [];
  const C = [[4, 160], [164, 66], [230, 66]];
  o.push(rect(4, 4, 292, 30, { rx: 6, fill: 'line', stroke: 'none' }));
  o.push(t13(14, 24, '읽은 파일', { weight: 600, tone: 'sub' }));
  o.push(label(C[1][0] + 33, 24, '일반 사용자', 'sub', 600));
  o.push(label(C[2][0] + 33, 24, 'root', 'sub', 600));
  const rows = [
    ['/proc/stat, meminfo', 'CPU·메모리 숫자', true],
    ['/proc/1/cmdline', '명령줄', true],
    ['/proc/1/fd', '열린 파일 목록', false],
    ['/proc/1/io', '입출력 양', false],
  ];
  rows.forEach(([f, s, ok], i) => {
    const y = 34 + i * 46;
    if (!ok) o.push(rect(C[1][0], y, 66, 46, { rx: 0, fill: 'warnWeak', stroke: 'none' }));
    if (i) o.push(line(4, y, 296, y, { tone: 'line', sw: 1, cap: 'butt' }));
    o.push(text(14, y + 20, f, { size: 13, weight: 700, mono: true }));
    o.push(t13(14, y + 38, s, { tone: 'sub' }));
    o.push(ok ? g.check(C[1][0] + 33, y + 23, { r: 6 }) : xmark(C[1][0] + 33, y + 23, { r: 5.5 }));
    o.push(g.check(C[2][0] + 33, y + 23, { r: 6 }));
  });
  o.push(rect(4, 4, 292, 30 + 4 * 46, { rx: 6, fill: 'none', stroke: 'line', sw: 1.5 }));
  o.push(t13(296, 238, 'PID 1은 systemd예요', { tone: 'sub', anchor: 'end' }));
  return [300, 246, o];
};

// ── disk-health ──

// RAID 5: 줄마다 데이터 셋과 패리티 하나, 패리티 자리가 돌아가요
figs['raid5'] = () => {
  const o = [];
  const X = (i) => 10 + i * 72;
  const rows = [['A1', 'A2', 'A3', 'P'], ['B1', 'B2', 'P', 'B3'], ['C1', 'P', 'C2', 'C3'], ['P', 'D1', 'D2', 'D3']];
  const names = ['A', 'B', 'C', 'D'];
  o.push(rect(4, 72, 292, 32, { rx: 6, fill: 'accentWeak', stroke: 'none' }));
  for (let i = 0; i < 4; i++) {
    const dead = i === 1;
    o.push(g.hdd(X(i) + 32, 22, { tone: dead ? 'warn' : undefined }));
    if (dead) o.push(xmark(X(i) + 54, 10, { r: 5 }));
    o.push(label(X(i) + 32, 58, `디스크 ${i + 1}`, dead ? 'warn' : 'text', 700));
    rows.forEach((r, ri) => {
      const v = r[i];
      const par = v === 'P';
      const y = 76 + ri * 34;
      o.push(rect(X(i), y, 64, 26, { rx: 5, fill: dead ? 'none' : par ? 'accent' : 'card', stroke: dead ? 'warn' : par ? 'none' : 'line', sw: 1.3, dash: dead ? '4 3' : undefined }));
      o.push(label(X(i) + 32, y + 18, par ? `${names[ri]} 패리티` : v, dead ? 'warn' : par ? 'card' : 'text', par ? 700 : 600));
    });
  }
  o.push(rect(4, 218, 292, 46, { rx: 10, fill: 'warnWeak', stroke: 'none' }));
  o.push(t13(150, 237, '디스크 2가 죽으면 A2는', { tone: 'sub', anchor: 'middle' }));
  o.push(t13(150, 256, 'A1, A3, A 패리티로 다시 계산해요', { weight: 700, tone: 'warn', anchor: 'middle' }));
  return [300, 270, o];
};

// 디스크 4개로 만든 RAID 방식마다 쓸 수 있는 몫
figs['raid-levels'] = () => {
  const o = [];
  const rows = [
    ['RAID 0', [1, 1, 1, 1], '16TB', '고장 0개', true],
    ['RAID 5', [0.75, 0.75, 0.75, 0.75], '12TB', '1개까지'],
    ['RAID 6', [0.5, 0.5, 0.5, 0.5], '8TB', '2개까지'],
    ['RAID 10', [1, 'm', 1, 'm'], '8TB', '쌍마다 1개'],
  ];
  rows.forEach(([n, disks, cap, tol, bad], r) => {
    const y = 6 + r * 54;
    o.push(rect(4, y, 292, 48, { rx: 10, fill: 'card', stroke: 'none' }));
    o.push(text(14, y + 29, n, { size: 14, weight: 700 }));
    disks.forEach((d, i) => {
      const x = 80 + i * 36 + (n === 'RAID 10' && i >= 2 ? 6 : 0);
      o.push(rect(x, y + 8, 30, 32, { rx: 4, fill: 'line', stroke: 'none' }));
      if (d === 'm') o.push(text(x + 15, y + 29, '복사', { size: 13, weight: 600, tone: 'sub', anchor: 'middle' }));
      else o.push(rect(x, y + 8 + 32 * (1 - d), 30, 32 * d, { rx: d === 1 ? 4 : 2, fill: 'accent', stroke: 'none' }));
    });
    if (n === 'RAID 10') {
      o.push(g.path(`M80 ${y + 44} v2 H146 v-2`, { stroke: 'sub', sw: 1.2 }));
      o.push(g.path(`M158 ${y + 44} v2 H224 v-2`, { stroke: 'sub', sw: 1.2 }));
    }
    o.push(text(286, y + 22, cap, { size: 14, weight: 700, tone: 'accent', anchor: 'end' }));
    o.push(t13(286, y + 40, tol, { weight: 600, tone: bad ? 'warn' : 'sub', anchor: 'end' }));
  });
  o.push(rect(14, 230, 12, 12, { rx: 2, fill: 'accent', stroke: 'none' }));
  o.push(t13(32, 241, '데이터', { tone: 'sub' }));
  o.push(rect(92, 230, 12, 12, { rx: 2, fill: 'line', stroke: 'none' }));
  o.push(t13(110, 241, '패리티·복사본', { tone: 'sub' }));
  o.push(t13(296, 241, '4TB × 4개', { tone: 'sub', anchor: 'end' }));
  return [300, 248, o];
};

// ── ebpf ──

// 올리기 → 검사기 → 훅에 붙음 → 이벤트마다 맵에 → 에이전트가 읽음
figs['ebpf-load'] = () => {
  const o = [];
  o.push(rect(4, 4, 292, 66, { rx: 12, fill: 'card', stroke: 'line', sw: 1.2 }));
  o.push(t13(288, 22, '사용자 공간', { tone: 'sub', anchor: 'end', weight: 600 }));
  o.push(rect(4, 80, 292, 196, { rx: 12, fill: 'accentWeak', stroke: 'accent', sw: 1.2, op: 0.5 }));
  o.push(t13(288, 98, '커널', { tone: 'accent', anchor: 'end', weight: 700 }));
  o.push(g.app(70, 42, '에이전트', { w: 104, tone: 'accent' }));
  o.push(arrow([[124, 42], [170, 42]], { tone: 'sub', sw: 2, size: 7 }));
  o.push(tag(176, 42, '모니터링 서버', { tone: 'plain', anchor: 'start', weight: 600 }));
  // ① 올리기
  o.push(arrow([[50, 54], [50, 108]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(t13(58, 94, '① bpf()로 올려요', { weight: 600, tone: 'accent' }));
  // ② 검사기
  o.push(rect(14, 110, 124, 42, { rx: 8, fill: 'card', stroke: 'sub', sw: 1.5 }));
  o.push(t13(24, 127, '② 검사기', { weight: 700 }));
  o.push(t13(24, 144, '끝나나 · 안전한가', { tone: 'sub' }));
  o.push(arrow([[138, 131], [156, 131]], { tone: 'warn', sw: 1.8, size: 6 }));
  o.push(xmark(166, 131, { r: 5 }));
  o.push(t13(176, 136, '거절', { weight: 700, tone: 'warn' }));
  // ③ 붙기
  o.push(arrow([[50, 152], [50, 194]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(t13(58, 178, '③ 기계어로 붙어요', { weight: 600, tone: 'accent' }));
  // 훅의 프로그램과 이벤트
  o.push(line(14, 212, 138, 212, { tone: 'sub', sw: 1.6, dash: '2 4' }));
  o.push(rect(26, 196, 96, 32, { rx: 7, fill: 'accent', stroke: 'none' }));
  o.push(label(74, 217, '프로그램', 'card', 700));
  [16, 132].forEach((x) => o.push(g.circle(x, 212, 3.5, { fill: 'sub' })));
  o.push(t13(14, 252, '④ 이벤트마다 돌아요', { weight: 600, tone: 'accent' }));
  o.push(t13(14, 268, '시스템 콜, 패킷 같은 길목', { tone: 'sub' }));
  // 맵
  o.push(arrow([[122, 212], [178, 212]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(t13(150, 204, '적어요', { weight: 600, tone: 'accent', anchor: 'middle' }));
  o.push(table(180, 180, [{ t: '맵', w: 60 }, { t: '', w: 46, align: 'right' }], [['write', '2,301'], ['read', '1,044']], { rowH: 24, headH: 22 }).svg);
  // ⑤ 읽기
  o.push(arrow([[232, 178], [232, 62], [124, 62], [124, 56]], { tone: 'sub', sw: 1.8, size: 6, dash: '4 3' }).replace('', ''));
  o.push(t13(226, 160, '⑤ 읽어 가요', { weight: 600, tone: 'sub', anchor: 'end' }));
  return [300, 282, o];
};

// 붙이는 층마다 보이는 것
figs['ebpf-hooks'] = () => {
  const o = [];
  const rows = [
    ['앱 코드', 'uprobe', '함수 호출'],
    ['TLS 라이브러리', 'uprobe', '암호화 전 평문', true],
    ['시스템 콜', 'tracepoint', '주고받는 바이트'],
    ['커널 TCP/IP', 'kprobe', '연결·재전송·RTT'],
    ['네트워크 카드', 'XDP', '들어온 패킷'],
  ];
  const Y = (i) => 10 + i * 50 + (i >= 2 ? 22 : 0);
  rows.forEach(([n, h, see, hl], i) => {
    const y = Y(i);
    const kernel = i >= 2;
    o.push(rect(8, y, 128, 40, { rx: 8, fill: kernel ? 'accentWeak' : 'card', stroke: hl ? 'accent' : 'line', sw: hl ? 1.8 : 1.2 }));
    o.push(text(20, y + 25, n, { size: 13, weight: 700, tone: kernel ? 'accent' : 'text' }));
    o.push(line(136, y + 20, 156, y + 20, { tone: 'sub', sw: 1.6, cap: 'butt' }));
    o.push(g.circle(158, y + 20, 4, { fill: hl ? 'accent' : 'sub' }));
    o.push(text(170, y + 16, h, { size: 13, weight: 700, mono: true, tone: hl ? 'accent' : 'text' }));
    o.push(t13(170, y + 34, see, { tone: hl ? 'accent' : 'sub', weight: hl ? 700 : 400 }));
  });
  const dy = Y(2) - 11;
  o.push(line(4, dy, 296, dy, { tone: 'sub', sw: 1.2, dash: '5 4', cap: 'butt' }));
  o.push(t13(296, dy - 6, '사용자 공간 ↑', { tone: 'sub', anchor: 'end' }));
  o.push(t13(296, dy + 16, '커널 ↓', { tone: 'accent', anchor: 'end', weight: 600 }));
  o.push(t13(8, Y(4) + 64, '위로 갈수록 뜻, 아래로 갈수록 바이트가 보여요', { tone: 'sub' }));
  return [300, Y(4) + 72, o];
};

// recvfrom과 sendto 사이가 서버 안 처리 시간
figs['ebpf-http'] = () => {
  const o = [];
  const lanes = [{ x: 40, label: '클라이언트' }, { x: 140, label: '커널' }, { x: 234, label: '앱' }];
  o.push(ladder(lanes, [
    { from: 0, to: 1, y: 56, label: 'GET /slow' },
    { from: 1, to: 2, y: 92, label: 'recvfrom', tone: 'accent' },
    { from: 2, to: 1, y: 176, label: 'sendto', tone: 'accent' },
    { from: 1, to: 0, y: 208, label: '200 OK', dashed: true },
  ], { top: 18, bottom: 226 }));
  o.push(rect(222, 100, 24, 68, { rx: 4, fill: 'line', stroke: 'none' }));
  o.push(text(234, 138, '쉼', { size: 13, weight: 600, tone: 'sub', anchor: 'middle' }));
  for (const y of [92, 176]) {
    o.push(g.circle(140, y, 6.5, { fill: 'accent', stroke: 'card', sw: 2 }));
  }
  o.push(tag(140, 134, 'eBPF가 시각을 적어요', { tone: 'soft', size: 13 }));
  o.push(g.path('M254 92 h8 V176 h-8', { stroke: 'accent', sw: 1.6 }));
  o.push(text(268, 130, '0.2초', { size: 14, weight: 700, tone: 'accent' }));
  o.push(t13(268, 148, '처리', { tone: 'sub' }));
  return [300, 234, o];
};

// libssl 함수에서는 평문, write 시스템 콜에서는 암호문
figs['ebpf-tls'] = () => {
  const o = [];
  o.push(g.app(42, 22, '앱', { w: 60 }));
  o.push(arrow([[42, 34], [42, 52]], { tone: 'sub', sw: 2, size: 6 }));
  // libssl
  o.push(rect(4, 56, 292, 74, { rx: 10, fill: 'accentWeak', stroke: 'accent', sw: 1.4 }));
  o.push(text(14, 78, 'SSL_write_ex', { size: 13, weight: 700, mono: true }));
  o.push(tag(286, 72, 'uprobe', { tone: 'accent', anchor: 'end' }));
  o.push(g.packet(14, 92, [{ t: 'HTTP/1.0 200 OK', tone: 'plain' }]).svg);
  o.push(g.check(170, 104, { r: 6 }));
  o.push(t13(182, 109, '평문이 보여요', { weight: 700, tone: 'accent' }));
  // 암호화
  o.push(arrow([[42, 130], [42, 164]], { tone: 'sub', sw: 2, size: 6 }));
  o.push(g.lock(70, 146));
  o.push(t13(86, 152, 'libssl이 암호화해요', { tone: 'sub', weight: 600 }));
  // write
  o.push(rect(4, 168, 292, 74, { rx: 10, fill: 'card', stroke: 'sub', sw: 1.4 }));
  o.push(text(14, 190, 'write 시스템 콜', { size: 13, weight: 700, mono: false }));
  o.push(tag(286, 184, 'tracepoint', { tone: 'plain', anchor: 'end' }));
  o.push(g.packet(14, 204, [{ t: '17 03 03', tone: 'accent' }, { t: '8f 2a c1 9e …', tone: 'sub' }]).svg);
  o.push(xmark(186, 216, { r: 5 }));
  o.push(t13(198, 221, '암호문뿐이에요', { weight: 700, tone: 'warn' }));
  o.push(t13(14, 262, '17 03 03: TLS 레코드의 머리표', { tone: 'sub' }));
  return [300, 270, o];
};

// SDK는 앱 안에서, eBPF는 앱 밖에서
figs['ebpf-vs-sdk'] = () => {
  const o = [];
  const items = (y0, list) => list.forEach(([ok, s], i) => {
    const x = i % 2 ? 154 : 16;
    const y = y0 + Math.floor(i / 2) * 22;
    o.push(ok ? g.check(x + 5, y - 4, { r: 5 }) : xmark(x + 5, y - 4, { r: 4.2, sw: 2.2 }));
    o.push(t13(x + 16, y, s, { tone: ok ? 'text' : 'sub' }));
  });
  // SDK
  o.push(rect(4, 4, 292, 162, { rx: 12, fill: 'card', stroke: 'none' }));
  o.push(text(16, 26, 'SDK·APM 에이전트', { size: 14, weight: 700 }));
  o.push(t13(284, 26, '앱 안에서', { tone: 'accent', anchor: 'end', weight: 600 }));
  [[70, '주문 앱'], [230, '결제 앱']].forEach(([cx, n]) => {
    o.push(rect(cx - 52, 40, 104, 40, { rx: 8, fill: 'bg', stroke: 'sub', sw: 1.4 }));
    o.push(t13(cx - 42, 65, n, { weight: 700 }));
    o.push(tag(cx + 44, 60, 'SDK', { tone: 'accent', anchor: 'end', size: 13 }));
  });
  o.push(arrow([[122, 60], [178, 60]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(text(150, 96, 'traceparent', { size: 13, weight: 600, mono: true, tone: 'accent', anchor: 'middle' }));
  items(118, [[true, '함수·사용자 속성'], [true, '서비스 사이를 이어요'], [true, '암호화와 상관없음'], [false, '앱마다 고쳐요']]);
  // eBPF
  o.push(rect(4, 174, 292, 186, { rx: 12, fill: 'card', stroke: 'none' }));
  o.push(text(16, 196, 'eBPF', { size: 14, weight: 700 }));
  o.push(t13(284, 196, '앱 밖에서', { tone: 'accent', anchor: 'end', weight: 600 }));
  [[70, '주문 앱'], [190, '결제 앱']].forEach(([cx, n]) => {
    o.push(g.app(cx, 220, n, { w: 90 }));
    o.push(line(cx, 232, cx, 254, { tone: 'sub', sw: 1.6, dash: '3 3' }));
  });
  o.push(rect(16, 254, 268, 30, { rx: 7, fill: 'accentWeak', stroke: 'accent', sw: 1.2 }));
  o.push(t13(26, 274, '커널', { weight: 700, tone: 'accent' }));
  o.push(g.magnifier(120, 268, { tone: 'accent' }));
  o.push(t13(136, 274, 'eBPF가 지나가는 걸 봐요', { tone: 'accent', weight: 600 }));
  items(306, [[true, '앱은 그대로'], [true, '요청·연결·지연'], [false, '암호화는 훅 필요'], [false, '서비스 잇기 어려움'], [false, '높은 권한 필요']]);
  return [300, 364, o];
};

// ── gpu ──

// 서버(CPU·서버 메모리)와 GPU 카드(SM·GPU 메모리)
figs['gpu-arch'] = () => {
  const o = [];
  o.push(zone(4, 4, 100, 200, '서버', { fill: 'card', dash: null, labelTone: 'text' }));
  o.push(g.chip(54, 64, { size: 32 }));
  o.push(label(54, 104, 'CPU', 'text', 700));
  o.push(g.ram(54, 148));
  o.push(label(54, 180, '서버 메모리', 'text', 700));
  o.push(zone(168, 4, 128, 200, 'GPU 카드', { fill: 'accentWeak', tone: 'accent', dash: null, labelTone: 'accent' }));
  for (let i = 0; i < 12; i++) {
    const c = i % 4;
    const r = Math.floor(i / 4);
    o.push(rect(176 + c * 29, 30 + r * 22, 25, 18, { rx: 3, fill: 'accent', stroke: 'none' }));
    o.push(text(176 + c * 29 + 12.5, 30 + r * 22 + 13.5, 'SM', { size: 13, weight: 700, tone: 'card', anchor: 'middle', fit: 18 }));
  }
  o.push(t13(176, 112, 'SM(코어 묶음)', { weight: 600, tone: 'accent' }));
  for (let i = 0; i < 4; i++) {
    o.push(rect(176 + i * 29, 138, 25, 22, { rx: 2, fill: 'card', stroke: 'accent', sw: 1.4 }));
    for (let k = 0; k < 3; k++) o.push(line(180 + i * 29 + k * 7, 160, 180 + i * 29 + k * 7, 164, { tone: 'accent', sw: 1.4, cap: 'butt' }));
  }
  o.push(t13(176, 184, 'GPU 메모리', { weight: 700, tone: 'accent' }));
  o.push(arrow([[284, 96], [284, 134]], { tone: 'accent', sw: 1.8, size: 6, start: true }));
  o.push(arrow([[74, 64], [172, 64]], { tone: 'sub', sw: 2, size: 7 }));
  o.push(label(136, 38, '계산을', 'sub', 600));
  o.push(label(136, 54, '맡겨요', 'sub', 600));
  o.push(arrow([[78, 148], [172, 148]], { tone: 'sub', sw: 2, size: 7 }));
  o.push(label(136, 122, '데이터를', 'sub', 600));
  o.push(label(136, 138, '옮겨요', 'sub', 600));
  o.push(t13(150, 228, '메모리가 따로라, 지표도 따로 봐요', { tone: 'sub', anchor: 'middle' }));
  return [300, 236, o];
};

// 사용률 100%인 GPU 둘: SM을 모두 쓰나, 두 개만 쓰나
figs['gpu-sm'] = () => {
  const o = [];
  const die = (px, title, busy, act, tone) => {
    o.push(rect(px, 4, 144, 206, { rx: 12, fill: 'card', stroke: 'none' }));
    o.push(tag(px + 72, 22, `${title} · 사용률 100%`, { tone: 'soft' }));
    o.push(rect(px + 12, 38, 120, 96, { rx: 8, fill: 'bg', stroke: 'sub', sw: 1.4 }));
    for (let i = 0; i < 12; i++) {
      const c = i % 4;
      const r = Math.floor(i / 4);
      const on = i < busy;
      o.push(rect(px + 20 + c * 27, 46 + r * 28, 23, 22, { rx: 3, fill: on ? 'accent' : 'card', stroke: on ? 'none' : 'line', sw: 1.2 }));
    }
    o.push(t13(px + 12, 158, busy === 12 ? 'SM 12개가 다 일해요' : 'SM 2개만 일해요', { weight: 700, tone }));
    o.push(t13(px + 12, 186, 'SM 활동', { tone: 'sub' }));
    o.push(text(px + 132, 186, act, { size: 15, weight: 700, tone, anchor: 'end' }));
  };
  die(4, 'GPU 1', 12, '100%', 'accent');
  die(152, 'GPU 2', 2, '약 17%', 'warn');
  o.push(t13(150, 232, '쉬지 않았다는 것만 같고, 채운 정도는 달라요', { tone: 'sub', anchor: 'middle' }));
  return [300, 240, o];
};

// 메모리 사용량(얼마나 찼나)과 메모리 사용률(오가느라 바빴던 시간)
figs['gpu-mem-two'] = () => {
  const o = [];
  o.push(rect(96, 6, 108, 34, { rx: 8, fill: 'accentWeak', stroke: 'accent', sw: 1.5 }));
  o.push(label(150, 28, 'SM(계산)', 'accent', 700));
  o.push(arrow([[136, 98], [136, 44]], { tone: 'warn', sw: 2.4, size: 7 }));
  o.push(arrow([[164, 44], [164, 98]], { tone: 'warn', sw: 2.4, size: 7 }));
  o.push(g.badge(186, 70, 2, { tone: 'warn' }));
  o.push(t13(126, 75, '오가는 길', { tone: 'warn', weight: 600, anchor: 'end' }));
  o.push(rect(50, 102, 200, 50, { rx: 8, fill: 'card', stroke: 'sub', sw: 1.5 }));
  o.push(rect(52, 104, (196 * 20) / 24, 46, { rx: 6, fill: 'accent', stroke: 'none', op: 0.8 }));
  o.push(label(130, 132, '20GB 찼어요', 'card', 700));
  o.push(t13(246, 132, '24GB', { tone: 'sub', anchor: 'end', weight: 600 }));
  o.push(g.badge(268, 127, 1, { tone: 'accent' }));
  const card = (px, n, title, what, hi, tone) => {
    o.push(rect(px, 168, 144, 128, { rx: 12, fill: 'card', stroke: 'none' }));
    o.push(g.badge(px + 20, 190, n, { tone }));
    o.push(text(px + 36, 195, title, { size: 13, weight: 700 }));
    o.push(t13(px + 12, 222, what[0], { weight: 600, tone }));
    o.push(t13(px + 12, 240, what[1], { tone: 'sub' }));
    hi.forEach((s, i) => o.push(t13(px + 12, 264 + i * 18, s, { tone: 'sub' })));
  };
  card(4, 1, '메모리 사용량', ['얼마나 찼나', 'MiB, GB'], ['높으면 새 할당이', '실패할 수 있어요'], 'accent');
  card(152, 2, '메모리 사용률', ['오가느라 바빴던 시간', '%'], ['높으면 메모리를', '기다리는 계산이 많아요'], 'warn');
  return [300, 302, o];
};

// ── virtualization ──

// 하드웨어 위 하이퍼바이저, 그 위 VM 셋
figs['virt-stack'] = () => {
  const o = [];
  const vms = [['VM 1', 'vCPU 8', '32GB'], ['VM 2', 'vCPU 4', '16GB'], ['VM 3', 'vCPU 4', '24GB']];
  vms.forEach(([n, c, m], i) => {
    const x = 6 + i * 98;
    o.push(rect(x, 6, 90, 128, { rx: 10, fill: 'card', stroke: 'sub', sw: 1.4 }));
    o.push(text(x + 45, 26, n, { size: 13, weight: 700, anchor: 'middle' }));
    o.push(rect(x + 10, 36, 70, 22, { rx: 5, fill: 'bg', stroke: 'line', sw: 1.2 }));
    o.push(label(x + 45, 52, '앱', 'text', 600));
    o.push(rect(x + 10, 62, 70, 22, { rx: 5, fill: 'bg', stroke: 'line', sw: 1.2 }));
    o.push(label(x + 45, 78, '게스트 OS', 'text', 600));
    o.push(label(x + 45, 106, c, 'accent', 700));
    o.push(label(x + 45, 124, m, 'accent', 700));
  });
  o.push(rect(6, 142, 286, 30, { rx: 8, fill: 'accentWeak', stroke: 'accent', sw: 1.5 }));
  o.push(t13(16, 162, '하이퍼바이저', { weight: 700, tone: 'accent' }));
  o.push(t13(284, 162, 'ESXi · KVM · Hyper-V', { tone: 'sub', anchor: 'end' }));
  o.push(rect(6, 180, 286, 48, { rx: 8, fill: 'card', stroke: 'sub', sw: 1.4 }));
  o.push(t13(16, 199, '물리 서버(호스트)', { weight: 700 }));
  o.push(g.chip(28, 214, { size: 14 }));
  o.push(t13(42, 219, '코어 8개', { weight: 600 }));
  o.push(g.ram(176, 212));
  o.push(t13(202, 219, '메모리 64GB', { weight: 600 }));
  o.push(rect(6, 238, 286, 46, { rx: 10, fill: 'warnWeak', stroke: 'none' }));
  o.push(t13(150, 257, 'VM에 준 합: vCPU 16개, 메모리 72GB', { weight: 700, tone: 'warn', anchor: 'middle' }));
  o.push(t13(150, 275, '호스트가 가진 것보다 많아요(오버커밋)', { tone: 'sub', anchor: 'middle' }));
  return [300, 290, o];
};

// 게스트 숫자와 호스트 숫자를 VM 이름으로 잇기
figs['virt-monitor'] = () => {
  const o = [];
  o.push(g.db(150, 34));
  o.push(t13(174, 30, '모니터링 서버', { weight: 700 }));
  o.push(t13(174, 48, 'VM 이름으로 이어요', { tone: 'accent', weight: 600 }));
  o.push(zone(4, 120, 210, 130, 'ESXi 호스트', { fill: 'card', dash: null, labelTone: 'text' }));
  o.push(rect(14, 146, 190, 60, { rx: 8, fill: 'bg', stroke: 'sub', sw: 1.3 }));
  o.push(t13(196, 164, 'VM web-01', { weight: 700, anchor: 'end', tone: 'sub' }));
  o.push(g.app(110, 186, '게스트 에이전트', { w: 124, tone: 'accent' }));
  o.push(rect(14, 214, 190, 28, { rx: 6, fill: 'accentWeak', stroke: 'none' }));
  o.push(t13(24, 233, '하이퍼바이저', { weight: 600, tone: 'accent' }));
  o.push(arrow([[70, 174], [70, 34], [128, 34]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(t13(78, 100, 'CPU·메모리·steal', { weight: 600, tone: 'accent' }));
  o.push(g.server(262, 182));
  o.push(label(262, 218, 'vCenter', 'text', 700));
  o.push(label(262, 236, '호스트 관리', 'sub', 400));
  o.push(arrow([[204, 228], [244, 196]], { tone: 'sub', sw: 1.8, size: 6, dash: '4 3' }));
  o.push(arrow([[262, 164], [262, 76], [150, 76], [150, 54]], { tone: 'sub', sw: 2, size: 7 }));
  o.push(t13(254, 122, 'Ready·풍선·스왑', { weight: 600, tone: 'sub', anchor: 'end' }));
  return [300, 256, o];
};

// ── process-exit ──

// 끝나는 길: 스스로 끝내거나 신호를 받거나
figs['exit-paths'] = () => {
  const o = [];
  o.push(g.app(150, 18, '프로세스가 끝나요', { w: 136 }));
  o.push(arrow([[112, 30], [78, 54]], { tone: 'sub', sw: 2, size: 7 }));
  o.push(arrow([[188, 30], [222, 54]], { tone: 'sub', sw: 2, size: 7 }));
  o.push(tag(78, 66, '스스로 끝내요', { tone: 'plain' }));
  o.push(tag(222, 66, '신호를 받아요', { tone: 'plain' }));
  o.push(tag(18, 100, '0', { tone: 'accent', anchor: 'start' }));
  o.push(t13(48, 105, '성공', { weight: 700, tone: 'accent' }));
  o.push(tag(18, 128, '1~255', { tone: 'sub', anchor: 'start' }));
  o.push(t13(74, 133, '실패', { weight: 700 }));
  o.push(t13(18, 156, '뜻은 프로그램마다 달라요', { tone: 'sub' }));
  o.push(arrow([[222, 78], [222, 168]], { tone: 'sub', sw: 2, size: 7 }));
  o.push(table(4, 172, [{ t: '신호', w: 84 }, { t: '번호', w: 46, align: 'right' }, { t: '종료 코드', w: 72, align: 'right' }, { t: '뜻', w: 90 }], [
    ['SIGTERM', '15', '143', '정리 부탁'],
    ['SIGKILL', '9', '137', '막을 수 없음'],
    ['SIGSEGV', '11', '139', '잘못된 접근'],
    ['SIGABRT', '6', '134', '스스로 멈춤'],
  ], { rowH: 26 }).svg);
  o.push(rect(4, 312, 292, 34, { rx: 8, fill: 'accentWeak', stroke: 'none' }));
  o.push(t13(150, 334, '종료 코드 = 128 + 신호 번호', { weight: 700, tone: 'accent', anchor: 'middle' }));
  return [300, 350, o];
};

// 종료 코드로 먼저 볼 곳
figs['exit-lookup'] = () => {
  const o = [];
  o.push(t13(4, 16, '프로세스가 사라졌어요 → 종료 코드는?', { weight: 700 }));
  const rows = [
    ['137', '커널 로그의 OOM 줄', '없으면 유예 시간 초과', 'warn'],
    ['139·134', 'segfault 줄, hs_err 파일', '크래시', 'warn'],
    ['143', '배포·축소 기록', '누가 멈췄나', 'accent'],
    ['1·2', '표준 에러의 마지막 줄', '처리 안 된 에러', 'sub'],
  ];
  rows.forEach(([code, where, why, tone], i) => {
    const y = 28 + i * 56;
    o.push(rect(4, y, 292, 50, { rx: 10, fill: 'card', stroke: 'none' }));
    o.push(rect(12, y + 9, 72, 32, { rx: 7, fill: tone === 'warn' ? 'warnWeak' : tone === 'accent' ? 'accentWeak' : 'bg', stroke: 'none' }));
    o.push(text(48, y + 31, code, { size: 15, weight: 700, tone: tone === 'sub' ? 'text' : tone, anchor: 'middle' }));
    o.push(t13(96, y + 22, where, { weight: 700 }));
    o.push(t13(96, y + 40, why, { tone: 'sub' }));
  });
  return [300, 252, o];
};

// ── high-cpu ──

// 코어 8개에 일 14개: 8개는 실행, 6개는 줄을 서요
figs['hc-queue'] = () => {
  const o = [];
  o.push(t13(8, 16, '코어 8개 서버', { weight: 700 }));
  for (let i = 0; i < 8; i++) {
    const x = 10 + i * 35;
    o.push(rect(x, 26, 31, 31, { rx: 6, fill: 'accentWeak', stroke: 'accent', sw: 1.5 }));
    o.push(g.circle(x + 15.5, 41.5, 7, { fill: 'accent' }));
  }
  o.push(g.path('M10 66 v5 H285 v-5', { stroke: 'accent', sw: 1.5 }));
  o.push(label(147, 90, '실행 중 8개', 'accent', 700));
  o.push(t13(8, 124, '차례 기다림', { weight: 700, tone: 'warn' }));
  for (let j = 0; j < 6; j++) o.push(g.circle(112 + j * 22, 119, 8, { fill: 'card', stroke: 'warn', sw: 2 }));
  o.push(arrow([[250, 119], [272, 119], [272, 74]], { tone: 'warn', sw: 1.6, size: 6, dash: '3 3' }));
  o.push(rect(4, 146, 292, 40, { rx: 10, fill: 'bg', stroke: 'line', sw: 1.2 }));
  o.push(t13(150, 171, '실행 8 + 기다림 6 = 14 → 부하 14 안팎', { weight: 700, anchor: 'middle' }));
  return [300, 192, o];
};

// CPU가 오를 때 요청 수도 늘었나
figs['hc-two-cases'] = () => {
  const o = [];
  const panel = (px, title, up, mean, todo, tone) => {
    o.push(rect(px, 4, 144, 250, { rx: 12, fill: 'card', stroke: 'none' }));
    o.push(text(px + 12, 26, title, { size: 13, weight: 700 }));
    const p = plot(px + 14, 42, 116, 74, { x0: 0, x1: 5, y0: 0, y1: 1 });
    o.push(p.base());
    o.push(p.line([[0, 0.25], [1, 0.27], [2, 0.35], [3, 0.6], [4, 0.78], [5, 0.86]], { tone: 'warn', sw: 2.4 }));
    o.push(p.line(up ? [[0, 0.12], [1, 0.14], [2, 0.2], [3, 0.4], [4, 0.55], [5, 0.62]] : [[0, 0.35], [1, 0.34], [2, 0.36], [3, 0.35], [4, 0.36], [5, 0.35]], { tone: 'accent', sw: 2.2, dash: '5 3' }));
    o.push(g.circle(px + 18, 136, 4.5, { fill: 'warn' }));
    o.push(t13(px + 28, 141, 'CPU', { tone: 'sub' }));
    o.push(line(px + 66, 136, px + 78, 136, { tone: 'accent', sw: 2.2, dash: '4 2' }));
    o.push(t13(px + 84, 141, '요청 수', { tone: 'sub' }));
    o.push(line(px + 12, 154, px + 132, 154, { tone: 'line', sw: 1, cap: 'butt' }));
    mean.forEach((s, i) => o.push(t13(px + 12, 176 + i * 18, s, { weight: 700, tone })));
    todo.forEach((s, i) => o.push(t13(px + 12, 216 + i * 18, s, { tone: 'sub' })));
  };
  panel(4, '요청 수도 늘었을 때', true, ['일이 많아졌어요'], ['서버 늘리기,', '요청 나누기'], 'accent');
  panel(152, '요청 수는 그대로일 때', false, ['요청 하나가', '무거워졌어요'], ['배포된 코드,', '데이터 변화 보기'], 'warn');
  return [300, 258, o];
};

// ── low-memory ──

// free 기준 97%, available 기준 38%
figs['lm-free-avail'] = () => {
  const o = [];
  const X = (p) => 8 + p * 2.84;
  o.push(g.path(`M${X(38)} 40 v-5 H${X(100)} v5`, { stroke: 'accent', sw: 1.5 }));
  o.push(t13(X(69), 12, 'free + 비울 수 있는 캐시', { tone: 'sub', anchor: 'middle' }));
  o.push(t13(X(69), 29, 'available 62%', { weight: 700, tone: 'accent', anchor: 'middle' }));
  o.push(rect(X(0), 46, X(38) - X(0), 32, { rx: 4, fill: 'line', stroke: 'none' }));
  o.push(rect(X(38), 46, X(97) - X(38), 32, { rx: 0, fill: 'accentWeak', stroke: 'none' }));
  o.push(rect(X(97), 46, X(100) - X(97), 32, { rx: 0, fill: 'card', stroke: 'none' }));
  o.push(rect(X(0), 46, X(100) - X(0), 32, { rx: 4, fill: 'none', stroke: 'sub', sw: 1.4 }));
  o.push(label(X(19), 67, '프로그램', 'text', 700));
  o.push(label(X(67.5), 67, '파일 캐시', 'accent', 700));
  o.push(t13(X(100), 96, 'free 3%', { tone: 'sub', anchor: 'end' }));
  o.push(g.path(`M${X(0)} 104 v5 H${X(97)} v-5`, { stroke: 'warn', sw: 1.5 }));
  o.push(t13(X(0), 130, '(전체 − free) 기준', { tone: 'warn', weight: 600 }));
  o.push(text(X(0) + 128, 131, '97%', { size: 15, weight: 700, tone: 'warn' }));
  o.push(t13(X(0) + 166, 130, '캐시까지 사용으로', { tone: 'sub' }));
  o.push(g.path(`M${X(0)} 144 v5 H${X(38)} v-5`, { stroke: 'accent', sw: 1.5 }));
  o.push(t13(X(0), 170, '(전체 − available) 기준', { tone: 'accent', weight: 600 }));
  o.push(text(X(0) + 156, 171, '38%', { size: 15, weight: 700, tone: 'accent' }));
  return [300, 180, o];
};

// 스왑 사용량만 높을 때와 지금 오갈 때
figs['lm-swap'] = () => {
  const o = [];
  const panel = (px, title, moving) => {
    o.push(rect(px, 4, 144, 270, { rx: 12, fill: 'card', stroke: 'none' }));
    o.push(text(px + 12, 26, title, { size: 13, weight: 700 }));
    const cx = px + 72;
    o.push(g.ram(cx, 56));
    o.push(label(cx, 86, '메모리', 'text', 600));
    if (moving) {
      o.push(arrow([[cx - 12, 98], [cx - 12, 124]], { tone: 'warn', sw: 2.2, size: 7 }));
      o.push(arrow([[cx + 12, 124], [cx + 12, 98]], { tone: 'warn', sw: 2.2, size: 7 }));
      o.push(t13(cx - 18, 116, 'so', { tone: 'warn', weight: 700, anchor: 'end', mono: true }));
      o.push(t13(cx + 18, 116, 'si', { tone: 'warn', weight: 700, mono: true }));
    } else {
      o.push(line(cx, 98, cx, 124, { tone: 'line', sw: 2, dash: '3 4' }));
    }
    o.push(g.hdd(cx, 148, { tone: moving ? 'warn' : undefined }));
    o.push(label(cx, 180, '스왑(디스크)', 'text', 600));
    o.push(rect(px + 16, 192, 112, 10, { rx: 5, fill: 'line', stroke: 'none' }));
    o.push(rect(px + 16, 192, 112 * 0.8, 10, { rx: 5, fill: 'sub', stroke: 'none' }));
    o.push(t13(px + 16, 220, '사용량 80%', { tone: 'sub' }));
    o.push(text(px + 12, 242, moving ? 'si·so > 0' : 'si·so ≈ 0', { size: 13, weight: 700, mono: true, tone: moving ? 'warn' : 'accent' }));
    o.push(t13(px + 12, 260, moving ? '눈에 띄게 느려져요' : '느려지지 않아요', { weight: 600, tone: moving ? 'warn' : 'accent' }));
  };
  panel(4, '사용량만 높을 때', false);
  panel(152, '지금 오갈 때', true);
  return [300, 278, o];
};

// ── disk-filling-up ──

// 지웠지만 앱이 열고 있는 파일: df는 세고 du는 못 세요
figs['dfu-open-deleted'] = () => {
  const o = [];
  o.push(g.app(46, 30, '앱', { w: 70 }));
  o.push(arrow([[82, 30], [128, 30]], { tone: 'warn', sw: 2, size: 7 }));
  o.push(t13(105, 22, 'fd 3', { tone: 'warn', weight: 600, anchor: 'middle', mono: true }));
  o.push(g.doc(150, 30, { lines: 3, tone: 'warn' }));
  o.push(text(176, 26, 'app.log', { size: 13, weight: 700, mono: true, tone: 'sub' }));
  o.push(line(175, 22, 232, 22, { tone: 'warn', sw: 1.8 }));
  o.push(t13(176, 44, 'rm으로 이름만 지웠어요', { tone: 'warn', weight: 600 }));
  const X = (p) => 8 + p * 2.84;
  o.push(arrow([[150, 50], [150, 70], [X(83.5), 70], [X(83.5), 90]], { tone: 'warn', sw: 1.6, size: 6, dash: '3 3' }));
  o.push(rect(X(0), 94, X(72) - X(0), 30, { rx: 4, fill: 'line', stroke: 'none' }));
  o.push(rect(X(72), 94, X(95) - X(72), 30, { rx: 0, fill: 'warnWeak', stroke: 'none' }));
  o.push(rect(X(0), 94, X(100) - X(0), 30, { rx: 4, fill: 'none', stroke: 'sub', sw: 1.4 }));
  o.push(label(X(36), 114, '이름이 남은 파일', 'text', 700));
  o.push(label(X(83.5), 114, '10GB', 'warn', 700));
  o.push(g.path(`M${X(0)} 134 v5 H${X(72)} v-5`, { stroke: 'sub', sw: 1.5 }));
  o.push(text(X(0), 158, 'du', { size: 13, weight: 700, mono: true }));
  o.push(t13(X(0) + 24, 158, '72% · 이름이 있는 파일만', { tone: 'sub' }));
  o.push(g.path(`M${X(0)} 170 v5 H${X(95)} v-5`, { stroke: 'warn', sw: 1.5 }));
  o.push(text(X(0), 194, 'df', { size: 13, weight: 700, mono: true, tone: 'warn' }));
  o.push(t13(X(0) + 24, 194, '95% · 쓰인 공간을 모두', { tone: 'warn', weight: 600 }));
  return [300, 202, o];
};

// ── server-not-reporting ──

// 모니터링 서버 ← 네트워크 ← 서버 ← 에이전트: 셋 중 어디서 끊겼나
figs['snr-path'] = () => {
  const o = [];
  o.push(g.panel(48, 60, { w: 56, h: 40 }));
  o.push(label(48, 98, '모니터링', 'text', 700));
  o.push(label(48, 114, '서버', 'text', 700));
  o.push(g.firewall(142, 60));
  o.push(label(142, 98, '네트워크', 'text', 700));
  o.push(zone(196, 20, 100, 104, '서버', { fill: 'card', dash: null, labelTone: 'text' }));
  o.push(g.app(246, 78, '에이전트', { w: 80 }));
  o.push(arrow([[196, 60], [164, 60]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(arrow([[120, 60], [78, 60]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(t13(99, 50, '지표', { tone: 'accent', anchor: 'middle', weight: 600 }));
  o.push(g.badge(142, 30, 1, { tone: 'warn' }));
  o.push(g.badge(288, 20, 2, { tone: 'warn' }));
  o.push(g.badge(286, 66, 3, { tone: 'warn' }));
  const rows = [
    [1, '네트워크가 막혔나', 'ping, 서비스 응답'],
    [2, '서버가 꺼졌다 켜졌나', '재부팅 기록'],
    [3, '에이전트만 멈췄나', '에이전트 프로세스'],
  ];
  rows.forEach(([n, q, how], i) => {
    const y = 146 + i * 36;
    o.push(rect(4, y - 16, 292, 30, { rx: 7, fill: i % 2 ? 'card' : 'bg', stroke: 'none' }));
    o.push(g.badge(20, y - 1, n, { tone: 'warn' }));
    o.push(t13(36, y + 4, q, { weight: 700 }));
    o.push(t13(288, y + 4, how, { tone: 'sub', anchor: 'end' }));
  });
  return [300, 252, o];
};

// ── slow-disk ──

// r_await = 줄에서 기다린 시간 + 처리된 시간
figs['sd-await'] = () => {
  const o = [];
  o.push(t13(8, 16, '디스크 앞에 선 요청 줄(aqu-sz)', { weight: 700 }));
  for (let i = 0; i < 7; i++) {
    const me = i === 0;
    o.push(rect(10 + i * 30, 30, 24, 24, { rx: 4, fill: me ? 'accent' : 'warnWeak', stroke: me ? 'none' : 'warn', sw: 1.2 }));
  }
  o.push(label(22, 72, '이 요청', 'accent', 700));
  o.push(arrow([[222, 42], [244, 42]], { tone: 'sub', sw: 2, size: 7 }));
  o.push(g.hdd(270, 42));
  const T = (ms) => 10 + (ms / 35) * 276;
  o.push(t13(8, 104, '이 요청이 걸린 시간', { weight: 700 }));
  o.push(rect(T(0), 114, T(25) - T(0) - 1, 26, { rx: 4, fill: 'warnWeak', stroke: 'none' }));
  o.push(label((T(0) + T(25)) / 2, 132, '줄에서 기다림 25ms', 'warn', 700));
  o.push(rect(T(25) + 1, 114, T(35) - T(25) - 1, 26, { rx: 4, fill: 'accent', stroke: 'none' }));
  o.push(label((T(25) + T(35)) / 2, 132, '처리', 'card', 700));
  [[0, '0ms'], [25, '25ms'], [35, '35ms']].forEach(([v, s]) => o.push(t13(T(v), 158, s, { tone: 'sub', anchor: v === 0 ? 'start' : v === 35 ? 'end' : 'middle' })));
  o.push(g.path(`M${T(0)} 168 v5 H${T(35)} v-5`, { stroke: 'accent', sw: 1.5 }));
  o.push(t13(150, 192, 'r_await 35ms = 기다림 + 처리', { weight: 700, tone: 'accent', anchor: 'middle' }));
  o.push(t13(150, 212, '줄이 길어지면 기다림이 늘어 함께 커져요', { tone: 'sub', anchor: 'middle' }));
  return [300, 220, o];
};

// ── clock-drift ──

// 로그 시각대로 놓으면 순서가 뒤집혀요. DB 시계가 2.9초 늦어서
figs['cd-order'] = () => {
  const o = [];
  o.push(t13(4, 16, '로그를 시각대로 줄 세우면', { weight: 700 }));
  o.push(table(4, 26, [{ t: '로그 시각', w: 96 }, { t: '서버', w: 70 }, { t: '일', w: 126 }], [['10:00:02', 'DB', '요청 받음'], ['10:00:05', '앱', '요청 보냄']], { hl: [0], hlTone: 'warn', rowH: 26 }).svg);
  o.push(t13(4, 124, '받은 일이 보낸 일보다 3초 앞서 보여요', { tone: 'warn', weight: 600 }));
  o.push(line(4, 138, 296, 138, { tone: 'line', sw: 1, cap: 'butt' }));
  o.push(t13(4, 160, '실제로는', { weight: 700 }));
  const sx = (t) => 90 + t * 33;
  o.push(t13(8, 192, '앱 서버', { weight: 600 }));
  o.push(t13(8, 240, 'DB 서버', { weight: 600 }));
  o.push(line(sx(0), 188, sx(6), 188, { tone: 'line', sw: 2, cap: 'butt' }));
  o.push(line(sx(0), 236, sx(6), 236, { tone: 'line', sw: 2, cap: 'butt' }));
  o.push(arrow([[sx(5), 192], [sx(5.06), 230]], { tone: 'accent', sw: 1.8, size: 6 }));
  o.push(g.circle(sx(5), 188, 5, { fill: 'accent' }));
  o.push(g.circle(sx(5.06), 236, 5, { fill: 'warn' }));
  o.push(t13(sx(5) - 10, 180, '시계 10:00:05에 보냄', { anchor: 'end', weight: 600 }));
  o.push(t13(sx(5) - 10, 228, '시계 10:00:02에 받음', { anchor: 'end', weight: 600, tone: 'warn' }));
  o.push(t13(sx(5) - 10, 254, 'DB 시계가 2.9초 늦어요', { anchor: 'end', tone: 'sub' }));
  o.push(line(sx(0), 272, sx(6), 272, { tone: 'weak', sw: 1.5, cap: 'butt' }));
  [[0, ':00'], [2, ':02'], [4, ':04'], [6, ':06']].forEach(([t, s]) => o.push(t13(sx(t), 290, s, { tone: 'sub', anchor: 'middle' })));
  o.push(t13(8, 290, '실제 시각', { tone: 'sub' }));
  return [300, 298, o];
};

// ── too-many-open-files ──

// 프로세스의 fd 번호표
figs['fd-table'] = () => {
  const o = [];
  o.push(t13(4, 16, '결제 API 프로세스의 fd', { weight: 700 }));
  const rows = [['0', '표준 입력'], ['1', '표준 출력'], ['2', '표준 에러'], ['3', '로그 파일'], ['4', '소켓'], ['5', '소켓'], ['…', '…'], ['1023', '소켓']];
  o.push(table(4, 26, [{ t: 'fd', w: 60, align: 'right' }, { t: '가리키는 것', w: 170 }], rows, { hl: [7], hlTone: 'warn', rowH: 24, dim: [0, 1, 2] }).svg);
  const ry = (i) => 26 + 24 + i * 24 + 12;
  o.push(g.path(`M240 ${ry(0) - 10} h5 V${ry(2) + 10} h-5`, { stroke: 'sub', sw: 1.4 }));
  o.push(t13(252, ry(1) - 2, '처음부터', { tone: 'sub' }));
  o.push(t13(252, ry(1) + 16, '열려 있어요', { tone: 'sub' }));
  o.push(g.path(`M240 ${ry(4) - 10} h5 V${ry(7) + 10} h-5`, { stroke: 'accent', sw: 1.4 }));
  o.push(t13(252, ry(5) + 6, '대부분', { tone: 'accent', weight: 600 }));
  o.push(t13(252, ry(5) + 24, '소켓', { tone: 'accent', weight: 600 }));
  o.push(rect(4, 252, 292, 46, { rx: 10, fill: 'warnWeak', stroke: 'none' }));
  o.push(xmark(22, 275, { r: 5.5 }));
  o.push(t13(38, 270, '1,024번째를 열면 소프트 한도', { weight: 700, tone: 'warn' }));
  o.push(text(38, 288, 'Too many open files', { size: 13, mono: true, tone: 'warn' }));
  return [300, 304, o];
};

// 한도를 정하는 곳: 로그인 세션은 limits.conf, 서비스는 LimitNOFILE
figs['fd-limits'] = () => {
  const o = [];
  const panel = (y0, title, l1, l2, who, check, warnLine) => {
    o.push(rect(4, y0, 292, warnLine ? 140 : 116, { rx: 12, fill: 'card', stroke: 'none' }));
    o.push(text(16, y0 + 24, title, { size: 14, weight: 700 }));
    o.push(g.doc(30, y0 + 60, { lines: 3 }));
    o.push(text(52, y0 + 56, l1, { size: 13, weight: 700, mono: !/[가-힣]/.test(l1) }));
    if (l2) o.push(text(52, y0 + 74, l2, { size: 13, weight: 700, mono: true }));
    o.push(arrow([[178, y0 + 60], [214, y0 + 60]], { tone: 'accent', sw: 2, size: 7 }));
    o.push(g.app(254, y0 + 60, who, { w: 72, tone: 'accent' }));
    o.push(t13(16, y0 + 104, '확인:', { tone: 'sub' }));
    o.push(text(56, y0 + 104, check, { size: 13, mono: true, weight: 600 }));
    if (warnLine) {
      o.push(xmark(22, y0 + 123, { r: 4.5, sw: 2.2 }));
      o.push(t13(34, y0 + 128, warnLine, { weight: 700, tone: 'warn' }));
    }
  };
  panel(4, '로그인한 세션(셸)', '/etc/security/', 'limits.conf', '셸', 'ulimit -n');
  panel(128, 'systemd가 띄운 서비스', '유닛 파일의', 'LimitNOFILE=', '서비스', '/proc/<PID>/limits', 'limits.conf는 안 걸려요');
  return [300, 272, o];
};


const only = process.argv.slice(2);
for (const [name, fn] of Object.entries(figs)) {
  if (only.length && !only.some((p) => name.startsWith(p))) continue;
  const [w, h, body] = fn();
  g.save(D, name, w, h, body);
}
console.log('done');
