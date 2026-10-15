# 사실 검토: DB가 느려졌을 때 어디부터 볼까

- 글: src/content/docs/database/slow-database.mdx
- 검토일: 2026-10-15
- 방식: 초안을 다 쓴 뒤 따로 검토했어요(서브 에이전트 없이). PostgreSQL 18 문서 원문과 대조했고, 질의는 PGlite 0.5.10(PostgreSQL 18.6)에서 돌렸어요.
- 결과: 수정 필요 0건 / 확인 10건

| 주장(인용) | 판정 | 근거(URL과 짧은 인용) | 수정 제안 |
| --- | --- | --- | --- |
| 1단계 앱의 DB 구간에는 커넥션 대기·네트워크가 섞임 | 맞음 | 커넥션을 얻는 단계가 계측되지 않으면 DB span 앞 빈칸이나 DB 구간에 섞여요(apm-connection-pool 검토 근거). | — |
| 2단계 질의 | 맞음 | PGlite에서 오류 없이 돌았어요. | — |
| 2단계 Lock → 잠금, IO·CPU → 일이 늘거나 무거워짐 | 맞음 | 대기 종류 정의(database-active-sessions 검토 근거)에서 나와요. | — |
| 3단계 누적값이라 두 번 떠서 차이 | 맞음 | https://www.postgresql.org/docs/current/pgstatstatements.html `stats_since`부터 쌓이는 누적값이에요(database-top-sql 검토). | — |
| 4단계 `pg_blocking_pids` | 맞음 | https://www.postgresql.org/docs/current/functions-info.html "Returns an array of the process ID(s) of the sessions that are blocking the server process with the specified process ID from acquiring a lock" | — |
| 4단계 질의(`cardinality`) | 맞음 | PGlite에서 오류 없이 돌았어요. 막힌 세션이 없어 0행이었어요. | — |
| 4단계 잠금은 보통 트랜잭션 끝까지 | 맞음 | https://www.postgresql.org/docs/current/explicit-locking.html "Once acquired, a lock is normally held until the end of the transaction." | — |
| 4단계 `xact_start` | 맞음 | `pg_stat_activity`의 열이에요(PGlite에서 열 이름 확인). | — |
| 4단계 `pg_terminate_backend` | 맞음 | https://www.postgresql.org/docs/current/functions-admin.html "Terminates the session whose backend process has the specified process ID." 끝난 세션의 열린 트랜잭션은 커밋되지 않아요. | — |
| 확인 3 `idle_in_transaction_session_timeout` | 맞음 | https://www.postgresql.org/docs/current/runtime-config-client.html "Terminate any session that has been idle … within an open transaction for longer than the specified amount of time." | — |

## 반영

- 고칠 곳은 없었어요.
