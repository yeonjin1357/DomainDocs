# 사실 검토: 액티브 세션과 대기 이벤트

- 글: src/content/docs/database/active-sessions.mdx
- 검토일: 2026-10-15
- 방식: 초안을 다 쓴 뒤 따로 검토했어요(서브 에이전트 없이). PostgreSQL 18·Oracle 19c 문서 원문과 대조했고, 질의는 PGlite 0.5.10(PostgreSQL 18.6)에서 돌렸어요(`scratchpad/pglite/check.mjs`).
- 결과: 수정 필요 1건 / 확인 13건

| 주장(인용) | 판정 | 근거(URL과 짧은 인용) | 수정 제안 |
| --- | --- | --- | --- |
| 더 깊이 "`wait_event`가 비어 있는 `active` 세션은 보통 CPU에서 실행 중으로 봐요." | 근거 없는 일반화 | 문서는 `wait_event`를 "Wait event name if backend is currently waiting, otherwise NULL"이라고만 해요. CPU로 부르는 건 이 글 질의의 선택이에요. | "기다리지 않고 실행 중이라, 아래 질의는 그 몫을 CPU로 셌어요." |
| 핵심 1 액티브 세션 = `state`가 `active` | 맞음 | https://www.postgresql.org/docs/current/monitoring-stats.html "active: The backend is executing a query.", "idle: The backend is waiting for a new client command." | — |
| 핵심 1 AAS = DB time ÷ 경과 시간 | 맞음 | https://docs.oracle.com/en/database/oracle/oracle-database/19/tgdba/measuring-database-performance.html DB time은 "calculated by aggregating the CPU and wait times of all foreground sessions not waiting on idle wait events", 예 "an instance that has been running for 30 minutes could have four active user sessions whose cumulative DB time is approximately 120 minutes" | — |
| 핵심 2 Lock·IO·LWLock 정의 | 맞음 | 같은 PostgreSQL 문서 Table 27.4 "Lock: … waiting for a heavyweight lock", "IO: … waiting for an I/O operation to complete", "LWLock: … Most such locks protect a particular data structure in shared memory" | — |
| 핵심 3 `ClientRead`, Oracle Idle 대기 제외 | 맞음 | PostgreSQL "ClientRead: Waiting to read data from the client." Oracle "these events are of no value when investigating performance problems, and should be ignored when examining wait events" | — |
| 그림 3개 → 12개, 늘어난 9개는 Lock | 맞음 | 시작 CPU 2 + IO 1 = 3, 끝 2 + 1 + 9 = 12 | — |
| 확인 1 `pg_stat_activity`는 지금 순간, ASH는 1초마다 | 맞음 | PostgreSQL 뷰 설명 "showing information related to the current activity of that process". Oracle "Oracle Database samples active sessions every second" | — |
| 확인 2 잠금은 보통 트랜잭션 끝까지 | 맞음 | https://www.postgresql.org/docs/current/explicit-locking.html "Once acquired, a lock is normally held until the end of the transaction." | — |
| 확인 3 횟수로만 줄 세우면 안 됨 | 맞음 | Oracle "it is only possible to order wait events by the number of times each event was waited for. Although the events with the largest number of waits might indicate a potential bottleneck, they might not be the main bottleneck." | — |
| 확인 4 풀 최대치에 붙으면 앱 쪽 대기 | 맞음 | 커넥션을 못 빌린 요청은 앱 풀에서 기다려요(apm-connection-pool 검토의 HikariCP 근거). DB에는 연결이 없어서 보이지 않아요. | — |
| 더 깊이 `state`와 `wait_event`는 따로 움직임 | 맞음 | "The wait_event and state columns are independent. … If the state is active and wait_event is non-null, it means that a query is being executed, but is being blocked somewhere in the system." | — |
| 더 깊이 질의 | 맞음 | PGlite(PostgreSQL 18.6)에서 오류 없이 돌았어요. 쓴 열(`state`, `wait_event_type`, `backend_type`)이 모두 있어요. | — |
| 더 깊이 대기 종류 목록(`transactionid`, `DataFileRead`, Activity) | 맞음 | "transactionid: Waiting for a transaction to finish.", "DataFileRead: Waiting for a read from a relation data file.", "Activity: The server process is idle." | — |
| 더 깊이 ASH: 1초 표본, 메모리 순환, 활성 세션만 | 맞음 | Oracle "samples active sessions every second and stores the sampled data in a circular buffer in the shared global area (SGA)", "By capturing only active sessions … its size being directly related to the work being performed" | — |
| 더 깊이 `idle_in_transaction_session_timeout` | 맞음 | https://www.postgresql.org/docs/current/runtime-config-client.html "Terminate any session that has been idle … within an open transaction for longer than the specified amount of time.", "A value of zero (the default) disables the timeout.", "ensure that idle sessions do not hold locks for an unreasonable amount of time" | — |

## 반영

- 더 깊이의 CPU 문장을 수정 제안대로 고쳤어요.
