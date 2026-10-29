# 사실 확인: 관리형 데이터베이스

- 글: src/content/docs/cloud/managed-databases.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| RDS가 흔한 DB 관리 일을 맡음, EC2 직접 설치와 RDS의 책임 표(크기·HA·백업·DB/OS 설치·패치는 AWS, 앱 최적화는 고객), 쿼리 튜닝은 고객 책임 | https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Welcome.html |
| 다중 AZ = 다른 AZ에 동기 대기 서버 자동 유지, 장애 대비, 대기 서버는 읽기 불가·읽기 확장 수단 아님 | https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.MultiAZSingleStandby.html |
| 읽기 복제본 = 읽기 전용 사본, 비동기 복제, 일반 인스턴스와 같은 요금 | https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_ReadRepl.html |
| 유지 보수 시간, 미룬 변경은 그때 적용, 일부 패치는 잠깐 오프라인, 다중 AZ는 대기 먼저 손보고 승격 | https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_UpgradeDBInstance.Maintenance.html |
| 지표 정의(CPUUtilization, DatabaseConnections·세션이 더 많을 수 있음, FreeableMemory = MemAvailable, FreeStorageSpace, ReadIOPS, ReadLatency, ReplicaLag, CPUCreditBalance) | https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-metrics.html |
| CloudWatch CPU는 하이퍼바이저, Enhanced Monitoring은 인스턴스 안 에이전트, 작은 인스턴스일수록 차이 큼 | https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_Monitoring.OS.html |
| Azure SQL Database = 완전 관리형, 고가용성·백업·유지 보수, SQL·OS 패치를 Microsoft가 처리 | https://learn.microsoft.com/en-us/azure/azure-sql/database/sql-database-paas-overview |

## 다시 확인 (2026-10-29)

| 확인한 주장 | 근거(URL) |
| --- | --- |
| RDS의 db.t4g·db.t3는 Unlimited 모드로 설정돼, 크레딧이 바닥나도 기준선에 묶이지 않고 추가 요금을 냄 | https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.DBInstanceClass.Types.html |

- 고친 것: Check의 "크레딧이 바닥나면 가상 머신처럼 CPU가 기준선에 묶여요"를 Unlimited 모드 기준(요금이 붙을 수 있음)으로 고쳤어요.
