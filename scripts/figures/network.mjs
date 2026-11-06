// 네트워크 글의 SVG 그림. 실행: node scripts/figures/network.mjs [이름 접두어...]
import * as g from './lib.mjs';

const { text, tag, line, arrow, zone, badge, packet, table, rect, bubble, ladder, xmark } = g;
const D = 'network';
const figs = {};
const MONO = { mono: true };

const label = (x, y, s, tone = 'sub', weight = 600) => text(x, y, s, { size: 13, weight, tone, anchor: 'middle' });

// ── overview ──

// 서버 A → 스위치 → 라우터 → 스위치 → 서버 B, 본문 목록 번호와 같은 번호
figs['overview-path'] = () => {
  const o = [];
  o.push(zone(4, 4, 114, 192, '네트워크 1', { fill: 'card', dash: null }));
  o.push(zone(182, 4, 114, 192, '네트워크 2', { fill: 'card', dash: null }));
  // 네트워크 1
  o.push(line(42, 104, 42, 132, { tone: 'accent', sw: 3 }));
  o.push(line(92, 82, 92, 132, { tone: 'weak', sw: 2 }));
  o.push(g.server(42, 60, { tone: 'accent' }));
  o.push(g.pc(92, 62));
  o.push(label(42, 96, '서버 A', 'accent', 700));
  o.push(g.sw(58, 146));
  o.push(label(61, 182, '스위치'));
  // 라우터
  o.push(line(90, 146, 128, 146, { tone: 'accent', sw: 3 }));
  o.push(line(172, 146, 210, 146, { tone: 'accent', sw: 3 }));
  o.push(g.router(150, 146, { tone: 'accent' }));
  o.push(label(150, 182, '라우터', 'accent', 700));
  // 네트워크 2
  o.push(line(208, 82, 208, 132, { tone: 'weak', sw: 2 }));
  o.push(line(258, 104, 258, 132, { tone: 'accent', sw: 3 }));
  o.push(g.pc(208, 62));
  o.push(g.server(258, 60, { tone: 'accent' }));
  o.push(label(258, 96, '서버 B', 'accent', 700));
  o.push(g.sw(236, 146));
  o.push(label(239, 182, '스위치'));
  // 번호
  o.push(badge(17, 60, 1));
  o.push(badge(17, 146, 2));
  o.push(badge(150, 116, 3));
  o.push(badge(283, 60, 4));
  return [300, 200, o];
};

// 흔한 회사 네트워크: 인터넷 - 라우터 - 방화벽 - 스위치 - (로드 밸런서 - 서버들), PC들
figs['overview-devices'] = () => {
  const o = [];
  const X = 120;
  o.push(line(X, 46, X, 78, { sw: 2 }));
  o.push(line(X, 106, X, 134, { sw: 2 }));
  o.push(line(X, 164, X, 188, { sw: 2 }));
  // 스위치에서 갈래
  o.push(line(X - 10, 214, 64, 250, { sw: 2 }));
  o.push(line(X + 14, 214, 214, 252, { sw: 2 }));
  o.push(line(X + 20, 214, 268, 252, { sw: 2 }));
  o.push(line(54, 280, 38, 306, { sw: 2 }));
  o.push(line(74, 280, 92, 306, { sw: 2 }));
  o.push(g.cloud(X, 26));
  o.push(label(X, 31, '인터넷', 'sub'));
  o.push(g.router(X, 92));
  o.push(g.firewall(X, 150));
  o.push(g.sw(X, 204));
  o.push(g.lb(64, 266));
  o.push(g.server(38, 324));
  o.push(g.server(92, 324));
  o.push(g.pc(214, 268));
  o.push(g.pc(268, 268));
  const right = (y, s) => tag(X + 40, y, s, { tone: 'soft', anchor: 'start' });
  o.push(right(92, '라우터'));
  o.push(right(150, '방화벽'));
  o.push(right(204, '스위치'));
  o.push(tag(96, 266, '로드 밸런서', { tone: 'soft', anchor: 'start' }));
  o.push(tag(65, 358, '서버', { tone: 'soft' }));
  o.push(tag(241, 300, 'PC', { tone: 'soft' }));
  return [300, 372, o];
};

// ── addresses ──

// 192.168.10.25/24를 네트워크 부분과 장비 부분으로, 아래는 앞부분이 같은 장비끼리 같은 네트워크
figs['addr-subnet'] = () => {
  const o = [];
  const cw = 11.6; // 20px 고정폭 글자 한 칸(fit으로 맞춘다)
  const x0 = 150 - (16 * cw) / 2;
  const seg = (s, from, tone, weight = 700) => text(x0 + from * cw, 30, s, { size: 20, weight, tone, mono: true, fit: s.length * cw });
  o.push(seg('192.168.10', 0, 'accent'));
  o.push(seg('.', 10, 'sub', 400));
  o.push(seg('25', 11, 'text'));
  o.push(seg('/24', 13, 'sub', 400));
  const brace = (a, b, tone) => g.path(`M${x0 + a * cw + 1} 40 v6 H${x0 + b * cw - 1} v-6`, { stroke: tone, sw: 1.6 });
  o.push(brace(0, 10, 'accent'));
  o.push(brace(11, 13, 'sub'));
  o.push(label(x0 + 5 * cw, 66, '네트워크 부분', 'accent', 700));
  o.push(label(x0 + 5 * cw, 84, '앞 24비트', 'sub', 400));
  o.push(label(x0 + 12 * cw, 66, '장비 부분', 'text', 700));
  o.push(label(x0 + 12 * cw, 84, '8비트', 'sub', 400));
  o.push(line(10, 102, 290, 102, { tone: 'line', sw: 1.5 }));
  // 장비 셋
  const rows = [
    ['192.168.10', '.25', 'accent'],
    ['192.168.10', '.30', 'accent'],
    ['192.168.20', '.7', 'warn'],
  ];
  rows.forEach(([net, host, tone], i) => {
    const y = 132 + i * 42;
    o.push(g.pc(26, y - 4, { tone: 'sub' }));
    o.push(text(52, y + 5, net, { size: 15, weight: 700, tone, mono: true, fit: 10 * 8.8 }));
    o.push(text(52 + 10 * 8.8, y + 5, host, { size: 15, weight: 400, tone: 'text', mono: true, fit: host.length * 8.8 }));
  });
  o.push(g.path('M196 118 h6 V188 h-6', { stroke: 'accent', sw: 1.6 }));
  o.push(text(210, 151, '같은 네트워크', { size: 13, weight: 700, tone: 'accent' }));
  o.push(text(210, 169, '스위치가 전해요', { size: 13, tone: 'sub' }));
  o.push(text(210, 211, '다른 네트워크', { size: 13, weight: 700, tone: 'warn' }));
  o.push(text(210, 229, '라우터를 거쳐요', { size: 13, tone: 'sub' }));
  return [300, 240, o];
};

// ARP: ① 모두에게 묻고 ② B만 답하고, A의 ARP 표에 적어요
figs['addr-arp'] = () => {
  const o = [];
  const panel = (px, title, ups, downs, say, sayX) => {
    o.push(rect(px, 4, 144, 186, { rx: 12, fill: 'card', stroke: 'none' }));
    o.push(text(px + 12, 24, title, { size: 13, weight: 700 }));
    const sx = px + 72;
    const hosts = [px + 26, px + 72, px + 118];
    hosts.forEach((hx, i) => {
      const [ptx] = g.sw.port(sx - 4, 92, [1, 3, 5][i]);
      const tone = ups.includes(i) || downs.includes(i) ? 'accent' : 'weak';
      if (ups.includes(i)) o.push(arrow([[hx, 128], [ptx, 101]], { tone, sw: 2.5, size: 8 }));
      else if (downs.includes(i)) o.push(arrow([[ptx, 101], [hx, 128]], { tone, sw: 2.5, size: 8 }));
      else o.push(line(ptx, 101, hx, 128, { tone, sw: 2 }));
      o.push(g.server(hx, 146));
    });
    o.push(g.sw(sx - 4, 92));
    o.push(label(hosts[0], 180, 'A', 'text', 700));
    o.push(label(hosts[1], 180, 'B(10.30)', 'text', 700));
    o.push(label(hosts[2], 180, 'C', 'text', 700));
    o.push(bubble(sayX, 50, say, { tailX: sayX }));
  };
  panel(4, '① 모두에게 물어요', [0], [1, 2], '10.30 누구예요?', 76);
  panel(152, '② B만 답해요', [1], [0], '나예요, aa:bb…', 224);
  o.push(text(8, 216, 'A의 ARP 표에 적어요', { size: 13, weight: 700, tone: 'sub' }));
  const t = table(4, 226, [{ t: 'IP 주소', w: 132 }, { t: 'MAC 주소', w: 160 }], [['192.168.10.30', 'aa:bb:cc:11:22:33']], { hl: [0], mono: true });
  o.push(t.svg);
  return [300, 276, o];
};

// 포트: 서버 한 대 안의 두 프로그램, 같은 클라이언트의 연결 둘
figs['addr-ports'] = () => {
  const o = [];
  o.push(zone(150, 4, 146, 196, '서버 10.0.0.9', { fill: 'card', dash: null, labelTone: 'text' }));
  o.push(g.app(232, 74, '웹 서버', { w: 96 }));
  o.push(g.app(232, 152, 'PostgreSQL', { w: 96 }));
  o.push(tag(170, 74, '443', { tone: 'accent' }));
  o.push(tag(170, 152, '5432', { tone: 'sub' }));
  o.push(g.pc(36, 84));
  o.push(label(36, 120, '클라이언트', 'text', 700));
  o.push(text(36, 138, '10.0.0.5', { size: 13, tone: 'sub', anchor: 'middle', mono: true }));
  o.push(arrow([[56, 72], [96, 66], [150, 70]], { tone: 'accent', sw: 2.2, size: 7 }));
  o.push(arrow([[56, 84], [96, 92], [150, 78]], { tone: 'accent', sw: 2.2, size: 7 }));
  o.push(tag(104, 48, '51234', { tone: 'soft' }));
  o.push(tag(104, 110, '51235', { tone: 'soft' }));
  o.push(text(8, 228, '연결 하나 = 양쪽 IP와 포트의 짝', { size: 13, weight: 700, tone: 'text' }));
  o.push(text(8, 250, '10.0.0.5:51234 ↔ 10.0.0.9:443', { size: 13, tone: 'accent', mono: true }));
  o.push(text(8, 270, '10.0.0.5:51235 ↔ 10.0.0.9:443', { size: 13, tone: 'accent', mono: true }));
  return [300, 280, o];
};

// ── layers ──

// 라우터를 지나면 MAC만 새로 붙어요
figs['layers-mac-rewrite'] = () => {
  const o = [];
  o.push(line(40, 40, 128, 40, { tone: 'weak', sw: 2.5 }));
  o.push(line(172, 40, 260, 40, { tone: 'weak', sw: 2.5 }));
  o.push(g.server(40, 40));
  o.push(g.router(150, 40, { tone: 'accent' }));
  o.push(g.server(260, 40));
  o.push(label(40, 76, '서버 A', 'text', 700));
  o.push(label(150, 76, '라우터', 'accent', 700));
  o.push(label(260, 76, '서버 B', 'text', 700));
  o.push(badge(95, 40, 1));
  o.push(badge(205, 40, 2));
  const row = (y, n, title, mac, tone) => {
    o.push(badge(14, y + 1, n));
    o.push(text(30, y + 6, title, { size: 13, weight: 700 }));
    const p = packet(4, y + 16, [{ t: mac, tone }, { t: 'IP A → B', tone: 'soft' }, { t: '데이터', tone: 'plain' }], { pad: 9 });
    o.push(p.svg);
  };
  row(104, 1, 'A → 라우터 구간', 'MAC A → 라우터', 'plain');
  row(172, 2, '라우터 → B 구간', 'MAC 라우터 → B', 'accent');
  // 두 패킷의 IP 칸 가운데
  const macW = g.textWidth('MAC A → 라우터', 13, 600) + 18;
  const ipX = 4 + macW + (g.textWidth('IP A → B', 13, 600) + 18) / 2;
  o.push(text(ipX + 8, 167, 'IP는 그대로', { size: 13, weight: 600, tone: 'sub' }));
  o.push(line(ipX, 146, ipX, 186, { tone: 'weak', sw: 1.5, dash: '3 3' }));
  o.push(text(4 + macW / 2, 232, 'MAC만 새로 붙여요', { size: 13, weight: 600, tone: 'accent', anchor: 'middle' }));
  return [300, 240, o];
};

