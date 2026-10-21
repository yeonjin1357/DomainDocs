import { getCollection, type CollectionEntry } from 'astro:content';
import { TYPE_LABEL, type DocCard } from './catalog';
import { getDomain } from '../data/domains';
import { analyzeBody, type BodyAnalysis } from './mdx/analyze';
import { flattenGlossary, type GlossaryTerm } from './glossary';
import { docPath } from './paths';

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
}

/** 페이지에 쓰인 Term의 미리보기 데이터. 빌드할 때 페이지 안에 넣어 두므로 시트를 열 때 네트워크 요청이 없다. */
export async function getTermPreviews(slugs: readonly string[]): Promise<Record<string, TermPreview>> {
  if (slugs.length === 0) return {};
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
      meta: `${getDomain(target.data.domain)?.name ?? target.data.domain} · ${TYPE_LABEL[target.data.type]}`,
    };
  }
  return previews;
}
