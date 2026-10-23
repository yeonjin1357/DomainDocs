# 사실 확인: DB 저장 공간이 계속 늘 때

- 글: src/content/docs/database/storage-growing.mdx
- 확인일: 2026-10-23

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 자동 VACUUM 기준은 `autovacuum_vacuum_threshold`(50) + `autovacuum_vacuum_scale_factor`(0.2) × 행 수 | https://www.postgresql.org/docs/current/runtime-config-vacuum.html |
| PostgreSQL 18의 `autovacuum_vacuum_max_threshold` 기본 100,000,000(1억 행 상한) | https://www.postgresql.org/docs/current/runtime-config-vacuum.html |
| 보통 VACUUM은 공간을 다시 쓰게 표시할 뿐 대개 돌려주지 않고, 표 끝 페이지가 비면 줄임 | https://www.postgresql.org/docs/current/routine-vacuuming.html |
| VACUUM FULL은 ACCESS EXCLUSIVE 잠금, 새 사본을 다 쓸 때까지 옛 사본을 남겨 공간이 더 듦 | https://www.postgresql.org/docs/current/sql-vacuum.html |
| 오래된 트랜잭션은 `pg_stat_activity`의 `age(backend_xmin)`으로 찾으라고 함, 복제 슬롯도 정리를 붙잡음 | https://www.postgresql.org/docs/current/routine-vacuuming.html |
| `max_slot_wal_keep_size` 기본 -1(한도 없음) | https://www.postgresql.org/docs/current/runtime-config-replication.html |
| `pg_replication_slots`의 `active`, `wal_status`, `xmin` 열 | https://www.postgresql.org/docs/current/view-pg-replication-slots.html |
| `pg_total_relation_size`(표+인덱스+TOAST), `pg_indexes_size`, `pg_relation_size` | https://www.postgresql.org/docs/current/functions-admin.html |
| `pg_stat_user_tables`의 `n_live_tup`, `n_dead_tup`, `last_autovacuum`, `pg_stat_user_indexes`의 `idx_scan` | https://www.postgresql.org/docs/current/monitoring-stats.html |
| MySQL InnoDB는 `innodb_file_per_table`일 때 `OPTIMIZE TABLE`로 표를 다시 정리해 공간을 운영체제에 돌려줌 | https://dev.mysql.com/doc/refman/8.4/en/optimize-table.html |

- 질의 확인: 본문의 SQL 네 개를 PGlite(PostgreSQL 17.5)에서 돌려 문법과 열 이름을 확인했어요. PGlite는 통계를 모으지 않아 `n_dead_tup` 같은 값은 0으로 나왔어요.
- 그림 확인: PGlite에서 행 2만 개 중 1만 5천 개를 바꾸고 2천 개를 지운 뒤 잰 표 크기예요. 정리 전 8,488kB, VACUUM 뒤 8,488kB, VACUUM FULL 뒤 4,368kB였어요.
- 함께 한 것: 퀴즈 5문제. `slot-wal-default`는 위 `max_slot_wal_keep_size` 근거와 같아요.
