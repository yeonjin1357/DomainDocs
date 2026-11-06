// 글 전용 SVG 그림을 만드는 도구. 장비 아이콘, 패킷, 표, 화살표, 영역을 그린다.
// 색은 모두 var(--color-…)라서 밝은·어두운 화면을 따라간다. 글자는 13px 이상이다.
// 그림 파일은 영역별 스크립트(network.mjs 등)가 이 도구로 그려 src/assets/figures/{영역}/에 쓴다.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');

const TONE = {
  text: 'var(--color-text)',
  sub: 'var(--color-text-sub)',
  weak: 'var(--color-text-weak)',
  line: 'var(--color-line)',
  card: 'var(--color-card)',
  bg: 'var(--color-bg)',
  accent: 'var(--color-accent)',
  accentWeak: 'var(--color-accent-weak)',
  warn: 'var(--color-warn)',
  warnWeak: 'var(--color-warn-weak)',
};
export const color = (name) => TONE[name] ?? name;

const r1 = (n) => Math.round(n * 10) / 10;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** 글자 폭 어림값(px). 한글은 1em 가까이, 숫자·영문은 절반 남짓이다. */
export function textWidth(str, size = 14, weight = 400) {
  let w = 0;
  for (const ch of String(str)) {
    if (/[가-힣ㄱ-ㅎㅏ-ㅣ]/.test(ch)) w += 0.94;
    else if (/[A-Z]/.test(ch)) w += 0.66;
    else if (/[a-z0-9]/.test(ch)) w += 0.57;
    else if (ch === ' ') w += 0.27;
    else if (/[.,:;'|!]/.test(ch)) w += 0.28;
    else if (/[()\[\]/\-]/.test(ch)) w += 0.36;
    else if (/[→←↔×·…]/.test(ch)) w += 0.8;
    else w += 0.62;
  }
  return w * size * (weight >= 600 ? 1.04 : 1);
}

/** 글자. anchor는 start·middle·end, halo는 선 위에 글자를 올릴 때 바탕색 테두리를 둘러 읽히게 한다. */
export function text(x, y, str, o = {}) {
  const { size = 14, weight, tone = 'text', anchor = 'start', halo = false, mono = false } = o;
  const attrs = [`x="${r1(x)}"`, `y="${r1(y)}"`, `font-size="${size}"`];
  if (anchor !== 'start') attrs.push(`text-anchor="${anchor}"`);
  if (weight) attrs.push(`font-weight="${weight}"`);
  if (mono) attrs.push(`font-family="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"`);
  // fit: 글꼴과 상관없이 정확히 이 폭으로 그린다(괄호·칸을 글자에 맞출 때).
  if (o.fit) attrs.push(`textLength="${r1(o.fit)}" lengthAdjust="spacingAndGlyphs"`);
  let style = `fill:${color(tone)}`;
  if (halo) style += `;stroke:${color(halo === true ? 'bg' : halo)};stroke-width:4;stroke-linejoin:round;paint-order:stroke`;
  return `<text ${attrs.join(' ')} style="${style}">${esc(str)}</text>`;
}

/** 여러 줄 글자. lines는 위에서부터, gap은 줄 간격이다. */
export function lines(x, y, list, o = {}) {
  const gap = o.gap ?? (o.size ?? 14) + 5;
  return list.map((s, i) => text(x, y + i * gap, s, o)).join('\n');
}

export function rect(x, y, w, h, o = {}) {
  const { rx = 6, fill = 'card', stroke = 'weak', sw = 1.5, dash } = o;
  const st = [`fill:${fill === 'none' ? 'none' : color(fill)}`];
  if (o.op != null) st.push(`fill-opacity:${o.op}`);
  if (stroke !== 'none') st.push(`stroke:${color(stroke)}`);
  return `<rect x="${r1(x)}" y="${r1(y)}" width="${r1(w)}" height="${r1(h)}" rx="${rx}"${stroke !== 'none' ? ` stroke-width="${sw}"` : ''}${dash ? ` stroke-dasharray="${dash}"` : ''} style="${st.join(';')}" />`;
}

export function line(x1, y1, x2, y2, o = {}) {
  const { tone = 'weak', sw = 2, dash, cap = 'round' } = o;
  return `<line x1="${r1(x1)}" y1="${r1(y1)}" x2="${r1(x2)}" y2="${r1(y2)}" stroke-width="${sw}" stroke-linecap="${cap}"${dash ? ` stroke-dasharray="${dash}"` : ''} style="stroke:${color(tone)}" />`;
}

export function circle(cx, cy, r, o = {}) {
  const { fill = 'card', stroke = 'none', sw = 1.5 } = o;
  const st = [`fill:${fill === 'none' ? 'none' : color(fill)}`];
  if (stroke !== 'none') st.push(`stroke:${color(stroke)}`);
  return `<circle cx="${r1(cx)}" cy="${r1(cy)}" r="${r}"${stroke !== 'none' ? ` stroke-width="${sw}"` : ''} style="${st.join(';')}" />`;
}

export function path(d, o = {}) {
  const { fill = 'none', stroke = 'weak', sw = 1.5, dash, join = 'round' } = o;
  const st = [`fill:${fill === 'none' ? 'none' : color(fill)}`];
  if (stroke !== 'none') st.push(`stroke:${color(stroke)}`);
  return `<path d="${d}"${stroke !== 'none' ? ` stroke-width="${sw}" stroke-linejoin="${join}" stroke-linecap="round"` : ''}${dash ? ` stroke-dasharray="${dash}"` : ''} style="${st.join(';')}" />`;
}

/** 화살촉 하나. (x,y)가 끝, (fx,fy)는 날아온 쪽이다. */
export function head(x, y, fx, fy, o = {}) {
  const { tone = 'weak', size = 8 } = o;
  const a = Math.atan2(y - fy, x - fx);
  const w = size * 0.62;
  const bx = x - size * Math.cos(a);
  const by = y - size * Math.sin(a);
  const p1 = [bx + w * Math.sin(a), by - w * Math.cos(a)];
  const p2 = [bx - w * Math.sin(a), by + w * Math.cos(a)];
  return `<path d="M${r1(x)} ${r1(y)} L${r1(p1[0])} ${r1(p1[1])} L${r1(p2[0])} ${r1(p2[1])} z" style="fill:${color(tone)}" />`;
}

/** 꺾인 화살표. pts는 [[x,y],…], end·start는 화살촉 여부, gap은 끝을 그만큼 덜 그린다. */
export function arrow(pts, o = {}) {
  const { tone = 'weak', sw = 2, dash, end = true, start = false, size = 8 } = o;
  const p = pts.map((q) => [...q]);
  const shorten = (a, b, by) => {
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    return [b[0] - (dx / len) * by, b[1] - (dy / len) * by];
  };
  const n = p.length;
  const tipEnd = p[n - 1];
  const tipStart = p[0];
  if (end) p[n - 1] = shorten(p[n - 2], p[n - 1], size * 0.7);
  if (start) p[0] = shorten(p[1], p[0], size * 0.7);
  const d = p.map((q, i) => `${i ? 'L' : 'M'}${r1(q[0])} ${r1(q[1])}`).join(' ');
  let out = `<path d="${d}" stroke-width="${sw}" stroke-linejoin="round" stroke-linecap="round"${dash ? ` stroke-dasharray="${dash}"` : ''} style="fill:none;stroke:${color(tone)}" />`;
  if (end) out += '\n' + head(tipEnd[0], tipEnd[1], pts[n - 2][0], pts[n - 2][1], { tone, size });
  if (start) out += '\n' + head(tipStart[0], tipStart[1], pts[1][0], pts[1][1], { tone, size });
  return out;
}

/** 둥근 이름표. (x,y)는 가운데. tone: accent(채움), soft(옅은 파랑), sub(회색 테두리), warn(빨강 채움), warnSoft. */
export function tag(x, y, str, o = {}) {
  const { tone = 'accent', size = 13, weight = 700, pad = 7, h = size + 9, anchor = 'middle' } = o;
  const w = textWidth(str, size, weight) + pad * 2;
  const left = anchor === 'middle' ? x - w / 2 : anchor === 'end' ? x - w : x;
  const style = {
    accent: { fill: 'accent', stroke: 'none', tx: 'card' },
    soft: { fill: 'accentWeak', stroke: 'none', tx: 'accent' },
    sub: { fill: 'card', stroke: 'line', tx: 'sub' },
    plain: { fill: 'card', stroke: 'weak', tx: 'text' },
    warn: { fill: 'warn', stroke: 'none', tx: 'card' },
    warnSoft: { fill: 'warnWeak', stroke: 'none', tx: 'warn' },
  }[tone];
  return (
    rect(left, y - h / 2, w, h, { rx: h / 2, fill: style.fill, stroke: style.stroke, sw: 1 }) +
    '\n' +
    text(left + w / 2, y + size * 0.36, str, { size, weight, tone: style.tx, anchor: 'middle' })
  );
}
tag.width = (str, o = {}) => textWidth(str, o.size ?? 13, o.weight ?? 700) + (o.pad ?? 7) * 2;

/** 동그라미 번호(본문 목록 번호와 맞출 때). */
export function badge(cx, cy, n, o = {}) {
  const { tone = 'accent', r = 9.5 } = o;
  return circle(cx, cy, r, { fill: tone }) + '\n' + text(cx, cy + 4.7, String(n), { size: 13, weight: 700, tone: 'card', anchor: 'middle' });
}

/** 영역(네트워크, 건물 등). 이름은 왼쪽 위 테두리 안쪽에 쓴다. */
export function zone(x, y, w, h, label, o = {}) {
  const { tone = 'line', fill = 'none', dash = '5 4', labelTone = 'sub', sw = 1.5, rx = 12, labelPos = 'top' } = o;
  let out = rect(x, y, w, h, { rx, fill, stroke: tone, sw, dash });
  if (label) {
    const ly = labelPos === 'top' ? y + 18 : y + h - 9;
    out += '\n' + text(x + 10, ly, label, { size: 13, weight: 600, tone: labelTone });
  }
  return out;
}

/** 패킷. fields는 [{ t, tone? }]이고, tone은 accent·soft·warn·sub·plain이다. 왼쪽 위 (x,y), 폭을 함께 돌려준다. */
export function packet(x, y, fields, o = {}) {
  const { h = 24, size = 13, pad = 7 } = o;
  const widths = fields.map((f) => f.w ?? textWidth(f.t, size, 600) + pad * 2);
  const total = widths.reduce((a, b) => a + b, 0);
  let cx = x;
  const parts = [];
  fields.forEach((f, i) => {
    const tone = f.tone ?? 'plain';
    const fill = { accent: 'accent', soft: 'accentWeak', warn: 'warn', warnSoft: 'warnWeak', sub: 'line', plain: 'card' }[tone];
    const tx = { accent: 'card', soft: 'accent', warn: 'card', warnSoft: 'warn', sub: 'sub', plain: 'text' }[tone];
    parts.push(rect(cx, y, widths[i], h, { rx: 0, fill, stroke: 'none' }));
    parts.push(text(cx + widths[i] / 2, y + h / 2 + size * 0.36, f.t, { size, weight: 600, tone: tx, anchor: 'middle' }));
    cx += widths[i];
  });
  for (let i = 1; i < fields.length; i++) {
    const lx = x + widths.slice(0, i).reduce((a, b) => a + b, 0);
    parts.push(line(lx, y, lx, y + h, { tone: 'weak', sw: 1, cap: 'butt' }));
  }
  parts.push(rect(x, y, total, h, { rx: 4, fill: 'none', stroke: o.stroke ?? 'sub', sw: 1.5 }));
  const svg = parts.join('\n');
  return { svg, w: total, h };
}
packet.width = (fields, o = {}) => fields.reduce((a, f) => a + (f.w ?? textWidth(f.t, o.size ?? 13, 600) + (o.pad ?? 7) * 2), 0);

/** 표. cols는 [{ t, w, align? }], rows는 글자 배열의 배열, hl은 강조할 줄 번호들. 왼쪽 위 (x,y). */
export function table(x, y, cols, rows, o = {}) {
  const { rowH = 24, headH = 24, size = 13, hl = [], hlTone = 'accent', mono = false, dim = [] } = o;
  const W = cols.reduce((a, c) => a + c.w, 0);
  const H = headH + rows.length * rowH;
  const parts = [];
  parts.push(rect(x, y, W, H, { rx: 6, fill: 'card', stroke: 'line', sw: 1.5 }));
  parts.push(`<path d="M${r1(x + 0.75)} ${r1(y + headH)} V${r1(y + 6)} Q${r1(x + 0.75)} ${r1(y + 0.75)} ${r1(x + 6)} ${r1(y + 0.75)} H${r1(x + W - 6)} Q${r1(x + W - 0.75)} ${r1(y + 0.75)} ${r1(x + W - 0.75)} ${r1(y + 6)} V${r1(y + headH)} z" style="fill:${color('line')}" />`);
  rows.forEach((_, i) => {
    if (hl.includes(i)) {
      const fill = hlTone === 'warn' ? 'warnWeak' : 'accentWeak';
      const last = i === rows.length - 1;
      if (last) {
        const yy = y + headH + i * rowH;
        parts.push(`<path d="M${r1(x + 0.75)} ${r1(yy)} H${r1(x + W - 0.75)} V${r1(yy + rowH - 6)} Q${r1(x + W - 0.75)} ${r1(yy + rowH - 0.75)} ${r1(x + W - 6)} ${r1(yy + rowH - 0.75)} H${r1(x + 6)} Q${r1(x + 0.75)} ${r1(yy + rowH - 0.75)} ${r1(x + 0.75)} ${r1(yy + rowH - 6)} z" style="fill:${color(fill)}" />`);
      } else {
        parts.push(rect(x + 0.75, y + headH + i * rowH, W - 1.5, rowH, { rx: 0, fill, stroke: 'none' }));
      }
    }
  });
  for (let i = 1; i < rows.length; i++) parts.push(line(x, y + headH + i * rowH, x + W, y + headH + i * rowH, { tone: 'line', sw: 1, cap: 'butt' }));
  const cellX = (c, left) => (c.align === 'right' ? left + c.w - 8 : c.align === 'center' ? left + c.w / 2 : left + 8);
  const anchorOf = (c) => (c.align === 'right' ? 'end' : c.align === 'center' ? 'middle' : 'start');
  let left = x;
  cols.forEach((c) => {
    parts.push(text(cellX(c, left), y + headH / 2 + size * 0.36, c.t, { size, weight: 600, tone: 'sub', anchor: anchorOf(c) }));
    left += c.w;
  });
  rows.forEach((row, i) => {
    let lx = x;
    const isHl = hl.includes(i);
    row.forEach((cell, j) => {
      const c = cols[j];
      const tone = isHl ? (hlTone === 'warn' ? 'warn' : 'accent') : dim.includes(i) ? 'weak' : 'text';
      parts.push(text(cellX(c, lx), y + headH + i * rowH + rowH / 2 + size * 0.36, cell, { size, weight: isHl ? 700 : 400, tone, anchor: anchorOf(c), mono }));
      lx += c.w;
    });
  });
  return { svg: parts.join('\n'), w: W, h: H };
}

// ── 장비 아이콘. (cx, cy)가 가운데이고, tone은 sub(기본)·accent·warn·weak이다. ──

const ink = (tone) => ({ sub: 'sub', accent: 'accent', warn: 'warn', weak: 'weak' }[tone] ?? 'sub');
const face = (tone) => ({ accent: 'accentWeak', warn: 'warnWeak' }[tone] ?? 'card');

/** 데스크톱 PC. 34×30 */
export function pc(cx, cy, o = {}) {
  const k = ink(o.tone);
  return [
    rect(cx - 17, cy - 15, 34, 22, { rx: 3, fill: face(o.tone), stroke: k, sw: 1.8 }),
    rect(cx - 13, cy - 11, 26, 14, { rx: 1.5, fill: o.tone === 'accent' ? 'card' : 'bg', stroke: 'none' }),
    line(cx, cy + 7, cx, cy + 12, { tone: k, sw: 2 }),
    line(cx - 8, cy + 13, cx + 8, cy + 13, { tone: k, sw: 2.2 }),
  ].join('\n');
}

/** 서버(세운 상자). 26×34 */
export function server(cx, cy, o = {}) {
  const k = ink(o.tone);
  return [
    rect(cx - 13, cy - 17, 26, 34, { rx: 3.5, fill: face(o.tone), stroke: k, sw: 1.8 }),
    line(cx - 7, cy - 9, cx + 7, cy - 9, { tone: k, sw: 1.6 }),
    line(cx - 7, cy - 3, cx + 7, cy - 3, { tone: k, sw: 1.6 }),
    line(cx - 7, cy + 3, cx + 7, cy + 3, { tone: k, sw: 1.6 }),
    circle(cx, cy + 10.5, 2, { fill: k }),
  ].join('\n');
}

/** 스위치(납작한 상자, 앞면에 포트 줄). 58×24. ports로 포트 수, lit로 칠할 포트 번호들을 정한다. */
export function sw(cx, cy, o = {}) {
  const k = ink(o.tone);
  const n = o.ports ?? 6;
  const parts = [
    path(`M${cx - 26} ${cy - 7} L${cx - 20} ${cy - 13} L${cx + 32} ${cy - 13} L${cx + 26} ${cy - 7} z`, { fill: o.tone === 'accent' ? 'accentWeak' : 'line', stroke: k, sw: 1.6 }),
    path(`M${cx + 26} ${cy - 7} L${cx + 32} ${cy - 13} L${cx + 32} ${cy + 5} L${cx + 26} ${cy + 11} z`, { fill: o.tone === 'accent' ? 'accentWeak' : 'line', stroke: k, sw: 1.6 }),
    rect(cx - 26, cy - 7, 52, 18, { rx: 2, fill: face(o.tone), stroke: k, sw: 1.8 }),
  ];
  const step = 44 / n;
  for (let i = 0; i < n; i++) {
    const px = cx - 22 + step * i + (step - 5) / 2;
    const lit = (o.lit ?? []).includes(i);
    parts.push(rect(px, cy, 5, 5, { rx: 1, fill: lit ? 'accent' : 'card', stroke: lit ? 'accent' : k, sw: 1.2 }));
  }
  return parts.join('\n');
}
/** 스위치 앞면 포트 i의 가운데(선을 이을 때). */
sw.port = (cx, cy, i, n = 6) => [cx - 22 + (44 / n) * i + 44 / n / 2, cy + 2.5];

/** 라우터(납작한 원통, 윗면에 엇갈린 화살표). 44×28 */
export function router(cx, cy, o = {}) {
  const k = ink(o.tone);
  const rx = 22;
  const ry = 7;
  const top = cy - 6;
  const bot = cy + 7;
  return [
    path(`M${cx - rx} ${top} V${bot} A${rx} ${ry} 0 0 0 ${cx + rx} ${bot} V${top}`, { fill: face(o.tone), stroke: k, sw: 1.8 }),
    `<ellipse cx="${cx}" cy="${top}" rx="${rx}" ry="${ry}" stroke-width="1.8" style="fill:${color(o.tone === 'accent' ? 'accentWeak' : 'line')};stroke:${color(k)}" />`,
    arrow([[cx - 10, top - 2.2], [cx + 9, top - 2.2]], { tone: k, sw: 1.6, size: 5 }),
    arrow([[cx + 10, top + 2.4], [cx - 9, top + 2.4]], { tone: k, sw: 1.6, size: 5 }),
  ].join('\n');
}

/** 방화벽(벽돌 벽). 40×28 */
export function firewall(cx, cy, o = {}) {
  const k = ink(o.tone ?? 'sub');
  const x = cx - 20;
  const y = cy - 14;
  const parts = [rect(x, y, 40, 28, { rx: 3, fill: face(o.tone), stroke: k, sw: 1.8 })];
  for (const yy of [y + 9.3, y + 18.7]) parts.push(line(x, yy, x + 40, yy, { tone: k, sw: 1.3, cap: 'butt' }));
  for (const [xx, y0] of [[x + 13, y], [x + 27, y], [x + 6.5, y + 9.3], [x + 20, y + 9.3], [x + 33.5, y + 9.3], [x + 13, y + 18.7], [x + 27, y + 18.7]]) {
    parts.push(line(xx, y0, xx, y0 + 9.3, { tone: k, sw: 1.3, cap: 'butt' }));
  }
  return parts.join('\n');
}

/** 인터넷(구름). 64×36 */
export function cloud(cx, cy, o = {}) {
  const k = ink(o.tone);
  const s = o.scale ?? 1;
  const p = (dx, dy) => `${r1(cx + dx * s)} ${r1(cy + dy * s)}`;
  return path(
    `M${p(-20, 15)} A${9 * s} ${9 * s} 0 0 1 ${p(-25, -1)} A${13 * s} ${13 * s} 0 0 1 ${p(-3, -13)} A${11 * s} ${11 * s} 0 0 1 ${p(18, -6)} A${10.5 * s} ${10.5 * s} 0 0 1 ${p(21, 15)} z`,
    { fill: face(o.tone), stroke: k, sw: 1.8 },
  );
}

/** 로드 밸런서(한 줄이 셋으로 갈라지는 상자). 44×26 */
export function lb(cx, cy, o = {}) {
  const k = ink(o.tone);
  return [
    rect(cx - 22, cy - 13, 44, 26, { rx: 4, fill: face(o.tone), stroke: k, sw: 1.8 }),
    line(cx - 14, cy, cx - 5, cy, { tone: k, sw: 1.6 }),
    arrow([[cx - 5, cy], [cx + 4, cy - 7], [cx + 14, cy - 7]], { tone: k, sw: 1.6, size: 5 }),
    arrow([[cx - 5, cy], [cx + 14, cy]], { tone: k, sw: 1.6, size: 5 }),
    arrow([[cx - 5, cy], [cx + 4, cy + 7], [cx + 14, cy + 7]], { tone: k, sw: 1.6, size: 5 }),
  ].join('\n');
}

/** 노트북. 38×24 */
export function laptop(cx, cy, o = {}) {
  const k = ink(o.tone);
  return [
    rect(cx - 13, cy - 12, 26, 17, { rx: 2, fill: face(o.tone), stroke: k, sw: 1.8 }),
    path(`M${cx - 19} ${cy + 9} L${cx - 15} ${cy + 5} L${cx + 15} ${cy + 5} L${cx + 19} ${cy + 9} z`, { fill: face(o.tone), stroke: k, sw: 1.6 }),
  ].join('\n');
}

/** 스마트폰. 16×28 */
export function phone(cx, cy, o = {}) {
  const k = ink(o.tone);
  return [rect(cx - 8, cy - 14, 16, 28, { rx: 3, fill: face(o.tone), stroke: k, sw: 1.8 }), line(cx - 3, cy + 10, cx + 3, cy + 10, { tone: k, sw: 1.5 })].join('\n');
}

/** 프로그램(앱) 상자. 이름을 안에 쓴다. */
export function app(cx, cy, label, o = {}) {
  const { w = textWidth(label, 13, 600) + 16, h = 24, tone } = o;
  return rect(cx - w / 2, cy - h / 2, w, h, { rx: 5, fill: face(tone), stroke: ink(tone), sw: 1.5 }) + '\n' + text(cx, cy + 4.7, label, { size: 13, weight: 600, tone: tone === 'accent' ? 'accent' : 'text', anchor: 'middle' });
}

/** DB(원통). 34×36 */
export function db(cx, cy, o = {}) {
  const k = ink(o.tone);
  const rx = o.rx ?? 17;
  const ry = 5.5;
  const top = cy - 13;
  const bot = cy + 13;
  return [
    path(`M${cx - rx} ${top} V${bot} A${rx} ${ry} 0 0 0 ${cx + rx} ${bot} V${top}`, { fill: face(o.tone), stroke: k, sw: 1.8 }),
    path(`M${cx - rx} ${cy} A${rx} ${ry} 0 0 0 ${cx + rx} ${cy}`, { stroke: k, sw: 1.4 }),
    `<ellipse cx="${cx}" cy="${top}" rx="${rx}" ry="${ry}" stroke-width="1.8" style="fill:${color(o.tone === 'accent' ? 'accentWeak' : o.tone === 'warn' ? 'warnWeak' : 'line')};stroke:${color(k)}" />`,
  ].join('\n');
}

/** 대시보드 화면(작은 선 그래프가 든 창). w×h, 기본 52×38 */
export function panel(cx, cy, o = {}) {
  const k = ink(o.tone);
  const w = o.w ?? 52;
  const h = o.h ?? 38;
  const x = cx - w / 2;
  const y = cy - h / 2;
  const pts = o.points === null ? [0, 0] : o.points ?? [0.3, 0.45, 0.35, 0.6, 0.5, 0.75, 0.55];
  const d = pts.map((v, i) => `${i ? 'L' : 'M'}${r1(x + 6 + ((w - 12) * i) / (pts.length - 1))} ${r1(y + h - 6 - (h - 18) * v)}`).join(' ');
  return [
    rect(x, y, w, h, { rx: 4, fill: face(o.tone), stroke: k, sw: 1.8 }),
    line(x, y + 8, x + w, y + 8, { tone: k, sw: 1.2, cap: 'butt' }),
    circle(x + 5, y + 4, 1.4, { fill: k }),
    circle(x + 9, y + 4, 1.4, { fill: k }),
    o.points === null ? '' : path(d, { stroke: o.line ?? 'accent', sw: 1.8 }),
  ].join('\n');
}

/** 종(알림). 26×28 */
export function bell(cx, cy, o = {}) {
  const k = ink(o.tone ?? 'warn');
  return [
    path(`M${cx - 10} ${cy + 7} C${cx - 9} ${cy + 2} ${cx - 9} ${cy - 3} ${cx - 8} ${cy - 6} C${cx - 6} ${cy - 12} ${cx + 6} ${cy - 12} ${cx + 8} ${cy - 6} C${cx + 9} ${cy - 3} ${cx + 9} ${cy + 2} ${cx + 10} ${cy + 7} z`, { fill: face(o.tone ?? 'warn'), stroke: k, sw: 1.8 }),
    line(cx - 12, cy + 7, cx + 12, cy + 7, { tone: k, sw: 2 }),
    circle(cx, cy + 11, 2.6, { fill: k }),
    line(cx, cy - 14, cx, cy - 11, { tone: k, sw: 2 }),
  ].join('\n');
}

/** 사람. 24×30 */
export function person(cx, cy, o = {}) {
  const k = ink(o.tone);
  return [circle(cx, cy - 8, 6.5, { fill: face(o.tone), stroke: k, sw: 1.8 }), path(`M${cx - 11} ${cy + 14} C${cx - 11} ${cy + 2} ${cx + 11} ${cy + 2} ${cx + 11} ${cy + 14} z`, { fill: face(o.tone), stroke: k, sw: 1.8 })].join('\n');
}

/** 문서(파일). 26×32, lines로 줄 수 */
export function doc(cx, cy, o = {}) {
  const k = ink(o.tone);
  const x = cx - 13;
  const y = cy - 16;
  const parts = [
    path(`M${x} ${y + 3} Q${x} ${y} ${x + 3} ${y} H${x + 18} L${x + 26} ${y + 8} V${y + 29} Q${x + 26} ${y + 32} ${x + 23} ${y + 32} H${x + 3} Q${x} ${y + 32} ${x} ${y + 29} z`, { fill: face(o.tone), stroke: k, sw: 1.8 }),
    path(`M${x + 18} ${y} V${y + 8} H${x + 26}`, { stroke: k, sw: 1.4 }),
  ];
  const n = o.lines ?? 3;
  for (let i = 0; i < n; i++) parts.push(line(x + 6, y + 14 + i * 5, x + 20 - (i === n - 1 ? 5 : 0), y + 14 + i * 5, { tone: k, sw: 1.5 }));
  return parts.join('\n');
}

/** 편지(메시지). 30×22 */
export function envelope(cx, cy, o = {}) {
  const k = ink(o.tone);
  return [rect(cx - 15, cy - 11, 30, 22, { rx: 3, fill: face(o.tone), stroke: k, sw: 1.8 }), path(`M${cx - 15} ${cy - 9} L${cx} ${cy + 2} L${cx + 15} ${cy - 9}`, { stroke: k, sw: 1.6 })].join('\n');
}

/** 휴지통(버림). 24×28 */
export function trash(cx, cy, o = {}) {
  const k = ink(o.tone ?? 'warn');
  return [
    path(`M${cx - 9} ${cy - 8} L${cx - 7} ${cy + 13} H${cx + 7} L${cx + 9} ${cy - 8}`, { fill: face(o.tone ?? 'warn'), stroke: k, sw: 1.8 }),
    line(cx - 12, cy - 9, cx + 12, cy - 9, { tone: k, sw: 2 }),
    path(`M${cx - 4} ${cy - 9} V${cy - 13} H${cx + 4} V${cy - 9}`, { stroke: k, sw: 1.6 }),
    line(cx - 3, cy - 4, cx - 3, cy + 9, { tone: k, sw: 1.3 }),
    line(cx + 3, cy - 4, cx + 3, cy + 9, { tone: k, sw: 1.3 }),
  ].join('\n');
}

/** 돋보기. 26×26 */
export function magnifier(cx, cy, o = {}) {
  const k = ink(o.tone);
  return [circle(cx - 3, cy - 3, 8, { fill: face(o.tone), stroke: k, sw: 2 }), line(cx + 3, cy + 3, cx + 10, cy + 10, { tone: k, sw: 3 })].join('\n');
}

/** 메모리 칩(RAM). 40×20 */
export function ram(cx, cy, o = {}) {
  const k = ink(o.tone);
  const parts = [rect(cx - 20, cy - 10, 40, 18, { rx: 2, fill: face(o.tone), stroke: k, sw: 1.8 })];
  for (let i = 0; i < 3; i++) parts.push(rect(cx - 15 + i * 11, cy - 6, 8, 9, { rx: 1, fill: 'line', stroke: 'none' }));
  for (let i = 0; i < 7; i++) parts.push(line(cx - 17 + i * 5.6, cy + 8, cx - 17 + i * 5.6, cy + 12, { tone: k, sw: 1.4, cap: 'butt' }));
  return parts.join('\n');
}

/** CPU 칩(사방에 다리). size×size, 기본 30 */
export function chip(cx, cy, o = {}) {
  const k = ink(o.tone);
  const s = o.size ?? 30;
  const h = s / 2;
  const b = (s * 0.56) / 2;
  const parts = [];
  for (let i = 0; i < 3; i++) {
    const d = -s * 0.25 + i * s * 0.25;
    parts.push(line(cx + d, cy - h - 4, cx + d, cy - h, { tone: k, sw: 1.6, cap: 'butt' }));
    parts.push(line(cx + d, cy + h, cx + d, cy + h + 4, { tone: k, sw: 1.6, cap: 'butt' }));
    parts.push(line(cx - h - 4, cy + d, cx - h, cy + d, { tone: k, sw: 1.6, cap: 'butt' }));
    parts.push(line(cx + h, cy + d, cx + h + 4, cy + d, { tone: k, sw: 1.6, cap: 'butt' }));
  }
  parts.push(rect(cx - h, cy - h, s, s, { rx: 3, fill: face(o.tone), stroke: k, sw: 1.8 }));
  parts.push(rect(cx - b, cy - b, b * 2, b * 2, { rx: 2, fill: o.tone === 'accent' ? 'accent' : 'line', stroke: 'none' }));
  return parts.join('\n');
}

/** 하드디스크(옆에서 본 상자와 원판). 44×30 */
export function hdd(cx, cy, o = {}) {
  const k = ink(o.tone);
  return [
    rect(cx - 22, cy - 15, 44, 30, { rx: 4, fill: face(o.tone), stroke: k, sw: 1.8 }),
    circle(cx - 4, cy, 9.5, { fill: o.tone === 'warn' ? 'warnWeak' : 'line', stroke: k, sw: 1.5 }),
    circle(cx - 4, cy, 2.2, { fill: k }),
    line(cx + 5, cy + 5, cx + 16, cy - 9, { tone: k, sw: 1.8 }),
  ].join('\n');
}

/** 네트워크 포트(랜 단자). 34×26 */
export function jack(cx, cy, o = {}) {
  const k = ink(o.tone);
  return [
    rect(cx - 17, cy - 13, 34, 26, { rx: 4, fill: face(o.tone), stroke: k, sw: 1.8 }),
    path(`M${cx - 9} ${cy + 7} V${cy - 2} H${cx - 5} V${cy - 6} H${cx + 5} V${cy - 2} H${cx + 9} V${cy + 7} z`, { fill: 'line', stroke: k, sw: 1.5 }),
    line(cx - 4, cy - 2, cx - 4, cy + 1, { tone: k, sw: 1.2, cap: 'butt' }),
    line(cx, cy - 2, cx, cy + 1, { tone: k, sw: 1.2, cap: 'butt' }),
    line(cx + 4, cy - 2, cx + 4, cy + 1, { tone: k, sw: 1.2, cap: 'butt' }),
  ].join('\n');
}

/** 톱니바퀴(관리·설정). 지름 약 2r, 기본 r 11 */
export function gear(cx, cy, o = {}) {
  const k = ink(o.tone);
  const R = o.r ?? 11;
  const ri = R * 0.74;
  const n = 8;
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a0 = (i / n) * Math.PI * 2;
    const da = Math.PI / n;
    for (const [a, r] of [[a0 - da * 0.5, ri], [a0 - da * 0.32, R], [a0 + da * 0.32, R], [a0 + da * 0.5, ri]]) pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  const d = pts.map((p, i) => `${i ? 'L' : 'M'}${r1(p[0])} ${r1(p[1])}`).join(' ') + ' z';
  return path(d, { fill: face(o.tone), stroke: k, sw: 1.6 }) + '\n' + circle(cx, cy, R * 0.32, { fill: 'card', stroke: k, sw: 1.5 });
}

/** 폴더. 30×24 */
export function folder(cx, cy, o = {}) {
  const k = ink(o.tone);
  const x = cx - 15;
  const y = cy - 12;
  return path(`M${x} ${y + 3} Q${x} ${y} ${x + 3} ${y} H${x + 10} L${x + 13} ${y + 4} H${x + 27} Q${x + 30} ${y + 4} ${x + 30} ${y + 7} V${y + 21} Q${x + 30} ${y + 24} ${x + 27} ${y + 24} H${x + 3} Q${x} ${y + 24} ${x} ${y + 21} z`, { fill: face(o.tone), stroke: k, sw: 1.8 });
}

/** 자물쇠. 18×22 */
export function lock(cx, cy, o = {}) {
  const k = ink(o.tone ?? 'warn');
  return [
    path(`M${cx - 5.5} ${cy - 1} V${cy - 5} A5.5 5.5 0 0 1 ${cx + 5.5} ${cy - 5} V${cy - 1}`, { stroke: k, sw: 2 }),
    rect(cx - 8, cy - 1, 16, 12, { rx: 2.5, fill: face(o.tone ?? 'warn'), stroke: k, sw: 1.8 }),
    circle(cx, cy + 5, 1.8, { fill: k }),
  ].join('\n');
}

/** 시계. 반지름 r(기본 13), h·m으로 바늘 */
export function clock(cx, cy, o = {}) {
  const k = ink(o.tone);
  const r = o.r ?? 13;
  const h = o.h ?? 10;
  const m = o.m ?? 0;
  const ha = ((h % 12) / 12 + m / 720) * Math.PI * 2 - Math.PI / 2;
  const ma = (m / 60) * Math.PI * 2 - Math.PI / 2;
  const parts = [circle(cx, cy, r, { fill: face(o.tone), stroke: k, sw: 1.8 })];
  for (let i = 0; i < 12; i += 3) {
    const a = (i / 12) * Math.PI * 2;
    parts.push(line(cx + (r - 3.5) * Math.cos(a), cy + (r - 3.5) * Math.sin(a), cx + (r - 1.5) * Math.cos(a), cy + (r - 1.5) * Math.sin(a), { tone: k, sw: 1.4 }));
  }
  parts.push(line(cx, cy, cx + r * 0.5 * Math.cos(ha), cy + r * 0.5 * Math.sin(ha), { tone: k, sw: 2.2 }));
  parts.push(line(cx, cy, cx + r * 0.78 * Math.cos(ma), cy + r * 0.78 * Math.sin(ma), { tone: k, sw: 1.6 }));
  return parts.join('\n');
}

/** 스레드(실행 흐름)를 나타내는 세로 물결 화살표. (cx, y0)에서 길이 len만큼 내려간다. */
export function thread(cx, y0, len, o = {}) {
  const { tone = 'accent', amp = 4, waves = 3, sw = 2 } = o;
  const seg = (len - 8) / (waves * 2);
  let d = `M${r1(cx)} ${r1(y0)}`;
  for (let i = 0; i < waves * 2; i++) d += ` q${i % 2 ? -amp * 2 : amp * 2} ${r1(seg / 2)} 0 ${r1(seg)}`;
  const yEnd = y0 + seg * waves * 2;
  return path(d, { stroke: tone, sw }) + '\n' + head(cx, yEnd + 8, cx, yEnd, { tone, size: 8 });
}

// ── 그래프 ──

/** 좌표 틀. (x,y)는 그래프 칸의 왼쪽 위, w×h. 값 범위를 받아 그리는 함수를 돌려준다. */
export function plot(x, y, w, h, r = {}) {
  const { x0 = 0, x1 = 1, y0 = 0, y1 = 1 } = r;
  const sx = (v) => x + ((v - x0) / (x1 - x0)) * w;
  const sy = (v) => y + h - ((v - y0) / (y1 - y0)) * h;
  const P = (pts) => pts.map(([a, b], i) => `${i ? 'L' : 'M'}${r1(sx(a))} ${r1(sy(b))}`).join(' ');
  return {
    sx, sy, x, y, w, h,
    /** 바닥선 */
    base: (o = {}) => line(x, y + h, x + w, y + h, { tone: o.tone ?? 'weak', sw: o.sw ?? 1.5, cap: 'butt' }),
    /** 가로 눈금선과 왼쪽 글자 */
    yticks: (ticks, o = {}) => ticks.map(([v, s]) => [line(x, sy(v), x + w, sy(v), { tone: 'line', sw: 1, dash: '3 4', cap: 'butt' }), s ? text(x - 6, sy(v) + 4.5, s, { size: 13, tone: o.tone ?? 'sub', anchor: 'end' }) : ''].join('\n')).join('\n'),
    /** 아래 눈금 글자 */
    xticks: (ticks, o = {}) => ticks.map(([v, s]) => text(sx(v), y + h + (o.dy ?? 18), s, { size: 13, tone: o.tone ?? 'sub', anchor: o.anchor ?? 'middle' })).join('\n'),
    line: (pts, o = {}) => path(P(pts), { stroke: o.tone ?? 'accent', sw: o.sw ?? 2.4, dash: o.dash }),
    /** 선 아래를 칠한 영역(바닥은 y0 또는 base 배열) */
    area: (pts, o = {}) => {
      const bottom = o.base ? [...o.base].reverse() : [[pts[pts.length - 1][0], y0], [pts[0][0], y0]];
      return path(P([...pts, ...bottom]) + ' z', { fill: o.fill ?? 'accentWeak', stroke: 'none' });
    },
    dots: (pts, o = {}) => pts.map(([a, b]) => circle(sx(a), sy(b), o.r ?? 3.5, { fill: o.tone ?? 'accent', stroke: o.ring ? 'card' : 'none', sw: 1.5 })).join('\n'),
    hline: (v, o = {}) => line(o.from != null ? sx(o.from) : x, sy(v), o.to != null ? sx(o.to) : x + w, sy(v), { tone: o.tone ?? 'warn', sw: o.sw ?? 1.6, dash: o.dash ?? '5 4', cap: 'butt' }),
    vline: (v, o = {}) => line(sx(v), o.top ?? y, sx(v), y + h, { tone: o.tone ?? 'sub', sw: o.sw ?? 1.5, dash: o.dash ?? '4 4', cap: 'butt' }),
    /** 값 범위 띠 */
    band: (a, b, o = {}) => rect(o.from != null ? sx(o.from) : x, sy(b), (o.to != null ? sx(o.to) : x + w) - (o.from != null ? sx(o.from) : x), sy(a) - sy(b), { rx: 0, fill: o.fill ?? 'accentWeak', stroke: 'none' }),
    /** x 구간 띠(세로) */
    span: (a, b, o = {}) => rect(sx(a), o.top ?? y, sx(b) - sx(a), (o.bottom ?? y + h) - (o.top ?? y), { rx: 0, fill: o.fill ?? 'warnWeak', stroke: 'none' }),
    /** 막대 */
    bar: (a, v, bw, o = {}) => rect(sx(a) - bw / 2, sy(v), bw, sy(y0) - sy(v), { rx: o.rx ?? 2, fill: o.tone ?? 'accent', stroke: 'none', op: o.op }),
  };
}

// ── 표시 ──

/** X 표(사라짐, 막힘). */
export function xmark(cx, cy, o = {}) {
  const { r = 6, tone = 'warn', sw = 2.6 } = o;
  return line(cx - r, cy - r, cx + r, cy + r, { tone, sw }) + '\n' + line(cx - r, cy + r, cx + r, cy - r, { tone, sw });
}

/** 체크 표(맞음). */
export function check(cx, cy, o = {}) {
  const { r = 6, tone = 'accent', sw = 2.4 } = o;
  return path(`M${r1(cx - r)} ${r1(cy)} L${r1(cx - r * 0.3)} ${r1(cy + r * 0.7)} L${r1(cx + r)} ${r1(cy - r * 0.7)}`, { stroke: tone, sw });
}

/** 말풍선(장비가 하는 말). 꼬리는 아래(tail: 'down') 또는 위로. (x,y)는 가운데. */
export function bubble(x, y, str, o = {}) {
  const { tone = 'soft', size = 13, tail = 'down', tailX = x, weight = 600 } = o;
  const w = textWidth(str, size, weight) + 16;
  const h = size + 12;
  const fill = { soft: 'accentWeak', plain: 'card', warn: 'warnWeak' }[tone];
  const stroke = { soft: 'accent', plain: 'weak', warn: 'warn' }[tone];
  const tx = { soft: 'accent', plain: 'text', warn: 'warn' }[tone];
  const l = x - w / 2;
  const t = y - h / 2;
  const b = y + h / 2;
  const tip = tail === 'down' ? `L${r1(tailX + 4)} ${r1(b)} L${r1(tailX)} ${r1(b + 6)} L${r1(tailX - 4)} ${r1(b)}` : '';
  const tipUp = tail === 'up' ? `L${r1(tailX - 4)} ${r1(t)} L${r1(tailX)} ${r1(t - 6)} L${r1(tailX + 4)} ${r1(t)}` : '';
  const d = `M${r1(l + 6)} ${r1(t)} ${tipUp} H${r1(l + w - 6)} Q${r1(l + w)} ${r1(t)} ${r1(l + w)} ${r1(t + 6)} V${r1(b - 6)} Q${r1(l + w)} ${r1(b)} ${r1(l + w - 6)} ${r1(b)} ${tip} H${r1(l + 6)} Q${r1(l)} ${r1(b)} ${r1(l)} ${r1(b - 6)} V${r1(t + 6)} Q${r1(l)} ${r1(t)} ${r1(l + 6)} ${r1(t)} z`;
  return path(d, { fill, stroke, sw: 1.3 }) + '\n' + text(x, y + size * 0.36, str, { size, weight, tone: tx, anchor: 'middle' });
}

/**
 * 주고받기 사다리. lanes는 [{ x, label }], msgs는 [{ from, to, y, label?, tone?, dashed?, lost?(0~1 어디서 사라지나), note? }].
 * top은 이름 줄 y, bottom은 세로줄 끝.
 */
export function ladder(lanes, msgs, o = {}) {
  const { top = 18, bottom = 200, labelSize = 13 } = o;
  const out = [];
  lanes.forEach((l) => {
    out.push(text(l.x, top, l.label, { size: 13, weight: 700, tone: l.tone ?? 'text', anchor: 'middle' }));
    out.push(line(l.x, top + 8, l.x, bottom, { tone: 'line', sw: 2 }));
  });
  msgs.forEach((m) => {
    const a = lanes[m.from].x;
    const b = lanes[m.to].x;
    const tone = m.tone ?? 'sub';
    if (m.lost != null) {
      const stop = a + (b - a) * m.lost;
      out.push(arrow([[a, m.y], [stop, m.y]], { tone, sw: 2, dash: m.dashed ? '5 4' : undefined, end: false }));
      out.push(xmark(stop + Math.sign(b - a) * 6, m.y, { r: 5 }));
    } else {
      out.push(arrow([[a, m.y], [b, m.y]], { tone, sw: 2, dash: m.dashed ? '5 4' : undefined, size: 7 }));
    }
    // 사라지는 화살표는 그려진 부분의 가운데에 글자를 둔다
    const mid = m.lost != null ? (a + (a + (b - a) * m.lost)) / 2 : (a + b) / 2;
    if (m.label) out.push(text(mid + (m.dx ?? 0), m.y - 6, m.label, { size: labelSize, weight: 600, tone: m.labelTone ?? (tone === 'sub' ? 'text' : tone), anchor: 'middle' }));
  });
  return out.join('\n');
}

// ── 파일 쓰기 ──

/** body(문자열이나 배열)를 w×h 그림으로 감싸 src/assets/figures/{domain}/{name}.svg에 쓴다. */
export function save(domain, name, w, h, body) {
  const inner = (Array.isArray(body) ? body.flat(Infinity) : [body]).filter(Boolean).join('\n');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">\n${inner}\n</svg>\n`;
  const file = join(ROOT, 'src', 'assets', 'figures', domain, `${name}.svg`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, svg);
  return file;
}
