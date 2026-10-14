# 사실 검토: 트레이스가 끊겼을 때 어디부터 볼까

- 글: src/content/docs/apm/broken-traces.mdx
- 검토일: 2026-10-14
- 방식: 초안을 다 쓴 뒤 따로 검토했어요(서브 에이전트 없이). OpenTelemetry 문서·규약, W3C, Tempo, Elastic, Collector 문서 원문과 대조했어요.
- 결과: 수정 필요 2건 / 확인 11건

| 주장(인용) | 판정 | 근거(URL과 짧은 인용) | 수정 제안 |
| --- | --- | --- | --- |
| 2단계 "헤더가 없다면 그 앞 구간이 헤더를 버린 거예요." | 오해 소지 | 부른 쪽 클라이언트가 처음부터 헤더를 넣지 않았을 수도 있어요(계측되지 않은 클라이언트). | "부른 쪽 클라이언트나 사이의 프록시가 헤더를 빼먹은 거예요." |
| 2단계 "있는데 trace id가 부른 쪽과 다르다면, 받는 쪽이 헤더를 읽지 않은 거예요." | 조건이 느슨함 | 견줄 대상은 받는 쪽 span의 trace id와 헤더 값이에요. | "헤더는 있는데 받는 쪽 span의 trace id가 헤더와 다르다면 …" |
| 1단계 Tempo·Collector는 부른 쪽 없는 SERVER span의 부른 쪽을 `user`로 | 맞음 | https://grafana.com/docs/tempo/latest/metrics-from-traces/service_graphs/ "The root span has span.kind set to server or consumer, with no matching client span.", "the client node name defaults to user" | — |
| 2단계 OpenTelemetry 기본은 W3C `traceparent` | 맞음 | https://opentelemetry.io/docs/concepts/context-propagation/ "The default propagator uses the headers specified by the W3C TraceContext specification." | — |
| 2단계 `OTEL_PROPAGATORS` 기본 `tracecontext,baggage`, `b3` | 맞음 | https://opentelemetry.io/docs/specs/otel/configuration/sdk-environment-variables/ `OTEL_PROPAGATORS` … `"tracecontext,baggage"`, Known values `"b3"`: B3 Single | — |
| 2단계 `traceparent` 꼴과 예 | 맞음 | https://www.w3.org/TR/trace-context/ 예 `00-0af7651916cd43dd8448eb211c80319c-b7ad6b7169203331-01`. trace id 16바이트(16진수 32자), parent-id 8바이트(16자) | — |
| 3단계 Java 컨텍스트는 기본으로 스레드 로컬 | 맞음 | https://opentelemetry.io/docs/languages/java/api/ "ContextStorage: A mechanism for storing and retrieving the current context, defaulting to thread local." | — |
| 3단계 `wrap(executorService)` | 맞음 | 같은 문서 예 `context.wrap(executorService).submit(ContextUsage::runnable);` | — |
| 3단계 메시지 큐는 메시지에 컨텍스트를 실어야 함 | 맞음 | 같은 개념 문서 "Propagation is the mechanism that moves context between services and processes. It serializes or deserializes the context object" | — |
| 4단계 기본 샘플러 `parentbased_always_on`은 부모 결정을 따름 | 맞음 | 환경 변수 문서 `OTEL_TRACES_SAMPLER` 기본 `"parentbased_always_on"`. ParentBased는 부모 결정(sampled 플래그)을 따라요(foundations/logs-metrics-traces 검토 근거). | — |
| 4단계 tail은 같은 인스턴스, load balancing exporter `traceID` | 맞음 | tail sampling processor "All spans for a given trace MUST be received by the same collector instance", load balancing exporter "The options for `routing_key` are: `service`, `traceID`, …" | — |
| 확인 2 스케줄러·프런트엔드·curl도 `user` | 맞음 | Tempo "initiated by an external system that isn't instrumented, like a scheduler, a frontend application, or an engineer using curl" | — |
| 확인 3 공개 서비스는 restart 전략 | 맞음 | https://www.elastic.co/docs/solutions/observability/apm/transaction-sampling "This can be helpful if an Elastic-monitored service is publicly exposed, and you do not want tracing data to possibly be spoofed by user requests." | — |

## 반영

- 2단계의 두 문장을 위 수정 제안대로 고쳤어요.
