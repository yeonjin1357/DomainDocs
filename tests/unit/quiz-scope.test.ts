import { describe, expect, it } from 'vitest';
import { parseScope, scopeParam } from '../../src/lib/quiz/scope';

describe('풀이 범위', () => {
  it('쿼리 값을 범위로 읽는다', () => {
    expect(parseScope('due')).toEqual({ kind: 'due' });
    expect(parseScope('new')).toEqual({ kind: 'new' });
    expect(parseScope('domain:network')).toEqual({ kind: 'domain', id: 'network' });
    expect(parseScope('doc:network/snmp')).toEqual({ kind: 'doc', id: 'network/snmp' });
  });

  it('값이 없거나 모르는 값이면 처음 보는 문제로 본다', () => {
    expect(parseScope(null)).toEqual({ kind: 'new' });
    expect(parseScope('domain:')).toEqual({ kind: 'new' });
    expect(parseScope('everything')).toEqual({ kind: 'new' });
  });

  it('범위를 쿼리 값으로 바꾼다', () => {
    expect(scopeParam({ kind: 'doc', id: 'network/snmp' })).toBe('doc:network/snmp');
    expect(scopeParam({ kind: 'due' })).toBe('due');
  });
});
