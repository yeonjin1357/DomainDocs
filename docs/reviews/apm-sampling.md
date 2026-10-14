# 사실 검토: 샘플링과 APM 숫자

- 글: src/content/docs/apm/sampling.mdx
- 검토일: 2026-10-14
- 방식: 초안을 다 쓴 뒤 따로 검토했어요(서브 에이전트 없이). 문서 원문을 내려받아 대조했고, 숫자는 손계산으로 확인했어요.
- 결과: 수정 필요 2건 / 확인 12건

| 주장(인용) | 판정 | 근거(URL과 짧은 인용) | 수정 제안 |
| --- | --- | --- | --- |
| 핵심 2 "tail 샘플링은 에러와 느린 트레이스를 더 많이 남겨요." | 근거 없는 단정 | tail 샘플링이 무엇을 남길지는 정책에 달렸어요. tail sampling processor "samples traces based on a set of defined policies" | "… 더 남기게 짤 수 있어요. 그러면 …" |
| 확인 3 "OpenTelemetry SDK에서 head 샘플링을 한다면, 거기서 만든 APM 지표는 샘플된 요청만으로 센 값이에요." | 오해 소지 | span으로 만든 지표만 그래요. 계측 라이브러리의 지표는 샘플링과 따로 기록돼요(https://opentelemetry.io/docs/specs/otel/metrics/sdk/ TraceBased 필터는 exemplar 후보만 "recorded in the context of a sampled parent span"으로 고르고, 측정 자체는 고르지 않아요). | "span으로 만든 APM 지표는 …" + HTTP 지표로 보라는 문장과 출처 추가 |
| 그림·더 깊이 0.5% → 4.8% | 맞음 | 50 / 10,000 = 0.005. 9,950 × 0.1 = 995, 50 / (50 + 995) = 0.0478 | — |
| 핵심 1 트레이스 개수로 센 처리량은 1/10 | 맞음 | head 샘플링은 트레이스를 통째로 고르거나 버려요(foundations/logs-metrics-traces 검토 근거). | — |
| 핵심 1 Elastic 역수 가중, 5%면 20건 | 맞음 | https://www.elastic.co/docs/solutions/observability/apm/transaction-sampling "metrics are weighted by the inverse sampling rate of the head-based sampling policy … if your head-based sampling rate is 5%, each sampled trace is counted as 20." | — |
| 핵심 1 adjusted count = 1/확률 | 맞음 | https://opentelemetry.io/docs/specs/otel/trace/tracestate-probability-sampling/ "The adjusted count indicates the approximate quantity of items from the population that this sample represents. It is equal to 1/probability." | — |
| 핵심 2 확률로 고르지 않은 span에는 보정 개수가 없음 | 맞음 | 같은 문서 "Adjusted count is not defined for spans that were obtained via non-probabilistic sampling (a sampled span with no th value)." | — |
| 핵심 3 Datadog은 모든 트래픽으로 지표 계산 | 맞음 | https://docs.datadoghq.com/tracing/metrics/metrics_namespace/ "They are calculated based on 100% of the application's traffic, regardless of any trace ingestion sampling configuration." | — |
| 핵심 3 Elastic tail 샘플링이면 모든 이벤트로 | 맞음 | Elastic "Tail-based sampling: Metrics are calculated based on all events, regardless of whether they are ultimately sampled or not." | — |
| 확인 2 span 지표 connector를 샘플링 앞에 | 맞음 | Datadog "place the span_metrics connector before any sampling processor, such as tail_sampling." | — |
| 확인 3 Datadog: SDK 샘플링이면 샘플된 데이터로 | 맞음 | Datadog "If your applications are instrumented with OpenTelemetry libraries and sampling is configured at the SDK level, APM metrics are calculated from the sampled data." | — |
| 확인 4 비율이 낮을수록 오차 | 맞음 | Elastic "As the variance of latency increases or the head-based sampling rate decreases, the level of error in these calculations may increase." | — |
| 더 깊이 비율을 넘겨야 함, 대부분 샘플러는 넘기지 않음, consistent probability sampler | 맞음 | Elastic "The sample rate must be propagated between services and the managed intake service in order to produce accurate metrics.", "most samplers do not propagate the sample rate. This results in inaccurate span-based metrics", "you must use a consistent probability sampler" | — |
| 더 깊이 `ot=th`, `sampling.method` extrapolated·counted | 맞음 | Tempo service graphs "OpenTelemetry probability sampling threshold (ot=th:<hex>)". span metrics connector "`enable_metrics_sampling_method` … `\"extrapolated\"` (when the span has a valid tracestate sampling threshold) or `\"counted\"` (otherwise)" | — |
| 더 깊이 뒤 서비스는 시작 서비스 결정을 따름, restart 전략 | 맞음 | Elastic "Each subsequent service respects the initial service's sampling decision, regardless of its configured sample rate", "restart … start a new trace regardless of whether the previous service had a traceparent header" | — |
| 더 깊이 tail: 메모리, `decision_wait` 30초, 같은 인스턴스 | 맞음 | tail sampling processor "keeps spans in memory while it waits to make a sampling decision", "`decision_wait` (default = 30s)", "All spans for a given trace MUST be received by the same collector instance" | — |

## 반영

- 핵심 2를 "tail 샘플링은 … 더 남기게 짤 수 있어요. 그러면 …"으로 고쳤어요. head·tail 샘플링이 처음 나올 때 짧은 풀이도 붙였어요.
- 확인 3을 "span으로 만든 APM 지표"로 좁히고, 요청 수와 에러율은 계측 라이브러리의 HTTP 지표로 보라는 문장을 더했어요. 출처에 OpenTelemetry Metrics SDK를 더했어요.
