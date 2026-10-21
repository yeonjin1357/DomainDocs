# DomainDocs

모니터링 제품을 만들고 판단하는 개발자를 위한 한국어 개념 노트예요.
도메인 기초부터 쉽게 설명하고, 그 위에 모니터링 관점을 얹어요.

- 사이트: https://yeonjin1357.github.io/DomainDocs/
- 영역: 모니터링 기초, 네트워크, 서버·OS, 컨테이너·쿠버네티스, 클라우드, 애플리케이션, 데이터베이스, 메시지 큐(글이 없는 영역은 준비 중이에요)

## 로컬에서 보기

```bash
npm ci
npm run dev        # http://localhost:4321/DomainDocs/
```

화면 테스트(`npm run test:e2e`)를 처음 돌리기 전에 `npx playwright install chromium`을 한 번 실행해 주세요.

## 글 쓰기

글은 `src/content/docs/{영역}/{글이름}.mdx`, 용어는 `src/content/terms/{영역}.yaml`이에요. 쓰기 전에 [글쓰기 가이드](docs/writing-guide.md)를 읽어 주세요.
`npm run lint:content`가 글의 틀과 문장을 검사해요.

## 검사

| 명령 | 하는 일 |
| --- | --- |
| `npm run check` | 타입 검사 |
| `npm test` | 단위 테스트 |
| `npm run test:e2e` | 화면 테스트(테스트 전용 글로 빌드해서 실행) |
| `npm run build` | 글 검사 → 빌드 → 검색 색인 |
