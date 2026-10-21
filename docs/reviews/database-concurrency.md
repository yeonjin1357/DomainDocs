# 사실 확인: 동시에 읽고 쓰기

- 글: src/content/docs/database/concurrency.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| MVCC: 문장은 예전 시점의 스냅숏을 봄, 읽기와 쓰기가 서로 막지 않음 | https://www.postgresql.org/docs/current/mvcc-intro.html |
| 행 잠금은 조회를 막지 않고 같은 행을 쓰는 쪽만 막음, 교착은 일정한 순서로 잠가 피함 | https://www.postgresql.org/docs/current/explicit-locking.html |
| 옛 버전은 바로 안 지움, 볼 수 있는 동안 못 지움, VACUUM이 치움 | https://www.postgresql.org/docs/current/routine-vacuuming.html (오래 열린 트랜잭션이 청소를 막는다는 건 "still potentially visible to other transactions"에서 나온 설명이에요) |
| READ COMMITTED는 문장 시작 시점, REPEATABLE READ는 트랜잭션 첫 문장 시점 | https://www.postgresql.org/docs/current/transaction-iso.html |
| Oracle 언두로 읽기 일관성, 읽기·쓰기가 서로 막지 않음 | https://docs.oracle.com/en/database/oracle/oracle-database/19/cncpt/data-concurrency-and-consistency.html |
| InnoDB 언두 테이블스페이스·롤백 세그먼트, 일관된 읽기 | https://dev.mysql.com/doc/refman/8.4/en/innodb-multi-versioning.html |
| SQL Server 기본(READ_COMMITTED_SNAPSHOT 꺼짐)은 공유 잠금으로 읽기가 기다림, 켜면 행 버전 | https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql |
| n_dead_tup, deadlocks | https://www.postgresql.org/docs/current/monitoring-stats.html |
