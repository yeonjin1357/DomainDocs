# 사실 확인: 브라우저 오류 추적

- 글: src/content/docs/apm/browser-errors.mdx
- 확인일: 2026-10-29

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 요소의 error 이벤트는 버블링하지 않고 취소할 수 없음, 자원을 못 불러오면 그 요소에서 일어남 | https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/error_event |
| fetch는 요청이 실패할 때만 거부되고, 404·504 같은 응답에는 거부되지 않아 ok·status를 확인해야 함 | https://developer.mozilla.org/en-US/docs/Web/API/Window/fetch |
| 같은 TypeError의 엔진별 문구(V8, Firefox, Safari) | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Errors/Unexpected_type |
| ResizeObserver 순환 때 다음 프레임으로 미루고 window에 고정 문구의 error를 냄, 브라우저 멈춤만 막음 | https://developer.mozilla.org/en-US/docs/Web/API/ResizeObserver |
| Sentry는 fingerprint → 스택 → 예외 종류·값 → 메시지 순으로 묶음, 줄인 JS가 묶기를 망치니 소스 맵 필요 | https://docs.sentry.io/concepts/data-management/event-grouping/ |

- 재현(Playwright, Chromium 156.0.8078.4, Firefox 157.0, WebKit 27.2): 한 페이지에서 오류를 차례로 일으켜 window.onerror와 캡처 리스너가 받은 것을 기록했어요.
  - undefined.name 읽기: Chromium `Uncaught TypeError: Cannot read properties of undefined (reading 'name')`(스택 `at readName (…:20:41)`), Firefox `TypeError: can't access property "name", user is undefined`(`readName@…:20:29`), WebKit `TypeError: undefined is not an object (evaluating 'user.name')`(`readName@…:20:40`).
  - 404 이미지: 세 엔진 모두 onerror에는 없고 캡처 리스너에만 IMG로 잡힘.
  - `Promise.reject('plain string')`: 세 엔진 모두 reason이 문자열, 스택 없음.
  - 404 API: 세 엔진 모두 resolved, ok false, status 404. 끊긴 API(route.abort): `Failed to fetch` / `NetworkError when attempting to fetch resource.` / `Load failed`.
  - ResizeObserver: 세 엔진 모두 고정 문구, 스택 없음. 크기를 계속 바꾸게 둔 첫 실행에서 Chromium은 0.8초 동안 50번 넘게 기록.
- MDN의 Firefox 문구(`"x" is undefined`)와 실험 결과가 달라서, Deeper에 함께 적었어요.
- OnDashboard의 숫자는 예시예요.
- 함께 한 것: 용어 resource-error, error-grouping을 올리고, 「실제 사용자 모니터링(RUM)」에 이 글을 이었어요. 퀴즈 5문제를 썼어요.
