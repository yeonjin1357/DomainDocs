/** 글 검사 기준값. 바꾸면 docs/writing-guide.md의 같은 값도 함께 고친다. */
export const LINT_CONFIG = {
  maxSentenceChars: 80,
  maxSentencesPerParagraph: 3,
  maxBodyChars: { concept: 1500, guide: 4000 },
  maxBlockTitleChars: 30,
  /** 본문(Deeper 밖)에 쓰지 않는 표현. 면책·메타 서술을 막는다. */
  bannedPhrases: ['주장하지 않', '단정하지 않', '보장하지 않', '일반화하지 않', '이 문서에서는', '이 장에서는'],
} as const;
