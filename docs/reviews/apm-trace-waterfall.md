# 사실 검토: 트레이스 워터폴 읽기

- 글: src/content/docs/apm/trace-waterfall.mdx
- 검토일: 2026-10-14
- 방식: 초안을 다 쓴 뒤 따로 검토했어요(서브 에이전트 없이). 주장을 원문 인용과 대조했고, 그림 숫자는 node로 계산했어요.
- 결과: 수정 필요 5건 / 확인 14건

| 주장(인용) | 판정 | 근거(URL과 짧은 인용) | 수정 제안 |
| --- | --- | --- | --- |
| 핵심 1 "들여 쓴 줄은 바로 위 부모 구간이 부른 자식 구간이에요." | 오해 소지 | 부모는 바로 위 줄이 아닐 수 있어요. 그림에서도 자식 열 줄의 부모는 모두 맨 위 줄이에요. Grafana 문서는 들여쓰기를 따로 정의하지 않고, "usually has a reference to a parent span"과 "Expand children"만 말해요. | "자식 구간은 그것을 부른 부모 구간 아래에 들여 써요." |
| 핵심 1 "맨 위 줄은 이 서비스의 트랜잭션이라, 그 막대 길이가 응답시간이에요." | 오해 소지 | 브라우저나 다른 서비스가 트레이스를 시작했다면 맨 위 줄은 그쪽 span이에요. 이 문장은 그림에서만 맞아요. | "그림의 맨 위 줄은 …" |
| 캡션 "마지막 200ms는 하위 구간이 없는 앱 코드 시간이에요." | 오해 소지 | 핵심 3은 빈칸이 "앱 코드가 직접 쓴 시간이거나, 계측되지 않은 작업"이라고 해서 둘이 어긋나요. | "마지막 200ms는 하위 구간이 없는 빈칸이에요." |
| 더 깊이 "CLIENT 막대가 SERVER 막대보다 긴 만큼이 오가는 데 쓴 시간이에요." | 오해 소지 | 상대 서비스의 SERVER span도 상대 앞단 대기(로드밸런서 등)를 담지 않아요(apm/transactions-and-response-time 사실 검토의 New Relic request queuing 근거). 확인 4는 "네트워크나 상대 앞단에서 기다린 시간"이라 둘이 어긋나요. | "오가는 데와 상대 앞단에서 기다리는 데 쓴 시간이에요." |
| 더 깊이 "반복 앞에 DB span이 하나 더 있어야 하는데, 목록을 가져온 첫 질의예요." | 오해 소지 | Sentry는 "There must be at least one database span that precedes the repeating spans."라고만 해요. 그 span이 목록 질의라는 건 흔한 경우일 뿐이에요. | "… 보통 목록을 가져온 첫 질의예요." |
| 핵심 1 "워터폴은 트레이스 안의 span을 줄 세운 그림이에요. 막대가 시작하는 위치는 트레이스 시작부터 지난 시간이고, 막대 길이는 그 구간이 걸린 시간이에요." | 맞음 | https://grafana.com/docs/grafana/latest/visualizations/explore/trace-integration/ span은 "a unit of work within a trace that has a start time relative to the beginning of the trace, a duration and an operation name", "Span duration bar": "Visual representation of the operation duration within the trace." | — |
| 핵심 2 "한 번에 75ms … 같은 질의가 8번 이어져 600ms로, 응답시간의 절반이에요." / 캡션 "1,200ms 중 같은 질의 8번이 600ms" | 맞음 | node: 75 × 8 = 600, 600 / 1,200 = 50%. 시작 시각 60, 137, 214, 291, 368, 445, 522, 599는 75ms씩, 2ms 간격이라 겹치지 않아요. 마지막 질의는 674ms에 끝나요. | — |
| 핵심 2 "목록을 가져온 뒤 항목마다 질의를 하나씩 보내는 N+1 질의예요. 이럴 땐 질의를 하나로 묶어 한 번에 가져와요." | 맞음 | https://docs.sentry.io/product/issues/issue-details/performance-issues/n-one-queries/ "the application makes database queries in a loop, instead of making a single query that returns or modifies all the information at once." | — |
| 핵심 3 "자식 막대가 없는 빈칸은 앱 코드가 직접 쓴 시간이거나, 계측되지 않은 작업이에요. 그림의 마지막 200ms가 그래요." | 맞음 | https://www.elastic.co/docs/solutions/observability/apm/transactions-ui "\"app\" indicates that something was happening within the application, but we're not sure exactly what.", "a sign that the APM agent does not have auto-instrumentation". 그림: 결제 호출이 1,000ms에 끝나고 트랜잭션은 1,200ms에 끝나요. | — |
| 그림 전체: 자식 합 40 + 600 + 300 = 940ms, 남는 260ms | 맞음 | node: `children 940 self 260`. 빈칸은 0~10, 50~60, 질의 사이 2ms × 7, 674~700, 1,000~1,200이에요. | — |
| 확인 2 "동시에 도는 구간이 있으면 합이 전체보다 커져요." | 맞음 | Elastic 같은 쪽 "if you have asynchronous spans, the sum of all span times might exceed the duration of the transaction." | — |
| 확인 4 "그 차이는 네트워크나 상대 앞단에서 기다린 시간이에요." | 맞음 | https://opentelemetry.io/docs/specs/otel/trace/api/ CLIENT는 "a request to a remote service where the client awaits a response", SERVER는 "server-side handling of a remote request". 앞단 대기는 위 New Relic 근거. | — |
| 더 깊이 "span은 부모가 없거나 하나이고, 자식은 여럿일 수 있어요. 부모가 없는 span이 트레이스의 root span이에요." | 맞음 | Trace API "Each span has zero or one parent span and zero or more child spans", "A span is said to be a *root span* if it does not have a parent." | — |
| 더 깊이 SERVER·CLIENT·INTERNAL 설명 | 맞음 | Trace API SpanKind 정의. INTERNAL "represents an internal operation within an application". | — |
| 더 깊이 "상대 서비스도 계측돼 있고 trace id를 넘겨받으면, 우리 CLIENT span 아래에 상대의 SERVER span이 자식으로 붙어요." | 맞음 | `traceparent`가 trace id와 부른 쪽 span id(부모 id)를 넘겨서예요. foundations/logs-metrics-traces 더 깊이 「traceparent 읽기」와 같은 설명이에요. | — |
| 더 깊이 "Grafana는 … critical path를 막대 위에 진하게 표시해요. 이 경로 밖의 span은 트레이스 시간을 늘리지 않는다고 해요." | 맞음 | Grafana "highlights the trace's critical path with a darker segment.", "Spans outside the critical path do not increase the trace duration." | — |
| 더 깊이 "동시에 돈 구간 중 짧은 쪽을 줄여도 응답시간은 그대로예요." | 맞음 | 위 인용에서 나와요. 나란히 돈 두 구간 중 긴 쪽이 끝나야 부모가 이어져요. | — |
| 더 깊이 Sentry 기준: 비슷한 DB span이 겹치지 않고 차례로, 합 50ms 초과, 개수 기준(보통 5개) 초과 | 맞음 | Sentry "a set of sequential, non-overlapping database spans with similar descriptions", "Total duration of involved spans must exceed `50ms`.", "must exceed a threshold (usually five spans)". 그림(8개, 600ms)도 이 기준에 들어요. | — |
| 더 깊이 `select_related`(읽기), `bulk_create`(쓰기) | 맞음 | 같은 문서의 고치는 법. | — |

## 반영

- 위 5건을 모두 반영했어요.
- 가독성 점검(가이드 7장): 핵심 제목은 모두 결론형이고 5문장 이하예요. 트레이스·트랜잭션은 `<Term>`으로 잇고, 프로파일러와 critical path는 처음 쓸 때 풀었어요. 그림은 새 `Waterfall` 컴포넌트로 그렸어요.
