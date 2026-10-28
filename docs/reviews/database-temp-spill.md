# 사실 확인: 정렬·해시가 디스크로 넘칠 때

- 글: src/content/docs/database/temp-spill.mdx
- 확인일: 2026-10-28

| 확인한 주장 | 근거(URL) |
| --- | --- |
| work_mem 기본 4MB, 정렬·해시 단계마다의 한도, 여러 단계·여러 세션이 동시에 쓰면 전체는 몇 배, 해시 한도는 work_mem × hash_mem_multiplier(기본 2.0) | https://www.postgresql.org/docs/18/runtime-config-resource.html |
| temp_file_limit 기본 -1(제한 없음), 한 프로세스가 동시에 쓰는 임시 파일 합계를 막고 넘으면 취소 | 같은 문서 |
| log_temp_files 기본 -1(꺼짐), 0이면 모든 임시 파일을 지울 때 바이트 크기로 기록 | https://www.postgresql.org/docs/18/runtime-config-logging.html |
| pg_stat_database.temp_files·temp_bytes는 이유와 log_temp_files 설정과 무관하게 모든 임시 파일을 셈 | https://www.postgresql.org/docs/18/monitoring-stats.html |
| pg_stat_statements.temp_blks_written | https://www.postgresql.org/docs/18/pgstatstatements.html |
| 해시 표시 `Buckets: %d (originally %d)  Batches: %d (originally %d)` | https://github.com/postgres/postgres/blob/REL_18_STABLE/src/backend/commands/explain.c |
| MySQL tmp_table_size 기본 16777216, Created_tmp_disk_tables는 디스크에 만든 내부 임시 표 수 | https://dev.mysql.com/doc/refman/8.4/en/server-system-variables.html , https://dev.mysql.com/doc/refman/8.4/en/server-status-variables.html |
| Oracle 임시 테이블스페이스에 정렬 중간 결과 등을 둠 | https://docs.oracle.com/en/database/oracle/oracle-database/23/admin/managing-tablespaces.html |
| SQL Server tempdb에 정렬 작업 테이블, 해시 작업 파일을 둠 | https://learn.microsoft.com/en-us/sql/relational-databases/databases/tempdb-database |

- 재현(WSL Ubuntu, embedded-postgres로 띄운 PostgreSQL 18.4):
  - 기본값 출력: work_mem 4MB, hash_mem_multiplier 2, temp_file_limit -1.
  - `log_temp_files=0` 로그: `LOG: temporary file: path "base/pgsql_tmp/pgsql_tmp650.0", size 16588800`, 다음 줄 STATEMENT.
  - 200만 행, `max_parallel_workers_per_gather = 0`, 5번 중앙값: 4MB 정렬 `external merge Disk: 99904kB` 1604ms, 512MB 정렬 `quicksort Memory: 174153kB` 2120ms. 해시 조인 4MB `Batches: 16` 761ms, 512MB `Batches: 1` 1270ms. 16MB·64MB도 사이 값이었어요.
  - 해시 집계(`enable_sort = off`): `Batches: 9 Memory Usage: 8281kB Disk Usage: 23736kB`.
  - `temp_file_limit = '1MB'`: `ERROR: temporary file size exceeds "temp_file_limit" (1024kB)`, SQLSTATE 53400.
- 글의 방향: 이 환경에서는 넘친 쪽이 느리지 않아서, "넘치면 느리다"가 아니라 "넘친 게 문제인지 먼저 본다"로 썼어요. 디스크와 캐시 상황에 따라 달라질 수 있다는 점을 본문에 밝혔어요.
- 함께 한 것: 용어 work-mem, temp-file을 올리고 퀴즈 5문제를 썼어요.
