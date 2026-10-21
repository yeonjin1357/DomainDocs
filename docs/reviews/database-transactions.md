# 사실 확인: 트랜잭션과 커밋

- 글: src/content/docs/database/transactions.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 전부 아니면 전무, 이체 예, 커밋을 알린 변경은 장애에도 남음, 열린 트랜잭션의 변경은 끝날 때 한꺼번에 보임, BEGIN이 없으면 문장마다 커밋 | https://www.postgresql.org/docs/current/tutorial-transactions.html |
| MySQL 새 연결은 자동 커밋, autocommit=0이면 늘 트랜잭션이 열림 | https://dev.mysql.com/doc/refman/8.4/en/innodb-autocommit-commit-rollback.html |
| Oracle 트랜잭션은 첫 SQL에서 시작, COMMIT·ROLLBACK·DDL로 끝남, 정상 종료는 커밋, 비정상 종료는 롤백 | https://docs.oracle.com/en/database/oracle/oracle-database/19/cncpt/transactions.html |
| JDBC 연결은 기본 자동 커밋, 끄면 commit을 불러야 저장 | https://docs.oracle.com/en/java/javase/21/docs/api/java.sql/java/sql/Connection.html |
| 잠금은 보통 트랜잭션 끝까지 | https://www.postgresql.org/docs/current/explicit-locking.html (database-active-sessions 검토에서 확인) |
| 기본 격리 수준(PostgreSQL·SQL Server READ COMMITTED, InnoDB REPEATABLE READ), READ UNCOMMITTED의 dirty read, NOLOCK이 같은 효과, PostgreSQL은 READ COMMITTED처럼 동작 | https://www.postgresql.org/docs/current/transaction-iso.html, https://learn.microsoft.com/en-us/sql/t-sql/statements/set-transaction-isolation-level-transact-sql, https://dev.mysql.com/doc/refman/8.4/en/innodb-transaction-isolation-levels.html |
| xact_commit, xact_rollback, xact_start | https://www.postgresql.org/docs/current/monitoring-stats.html |

- 고친 것: "커밋 전 변경은 남에게 안 보여요"가 READ UNCOMMITTED에서는 틀려서 "기본 설정에서는"을 붙였어요. NOLOCK 확인 항목과 격리 수준 설명을 더했어요.
