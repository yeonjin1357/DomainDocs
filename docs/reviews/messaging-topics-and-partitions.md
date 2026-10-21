# 사실 확인: 토픽과 파티션

- 글: src/content/docs/messaging/topics-and-partitions.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 토픽 = 폴더 비유, 파티션 = 여러 브로커의 칸, 새 이벤트는 파티션에 덧붙음, 같은 키는 같은 파티션, 파티션 안에서는 쓴 순서대로 읽힘 | https://kafka.apache.org/43/getting-started/introduction/ |
| 파티션은 순서가 정해진 로그, 그룹 안에서 파티션 하나는 컨슈머 하나만, 컨슈머 위치는 오프셋 하나 | https://kafka.apache.org/43/design/design/ |
| 기본 파티셔너: 키가 있으면 키 해시, 없으면 batch.size만큼 채울 때까지 한 파티션(sticky), RoundRobinPartitioner | https://kafka.apache.org/43/configuration/producer-configs/ |
| 파티션 늘리면 hash(key) % 파티션 수가 바뀌어 같은 키가 다른 파티션으로, 파티션 줄이기는 지원 안 함 | https://kafka.apache.org/43/operations/basic-kafka-operations/ |
| num.partitions 기본 1 | https://kafka.apache.org/43/configuration/broker-configs/ |

- 메모: "컨슈머가 파티션보다 많으면 남는 컨슈머가 논다"는 "파티션 하나는 그룹 안의 컨슈머 하나에만 배정"에서 나온 결과예요.
