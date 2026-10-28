# 사실 확인: 테이블 파티셔닝

- 글: src/content/docs/database/partitioning.mdx
- 확인일: 2026-10-28

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 범위·목록·해시 나누기, 가지치기, DROP·DETACH가 대량 DELETE보다 훨씬 빠르고 VACUUM 부담이 없음 | https://www.postgresql.org/docs/18/ddl-partitioning.html |
| 고유·기본 키에 기준 열이 모두 들어가야 함 | 같은 문서 |
| 가지치기로 대부분 빠지면 수천 개까지 무난, 칸이 많으면 계획 시간·메모리 증가, 표가 물리 메모리보다 클 때가 대략의 기준 | 같은 문서 |
| 범위 칸의 아래 끝은 포함, 위 끝은 제외, DEFAULT 칸 | https://www.postgresql.org/docs/18/sql-createtable.html |

- 재현(PostgreSQL 18.4): 2026년을 달마다 12칸으로 나누고 120만 행을 넣었어요.
  - 3월 범위 조건: `Seq Scan on events_2026_03`만. `body = 'x'` 조건: 12칸 모두 Seq Scan.
  - `PREPARE` + `plan_cache_mode = force_generic_plan`으로 날짜를 넣어 실행: `Subplans Removed: 11`.
  - `id`만으로 기본 키: 0A000 `unique constraint on partitioned table must include all partitioning columns`.
  - 칸이 없는 날짜 넣기: 23514 `no partition of relation "events" found for row`. 기본 칸을 둔 뒤 그 날짜 범위의 칸 만들기: `updated partition constraint for default partition "events_default" would be violated by some row`.
  - 나누지 않은 같은 데이터에서 1월 101,927행 DELETE 135ms(n_dead_tup 101,927), 1월 칸 DROP 6ms.
- 「모니터링에서는」의 크기 숫자(186MB)는 예시예요. 부모 표에 저장소가 없어 크기가 0인 것은 PostgreSQL의 파티션 표 동작이에요.
- 함께 한 것: 용어 partition, partition-pruning을 올리고, DB 개요 글과 「DB 저장 공간이 계속 늘 때」에 이 글을 이었어요. 퀴즈 5문제를 썼어요.
