# 사실 확인: 트랜잭션 ID가 바닥날 때

- 글: src/content/docs/database/xid-wraparound.mdx
- 확인일: 2026-11-03

실험: Ubuntu 24.04 저장소의 PostgreSQL 16.15 패키지를 WSL ~/pgx에 풀고(sudo 없이 apt-get download + dpkg -x), `pg_resetwal -x`로 다음 XID를 한계 가까이 옮겨 띄웠어요(pg_xact 세그먼트 파일은 0으로 채워 만듦).

| 확인한 주장 | 근거(URL) |
| --- | --- |
| XID는 32비트, 약 21억(2^31)을 과거로 봄, 얼린 행은 늘 과거, 20억 트랜잭션마다 모든 표를 VACUUM해야 함 | https://www.postgresql.org/docs/current/routine-vacuuming.html |
| 한계 4천만 전 WARNING, 3백만 전부터 새 XID 거부, 그때도 읽기 전용은 됨 | 같은 문서. 실험: 3천만 남기니 `WARNING: database "template1" must be vacuumed within 29999999 transactions`, 2백만 남기니 쓰기 거부, `select 1`은 됨 |
| PG 16 문구: `database is not accepting commands to avoid wraparound data loss`, HINT `Stop the postmaster and vacuum that database in single-user mode.` | 실험(PG 16.15), https://www.postgresql.org/docs/16/routine-vacuuming.html |
| PG 17부터 문구 `commands that assign new transaction IDs`, HINT `Execute a database-wide VACUUM`, single-user 모드는 될 수 있으면 피하라는 문서 | https://www.postgresql.org/docs/17/routine-vacuuming.html |
| PG 16에서도 거부 상태에서 일반 접속으로 DB마다 VACUUM하니 age 0, CREATE TABLE 성공 | 실험(PG 16.15) |
| 막는 것: 준비된 트랜잭션(pg_prepared_xacts), 오래 열린 트랜잭션(pg_stat_activity backend_xid·backend_xmin), 오래된 복제 슬롯(pg_replication_slots xmin·catalog_xmin) | 같은 문서. 실험: 셋을 만들고 글의 SQL로 모두 찾음(나이 101~102) |
| VACUUM VERBOSE 출력 `removable cutoff: 731, which was 302 XIDs old when operation ended` | 실험(PG 16.15) |
| autovacuum_freeze_max_age 기본 2억, 꺼도 강제 autovacuum은 돎 | https://www.postgresql.org/docs/current/runtime-config-vacuum.html, routine-vacuuming |
| vacuum_failsafe_age 기본 16억, 비용 지연 해제·인덱스 정리 같은 일 건너뜀 | runtime-config-vacuum |
| `(to prevent wraparound)` autovacuum은 저절로 끊기지 않음 | routine-vacuuming |
| 카탈로그까지 처리하려면 슈퍼유저로 VACUUM | routine-vacuuming |
| RDS `MaximumUsedTransactionIDs` | https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-metrics.html |

- 계산: 경고 2,147,483,648 − 40,000,000 = 2,107,483,648(98.1%), 거부 2,144,483,648.
- 고친 것: autovacuum을 끊으면 '처음부터'가 아니라 '끝까지 마쳐야 나이가 줄어요'로, 슬롯이 '클러스터 전체'가 아니라 '모든 데이터베이스의 얼리기를 붙잡을 수 있어요'로(논리 슬롯은 카탈로그만 붙잡음).
