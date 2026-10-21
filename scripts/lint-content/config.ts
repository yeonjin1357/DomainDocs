/** 글 검사 기준값. 바꾸면 docs/writing-guide.md의 같은 값도 함께 고친다. */
export const LINT_CONFIG = {
  maxSentenceChars: 80,
  maxSentencesPerParagraph: 3,
  maxBlockTitleChars: 30,
  /** 본문(Deeper 밖)에 쓰지 않는 표현. 면책·메타 서술을 막는다. */
  bannedPhrases: ['주장하지 않', '단정하지 않', '보장하지 않', '일반화하지 않', '이 문서에서는', '이 장에서는'],
  /**
   * MDX에서 import 없이 쓰는 컴포넌트. src/components/content/index.ts의 mdxComponents와 같아야 한다(단위 테스트가 확인).
   * 이 목록에도, default import한 이름에도 없는 JSX 요소(<a>, <img> 등)는 unknown-component로 잡는다.
   */
  mdxComponents: [
    'OnDashboard',
    'KeyPoints',
    'Point',
    'Analogy',
    'Figure',
    'Checkpoints',
    'Check',
    'Deeper',
    'Situation',
    'FirstLook',
    'Item',
    'Term',
    'MiniLineChart',
    'StatTile',
    'Waterfall',
    'Scatter',
    'ServiceMap',
    'Flow',
    'Sequence',
  ],
} as const;
