# 사실 확인: 인덱스

- 글: src/content/docs/database/indexes.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 인덱스가 없으면 테이블을 한 행씩 다 읽음, 있으면 트리를 몇 단계 내려감, 책 찾아보기 비유 | https://www.postgresql.org/docs/current/indexes-intro.html "scan the entire test1 table, row by row", "walk a few levels deep into a search tree", "alphabetic index at the end of the book" |
| 테이블이 바뀌면 인덱스도 고침, 쓰기 비용, 안 쓰는 인덱스는 지우라 | 같은 문서 "This adds overhead to data manipulation operations", "indexes that are seldom or never used in queries should be removed" |
| 기본 인덱스는 B-tree | https://www.postgresql.org/docs/current/indexes-types.html "By default, the CREATE INDEX command creates B-tree indexes", SQL Server 문서 "stored in a structure (B-tree)" |
| 행을 많이 가져오면 전체 읽기가 더 쌀 수 있음, 인덱스는 열이 적고 정렬돼 빠름 | https://learn.microsoft.com/en-us/sql/relational-databases/indexes/clustered-and-nonclustered-indexes-described "a table scan could be the most efficient method if … a high percentage of rows" |
| 함수를 씌운 조건은 식 인덱스가 있어야 씀 | https://www.postgresql.org/docs/current/indexes-expressional.html "This query can use an index if one has been defined on the result of the lower(col1) function" (보통 인덱스로 찾기 어렵다는 건 정렬 기준이 다르다는 데서 나온 설명이에요) |
| 복합 인덱스는 앞 열 조건이 있을 때 가장 효율적 | https://www.postgresql.org/docs/current/indexes-multicolumn.html "most efficient when there are constraints on the leading (leftmost) columns" |
| PostgreSQL·Oracle 테이블은 기본 힙 | PostgreSQL storage-page-layout "a particular item (row) can be stored in any page", https://docs.oracle.com/en/database/oracle/oracle-database/19/cncpt/tables-and-table-clusters.html "By default, a table is organized as a heap" |
| InnoDB 클러스터형 인덱스·보조 인덱스에 기본 키 | https://dev.mysql.com/doc/refman/8.4/en/innodb-index-types.html |
| SQL Server 클러스터형 인덱스는 테이블마다 하나, 기본 키·유니크 제약이 인덱스를 자동으로 만듦 | SQL Server 문서 "You can have only one clustered index per table", "automatically creates indexes when you define PRIMARY KEY and UNIQUE constraints" |
| idx_scan | https://www.postgresql.org/docs/current/monitoring-stats.html pg_stat_all_indexes.idx_scan |
