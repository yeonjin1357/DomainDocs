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

## 다시 확인 (2026-10-29)

| 확인한 주장 | 근거(URL) |
| --- | --- |
| RDS의 db.t4g·db.t3(그리고 db.t2)는 Unlimited 모드로 설정돼 있어, 기준선을 넘어 쓰고 추가 요금을 냄 | https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.DBInstanceClass.Types.html |
| CPUSurplusCreditBalance = CPUCreditBalance가 0일 때 쓴 잉여 크레딧, 24시간에 벌 수 있는 양을 넘으면 요금. CPUSurplusCreditsCharged = 갚지 못해 요금이 붙은 잉여 크레딧 | https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/rds-metrics.html |

- 고친 것: "크레딧이 바닥나면 기준선에 묶여 느려져요"는 RDS에 맞지 않아요. 1단계 본문·그림·맨 위 갈래 그림·먼저 볼 것·Check와 퀴즈(burstable-db-credits)를 Unlimited 모드 기준으로 고쳤어요. 크레딧은 느려짐이 아니라 요금의 신호로 봐요.
