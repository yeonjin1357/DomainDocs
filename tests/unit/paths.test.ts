import { describe, expect, it } from 'vitest';
import { joinBase } from '../../src/lib/paths';

describe('joinBase', () => {
  it('base 뒤에 경로를 붙인다', () => {
    expect(joinBase('/DomainDocs', 'foundations/percentiles/')).toBe('/DomainDocs/foundations/percentiles/');
  });
  it('경로가 없으면 base 루트(끝에 /)를 돌려준다', () => {
    expect(joinBase('/DomainDocs')).toBe('/DomainDocs/');
    expect(joinBase('/DomainDocs/', '')).toBe('/DomainDocs/');
  });
  it('base와 경로의 중복 슬래시를 합친다', () => {
    expect(joinBase('/DomainDocs/', '/foundations/')).toBe('/DomainDocs/foundations/');
  });
  it('base가 루트(/)여도 동작한다', () => {
    expect(joinBase('/', 'foundations/')).toBe('/foundations/');
    expect(joinBase('/')).toBe('/');
  });
});
