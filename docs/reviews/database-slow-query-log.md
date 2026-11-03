# 사실 확인: 슬로 쿼리 로그

- 글: src/content/docs/database/slow-query-log.mdx
- 확인일: 2026-11-03

| 확인한 주장 | 근거(URL) |
| --- | --- |
| PG `log_min_duration_statement` 기본 -1(끔), 단위 ms, 0이면 모두, 끝난 SQL만 남겨요 | https://www.postgresql.org/docs/current/runtime-config-logging.html, 실제 PG 18.4(embedded-postgres)에서 `pg_settings` 확인 |
| PG 로그 줄 모양 `LOG:  duration: 201.979 ms  statement: select pg_sleep(0.2)`, 바인드 변수는 `execute <unnamed>:` + `DETAIL:  Parameters: $1 = '0.15'` | 실제 PG 18.4에서 기준 100ms로 남긴 줄 |
| PG에서 행 잠금을 2.5초 기다린 UPDATE가 `duration: 2515.346 ms`로 남아요 | 실제 PG 18.4(기준 1초) |
| PG에서 `statement_timeout`(1.5초)으로 취소된 SQL은 duration 줄 없이 `ERROR: canceling statement due to statement timeout` + `STATEMENT:` 줄만 남아요 | 실제 PG 18.4(`log_min_error_statement` 기본 error) |
| PG는 `ALTER SYSTEM` + `pg_reload_conf()` 뒤 열린 세션에서도 `show log_min_duration_statement`가 1s | 실제 PG 18.4 |
| `log_min_duration_sample`, `log_statement_sample_rate`는 PG 13부터, 기준을 넘은 SQL은 표본과 상관없이 늘 남아요 | PG 12 문서에 없음, PG 13 문서에 있음. https://www.postgresql.org/docs/13/runtime-config-logging.html |
| `auto_explain.log_min_duration` 기본 -1, `log_analyze`는 모든 SQL에 시간을 재는 부담 | https://www.postgresql.org/docs/current/auto-explain.html |
| MySQL 8.4 기본값: `slow_query_log` 0, `long_query_time` 10, `log_output` FILE, `min_examined_row_limit` 0, `log_queries_not_using_indexes` 0, 파일은 datadir의 `호스트이름-slow.log` | 실제 MySQL 8.4.10(WSL, 최소 배포판)에서 `select @@...` |
| MySQL 로그 모양(`# Time` UTC, `# User@Host`, `# Query_time … Lock_time … Rows_sent … Rows_examined`, `SET timestamp`), 1행 돌려주려 30만 행 살핀 조회가 `Rows_examined: 300000` | 실제 MySQL 8.4.10 |
| MySQL 8.4에서 행 잠금을 2.5초 기다린 UPDATE: `Query_time: 2.527194  Lock_time: 2.511729`로 남아요 | 실제 MySQL 8.4.10(기준 1초) |
| MySQL 8.4에서 `LOCK TABLES`로 2.5초 막힌 SELECT: `Query_time: 2.490423  Lock_time: 0.000001` | 실제 MySQL 8.4.10 |
| MySQL 8.4에서 2초 만에 `KILL QUERY`로 멈춘 조인도 `Query_time: 2.019442`로 남아요 | 실제 MySQL 8.4.10 |
| MySQL `SET GLOBAL long_query_time=1` 뒤 열린 연결은 10 그대로, 새 연결은 1 | 실제 MySQL 8.4.10 |
| MySQL은 SQL이 끝나고 잠금을 푼 뒤 적어요, `SET timestamp`는 시작 시각, 비밀번호는 바꿔 적어요, `long_query_time`은 마이크로초까지 | https://dev.mysql.com/doc/refman/8.4/en/slow-query-log.html |
| `log_slow_extra`를 켜면 `Errno`, `Killed`, `Start`, `End` 같은 칸이 붙어요 | 실제 MySQL 8.4.10 로그 |
| RDS MySQL `log_output` 기본 TABLE(`mysql.slow_log`), CloudWatch Logs로 보내려면 FILE | https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_LogAccess.MySQL.LogFileSize.html |
| SQL Server Query Store는 2022부터 새 DB에 기본으로 켜져요 | https://learn.microsoft.com/en-us/sql/relational-databases/performance/monitoring-performance-by-using-the-query-store |

- 고친 것: Deeper의 `LOCK TABLES` 예에서 `Lock_time`을 "0"이 아니라 "거의 0"으로(실제 0.000001초).
- 예시 숫자: 로그양 그림(초당 1,000번, 100ms 초과 1%, 1초 초과 0.01%, 한 줄 200바이트)은 설명용 가정이에요. 8,640만 × 200B ≈ 17.3GB.
