# 사실 검토: DB 커넥션 풀

- 글: src/content/docs/apm/connection-pool.mdx
- 검토일: 2026-10-14
- 방식: 초안을 다 쓴 뒤 따로 검토했어요(서브 에이전트 없이). HikariCP README·위키·소스, OpenTelemetry 규약(1.44.0), PostgreSQL 문서 원문과 대조했고, 숫자는 손계산으로 확인했어요.
- 결과: 수정 필요 1건 / 확인 14건

| 주장(인용) | 판정 | 근거(URL과 짧은 인용) | 수정 제안 |
| --- | --- | --- | --- |
| 더 깊이 "OpenTelemetry DB 지표 규약도 비슷한 지표를 정해요." | 보충 필요 | https://opentelemetry.io/docs/specs/semconv/db/database-metrics/ 커넥션 풀 지표는 "## Development" 절에 있고 "**Status**: [Development]"예요. 안정 지표처럼 읽혀요. | "아직 개발 단계(Development)라 이름이 바뀔 수 있어요." 더함 |
| 핵심 1 최대 10개 다 쓰면 기다리고, 30초 넘으면 예외 | 맞음 | https://github.com/brettwooldridge/HikariCP README `maximumPoolSize` "When the pool reaches this size, and no idle connections are available, calls to getConnection() will block for up to connectionTimeout milliseconds before timing out.", "Default: 10". `connectionTimeout` "If this time is exceeded without a connection becoming available, a SQLException will be thrown.", "Default: 30000 (30 seconds)" | — |
| 핵심 1 계측되지 않은 대기는 워터폴에서 DB span 앞 빈칸 | 맞음 | 자식 span이 없는 시간은 빈칸이에요(apm-trace-waterfall 검토의 Elastic "app" 근거). | — |
| 핵심 2 400 × 0.02 = 8, 400 × 0.05 = 20 | 맞음 | 손계산. 리틀의 법칙은 apm-throughput-and-concurrency 검토 근거와 같아요. | — |
| 핵심 2 쥐는 시간은 빌려서 돌려줄 때까지 | 맞음 | OpenTelemetry `db.client.connection.use_time` "The time between borrowing a connection and returning it to the pool." HikariCP `usage` "Connection usage time" | — |
| 핵심 3 작은 풀, DB가 동시에 처리할 수 있는 수에 맞춤 | 맞음 | https://github.com/brettwooldridge/HikariCP/wiki/About-Pool-Sizing "You want a small pool, saturated with threads waiting for connections.", "set right at the limit of the number of queries the database is capable of processing simultaneously" | — |
| 핵심 3 코어보다 훨씬 많으면 번갈아 처리하느라 느려짐 | 맞음 | 같은 문서 "Once the number of threads exceeds the number of CPU cores, you're going slower by adding more threads, not faster." I/O 대기 때문에 코어보다 조금 많은 건 괜찮다는 설명이 이어져서 "훨씬"으로 썼어요. | — |
| 확인 1 Micrometer 지표 이름 | 맞음 | https://github.com/brettwooldridge/HikariCP/blob/dev/src/main/java/com/zaxxer/hikari/metrics/micrometer/MicrometerMetricsTracker.java `hikaricp.connections.acquire`("Connection acquire time", Timer), `hikaricp.connections.pending`("Pending threads"). Micrometer Prometheus 이름은 `.`→`_`, Timer는 `_seconds`가 붙어요. | — |
| 확인 2 20 × 10 = 200, PostgreSQL 기본 100 | 맞음 | https://www.postgresql.org/docs/current/runtime-config-connection.html "The default is typically 100 connections" | — |
| 확인 3 트랜잭션 안 외부 호출은 커넥션을 쥠 | 맞음 | 위 use_time 정의에서 나와요. | — |
| 확인 4 기다리는 동안 스레드도 붙잡힘 | 맞음 | `getConnection()`이 block해요(README). 30초는 `connectionTimeout` 기본값이에요. | — |
| 더 깊이 `maximumPoolSize`는 쉬는·쓰는 커넥션 합, `minimumIdle` 기본 = 최대라 고정, 최소 250ms | 맞음 | README "including both idle and in-use connections", `minimumIdle` "Default: same as maximumPoolSize", "allowing HikariCP to act as a *fixed size* connection pool", "Lowest acceptable connection timeout is 250 ms." | — |
| 더 깊이 HikariCP 지표 목록 | 맞음 | MicrometerMetricsTracker 상수와 description("Active connections", "Idle connections", "Pending threads", "Connection acquire time", "Connection usage time", "Connection timeout total count") | — |
| 더 깊이 OpenTelemetry 지표 설명 | 맞음 | count "The number of connections that are currently in state described by the state attribute"(idle·used), pending_requests "The number of current pending requests for an open connection.", wait_time "The time it took to obtain an open connection from the pool.", timeouts "The number of connection timeouts that have occurred trying to obtain a connection from the pool." | — |
| 더 깊이 크기 공식, 하이퍼스레딩 제외, 캐시면 스핀들 0 | 맞음 | About Pool Sizing "connections = ((core_count * 2) + effective_spindle_count)", "Core count should not include HT threads", "Effective spindle count is zero if the active data set is fully cached" | — |
| 더 깊이 교착을 막는 최소 크기, 3 × 3 + 1 = 10 | 맞음 | 같은 문서 "pool size = Tn x (Cm - 1) + 1", "pool size = 3 x (4 - 1) + 1 = 10" | — |

## 반영

- 더 깊이의 OpenTelemetry 지표 단락에 개발 단계라 이름이 바뀔 수 있다는 문장을 더했어요.
