# 사실 확인: DB마다 다른 이름

- 글: src/content/docs/database/db-names.mdx
- 확인일: 2026-10-28

| 확인한 주장 | 근거(URL) |
| --- | --- |
| pg_stat_activity(state, wait_event_type, wait_event, query_start), pg_blocking_pids, pg_stat_statements | https://www.postgresql.org/docs/18/monitoring-stats.html , https://www.postgresql.org/docs/18/functions-info.html , https://www.postgresql.org/docs/18/pgstatstatements.html |
| MySQL processlist 표의 TIME은 현재 상태로 지낸 초 | https://dev.mysql.com/doc/refman/8.4/en/performance-schema-processlist-table.html |
| MySQL events_waits_current, data_locks·data_lock_waits, events_statements_summary_by_digest, EXPLAIN ANALYZE, sys 스키마 | 각 문서(머리말 sources) |
| Oracle V$SESSION의 SID, SERIAL#(같은 SID를 다른 세션이 이어 쓸 때 구분), STATUS ACTIVE, LAST_CALL_ET(ACTIVE면 활성이 된 뒤 초), EVENT, WAIT_CLASS, SQL_ID, BLOCKING_SESSION | https://docs.oracle.com/en/database/oracle/oracle-database/23/refrn/V-SESSION.html |
| Oracle V$SQL, V$LOCK, DBMS_XPLAN | 각 문서 |
| V$ACTIVE_SESSION_HISTORY는 활성 세션을 1초마다 찍은 것, Diagnostics Pack에 속함 | https://docs.oracle.com/en/database/oracle/oracle-database/23/refrn/V-ACTIVE_SESSION_HISTORY.html , https://docs.oracle.com/en/database/oracle/oracle-database/23/dblic/Licensing-Information.html |
| SQL Server dm_exec_requests의 blocking_session_id, wait_type, total_elapsed_time(밀리초) | https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-exec-requests-transact-sql |
| dm_os_wait_stats는 다시 시작하거나 DBCC SQLPERF로 지우면 0부터 | https://learn.microsoft.com/en-us/sql/relational-databases/system-dynamic-management-views/sys-dm-os-wait-stats-transact-sql |
| dm_exec_query_stats, dm_tran_locks, 쿼리 저장소 | 각 문서 |

- 재현: PostgreSQL 18.4에서 잠금 대기 세션과 `pg_blocking_pids`를 확인했어요(「오래 도는 쿼리 멈추기」 검토 기록과 같은 실험).
- 함께 한 것: DB 개요 글의 모니터링 목록에 이 글을 더하고, 퀴즈 5문제를 썼어요.

## 2026-10-29 보강

- 메모: MySQL의 세션 번호를 PROCESSLIST_ID로 밝히고 performance_schema의 THREAD_ID와 다르다고 적었어요. SQL Server는 session_id로 적었어요. (https://dev.mysql.com/doc/refman/8.4/en/performance-schema-threads-table.html)
