# 사실 확인: 쿼리 하나가 DB를 지나가는 길

- 글: src/content/docs/database/overview.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 연결 → 해석 → 계획(가장 싼 경로) → 실행 → 결과 | https://www.postgresql.org/docs/current/query-path.html "the cost for the execution of each path is estimated and the cheapest path is chosen" |
| 해석은 문법과 테이블·열이 있는지 확인 | https://docs.oracle.com/en/database/oracle/oracle-database/19/tgsql/sql-processing.html "whether the objects and columns in the statement exist" |
| 결과 행을 연결로 돌려줌 | https://learn.microsoft.com/en-us/sql/relational-databases/query-processing-architecture-guide "returns the result set to the client" |
| 바뀐 내용을 로그에 먼저 적고, 커밋 때 데이터 파일을 바로 쓰지 않아도 되며, 장애 뒤 로그로 되살림 | https://www.postgresql.org/docs/current/wal-intro.html "changes to data files … must be written only after those changes have been logged", "we do not need to flush data pages to disk on every transaction commit … recover the database using the log" |

- 고친 것: 목록 항목을 해요체 문장으로 바꿨어요.
