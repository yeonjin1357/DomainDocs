# 사실 확인: 애플리케이션 퀴즈

- 문제: src/content/quizzes/apm/*.yaml (23개 파일, 111문제)
- 확인일: 2026-10-21
- 방법: 숫자·기본값·표준의 정의가 든 문제만 골라, 그 문제가 기대는 글의 문장과 글의 검토 기록 근거에 맞춰 봤어요. 글에 없는 새 주장은 넣지 않았어요.

| 문제(파일 · id) | 확인한 주장 | 근거 |
| --- | --- | --- |
| http-basics · not-idempotent, 504-from-gateway | PUT·DELETE·안전한 메서드는 멱등, 502·504는 게이트웨이·프록시가 만드는 코드 | 글 본문과 docs/reviews/apm-http-basics.md |
| web-server-and-was · tomcat-max-threads, nginx-timeout-504 | Tomcat maxThreads 200·maxConnections 8192·acceptCount 100, nginx proxy_read_timeout 60초 | 글 본문과 docs/reviews/apm-web-server-and-was.md |
| thread-pools · concurrency-calc, unbounded-queue-trap | 100 × 0.5 = 50, 무제한 대기열이면 core 수를 넘지 않음 | 글 본문·Checkpoints와 docs/reviews/apm-thread-pools.md |
| jvm-memory · oom-not-always-leak, process-bigger-than-heap | Java heap space OOM은 꼭 누수는 아님, 힙 밖 메모리(메타스페이스·스택) | 글 본문과 docs/reviews/apm-jvm-memory.md |
| thread-dumps · runnable-not-cpu, idle-pool-thread | RUNNABLE은 OS 자원을 기다릴 수 있음, 쉬는 풀 스레드는 WAITING·TIMED_WAITING | 글 본문과 docs/reviews/apm-thread-dumps.md |
| page-load · lcp-threshold, p75-aggregation, blocking-script | LCP 2.5초·INP 200ms·CLS 0.1, 75번째 백분위수, async·defer 없는 script는 해석을 멈춤 | 글 본문과 docs/reviews/apm-page-load.md |
| transactions-and-response-time · p95-not-additive | 구간별 p95 합 ≠ 전체 p95, 평균은 나눠 더할 수 있음 | 글 Deeper(계산)와 docs/reviews/apm-transactions-and-response-time.md |
| throughput-and-concurrency · max-throughput-calc, littles-law | 200 ÷ 1.5 ≈ 133, L = λW | 글 본문과 docs/reviews/apm-throughput-and-concurrency.md |
| apdex · apdex-calc, tolerating-range, weighted-merge | (800 + 50) ÷ 1,000 = 0.85, 허용 = T 초과 4T 이하, 9,050 ÷ 10,000 = 0.905 | 글 본문·Checkpoints와 docs/reviews/apm-apdex.md |
| response-time-distribution · bimodal-average | 0.9 × 50 + 0.1 × 2,000 = 245ms | 글 Checkpoints(계산) |
| errors-and-exceptions · server-404, client-404 | 서버 span은 5xx만 에러, 클라이언트 span은 4xx도 에러 | 글 본문과 docs/reviews/apm-errors-and-exceptions.md |
| sampling · adjusted-count, spanmetrics-order | 보정 개수 = 1/확률(5% → 20), span 지표 connector를 샘플링 프로세서 앞에 | 글 본문과 docs/reviews/apm-sampling.md |
| connection-pool · hikari-default-max, pool-size-calc | maximumPoolSize 기본 10, connectionTimeout 기본 30초, 400 × 0.05 = 20 | 글 본문과 docs/reviews/apm-connection-pool.md |
| broken-traces · traceparent-header, propagator-mismatch | OpenTelemetry 기본 W3C traceparent, OTEL_PROPAGATORS 기본 tracecontext,baggage | 글 본문과 docs/reviews/apm-broken-traces.md |
| gc-pause · g1-goal-not-guarantee, g1-full-gc | MaxGCPauseMillis 기본 200은 목표, G1의 Full GC는 대비책 | 글 본문·Deeper와 docs/reviews/apm-gc-pause.md |
| timeouts-and-retries · retry-multiplies | 계층마다 4번 시도 → 4 × 4 × 4 = 64 | 글 본문과 docs/reviews/apm-timeouts-and-retries.md |
| consumer-lag · lag-to-time, in-faster-than-out, stalled-consumer | 60,000 ÷ 400 = 150초, (500 − 400) × 60 = 6,000건/분, Burrow STALLED | 글 본문·Deeper와 docs/reviews/apm-consumer-lag.md |
| cascading-failure · shed-more-load | SRE Book 예: 11,000건에서 무너진 뒤 9,000건으로는 회복하지 않음 | 글 본문과 docs/reviews/apm-cascading-failure.md |
