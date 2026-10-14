# 사실 검토: Apdex 점수

- 글: src/content/docs/apm/apdex.mdx
- 검토일: 2026-10-14
- 방식: 초안을 다 쓴 뒤 따로 검토했어요(서브 에이전트 없이). 명세 PDF(pypdf로 글자 추출)와 문서 원문을 대조했고, 질의는 promtool 3.15.0으로, 숫자는 손계산과 node로 확인했어요.
- 결과: 수정 필요 1건 / 확인 17건

| 주장(인용) | 판정 | 근거(URL과 짧은 인용) | 수정 제안 |
| --- | --- | --- | --- |
| 더 깊이 "F는 늘 4T예요." | 근거 없는 단정 | 명세 1.1은 "The value of F is four times the value T."라고 하지만, https://www.apdex.org/ 는 "the rules governing T and F relationships have become flexible in order to accommodate new uses"라고 해요. | "F는 T의 네 배예요." + 지금은 관계가 유연하다는 문장과 출처 추가 |
| 핵심 1 "Apdex는 응답시간을 만족도 점수로 바꾸는 공개 표준이에요." | 맞음 | apdex.org "Apdex (Application Performance Index) is an open standard". 명세 "Apdex is a numerical measure of user satisfaction with the performance of enterprise applications" | — |
| 핵심 1 "T 이하면 만족, T 초과 4T 이하면 허용, 4T를 넘으면 불만" | 맞음 | 명세 2.5 "Satisfied Zone = zero to T. Tolerating Zone = Greater than T to F. Frustrated Zone = Greater than F" / New Relic "less than or equal to T", "greater than T and less than or equal to 4T" | — |
| 핵심 1 "점수는 (만족 + 허용 ÷ 2) ÷ 전체 요청 수예요." / 그림 0.85 | 맞음 | 명세 4.1 식(Satisfied count + Tolerating count / 2) / Total samples. 명세 예 "80% … satisfied and 10% are tolerating … the index is 0.85". 손계산 (800 + 50) / 1,000 = 0.85 | — |
| 핵심 1 "모두 만족이면 1, 모두 불만이면 0" | 맞음 | 명세 2.6 "An index of zero means that all of the samples were within the frustrated zone. An index of 1 means … satisfied zone." | — |
| 핵심 1 "New Relic과 Datadog은 에러가 난 요청을 빨리 끝났어도 불만으로 세요." | 맞음 | New Relic "greater than 4T or the request returns a server-side error", "a frustrating response, regardless of its return speed". Datadog "Frustrated requests have a response time above 4T or returns an error." | — |
| 핵심 2 "명세는 점수 옆에 T를 `0.85 [0.5]`처럼 함께 쓰라고 해요." | 맞음 | 명세 5.1 "The value of T must be clearly displayed in association with the Apdex score." 예 "0.85 [5.5], 1.00 [8.0]*" | — |
| 핵심 2 "T는 도구를 쓰는 사람이 정해요." | 맞음 | 명세 3.3 "The technician (operator of the tool) must be able to set the target threshold, T". New Relic "is arbitrary and is selected by the user" | — |
| 핵심 2 "명세는 4초를 권하고, New Relic의 앱 서버 기본값은 0.5초예요." | 맞음 | 명세 3.3 "It is recommended that the default target threshold value, T, be set to 4 seconds." New Relic "The default Apdex T threshold for an application server is 0.5 seconds." | — |
| 핵심 3 "4T를 넘은 요청은 3초든 30초든 같은 불만 한 건이에요." | 맞음 | 식에서 불만은 0을 곱해요(명세 "measurements in the frustrated zone are counted in the number of total user samples in the denominator"). T 0.5초면 4T는 2초라 3초·30초 모두 불만이에요. | — |
| 확인 1 "빨리 끝난 500 에러가 만족으로 들어가 점수를 올려요. Prometheus 문서의 Apdex 질의 예시도 실패 요청은 빼지 않았다고 밝혀요." | 맞음 | https://prometheus.io/docs/practices/histograms/ "the above expressions do not explicitly exclude failed requests from the satisfied and tolerated parts". promtool: 같은 입력에서 에러를 빼면 0.85, 빼지 않으면 0.895 | — |
| 확인 2 평균 0.725, 모아 계산 0.905 | 맞음 | (0.95 + 0.50) / 2 = 0.725. 만족 + 허용 ÷ 2는 각각 8,550과 500이라 (8,550 + 500) / 10,000 = 0.905 | — |
| 확인 3 "T가 0.5초면 2초 경계가 필요한데, OpenTelemetry HTTP 지표 규약이 권하는 경계에는 2초가 없어요." | 맞음 | https://opentelemetry.io/docs/specs/semconv/http/http-metrics/ "[ 0.005, 0.01, 0.025, 0.05, 0.075, 0.1, 0.25, 0.5, 0.75, 1, 2.5, 5, 7.5, 10 ]". Prometheus "you _must_ have buckets present at the exact boundaries" | — |
| 확인 4 "요청이 10건이면 … 0.1씩 떨어져요. 명세는 표본이 100개보다 적은 점수에 *를 붙이라고 해요." | 맞음 | 만족 1건이 불만이 되면 1/10 = 0.1이 빠져요. 명세 5.2 "A small report group is defined as any number of samples between 0 and 99", 예 "0.80 [4.0]*" | — |
| 더 깊이 소수 둘째 자리, 0.995 이상은 1.00, 표본 없으면 NS | 맞음 | 명세 5.1 "results equal to or greater than 0.995 round to 1.00", 5.2 "No Samples … NS [4.0]" | — |
| 더 깊이 T는 초 단위, 유효숫자 두 자리 | 맞음 | 명세 3.3 "a positive decimal value in seconds, having no more than two significant digits of granularity" | — |
| 더 깊이 등급 이름(선택 기능) | 맞음 | 명세 5.4 "This is an optional feature", Table 3: 0.94~1.00 Excellent, 0.85~0.93 Good, 0.70~0.84 Fair, 0.50~0.69 Poor, 0.00~0.49 Unacceptable | — |
| 더 깊이 사용자 중단·서버 중단·앱 에러(404) | 맞음 | 명세 4.2 "A user abort occurs when a user enters a new inquiry before the system responds", "user aborts can fall into any of the satisfied, tolerating, frustrated zones", "Server aborts (e.g., TCP closes within a Task) are counted as a frustrated sample", "application errors (e.g. Web page 404 replies) are counted as frustrated samples" | — |
| 더 깊이 New Relic 예상된 에러, 분당 100건 | 맞음 | New Relic(expected errors) "they won't affect the Apdex or error rate". New Relic(Apdex) "If your app's throughput is less than 100 RPM, not enough data is collected to determine a stable score." | — |
| 더 깊이 질의, `le="1.0"`, `error_type=""` | 맞음 | promtool `scratchpad/b2prom/apdex-test.yml`: 기대값 0.85 통과, `le="1"`은 빈 결과. OpenTelemetry recording errors "Operations that complete successfully SHOULD NOT include the `error.type` attribute" | — |

## 반영

- 더 깊이의 "F는 늘 4T예요."를 "F는 T의 네 배예요."로 고치고, 지금의 공식 사이트는 T와 F의 관계를 유연하게 정한다는 문장과 출처(apdex.org)를 더했어요.
