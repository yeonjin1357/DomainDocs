import { describe, expect, it } from 'vitest';
import { searchStatus } from '../../src/scripts/search';

describe('searchStatus', () => {
  it('보여 준 만큼만 찾았으면 개수만 말한다', () => {
    expect(searchStatus('p99', 3, 3)).toBe('3개를 찾았어요');
  });
  it('찾은 글이 보여 준 글보다 많으면 둘 다 말한다', () => {
    expect(searchStatus('p99', 14, 10)).toBe('총 14개 중 10개를 보여 줘요');
  });
  it('없으면 검색어를 넣어 알린다', () => {
    expect(searchStatus('없는말', 0, 0)).toBe("'없는말'에 맞는 글이 없어요");
  });
});
