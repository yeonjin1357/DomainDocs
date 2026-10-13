# DomainDocs 작업 규칙

모니터링 도메인 지식을 한국어로 정리하는 공개 정적 사이트예요. 가독성이 최우선이에요.

## 꼭 지킬 것

- 글(`src/content/docs/**`)을 쓰거나 고치기 전에 `docs/writing-guide.md`를 읽고 그대로 따른다.
- 글을 고친 뒤에는 `npm run lint:content`가 위반 0건이어야 한다.
- 새 글은 작성자와 다른 에이전트가 사실 검토하고, 결과를 `docs/reviews/`에 남긴다.
- 내부 링크는 `src/lib/paths.ts`의 함수로 만든다. `/`로 시작하는 경로를 하드코딩하지 않는다.
- 토스 로고, Toss Product Sans, 토스페이스, 토스 일러스트는 쓰지 않는다.
- 댓글, 로그인, 방문자 분석, 영어판은 만들지 않는다.
- 설계: `docs/superpowers/specs/2026-10-13-domaindocs-site-design.md`

## 명령

| 명령 | 하는 일 |
| --- | --- |
| `npm run dev` | 개발 서버(에이전트가 실행하면 백그라운드로 뜬다. `npx astro dev stop`으로 끈다) |
| `npm run lint:content` | 글 검사 |
| `npm run build` | 글 검사 → 빌드 → 검색 색인 |
| `npm run check` | 타입 검사 |
| `npm test` | 단위 테스트 |
| `npm run test:e2e` | 화면 테스트(테스트 전용 글로 빌드해서 실행) |
