import type { DomainId } from '../data/domains';
import type { IconName } from '../data/icons';

export type DocType = 'overview' | 'concept' | 'guide';

/** 개념 글의 층. basics는 도메인 기초, monitoring은 모니터링 관점이다. */
export type Stage = 'basics' | 'monitoring';

export const TYPE_LABEL: Record<DocType, string> = { overview: '한눈에 보기', concept: '개념', guide: '가이드' };

/** 목록·카드·다음 글에 쓰는 글 요약. astro:content에 의존하지 않아 단위 테스트할 수 있다. */
export interface DocCard {
  id: string;
  domain: DomainId;
  type: DocType;
  stage?: Stage;
  order: number;
  title: string;
  summary: string;
  icon?: IconName;
  updated: Date;
  readingMinutes: number;
  url: string;
}

export function sortByOrder<T extends Pick<DocCard, 'order' | 'id'>>(docs: readonly T[]): T[] {
  return [...docs].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id));
}

export function inDomain<T extends Pick<DocCard, 'domain'>>(docs: readonly T[], domain: DomainId): T[] {
  return docs.filter((d) => d.domain === domain);
}

export function nextInDomain<T extends Pick<DocCard, 'id' | 'domain' | 'order'>>(docs: readonly T[], currentId: string): T | undefined {
  const current = docs.find((d) => d.id === currentId);
  if (!current) return undefined;
  const list = sortByOrder(inDomain(docs, current.domain));
  return list[list.findIndex((d) => d.id === currentId) + 1];
}

export function recentlyUpdated<T extends Pick<DocCard, 'updated' | 'id' | 'order'>>(docs: readonly T[], limit: number): T[] {
  return [...docs]
    .sort((a, b) => b.updated.getTime() - a.updated.getTime() || b.order - a.order || a.id.localeCompare(b.id))
    .slice(0, limit);
}

/** 홈의 두 목록. 처음 목록은 모니터링 기초를 순서대로, 최근 목록은 처음 목록에 없는 글만 최근 수정 순, 같은 날이면 나중 순서(order)부터 고른다. */
export function homeLists<T extends Pick<DocCard, 'id' | 'domain' | 'order' | 'updated'>>(
  docs: readonly T[],
  limit = 5,
): { starter: T[]; recent: T[] } {
  const starter = sortByOrder(inDomain(docs, 'foundations')).slice(0, limit);
  const shown = new Set(starter.map((d) => d.id));
  const recent = recentlyUpdated(docs.filter((d) => !shown.has(d.id)), limit);
  return { starter, recent };
}
