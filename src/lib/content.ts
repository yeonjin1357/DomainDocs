import { getCollection, type CollectionEntry } from 'astro:content';
import type { DocCard } from './catalog';
import { analyzeBody, type BodyAnalysis } from './mdx/analyze';
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

/** related와 <Term>이 실제로 공개된 글을 가리키는지 확인한다. Astro는 없는 reference를 경고만 하고 넘어가기 때문이다. */
export function assertReferences(entries: readonly DocEntry[]): void {
  const ids = new Set(entries.map((e) => e.id));
  for (const e of entries) {
    const targets = [...e.data.related.map((r) => r.id), ...analyzeEntry(e).termSlugs];
    for (const id of targets) {
      if (!ids.has(id)) throw new Error(`[${e.id}] 없거나 공개되지 않은 글을 가리켜요: ${id}`);
    }
  }
}

/** 운영 빌드에서는 초안을 뺀다. 개발 서버에서는 초안도 보인다. */
export async function getPublishedDocs(): Promise<DocEntry[]> {
  const entries = await getCollection('docs', ({ data }) => (import.meta.env.PROD ? !data.draft : true));
  assertReferences(entries);
  return entries;
}

export function toCard(entry: DocEntry): DocCard {
  return {
    id: entry.id,
    domain: entry.data.domain,
    type: entry.data.type,
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
