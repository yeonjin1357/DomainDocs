# 사실 검토: 에러와 예외

- 글: src/content/docs/apm/errors-and-exceptions.mdx
- 검토일: 2026-10-14
- 방식: 초안을 다 쓴 뒤 따로 검토했어요(서브 에이전트 없이). OpenTelemetry 규약(1.44.0), RFC 9110, 도구 문서 원문을 내려받아 대조했어요.
- 결과: 수정 필요 2건 / 확인 14건

| 주장(인용) | 판정 | 근거(URL과 짧은 인용) | 수정 제안 |
| --- | --- | --- | --- |
| 핵심 2 "4xx는 서버 span 상태를 비워 둬요. HTTP 명세가 4xx를 클라이언트가 잘못한 것으로 보는 응답이라고 정해서예요." | 근거 없는 인과 | OpenTelemetry HTTP spans는 규칙만 정하고 이유를 밝히지 않아요. RFC 9110은 "The 4xx (Client Error) class of status code indicates that the client seems to have erred."라고만 해요. | "HTTP 명세(RFC 9110)도 4xx를 클라이언트가 잘못한 것으로 보이는 응답으로 정해요." |
| 더 깊이 "같은 예외를 두 번 넘게 남기는 것 … 권하지 않아요." | 틀림 | recording errors "It's NOT RECOMMENDED to record the same exception more than once." 두 번째부터 권하지 않는 거예요. | "여러 번 남기는 것" |
| 핵심 1 "OpenTelemetry는 작업이 예외를 밖으로 던지거나 에러 코드로 끝나면 실패로 봐요." | 맞음 | https://opentelemetry.io/docs/specs/semconv/general/recording-errors/ "an exception is thrown by the instrumented operation", "returns an error in another way, for example, via an error code" | — |
| 핵심 1 그림 50 ÷ 10,000 = 0.5% | 맞음 | 손계산 | — |
| 핵심 2 서버 span 5xx는 에러, 4xx는 비워 둠, 클라이언트 span은 4xx도 에러 | 맞음 | https://opentelemetry.io/docs/specs/semconv/http/http-spans/ "For HTTP status codes in the 4xx range span status MUST be left unset in case of SpanKind.SERVER and SHOULD be set to Error in case of SpanKind.CLIENT.", "For HTTP status codes in the 5xx range … span status SHOULD be set to Error." | — |
| 핵심 3 "OpenTelemetry는 처리한 에러를 그 작업의 span과 지표에 남기지 말라고 해요." | 맞음 | recording errors "Errors that were retried or handled (allowing an operation to complete gracefully) SHOULD NOT be recorded on spans or metrics that describe this operation." | — |
| 핵심 3 "앱 로그에는 처리한 예외도 남을 수 있어요. … 로그 줄 수로 낸 에러율은 부풀어요." | 맞음 | 위 규약은 span과 지표만 다뤄요. 로그는 앱이 남기는 대로라, 처리한 예외와 한 요청의 여러 줄이 섞일 수 있어요(그림의 가정). | — |
| 확인 1 4xx를 넣으면 서버가 멀쩡해도 에러율이 오름 | 맞음 | 핵심 2의 근거에서 나와요. | — |
| 확인 3 "Sentry는 스택 트레이스가 없으면 메시지로 묶어요. 주문 번호를 이어 붙인 메시지는 주문마다 다른 묶음이 돼요." | 맞음 | https://docs.sentry.io/concepts/data-management/event-grouping/ 스택 트레이스가 없으면 "the type and value of the exception", 그것도 없으면 "the message without any parameters. If that is not available, the grouping algorithm will use the full message attribute." 값을 이어 붙인 메시지는 메시지 자체가 주문마다 달라요. | — |
| 확인 4 New Relic 예상된 에러는 에러율·Apdex에서 빠지고, 무시한 에러는 버려짐 | 맞음 | New Relic "they won't affect the Apdex or error rate (or alert conditions based on error rate)", "the APM agent discards the error entirely" | — |
| 더 깊이 404 예: 있어야 할 자원이면 에러, 있는지 확인만 하면 에러 아님 | 맞음 | recording errors "an HTTP 404 \"Not Found\" status code indicates an error if the application expected the resource to be available. However, it is not an error when the application is simply checking whether the resource exists." | — |
| 더 깊이 실패하면 상태 Error, 에러 없이 끝나면 비워 둠 | 맞음 | "SHOULD set the span status code to `Error`", "Span Status Code MUST be left unset if the instrumented operation has ended without any errors." | — |
| 더 깊이 히스토그램 지표엔 실패한 작업에만 `error.type` | 맞음 | "This metric SHOULD include the `error.type` attribute. This enables users to derive throughput and error rates. Operations that complete successfully SHOULD NOT include the `error.type` attribute" | — |
| 더 깊이 HTTP `error.type` 값: 상태 코드 또는 예외 종류, Prometheus `error_type` | 맞음 | http-metrics "If the request fails with an error before response status code was sent or received, error.type SHOULD be set to exception type", "status code number (represented as a string)". 레이블 이름은 OTLP→Prometheus 변환에서 `.`이 `_`로 바뀌어요(이전 글들의 `http_server_request_duration_seconds`, `http_route`와 같은 규칙). | — |
| 더 깊이 `exception` 이벤트와 속성, 1.44.0에서 Deprecated → 로그로 | 맞음 | https://opentelemetry.io/docs/specs/semconv/exceptions/exceptions-spans/ (Semantic conventions 1.44.0) "Status: Deprecated", "Use Semantic conventions for exceptions in logs instead.", "The event name MUST be `exception`", `exception.type`·`exception.message`·`exception.stacktrace` | — |
| 더 깊이 Sentry 묶는 순서, 스택 트레이스 우선, 메시지 기반은 덜 믿을 만함 | 맞음 | Sentry "consider the fingerprint first, the stack trace next, then the exception, and then finally the message", "the grouping is effectively based entirely on the stack trace", "This grouping is a lot less reliable because of changing error messages." | — |

## 반영

- 핵심 2의 인과("정해서예요")를 빼고, RFC 9110의 정의를 함께 드는 문장으로 고쳤어요.
- 더 깊이의 "두 번 넘게"를 "여러 번"으로 고쳤어요.
