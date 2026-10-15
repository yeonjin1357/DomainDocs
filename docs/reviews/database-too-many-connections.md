# 사실 검토: DB 연결이 한도에 닿았을 때 어디부터 볼까

- 글: src/content/docs/database/too-many-connections.mdx
- 검토일: 2026-10-15
- 방식: 초안을 다 쓴 뒤 따로 검토했어요(서브 에이전트 없이). PostgreSQL 18·HikariCP·PgBouncer 문서 원문과 대조했고, 질의와 기본값은 PGlite 0.5.10(PostgreSQL 18.6)에서 확인했어요.
- 결과: 수정 필요 0건 / 확인 11건

| 주장(인용) | 판정 | 근거(URL과 짧은 인용) | 수정 제안 |
| --- | --- | --- | --- |
| 상황 `max_connections` 100 | 맞음 | https://www.postgresql.org/docs/current/runtime-config-connection.html "The default is typically 100 connections". PGlite 100 | — |
| 1단계 한도에 닿아도 관리자는 접속, 기본 3개 | 맞음 | `superuser_reserved_connections` "Whenever the number of active concurrent connections is at least max_connections minus superuser_reserved_connections, new connections will be accepted only for superusers.", "The default value is three connections." PGlite 3 | — |
| 1단계 질의 | 맞음 | PGlite에서 오류 없이 돌았어요(클라이언트 연결이 없어 0행). | — |
| 2단계 `minimumIdle` 기본 = `maximumPoolSize` | 맞음 | https://github.com/brettwooldridge/HikariCP README `minimumIdle` "Default: same as maximumPoolSize" | — |
| 2단계 `idle in transaction`은 잠금도 쥘 수 있음 | 맞음 | https://www.postgresql.org/docs/current/explicit-locking.html "Once acquired, a lock is normally held until the end of the transaction." | — |
| 3단계 재시작해야 바뀜, 자원이 이 값에 맞춰 잡힘 | 맞음 | `max_connections` "This parameter can only be set at server start.", "PostgreSQL sizes certain resources based directly on the value of max_connections. Increasing its value leads to higher allocation of those resources, including shared memory." | — |
| 4단계 transaction 모드는 트랜잭션 동안만 | 맞음 | https://www.pgbouncer.org/features.html "A server connection is assigned to a client only during a transaction. When PgBouncer notices that the transaction is over, the server will be put back into the pool." | — |
| 4단계 세션 기능을 깸, 앱이 협조할 때만 | 맞음 | 같은 문서 "This mode breaks a few session-based features of PostgreSQL. You can use it only when the application cooperates by not using features that break." | — |
| 4단계 session 모드가 기본, 모든 기능 지원 | 맞음 | https://www.pgbouncer.org/config.html `pool_mode` session "Server is released back to pool after client disconnects. Default." features "This mode supports all PostgreSQL features." | — |
| 확인 2 `idle_session_timeout`과 연결 풀 | 맞음 | https://www.postgresql.org/docs/current/runtime-config-client.html "Be wary of enforcing this timeout on connections made through connection-pooling software or other middleware, as such a layer may not react well to unexpected connection closure." | — |
| 확인 1·3 | 맞음 | 1·2단계 근거에서 나와요. | — |

## 반영

- 고칠 곳은 없었어요.
