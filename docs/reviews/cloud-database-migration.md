# 사실 확인: DB 이전과 변경 데이터 캡처(CDC)

- 글: src/content/docs/cloud/database-migration.mdx
- 확인일: 2026-11-11

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 복제 인스턴스·엔드포인트·작업, 인스턴스 하나에 작업 여러 개, 이전 방식 셋(전체 적재만·전체 적재+CDC·CDC만), 전체 적재 뒤 쌓인 변경 적용 후 앱 멈추고 전환, CDC는 엔진의 API로 DB 로그를 읽음, 메모리 버퍼가 차면 디스크로 넘김 | https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Introduction.Components.html |
| CDCLatencySource·CDCLatencyTarget 정의, 둘이 비슷하면 원본부터·대상만 높으면 대상(기본 키·인덱스, 자원, 네트워크), 커밋 안 된 트랜잭션이면 원본 지연이 계속 오름, CDCIncomingChanges는 적용 대기 수(원본 변경 속도 아님), 작업 상태 목록(Running with errors 포함), FreeableMemory는 실제 빈 메모리 아님·SwapUsage와 함께, 10일 지난 로그 삭제 | https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Monitoring.html |
| MySQL CDC: binlog_format=ROW, binlog_row_image=FULL, RDS MySQL은 binlog를 되도록 빨리 지워 보관 시간을 늘려야 함(예 24시간) | https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Source.MySQL.html |
| PostgreSQL CDC: wal_level=logical, 논리 복제 슬롯, 슬롯은 작업이 멈춰도 열려 있음, WAL은 DMS가 읽은 뒤 지워짐, 디스크 사용 경보 권장 | https://docs.aws.amazon.com/dms/latest/userguide/CHAP_Source.PostgreSQL.html |
| Azure DMS는 지금 SQL Server를 Azure SQL(Database·Managed Instance·VM)로 옮김 | https://learn.microsoft.com/en-us/azure/dms/dms-overview |

- 고친 것: 처음엔 "AWS와 Azure DMS가 다른 엔진끼리도 옮긴다"로 읽히게 썼어요. Azure DMS 원문을 보고 Azure는 SQL Server → Azure SQL이라고 나눠 썼어요.
- 화면 예시(3초, 840초, 12만 건)와 대상 지연 표(900초·920초)는 문서의 판단 규칙에 맞춰 정한 예시예요.
- Debezium이 같은 원리로 로그를 읽는다는 문장은 Deeper의 일반 설명이에요.
- 함께 한 것: 용어 replication-instance, full-load, cdc, replication-slot를 올렸어요. 퀴즈 5문제를 썼어요.
