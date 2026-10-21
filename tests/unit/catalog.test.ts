import { describe, expect, it } from 'vitest';
import { homeLists, inDomain, nextInDomain, recentlyUpdated, sortByOrder, type DocCard } from '../../src/lib/catalog';

const card = (id: string, order: number, updated: string, domain: DocCard['domain'] = 'foundations', type: DocCard['type'] = 'concept'): DocCard => ({
  id,
  domain,
  type,
  order,
  title: id,
  summary: '',
  updated: new Date(updated),
  readingMinutes: 1,
  url: `/DomainDocs/${id}/`,
});

const DOCS = [
  card('foundations/c', 3, '2026-10-03'),
  card('foundations/a', 1, '2026-10-05'),
  card('foundations/b', 1, '2026-10-05'),
  card('apm/x', 1, '2026-10-09', 'apm'),
];

describe('catalog', () => {
  it('order 오름차순, 같으면 id 순으로 정렬한다', () => {
    expect(sortByOrder(DOCS).map((d) => d.id)).toEqual(['apm/x', 'foundations/a', 'foundations/b', 'foundations/c']);
  });
  it('영역별로 거른다', () => {
    expect(inDomain(DOCS, 'apm').map((d) => d.id)).toEqual(['apm/x']);
  });
  it('같은 영역의 다음 글을 찾는다', () => {
    expect(nextInDomain(DOCS, 'foundations/a')?.id).toBe('foundations/b');
    expect(nextInDomain(DOCS, 'foundations/b')?.id).toBe('foundations/c');
  });
  it('영역의 마지막 글이나 없는 글이면 undefined다', () => {
    expect(nextInDomain(DOCS, 'foundations/c')).toBeUndefined();
    expect(nextInDomain(DOCS, 'apm/x')).toBeUndefined();
    expect(nextInDomain(DOCS, 'nope/nope')).toBeUndefined();
  });
  it('최근 수정 순으로 limit개를 고른다', () => {
    expect(recentlyUpdated(DOCS, 3).map((d) => d.id)).toEqual(['apm/x', 'foundations/a', 'foundations/b']);
  });
  it('수정일이 같으면 order가 큰 글을 먼저 고른다', () => {
    const sameDay = [card('foundations/p', 10, '2026-10-13'), card('foundations/q', 30, '2026-10-13'), card('foundations/r', 20, '2026-10-13')];
    expect(recentlyUpdated(sameDay, 2).map((d) => d.id)).toEqual(['foundations/q', 'foundations/r']);
  });
});

describe('homeLists', () => {
  const ids = (docs: readonly DocCard[]) => docs.map((d) => d.id);
  it('처음 목록은 모니터링 기초를 order 순으로 limit개까지 고른다', () => {
    expect(ids(homeLists(DOCS).starter)).toEqual(['foundations/a', 'foundations/b', 'foundations/c']);
    expect(ids(homeLists(DOCS, 2).starter)).toEqual(['foundations/a', 'foundations/b']);
  });
  it('최근 목록은 처음 목록에 없는 글만 수정일이 늦은 순으로 고른다', () => {
    expect(ids(homeLists(DOCS).recent)).toEqual(['apm/x']);
    expect(ids(homeLists(DOCS, 2).recent)).toEqual(['apm/x', 'foundations/c']);
  });
  it('모든 글이 처음 목록에 있으면 최근 목록은 비어 있다', () => {
    expect(homeLists(inDomain(DOCS, 'foundations')).recent).toEqual([]);
  });
});