// TCP와 UDP
figs['layers-tcp-udp'] = () => {
  const o = [];
  const panel = (px, title, msgs, foot) => {
    o.push(rect(px, 4, 144, 292, { rx: 12, fill: 'card', stroke: 'none' }));
    o.push(text(px + 72, 28, title, { size: 16, weight: 700, anchor: 'middle' }));
    o.push(ladder([{ x: px + 24, label: '보냄' }, { x: px + 120, label: '받음' }], msgs, { top: 52, bottom: 226 }));
    foot.forEach((s, i) => o.push(text(px + 72, 254 + i * 20, s, { size: 13, tone: i ? 'sub' : 'text', anchor: 'middle', weight: i ? 400 : 600 })));
  };
  panel(4, 'TCP', [
    { from: 0, to: 1, y: 78, label: 'SYN' },
    { from: 1, to: 0, y: 98, label: 'SYN·ACK', dashed: true },
    { from: 0, to: 1, y: 118, label: 'ACK' },
    { from: 0, to: 1, y: 146, label: '데이터', tone: 'accent' },
    { from: 0, to: 1, y: 172, label: '사라짐', tone: 'warn', lost: 0.6 },
    { from: 0, to: 1, y: 198, label: '다시 보냄', tone: 'accent' },
    { from: 1, to: 0, y: 218, label: '', dashed: true },
  ], ['머리 20바이트부터', 'HTTP, DB 연결']);
  panel(152, 'UDP', [
    { from: 0, to: 1, y: 146, label: '데이터', tone: 'accent' },
    { from: 0, to: 1, y: 172, label: '사라짐', tone: 'warn', lost: 0.6 },
    { from: 0, to: 1, y: 198, label: '데이터', tone: 'accent' },
  ], ['머리 8바이트', 'DNS, SNMP, Syslog']);
  o.push(text(228, 92, '연결 없이', { size: 13, tone: 'sub', anchor: 'middle' }));
  o.push(text(228, 110, '바로 보내요', { size: 13, tone: 'sub', anchor: 'middle' }));
  return [300, 300, o];
};

// ── switches-and-routers ──

// 스위치가 MAC 주소를 배우는 법: 처음엔 모든 포트로, 배운 뒤엔 그 포트로만
figs['sw-learning'] = () => {
  const o = [];
  const panel = (px, title, flood, rows, hl) => {
    o.push(rect(px, 4, 144, 238, { rx: 12, fill: 'card', stroke: 'none' }));
    o.push(text(px + 12, 26, title, { size: 13, weight: 700 }));
    const sx = px + 72;
    const hosts = [px + 26, px + 72, px + 118];
    hosts.forEach((hx, i) => {
      const [ptx] = g.sw.port(sx - 4, 58, [1, 3, 5][i]);
      if (i === 0) o.push(arrow([[hx, 102], [ptx, 70]], { tone: 'accent', sw: 2.5, size: 8 }));
      else if (i === 1) o.push(arrow([[ptx, 70], [hx, 102]], { tone: flood ? 'warn' : 'accent', sw: 2.5, size: 8 }));
      else if (flood) o.push(arrow([[ptx, 70], [hx, 102]], { tone: 'warn', sw: 2.5, size: 8 }));
      else o.push(line(ptx, 70, hx, 102, { tone: 'weak', sw: 2 }));
      o.push(text((ptx + hx) / 2 + (i === 0 ? -9 : i === 2 ? 9 : 9), 88, String(i + 1), { size: 13, tone: 'sub', anchor: 'middle' }));
      o.push(g.server(hx, 120));
    });
    o.push(g.sw(sx - 4, 58));
    ['A', 'B', 'C'].forEach((s, i) => o.push(label(hosts[i], 154, s, 'text', 700)));
    const t = table(px + 10, 168, [{ t: 'MAC', w: 62, align: 'center' }, { t: '포트', w: 62, align: 'center' }], rows, { hl, rowH: 22, headH: 22 });
    o.push(t.svg);
  };
  panel(4, '① 처음: 모든 포트로', true, [['A', '1']], []);
  panel(152, '② 배운 뒤: B 포트로만', false, [['A', '1'], ['B', '2']], [1]);
  return [300, 246, o];
};

// 라우터의 경로표: 받는 곳 192.168.20.7 → 두 번째 줄 → 인터페이스 2
figs['rt-table'] = () => {
  const o = [];
  const R = [150, 96];
  o.push(line(R[0] - 22, R[1] + 4, 62, 148, { tone: 'weak', sw: 2.5 }));
  o.push(line(R[0] + 22, R[1] + 4, 238, 148, { tone: 'accent', sw: 3 }));
  o.push(line(R[0] + 16, R[1] - 10, 238, 46, { tone: 'weak', sw: 2.5 }));
  o.push(g.router(R[0], R[1], { tone: 'accent' }));
  o.push(g.sw(58, 158));
  o.push(g.sw(234, 158, { tone: 'accent' }));
  o.push(g.cloud(256, 32, { scale: 0.8 }));
  o.push(text(256, 36, '인터넷', { size: 13, tone: 'sub', anchor: 'middle', weight: 600 }));
  o.push(text(60, 194, '192.168.10.0/24', { size: 13, weight: 600, tone: 'sub', anchor: 'middle', mono: true }));
  o.push(text(238, 194, '192.168.20.0/24', { size: 13, weight: 700, tone: 'accent', anchor: 'middle', mono: true }));
  // 인터페이스 번호
  o.push(badge(104, 122, 1, { tone: 'sub' }));
  o.push(badge(196, 122, 2));
  o.push(badge(204, 62, 3, { tone: 'sub' }));
  // 들어온 패킷
  const p = packet(6, 16, [{ t: '받는 곳', tone: 'sub' }, { t: '192.168.20.7', tone: 'accent' }]);
  o.push(p.svg);
  o.push(arrow([[70, 42], [100, 70], [124, 88]], { tone: 'accent', sw: 2, size: 7, dash: '4 3' }));
  // 경로표
  o.push(text(8, 222, '라우터의 경로표', { size: 13, weight: 700, tone: 'sub' }));
  const t = table(4, 230, [{ t: '받는 곳', w: 150 }, { t: '넘길 곳', w: 142 }], [
    ['192.168.10.0/24', '인터페이스 1'],
    ['192.168.20.0/24', '인터페이스 2'],
    ['0.0.0.0/0 (나머지)', '3 → 인터넷 쪽'],
  ], { hl: [1] });
  o.push(t.svg);
  return [300, 328, o];
};

// ── vlans ──

// 스위치 한 대를 VLAN 10과 20으로 나눔. 개발 PC 1의 플러딩은 VLAN 10 안에서만 퍼져요
figs['vlan-split'] = () => {
  const o = [];
  o.push(rect(6, 92, 140, 120, { rx: 12, fill: 'accentWeak', stroke: 'none' }));
  o.push(rect(154, 92, 140, 120, { rx: 12, fill: 'card', stroke: 'none' }));
  const S = [146, 40];
  const hosts = [[42, 0, 'accent'], [110, 1, 'accent'], [190, 4, 'sub'], [258, 5, 'sub']];
  hosts.forEach(([hx, port], i) => {
    const [ptx, pty] = g.sw.port(S[0], S[1], port);
    if (i === 0) o.push(arrow([[hx, 112], [ptx, pty + 8]], { tone: 'accent', sw: 2.5, size: 8 }));
    else if (i === 1) o.push(arrow([[ptx, pty + 8], [hx, 112]], { tone: 'accent', sw: 2.5, size: 8 }));
    else o.push(line(ptx, pty + 8, hx, 112, { tone: 'weak', sw: 2 }));
    o.push(g.pc(hx, 132));
  });
  o.push(g.sw(S[0], S[1], { lit: [0, 1] }));
  o.push(text(S[0] + 40, S[1] + 6, '스위치 한 대', { size: 13, weight: 600, tone: 'sub' }));
  o.push(label(42, 166, '개발 PC 1', 'text', 600));
  o.push(label(110, 166, '개발 PC 2', 'text', 600));
  o.push(label(190, 166, '회계 PC 1', 'text', 600));
  o.push(label(258, 166, '회계 PC 2', 'text', 600));
  o.push(label(76, 198, 'VLAN 10', 'accent', 700));
  o.push(label(224, 198, 'VLAN 20', 'sub', 700));
  o.push(bubble(60, 72, '모두에게', { tailX: 52, tail: 'down' }));
  return [300, 216, o];
};

/// 물리 포트와 VLAN 인터페이스가 세는 트래픽
figs['vlan-counters'] = () => {
  const o = [];
  o.push(zone(4, 40, 292, 120, 'L3 스위치', { fill: 'card', dash: null, labelTone: 'sub' }));
  o.push(g.cloud(228, 20, { scale: 0.75 }));
  o.push(text(228, 24, '밖', { size: 13, tone: 'sub', anchor: 'middle', weight: 600 }));
  // ② PC 1 → Gi1/0/1 → Vlan10 → 밖 (파랑)
  o.push(arrow([[50, 214], [50, 86], [198, 86]], { tone: 'accent', sw: 2.5, size: 8 }));
  o.push(arrow([[228, 70], [228, 36]], { tone: 'accent', sw: 2.5, size: 8 }));
  // ① PC 1 → Gi1/0/1 → Gi1/0/2 → PC 2 (회색 점선)
  o.push(arrow([[70, 214], [70, 116], [150, 116], [150, 214]], { tone: 'sub', sw: 2.5, size: 8, dash: '5 3' }));
  o.push(tag(60, 146, 'Gi1/0/1', { tone: 'plain' }));
  o.push(tag(150, 146, 'Gi1/0/2', { tone: 'plain' }));
  o.push(rect(198, 70, 60, 32, { rx: 6, fill: 'accentWeak', stroke: 'accent', dash: '4 3' }));
  o.push(text(228, 91, 'Vlan10', { size: 13, weight: 700, tone: 'accent', anchor: 'middle' }));
  o.push(text(228, 122, 'VLAN 10의', { size: 13, tone: 'sub', anchor: 'middle' }));
  o.push(text(228, 140, '가상 인터페이스', { size: 13, tone: 'sub', anchor: 'middle' }));
  o.push(g.pc(60, 232));
  o.push(g.pc(150, 232));
  o.push(label(60, 264, 'PC 1', 'text', 600));
  o.push(label(150, 264, 'PC 2', 'text', 600));
  o.push(badge(210, 204, 1, { tone: 'sub' }));
  o.push(text(224, 209, 'VLAN 안', { size: 13, weight: 600, tone: 'sub' }));
  o.push(badge(210, 232, 2));
  o.push(text(224, 237, '밖으로', { size: 13, weight: 600, tone: 'accent' }));
  const t = table(4, 280, [{ t: '세는 곳', w: 100 }, { t: '① VLAN 안', w: 96, align: 'center' }, { t: '② 밖으로', w: 96, align: 'center' }], [
    ['Gi1/0/1', '세요', '세요'],
    ['Vlan10', '빠져요', '세요'],
  ], { hl: [1] });
  o.push(t.svg);
  return [300, 354, o];
};

// ── routing-protocols ──

// 정적 경로와 라우팅 프로토콜: B 너머 길이 끊기면
figs['rp-static-dynamic'] = () => {
  const o = [];
  const panel = (y0, title, sub, dynamic) => {
    o.push(rect(4, y0, 292, 132, { rx: 12, fill: 'card', stroke: 'none' }));
    o.push(text(16, y0 + 22, title, { size: 14, weight: 700 }));
    o.push(text(16, y0 + 40, sub, { size: 13, tone: 'sub' }));
    const A = [42, y0 + 92];
    const B = [150, y0 + 66];
    const C = [150, y0 + 112];
    const Dn = [262, y0 + 88];
    o.push(line(A[0] + 20, A[1] - 6, B[0] - 20, B[1], { tone: dynamic ? 'weak' : 'accent', sw: dynamic ? 2 : 3 }));
    o.push(line(A[0] + 20, A[1] + 6, C[0] - 20, C[1], { tone: dynamic ? 'accent' : 'weak', sw: dynamic ? 3 : 2 }));
    o.push(line(B[0] + 22, B[1], Dn[0] - 14, Dn[1] - 8, { tone: 'weak', sw: 2, dash: '4 4' }));
    o.push(xmark(206, (B[1] + Dn[1] - 8) / 2, { r: 6 }));
    o.push(line(C[0] + 22, C[1], Dn[0] - 14, Dn[1] + 8, { tone: dynamic ? 'accent' : 'weak', sw: dynamic ? 3 : 2 }));
    o.push(g.router(A[0], A[1], { tone: 'accent' }));
    o.push(g.router(B[0], B[1]));
    o.push(g.router(C[0], C[1]));
    o.push(g.server(Dn[0], Dn[1]));
    o.push(text(A[0], A[1] + 28, 'A', { size: 13, weight: 700, anchor: 'middle', tone: 'accent' }));
    o.push(text(B[0] + 30, B[1] - 6, 'B', { size: 13, weight: 700, anchor: 'middle' }));
    o.push(text(C[0] + 30, C[1] + 18, 'C', { size: 13, weight: 700, anchor: 'middle' }));
    o.push(text(Dn[0], Dn[1] + 32, '목적지', { size: 13, weight: 600, anchor: 'middle', tone: 'sub' }));
    o.push(tag(250, y0 + 26, dynamic ? 'C로 바꿔요' : 'B로 계속 보내요', { tone: dynamic ? 'accent' : 'warnSoft', anchor: 'middle' }));
  };
  panel(4, '정적 경로', '사람이 적은 길 · B로 가요', false);
  panel(142, '라우팅 프로토콜', '라우터끼리 알려 준 길', true);
  return [300, 278, o];
};

// ── interfaces-and-traffic ──

