# 사실 검토: 응답이 느려졌을 때 어디부터 볼까

- 글: src/content/docs/apm/slow-response.mdx
- 검토일: 2026-10-14
- 방식: 초안을 다 쓴 뒤 따로 검토했어요(서브 에이전트 없이). 질의 세 개와 확인 2의 숫자는 promtool 3.15.0 `test rules`로 돌렸어요.
- 결과: 수정 필요 1건 / 확인 11건

| 주장(인용) | 판정 | 근거(URL과 짧은 인용) | 수정 제안 |
| --- | --- | --- | --- |
| 2단계 확인 방법 "활성 트랜잭션이 일정한 값에 붙어 평평하다면 스레드 같은 상한에 걸린 거예요." | 오해 소지 | 부하가 일정하면 상한과 관계없이 평평할 수 있어요. apm/throughput-and-concurrency 확인 2도 "의심하세요"라고 해요. | "응답시간이 오르는데 활성 트랜잭션이 일정한 값에 붙어 평평하다면, 스레드 같은 상한에 걸렸는지 의심해요." |
| 1단계 "Google SRE Book도 문제를 나눠 좁혀 가는 방법을 쓸모 있는 기본기로 꼽아요." | 맞음 | https://sre.google/sre-book/effective-troubleshooting/ "Dividing and conquering is a very useful general-purpose solution technique." | — |
| 1단계 질의(엔드포인트별 p95)와 "`http_route`는 경로 틀이 든 레이블" | 맞음 | promtool `check rules` SUCCESS. `test rules`: /orders/{id}(0.5초 이하 90%, 나머지 0.5~2.5초) → 1.5, /cart(모두 0.5초 이하) → 0.475, 다른 job은 섞이지 않음. `http.route`는 "The matched route template for the request."(OpenTelemetry HTTP span 규약) | — |
| 1단계 "지표 이름은 OpenTelemetry HTTP 지표를 Prometheus 이름으로 바꾼 꼴이에요." | 맞음 | https://opentelemetry.io/docs/specs/semconv/http/http-metrics/ `http.server.request.duration`(단위 s), `http.server.active_requests`. 점을 밑줄로, 단위를 `_seconds`로 붙인 이름이에요. foundations/p99-looks-wrong과 같은 이름이에요. | — |
| 2단계 "Google SRE Book은 최근 변경을 원인 찾기를 시작하기 좋은 곳으로 꼽아요. 문제 해결의 첫째 일로는 피해 멈추기를 들어요." | 맞음 | 같은 장 "Recent changes to a system can be a productive place to start identifying what's going wrong." Triage "Stopping the bleeding should be your first priority." | — |
| 2단계 "요청이 늘면서 함께 느려졌다면 … 포화 쪽이에요. 요청은 그대로인데 느려졌다면 그 시각의 변경이나 의존 서비스를 먼저 봐요." | 맞음 | apm/throughput-and-concurrency의 리틀의 법칙 설명과 같아요. 변경을 먼저 보는 근거는 위 행이에요. | — |
| 2단계 질의 두 개(처리량, 활성 트랜잭션) | 맞음 | promtool `test rules`: 처리량 20(초당, 두 엔드포인트 10 + 10, `job="web"`은 빠짐), 활성 50(서버 a 30 + b 20). | — |
| 3단계 "그래프의 exemplar를 눌러 그 시각의 트레이스로 바로 건너갈 수도 있어요." | 맞음 | foundations/logs-metrics-traces 사실 검토의 Grafana exemplar 근거와 같아요. exemplar 저장이 켜져 있어야 해서 "수도 있어요"로 썼어요. | — |
| 3단계 "긴 막대 하나, 줄지어 반복된 막대, 막대 없는 빈칸이 후보예요." | 맞음 | apm/trace-waterfall 핵심 1~3과 같아요. | — |
| 4단계 "Google SRE Book은 함께 움직였다고 원인은 아니라고 경고해요." | 맞음 | 같은 장 "we should remember that correlation is not causation." | — |
| 4단계 구간별로 볼 지표(DB: 느린 질의·잠금·연결 수, 외부 API: 상대 응답시간·에러율, 빈칸: USE) | 맞음 | 권고예요. 빈칸이 앱 코드나 계측되지 않은 작업이라는 근거는 apm/trace-waterfall, USE는 foundations/red-and-use와 같아요. | — |
| 확인 2 "요청 수가 비슷한 빠른 엔드포인트와 섞이면, 1.5초로 느려진 엔드포인트도 전체 p95는 0.5초로 보여요." | 맞음 | 같은 시험 데이터로 `histogram_quantile(0.95, sum by (le) (rate(...{job="order-api"}[5m])))` → 0.5. 두 엔드포인트가 초당 10건씩이에요. | — |

## 반영

- 2단계 확인 방법을 위 제안대로 고쳤어요.
- 가독성 점검(가이드 7장): 단계마다 결론이 먼저 오고 "확인 방법"이 있어요. 엔드포인트는 "(트랜잭션 이름)"으로 풀고, p95·처리량·워터폴·exemplar·USE는 `<Term>`으로 이었어요.
