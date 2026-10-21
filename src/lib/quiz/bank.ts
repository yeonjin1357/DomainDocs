import type { GlossaryTerm } from '../glossary';

export type QuestionType = 'ox' | 'choice' | 'input';

export interface QuizLink {
  url: string;
  title: string;
}

/** 풀이 화면이 쓰는 문제 하나. 빌드할 때 만들어 bank.json으로 낸다. */
export interface QuizQuestion {
  /** 바뀌지 않는 키: `{글 id}#{문제 id}` */
  key: string;
  domain: string;
  docId: string;
  type: QuestionType;
  prompt: string;
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

const unique = (xs: readonly string[]) => [...new Set(xs)];

/** 용어 이름과 괄호를 뺀 이름, 별칭. 주관식 정답으로 받는다. */
function termNames(t: GlossaryTerm): string[] {
  const bare = t.name.replace(/\s*\([^)]*\)\s*/g, '').trim();
  return unique([t.name, ...(bare ? [bare] : []), ...t.aliases]);
}

/**
 * 문제 파일의 문제를 모은다. 문제는 모두 사람이 쓴 것만 쓰고, 용어 사전으로 만들지 않는다.
 * 없는 글·용어를 가리키면 빌드를 멈춘다.
 */
export function buildBank(files: readonly DocQuizFile[], docs: readonly BankDoc[], terms: readonly GlossaryTerm[]): QuizQuestion[] {
  const docMap = new Map(docs.map((d) => [d.id, d]));
  const termMap = new Map(terms.map((t) => [t.key, t]));
  return files.flatMap((file) => {
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
}
