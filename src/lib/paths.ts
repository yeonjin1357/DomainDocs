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

/** 영역의 용어 사전. 글 주소(/{domain}/{slug}/)와 겹치지 않게 terms/ 아래에 둔다. */
export function glossaryPath(domain: string): string {
  return withBase(`terms/${domain}/`);
}

/** 퀴즈 홈 */
export function quizHomePath(): string {
  return withBase('quiz/');
}

/** 풀이 화면. scope는 due, new, domain:{영역}, doc:{글 id} 중 하나(src/lib/quiz/scope.ts). */
export function quizPlayPath(scope?: string): string {
  const path = withBase('quiz/play/');
  return scope ? `${path}?scope=${encodeURIComponent(scope)}` : path;
}

/** 빌드할 때 만든 문제 은행 */
export function quizBankPath(): string {
  return withBase('quiz/bank.json');
}
