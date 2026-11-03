import type { FigureTone } from './flow';

export interface BarItem {
  label: string;
  /** 막대 길이를 정하는 수 */
  value: number;
  /** 막대 끝에 쓸 글자(예: 8,488kB). 없으면 value에 unit을 붙인다 */
  display?: string;
  note?: string;
  tone?: FigureTone;
}

export interface BarsLayout {
  max: number;
  bars: { label: string; display: string; note?: string; tone?: FigureTone; percent: number }[];
}

export const BARS_MAX = 8;

/**
 * 막대 길이를 max에 대한 백분율로 바꾼다. max가 없으면 가장 큰 값이 끝이다.
 * 0보다 크지만 너무 작아 안 보이는 막대는 렌더링에서 최소 폭을 준다.
 */
export function layoutBars(bars: readonly BarItem[], max?: number, unit = ''): BarsLayout {
  if (bars.length < 2) throw new Error('Bars: 막대가 둘 이상이어야 견줘 볼 수 있어요');
  if (bars.length > BARS_MAX) throw new Error(`Bars: 막대가 ${bars.length}개예요. ${BARS_MAX}개까지만 그려요`);
  for (const b of bars) {
    if (!Number.isFinite(b.value) || b.value < 0) throw new Error(`Bars: '${b.label}'의 값(${b.value})은 0 이상의 수여야 해요`);
  }
  const top = max ?? Math.max(...bars.map((b) => b.value));
  if (!(top > 0)) throw new Error('Bars: 끝값이 0보다 커야 해요');
  for (const b of bars) {
    if (b.value > top) throw new Error(`Bars: '${b.label}'의 값(${b.value})이 끝값(${top})보다 커요`);
  }
  return {
    max: top,
    bars: bars.map((b) => ({
      label: b.label,
      display: b.display ?? `${b.value.toLocaleString('en-US')}${unit}`,
      note: b.note,
      tone: b.tone,
      // 0보다 크면 반올림해도 0이 되지 않게 해서, 렌더링의 최소 폭이 적용되게 한다
      percent: b.value === 0 ? 0 : Math.max(0.01, Math.round((b.value / top) * 10000) / 100),
    })),
  };
}
