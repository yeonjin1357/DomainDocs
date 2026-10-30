# 사실 확인: 로그와 복구

- 글: src/content/docs/database/logs-and-recovery.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 커밋 때 로그만 쓰면 됨, 로그는 순차라 싸게 씀 | https://www.postgresql.org/docs/current/wal-intro.html "only the WAL file needs to be flushed to disk", "The WAL file is written sequentially" |
| 로그가 먼저 디스크에 닿아야 데이터 파일을 씀 | 같은 문서, SQL Server 문서 "no data modifications are written to disk before the associated log record is written to disk" |
| 마지막 체크포인트부터 REDO, 그 앞 WAL은 다시 쓰거나 지움, 보관 실패 시 쌓임 | https://www.postgresql.org/docs/current/wal-configuration.html |
| 복구 때 끝나지 않은 트랜잭션 되돌림, 로그 비우기 필수, 단순·전체 복구 모델, 오래 열린 트랜잭션·복제가 비우기를 막음, 9002 | https://learn.microsoft.com/en-us/sql/relational-databases/sql-server-transaction-log-architecture-and-management-guide |
| InnoDB 리두는 연결을 받기 전에 다시 적용 | https://dev.mysql.com/doc/refman/8.4/en/innodb-redo-log.html "replayed automatically during initialization and before connections are accepted" |
| binlog는 변경 이벤트, 복제에 씀 | https://dev.mysql.com/doc/refman/8.4/en/binary-log.html |
| log file sync | https://docs.oracle.com/en/database/oracle/oracle-database/19/refrn/descriptions-of-wait-events.html "When a user session commits, the session's redo information must be flushed to the redo logfile" |
| 백업 + WAL 재적용으로 원하는 시각까지 | wal-intro "replay the WAL just as far as the desired time" |

- 고친 것(2026-10-30): '오래 열린 트랜잭션이 그 시작점 뒤의 로그를 남긴다'를 SQL Server의 일로 밝혔어요. PostgreSQL 문서(https://www.postgresql.org/docs/18/wal-configuration.html)가 WAL을 남겨 두는 조건으로 드는 것은 체크포인트, wal_keep_size, 보관, 복제 슬롯, WAL 요약뿐이에요. MySQL·Oracle도 오래 열린 트랜잭션이 붙잡는 것은 리두가 아니라 언두예요. 그림 caption과 모니터링 단락도 함께 고쳤어요.
