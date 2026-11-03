import type { FigureTone } from './flow';

export interface AnatomyPart {
  /** 이름에서 떼어 낸 조각(예: c, 7, gn, .4xlarge). 이어 붙이면 전체 이름이 된다 */
  text: string;
  /** 조각의 뜻(예: 용도) */
  label: string;
  /** 뜻 옆 작은 글자(예: 컴퓨트 최적화) */
  note?: string;
  /** 흐린 조각(구분 기호처럼 뜻이 없는 조각)은 sub */
  tone?: FigureTone;
}

export const ANATOMY_MAX_PARTS = 6;

/** 뜻이 있는 조각에 1부터 번호를 매긴다. 흐린 조각(sub)은 번호 없이 이름 줄에만 둔다. */
export function layoutAnatomy(parts: readonly AnatomyPart[]): { text: string; parts: (AnatomyPart & { number?: number })[] } {
  if (parts.length < 2) throw new Error('Anatomy: 조각이 둘 이상이어야 해요');
  let n = 0;
  const out = parts.map((p) => {
    if (!p.text) throw new Error('Anatomy: 빈 조각이 있어요');
    return p.tone === 'sub' ? { ...p } : { ...p, number: ++n };
  });
  if (n > ANATOMY_MAX_PARTS) throw new Error(`Anatomy: 뜻이 있는 조각이 ${n}개예요. ${ANATOMY_MAX_PARTS}개까지만 그려요`);
  return { text: parts.map((p) => p.text).join(''), parts: out };
}
