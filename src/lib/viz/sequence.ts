import type { FigureTone } from './flow';

export interface SeqMessage {
  from: string;
  to: string;
  /** 화살표 위에 놓을 글자(예: GET, 응답) */
  label: string;
  tone?: FigureTone;
  /** 응답처럼 돌아오는 메시지는 점선으로 */
  dashed?: boolean;
}

/** viewBox 단위. 폭 320이라 360px 화면에서도 글자가 읽힌다. */
export const SEQ = { width: 320, headH: 36, rowH: 44, padX: 16, footH: 12 } as const;

export interface SeqLayout {
  width: number;
  height: number;
  lanes: { label: string; x: number }[];
  arrows: { x1: number; x2: number; y: number; label: string; tone: FigureTone; dashed: boolean }[];
}

const round = (n: number) => Math.round(n * 100) / 100;

/** 참여자를 가로로 고르게 놓고, 메시지를 시간 순서대로 아래로 쌓는다. */
export function layoutSequence(participants: readonly string[], messages: readonly SeqMessage[]): SeqLayout {
  const n = participants.length;
  if (n < 2 || n > 4) throw new Error(`Sequence: 참여자는 2~4명이어야 해요 (지금 ${n}명)`);
  const lanes = participants.map((label, i) => ({ label, x: round(SEQ.padX + ((SEQ.width - 2 * SEQ.padX) * (i + 0.5)) / n) }));
  const xOf = new Map(lanes.map((l) => [l.label, l.x]));
  const arrows = messages.map((m, k) => {
    const x1 = xOf.get(m.from);
    const x2 = xOf.get(m.to);
    if (x1 === undefined) throw new Error(`Sequence: 없는 참여자예요 (${m.from})`);
    if (x2 === undefined) throw new Error(`Sequence: 없는 참여자예요 (${m.to})`);
    if (m.from === m.to) throw new Error(`Sequence: 자기 자신에게 보내는 화살표는 그릴 수 없어요 (${m.from})`);
    return { x1, x2, y: round(SEQ.headH + SEQ.rowH * (k + 0.5) + 6), label: m.label, tone: m.tone ?? 'sub', dashed: m.dashed ?? false };
  });
  return { width: SEQ.width, height: SEQ.headH + SEQ.rowH * messages.length + SEQ.footH, lanes, arrows };
}
