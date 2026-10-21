# 사실 확인: 브라우저에서 페이지가 뜨기까지

- 글: src/content/docs/apm/page-load.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| DNS로 IP를 얻고, TCP 3방향 핸드셰이크, TLS로 암호화 방식·서버 확인, 응답, DOM·CSSOM으로 해석, async·defer 없는 script가 렌더링과 해석을 막음 | https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/How_browsers_work |
| domainLookupStart·connectStart·requestStart·responseStart(첫 바이트, 중간 응답일 수 있음)·responseEnd 뜻 | https://developer.mozilla.org/en-US/docs/Web/API/PerformanceResourceTiming |
| domContentLoadedEventEnd·loadEventEnd 뜻 | https://developer.mozilla.org/en-US/docs/Web/API/PerformanceNavigationTiming |
| LCP 2.5초, INP 200ms, CLS 0.1, 75번째 백분위수를 모바일·데스크톱으로 나눠 봄 | https://web.dev/articles/vitals |
| 랩 데이터 = 통제된 환경, 필드 데이터 = 모든 방문자(RUM), 랩은 변수를 일부러 줄임 | https://web.dev/articles/lab-and-field-data-differences |
| 워터폴 합계 | 40 + 80 + 300 + 60 + 820 + 500 = 1,800ms, 첫 바이트 120 + 300 = 420ms |

- 메모: 외부 감시(URL 모니터링)가 랩 데이터에 가깝다는 건 "통제된 환경"이라는 랩 데이터 정의에서 나온 설명이에요.
