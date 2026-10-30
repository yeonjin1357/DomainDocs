# 사실 확인: 데이터베이스 퀴즈

- 문제: src/content/quizzes/database/*.yaml (17개 파일, 82문제)
- 확인일: 2026-10-21
- 방법: 숫자·기본값·DB마다 다른 동작이 든 문제만 골라, 그 문제가 기대는 글의 문장과 글의 검토 기록 근거에 맞춰 봤어요. 글에 없는 새 주장은 넣지 않았어요.

| 문제(파일 · id) | 확인한 주장 | 근거 |
| --- | --- | --- |
| connections-and-sessions · postgres-process-per-connection | PostgreSQL은 연결마다 서버 프로세스, MySQL은 연결마다 스레드, SQL Server는 작업 스레드 풀 | 글 본문과 docs/reviews/database-connections-and-sessions.md |
| connections-and-sessions · session-setting-sticks | 세션 설정은 세션이 끝날 때까지 남아 다음 대여 요청도 영향받음 | 글 Checkpoints, 같은 검토 기록 |
| query-processing · oracle-literal-hard-parse | Oracle은 SQL 글자로 캐시를 찾아 값만 달라도 하드 파스 | 글 본문과 docs/reviews/database-query-processing.md |
| memory-and-disk · innodb-page-size | 기본 크기 InnoDB 16KB, PostgreSQL·Oracle·SQL Server 8KB | 글의 표와 docs/reviews/database-memory-and-disk.md |
| transactions · uncommitted-invisible, autocommit-name | READ UNCOMMITTED·NOLOCK 예외, PostgreSQL은 BEGIN 없으면 문장마다 커밋, JDBC 기본 자동 커밋 | 글 본문과 docs/reviews/database-transactions.md |
| logs-and-recovery · log-grows-causes, wal-name | 로그가 비워지지 않는 까닭(열린 트랜잭션·보관/백업·복제), Oracle·InnoDB는 리두 로그 | 글 본문과 docs/reviews/database-logs-and-recovery.md |
| concurrency · sqlserver-default-read | SQL Server는 READ_COMMITTED_SNAPSHOT 꺼진 기본에서 읽기도 공유 잠금으로 기다림 | 글 본문과 docs/reviews/database-concurrency.md |
| active-sessions · idle-wait-excluded, aas-calculation | ClientRead는 쉬는 대기, AAS = DB time ÷ 경과 시간(4개 × 30분 → 4) | 글 본문과 docs/reviews/database-active-sessions.md |
| top-sql · constants-grouped, cumulative-graph | pg_stat_statements는 상수만 다른 SQL을 묶고 값은 누적 | 글 본문과 docs/reviews/database-top-sql.md |
| execution-plans · cost-not-ms, loops-multiply, analyze-runs-dml | cost는 임의 단위, 표시 시간은 loops 한 번 평균, EXPLAIN ANALYZE는 실제 실행 | 글 본문과 docs/reviews/database-execution-plans.md |
| locks-and-blocking · select-behind-alter, deadlock-resolution, consistent-lock-order | ACCESS EXCLUSIVE는 모든 잠금과 충돌, 교착 시 한쪽을 에러로 끝냄, 일관된 잠금 순서 권장 | 글 본문과 docs/reviews/database-locks-and-blocking.md |
| replication-lag · replay-lag-null, slot-fills-disk, long-query-on-replica | replay_lag NULL의 뜻, 슬롯이 WAL을 잡아 둠, 충돌 시 재생을 미룬 뒤 조회 취소 | 글 본문과 docs/reviews/database-replication-lag.md |
| buffer-cache-hit-ratio · shared-buffers-start, read-not-always-disk | 1GB 넘는 전용 서버는 메모리 25%에서 시작, 기본 보통 128MB, blks_read는 OS 캐시일 수 있음 | 글 본문과 docs/reviews/database-buffer-cache-hit-ratio.md |
| too-many-connections · admin-reserved, hikari-min-idle, pgbouncer-transaction-mode | superuser_reserved_connections 기본 3, HikariCP minimumIdle 기본은 maximumPoolSize와 같음, PgBouncer transaction 모드 | 글 본문과 docs/reviews/database-too-many-connections.md |
| slow-database · blocking-pids-name | pg_blocking_pids(pid)는 막고 있는 세션들의 pid를 돌려줌 | 글 본문과 docs/reviews/database-slow-database.md |

## 2026-10-30 검사 규칙에 맞춰 고치기

정답 보기만 길던 15문제를 줄이고 자세한 말은 해설로 옮겼어요. 새로 확인한 주장만 적어요.

| 문제 | 주장 | 근거 |
| --- | --- | --- |
| stop-long-query · idle-in-tx-timeout-target | idle_in_transaction_session_timeout은 트랜잭션을 연 채 쉬는 세션만 끊고, 트랜잭션 밖에서 쉬는 세션은 idle_session_timeout이 맡음 | https://www.postgresql.org/docs/18/runtime-config-client.html |
| too-many-connections · pgbouncer-transaction-mode | transaction 모드는 트랜잭션이 끝나면 서버 연결을 풀로 돌려받음, 기본 pool_mode는 session | https://www.pgbouncer.org/config.html |
