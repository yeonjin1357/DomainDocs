# 사실 확인: 실행 계획이 갑자기 바뀌었을 때

- 글: src/content/docs/database/plan-changed.mdx
- 확인일: 2026-10-26

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 준비된 문장은 처음 다섯 번 맞춤 계획, 그 뒤 범용 계획이 평균 맞춤 계획보다 크게 비싸지 않으면 범용 계획 사용 | https://www.postgresql.org/docs/current/sql-prepare.html |
| `plan_cache_mode`는 auto(기본), force_custom_plan, force_generic_plan | https://www.postgresql.org/docs/current/runtime-config-query.html |
| 자동 ANALYZE 기준 `autovacuum_analyze_threshold` 50, `autovacuum_analyze_scale_factor` 0.1 | https://www.postgresql.org/docs/current/runtime-config-vacuum.html |
| `pg_stat_user_tables`의 `n_mod_since_analyze`, `last_analyze`, `last_autoanalyze` | https://www.postgresql.org/docs/current/monitoring-stats.html |
| auto_explain은 `log_min_duration`보다 오래 걸린 문장의 계획을 로그에 남김 | https://www.postgresql.org/docs/current/auto-explain.html |
| 플래너는 여러 조건을 서로 독립이라고 가정해, 상관된 열에서 나쁜 계획이 흔함, 다변량 통계로 보완 | https://www.postgresql.org/docs/current/planner-stats.html |
| MySQL InnoDB는 기본으로 통계를 디스크에 두고, 행의 10%가 넘게 바뀌면 자동으로 다시 모음 | https://dev.mysql.com/doc/refman/8.4/en/innodb-persistent-stats.html |
| Oracle `PLAN_HASH_VALUE`로 두 계획이 같은지 바로 알 수 있음 | https://docs.oracle.com/en/database/oracle/oracle-database/19/refrn/V-SQL.html |
| SQL plan baseline은 옵티마이저가 쓸 수 있는 승인된 계획의 모음, 검증된 계획만 쓰게 함 | https://docs.oracle.com/en/database/oracle/oracle-database/19/tgsql/overview-of-sql-plan-management.html |

- 재현: PGlite 0.3.16(PostgreSQL 17.5)에서 주문 20만 건('pending' 200건, 나머지 'done')과 주문 상세 60만 건으로 준비된 조인 질의를 만들었어요.
  - 첫 실행의 'pending'은 Nested Loop, Execution Time 1.262ms였어요.
  - 'done'으로 다섯 번 실행한 뒤의 'pending'은 범용 계획(`status = $1`)의 Hash Join, 주문 상세 60만 행을 Seq Scan, 예상 100,000행에 실제 200행, Execution Time 125.259ms였어요.
  - 다섯 번 잰 가운데 값은 범용 계획 95.3ms, `force_custom_plan`은 2.2ms였어요.
- 고친 것(같은 날): PGlite 0.3.16은 기본으로 `enable_seqscan`이 off였어요. 처음 재현은 이 상태로 돌려서 범용 계획이 Seq Scan 대신 Index Scan으로 60만 행을 읽었고, 234ms가 나왔어요. `enable_seqscan = on`으로 실제 PostgreSQL 기본값에 맞춰 다시 재현하고, 그림을 1.3ms와 125ms로 고쳤어요. 계획이 Nested Loop에서 Hash Join으로 바뀌는 현상은 같았어요.
- 질의 확인: 3단계의 `pg_stat_user_tables` 질의를 PGlite에서 돌려 열 이름을 확인했어요. PGlite는 통계를 모으지 않아 `n_mod_since_analyze`는 0으로 나왔어요. 설정 기본값(50, 0.1, auto)도 PGlite의 `pg_settings`와 같았어요.
- 함께 한 것: 용어 `database/generic-plan`을 더했고, 퀴즈 5문제를 썼어요.
