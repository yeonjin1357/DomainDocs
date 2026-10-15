# 사실 검토: 버퍼 캐시 적중률의 함정

- 글: src/content/docs/database/buffer-cache-hit-ratio.mdx
- 검토일: 2026-10-15
- 방식: 초안을 다 쓴 뒤 따로 검토했어요(서브 에이전트 없이). PostgreSQL 18·Oracle 19c 문서 원문과 대조했어요. 그림의 숫자는 database-execution-plans 검토 때 PGlite 0.5.10(PostgreSQL 18.6)으로 재현한 `EXPLAIN (ANALYZE, BUFFERS)` 출력이에요.
- 결과: 수정 필요 1건 / 확인 12건

| 주장(인용) | 판정 | 근거(URL과 짧은 인용) | 수정 제안 |
| --- | --- | --- | --- |
| 핵심 3 "문서도 `shared_buffers`를 메모리의 25%쯤에서 시작하라고 해요." | 조건 빠짐 | https://www.postgresql.org/docs/current/runtime-config-resource.html "If you have a dedicated database server with 1GB or more of RAM, a reasonable starting value for shared_buffers is 25% of the memory" | "전용 서버의 `shared_buffers`를 …" |
| 그림 84,253·71·1,406, 99.9%·100%, 60배 | 맞음 | 재현 출력 `Buffers: shared hit=84253 read=71`(Nested Loop), `Buffers: shared hit=1406`(Hash Join). 84,253 ÷ 84,324 = 0.99916, 84,324 ÷ 1,406 = 59.97 | — |
| 핵심 1 블록 단위, 보통 8kB | 맞음 | 같은 설정 문서 "taken as blocks, that is BLCKSZ bytes, typically 8kB" | — |
| 핵심 2 반복해 훑으면 적중률이 인위적으로 부풂 | 맞음 | https://docs.oracle.com/en/database/oracle/oracle-database/19/tgdba/tuning-database-buffer-cache.html "Repeated scanning of the same large table or index can artificially inflate a low cache hit ratio. Examine frequently executed SQL statements with a large number of buffer gets" | — |
| 핵심 3 PostgreSQL 적중은 자기 캐시만 | 맞음 | https://www.postgresql.org/docs/current/monitoring-stats.html `blks_hit` "(this only includes hits in the PostgreSQL buffer cache, not the operating system's file system cache)" | — |
| 핵심 3 운영체제 캐시에 기댐 | 맞음 | "because PostgreSQL also relies on the operating system cache, it is unlikely that an allocation of more than 40% of RAM to shared_buffers will work better than a smaller amount" | — |
| 확인 2 낮은 적중률 ≠ 키우면 나아짐, 한 번만 읽는 데이터 | 맞음 | Oracle "A low cache hit ratio does not necessarily imply that increasing the size of the buffer cache will benefit performance.", "many rows are accessed only once (or never). Hence, there is no purpose in keeping the block in memory" | — |
| 확인 3 누적값이라 구간 차이로 | 맞음 | `pg_stat_database`는 누적 통계예요. Oracle도 "It is recommended to calculate the delta of these statistics over an interval" | — |
| 확인 4 `shared_blks_hit + shared_blks_read` | 맞음 | https://www.postgresql.org/docs/current/pgstatstatements.html "Total number of shared block cache hits by the statement", "Total number of shared blocks read by the statement" | — |
| 더 깊이 `blks_hit`·`blks_read` 정의 | 맞음 | "blks_read: Number of disk blocks read in this database", `blks_hit` 위 인용 | — |
| 더 깊이 질의 | 맞음 | PGlite에서 오류 없이 돌았어요(`postgres` 91.46%, `template0`는 0으로 나누지 않게 NULL). | — |
| 더 깊이 기본 128MB, 25%·40% | 맞음 | "The default is typically 128 megabytes (128MB)" 외 위 인용 | — |
| 더 깊이 Oracle 물리적 읽기 ≠ 디스크 읽기 | 맞음 | Oracle "physical reads do not necessarily indicate disk reads in Oracle Database, because physical reads may be accomplished by reading from the file system cache" | — |

## 반영

- 핵심 3의 조건을 더했어요.
