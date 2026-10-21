import { describe, expect, it } from 'vitest';
import { flattenGlossary, sortTerms, termAnchor } from '../../src/lib/glossary';

describe('glossary', () => {
  it('영역과 id로 키를 만들고 aliases 기본값은 빈 배열이다', () => {
    const [term] = flattenGlossary([{ domain: 'network', terms: [{ id: 'snmp', name: 'SNMP', short: '규약이에요.' }] }]);
    expect(term).toMatchObject({ key: 'network/snmp', domain: 'network', id: 'snmp', aliases: [] });
  });

  it('여러 영역 파일을 하나로 펼친다', () => {
    const terms = flattenGlossary([
      { domain: 'network', terms: [{ id: 'snmp', name: 'SNMP', short: '규약이에요.', aliases: ['에스엔엠피'] }] },
      { domain: 'database', terms: [{ id: 'index', name: '인덱스', short: '찾아보기예요.' }] },
    ]);
    expect(terms.map((t) => t.key)).toEqual(['network/snmp', 'database/index']);
    expect(terms[0].aliases).toEqual(['에스엔엠피']);
  });

  it('한글 이름을 가나다순으로 먼저, 나머지를 ABC순으로 줄 세운다', () => {
    const names = ['SNMP', '스위치', 'icmp', '인터페이스', '가상 LAN'].map((name) => ({ name }));
    expect(sortTerms(names).map((t) => t.name)).toEqual(['가상 LAN', '스위치', '인터페이스', 'icmp', 'SNMP']);
  });

  it('용어 사전 안 위치 이름을 만든다', () => {
    expect(termAnchor('snmp')).toBe('term-snmp');
  });
});
