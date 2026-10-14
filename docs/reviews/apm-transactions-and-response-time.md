# 사실 검토: 트랜잭션과 응답시간

- 글: src/content/docs/apm/transactions-and-response-time.mdx
- 검토일: 2026-10-14
- 방식: 초안을 다 쓴 뒤 따로 검토했어요(서브 에이전트 없이). 주장을 뽑아 원문 인용과 대조했고, 숫자는 node로 다시 계산했어요.
- 결과: 수정 필요 2건 / 확인 21건

| 주장(인용) | 판정 | 근거(URL과 짧은 인용) | 수정 제안 |
| --- | --- | --- | --- |
| 핵심 1 "OpenTelemetry에선 서버 쪽 처리를 담은 SERVER span이 이 역할을 해요." | 오해 소지 | https://opentelemetry.io/docs/specs/otel/trace/api/ "`SERVER` indicates that the span covers server-side handling of a remote request while the client awaits a response." 명세에는 "트랜잭션"이라는 말이 없어서, "이 역할"은 제품 쪽 해석이에요. | "OpenTelemetry는 서버가 요청을 처리한 구간을 SERVER span으로 기록해요." |
| 핵심 3 "이렇게 나눠 더하는 건 평균일 때만 맞아요." | 오해 소지 | 합계도 구간별로 더하면 전체와 같아요. 확인 4는 "평균이나 합계"라고 해서 둘이 어긋나요. | "평균이나 합계일 때만 맞아요." |
| 핵심 1 "APM은 요청이 서비스에 들어와 응답이 나갈 때까지를 트랜잭션 하나로 재요." "배치 작업처럼 요청이 아닌 일도 트랜잭션으로 재는 제품이 있어요." | 맞음 | https://www.elastic.co/docs/solutions/observability/apm/transactions "You can think of transactions as the highest level of work you're measuring within a service." 예: "Request to your server", "Batch job", "Background job" | — |
| 핵심 1 "트랜잭션 이름은 `GET /orders/{id}`처럼 경로 틀로 묶어요." | 맞음 | Elastic 같은 쪽 "`name` should be a generic designation of a transaction", 예 "`GET /users/:id`". https://opentelemetry.io/docs/specs/semconv/http/http-spans/ "HTTP span names SHOULD be `{method} {target}`", target은 "`http.route` for HTTP Server spans" | — |
| 핵심 2 "트랜잭션 시간은 앱이 요청을 받아 처리한 시간이에요. 앞단 서버를 거쳐 앱에 닿기까지 기다린 시간, 네트워크 시간, 브라우저가 화면을 그리는 시간은 빠져요." "New Relic도 페이지 로드 시간을 이렇게 나누고…" | 맞음 | https://docs.newrelic.com/docs/browser/new-relic-browser/page-load-timing-resources/page-load-timing-process/ 구간: request queuing, "The web application time includes the time spent on the application server.", Network "does not include time on the server", DOM processing, Page rendering. request queuing은 "the time between a request entering your production systems and it reaching your application." | — |
| 핵심 3 "트랜잭션 시간은 DB 조회, 외부 API 호출 같은 하위 구간과, 그 밖에 앱 코드가 쓴 시간으로 나뉘어요." | 맞음 | https://www.elastic.co/docs/solutions/observability/apm/transactions-ui "is your app spending time in external calls, database processing, or application code execution?" | — |
| 핵심 3 "구간별 p95를 더한 값은 전체 p95가 아니에요." / 더 깊이 예시(DB p95 100ms, 외부 API p95 100ms, 합 200ms, 전체 p95 1,100ms, 평균 145+145=290ms) | 맞음 | node로 계산: 100건(90건 100+100, 5건 1,000+100, 5건 100+1,000)을 줄 세운 95번째 값. `p95 db 100 api 100 sum 200 total p95 1100`, `avg db 145 api 145 sum 290 avg total 290`. 95번째 값 정의는 percentiles 글과 같아요. | — |
| 대시보드 600 = 300 + 180 + 120, 50%·30%·20% | 맞음 | 계산: 300/600 = 50%, 180/600 = 30%, 120/600 = 20%. 캡션 "평균이라서 세 구간을 더하면 전체와 같아요"는 위 행과 같아요. | — |
| 확인 1 "실제 경로가 들어갔다면 … 지표의 시계열도 끝없이 늘어요." | 맞음 | 명세 "Instrumentation MUST NOT default to using URI path as a `{target}`." `http.route` "MUST be low-cardinality". 시계열이 느는 이유는 foundations/cardinality-explosion과 같아요. | — |
| 확인 2 "몇 ms짜리 요청이 많으면 평균이 내려가서…" | 맞음 | 산술. foundations/percentiles의 평균 설명과 같아요. | — |
| 확인 3 "서버 트랜잭션만으로는 이 시간이 보이지 않아요." | 맞음 | 위 New Relic 구간 정의. 네트워크·DOM·렌더링은 브라우저 쪽 측정이에요. | — |
| 확인 4 "구간 비중은 평균이나 합계로 나눠야 맞아요." | 맞음 | 위 p95 계산. Elastic도 구간별 지표로 "the average duration and percentage of time"을 계산한다고 해요(https://www.elastic.co/docs/solutions/observability/apm/metrics). | — |
| 더 깊이 "Elastic APM은 트랜잭션을 서비스 안에서 재는 가장 높은 단위의 일이라고 해요. 서버로 온 요청, 배치 작업, 백그라운드 작업이 그 예예요." | 맞음 | 위 Elastic 인용. | — |
| 더 깊이 "OpenTelemetry의 SERVER span은 클라이언트가 응답을 기다리는 동안 원격 요청을 서버 쪽에서 처리하는 구간이에요." | 맞음 | 위 SpanKind 인용. | — |
| 더 깊이 "트레이스마다 부모가 없는 root span이 하나 있어요. 다른 서비스가 부른 요청이면 SERVER span에도 부모가 있어서, 트랜잭션이 늘 root span은 아니에요." | 맞음 | Trace API "A span is said to be a *root span* if it does not have a parent.", "Each trace includes a single root span". 부른 쪽의 CLIENT span이 부모가 되는 건 부모-자식 정의("causally related operations")에서 나와요. | — |
| 더 깊이 "HTTP 서버 span 이름은 `{method} {http.route}`로 써요. … 없으면 `{method}`만 써요. 명세는 URI 경로를 이름의 기본값으로 쓰지 말라고 해요." | 맞음 | 명세 "If there is no (low-cardinality) `{target}` available, HTTP span names SHOULD be `{method}`." "MUST NOT default to using URI path". `http.route` "The matched route template for the request." | — |
| 더 깊이 "New Relic은 요청이 운영 시스템에 들어와 앱에 닿기까지의 시간을 request queuing이라고 불러요. 앞단 웹 서버(Nginx 등)가 남긴 시각으로 재요. 실제 대기열이 아니라 부하 분산이나 내부 네트워크 시간일 수도 있어요." | 맞음 | https://docs.newrelic.com/docs/apm/applications-menu/features/request-queuing-tracking-front-end-time/ "APM tracks the time after a request enters your production systems and before it reaches your application.", "New Relic agents rely on a timestamp set by the frontend server.", "may or may not include an actual queue", load balancing, internal network latency. | — |
| 더 깊이 "Elastic APM은 구간 종류(DB, 외부 호출 등)별 시간을 따로 모아, 평균 시간과 비중을 계산해요." | 맞음 | metrics 쪽 "broken down by span type", "calculate the average duration and percentage of time spent on each type of operation" | — |
| 더 깊이 "어느 구간에도 속하지 않은 시간은 "app"으로 묶어요. 계측되지 않은 작업이 있으면 이 몫이 커져요." | 맞음 | transactions-ui "\"app\" indicates that something was happening within the application, but we're not sure exactly what.", "a sign that the APM agent does not have auto-instrumentation for whatever was happening during that time." | — |
| 더 깊이 "비동기로 동시에 도는 구간이 있으면, 구간 시간을 모두 더한 값이 트랜잭션 시간보다 클 수 있어요." | 맞음 | transactions-ui "if you have asynchronous spans, the sum of all span times might exceed the duration of the transaction." | — |
| sources 7개 | 맞음 | 모두 열리고, 글이 쓴 내용이 들어 있어요. | — |

## 반영

- 핵심 1 SERVER span 문장: 반영. 명세 정의대로 "서버가 요청을 처리한 구간을 SERVER span으로 기록해요"로 바꿨어요.
- 핵심 3 "평균일 때만": 반영. "평균이나 합계일 때만"으로 확인 4와 맞췄어요.
- 가독성 점검(가이드 7장): "앞단 서버"에 "로드밸런서 같은"을 붙였어요. 핵심은 모두 5문장 이하, 결론형 제목이에요. 용어(APM, OpenTelemetry, span, p95, root span, `http.route`, request queuing)는 처음 쓸 때 풀거나 링크했어요.