// 바이트 카운터 두 번 읽기 → bps → 사용률
figs['if-bps'] = () => {
  const o = [];
  o.push(text(150, 18, 'ifHCInOctets를 60초 간격으로 읽어요', { size: 13, weight: 600, tone: 'sub', anchor: 'middle' }));
  o.push(line(60, 52, 240, 52, { tone: 'line', sw: 3 }));
  o.push(g.circle(60, 52, 5, { fill: 'sub' }));
  o.push(g.circle(240, 52, 5, { fill: 'sub' }));
  o.push(label(60, 40, '0초', 'sub', 600));
  o.push(label(240, 40, '60초', 'sub', 600));
  o.push(text(60, 76, '1,000,000,000', { size: 13, anchor: 'middle', mono: true }));
  o.push(text(240, 76, '4,750,000,000', { size: 13, anchor: 'middle', mono: true }));
  const box = (y, s, tone) => {
    const fill = tone === 'accent' ? 'accent' : tone === 'soft' ? 'accentWeak' : 'card';
    const tx = tone === 'accent' ? 'card' : tone === 'soft' ? 'accent' : 'text';
    o.push(rect(30, y, 240, 28, { rx: 8, fill, stroke: tone ? 'none' : 'line' }));
    o.push(text(150, y + 19, s, { size: 14, weight: 700, tone: tx, anchor: 'middle' }));
  };
  const step = (y1, y2, op) => {
    o.push(arrow([[150, y1], [150, y2]], { tone: 'weak', sw: 2, size: 7 }));
    o.push(text(162, (y1 + y2) / 2 + 5, op, { size: 13, weight: 700, tone: 'accent' }));
  };
  box(94, '늘어난 수 3,750,000,000바이트');
  step(122, 142, '× 8 (비트로)');
  box(142, '30,000,000,000비트');
  step(170, 190, '÷ 60초');
  box(190, '500,000,000bps = 500Mbps', 'soft');
  step(218, 238, '÷ 1Gbps');
  box(238, '받는 쪽 사용률 50%', 'accent');
  // 회선 막대
  o.push(rect(20, 286, 260, 18, { rx: 9, fill: 'line', stroke: 'none' }));
  o.push(rect(20, 286, 130, 18, { rx: 9, fill: 'accent', stroke: 'none' }));
  o.push(text(26, 324, '500Mbps', { size: 13, weight: 700, tone: 'accent' }));
  o.push(text(280, 324, '회선 1Gbps', { size: 13, weight: 600, tone: 'sub', anchor: 'end' }));
  o.push(text(150, 352, '보내는 쪽(ifHCOutOctets)도 따로 계산해요', { size: 13, tone: 'sub', anchor: 'middle' }));
  return [300, 362, o];
};

// 32비트 카운터가 34초마다 한 바퀴: 60초 간격으로 읽으면 한 바퀴를 놓쳐요
figs['if-wrap'] = () => {
  const o = [];
  const X0 = 34;
  const X1 = 290;
  const T = 72;
  const Y0 = 150;
  const Y1 = 44;
  const lap = 4294967296 / 125000000; // 34.36초
  const xs = (t) => X0 + ((X1 - X0) * t) / T;
  const ys = (v) => Y0 - (Y0 - Y1) * v;
  o.push(line(X0, Y0, X1, Y0, { tone: 'line', sw: 1.5 }));
  o.push(line(X0, Y1, X1, Y1, { tone: 'line', sw: 1, dash: '3 4' }));
  o.push(text(X0 - 4, Y1 + 5, '43억', { size: 13, tone: 'sub', anchor: 'end' }));
  o.push(text(X0 - 4, Y0 + 5, '0', { size: 13, tone: 'sub', anchor: 'end' }));
  // 톱니
  const seg = [];
  let t = 0;
  while (t < T - 1e-9) {
    const end = Math.min(T, (Math.floor(t / lap + 1e-9) + 1) * lap);
    const v0 = (t % lap) / lap;
    const v1 = end === T ? (T % lap) / lap : 1;
    seg.push('M' + xs(t).toFixed(1) + ' ' + ys(v0).toFixed(1) + ' L' + xs(end).toFixed(1) + ' ' + ys(v1).toFixed(1));
    if (end < T) seg.push('M' + xs(end).toFixed(1) + ' ' + ys(1).toFixed(1) + ' L' + xs(end).toFixed(1) + ' ' + ys(0).toFixed(1));
    t = end;
  }
  o.push(g.path(seg.join(' '), { stroke: 'sub', sw: 2.2 }));
  // 한 바퀴 표시
  o.push(g.path('M' + xs(0) + ' ' + (Y1 - 14) + ' v4 H' + xs(lap).toFixed(1) + ' v-4', { stroke: 'sub', sw: 1.4 }));
  o.push(text(xs(lap / 2), Y1 - 18, '한 바퀴 약 34초', { size: 13, weight: 600, tone: 'sub', anchor: 'middle' }));
  // 읽은 때
  const read = (tt, n, anchor) => {
    const v = (tt % lap) / lap;
    o.push(line(xs(tt), Y0 + 4, xs(tt), ys(v), { tone: 'accent', sw: 1.5, dash: '3 3' }));
    o.push(g.circle(xs(tt), ys(v), 5, { fill: 'accent' }));
    o.push(text(xs(tt), Y0 + 20, n, { size: 13, weight: 700, tone: 'accent', anchor }));
  };
  read(0, '0초에 읽음', 'start');
  read(60, '60초에 읽음', 'middle');
  o.push(text(8, 204, '두 값의 차이 약 32억 바이트', { size: 13, weight: 700, tone: 'warn' }));
  o.push(text(8, 222, '→ 427Mbps로 보여요', { size: 13, tone: 'warn' }));
  o.push(text(8, 248, '실제로 오간 양 75억 바이트', { size: 13, weight: 700, tone: 'text' }));
  o.push(text(8, 266, '→ 1Gbps, 한 바퀴를 놓쳤어요', { size: 13, tone: 'sub' }));
  const t2 = table(4, 284, [{ t: '한 바퀴 도는 시간', w: 116 }, { t: '1Gbps', w: 88, align: 'center' }, { t: '10Gbps', w: 88, align: 'center' }], [
    ['32비트', '약 34초', '약 3.4초'],
    ['64비트(ifHC)', '수천 년', '수백 년'],
  ], { hl: [1] });
  o.push(t2.svg);
  return [300, 358, o];
};

// 관리 상태 × 동작 상태
figs['if-status'] = () => {
  const o = [];
  const X = [4, 100, 198, 296];
  const Y = [30, 62, 132, 202];
  o.push(text(198, 18, '동작 상태(ifOperStatus)', { size: 13, weight: 600, tone: 'sub', anchor: 'middle' }));
  o.push(text(52, 18, '관리 상태', { size: 13, weight: 600, tone: 'sub', anchor: 'middle' }));
  o.push(rect(X[1], Y[0], 96, 30, { rx: 6, fill: 'line', stroke: 'none' }));
  o.push(rect(X[2], Y[0], 98, 30, { rx: 6, fill: 'line', stroke: 'none' }));
  o.push(text(148, Y[0] + 20, 'up', { size: 14, weight: 700, anchor: 'middle' }));
  o.push(text(247, Y[0] + 20, 'down', { size: 14, weight: 700, anchor: 'middle' }));
  o.push(rect(X[0], Y[1], 92, 68, { rx: 6, fill: 'line', stroke: 'none' }));
  o.push(rect(X[0], Y[2], 92, 68, { rx: 6, fill: 'line', stroke: 'none' }));
  o.push(text(50, Y[1] + 30, 'up', { size: 14, weight: 700, anchor: 'middle' }));
  o.push(text(50, Y[1] + 50, '켜 둠', { size: 13, tone: 'sub', anchor: 'middle' }));
  o.push(text(50, Y[2] + 30, 'down', { size: 14, weight: 700, anchor: 'middle' }));
  o.push(text(50, Y[2] + 50, '꺼 둠', { size: 13, tone: 'sub', anchor: 'middle' }));
  const cell = (c, r, l1, l2, tone) => {
    const fill = tone === 'warn' ? 'warnWeak' : tone === 'none' ? 'bg' : 'card';
    const w = c === 1 ? 96 : 98;
    o.push(rect(X[c], Y[r], w, 68, { rx: 6, fill, stroke: tone === 'warn' ? 'warn' : 'line', sw: tone === 'warn' ? 2 : 1, dash: tone === 'none' ? '4 3' : undefined }));
    const cx = X[c] + w / 2;
    o.push(text(cx, Y[r] + 30, l1, { size: 14, weight: 700, tone: tone === 'warn' ? 'warn' : tone === 'none' ? 'weak' : 'text', anchor: 'middle' }));
    if (l2) o.push(text(cx, Y[r] + 50, l2, { size: 13, tone: tone === 'warn' ? 'warn' : 'sub', anchor: 'middle' }));
  };
  cell(1, 1, '정상', '쓰는 중');
  cell(2, 1, '고장이에요', '알림 대상', 'warn');
  cell(1, 2, '생기지 않아요', '', 'none');
  cell(2, 2, '정상이에요', '알림 대상 아님');
  o.push(text(150, 226, '관리 상태 = ifAdminStatus', { size: 13, tone: 'sub', anchor: 'middle' }));
  return [300, 234, o];
};

// ── redundancy ──

// STP: 삼각형에서 한 길을 막아 두고, 쓰던 길이 끊기면 열어요
figs['red-stp'] = () => {
  const o = [];
  const panel = (px, title, broken) => {
    o.push(rect(px, 4, 144, 190, { rx: 12, fill: 'card', stroke: 'none' }));
    o.push(text(px + 12, 26, title, { size: 13, weight: 700 }));
    const A = [px + 72, 74];
    const B = [px + 32, 146];
    const C = [px + 112, 146];
    if (broken) {
      o.push(line(A[0] - 16, A[1] + 12, B[0] + 2, B[1] - 14, { tone: 'weak', sw: 2.5, dash: '4 4' }));
      o.push(xmark((A[0] + B[0]) / 2 - 6, (A[1] + B[1]) / 2, { r: 6 }));
    } else o.push(line(A[0] - 16, A[1] + 12, B[0] + 2, B[1] - 14, { tone: 'accent', sw: 3 }));
    o.push(line(A[0] + 16, A[1] + 12, C[0] - 2, C[1] - 14, { tone: 'accent', sw: 3 }));
    if (broken) o.push(line(B[0] + 28, B[1] + 2, C[0] - 28, C[1] + 2, { tone: 'accent', sw: 3 }));
    else {
      o.push(line(B[0] + 28, B[1] + 2, C[0] - 28, C[1] + 2, { tone: 'weak', sw: 2.5, dash: '4 4' }));
      o.push(g.circle(C[0] - 36, C[1] + 2, 6, { fill: 'card', stroke: 'warn', sw: 2 }));
      o.push(line(C[0] - 40, C[1] + 6, C[0] - 32, C[1] - 2, { tone: 'warn', sw: 2 }));
    }
    o.push(g.sw(A[0] - 3, A[1], { tone: 'accent' }));
    o.push(g.sw(B[0] - 3, B[1]));
    o.push(g.sw(C[0] - 3, C[1]));
    o.push(text(A[0], A[1] - 22, 'A · 루트', { size: 13, weight: 700, tone: 'accent', anchor: 'middle' }));
    o.push(label(B[0], B[1] + 34, 'B', 'text', 700));
    o.push(label(C[0], C[1] + 34, 'C', 'text', 700));
    o.push(text(px + 72, 180, broken ? '열어요' : '막아 둠', { size: 13, weight: 700, tone: broken ? 'accent' : 'warn', anchor: 'middle' }));
  };
  panel(4, '① 평소', false);
  panel(152, '② A–B가 끊기면', true);
  return [300, 198, o];
};

// LACP: 1Gbps 둘을 묶어도 흐름 하나는 멤버 하나로
figs['red-lacp'] = () => {
  const o = [];
  o.push(rect(78, 36, 144, 104, { rx: 18, fill: 'accentWeak', stroke: 'accent', dash: '5 4' }));
  o.push(line(64, 72, 236, 72, { tone: 'accent', sw: 6 }));
  o.push(line(64, 106, 236, 106, { tone: 'sub', sw: 6 }));
  o.push(g.sw(36, 89));
  o.push(g.sw(258, 89));
  o.push(text(150, 58, '멤버 1 · 1Gbps', { size: 13, weight: 600, tone: 'sub', anchor: 'middle' }));
  o.push(text(150, 132, '멤버 2 · 1Gbps', { size: 13, weight: 600, tone: 'sub', anchor: 'middle' }));
  o.push(tag(150, 72, '흐름 A', { tone: 'accent' }));
  o.push(tag(120, 106, '흐름 B', { tone: 'plain' }));
  o.push(tag(182, 106, '흐름 C', { tone: 'plain' }));
  o.push(text(150, 24, '묶은 논리 링크 2Gbps', { size: 13, weight: 700, tone: 'accent', anchor: 'middle' }));
  o.push(text(150, 166, '흐름마다 멤버 하나를 정해요', { size: 13, weight: 600, tone: 'text', anchor: 'middle' }));
  o.push(text(150, 186, '흐름 A 하나는 1Gbps를 넘지 못해요', { size: 13, tone: 'sub', anchor: 'middle' }));
  return [300, 196, o];
};

