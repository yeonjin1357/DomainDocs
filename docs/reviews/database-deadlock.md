# 사실 확인: 교착이 났을 때

- 글: src/content/docs/database/deadlock.mdx
- 확인일: 2026-10-28

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 일관된 잠금 순서가 교착을 막는 가장 좋은 방법, 한쪽을 끝내 풀고 어느 쪽일지는 예측하기 어려움 | https://www.postgresql.org/docs/18/explicit-locking.html |
| deadlock_timeout 기본 1초 뒤 교착 검사 | https://www.postgresql.org/docs/18/runtime-config-locks.html |
| pg_stat_database.deadlocks | https://www.postgresql.org/docs/18/monitoring-stats.html |
| MySQL 1213 ER_LOCK_DEADLOCK, SQLSTATE 40001, `Deadlock found when trying to get lock; try restarting transaction`, 자동으로 되돌림 | https://dev.mysql.com/doc/mysql-errors/8.4/en/server-error-reference.html |
| SHOW ENGINE INNODB STATUS에 마지막 교착, innodb_print_all_deadlocks로 모두 오류 로그에, 교착 감지 기본 켜짐, 작은 트랜잭션을 골라 되돌림 | https://dev.mysql.com/doc/refman/8.4/en/innodb-deadlocks.html , https://dev.mysql.com/doc/refman/8.4/en/innodb-deadlock-detection.html |
| ORA-00060 deadlock detected while waiting for resource, 트레이스 파일을 보라 | https://docs.oracle.com/en/error-help/db/ora-00060/ |
| SQL Server 1205, 되돌리기 비용이 작은 쪽을 희생자로, system_health 세션이 xml_deadlock_report를 기본으로 남김 | https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-deadlocks-guide |

- 재현(PostgreSQL 18.4, 두 연결, `accounts`에 1·2번 행): A가 1번, B가 2번을 바꾼 뒤 A가 2번, B가 1번을 바꾸게 했어요.
  - 약 1000ms 뒤 A가 40P01 `deadlock detected`, 앱이 받은 DETAIL은 두 프로세스의 대기 관계만 있었고, 서버 로그에는 각 프로세스의 SQL 줄과 `HINT: See server log for query details.`가 더 있었어요.
  - B는 그대로 끝났고, `pg_stat_database.deadlocks`가 1이 됐어요.
- 함께 한 것: 교착 용어의 연결 글을 이 글로 바꾸고, 「잠금과 블로킹」에 이 글로 가는 줄을 더했어요. 퀴즈 5문제를 썼어요.
