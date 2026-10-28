# 사실 확인: 실제 사용자 모니터링(RUM)

- 글: src/content/docs/apm/rum.mdx
- 확인일: 2026-10-28

| 확인한 주장 | 근거(URL) |
| --- | --- |
| `sendBeacon`은 작은 POST를 비동기로 보내고, 언로드를 늦추지 않으며, 큐에 쌓인 데이터는 64KiB까지 | https://developer.mozilla.org/en-US/docs/Web/API/Navigator/sendBeacon |
| `visibilitychange`의 hidden이 페이지가 믿고 받을 수 있는 마지막 이벤트, 분석 데이터 전송 시점으로 권함, unload·beforeunload 대신 | https://developer.mozilla.org/en-US/docs/Web/API/Document/visibilitychange_event |
| `error` 이벤트는 동기로 던진 오류, 처리하지 않은 Promise 거부(async 함수 안 throw 포함)는 `unhandledrejection` | https://developer.mozilla.org/en-US/docs/Web/API/Window/error_event |
| CORS 확인을 통과하지 않은 스크립트는 window.onerror에 최소 정보만, `crossorigin` 속성 | https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script |
| 긴 작업은 UI 스레드를 50ms 이상 붙잡은 작업 | https://developer.mozilla.org/en-US/docs/Web/API/PerformanceLongTaskTiming |
| CLS·INP는 페이지가 hidden이 될 때 다시 보고, 처음 Core Web Vitals는 전체 페이지 이동만 측정, 크롬 151부터 soft navigation 측정 | https://github.com/GoogleChrome/web-vitals (README) |
| `//# sourceMappingURL=` 주석 | https://tc39.es/ecma426/ |
| 광고·스크립트 차단 확장이 SDK 로드와 전송 주소를 막아 오류·성능 데이터가 전달되지 않을 수 있음 | https://docs.sentry.io/platforms/javascript/troubleshooting/ |

- 재현(Playwright Chromium): localhost:4601 페이지가 127.0.0.1:4602의 스크립트(`throw new Error('price is undefined')`)를 불렀어요. 서버는 `Access-Control-Allow-Origin: *`를 보냈어요.
  - `crossorigin` 없음: `error: Script error.`, 파일 없음, 줄 0.
  - `crossorigin="anonymous"`: `Uncaught Error: price is undefined`, `http://127.0.0.1:4602/app.js`, 1번째 줄.
  - 두 경우 모두 `Promise.reject(new Error('api failed'))`는 `unhandledrejection`으로 잡혔어요.
- 글에 넣지 않은 것: 세션을 끊는 기준은 제품마다 달라 숫자를 쓰지 않았어요. 첫 화면의 숫자(12,400번, 2.1%, 64%)는 예시예요.
- 함께 한 것: 용어 source-map을 올리고 RUM 용어의 연결 글을 이 글로 바꿨어요. 「브라우저에서 페이지가 뜨기까지」 related와 「URL 모니터링」 본문에 이 글을 이었어요. 퀴즈 5문제를 썼어요.