// VRRP: 라우터 둘이 가상 IP 하나를 함께 맡아요
figs['red-vrrp'] = () => {
  const o = [];
  o.push(rect(16, 26, 268, 96, { rx: 16, fill: 'accentWeak', stroke: 'accent', dash: '5 4' }));
  o.push(text(150, 18, '가상 IP 10.0.0.1', { size: 13, weight: 700, tone: 'accent', anchor: 'middle' }));
  o.push(line(80, 96, 136, 154, { tone: 'accent', sw: 3 }));
  o.push(line(220, 96, 164, 154, { tone: 'weak', sw: 2 }));
  o.push(text(80, 50, '라우터 1 · 마스터', { size: 13, weight: 700, tone: 'accent', anchor: 'middle' }));
  o.push(text(220, 50, '라우터 2 · 대기', { size: 13, weight: 700, tone: 'text', anchor: 'middle' }));
  o.push(g.router(80, 80, { tone: 'accent' }));
  o.push(g.router(220, 80));
  o.push(arrow([[106, 80], [194, 80]], { tone: 'accent', sw: 1.8, dash: '4 3', size: 7 }));
  o.push(text(150, 104, '1초마다 알림', { size: 13, weight: 600, tone: 'accent', anchor: 'middle' }));
  o.push(g.sw(147, 166));
  o.push(line(128, 180, 80, 208, { sw: 2 }));
  o.push(line(172, 180, 220, 208, { sw: 2 }));
  o.push(g.server(70, 226));
  o.push(g.server(230, 226));
  o.push(text(150, 222, '서버들', { size: 13, weight: 700, anchor: 'middle' }));
  o.push(text(150, 242, '게이트웨이 = 10.0.0.1', { size: 13, tone: 'sub', anchor: 'middle' }));
  return [300, 250, o];
};

// ── tunnels ──

// 터널: 지사와 본사를 인터넷 너머로 잇고, 터널 안에서만 바깥 주소로 감싸요
figs['tun-vpn'] = () => {
  const o = [];
  o.push(zone(4, 4, 84, 110, '지사', { fill: 'card', dash: null }));
  o.push(zone(212, 4, 84, 110, '본사', { fill: 'card', dash: null }));
  o.push(g.cloud(150, 64, { scale: 0.95 }));
  o.push(rect(90, 54, 120, 22, { rx: 11, fill: 'accentWeak', stroke: 'accent', sw: 1.8 }));
  o.push(text(150, 69, '터널', { size: 13, weight: 700, tone: 'accent', anchor: 'middle' }));
  o.push(text(150, 100, '인터넷', { size: 13, tone: 'sub', anchor: 'middle', weight: 600 }));
  o.push(line(36, 70, 52, 70, { tone: 'weak', sw: 2.5 }));
  o.push(line(248, 70, 264, 70, { tone: 'weak', sw: 2.5 }));
  o.push(g.pc(24, 66));
  o.push(g.router(70, 66, { tone: 'accent' }));
  o.push(g.router(230, 66, { tone: 'accent' }));
  o.push(g.server(278, 66));
  o.push(text(70, 102, '입구', { size: 13, weight: 700, tone: 'accent', anchor: 'middle' }));
  o.push(text(230, 102, '출구', { size: 13, weight: 700, tone: 'accent', anchor: 'middle' }));
  o.push(badge(46, 38, 1));
  o.push(badge(150, 34, 2));
  o.push(badge(254, 38, 3));
  const row = (y, n, title, fields) => {
    o.push(badge(14, y, n));
    o.push(text(30, y + 5, title, { size: 13, weight: 700 }));
    o.push(packet(4, y + 14, fields, { pad: 8 }).svg);
  };
  row(138, 1, '지사 안: 원래 패킷', [{ t: '안쪽 IP', tone: 'soft' }, { t: '데이터' }]);
  row(198, 2, '터널 안: 바깥 주소로 감싸요', [{ t: '바깥 IP', tone: 'accent' }, { t: '터널 머리', tone: 'accent' }, { t: '안쪽 IP', tone: 'soft' }, { t: '데이터' }]);
  row(258, 3, '본사 안: 벗겨서 넘겨요', [{ t: '안쪽 IP', tone: 'soft' }, { t: '데이터' }]);
  return [300, 300, o];
};

// MTU 블랙홀: 큰 응답은 터널 입구에서 버려지고, ICMP는 방화벽에 막혀요
figs['tun-pmtud'] = () => {
  const o = [];
  const L = [{ x: 30 }, { x: 110 }, { x: 190 }, { x: 270 }];
  o.push(g.server(30, 26));
  o.push(g.firewall(110, 26));
  o.push(g.router(190, 26, { tone: 'accent' }));
  o.push(g.pc(270, 26));
  o.push(label(30, 60, '서버'));
  o.push(label(110, 60, '방화벽'));
  o.push(text(190, 60, '터널 입구', { size: 13, weight: 700, tone: 'accent', anchor: 'middle' }));
  o.push(label(270, 60, '클라이언트'));
  o.push(ladder(L.map((l) => ({ ...l, label: '' })), [
    { from: 3, to: 0, y: 100, label: '요청(작음)', dx: 40 },
    { from: 0, to: 2, y: 144, label: '응답 1,500B', tone: 'warn', lost: 0.93 },
    { from: 2, to: 0, y: 190, label: 'ICMP 너무 커요', tone: 'warn', dashed: true, lost: 0.46 },
    { from: 0, to: 2, y: 236, label: '다시 1,500B', tone: 'warn', lost: 0.93 },
  ], { top: 66, bottom: 250 }));
  o.push(text(198, 149, '버림', { size: 13, weight: 700, tone: 'warn' }));
  o.push(text(98, 195, '막힘', { size: 13, weight: 700, tone: 'warn', anchor: 'end' }));
  o.push(text(198, 241, '또 버림', { size: 13, weight: 700, tone: 'warn' }));
  o.push(text(150, 276, '서버는 줄일 줄 모르고 같은 크기로 또 보내요', { size: 13, tone: 'sub', anchor: 'middle' }));
  return [300, 284, o];
};


// ── snmp ──

// 관리 서버가 묻고 장비의 에이전트가 답해요. 1분마다 되풀이(폴링)
figs['snmp-poll'] = () => {
  const o = [];
  o.push(zone(150, 4, 146, 158, '장비', { fill: 'card', dash: null, labelTone: 'text' }));
  o.push(g.app(222, 46, '에이전트', { w: 92, tone: 'accent' }));
  o.push(tag(258, 20, 'UDP 161', { tone: 'sub', size: 13 }));
  const t = table(160, 70, [{ t: '값', w: 70 }, { t: '지금', w: 56, align: 'right' }], [['가동 시간', '41일'], ['받은 바이트', '37.5억']], { rowH: 22, headH: 22 });
  o.push(t.svg);
  o.push(line(222, 58, 222, 70, { tone: 'weak', sw: 1.5 }));
  o.push(g.server(40, 60));
  o.push(label(40, 98, '관리 서버', 'text', 700));
  o.push(arrow([[60, 40], [174, 40]], { tone: 'accent', sw: 2.4, size: 8 }));
  o.push(text(114, 32, 'GET 두 값', { size: 13, weight: 700, tone: 'accent', anchor: 'middle' }));
  o.push(arrow([[174, 66], [60, 66]], { tone: 'sub', sw: 2.2, size: 8, dash: '5 4' }));
  o.push(text(110, 84, '41일, 37.5억', { size: 13, weight: 600, tone: 'sub', anchor: 'middle' }));
  // 되풀이
  o.push(g.path('M30 150 A26 26 0 1 1 86 150', { stroke: 'accent', sw: 2 }));
  o.push(g.head(86, 150, 88, 138, { tone: 'accent', size: 7 }));
  o.push(text(58, 154, '1분', { size: 13, weight: 700, tone: 'accent', anchor: 'middle' }));
  o.push(text(58, 186, '1분마다 다시 물어요(폴링)', { size: 13, weight: 600, tone: 'accent', anchor: 'start' }).replace('x="58"', 'x="8"'));
  return [300, 196, o];
};

// ── device-health ──

const chip = (cx, cy) => {
  const o = [rect(cx - 15, cy - 15, 30, 30, { rx: 4, fill: 'card', stroke: 'sub', sw: 1.8 }), rect(cx - 8, cy - 8, 16, 16, { rx: 2, fill: 'line', stroke: 'none' })];
  for (const d of [-8, 0, 8]) {
    o.push(line(cx + d, cy - 15, cx + d, cy - 20, { tone: 'sub', sw: 1.6 }), line(cx + d, cy + 15, cx + d, cy + 20, { tone: 'sub', sw: 1.6 }));
    o.push(line(cx - 15, cy + d, cx - 20, cy + d, { tone: 'sub', sw: 1.6 }), line(cx + 15, cy + d, cx + 20, cy + d, { tone: 'sub', sw: 1.6 }));
  }
  return o.join('\n');
};
const thermo = (cx, cy) =>
  [
    g.path(`M${cx - 5} ${cy + 6} V${cy - 16} A5 5 0 0 1 ${cx + 5} ${cy - 16} V${cy + 6} A9 9 0 1 1 ${cx - 5} ${cy + 6} z`, { fill: 'card', stroke: 'sub', sw: 1.8 }),
    g.circle(cx, cy + 13, 5.5, { fill: 'warn' }),
    line(cx, cy + 8, cx, cy - 8, { tone: 'warn', sw: 3 }),
  ].join('\n');
const fan = (cx, cy) => {
  const o = [g.circle(cx, cy, 15, { fill: 'card', stroke: 'sub', sw: 1.8 })];
  for (let i = 0; i < 4; i++) {
    const a = (i * Math.PI) / 2;
    const x1 = cx + 11 * Math.cos(a);
    const y1 = cy + 11 * Math.sin(a);
    const x2 = cx + 11 * Math.cos(a + 0.9);
    const y2 = cy + 11 * Math.sin(a + 0.9);
    o.push(g.path(`M${cx} ${cy} Q${x1.toFixed(1)} ${y1.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)} z`, { fill: 'line', stroke: 'sub', sw: 1.2 }));
  }
  o.push(g.circle(cx, cy, 2.5, { fill: 'sub' }));
  return o.join('\n');
};

// 장비 한 대 안의 부품: CPU·메모리, 온도 센서, 팬, 전원 공급 장치 둘
figs['dh-parts'] = () => {
  const o = [];
  o.push(zone(4, 4, 292, 186, '장비 한 대', { fill: 'card', dash: null, labelTone: 'text' }));
  o.push(chip(52, 64));
  o.push(label(52, 104, 'CPU·메모리', 'text', 700));
  o.push(text(52, 122, '관리 일의 양', { size: 13, tone: 'sub', anchor: 'middle' }));
  o.push(thermo(150, 62));
  o.push(label(150, 104, '온도 센서', 'text', 700));
  o.push(text(150, 122, '42.5℃', { size: 13, tone: 'sub', anchor: 'middle' }));
  o.push(fan(230, 62));
  o.push(fan(264, 62));
  o.push(label(247, 104, '팬', 'text', 700));
  o.push(text(247, 122, '돌고 있나', { size: 13, tone: 'sub', anchor: 'middle' }));
  const psu = (x, n, ok) => {
    o.push(rect(x, 140, 132, 36, { rx: 6, fill: ok ? 'card' : 'warnWeak', stroke: ok ? 'sub' : 'warn', sw: 1.8 }));
    for (let i = 0; i < 4; i++) o.push(line(x + 10 + i * 6, 148, x + 10 + i * 6, 168, { tone: ok ? 'weak' : 'warn', sw: 1.5 }));
    o.push(text(x + 40, 163, `전원 공급 장치 ${n}`, { size: 13, weight: 700, tone: ok ? 'text' : 'warn' }));
  };
  psu(16, 1, true);
  psu(152, 2, false);
  o.push(g.server(150, 236, { tone: 'accent' }));
  o.push(arrow([[150, 216], [150, 194]], { tone: 'accent', sw: 2, size: 7, dash: '4 3' }));
  o.push(text(168, 210, 'SNMP로 읽어요', { size: 13, weight: 700, tone: 'accent' }));
  o.push(text(168, 244, '관리 서버', { size: 13, weight: 600, tone: 'sub' }));
  return [300, 258, o];
};

