# 사실 확인: SQL이 실행되는 과정

- 글: src/content/docs/database/query-processing.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 해석 → 계획(여러 경로의 비용을 어림해 가장 싼 것) → 실행(정렬·조인) | https://www.postgresql.org/docs/current/query-path.html |
| 옵티마이저는 비용 기반이고 통계에 기댐 | https://learn.microsoft.com/en-us/sql/relational-databases/query-processing-architecture-guide "The Query Optimizer is a cost-based optimizer", "relies on statistics when it estimates the resource costs" |
| SQL Server 계획 캐시: 있으면 다시 컴파일하지 않고 씀 | 같은 문서 "reuses any existing plan it finds, saving the overhead of recompiling" |
| Oracle 공유 풀 확인, 해시 값, 소프트 파스는 최적화를 건너뜀 | https://docs.oracle.com/en/database/oracle/oracle-database/19/tgsql/sql-processing.html "uses a hashing algorithm to generate a hash value for every SQL statement", "skips the optimization and row source generation steps" |
| 값만 다른 SQL은 새 SQL로 하드 파스, 바인드 변수면 계획 공유, 하드 파스가 늘면 메모리와 공유 풀 래치 대기가 늘어남 | https://docs.oracle.com/en/database/oracle/oracle-database/19/tgsql/improving-rwp-cursor-sharing.html "as a completely new statement, requiring a hard parse", "must consume more memory", "so does the number of processes waiting to latch the shared pool" |
| PostgreSQL PREPARE는 세션 동안만, 여러 클라이언트가 함께 못 씀, 처음 5번 맞춤 계획 | https://www.postgresql.org/docs/current/sql-prepare.html |
| MySQL 준비 문장 캐시는 세션마다, 다른 세션 접근 불가, 세션 끝나면 버림 | https://dev.mysql.com/doc/refman/8.4/en/statement-caching.html |
| 파라미터 쿼리가 SQL 인젝션을 막음 | https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html |
| 그림의 96% | 1,150 ÷ 1,200 = 95.8% |

- 고친 것: "글자가 하나라도 다르면"을 문서 표현에 맞춰 "값만 다른 SQL도"로 좁혔어요. 마지막 확인 항목을 근거가 약한 "계획 시간 합산" 대신 "SQL 글자 그대로 묶는 화면"으로 바꿨어요.
