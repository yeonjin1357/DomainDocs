# 사실 검토: 잠금과 블로킹

- 글: src/content/docs/database/locks-and-blocking.mdx
- 검토일: 2026-10-15
- 방식: 초안을 다 쓴 뒤 따로 검토했어요(서브 에이전트 없이). PostgreSQL 18 문서 원문과 대조했고, 질의와 설정 기본값은 PGlite 0.5.10(PostgreSQL 18.6)에서 확인했어요(`scratchpad/pglite/check2.mjs`). PGlite는 연결이 하나라 블로킹 자체는 재현하지 못했어요.
- 결과: 수정 필요 1건 / 확인 13건

| 주장(인용) | 판정 | 근거(URL과 짧은 인용) | 수정 제안 |
| --- | --- | --- | --- |
| 확인 1 "잠금을 정한 시간 안에 얻지 못하면 기다리지 않고 실패해서" | 오해 소지 | `lock_timeout`은 정한 시간까지는 기다려요. https://www.postgresql.org/docs/current/runtime-config-client.html "Abort any statement that waits longer than the specified amount of time while attempting to acquire a lock" | "정한 시간 안에 잠금을 얻지 못하면 더 기다리지 않고 실패해서, 뒤의 쿼리를 오래 줄 세우지 않아요." |
| 핵심 1 잠금은 보통 트랜잭션 끝까지 | 맞음 | https://www.postgresql.org/docs/current/explicit-locking.html "Once acquired, a lock is normally held until the end of the transaction." | — |
| 핵심 1 읽기와 쓰기가 서로 막지 않음(MVCC) | 맞음 | https://www.postgresql.org/docs/current/mvcc-intro.html "reading never blocks writing and writing never blocks reading" | — |
| 핵심 2 ALTER TABLE의 여러 형태는 ACCESS EXCLUSIVE, 모든 모드와 충돌, SELECT도 막음 | 맞음 | "Many forms of ALTER INDEX and ALTER TABLE also acquire a lock at this level.", "Conflicts with locks of all modes", "Only an ACCESS EXCLUSIVE lock blocks a SELECT (without FOR UPDATE/SHARE) statement." | — |
| 핵심 2 대기 줄 앞의 세션이 막음(soft block) | 맞음 | https://www.postgresql.org/docs/current/functions-info.html "or is waiting for a lock that would conflict with the blocked process's lock request and is ahead of it in the wait queue (soft block)" | — |
| 그림 101이 쥔 잠금 | 맞음 | 101은 SELECT 뒤 트랜잭션을 연 채 쉬어서 ACCESS SHARE를 쥐고 있어요("The SELECT command acquires a lock of this mode"). 이 잠금이 202의 ACCESS EXCLUSIVE와 충돌해요. | — |
| 핵심 3 교착을 찾아 한쪽을 끝냄 | 맞음 | "PostgreSQL automatically detects deadlock situations and resolves them by aborting one of the transactions involved, allowing the other(s) to complete." | — |
| 확인 3 일관된 잠금 순서 | 맞음 | "The best defense against deadlocks is generally to avoid them by being certain that all applications using a database acquire locks on multiple objects in a consistent order." | — |
| 확인 4 어느 쪽이 끝날지 예측 불가 | 맞음 | "(Exactly which transaction will be aborted is difficult to predict and should not be relied upon.)" | — |
| 더 깊이 ACCESS SHARE·ROW EXCLUSIVE·ACCESS EXCLUSIVE를 거는 명령 | 맞음 | "Conflicts with the ACCESS EXCLUSIVE lock mode only.", "The commands UPDATE, DELETE, INSERT, and MERGE acquire this lock mode", "Acquired by the DROP TABLE, TRUNCATE, REINDEX, CLUSTER, VACUUM FULL …" | — |
| 더 깊이 `pg_locks`의 `granted` | 맞음 | https://www.postgresql.org/docs/current/view-pg-locks.html "True if lock is held, false if lock is awaited". 질의는 PGlite에서 오류 없이 돌았어요. | — |
| 더 깊이 `deadlock_timeout` 기본 1초, 검사가 비쌈 | 맞음 | https://www.postgresql.org/docs/current/runtime-config-locks.html "The check for deadlock is relatively expensive, so the server doesn't run it every time it waits for a lock.", "The default is one second". PGlite `deadlock_timeout` = 1000ms | — |
| 더 깊이 `log_lock_waits` 기본 꺼짐 | 맞음 | https://www.postgresql.org/docs/current/runtime-config-logging.html "Controls whether a log message is produced when a session waits longer than deadlock_timeout to acquire a lock. … The default is off." PGlite도 off | — |
| 확인 1 `lock_timeout` 기본 0 | 맞음 | "A value of zero (the default) disables the timeout." PGlite 0 | — |

## 반영

- 확인 1을 고쳤어요.
