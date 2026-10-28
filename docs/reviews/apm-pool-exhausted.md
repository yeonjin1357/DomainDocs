# 사실 확인: 커넥션 풀이 바닥날 때

- 글: src/content/docs/apm/pool-exhausted.mdx
- 확인일: 2026-10-28

| 확인한 주장 | 근거(URL) |
| --- | --- |
| `connectionTimeout` 기본 30000ms, `maximumPoolSize` 기본 10, `minimumIdle` 기본은 maximumPoolSize와 같음 | https://github.com/brettwooldridge/HikariCP#gear-configuration-knobs-baby |
| `leakDetectionThreshold` 기본 0(꺼짐), 켤 때 최솟값 2000ms, 풀 밖에 그보다 오래 있으면 누수 가능성 메시지 | 같은 문서 |
| 타임아웃 예외 `SQLTransientConnectionException`, 메시지 `<풀이름> - Connection is not available, request timed out after <n>ms (total=, active=, idle=, waiting=)` | https://github.com/brettwooldridge/HikariCP/blob/dev/src/main/java/com/zaxxer/hikari/pool/HikariPool.java (`createTimeoutException`) |
| `waiting`은 대기 중인 스레드 수이고, 타임아웃 난 스레드는 finally에서 이미 빠짐 | https://github.com/brettwooldridge/HikariCP/blob/dev/src/main/java/com/zaxxer/hikari/util/ConcurrentBag.java (`waiters.decrementAndGet`) |
| 지표 `hikaricp.connections.active·pending·usage·timeout` | https://github.com/brettwooldridge/HikariCP/blob/dev/src/main/java/com/zaxxer/hikari/metrics/micrometer/MicrometerMetricsTracker.java |

- 재현(WSL Ubuntu, OpenJDK 17, HikariCP 6.3.0 + H2 2.3.232): 풀 크기 2, `connectionTimeout` 1000, `leakDetectionThreshold` 2000으로 커넥션 2개를 빌리고 닫지 않았어요.
  - 세 번째 요청: 1005ms 뒤 `orders - Connection is not available, request timed out after 1000ms (total=2, active=2, idle=0, waiting=0)`.
  - 2초 뒤 `WARN com.zaxxer.hikari.pool.ProxyLeakTask - Connection leak detection triggered for conn0 … on thread main, stack trace follows`와 `java.lang.Exception: Apparent connection leak detected`, 스택 트레이스 끝이 빌린 줄(`Pool.java:19`)을 가리킴.
  - 기본값 출력: `maximumPoolSize=10 connectionTimeout=30000 leakDetectionThreshold=0 minimumIdle=-1`(-1은 정하지 않음).
- 함께 한 것: 용어 connection-leak을 올리고 퀴즈 5문제를 썼어요. 「DB 커넥션 풀」 Checkpoints와 「DB 연결이 한도에 닿았을 때」 related에 이 글을 더했어요.
