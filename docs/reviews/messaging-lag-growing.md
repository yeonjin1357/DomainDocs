# 사실 확인: 컨슈머 지연이 쌓일 때

- 글: src/content/docs/messaging/lag-growing.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| kafka-consumer-groups.sh --describe --group, CURRENT-OFFSET·LOG-END-OFFSET·LAG·CONSUMER-ID 열 | https://kafka.apache.org/43/operations/basic-kafka-operations/ |
| 파티션 하나는 그룹 안 컨슈머 하나에 배정 | https://kafka.apache.org/43/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html |
| retention.ms 기본 7일 | https://kafka.apache.org/43/configuration/topic-configs/ |

- 메모: 500,000 ÷ 100 = 5,000초 ≈ 83분. 그래프 숫자는 설명용이에요.
