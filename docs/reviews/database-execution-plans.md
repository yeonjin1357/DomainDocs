# 사실 검토: 실행 계획 읽기

- 글: src/content/docs/database/execution-plans.mdx
- 검토일: 2026-10-15
- 방식: 초안을 다 쓴 뒤 따로 검토했어요(서브 에이전트 없이). PostgreSQL 18 문서 원문과 대조했고, 그림의 상황을 PGlite 0.5.10(PostgreSQL 18.6)에서 재현했어요(`scratchpad/pglite/check.mjs`).
- 결과: 수정 필요 1건 / 확인 12건

| 주장(인용) | 판정 | 근거(URL과 짧은 인용) | 수정 제안 |
| --- | --- | --- | --- |
| 그림·핵심 2·3 "10건을 예상 … 48,000건 … 48,000번", "0.03ms × 48,000 = 1,440ms" | 재현과 다름 | 재현하니 바깥 표(customers)의 예상은 8건, 실제는 12,000건이고, 안쪽 Index Scan은 `loops=12000`이었어요. 48,000건은 조인 결과(주문) 행 수예요. 시간은 재현 환경(WASM)에서 의미가 없어 뺐어요. | 그림을 예상 8건·실제 12,000건·반복 12,000번·ANALYZE 뒤 예상 11,978건(Hash Join)으로 바꾸고, 핵심 3은 "한 번에 0.1ms라도 12,000번이면 1,200ms"로 고침 |
| 재현 결과: 낡은 통계 → Nested Loop, `ANALYZE` 뒤 → Hash Join | 맞음 | `Seq Scan on customers c (… rows=8 …) (actual rows=12000.00 loops=1)`, `Index Scan using orders_customer_id_idx on orders o (… rows=4 …) (actual rows=4.00 loops=12000)`. `ANALYZE customers` 뒤 `Hash Join (… rows=47912 …)`, `Seq Scan on customers c (… rows=11978 …)` | — |
| 핵심 1 노드 나무, 맨 아래는 스캔, Seq·Index Scan | 맞음 | https://www.postgresql.org/docs/current/using-explain.html "The structure of a query plan is a tree of plan nodes. Nodes at the bottom level of the tree are scan nodes: they return raw rows from a table." | — |
| 핵심 1·확인 2 `cost`는 임의 단위, 관례로 페이지 읽기 1 | 맞음 | "The costs are measured in arbitrary units determined by the planner's cost parameters", "Traditional practice is to measure the costs in units of disk page fetches; that is, seq_page_cost is conventionally set to 1.0" | — |
| 핵심 2 예상 행 수가 가장 중요 | 맞음 | "The thing that's usually most important to look for is whether the estimated row counts are reasonably close to reality." | — |
| 핵심 3 loops면 평균, 곱해야 전체 | 맞음 | "the loops value reports the total number of executions of the node, and the actual time and rows values shown are averages per-execution … Multiply by the loops value to get the total time actually spent in the node." | — |
| 확인 1 ANALYZE는 실제 실행, BEGIN·ROLLBACK | 맞음 | https://www.postgresql.org/docs/current/sql-explain.html "Keep in mind that the statement is actually executed when the ANALYZE option is used.", 예 `BEGIN; EXPLAIN ANALYZE …; ROLLBACK;` | — |
| 확인 3 통계가 낡으면 계획이 나빠짐 | 맞음 | https://www.postgresql.org/docs/current/routine-vacuuming.html "It is important to have reasonably accurate statistics, otherwise poor choices of plans might degrade database performance." 재현에서도 그랬어요. | — |
| 확인 4 auto_explain, 기본 -1 | 맞음 | https://www.postgresql.org/docs/current/auto-explain.html "the minimum statement execution time, in milliseconds, that will cause the statement's plan to be logged … -1 (the default) disables logging of plans." | — |
| 더 깊이 출력 예와 0.003 × 10 = 0.030 | 맞음 | 문서 예 `Index Scan using tenk2_unique2 on tenk2 t2 (cost=0.29..7.90 rows=1 width=244) (actual time=0.003..0.003 rows=1.00 loops=10)`, "we spent a total of 0.030 milliseconds executing the index scans on tenk2". 글은 일부를 줄였다고 밝혔어요. | — |
| 더 깊이 cost 예 445 | 맞음 | 문서 "(345 * 1.0) + (10000 * 0.01)". 재현에서도 324페이지·50,000행 표의 Seq Scan cost가 324 + 500 = 824로 같은 식이었어요. | — |
| 더 깊이 Execution time에 드는 것 | 맞음 | "The Execution time shown by EXPLAIN ANALYZE includes executor start-up and shut-down time, as well as the time to run any triggers that are fired, but it does not include parsing, rewriting, or planning time." | — |
| 더 깊이 `pg_statistic`, ANALYZE·VACUUM ANALYZE, 근삿값 | 맞음 | https://www.postgresql.org/docs/current/planner-stats.html "Entries in pg_statistic are updated by the ANALYZE and VACUUM ANALYZE commands, and are always approximate even when freshly updated." | — |

## 반영

- 그림과 핵심 2·3을 재현 결과에 맞췄어요. 그림 제목도 "VIP 고객 주문 조회"로 바꿨어요.
