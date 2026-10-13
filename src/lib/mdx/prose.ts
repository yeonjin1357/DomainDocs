import type { Paragraph, PhrasingContent, Root } from 'mdast';
import { visitParents } from 'unist-util-visit-parents';
import { jsxOnlyParagraph } from './parse';

/** 인라인 코드 글자를 한 글자씩 덮는 사용 영역 문자. 길이를 바꾸지 않고 분리·끝맺음 검사에서 코드를 숨긴다. */
export const CODE_MASK = String.fromCharCode(0xe000);

interface Piece {
  offset: number;
  text: string;
  line: number;
  column: number;
}

export interface ProseUnit {
  /** 보이는 글자(인라인 코드 포함). 길이 계산용 */
  text: string;
  /** 인라인 코드를 CODE_MASK로 덮은 글자. 문장 분리·끝맺음·금지 표현 검사용 */
  masked: string;
  pieces: Piece[];
  line: number;
  /** 바깥 JSX 요소 이름(바깥 → 안쪽 순서) */
  ancestors: string[];
}

function collectInline(nodes: PhrasingContent[], unit: ProseUnit): void {
  for (const n of nodes) {
    switch (n.type) {
      case 'text':
      case 'inlineCode': {
        const p = n.position!.start;
        unit.pieces.push({ offset: unit.text.length, text: n.value, line: p.line, column: p.column });
        unit.text += n.value;
        unit.masked += n.type === 'text' ? n.value : CODE_MASK.repeat(n.value.length);
        break;
      }
      case 'break':
        unit.text += '\n';
        unit.masked += '\n';
        break;
      case 'link':
      case 'linkReference':
      case 'emphasis':
      case 'strong':
      case 'delete':
      case 'mdxJsxTextElement':
        collectInline(n.children as PhrasingContent[], unit);
        break;
      default:
        // image, mdxTextExpression, html, footnoteReference는 문장이 아니다.
        break;
    }
  }
}

function makeUnit(children: PhrasingContent[], line: number, ancestors: string[]): ProseUnit {
  const unit: ProseUnit = { text: '', masked: '', pieces: [], line, ancestors };
  collectInline(children, unit);
  return unit;
}

function jsxNames(nodes: readonly unknown[]): string[] {
  return nodes.flatMap((n) => {
    const node = n as { type?: string; name?: string | null };
    return (node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement') && node.name ? [node.name] : [];
  });
}

/** 모든 단락(JSX 안 포함)을 찾는다. 제목·표·코드 블록·속성값은 단락이 아니므로 빠진다. */
export function extractProse(tree: Root): ProseUnit[] {
  const units: ProseUnit[] = [];
  visitParents(tree, 'paragraph', (p: Paragraph, parents) => {
    const ancestors = jsxNames(parents);
    const els = jsxOnlyParagraph(p);
    if (els) {
      for (const el of els) {
        units.push(makeUnit(el.children as PhrasingContent[], el.position!.start.line, [...ancestors, ...(el.name ? [el.name] : [])]));
      }
    } else {
      units.push(makeUnit(p.children, p.position!.start.line, ancestors));
    }
  });
  return units.filter((u) => u.text.trim() !== '');
}

const ABBREV = /(?:^|[\s(])(?:e\.g|i\.e|etc|vs|cf|approx)\.$/i;
const SENT_END = /[.?!]+["'”’」』)\]]*(?=\s|$)|(?<=[가-힣])[.?!]+(?=[가-힣])/g;

/** 문장 범위 [시작, 끝)을 돌려준다. masked 텍스트에 쓴다. */
export function splitSentenceSpans(text: string): Array<[number, number]> {
  const spans: Array<[number, number]> = [];
  let start = 0;
  const push = (s: number, e: number) => {
    while (s < e && /\s/.test(text[s])) s++;
    while (e > s && /\s/.test(text[e - 1])) e--;
    if (e > s) spans.push([s, e]);
  };
  for (const m of text.matchAll(SENT_END)) {
    const end = m.index + m[0].length;
    if (ABBREV.test(text.slice(start, end))) continue;
    if (/^\.{2,}$|^…/.test(m[0]) && end < text.length) continue;
    push(start, end);
    start = end;
  }
  push(start, text.length);
  return spans;
}

export interface Sentence {
  text: string;
  masked: string;
  length: number;
  line: number;
  /** 0이면 알 수 없음(여러 줄 단락의 둘째 줄 이후) */
  column: number;
}

export function sentencesOf(unit: ProseUnit): Sentence[] {
  return splitSentenceSpans(unit.masked).map(([s, e]) => {
    const piece = [...unit.pieces].reverse().find((p) => p.offset <= s) ?? unit.pieces[0];
    const before = piece ? piece.text.slice(0, s - piece.offset) : '';
    const nl = before.split('\n').length - 1;
    const text = unit.text.slice(s, e).replace(/\s+/g, ' ').normalize('NFC');
    return {
      text,
      masked: unit.masked.slice(s, e),
      length: [...text].length,
      line: (piece?.line ?? unit.line) + nl,
      column: piece && nl === 0 ? piece.column + before.length : 0,
    };
  });
}

/** 해요체 끝맺음("~요.", "~죠?", "~요.\")"). 뒤에 문장 부호와 닫는 따옴표·괄호가 붙어도 된다. */
export const POLITE_ENDING = /[요죠][.?!…~]*["'”’」』)\]]*$/u;
const ENDS_WITH_CODE = new RegExp(`${CODE_MASK}[\\s.?!…~"'”’」』)\\]]*$`, 'u');

/**
 * masked 문장이 해요체(~요, ~죠)로 끝나는지 본다. 합쇼체(~니다)와 해라체(~다)는 false다.
 * 인라인 코드로 끝나는 문장은 코드 앞의 마지막 한글 글자로 판단하고, 한글이 없으면(코드만 있는 문장) 통과시킨다.
 */
export function endsPolitely(masked: string): boolean {
  const s = masked.trimEnd();
  if (POLITE_ENDING.test(s)) return true;
  if (!ENDS_WITH_CODE.test(s)) return false;
  const hangul = s.replaceAll(CODE_MASK, '').match(/[가-힣]/gu);
  return !hangul || /[요죠]/u.test(hangul.at(-1)!);
}

export function findBanned(s: Sentence, banned: readonly string[]): string[] {
  return banned.filter((b) => s.masked.includes(b));
}
