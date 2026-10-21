import { getCollection, type CollectionEntry } from 'astro:content';
import { TYPE_LABEL, type DocCard } from './catalog';
import { getDomain } from '../data/domains';
import { analyzeBody, type BodyAnalysis } from './mdx/analyze';
import { flattenGlossary, termAnchor, type GlossaryTerm } from './glossary';
import { docPath, glossaryPath } from './paths';
import { buildBank, type QuizQuestion } from './quiz/bank';

export type DocEntry = CollectionEntry<'docs'>;

const analysisCache = new Map<string, BodyAnalysis>();

export function analyzeEntry(entry: DocEntry): BodyAnalysis {
  const key = `${entry.id}:${entry.digest ?? ''}`;
  let result = analysisCache.get(key);
  if (!result) {
    result = analyzeBody(entry.body ?? '');
    analysisCache.set(key, result);
  }
  return result;
}

/**
 * related와 <Term>이 실제로 공개된 글·있는 용어를 가리키는지, 용어의 doc이 공개된 글인지 확인한다.
 * Astro는 없는 reference를 경고만 하고 넘어가기 때문이다.
 */
export function assertReferences(entries: readonly DocEntry[], terms: readonly GlossaryTerm[] = []): void {
  const ids = new Set(entries.map((e) => e.id));
  const keys = new Set(terms.map((t) => t.key));
  for (const e of entries) {
    const analysis = analyzeEntry(e);
    for (const id of [...e.data.related.map((r) => r.id), ...analysis.termSlugs]) {
      if (!ids.has(id)) throw new Error(`[${e.id}] 없거나 공개되지 않은 글을 가리켜요: ${id}`);
    }
    for (const key of analysis.glossaryKeys) {
      if (!keys.has(key)) throw new Error(`[${e.id}] 없는 용어를 가리켜요: ${key}`);
    }
  }
  for (const t of terms) {
    if (t.doc && !ids.has(t.doc)) throw new Error(`[용어 ${t.key}] 없거나 공개되지 않은 글을 가리켜요: ${t.doc}`);
  }
}

export async function getGlossary(): Promise<GlossaryTerm[]> {
  const files = await getCollection('glossary');
  return flattenGlossary(files.map((f) => ({ domain: f.id, terms: f.data.terms })));
}

/** 운영 빌드에서는 초안을 뺀다. 개발 서버에서는 초안도 보인다. */
export async function getPublishedDocs(): Promise<DocEntry[]> {
  const entries = await getCollection('docs', ({ data }) => (import.meta.env.PROD ? !data.draft : true));
  assertReferences(entries, await getGlossary());
  return entries;
}

export function toCard(entry: DocEntry): DocCard {
  return {
    id: entry.id,
    domain: entry.data.domain,
    type: entry.data.type,
    stage: entry.data.stage,
    order: entry.data.order,
    title: entry.data.title,
    summary: entry.data.summary,
    icon: entry.data.icon,
    updated: entry.data.updated,
    readingMinutes: analyzeEntry(entry).readingMinutes,
    url: docPath(entry.id),
  };
}

export async function getCards(): Promise<DocCard[]> {
  return (await getPublishedDocs()).map(toCard);
}

export interface TermPreview {
  title: string;
  summary: string;
  points: string[];
  url: string;
  /** '모니터링 기초 · 개념' 형태 */
  meta: string;
  /** 용어의 영어 원말 */
  en?: string;
  /** 용어의 한 줄 비유 */
  analogy?: string;
  /** 시트의 이동 버튼 글자 */
  linkLabel: string;
}

const domainName = (id: string) => getDomain(id)?.name ?? id;

/**
 * 페이지에 쓰인 Term의 미리보기 데이터. 빌드할 때 페이지 안에 넣어 두므로 시트를 열 때 네트워크 요청이 없다.
 * 키는 글이면 글 id, 용어면 term:{영역/id}다(Term.astro의 data-term과 같다).
 */
export async function getTermPreviews(slugs: readonly string[], glossaryKeys: readonly string[] = []): Promise<Record<string, TermPreview>> {
  if (slugs.length === 0 && glossaryKeys.length === 0) return {};
  const byId = new Map((await getPublishedDocs()).map((e) => [e.id, e]));
  const previews: Record<string, TermPreview> = {};
  for (const slug of slugs) {
    const target = byId.get(slug);
    if (!target) continue;
    previews[slug] = {
      title: target.data.title,
      summary: target.data.summary,
      points: analyzeEntry(target).pointTitles,
      url: docPath(target.id),
      meta: `${domainName(target.data.domain)} · ${TYPE_LABEL[target.data.type]}`,
      linkLabel: '전체 보기',
    };
  }
  if (glossaryKeys.length > 0) {
    const terms = new Map((await getGlossary()).map((t) => [t.key, t]));
    for (const key of glossaryKeys) {
      const t = terms.get(key);
      if (!t) continue;
      previews[`term:${key}`] = {
        title: t.name,
        summary: t.short,
        points: [],
        url: t.doc ? docPath(t.doc) : `${glossaryPath(t.domain)}#${termAnchor(t.id)}`,
        meta: `${domainName(t.domain)} · 용어`,
        en: t.en,
        analogy: t.analogy,
        linkLabel: t.doc ? '전체 보기' : '용어 사전에서 보기',
      };
    }
  }
  return previews;
}

let bankPromise: Promise<QuizQuestion[]> | undefined;

/**
 * 글 문제와 용어 문제를 합친 문제 은행. 없는 글·용어를 가리키면 빌드를 멈춘다.
 * 초안 글은 운영 빌드에서 빠지므로, 초안 글의 문제 파일은 글 검사가 막는다.
 */
export function getQuizBank(): Promise<QuizQuestion[]> {
  bankPromise ??= (async () => {
    const [files, cards, terms] = await Promise.all([getCollection('quizzes'), getCards(), getGlossary()]);
    const titles = new Map(cards.map((c) => [c.id, c.title]));
    const docs = cards.map((c) => ({ id: c.id, domain: c.domain, title: c.title, url: c.url }));
    const linkOf = (t: GlossaryTerm) =>
      t.doc && titles.has(t.doc)
        ? { url: docPath(t.doc), title: titles.get(t.doc)! }
        : { url: `${glossaryPath(t.domain)}#${termAnchor(t.id)}`, title: `${domainName(t.domain)} 용어 사전` };
    return buildBank(
      files.map((f) => ({ docId: f.id, questions: f.data.questions })),
      docs,
      terms,
      linkOf,
    );
  })();
  return bankPromise;
}

/** 문제 수를 글 id·영역별로 센다. */
export async function getQuizCounts(): Promise<{ byDoc: Map<string, number>; byDomain: Map<string, number>; total: number }> {
  const bank = await getQuizBank();
  const byDoc = new Map<string, number>();
  const byDomain = new Map<string, number>();
  for (const q of bank) {
    if (q.docId) byDoc.set(q.docId, (byDoc.get(q.docId) ?? 0) + 1);
    byDomain.set(q.domain, (byDomain.get(q.domain) ?? 0) + 1);
  }
  return { byDoc, byDomain, total: bank.length };
}