// 전달은 전용 칩, 관리 일은 CPU
figs['dh-planes'] = () => {
  const o = [];
  o.push(zone(50, 26, 200, 164, '스위치·라우터', { fill: 'card', dash: null, labelTone: 'sub' }));
  // 지나가는 트래픽
  o.push(arrow([[8, 74], [292, 74]], { tone: 'accent', sw: 4, size: 10 }));
  for (const x of [12, 28, 252, 268]) o.push(rect(x, 68, 12, 12, { rx: 2, fill: 'accent', stroke: 'none' }));
  o.push(rect(96, 56, 108, 36, { rx: 8, fill: 'accentWeak', stroke: 'accent', sw: 1.8 }));
  o.push(text(150, 79, '전용 칩(ASIC)', { size: 13, weight: 700, tone: 'accent', anchor: 'middle' }));
  o.push(text(150, 16, '지나가는 트래픽은 칩이 넘겨요', { size: 13, weight: 600, tone: 'accent', anchor: 'middle' }));
  // CPU
  o.push(rect(108, 128, 84, 36, { rx: 8, fill: 'card', stroke: 'sub', sw: 1.8 }));
  o.push(text(150, 151, 'CPU', { size: 14, weight: 700, anchor: 'middle' }));
  o.push(arrow([[44, 214], [44, 146], [108, 146]], { tone: 'sub', sw: 2, size: 7 }));
  o.push(arrow([[256, 214], [256, 146], [192, 146]], { tone: 'sub', sw: 2, size: 7 }));
  o.push(g.server(44, 230));
  o.push(g.router(256, 232));
  o.push(text(44, 266, 'SNMP·SSH', { size: 13, weight: 600, tone: 'text', anchor: 'middle' }));
  o.push(text(256, 266, '라우팅·STP', { size: 13, weight: 600, tone: 'text', anchor: 'middle' }));
  o.push(text(150, 184, '장비에 오는 관리 일', { size: 13, weight: 600, tone: 'sub', anchor: 'middle' }));
  o.push(text(150, 214, '칩이 넘치면 → 패킷을 버려요', { size: 13, weight: 600, tone: 'accent', anchor: 'middle' }));
  o.push(text(150, 234, 'CPU가 바쁘면 → 관리 응답이 늦어요', { size: 13, weight: 600, tone: 'text', anchor: 'middle' }));
  return [300, 276, o];
};

// ── traps-and-syslog ──

