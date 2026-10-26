# 사실 확인: 인덱스가 있는데도 안 쓰일 때

- 글: src/content/docs/database/index-not-used.mdx
- 확인일: 2026-10-26

| 확인한 주장 | 근거(URL) |
| --- | --- |
| B-tree는 앞부분이 고정된 상수 패턴(`col LIKE 'foo%'`)에 쓸 수 있고 `'%bar'`에는 못 씀, C 로케일이 아니면 특별한 연산자 클래스가 필요 | https://www.postgresql.org/docs/current/indexes-types.html |
| `lower(col1)` 같은 식으로 인덱스를 만들면 그 식의 조건에 쓸 수 있음 | https://www.postgresql.org/docs/current/indexes-expressional.html |
| `text_pattern_ops`는 로케일 규칙 대신 글자 단위로 비교해 패턴 검색을 도움, C 로케일이면 필요 없음 | https://www.postgresql.org/docs/current/indexes-opclass.html |
| 복합 B-tree 인덱스는 앞 열 조건이 있을 때 가장 효율적, skip scan이 되면 더 많은 경우에 씀 | https://www.postgresql.org/docs/current/indexes-multicolumn.html |
| PostgreSQL 18에서 복합 B-tree 인덱스의 skip scan 추가 | https://www.postgresql.org/docs/18/release-18.html |
| pg_trgm의 GIN·GiST 인덱스는 LIKE, ILIKE 등의 검색을 지원 | https://www.postgresql.org/docs/current/pgtrgm.html |

- 재현: PGlite 0.3.16(PostgreSQL 17.5, 로케일 C)에서 회원 20만 명 표에 email, (city, district), created_at, status 인덱스를 만들고 `ANALYZE`한 뒤 계획을 봤어요. PGlite는 기본으로 `enable_seqscan`이 off라, `on`으로 바꾸고 쟀어요.
  - `email = …`: Index Scan. `lower(email) = …`: Seq Scan, `lower(email)` 식 인덱스를 만든 뒤 Index Scan.
  - `id = 42`: Index Scan. `id = 42.0`: Seq Scan, 조건 `((id)::numeric = 42.0)`.
  - `LIKE 'user42@%'`: Index Scan(범위로 바뀜). `LIKE '%42@example.com'`: Seq Scan.
  - `city`와 `district` 둘 다: Bitmap Index Scan 비용 약 6. `district`만: Bitmap Index Scan 비용 약 2,228.
  - `status = 'done'`(99%): Seq Scan. `status = 'pending'`(1%): Index Scan.
  - `date(created_at …) = …`: Seq Scan. 하루 범위 조건: Index Scan.
- 함께 한 것: 퀴즈 5문제를 썼어요.
