# 사실 확인: 복제

- 글: src/content/docs/database/replication.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 스트리밍 복제는 WAL을 생기는 대로 보냄, 기본 비동기, 주 서버가 죽으면 커밋을 잃을 수 있음, 동기는 양쪽 WAL을 확인하고 응답 시간이 늘어남 | https://www.postgresql.org/docs/current/warm-standby.html |
| 핫 스탠바이는 읽기 전용 조회, 결국 같아짐 | https://www.postgresql.org/docs/current/hot-standby.html |
| MySQL 복제는 기본 비동기, binlog로 복제 | https://dev.mysql.com/doc/refman/8.4/en/replication.html, https://dev.mysql.com/doc/refman/8.4/en/binary-log.html |
| SQL Server 동기·비동기 커밋, 멀리 떨어진 복제는 비동기, 강제 장애 조치 때 보내지 못한 로그를 잃음, 시간 초과 시 기다리지 않음, SYNCHRONIZED·NOT SYNCHRONIZING | https://learn.microsoft.com/en-us/sql/database-engine/availability-groups/windows/availability-modes-always-on-availability-groups |
| Data Guard는 리두를 보내 적용, 장애 조치로 대기 데이터베이스가 주 역할 | https://docs.oracle.com/en/database/oracle/oracle-database/19/sbydb/introduction-to-oracle-data-guard-concepts.html |
