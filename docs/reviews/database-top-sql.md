# 사실 검토: SQL별 부하 순위(Top SQL)

- 글: src/content/docs/database/top-sql.mdx
- 검토일: 2026-10-15
- 방식: 초안을 다 쓴 뒤 따로 검토했어요(서브 에이전트 없이). PostgreSQL 18 pg_stat_statements 문서 원문과 대조했고, 숫자는 손계산으로 확인했어요.
- 결과: 수정 필요 1건 / 확인 10건

| 주장(인용) | 판정 | 근거(URL과 짧은 인용) | 수정 제안 |
| --- | --- | --- | --- |
| 더 깊이 "`rows`는 돌려준 행 수예요." | 틀림 | https://www.postgresql.org/docs/current/pgstatstatements.html "rows: Total number of rows retrieved or affected by the statement" | "가져오거나 바꾼 행 수예요." |
| 그림 2,000초·50초, 2,500배·40배, 1ms 줄이면 1,000초 | 맞음 | 2ms × 1,000,000 = 2,000초, 5초 × 10 = 50초, 5초 ÷ 2ms = 2,500, 2,000 ÷ 50 = 40, 1ms × 1,000,000 = 1,000초 | — |
| 핵심 1 총 시간 = 호출 수 × 평균 | 맞음 | `mean_exec_time`은 `total_exec_time` ÷ `calls`예요("Mean time spent executing the statement"). | — |
| 핵심 2 상수 값만 다르면 한 항목, `$1`로 표시 | 맞음 | "two queries will be considered the same for this purpose if they are semantically equivalent except for the values of literal constants", "the constant is replaced by a parameter symbol, such as $1" | — |
| 핵심 3 누적값, 초기화 | 맞음 | 뷰는 `pg_stat_statements_reset` 뒤로 쌓이고, `stats_since`가 그 시작 시각이에요. | — |
| 확인 3 상한 기본 5,000, 적게 불린 것부터 버림, `pg_stat_statements_info` | 맞음 | "If more distinct statements than that are observed, information about the least-executed statements is discarded. The number of times such information was discarded can be seen in the pg_stat_statements_info view. The default value is 5000." | — |
| 확인 4 N+1 | 맞음 | apm-trace-waterfall 검토의 Sentry 근거와 같아요. | — |
| 더 깊이 열 이름과 단위(ms), 계획 시간은 `track_planning` | 맞음 | "total_exec_time … in milliseconds", "Total time spent planning the statement … (if pg_stat_statements.track_planning is enabled, otherwise zero)" | — |
| 더 깊이 `track` 기본 `top`, `all` | 맞음 | "Specify top to track top-level statements (those issued directly by clients), all to also track nested statements (such as statements invoked within functions) … The default value is top." | — |
| 더 깊이 `search_path`가 다르면 따로, `compute_query_id` 조건 | 맞음 | "queries with identical texts might appear as separate entries, if they have different meanings as a result of factors such as different search_path settings", "The following details about constant replacement and queryid only apply when compute_query_id is enabled." | — |
| 더 깊이 자주 버려지면 상수가 보이는 항목 | 맞음 | "Queries on which normalization can be applied may be observed with constant values in pg_stat_statements, especially when there is a high rate of entry deallocations. To reduce the likelihood of this happening, consider increasing pg_stat_statements.max." | — |

## 반영

- `rows` 설명을 고쳤어요. 질의는 pg_stat_statements 확장이 PGlite에 없어 돌리지 못했고, 열 이름은 문서 표와 대조했어요.
