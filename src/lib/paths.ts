/** base와 경로를 슬래시 하나로 이어 붙인다. 경로가 비면 base 루트(끝에 /)를 돌려준다. */
export function joinBase(base: string, path = ''): string {
  const b = base.replace(/\/+$/, '');
  const p = path.replace(/^\/+/, '');
  return p ? `${b}/${p}` : `${b}/`;
}

/** 사이트 내부 URL. 모든 내부 링크는 이 함수를 거친다. */
export function withBase(path = ''): string {
  return joinBase(import.meta.env.BASE_URL, path);
}

export function docPath(id: string): string {
  return withBase(`${id}/`);
}

export function domainPath(domain: string): string {
  return withBase(`${domain}/`);
}
