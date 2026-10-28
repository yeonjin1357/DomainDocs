# 사실 확인: 오래 도는 쿼리 멈추기

- 글: src/content/docs/database/stop-long-query.mdx
- 확인일: 2026-10-28

| 확인한 주장 | 근거(URL) |
| --- | --- |
| pg_cancel_backend는 현재 쿼리 취소, pg_terminate_backend는 세션 종료, 같은 역할 구성원이거나 pg_signal_backend 권한, 슈퍼유저 세션은 슈퍼유저만, terminate는 timeout 없으면 실제 종료와 무관하게 true | https://www.postgresql.org/docs/18/functions-admin.html |
| statement_timeout·lock_timeout·idle_in_transaction_session_timeout 기본 0(꺼짐), statement_timeout을 postgresql.conf에 두는 것은 권하지 않음, 유휴 트랜잭션은 잠금을 쥐고 VACUUM을 막음 | https://www.postgresql.org/docs/18/runtime-config-client.html |
| MySQL `KILL QUERY`는 문장만, `KILL`/`KILL CONNECTION`은 연결까지 | https://dev.mysql.com/doc/refman/8.4/en/kill.html |
| MySQL 큰 트랜잭션 되돌리기는 원래 작업의 몇 배가 걸릴 수 있고, 프로세스를 죽여도 시작할 때 되돌리기가 다시 시작 | https://dev.mysql.com/doc/refman/8.4/en/optimizing-innodb-transaction-management.html |
| MySQL max_execution_time은 밀리초, 읽기 전용 SELECT에만 | https://dev.mysql.com/doc/refman/8.4/en/server-system-variables.html |
| Oracle `ALTER SYSTEM CANCEL SQL 'SID, SERIAL'`로 문장만 취소(DML은 되돌림) | https://docs.oracle.com/en/database/oracle/oracle-database/23/admin/managing-processes.html |
| Oracle `KILL SESSION`은 진행 중 트랜잭션을 되돌리고, 되돌리는 중이면 끝날 때까지 기다림 | https://docs.oracle.com/en/database/oracle/oracle-database/23/sqlrf/ALTER-SYSTEM.html |
| SQL Server KILL은 되돌릴 일이 많으면 오래 걸리고, `WITH STATUSONLY`로 진행 상황 확인 | https://learn.microsoft.com/en-us/sql/t-sql/language-elements/kill-transact-sql |

- 재현(PostgreSQL 18.4, 두 연결):
  - `pg_stat_activity` 질의(글의 SQL과 같은 열): 잠금을 기다리는 세션 `active`/`transactionid`, 잠금을 쥔 세션 `idle in transaction`/`ClientRead`. `pg_blocking_pids(기다리는 pid)`가 막는 pid를 돌려줌.
  - `pg_cancel_backend`: 57014 `canceling statement due to user request`, 연결은 계속 쓸 수 있음. 트랜잭션 안이면 다음 SQL이 25P02 `current transaction is aborted, commands ignored until end of transaction block`.
  - `pg_terminate_backend`: 57P01 `terminating connection due to administrator command`, 연결 끊김.
  - `statement_timeout 500ms`: `canceling statement due to statement timeout`. `lock_timeout 500ms`: 55P03 `canceling statement due to lock timeout`. `idle_in_transaction_session_timeout 1s`: 서버 로그 `FATAL: terminating connection due to idle-in-transaction timeout`.
  - 200만 행 UPDATE 5591ms, ROLLBACK 1ms, 뒤에 `n_dead_tup` 2000000.
- 함께 한 것: 「DB가 느려졌을 때」에 이 글로 가는 줄을 더하고, 퀴즈 5문제를 썼어요.
