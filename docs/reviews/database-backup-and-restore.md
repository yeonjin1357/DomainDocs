# 사실 확인: 백업과 시점 복구

- 글: src/content/docs/database/backup-and-restore.mdx
- 확인일: 2026-11-03

| 확인한 주장 | 근거(URL) |
| --- | --- |
| pg_dump는 시작한 순간의 스냅숏, 다른 작업을 막지 않음, DB마다 따로 찍어 DB끼리 시각이 안 맞음, `pg_dumpall --globals-only` | https://www.postgresql.org/docs/current/backup-dump.html |
| 베이스 백업 + WAL 보관으로 그 뒤 아무 시각으로나 되돌림, 보관 WAL은 끊김 없이 이어져야 함, 마지막 베이스 백업이 오래되면 재생이 오래 걸림 | https://www.postgresql.org/docs/current/continuous-archiving.html ("continuous sequence of archived WAL files", "could take awhile if it has been a long time since the last base backup") |
| 증분 백업 `pg_basebackup --incremental`(PostgreSQL 17부터), 앞선 백업 매니페스트, `pg_combinebackup`, 증분도 WAL이 모두 있어야 함 | https://www.postgresql.org/docs/17/release-17.html, 위 continuous-archiving 25.3.3 |
| `pg_stat_archiver`의 `last_archived_time`, `failed_count` | https://www.postgresql.org/docs/current/monitoring-stats.html |
| MySQL 시점 복구는 전체 백업 뒤 변경을 시점까지 차례로 적용(바이너리 로그) | https://dev.mysql.com/doc/refman/8.4/en/point-in-time-recovery.html (첫 단락, 9.5.1 "Point-in-Time Recovery Using Binary Log") |
| 단순 복구 모델은 로그 백업 없음·백업 끝 시점으로만 복구, 전체 복구 모델은 임의 시점 복구, Enterprise·Standard 기본 full, Express 기본 simple | https://learn.microsoft.com/en-us/sql/relational-databases/backup-restore/recovery-models-sql-server |
| 차등 백업은 마지막 전체 백업 뒤 바뀐 것, 복원 때 기준 전체 백업이 먼저 필요 | https://learn.microsoft.com/en-us/sql/relational-databases/backup-restore/differential-backups-sql-server |
| RDS 보관 기간 0~35일, 0이면 자동 백업 꺼짐, 기본값 API·CLI 1일·콘솔 7일 | https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_WorkingWithAutomatedBackups.BackupRetention.html |
| RDS는 트랜잭션 로그를 5분마다 S3로 올림, `LatestRestorableTime`, 시점 복구는 새 DB 인스턴스를 만듦 | https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_PIT.html |
| RTO는 서비스 중단부터 복구까지 허용 최대 지연, RPO는 마지막 복구 시점부터 허용 최대 시간 | https://docs.aws.amazon.com/whitepapers/latest/disaster-recovery-workloads-on-aws/business-continuity-plan-bcp.html |

- "복제는 백업이 아니다"는 복제가 변경을 그대로 옮긴다는 기존 database/replication 글의 설명에서 나온 결론이라 따로 원문을 대지 않았어요.
- 함께 한 것: 용어 logical-backup, pitr, rpo, rto를 올렸어요. 퀴즈 5문제를 썼어요.
