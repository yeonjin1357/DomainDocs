/** 그림 설명으로 만드는 SVG 안 id. 한 페이지에 그림이 여럿이어도 화살촉 marker id가 겹치지 않게 한다. */
export function svgId(prefix: string, seed: string): string {
  let h = 0;
  for (const ch of seed) h = (Math.imul(h, 31) + (ch.codePointAt(0) ?? 0)) | 0;
  return `${prefix}-${(h >>> 0).toString(36)}`;
}
