/** 주관식 비교용. 전각·반각을 맞추고, 대소문자와 띄어쓰기·하이픈·밑줄을 무시한다. */
export function normalizeAnswer(s: string): string {
  return s.normalize('NFKC').toLowerCase().replace(/[\s\-_‐‑‒–—]/g, '');
}

export function isInputCorrect(input: string, accepted: readonly string[]): boolean {
  const n = normalizeAnswer(input);
  return n !== '' && accepted.some((a) => normalizeAnswer(a) === n);
}
