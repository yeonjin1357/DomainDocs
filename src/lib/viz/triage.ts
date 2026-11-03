import type { FigureTone } from './flow';

/** 단계에서 옆으로 빠지는 길 */
export interface TriageExit {
  /** 이 조건이면(예: 넉넉함) */
  when: string;
  /** 갈 곳. 숫자면 그 단계 번호(1부터), 글자면 단계 밖에서 볼 곳이나 할 일 */
  to: number | string;
  /** 갈 곳 옆 작은 글자 */
  note?: string;
  tone?: FigureTone;
}

export interface TriageStep {
  /** 이 단계에서 보는 것(예: available) */
  label: string;
  /** 이름 아래 작은 글자 */
  note?: string;
  /** 앞 단계에서 갈라져 이 단계로 올 때의 조건(예: 시간 초과일 때) */
  when?: string;
  /** 다음 단계로 내려가는 조건. 빈 글자면 조건 없이 이어지고, false면 다음 단계와 이어지지 않는다(갈래의 끝). 없으면 빈 글자와 같다 */
  next?: string | false;
  exits?: TriageExit[];
  /** warn은 출발점(증상), accent는 마지막에 닿는 곳 */
  tone?: FigureTone;
}

export interface TriageLayout {
  steps: {
    number: number;
    label: string;
    note?: string;
    when?: string;
    tone?: FigureTone;
    /** 다음 단계로 잇는 선과 그 위 글자. null이면 선이 없다 */
    next: string | null;
    exits: { when: string; to: string; toStep?: number; note?: string; tone?: FigureTone }[];
  }[];
}

export const TRIAGE_MAX_STEPS = 8;

/**
 * 단계에 번호(1부터)를 매기고, 다른 단계로 가는 길을 '3단계'처럼 바꾼다.
 * 없는 단계나 자기 자신을 가리키면 글을 고치도록 빌드를 멈춘다.
 */
export function layoutTriage(steps: readonly TriageStep[]): TriageLayout {
  if (steps.length < 2) throw new Error('Triage: 단계가 둘 이상이어야 해요');
  if (steps.length > TRIAGE_MAX_STEPS) throw new Error(`Triage: 단계가 ${steps.length}개예요. ${TRIAGE_MAX_STEPS}개까지만 그려요`);
  return {
    steps: steps.map((s, i) => {
      const number = i + 1;
      const last = number === steps.length;
      if (last && s.next) throw new Error(`Triage: 마지막 단계 '${s.label}'에는 다음 단계가 없어요`);
      return {
        number,
        label: s.label,
        note: s.note,
        when: s.when,
        tone: s.tone,
        next: last || s.next === false ? null : (s.next ?? ''),
        exits: (s.exits ?? []).map((e) => {
          if (typeof e.to === 'number') {
            if (!Number.isInteger(e.to) || e.to < 1 || e.to > steps.length) throw new Error(`Triage: '${s.label}'의 길 '${e.when}'이 없는 단계(${e.to})를 가리켜요`);
            if (e.to === number) throw new Error(`Triage: '${s.label}'의 길 '${e.when}'이 자기 단계를 가리켜요`);
            return { when: e.when, to: `${e.to}단계`, toStep: e.to, note: e.note, tone: e.tone };
          }
          return { when: e.when, to: e.to, note: e.note, tone: e.tone };
        }),
      };
    }),
  };
}
