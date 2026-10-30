/** 글 검사 기준값. 바꾸면 docs/writing-guide.md의 같은 값도 함께 고친다. */
export const LINT_CONFIG = {
  maxSentenceChars: 80,
  maxSentencesPerParagraph: 3,
  maxBlockTitleChars: 30,
  /** 본문(Deeper 밖)에 쓰지 않는 표현. 면책·메타 서술을 막는다. */
  bannedPhrases: ['주장하지 않', '단정하지 않', '보장하지 않', '일반화하지 않', '이 문서에서는', '이 장에서는'],
  /**
   * 하나로 맞춘 용어. avoid를 쓰면 use로 바꾸라고 알린다(인라인 코드·코드 블록·keywords·aliases·answer는 빼고 본다).
   * pattern은 허용할 문맥을 뺀 정규식이다. 없으면 avoid 글자 그대로 찾는다.
   * 문맥에 따라 맞는 말이 갈리는 것(주 서버, 관리 서버, 에이전트)은 넣지 않는다.
   */
  preferredTerms: [
    { avoid: '오류', use: '에러' },
    { avoid: '라벨', use: '레이블' },
    { avoid: '디플로이먼트', use: 'Deployment' },
    { avoid: '레플리카셋', use: 'ReplicaSet' },
    { avoid: '플래너', use: '옵티마이저', pattern: '플래너(?!라고|라는)' },
    { avoid: '연결 풀', use: '커넥션 풀' },
    { avoid: '스로틀', use: '스로틀링', pattern: '스로틀(?!링)' },
    { avoid: '동기화된 복제본', use: 'ISR' },
    { avoid: '이미지 저장소', use: '레지스트리', pattern: '(?<!containerd )이미지 저장소' },
    { avoid: '쓰기 층', use: '쓰기 레이어' },
    { avoid: '사설 서브넷', use: '비공개 서브넷' },
    { avoid: 'metrics-server', use: 'Metrics Server' },
    { avoid: '톰캣', use: 'Tomcat' },
  ],
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
    'Layers',
    'Compare',
    'Timeline',
    'Strip',
  ],
} as const;
