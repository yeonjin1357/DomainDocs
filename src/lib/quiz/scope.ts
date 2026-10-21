import type { Scope } from './schedule';

/** 풀이 주소의 scope 쿼리 값을 읽는다. 모르는 값이면 처음 보는 문제로 본다. */
export function parseScope(value: string | null): Scope {
  if (value === 'due') return { kind: 'due' };
  const m = value?.match(/^(domain|doc):(.+)$/);
  if (m) return m[1] === 'domain' ? { kind: 'domain', id: m[2] } : { kind: 'doc', id: m[2] };
  return { kind: 'new' };
}

export function scopeParam(scope: Scope): string {
  return scope.kind === 'domain' || scope.kind === 'doc' ? `${scope.kind}:${scope.id}` : scope.kind;
}
