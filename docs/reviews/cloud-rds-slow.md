# 사실 확인: 관리형 DB가 느려졌을 때

- 글: src/content/docs/cloud/rds-slow.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 높은 CPU·RAM이 목표에 맞으면 괜찮을 수 있음, 작업 집합을 메모리에, 부하 중 ReadIOPS가 작고 안정적이어야, 메모리 큰 클래스로 올려 ReadIOPS가 크게 줄면 작업 집합이 안 들어갔던 것 | https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_BestPractices.html |
| I/O가 모자라면 높은 I/O 클래스, 저장소 종류 변경, IOPS 프로비저닝 | https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_BestPractices.html |
| CPUCreditBalance, FreeableMemory, SwapUsage, ReadIOPS, ReadLatency, FreeStorageSpace, DatabaseConnections 정의 | https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-metrics.html |
| Enhanced Monitoring = 인스턴스 안 에이전트의 OS 지표 | https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_Monitoring.OS.html |

- 메모: 예시 숫자는 설명용이에요.
