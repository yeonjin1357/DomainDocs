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

## 2026-10-30 문제 다시 쓰기

- 문제: src/content/quizzes/apm/*.yaml (35개 파일, 171문제)
- 바꾼 까닭: OX 정답의 O가 26%, 정답이 가장 긴 보기인 객관식이 59%였어요. "언제나", "볼 수 있나요", "괜찮나요" 같은 말이 답을 흘렸고, 부정으로 묻는 문제("~아닌 것은?")와 글끼리 겹치는 문제(GC 직후 바닥, Serial GC, 힙 밖 메모리, 되돌리기)가 있었어요.
- 채점 결함: pool-exhausted의 주관식은 설정 이름(leakDetectionThreshold)을 물으면서 용어 '커넥션 누수'를 이어 둬서, '커넥션 누수'도 정답으로 받았어요. 개념을 떠올리는 문제(connection-leak-name)로 바꿨어요.
- 고친 뒤: OX 51문제 중 O 23(45%), 객관식 106문제 중 정답이 가장 긴 보기 22(21%), 정답이 가장 긴 오답의 1.2배를 넘는 문제 0개예요.
- 새로 들어간 주장과 계산만 아래에서 확인했어요. 나머지는 글 본문과 각 글의 검토 기록에 기대요.

| 문제(파일 · id) | 확인한 주장 | 근거 |
| --- | --- | --- |
| web-server-and-was · was-down-502 | WAS 프로세스가 죽어 연결이 거부되면 nginx는 시간 제한을 기다리지 않고 502를 줘요 | 연결 거부(RST)는 바로 실패하고, nginx는 시간 초과만 504, 연결 실패는 502로 바꿔요. docs/reviews/apm-gateway-errors.md의 ngx_http_upstream_next 소스 확인 |
| transactions-and-response-time · health-check-dilution | 기능 100건 평균 800ms와 헬스체크 900건 평균 2ms를 섞은 평균은 81.8ms예요 | node로 계산 |
| slow-response · service-wide-p95 | 3%만 1.5초이고 97%가 300ms 안쪽이면 전체 p95는 300ms 안쪽이에요 | node로 1,000건을 만들어 p95 289.8ms 확인 |
| trace-waterfall · overlapping-spans, longest-bar-trap | 300ms 두 개가 겹치면 합 600ms가 부모 500ms보다 커요. 50ms × 8 = 400ms라 한 번으로 묶으면 350ms가 줄어 300ms 막대보다 커요 | 계산 |
| jvm-memory · metaspace-not-heap | Metaspace는 힙 밖이라 -Xmx를 늘려도 풀리지 않아요 | 글 본문(메타스페이스는 힙 밖, 에러 뒤 이름으로 칸을 가름)과 docs/reviews/apm-jvm-memory.md |
| memory-growing · floor-plateau | GC 직후 바닥이 오르다 멈추면 정해진 크기까지 채우는 캐시일 수 있어요 | 글 본문 3단계 |
| slow-after-deploy · compare-past-week | 옛 버전이 없으면 배포 전 같은 요일·시간대와 견줘요 | 글 본문 2단계 |
| thread-pools · tomcat-order | Tomcat 요청 스레드 풀은 대기열보다 스레드부터 maxThreads까지 늘려요 | 글 본문과 docs/reviews/apm-thread-pools.md |
