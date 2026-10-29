# 사실 확인: 관계형이 아닌 DB(NoSQL)

- 글: src/content/docs/database/nosql.mdx
- 확인일: 2026-10-29

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 기본 읽기는 결과적 일관성, ConsistentRead로 강한 일관성, 결과적 일관성 읽기는 비용 절반, GSI·스트림은 결과적 일관성만 | https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/HowItWorks.ReadConsistency.html |
| RCU는 4KB 이하 항목 강한 일관성 초당 1번(결과적 2번), WCU는 1KB 이하 초당 1번, 3KB 80번 → 80 RCU 예시 | https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/provisioned-capacity-mode.html |
| 파티션 하나는 초당 읽기 3,000단위, 쓰기 1,000단위 | https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-partition-key-design.html |
| Consumed*CapacityUnits는 1분 단위, Sum/60으로 초당 값, 짧은 급증은 묻힐 수 있음, ThrottledRequests와 *ThrottleEvents의 세는 단위 차이, GSI 셋인 표의 PutItem은 이벤트 넷, KeyRange 스로틀 지표, SuccessfulRequestLatency는 DynamoDB 안의 시간 | https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/metrics-dimensions.html |
| MongoDB 문서 최대 16MiB, 더 크면 GridFS | https://www.mongodb.com/docs/manual/reference/limits/ |

- 퀴즈 rcu-calc(6KB, 초당 10번 → 20단위)는 위 RCU 정의로 계산했어요.
- 「모니터링에서는」 그래프의 숫자는 예시예요.
- 함께 한 것: 용어 nosql, partition-key, hot-partition, capacity-unit, eventual-consistency를 올리고, DB 개요와 「관리형 데이터베이스」에 이 글을 이었어요. 퀴즈 5문제를 썼어요.
