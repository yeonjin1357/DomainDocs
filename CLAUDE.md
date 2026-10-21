# DomainDocs 작업 규칙

모니터링 제품을 만드는 개발자가 도메인 기초부터 배우는 한국어 공개 정적 사이트예요. 가독성과 쉬운 이해가 최우선이에요.

## 꼭 지킬 것

- 글(`src/content/docs/**`), 용어(`src/content/terms/**`), 퀴즈 문제(`src/content/quizzes/**`)를 쓰거나 고치기 전에 `docs/writing-guide.md`를 읽고 그대로 따라요.
- 글, 용어, 문제를 고친 뒤에는 `npm run lint:content`가 위반 0건이어야 해요.
- 새 글은 틀리면 위험한 주장(숫자, 기본값, 버전마다 다른 동작, 명령어·질의, 표준의 정의)만 따로 확인하고, 확인한 주장과 근거를 `docs/reviews/`에 몇 줄로 남겨요(서브 에이전트는 쓰지 않아요).
- 내부 링크는 `src/lib/paths.ts`의 함수로 만들어요. `/`로 시작하는 경로를 하드코딩하지 않아요.
- 토스 로고, Toss Product Sans, 토스페이스, 토스 일러스트는 쓰지 않아요.
- 댓글, 로그인, 방문자 분석, 영어판은 만들지 않아요.
- 설계: `docs/superpowers/specs/2026-10-13-domaindocs-site-design.md`, 기초 전환과 퀴즈는 `docs/superpowers/specs/2026-10-21-domain-basics-and-quiz-design.md`(어긋나면 이쪽을 따라요)

## 명령

| 명령 | 하는 일 |
| --- | --- |
| `npm run dev` | 개발 서버(에이전트가 실행하면 백그라운드로 떠요. `npx astro dev stop`으로 꺼요) |
| `npm run lint:content` | 글, 용어, 퀴즈 문제 검사 |
| `npm run build` | 글 검사 → 빌드 → 검색 색인 |
| `npm run check` | 타입 검사 |
| `npm test` | 단위 테스트 |
| `npm run test:e2e` | 화면 테스트(테스트 전용 글·용어·문제로 빌드해서 실행) |
