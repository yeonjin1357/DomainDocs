# 사실 검토: 에러가 늘었을 때 어디부터 볼까

- 글: src/content/docs/apm/error-spike.mdx
- 검토일: 2026-10-14
- 방식: 초안을 다 쓴 뒤 따로 검토했어요(서브 에이전트 없이). 질의는 promtool 3.15.0으로 시험 입력을 만들어 돌렸고(`scratchpad/b2prom/error-test.yml`), 문서 원문과 대조했어요.
- 결과: 수정 필요 2건 / 확인 10건

| 주장(인용) | 판정 | 근거(URL과 짧은 인용) | 수정 제안 |
| --- | --- | --- | --- |
| 3단계 "1단계 질의의 앞부분을 `sum by (http_route, instance)`로 바꿔, 에러가 몰린 줄을 찾아요." | 틀림 | promtool: 분자만 `sum by (http_route, instance)`로 나누면 분모(레이블 없음)와 짝이 맞지 않아 결과가 비어요. 분모도 같은 레이블로 나누면 서버 a의 `/orders/{id}`가 300 / 3,050 ≈ 0.098로 나와요. | 분자·분모를 모두 나눈 질의를 싣고, 한쪽만 나누면 빈 결과라는 설명을 더함 |
| 1단계 "서버 쪽 지표라서 5xx만 들어가고 4xx는 빠져요." | 오해 소지 | `error_type`은 응답 전에 실패한 요청에도 예외 종류로 붙어요(http-metrics "If the request fails with an error before response status code was sent or received, error.type SHOULD be set to exception type"). "5xx만"이 아니에요. | "서버 쪽 지표라서 4xx 응답에는 붙지 않아요." |
| 1단계 요청 6,000 → 60,000건, 에러 30 → 300건이면 0.5% 그대로 / 요청 그대로면 5% | 맞음 | 30 / 6,000 = 300 / 60,000 = 0.005. 300 / 6,000 = 0.05 | — |
| 1단계 질의(에러율) | 맞음 | promtool: 2xx 5,500 + 4xx 200 + 에러 300 입력에서 0.05. 4xx 줄은 `error_type`이 없어 분자에서 빠져요. | — |
| 1단계 "`error_type`은 … 실패한 요청에만 붙이는 레이블", 4xx엔 붙지 않음 | 맞음 | recording errors "Operations that complete successfully SHOULD NOT include the `error.type` attribute". http-metrics는 상태 코드가 "indicates an error according to HTTP span status definition"일 때만 붙이고, 서버 span에서 4xx는 에러가 아니에요(http-spans "4xx range span status MUST be left unset in case of SpanKind.SERVER"). | — |
| 2단계 SRE Book: 최근 변경에서 시작, 피해부터 멈춤 | 맞음 | https://sre.google/sre-book/effective-troubleshooting/ "Recent changes to a system can be a productive place to start identifying what's going wrong.", "Stopping the bleeding should be your first priority" | — |
| 2단계 질의(종류별) | 맞음 | promtool: `{error_type="500"}` 4, `{error_type="java.net.SocketTimeoutException"}` 1 | — |
| 2단계 "`error_type`은 응답이 에러면 `500` 같은 상태 코드이고, 응답을 보내기 전에 실패했으면 예외 종류예요." | 맞음 | http-metrics "status code number (represented as a string)", "exception type (its fully-qualified class name, if applicable)" | — |
| 3단계 "에러가 없는 줄은 0이 아니라 아예 나오지 않아요." | 맞음 | promtool: 서버 b와 `/orders` 줄은 결과에 없어요(분자 시계열이 없어서). | — |
| 4단계 "예외로 실패한 span에는 예외 메시지가 상태 설명(status description)으로 담겨요." | 맞음 | recording errors "When the operation fails with an exception, the span status description SHOULD be set to the exception message." | — |
| 확인 1 임계값 분당 300건, 새벽 요청 분당 200건 | 맞음 | 모두 실패해도 200 < 300 | — |
| 확인 2 head 샘플링 10%면 에러 트레이스도 90% 빠짐 | 맞음 | head 샘플링은 결과를 보기 전에 정해요(foundations/logs-metrics-traces 사실 검토의 OpenTelemetry Sampling 근거). | — |

## 반영

- 3단계에 엔드포인트·서버별 에러율 질의를 분자·분모 모두 `sum by (http_route, instance)`로 실었어요. 한쪽만 나누면 빈 결과이고, 에러가 없는 줄은 나오지 않는다는 설명을 더했어요.
- 1단계 설명을 "4xx 응답에는 붙지 않아요"로 고쳤어요.
