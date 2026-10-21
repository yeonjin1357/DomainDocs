# 사실 확인: 스레드 풀과 요청 처리

- 글: src/content/docs/apm/thread-pools.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| core보다 적으면 새 스레드, core 이상이면 대기열, 못 넣으면 max까지 늘리고 넘으면 거부 | https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/util/concurrent/ThreadPoolExecutor.html |
| 무제한 대기열이면 core보다 많은 스레드를 만들지 않고 max는 효과 없음 | 같은 문서 Queuing |
| Tomcat maxThreads 기본 200, executor를 쓰면 무시 | https://tomcat.apache.org/tomcat-10.1-doc/config/http.html |
| 계산 | 100 × 0.5 = 50, 100 × 3 = 300 |

- 메모: 동시 처리 수 = 처리량 × 응답시간은 apm-throughput-and-concurrency 검토에서 확인한 관계예요.
