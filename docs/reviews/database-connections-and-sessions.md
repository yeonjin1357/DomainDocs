# 사실 확인: 연결과 세션

- 글: src/content/docs/database/connections-and-sessions.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| PostgreSQL은 연결 요청마다 서버 프로세스를 띄움 | https://www.postgresql.org/docs/current/connect-estab.html "spawns a new backend process every time a connection is requested" |
| Oracle 연결 = 물리적 통로, 세션 = 로그인 상태, 연결 하나에 세션 0~여러 개, 세션끼리 독립 | https://docs.oracle.com/en/database/oracle/oracle-database/19/cncpt/process-architecture.html "A single connection can have 0, 1, or more sessions" |
| Oracle 전용 서버(연결 하나에 서버 프로세스 하나, 20개면 20개), 공유 서버(디스패처·큐) | 같은 문서 "associated with one and only one server process", "20 client processes … serviced by 20 server processes" |
| MySQL은 연결마다 전용 스레드, 연결이 끝나면 스레드 캐시로, thread_cache_size는 시작 때 자동, 연결이 많으면 불리 | https://dev.mysql.com/doc/refman/8.4/en/connection-interfaces.html "associate each client connection with a thread dedicated to it", "the server autosizes the value at startup", "has some disadvantages when server workload must scale" |
| SQL Server는 작업 스레드 풀, 요청 → 태스크 → 작업 스레드, CPU마다 스케줄러 | https://learn.microsoft.com/en-us/sql/relational-databases/thread-and-task-architecture-guide "create a pool of worker threads to service a larger number of query requests", "Each scheduler is mapped to an individual processor" |
| SQL Server의 쉬는 세션은 작업 스레드를 쥐지 않음 | 같은 문서에서 작업 스레드는 요청의 태스크에 붙어요("spawns a worker to execute the active task"). 실행 중인 요청이 없는 세션에는 태스크가 없다는 데서 나온 추론이에요. |
| SET은 커밋되면 세션 끝까지, SET LOCAL은 트랜잭션 끝까지 | https://www.postgresql.org/docs/current/sql-set.html "the effects will persist until the end of the session", "SET LOCAL last only till the end of the current transaction" |
| state active/idle | https://www.postgresql.org/docs/current/monitoring-stats.html (database-active-sessions 검토에서 확인) |

- 고친 것: "미리 만든 작업 스레드 묶음"을 "작업 스레드 풀"로 바꿨어요(미리 만든다는 근거 없음).
