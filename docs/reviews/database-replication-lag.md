# 사실 검토: 복제 지연

- 글: src/content/docs/database/replication-lag.mdx
- 검토일: 2026-10-15
- 방식: 초안을 다 쓴 뒤 따로 검토했어요(서브 에이전트 없이). PostgreSQL 18 문서 원문과 대조했고, 질의는 PGlite 0.5.10(PostgreSQL 18.6)에서 돌렸어요. 복제본이 없어 결과는 0행이었고, 쓴 열과 함수가 있는지만 확인했어요.
- 결과: 수정 필요 0건 / 확인 13건

| 주장(인용) | 판정 | 근거(URL과 짧은 인용) | 수정 제안 |
| --- | --- | --- | --- |
| 핵심 1 write·flush·replay 단계와 세 지연 열 | 맞음 | https://www.postgresql.org/docs/current/monitoring-stats.html `write_lag` "…has written it (but not yet flushed it or applied it)", `flush_lag` "…written and flushed it (but not yet applied it)", `replay_lag` "…written, flushed and applied it" | — |
| 핵심 1 비동기면 `replay_lag` ≈ 조회에 보이기까지 | 맞음 | "For an asynchronous standby, the replay_lag column approximates the delay before recent transactions became visible to queries." | — |
| 핵심 2 기본 비동기, 짧은 틈 | 맞음 | https://www.postgresql.org/docs/current/warm-standby.html "Streaming replication is asynchronous by default … there is a small delay between committing a transaction in the primary and the changes becoming visible in the standby." | — |
| 핵심 2 넘길 때 잃는 데이터 ∝ 지연 | 맞음 | 같은 문서 "The amount of data loss is proportional to the replication delay at the time of failover." | — |
| 핵심 3 마지막 재생 뒤 흐른 시간은 쓰기가 없으면 늘어남 | 맞음 | https://www.postgresql.org/docs/current/functions-admin.html `pg_last_xact_replay_timestamp` "This is the time at which the commit or abort WAL record for that transaction was generated on the primary." 새 트랜잭션이 없으면 이 시각이 그대로라, `now()`와의 차이만 커져요. | — |
| 핵심 3 바이트 차이로 밀린 양 | 맞음 | `pg_wal_lsn_diff` "Calculates the difference in bytes … This can be used with pg_stat_replication … to get the replication lag." | — |
| 확인 2 NULL은 최근에 잰 값 없음 | 맞음 | "If the standby server has entirely caught up with the sending server and there is no more WAL activity, the most recently measured lag times will continue to be displayed for a short time and then show NULL." | — |
| 확인 3 충돌 시 30초까지 미룬 뒤 취소 | 맞음 | https://www.postgresql.org/docs/current/runtime-config-replication.html `max_standby_streaming_delay` "how long the standby server should wait before canceling standby queries that conflict with about-to-be-applied WAL entries … The default is 30 seconds." | — |
| 확인 4 슬롯이 WAL을 잡아 디스크를 채울 수 있음 | 맞음 | warm-standby "ensure that the primary server does not remove WAL segments until they have been received by all standbys", "Beware that replication slots can cause the server to retain so many WAL segments that they fill up the space allocated for pg_wal." | — |
| 더 깊이 질의 | 맞음 | PGlite에서 오류 없이 돌았어요(복제본이 없어 0행). | — |
| 더 깊이 동기 복제의 커밋 대기 | 맞음 | 각 열 설명 "This can be used to gauge the delay that synchronous_commit level … incurred while committing if this server was configured as a synchronous standby." | — |
| 더 깊이 보통 1초 아래, DDL 충돌 | 맞음 | warm-standby "typically under one second assuming the standby is powerful enough to keep up with the load". https://www.postgresql.org/docs/current/hot-standby.html "Access Exclusive locks taken on the primary server, including both explicit LOCK commands and various DDL actions, conflict with table accesses in standby queries." | — |
| 더 깊이 `max_slot_wal_keep_size` | 맞음 | warm-standby "max_slot_wal_keep_size can be used to limit the size of WAL files retained by replication slots." | — |

## 반영

- 고칠 곳은 없었어요. 그림의 숫자(1시간, 0바이트)는 설명용 가정이에요.
