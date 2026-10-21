import type { GlossaryTerm } from '../glossary';
import { normalizeAnswer } from './answer';

export type QuestionType = 'ox' | 'choice' | 'input';

export interface QuizLink {
  url: string;
  title: string;
}

/** 풀이 화면이 쓰는 문제 하나. 빌드할 때 만들어 bank.json으로 낸다. */
export interface QuizQuestion {
  /** 바뀌지 않는 키. 글 문제는 `{글 id}#{문제 id}`, 용어 문제는 `term:{영역}/{용어 id}#def|#pick` */
  key: string;
  domain: string;
  docId?: string;
  type: QuestionType;
  prompt: string;
  /** 문제 아래에 따로 보여 줄 인용(용어 문제의 뜻) */
  quote?: string;
  choices?: string[];
  /** ox: 참·거짓, choice: 정답 보기 순서, input: 정답 목록 */
  answer: boolean | number | string[];
  explain: string;
  link: QuizLink;
}

/** 문제 파일(src/content/quizzes/{글 id}.yaml)의 문제 하나 */
export type DocQuestionInput =
  | { id: string; type: 'ox'; prompt: string; answer: boolean; explain: string; doc?: string }
  | { id: string; type: 'choice'; prompt: string; choices: string[]; answer: number; explain: string; doc?: string }
  | { id: string; type: 'input'; prompt: string; answer: string[]; explain: string; doc?: string; term?: string };

export interface DocQuizFile {
  docId: string;
  questions: DocQuestionInput[];
}

export interface BankDoc {
  id: string;
  domain: string;
  title: string;
  url: string;
}

const CHOICES = 4;
const TERM_EXPLAIN = '용어 사전에서 다른 용어와 함께 볼 수 있어요.';

/** 문자열로 정해지는 32비트 해시(FNV-1a). 빌드마다 같은 보기 순서를 만들려고 쓴다. */
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

const unique = (xs: readonly string[]) => [...new Set(xs)];

/** 용어 이름과 괄호를 뺀 이름, 별칭. 주관식 정답으로 받는다. */
function termNames(t: GlossaryTerm): string[] {
  const bare = t.name.replace(/\s*\([^)]*\)\s*/g, '').trim();
  return unique([t.name, ...(bare ? [bare] : []), ...t.aliases]);
}

/** 용어 사전에서 만드는 문제: 뜻 → 용어(주관식), 용어 → 뜻(객관식, 영역 용어가 4개 이상일 때) */
export function termQuestions(terms: readonly GlossaryTerm[], linkOf: (t: GlossaryTerm) => QuizLink): QuizQuestion[] {
  const byDomain = new Map<string, GlossaryTerm[]>();
  for (const t of terms) byDomain.set(t.domain, [...(byDomain.get(t.domain) ?? []), t]);

  return terms.flatMap((t) => {
    const out: QuizQuestion[] = [];
    const names = termNames(t);
    const explain = t.analogy ?? TERM_EXPLAIN;
    const short = normalizeAnswer(t.short);
    // 뜻에 이름이 그대로 들어 있으면 답이 보이므로 만들지 않는다.
    if (!names.some((n) => normalizeAnswer(n).length >= 2 && short.includes(normalizeAnswer(n)))) {
      out.push({ key: `term:${t.key}#def`, domain: t.domain, type: 'input', prompt: '이 뜻을 가진 용어는 무엇인가요?', quote: t.short, answer: names, explain, link: linkOf(t) });
    }
    const others = (byDomain.get(t.domain) ?? []).filter((o) => o.key !== t.key && o.short !== t.short);
    if (others.length >= CHOICES - 1) {
      const wrong = unique(
        [...others].sort((a, b) => hash(`${t.key}|${a.key}`) - hash(`${t.key}|${b.key}`)).map((o) => o.short),
      ).slice(0, CHOICES - 1);
      const at = hash(t.key) % CHOICES;
      const choices = [...wrong.slice(0, at), t.short, ...wrong.slice(at)];
      out.push({ key: `term:${t.key}#pick`, domain: t.domain, type: 'choice', prompt: `${t.name}의 뜻으로 맞는 것은 무엇인가요?`, choices, answer: at, explain, link: linkOf(t) });
    }
    return out;
  });
}

/** 글 문제와 용어 문제를 합친다. 없는 글·용어를 가리키면 빌드를 멈춘다. */
export function buildBank(
  files: readonly DocQuizFile[],
  docs: readonly BankDoc[],
  terms: readonly GlossaryTerm[],
  linkOf: (t: GlossaryTerm) => QuizLink,
): QuizQuestion[] {
  const docMap = new Map(docs.map((d) => [d.id, d]));
  const termMap = new Map(terms.map((t) => [t.key, t]));
  const docQuestions = files.flatMap((file) => {
    const doc = docMap.get(file.docId);
    if (!doc) throw new Error(`문제 파일의 글이 없거나 공개되지 않았어요: ${file.docId}`);
    return file.questions.map((q): QuizQuestion => {
      const linked = q.doc ? docMap.get(q.doc) : doc;
      if (!linked) throw new Error(`[${file.docId}#${q.id}] 없는 글을 가리켜요: ${q.doc}`);
      const base = { key: `${file.docId}#${q.id}`, domain: doc.domain, docId: doc.id, prompt: q.prompt, explain: q.explain, link: { url: linked.url, title: linked.title } };
      if (q.type === 'ox') return { ...base, type: 'ox', answer: q.answer };
      if (q.type === 'choice') return { ...base, type: 'choice', choices: q.choices, answer: q.answer };
      let accepted = q.answer;
      if (q.term) {
        const t = termMap.get(q.term);
        if (!t) throw new Error(`[${file.docId}#${q.id}] 없는 용어를 가리켜요: ${q.term}`);
        accepted = unique([...q.answer, ...termNames(t)]);
      }
      return { ...base, type: 'input', answer: accepted };
    });
  });
  return [...docQuestions, ...termQuestions(terms, linkOf)];
}
