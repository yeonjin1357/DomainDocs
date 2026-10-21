import { describe, expect, it } from 'vitest';
import { glossaryPath, joinBase, quizBankPath, quizHomePath, quizPlayPath } from '../../src/lib/paths';

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

describe('glossaryPath', () => {
  it('영역의 용어 사전 주소는 base 아래 terms/{영역}/이다', () => {
    expect(glossaryPath('network')).toMatch(/\/terms\/network\/$/);
  });
});

describe('퀴즈 주소', () => {
  it('퀴즈 홈과 문제 은행은 base 아래 quiz/에 있다', () => {
    expect(quizHomePath()).toMatch(/\/quiz\/$/);
    expect(quizBankPath()).toMatch(/\/quiz\/bank\.json$/);
  });
  it('풀이 주소는 범위를 scope 쿼리로 넘긴다', () => {
    expect(quizPlayPath()).toMatch(/\/quiz\/play\/$/);
    expect(quizPlayPath('due')).toMatch(/\/quiz\/play\/\?scope=due$/);
    expect(quizPlayPath('doc:network/snmp')).toMatch(/\/quiz\/play\/\?scope=doc%3Anetwork%2Fsnmp$/);
  });
});
