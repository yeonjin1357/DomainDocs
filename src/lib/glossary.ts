/** 용어 파일(src/content/terms/{domain}.yaml)의 용어 하나. 형식 검사는 글 검사기(scripts/lint-content/glossary.ts)가 한다. */
export interface RawTerm {
  id: string;
  name: string;
  en?: string;
  aliases?: string[];
  short: string;
  analogy?: string;
  /** 자세히 설명한 글 id(예: network/snmp) */
  doc?: string;
}

export interface GlossaryTerm extends Omit<RawTerm, 'aliases'> {
  /** 영역/id. <Term term>이 이 값을 쓴다. */
  key: string;
  domain: string;
  aliases: string[];
}

export function flattenGlossary(files: readonly { domain: string; terms: readonly RawTerm[] }[]): GlossaryTerm[] {
  return files.flatMap((f) => f.terms.map((t) => ({ ...t, key: `${f.domain}/${t.id}`, domain: f.domain, aliases: t.aliases ?? [] })));
}

const HANGUL_FIRST = /^[가-힣]/;

/** 한글로 시작하는 이름을 가나다순으로 먼저, 나머지를 ABC순(대소문자 무시)으로 줄 세운다. */
export function sortTerms<T extends { name: string }>(terms: readonly T[]): T[] {
  const hangul = terms.filter((t) => HANGUL_FIRST.test(t.name)).sort((a, b) => a.name.localeCompare(b.name, 'ko'));
  const others = terms.filter((t) => !HANGUL_FIRST.test(t.name)).sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }));
  return [...hangul, ...others];
}

/** 용어 사전 페이지 안에서 용어 하나의 위치(id 속성) */
export function termAnchor(id: string): string {
  return `term-${id}`;
}
