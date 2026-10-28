# 사실 확인: 테이블스페이스와 언두·임시 공간

- 글: src/content/docs/database/tablespaces.mdx
- 확인일: 2026-10-28

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 테이블스페이스는 세그먼트를 담는 논리적인 그릇, 물리적으로 데이터 파일이나 임시 파일 하나 이상, SYSTEM·SYSAUX·언두·임시 테이블스페이스의 쓰임 | https://docs.oracle.com/en/database/oracle/oracle-database/23/cncpt/logical-storage-structures.html |
| 임시 테이블스페이스에 정렬 중간 결과, 임시 표·인덱스 등을 둠, 데이터 파일 AUTOEXTEND·MAXSIZE | https://docs.oracle.com/en/database/oracle/oracle-database/23/admin/managing-tablespaces.html |
| UNDO_RETENTION 기본 900초(최소 보관 목표), 자동 확장 언두는 보관 시간을 지키려 먼저 늘리고 MAXSIZE에 닿으면 만료 전 언두도 덮어쓸 수 있음, 고정 크기 언두에서는 무시, 가장 긴 조회보다 조금 길게 자동 조정 | https://docs.oracle.com/en/database/oracle/oracle-database/23/refrn/UNDO_RETENTION.html , https://docs.oracle.com/en/database/oracle/oracle-database/23/admin/managing-undo.html |
| ORA-01555 원인: 일관된 읽기에 필요한 언두를 다른 쓰기가 덮어씀 | https://docs.oracle.com/en/error-help/db/ora-01555/ |
| ORA-01652(23 문구 'unable to grow … in tablespace …'), ORA-01653(insert·update 중 테이블스페이스를 늘릴 수 없음) | https://docs.oracle.com/en/error-help/db/ora-01652/ , https://docs.oracle.com/en/error-help/db/ora-01653/ |
| DBA_TABLESPACE_USAGE_METRICS.TABLESPACE_SIZE는 자동 확장 파일이 있으면 커질 수 있는 최대 크기 | https://docs.oracle.com/en/database/oracle/oracle-database/23/refrn/DBA_TABLESPACE_USAGE_METRICS.html |
| PostgreSQL 테이블스페이스는 파일 시스템 위치, 처음에 두 개(pg_default, pg_global) | https://www.postgresql.org/docs/18/manage-ag-tablespaces.html |

- 재현: PostgreSQL 18.4의 `pg_tablespace`는 `pg_default`, `pg_global` 두 줄이었어요. 임시 파일 경로가 `base/pgsql_tmp`(기본 테이블스페이스 안)였어요.
- 「모니터링에서는」의 사용률 숫자(96%, 48%)는 예시예요.
- 함께 한 것: 용어 tablespace, data-file을 올리고, 언두 용어로 이었어요. DB 개요 글과 관련 글 세 편에 이 글을 이었어요. 퀴즈 5문제를 썼어요.