/// 폴링은 사이의 짧은 down을 놓치고, Trap은 바로 오지만 사라질 수 있어요
figs['trap-vs-poll'] = () => {
  const o = [];
  const X0 = 84;
  const X1 = 290;
  const xs = (m) => X0 + ((X1 - X0) * m) / 4;
  const laneY = [34, 100, 162];
  o.push(text(4, laneY[0] + 5, '실제 링크', { size: 13, weight: 700 }));
  o.push(text(4, laneY[1] + 5, '폴링', { size: 13, weight: 700 }));
  o.push(text(4, laneY[1] + 23, '1분마다', { size: 13, tone: 'sub' }));
  o.push(text(4, laneY[2] + 5, 'Trap', { size: 13, weight: 700 }));
  o.push(text(4, laneY[2] + 23, '장비가 먼저', { size: 13, tone: 'sub' }));
  o.push(rect(xs(0), laneY[0] - 8, xs(1.3) - xs(0), 16, { rx: 3, fill: 'line', stroke: 'none' }));
  o.push(rect(xs(1.3), laneY[0] - 8, xs(1.6) - xs(1.3), 16, { rx: 3, fill: 'warn', stroke: 'none' }));
  o.push(rect(xs(1.6), laneY[0] - 8, xs(4) - xs(1.6), 16, { rx: 3, fill: 'line', stroke: 'none' }));
  o.push(text(xs(1.45), laneY[0] - 14, 'down', { size: 13, weight: 700, tone: 'warn', anchor: 'middle' }));
  for (let m = 0; m <= 4; m++) {
    o.push(line(xs(m), laneY[0] + 10, xs(m), laneY[1] - 8, { tone: 'line', sw: 1, dash: '2 3' }));
    o.push(g.circle(xs(m), laneY[1], 6, { fill: 'card', stroke: 'sub', sw: 2 }));
  }
  o.push(text(xs(3), laneY[1] + 26, '모두 up이라 놓쳐요', { size: 13, weight: 700, tone: 'warn', anchor: 'middle' }));
  // linkDown: 바로 닿아요
  o.push(arrow([[xs(1.3), laneY[0] + 10], [xs(1.3), laneY[2] - 2]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(tag(xs(1.3) + 8, laneY[2] + 8, 'linkDown 바로', { tone: 'accent', anchor: 'start' }));
  // linkUp: 사라져요
  o.push(line(xs(1.6), laneY[0] + 10, xs(1.6), laneY[0] + 30, { tone: 'sub', sw: 2, dash: '4 3' }));
  o.push(xmark(xs(1.6), laneY[0] + 38, { r: 5 }));
  o.push(text(xs(1.6) + 10, laneY[0] + 43, 'linkUp 사라짐', { size: 13, weight: 600, tone: 'warn', halo: 'bg' }));
  o.push(line(X0, 192, X1, 192, { tone: 'line', sw: 1.5 }));
  for (let m = 0; m <= 4; m++) o.push(text(xs(m), 210, `${m}분`, { size: 13, tone: 'sub', anchor: 'middle' }));
  return [300, 216, o];
};


// ── topology-discovery ──

// 스위치끼리 포트마다 자기소개를 주고받아 이웃 표에 적어요
figs['lldp-hello'] = () => {
  const o = [];
  o.push(line(84, 96, 216, 96, { tone: 'weak', sw: 3 }));
  o.push(arrow([[96, 86], [204, 86]], { tone: 'accent', sw: 2, size: 7 }));
  o.push(arrow([[204, 106], [96, 106]], { tone: 'sub', sw: 2, size: 7 }));
  o.push(g.sw(52, 96, { lit: [0] }));
  o.push(g.sw(244, 96, { lit: [5] }));
  o.push(text(90, 122, '1번', { size: 13, weight: 600, tone: 'sub' }));
  o.push(text(210, 122, '24번', { size: 13, weight: 600, tone: 'sub', anchor: 'end' }));
  o.push(label(52, 128, '스위치 A', 'text', 700));
  o.push(label(248, 128, '스위치 B', 'text', 700));
  o.push(bubble(84, 46, '나는 A, 1번 포트', { tailX: 70 }));
  o.push(bubble(216, 46, '나는 B, 24번 포트', { tone: 'plain', tailX: 232 }));
  const ta = table(4, 144, [{ t: '내 포트', w: 56 }, { t: '이웃', w: 82 }], [['1번', 'B의 24번']], { hl: [0] });
  const tb = table(158, 144, [{ t: '내 포트', w: 56 }, { t: '이웃', w: 82 }], [['24번', 'A의 1번']]);
  o.push(ta.svg, tb.svg);
  o.push(text(8, 208, 'A의 이웃 표', { size: 13, weight: 600, tone: 'sub' }));
  o.push(text(162, 208, 'B의 이웃 표', { size: 13, weight: 600, tone: 'sub' }));
  o.push(g.server(150, 250, { tone: 'accent' }));
  o.push(arrow([[132, 240], [76, 196]], { tone: 'accent', sw: 2, size: 7, dash: '4 3' }));
  o.push(text(170, 246, '관리 서버가', { size: 13, weight: 600, tone: 'accent' }));
  o.push(text(170, 264, 'SNMP로 읽어요', { size: 13, weight: 600, tone: 'accent' }));
  return [300, 272, o];
};

// 이웃 표를 이어 붙인 연결도, 선 양 끝의 포트 번호
figs['lldp-map'] = () => {
  const o = [];
  o.push(line(132, 52, 70, 126, { tone: 'sub', sw: 2.5 }));
  o.push(line(168, 52, 230, 126, { tone: 'sub', sw: 2.5 }));
  o.push(g.sw(147, 40, { tone: 'accent' }));
  o.push(g.sw(64, 140));
  o.push(g.sw(234, 140));
  o.push(tag(150, 14, '코어 스위치', { tone: 'accent' }));
  o.push(tag(124, 72, '24', { tone: 'plain' }));
  o.push(tag(176, 72, '48', { tone: 'plain' }));
  o.push(tag(78, 110, '1', { tone: 'plain' }));
  o.push(tag(222, 110, '1', { tone: 'plain' }));
  o.push(label(67, 174, '스위치 A', 'text', 700));
  o.push(label(237, 174, '스위치 B', 'text', 700));
  o.push(text(150, 200, '숫자는 선 양 끝의 포트 번호예요', { size: 13, tone: 'sub', anchor: 'middle' }));
  return [300, 208, o];
};

// 실제 연결과 연결도: LLDP가 꺼진 방화벽은 선이 빠져요
figs['lldp-missing'] = () => {
  const o = [];
  const panel = (px, title, map) => {
    o.push(rect(px, 4, 144, 168, { rx: 12, fill: 'card', stroke: 'none' }));
    o.push(text(px + 12, 26, title, { size: 13, weight: 700 }));
    const core = [px + 72, 60];
    const a = [px + 34, 132];
    const f = [px + 110, 132];
    o.push(line(core[0] - 10, core[1] + 12, a[0] + 4, a[1] - 14, { tone: 'sub', sw: 2.5 }));
    if (map) {
      o.push(line(core[0] + 10, core[1] + 12, f[0] - 4, f[1] - 16, { tone: 'warn', sw: 2, dash: '3 5' }));
      o.push(tag(px + 110, 92, '선 없음', { tone: 'warnSoft' }));
    } else o.push(line(core[0] + 10, core[1] + 12, f[0] - 4, f[1] - 16, { tone: 'sub', sw: 2.5 }));
    o.push(g.sw(core[0] - 3, core[1], { tone: 'accent' }));
    o.push(g.sw(a[0] - 3, a[1]));
    o.push(g.firewall(f[0], f[1], { tone: map ? 'warn' : undefined }));
    o.push(label(a[0], a[1] + 30, '스위치 A', 'text', 600));
    o.push(text(f[0], f[1] + 32, map ? 'LLDP 꺼짐' : '방화벽', { size: 13, weight: map ? 700 : 600, tone: map ? 'warn' : 'text', anchor: 'middle' }));
  };
  panel(4, '실제 연결', false);
  panel(152, '그려진 연결도', true);
  return [300, 176, o];
};

// ── flows ──

// 라우터가 흐름마다 세어 기록을 만들고, 수집기가 모아 순위를 보여 줘요
figs['flow-export'] = () => {
  const o = [];
  const pk = (x, tone) => rect(x, 30, 12, 12, { rx: 2, fill: tone, stroke: 'none' });
  o.push(line(8, 36, 292, 36, { tone: 'line', sw: 2 }));
  ['accent', 'sub', 'accent', 'accent', 'sub'].forEach((t, i) => o.push(pk(10 + i * 18, t)));
  ['accent', 'sub', 'accent'].forEach((t, i) => o.push(pk(220 + i * 18, t)));
  o.push(g.router(150, 36, { tone: 'accent' }));
  o.push(text(150, 72, '라우터가 흐름마다 세어 적어요', { size: 13, weight: 700, tone: 'accent', anchor: 'middle' }));
  const t = table(4, 84, [{ t: '출발지', w: 74 }, { t: '목적지', w: 104 }, { t: '바이트', w: 58, align: 'right' }, { t: '패킷', w: 56, align: 'right' }], [
    ['10.0.1.5', '10.0.9.20:443', '1.2GB', '86만'],
    ['10.0.2.8', '10.0.9.30:5432', '0.4GB', '31만'],
  ], { hl: [0] });
  o.push(t.svg);
  o.push(arrow([[60, 158], [60, 196]], { tone: 'accent', sw: 2.4, size: 8 }));
  o.push(text(70, 182, 'UDP로 보내요', { size: 13, weight: 600, tone: 'accent' }));
  o.push(g.server(60, 222, { tone: 'accent' }));
  o.push(label(60, 258, '수집기', 'accent', 700));
  // 분석 화면
  o.push(rect(118, 196, 178, 76, { rx: 8, fill: 'card', stroke: 'line' }));
  o.push(text(128, 216, '많이 쓴 곳', { size: 13, weight: 700, tone: 'sub' }));
  o.push(text(128, 240, '10.0.1.5', { size: 13 }));
  o.push(rect(190, 230, 96, 12, { rx: 3, fill: 'accent', stroke: 'none' }));
  o.push(text(128, 262, '10.0.2.8', { size: 13 }));
  o.push(rect(190, 252, 32, 12, { rx: 3, fill: 'sub', stroke: 'none' }));
  o.push(arrow([[84, 222], [116, 222]], { tone: 'weak', sw: 2, size: 7 }));
  return [300, 278, o];
};

// NetFlow·IPFIX는 장비가 묶어 세고, sFlow는 N개 중 1개를 떠요
figs['flow-netflow-sflow'] = () => {
  const o = [];
  const panel = (y0, title, sub, sflow) => {
    o.push(rect(4, y0, 292, 128, { rx: 12, fill: 'card', stroke: 'none' }));
    o.push(text(16, y0 + 22, title, { size: 14, weight: 700 }));
    o.push(text(284, y0 + 22, sub, { size: 13, tone: 'sub', anchor: 'end' }));
    const yy = y0 + 64;
    o.push(line(16, yy, 190, yy, { tone: 'line', sw: 2 }));
    for (let i = 0; i < 7; i++) {
      const x = 74 + i * 16;
      const picked = sflow && i === 3;
      o.push(rect(x, yy - 6, 11, 12, { rx: 2, fill: picked ? 'accent' : sflow ? 'line' : 'accentWeak', stroke: picked ? 'none' : sflow ? 'none' : 'accent', sw: 1 }));
    }
    if (sflow) o.push(g.sw(40, yy + 2));
    else o.push(g.router(40, yy));
    o.push(g.server(262, yy + 2));
    o.push(text(262, yy + 38, '수집기', { size: 13, weight: 700, anchor: 'middle' }));
    if (sflow) {
      o.push(arrow([[123, yy + 10], [123, yy + 34], [240, yy + 34], [240, yy + 10]], { tone: 'accent', sw: 2, size: 7 }));
      o.push(text(180, yy + 26, '머리 복사본', { size: 13, weight: 700, tone: 'accent', anchor: 'middle', halo: 'card' }));
      o.push(text(130, yy - 14, 'N개 중 1개', { size: 13, weight: 700, tone: 'accent', anchor: 'middle' }));
      o.push(text(16, yy + 54, '묶어 세는 일은 수집기가 해요', { size: 13, tone: 'sub' }));
    } else {
      o.push(g.path(`M74 ${yy + 9} v4 H185 v-4`, { stroke: 'accent', sw: 1.6 }));
      o.push(text(130, yy - 14, '모두 묶어 세요', { size: 13, weight: 700, tone: 'accent', anchor: 'middle' }));
      o.push(arrow([[130, yy + 13], [130, yy + 34], [240, yy + 34], [240, yy + 10]], { tone: 'accent', sw: 2, size: 7 }));
      o.push(text(200, yy + 27, '흐름 기록', { size: 13, weight: 700, tone: 'accent', anchor: 'middle', halo: 'card' }));
      o.push(text(16, yy + 54, '샘플링은 설정에 따라 써요', { size: 13, tone: 'sub' }));
    }
  };
  panel(4, 'NetFlow·IPFIX', 'Cisco v9 · IETF', false);
  panel(140, 'sFlow', 'sFlow.org', true);
  return [300, 272, o];
};


// ── tcp-connections ──

// 두 실패를 나란히: 그림 아래에 먼저 볼 곳
const twoLadders = (o, panels, lanesOf, h) => {
  panels.forEach((p, i) => {
    const px = 4 + i * 148;
    o.push(rect(px, 4, 144, h - 8, { rx: 12, fill: 'card', stroke: 'none' }));
    o.push(text(px + 72, 28, p.title, { size: 14, weight: 700, anchor: 'middle', tone: p.titleTone ?? 'text' }));
    (p.under ?? []).forEach((fn) => o.push(fn(px)));
    o.push(ladder(lanesOf(px), p.msgs, { top: 54, bottom: p.bottom ?? 190 }));
    (p.extra ?? []).forEach((fn) => o.push(fn(px)));
    p.foot.forEach((s, j) => o.push(text(px + 72, p.footY + j * 19, s, { size: 13, weight: j === 0 ? 700 : 400, tone: j === 0 ? (p.footTone ?? 'text') : 'sub', anchor: 'middle' })));
  });
};

// 연결 거부와 시간 초과
figs['tcp-fail'] = () => {
  const o = [];
  const lanes = (px) => [{ x: px + 38, label: '클라이언트' }, { x: px + 118, label: '서버' }];
  twoLadders(o, [
    {
      title: '연결 거부',
      msgs: [
        { from: 0, to: 1, y: 84, label: 'SYN' },
        { from: 1, to: 0, y: 112, label: 'RST(거부)', tone: 'warn', dashed: true },
      ],
      extra: [(px) => text(px + 78, 144, '서버 포트에', { size: 13, tone: 'sub', anchor: 'middle', halo: 'card' }), (px) => text(px + 78, 162, '아무도 없어요', { size: 13, tone: 'sub', anchor: 'middle', halo: 'card' })],
      foot: ['바로 실패해요', '먼저 볼 곳:', '서버 프로그램, 포트'],
      footY: 214,
      footTone: 'warn',
    },
    {
      title: '시간 초과',
      msgs: [
        { from: 0, to: 1, y: 84, label: 'SYN', lost: 0.55 },
        { from: 0, to: 1, y: 132, label: '다시 SYN', lost: 0.55 },
        { from: 0, to: 1, y: 180, label: '또 다시', lost: 0.55 },
      ],
      foot: ['한참 기다린 뒤 실패해요', '먼저 볼 곳:', '경로, 방화벽, 바쁜 서버'],
      footY: 214,
      footTone: 'warn',
    },
  ], lanes, 278);
  return [300, 278, o];
};

// ── packet-capture ──

// 캡처로 본 두 실패: 거부는 왕복 한 번, 답이 없으면 [S]만 되풀이
figs['cap-fail'] = () => {
  const o = [];
  const lanes = (px) => [{ x: px + 38, label: '클라이언트' }, { x: px + 118, label: '서버' }];
  const time = (s, y) => (px) => text(px + 6, y + 5, s, { size: 13, tone: 'sub', anchor: 'start', halo: 'card' });
  twoLadders(o, [
    {
      title: '연결 거부',
      msgs: [
        { from: 0, to: 1, y: 84, label: '[S]', dx: 8 },
        { from: 1, to: 0, y: 112, label: '[R.]', tone: 'warn', dashed: true, dx: 8 },
      ],
      foot: ['왕복 한 번(15ms)', '서버에 닿았고', '그 포트가 닫혔어요'],
      footY: 218,
      footTone: 'warn',
    },
    {
      title: '답이 없음',
      msgs: [
        { from: 0, to: 1, y: 84, label: '[S]', lost: 0.6, dx: 8 },
        { from: 0, to: 1, y: 116, label: '[S]', lost: 0.6, dx: 8 },
        { from: 0, to: 1, y: 148, label: '[S]', lost: 0.6, dx: 8 },
        { from: 0, to: 1, y: 180, label: '[S]', lost: 0.6, dx: 8 },
      ],
      extra: [time('0초', 84), time('1초', 116), time('2초', 148), time('3초', 180)],
      foot: ['4초 뒤 앱이 포기', '가는 길이나 오는 길에서', '사라져요'],
      footY: 218,
      footTone: 'warn',
      bottom: 194,
    },
  ], lanes, 280);
  return [300, 280, o];
};

// 어디서 잡을까: 같은 시각에 양쪽에서 잡아 견줘요
figs['cap-where'] = () => {
  const o = [];
  o.push(text(8, 18, 'A 클라이언트에서', { size: 13, weight: 700, tone: 'accent' }));
  o.push(text(292, 18, 'B 서버에서', { size: 13, weight: 700, tone: 'accent', anchor: 'end' }));
  const row = (y0, n, title, kind, aSee, bSee) => {
    o.push(rect(4, y0, 292, 86, { rx: 12, fill: 'card', stroke: 'none' }));
    o.push(badge(20, y0 + 18, n, { tone: 'sub' }));
    o.push(text(36, y0 + 23, title, { size: 13, weight: 700 }));
    const ay = y0 + 46;
    o.push(g.circle(30, ay, 11, { fill: 'accentWeak', stroke: 'accent', sw: 1.5 }));
    o.push(text(30, ay + 5, 'A', { size: 13, weight: 700, tone: 'accent', anchor: 'middle' }));
    o.push(g.circle(270, ay, 11, { fill: 'accentWeak', stroke: 'accent', sw: 1.5 }));
    o.push(text(270, ay + 5, 'B', { size: 13, weight: 700, tone: 'accent', anchor: 'middle' }));
    if (kind === 'go') {
      o.push(arrow([[44, ay - 4], [150, ay - 4]], { tone: 'sub', sw: 2, end: false }));
      o.push(xmark(156, ay - 4, { r: 5 }));
    } else {
      o.push(arrow([[44, ay - 4], [256, ay - 4]], { tone: 'sub', sw: 2, size: 7 }));
      if (kind === 'back') {
        o.push(arrow([[256, ay + 6], [150, ay + 6]], { tone: 'sub', sw: 2, dash: '4 3', end: false }));
        o.push(xmark(144, ay + 6, { r: 5 }));
      } else {
        o.push(arrow([[256, ay + 6], [44, ay + 6]], { tone: 'sub', sw: 2, dash: '4 3', size: 7 }));
        o.push(text(150, ay + 24, '늦게', { size: 13, weight: 700, tone: 'warn', anchor: 'middle' }));
      }
    }
    o.push(text(12, y0 + 78, aSee, { size: 13, weight: 600, tone: 'text' }));
    o.push(text(288, y0 + 78, bSee, { size: 13, weight: 600, tone: kind === 'go' ? 'warn' : 'text', anchor: 'end' }));
  };
  row(28, 1, '가는 길에서 사라지면', 'go', '[S]만 되풀이', '아무것도 없음');
  row(120, 2, '오는 길에서 사라지면', 'back', '[S]만 되풀이', '[S]와 [S.] 되풀이');
  row(212, 3, '서버가 느리면', 'slow', '응답이 늦어요', '응답이 늦어요');
  return [300, 302, o];
};

// ── firewalls-and-nat ──

// DROP과 REJECT
figs['fw-drop-reject'] = () => {
  const o = [];
  const lanes = (px) => [{ x: px + 26, label: '앱' }, { x: px + 118, label: '방화벽' }];
  twoLadders(o, [
    {
      title: 'DROP(버림)',
      msgs: [
        { from: 0, to: 1, y: 84, label: 'SYN', lost: 0.86 },
        { from: 0, to: 1, y: 160, label: '다시 SYN', lost: 0.86 },
      ],
      extra: [(px) => line(px + 26, 96, px + 26, 148, { tone: 'warn', sw: 3, dash: '2 4' }), (px) => text(px + 36, 126, '답 없이 기다림', { size: 13, weight: 600, tone: 'warn', halo: 'card' })],
      foot: ['연결 시간 초과', '정한 시간만큼 기다려요'],
      footY: 214,
      footTone: 'warn',
    },
    {
      title: 'REJECT(거부)',
      msgs: [
        { from: 0, to: 1, y: 84, label: 'SYN' },
        { from: 1, to: 0, y: 112, label: '거부 응답', tone: 'warn', dashed: true },
      ],
      foot: ['연결 거부, 도달 불가', '바로 실패해요'],
      footY: 214,
      footTone: 'warn',
    },
  ], lanes, 250);
  return [300, 250, o];
};

// 나간 연결의 답은 연결 표와 맞아 들어와요. 밖에서 먼저 온 연결은 막아요
figs['fw-stateful'] = () => {
  const o = [];
  o.push(g.server(30, 24));
  o.push(g.firewall(150, 24, { tone: 'accent' }));
  o.push(g.cloud(268, 26, { scale: 0.75 }));
  o.push(label(30, 58, '서버'));
  o.push(text(150, 58, '방화벽', { size: 13, weight: 700, tone: 'accent', anchor: 'middle' }));
  o.push(label(268, 58, '외부 API'));
  o.push(ladder([{ x: 30, label: '' }, { x: 150, label: '' }, { x: 268, label: '' }], [
    { from: 0, to: 2, y: 96, label: '요청', tone: 'accent', dx: -50 },
    { from: 2, to: 0, y: 136, label: '응답', tone: 'accent', dashed: true, dx: -50 },
    { from: 2, to: 0, y: 176, label: '밖에서 먼저', tone: 'warn', lost: 0.44 },
  ], { top: 66, bottom: 190 }));
  o.push(tag(208, 82, '① 표에 적어요', { tone: 'soft' }));
  o.push(tag(208, 122, '② 표와 맞아 통과', { tone: 'soft' }));
  o.push(tag(98, 162, '③ 규칙이 없으면 막아요', { tone: 'warnSoft' }));
  o.push(text(8, 214, '방화벽의 연결 표', { size: 13, weight: 700, tone: 'sub' }));
  const t = table(4, 222, [{ t: '안쪽', w: 104 }, { t: '바깥', w: 120 }, { t: '상태', w: 68, align: 'center' }], [['서버:51234', '외부 API:443', '열림']], { hl: [0] });
  o.push(t.svg);
  return [300, 272, o];
};

// NAT: 안쪽 서버 둘이 바깥 주소 하나를 포트로 나눠 써요
figs['fw-nat'] = () => {
  const o = [];
  o.push(zone(4, 4, 96, 150, '안쪽', { fill: 'card', dash: null }));
  o.push(g.server(52, 48));
  o.push(g.server(52, 112));
  o.push(text(52, 80, '10.0.0.5', { size: 13, weight: 600, anchor: 'middle', mono: true, halo: 'card' }));
  o.push(text(52, 144, '10.0.0.6', { size: 13, weight: 600, anchor: 'middle', mono: true, halo: 'card' }));
  o.push(arrow([[68, 48], [128, 78]], { tone: 'accent', sw: 2.4, size: 7 }));
  o.push(arrow([[68, 112], [128, 88]], { tone: 'sub', sw: 2.2, size: 7 }));
  o.push(g.router(150, 82, { tone: 'accent' }));
  o.push(text(150, 116, 'NAT', { size: 13, weight: 700, tone: 'accent', anchor: 'middle' }));
  o.push(text(150, 134, '203.0.113.7', { size: 13, weight: 600, tone: 'accent', anchor: 'middle', mono: true }));
  o.push(arrow([[174, 82], [244, 82]], { tone: 'accent', sw: 2.4, size: 7 }));
  o.push(g.server(266, 82));
  o.push(text(266, 116, '바깥 서버', { size: 13, weight: 600, tone: 'text', anchor: 'middle' }));
  o.push(text(258, 136, '둘 다 같은', { size: 13, tone: 'sub', anchor: 'middle' }));
  o.push(text(258, 154, '주소로 보여요', { size: 13, tone: 'sub', anchor: 'middle' }));
  o.push(text(8, 182, 'NAT 장비의 변환 표', { size: 13, weight: 700, tone: 'sub' }));
  const t = table(4, 190, [{ t: '안쪽 주소:포트', w: 138 }, { t: '바깥에 보이는 주소:포트', w: 154 }], [
    ['10.0.0.5:51234', '203.0.113.7:40001'],
    ['10.0.0.6:51234', '203.0.113.7:40002'],
  ], { hl: [0], mono: true });
  o.push(t.svg);
  return [300, 264, o];
};

// ── ping-and-latency ──

// 에코 요청 넷, 응답 셋
figs['ping-echo'] = () => {
  const o = [];
  o.push(g.server(60, 22));
  o.push(g.router(240, 24));
  o.push(label(60, 56, '관리 서버', 'text', 700));
  o.push(label(240, 56, '장비', 'text', 700));
  o.push(ladder([{ x: 60, label: '' }, { x: 240, label: '' }], [
    { from: 0, to: 1, y: 86, label: '에코 요청 1' },
    { from: 1, to: 0, y: 108, label: '12ms', dashed: true, tone: 'accent' },
    { from: 0, to: 1, y: 138, label: '에코 요청 2' },
    { from: 1, to: 0, y: 160, label: '14ms', dashed: true, tone: 'accent' },
    { from: 0, to: 1, y: 190, label: '에코 요청 3', tone: 'warn', lost: 0.55 },
    { from: 0, to: 1, y: 226, label: '에코 요청 4' },
    { from: 1, to: 0, y: 248, label: '40ms', dashed: true, tone: 'accent' },
  ], { top: 62, bottom: 258 }));
  o.push(text(196, 195, '사라짐', { size: 13, weight: 700, tone: 'warn' }));
  o.push(text(150, 284, '4개 보내 3개 돌아옴 → 손실률 25%', { size: 13, weight: 700, tone: 'text', anchor: 'middle' }));
  return [300, 292, o];
};

// 평균이 같아도 흔들림이 달라요
figs['ping-jitter'] = () => {
  const o = [];
  const X0 = 20;
  const X1 = 280;
  const xs = (ms) => X0 + ((X1 - X0) * ms) / 45;
  const row = (y, title, vals, sum, tone) => {
    o.push(text(4, y - 28, title, { size: 13, weight: 700 }));
    o.push(line(X0, y, X1, y, { tone: 'line', sw: 2 }));
    o.push(line(xs(22), y - 16, xs(22), y + 12, { tone: 'sub', sw: 1.5, dash: '3 3' }));
    vals.forEach((v, i) => o.push(g.circle(xs(v), y - (vals.filter((w, j) => j < i && w === v).length * 10), 6, { fill: tone, stroke: 'card', sw: 1.5 })));
    o.push(text(xs(22), y + 28, '평균 22', { size: 13, weight: 600, tone: 'sub', anchor: 'middle' }));
    o.push(text(296, y - 28, sum, { size: 13, weight: 700, tone: tone === 'warn' ? 'warn' : 'accent', anchor: 'end' }));
  };
  row(62, '고른 경우(예시)', [22, 22, 22], '최대 22 · mdev 0', 'accent');
  row(152, '들쭉날쭉한 경우', [12, 14, 40], '최대 40 · mdev 큼', 'warn');
  o.push(text(xs(13), 176, '12, 14', { size: 13, tone: 'sub', anchor: 'middle' }));
  o.push(text(xs(40), 176, '40ms', { size: 13, tone: 'warn', anchor: 'middle', weight: 600 }));
  [0, 10, 20, 30, 40].forEach((ms) => o.push(text(xs(ms), 214, `${ms}`, { size: 13, tone: 'weak', anchor: 'middle' })));
  o.push(line(X0, 198, X1, 198, { tone: 'line', sw: 1 }));
  o.push(text(X1, 232, '왕복 시간(ms)', { size: 13, tone: 'sub', anchor: 'end' }));
  return [300, 240, o];
};


// ── tls-certificates ──

// 인증서 모양(접힌 모서리 + 도장)
const cert = (x, y, w, h, title, o = []) => {
  const parts = [
    g.path(`M${x} ${y + 6} Q${x} ${y} ${x + 6} ${y} H${x + w - 14} L${x + w} ${y + 14} V${y + h - 6} Q${x + w} ${y + h} ${x + w - 6} ${y + h} H${x + 6} Q${x} ${y + h} ${x} ${y + h - 6} z`, { fill: 'card', stroke: o.tone === 'accent' ? 'accent' : 'sub', sw: 1.8 }),
    g.path(`M${x + w - 14} ${y} V${y + 14} H${x + w}`, { stroke: o.tone === 'accent' ? 'accent' : 'sub', sw: 1.4 }),
  ];
  if (title) parts.push(text(x + 12, y + 22, title, { size: 14, weight: 700, tone: o.tone === 'accent' ? 'accent' : 'text' }));
  return parts.join('\n');
};
const seal = (cx, cy, tone = 'accent') => [g.circle(cx, cy, 9, { fill: tone === 'accent' ? 'accentWeak' : 'line', stroke: tone, sw: 1.8 }), g.path(`M${cx - 5} ${cy + 7} L${cx - 7} ${cy + 16} L${cx - 2} ${cy + 13} L${cx + 2} ${cy + 16} L${cx + 5} ${cy + 7}`, { stroke: tone, sw: 1.5 })].join('\n');

// 인증서에서 보는 세 가지와 견주는 것
figs['tls-checks'] = () => {
  const o = [];
  o.push(cert(4, 4, 168, 196, '서버 인증서'));
  const field = (y, name, val, mono = true) => {
    o.push(text(16, y, name, { size: 13, weight: 600, tone: 'sub' }));
    o.push(rect(14, y + 8, 146, 28, { rx: 6, fill: 'accentWeak', stroke: 'none' }));
    o.push(text(22, y + 27, val, { size: 13, weight: 700, tone: 'accent', mono }));
  };
  field(50, '이름(SAN)', 'api.example.com');
  field(104, '기간', '08.07 ~ 11.05');
  field(158, '서명', '중간 CA가 서명', false);
  o.push(seal(146, 30));
  const cmp = (y, l1, l2) => {
    o.push(arrow([[164, y], [186, y]], { tone: 'weak', sw: 2, start: true, size: 6 }));
    o.push(g.check(198, y, { r: 6 }));
    o.push(text(212, y - 2, l1, { size: 13, weight: 700 }));
    o.push(text(212, y + 16, l2, { size: 13, tone: 'sub' }));
  };
  cmp(72, '접속한 주소', '같아야 해요');
  cmp(126, '지금 시각', '사이여야 해요');
  cmp(180, '믿는 CA', '까지 이어져야');
  o.push(tag(8, 226, '셋 다 맞으면 → HTTP 요청', { tone: 'accent', anchor: 'start' }));
  o.push(tag(8, 256, '하나라도 어긋나면 → 연결 에러', { tone: 'warn', anchor: 'start' }));
  return [300, 270, o];
};

// 인증서 체인: 루트 → 중간 → 서버, 서버는 중간과 서버 인증서를 보내요
figs['tls-chain'] = () => {
  const o = [];
  const card = (y, t, tone) => {
    o.push(cert(20, y, 150, 50, '', { tone }));
    o.push(seal(44, y + 21, tone === 'accent' ? 'accent' : 'sub'));
    o.push(text(62, y + 30, t, { size: 14, weight: 700, tone: tone === 'accent' ? 'accent' : 'text' }));
  };
  card(10, '루트 인증서');
  card(110, '중간 인증서', 'accent');
  card(210, '서버 인증서', 'accent');
  o.push(arrow([[95, 62], [95, 106]], { tone: 'sub', sw: 2.2, size: 8 }));
  o.push(arrow([[95, 162], [95, 206]], { tone: 'sub', sw: 2.2, size: 8 }));
  o.push(text(106, 89, '서명', { size: 13, weight: 600, tone: 'sub' }));
  o.push(text(106, 189, '서명', { size: 13, weight: 600, tone: 'sub' }));
  o.push(g.path('M184 12 h6 V58 h-6', { stroke: 'sub', sw: 1.6 }));
  o.push(text(198, 31, '클라이언트에', { size: 13, weight: 600, tone: 'sub' }));
  o.push(text(198, 49, '이미 있어요', { size: 13, weight: 600, tone: 'sub' }));
  o.push(g.path('M184 112 h6 V258 h-6', { stroke: 'accent', sw: 1.6 }));
  o.push(text(198, 180, '서버가', { size: 13, weight: 700, tone: 'accent' }));
  o.push(text(198, 198, '함께 보내요', { size: 13, weight: 700, tone: 'accent' }));
  return [300, 266, o];
};

// ── telemetry ──

// SNMP 폴링은 묻고 답하기, gNMI 스트리밍은 구독하면 장비가 보내요
figs['tel-pull-push'] = () => {
  const o = [];
  const lanes = (px) => [{ x: px + 30, label: '관리 서버' }, { x: px + 114, label: '장비' }];
  twoLadders(o, [
    {
      title: 'SNMP 폴링',
      msgs: [
        { from: 0, to: 1, y: 82, label: 'GET', tone: 'sub' },
        { from: 1, to: 0, y: 102, label: '', dashed: true, tone: 'accent' },
        { from: 0, to: 1, y: 136, label: 'GET', tone: 'sub' },
        { from: 1, to: 0, y: 156, label: '', dashed: true, tone: 'accent' },
        { from: 0, to: 1, y: 190, label: 'GET', tone: 'sub' },
        { from: 1, to: 0, y: 210, label: '', dashed: true, tone: 'accent' },
      ],
      foot: ['주기마다 물어요', 'UDP · OID(숫자)'],
      footY: 246,
      footTone: 'text',
      bottom: 218,
    },
    {
      title: 'gNMI 스트리밍',
      msgs: [
        { from: 0, to: 1, y: 82, label: '구독', tone: 'sub' },
        { from: 1, to: 0, y: 110, label: '', dashed: true, tone: 'accent' },
        { from: 1, to: 0, y: 134, label: '', dashed: true, tone: 'accent' },
        { from: 1, to: 0, y: 158, label: '', dashed: true, tone: 'accent' },
        { from: 1, to: 0, y: 182, label: '', dashed: true, tone: 'accent' },
        { from: 1, to: 0, y: 206, label: '', dashed: true, tone: 'accent' },
      ],
      under: [(px) => rect(px + 32, 92, 80, 126, { rx: 6, fill: 'accentWeak', stroke: 'none' })],
      foot: ['장비가 계속 보내요', 'gRPC · YANG 경로'],
      footY: 246,
      footTone: 'text',
      bottom: 218,
    },
  ], lanes, 276);
  return [300, 276, o];
};

// ── network-performance ──

// ss -ti는 연결 하나하나, /proc/net/snmp는 서버 전체
figs['npm-scope'] = () => {
  const o = [];
  o.push(zone(4, 30, 116, 190, '주문 서버', { fill: 'card', dash: null, labelTone: 'text' }));
  o.push(rect(14, 140, 96, 66, { rx: 8, fill: 'line', stroke: 'none' }));
  o.push(text(62, 162, '서버 전체', { size: 13, weight: 700, tone: 'text', anchor: 'middle' }));
  o.push(text(62, 180, '다시 보냄 1,230', { size: 13, tone: 'sub', anchor: 'middle' }));
  o.push(text(62, 198, '새로 보냄 51,000', { size: 13, tone: 'sub', anchor: 'middle' }));
  const peers = [[58, '결제 서버', 'RTT 38ms', 'warnSoft'], [122, '재고 서버', 'RTT 2ms', 'soft'], [186, 'DB', 'RTT 1ms', 'soft']];
  peers.forEach(([y, name, rtt, tone]) => {
    o.push(line(120, y, 248, y, { tone: 'weak', sw: 2.5 }));
    o.push(tag(184, y, rtt, { tone }));
    o.push(g.server(270, y));
    o.push(text(270, y + 30, name, { size: 13, weight: 600, anchor: 'middle', halo: 'bg' }).replace('', ''));
  });
  o.push(text(184, 22, 'ss -ti', { size: 13, weight: 700, tone: 'accent', anchor: 'middle', mono: true }));
  o.push(text(184, 40, '연결 하나하나', { size: 13, weight: 600, tone: 'accent', anchor: 'middle' }));
  o.push(text(62, 242, '/proc/net/snmp', { size: 13, weight: 700, tone: 'text', anchor: 'middle', mono: true }));
  o.push(text(62, 260, '서버 전체 합계', { size: 13, weight: 600, tone: 'sub', anchor: 'middle' }));
  return [300, 268, o];
};

// 재전송 비율: 늘어난 수끼리 나눠요
figs['npm-ratio'] = () => {
  const o = [];
  const t = table(4, 4, [{ t: '', w: 104 }, { t: '0분', w: 62, align: 'right' }, { t: '1분', w: 62, align: 'right' }, { t: '늘어난 수', w: 64, align: 'right' }], [
    ['RetransSegs', '1,200', '1,230', '+30'],
    ['OutSegs', '50,000', '51,000', '+1,000'],
  ], { rowH: 28 });
  o.push(t.svg);
  o.push(rect(232, 32, 64, 56, { rx: 0, fill: 'none', stroke: 'accent', sw: 2 }));
  o.push(text(8, 106, 'RetransSegs = 다시 보낸 조각', { size: 13, tone: 'sub' }));
  o.push(text(8, 124, 'OutSegs = 새로 보낸 조각', { size: 13, tone: 'sub' }));
  o.push(rect(30, 140, 240, 44, { rx: 10, fill: 'accentWeak', stroke: 'none' }));
  o.push(text(150, 169, '30 ÷ 1,000 = 3%', { size: 18, weight: 700, tone: 'accent', anchor: 'middle' }));
  o.push(text(150, 206, '읽은 값끼리가 아니라 늘어난 수끼리 나눠요', { size: 13, tone: 'sub', anchor: 'middle' }));
  return [300, 214, o];
};

// eBPF: 커널의 TCP 처리 지점에 붙어 연결마다 기록하고, 에이전트가 모아 보내요
figs['npm-ebpf'] = () => {
  const o = [];
  o.push(zone(4, 4, 212, 206, '서버', { fill: 'card', dash: null, labelTone: 'text' }));
  o.push(line(4, 110, 216, 110, { tone: 'line', sw: 1.5, dash: '5 4' }));
  o.push(text(206, 30, '사용자 공간', { size: 13, tone: 'sub', anchor: 'end' }));
  o.push(text(206, 130, '커널', { size: 13, tone: 'sub', anchor: 'end' }));
  o.push(g.app(60, 70, '앱 프로세스', { w: 88 }));
  o.push(g.app(160, 70, 'NPM 에이전트', { w: 92, tone: 'accent' }));
  o.push(g.app(60, 168, 'TCP 처리', { w: 88 }));
  o.push(arrow([[60, 82], [60, 156]], { tone: 'weak', sw: 2.2, size: 7 }));
  o.push(text(52, 124, '통신', { size: 13, tone: 'sub', anchor: 'end' }));
  o.push(tag(126, 168, 'eBPF', { tone: 'accent' }));
  o.push(line(104, 168, 108, 168, { tone: 'accent', sw: 2 }));
  o.push(arrow([[150, 160], [160, 82]], { tone: 'accent', sw: 2.2, size: 7, dash: '4 3' }));
  o.push(text(146, 124, '연결마다', { size: 13, weight: 600, tone: 'accent', anchor: 'end' }));
  o.push(text(146, 142, '기록', { size: 13, weight: 600, tone: 'accent', anchor: 'end' }));
  o.push(arrow([[206, 70], [252, 70]], { tone: 'accent', sw: 2.2, size: 7 }));
  o.push(g.server(272, 70));
  o.push(text(272, 104, '모니터링', { size: 13, weight: 600, anchor: 'middle' }));
  o.push(text(272, 122, '서버', { size: 13, weight: 600, anchor: 'middle' }));
  o.push(text(110, 232, '앱 코드는 고치지 않아요', { size: 13, weight: 600, tone: 'sub', anchor: 'middle' }));
  return [300, 240, o];
};

// ── device-unreachable ──

// SNMP 질문이 가는 길과 막힐 수 있는 곳
figs['du-snmp-path'] = () => {
  const o = [];
  o.push(arrow([[52, 44], [124, 44]], { tone: 'accent', sw: 2.4, size: 8 }));
  o.push(arrow([[176, 44], [222, 44]], { tone: 'accent', sw: 2.4, size: 8 }));
  o.push(g.server(30, 44));
  o.push(g.firewall(150, 44));
  o.push(g.sw(254, 44, { tone: 'accent' }));
  o.push(label(30, 80, '관리 서버', 'text', 700));
  o.push(label(150, 80, '중간 방화벽', 'text', 700));
  o.push(text(257, 80, '장비', { size: 13, weight: 700, tone: 'accent', anchor: 'middle' }));
  o.push(text(30, 98, 'snmpget', { size: 13, tone: 'sub', anchor: 'middle', mono: true }));
  o.push(text(257, 98, 'SNMP 에이전트', { size: 13, tone: 'sub', anchor: 'middle' }));
  o.push(text(88, 34, '질문', { size: 13, weight: 600, tone: 'accent', anchor: 'middle' }));
  o.push(line(150, 110, 150, 122, { tone: 'warn', sw: 1.6 }));
  o.push(tag(150, 136, 'UDP 161 열려 있나?', { tone: 'warnSoft' }));
  o.push(line(257, 110, 257, 154, { tone: 'warn', sw: 1.6 }));
  o.push(tag(240, 168, '계정·ACL 맞나?', { tone: 'warnSoft' }));
  return [300, 184, o];
};

// ── errors-and-discards ──

// 받은 에러, 받고 버림, 보낼 때 버림이 오르는 자리
figs['err-where'] = () => {
  const o = [];
  const Y = 70;
  const bucket = (cx, level) => {
    o.push(rect(cx - 20, Y - 22 + 44 * (1 - level), 40, 44 * level, { rx: 2, fill: 'accentWeak', stroke: 'none' }));
    o.push(g.path(`M${cx - 22} ${Y - 26} V${Y + 22} H${cx + 22} V${Y - 26}`, { stroke: 'sub', sw: 2.2 }));
  };
  o.push(arrow([[6, Y], [126, Y]], { tone: 'accent', sw: 2.6, size: 8 }));
  o.push(arrow([[174, Y], [226, Y]], { tone: 'accent', sw: 2.6, size: 8 }));
  o.push(arrow([[274, Y], [296, Y]], { tone: 'accent', sw: 2.6, size: 8 }));
  bucket(150, 1);
  bucket(250, 1);
  // 깨진 프레임
  o.push(g.path(`M${48} ${Y - 8} h14 l4 6 l-4 4 l4 6 h-18 z`, { fill: 'warnWeak', stroke: 'warn', sw: 1.6 }));
  // 넘침 표시
  for (const cx of [150, 250]) {
    o.push(rect(cx + 18, Y - 34, 10, 10, { rx: 2, fill: 'warn', stroke: 'none' }));
  }
  o.push(label(52, 30, '케이블·광', 'text', 700));
  o.push(label(150, 30, '받는 버퍼', 'text', 700));
  o.push(label(250, 30, '보내는 큐', 'text', 700));
  // 아래로 떨어지는 화살표와 카운터
  const drop = (x, y0, t1, t2, why) => {
    o.push(arrow([[x, y0], [x, 136]], { tone: 'warn', sw: 2, size: 7, dash: '4 3' }));
    o.push(text(x + 8, 116, why, { size: 13, weight: 600, tone: 'warn' }));
    o.push(text(x, 158, t1, { size: 13, weight: 700, tone: 'warn', anchor: 'middle' }));
    o.push(text(x, 176, t2, { size: 13, tone: 'sub', anchor: 'middle' }));
  };
  drop(56, Y + 14, '받은 에러', 'ifInErrors', '깨짐');
  drop(150, Y + 26, '받고 버림', 'ifInDiscards', '넘침');
  drop(250, Y + 26, '보낼 때 버림', 'ifOutDiscards', '넘침');

  return [300, 182, o];
};

// 이중 통신 불일치: half 쪽은 받으면 멈추고, 잘린 프레임이 full 쪽에 에러로 남아요
figs['err-duplex'] = () => {
  const o = [];
  const L = 78;
  o.push(text(4, 46, '스위치', { size: 13, weight: 700 }));
  o.push(tag(4, 64, 'half', { tone: 'sub', anchor: 'start' }));
  o.push(text(4, 146, '서버', { size: 13, weight: 700 }));
  o.push(tag(4, 164, 'full', { tone: 'sub', anchor: 'start' }));
  o.push(line(L, 52, 292, 52, { tone: 'line', sw: 1.5 }));
  o.push(line(L, 152, 292, 152, { tone: 'line', sw: 1.5 }));
  // 스위치가 보내다 멈춤
  o.push(rect(84, 40, 100, 24, { rx: 4, fill: 'accent', stroke: 'none' }));
  o.push(text(134, 57, '보내는 중', { size: 13, weight: 700, tone: 'card', anchor: 'middle' }));
  o.push(rect(184, 40, 100, 24, { rx: 4, fill: 'none', stroke: 'weak', dash: '4 3' }));
  o.push(g.path('M184 38 l5 7 l-6 6 l6 6 l-5 9', { stroke: 'warn', sw: 2.2 }));
  o.push(text(234, 57, '멈춤', { size: 13, weight: 600, tone: 'weak', anchor: 'middle' }));
  // 서버는 그냥 보내요
  o.push(rect(150, 140, 134, 24, { rx: 4, fill: 'sub', stroke: 'none' }));
  o.push(text(217, 157, '그냥 보내요', { size: 13, weight: 700, tone: 'card', anchor: 'middle' }));
  o.push(arrow([[160, 138], [176, 68]], { tone: 'sub', sw: 2, size: 7 }));
  o.push(text(184, 104, '받는 중에 보냄', { size: 13, tone: 'sub' }));
  // 결과
  o.push(arrow([[120, 66], [104, 138]], { tone: 'warn', sw: 2, size: 7, dash: '4 3' }));
  o.push(text(104, 104, '잘린 프레임', { size: 13, weight: 600, tone: 'warn', anchor: 'end' }));
  o.push(tag(184, 18, '늦은 충돌 +1', { tone: 'warnSoft' }));
  o.push(tag(110, 188, '받은 에러(FCS) +1', { tone: 'warnSoft' }));
  return [300, 202, o];
};

// ── latency-and-loss ──

const hops = [
  ['지점', '라우터', (x, y) => g.router(x, y)],
  ['지점', '방화벽', (x, y) => g.firewall(x, y)],
  ['통신사', '구간', (x, y) => g.cloud(x, y, { scale: 0.7 })],
  ['본사', '라우터', (x, y) => g.router(x, y)],
  ['본사', '서버', (x, y) => g.server(x, y)],
];
const HX = [30, 90, 150, 210, 270];

/// traceroute 구간별 왕복 시간: 3번째부터 크게 늘어 끝까지 이어져요
figs['lat-hops'] = () => {
  const o = [];
  const Y = 50;
  for (let i = 0; i < 4; i++) {
    const bad = i === 1;
    o.push(line(HX[i] + 14, Y, HX[i + 1] - 14, Y, { tone: bad ? 'warn' : 'line', sw: bad ? 4 : 3 }));
  }
  o.push(tag(120, 22, '+83ms', { tone: 'warn' }));
  hops.forEach(([a, b], i) => {
    const bad = i >= 2;
    o.push(g.circle(HX[i], Y, 13, { fill: bad ? 'warnWeak' : 'card', stroke: bad ? 'warn' : 'weak', sw: 2 }));
    o.push(text(HX[i], Y + 5, String(i + 1), { size: 13, weight: 700, tone: bad ? 'warn' : 'sub', anchor: 'middle' }));
    o.push(text(HX[i], 88, a, { size: 13, weight: 600, anchor: 'middle' }));
    o.push(text(HX[i], 106, b, { size: 13, weight: 600, anchor: 'middle' }));
  });
  [1, 2, 85, 87, 90].forEach((ms, i) => o.push(text(HX[i], 134, `${ms}ms`, { size: 14, weight: 700, tone: ms > 50 ? 'warn' : 'accent', anchor: 'middle' })));
  o.push(text(150, 162, '숫자는 출발점에서 그 구간까지의 왕복 시간', { size: 13, tone: 'sub', anchor: 'middle' }));
  return [300, 170, o];
};


// 구간별 손실: 끝까지 이어지면 진짜, 하나만 나쁘면 그 장비가 답을 아껴요
figs['lat-loss'] = () => {
  const o = [];
  const row = (y0, title, vals, range, rangeLabel) => {
    o.push(rect(4, y0, 292, 108, { rx: 12, fill: 'card', stroke: 'none' }));
    o.push(text(16, y0 + 22, title, { size: 14, weight: 700 }));
    const y = y0 + 52;
    o.push(line(HX[0], y, HX[4], y, { tone: 'line', sw: 3 }));
    vals.forEach((v, i) => {
      const bad = v !== '0%';
      o.push(g.circle(HX[i], y, 13, { fill: bad ? 'warnWeak' : 'card', stroke: bad ? 'warn' : 'weak', sw: 2 }));
      o.push(text(HX[i], y + 5, String(i + 1), { size: 13, weight: 700, tone: bad ? 'warn' : 'sub', anchor: 'middle' }));
      o.push(text(HX[i], y + 34, v, { size: 13, weight: 700, tone: bad ? 'warn' : 'sub', anchor: 'middle' }));
    });
    const [a, b] = range;
    o.push(g.path(`M${HX[a] - 16} ${y - 20} v-5 H${HX[b] + 16} v5`, { stroke: 'warn', sw: 1.6 }));
    o.push(text(296 - 12, y0 + 22, rangeLabel, { size: 13, weight: 700, tone: 'warn', anchor: 'end' }));
  };
  row(4, '진짜 손실', ['0%', '0%', '3%', '3%', '3%'], [2, 4], '끝까지 이어져요');
  row(120, '답을 아끼는 장비', ['0%', '0%', '40%', '0%', '0%'], [2, 2], '여기만');
  return [300, 232, o];
};


const only = process.argv.slice(2);
for (const [name, fn] of Object.entries(figs)) {
  if (only.length && !only.some((p) => name.startsWith(p))) continue;
  const [w, h, body] = fn();
  g.save(D, name, w, h, body);
}
console.log('done');
