# 사실 확인: 리밸런스가 반복될 때

- 글: src/content/docs/messaging/rebalance-storm.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| max.poll.interval.ms 안에 poll하지 않으면 그룹을 떠나고 커밋 실패(CommitFailedException) | https://kafka.apache.org/43/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html |
| max.poll.interval.ms 5분, session.timeout.ms 45초(하트비트 없으면 제외), max.poll.records 500, group.instance.id = 고정 멤버, 넉넉한 세션 제한 시간과 함께 쓰면 재시작으로 인한 리밸런스 방지 | https://kafka.apache.org/43/configuration/consumer-configs/ |
| 4.0부터 KIP-848 GA, 점진적 리밸런스 | https://kafka.apache.org/43/operations/consumer-rebalance-protocol/ |
| rebalance-rate-per-hour, last-poll-seconds-ago | https://kafka.apache.org/43/operations/monitoring/ |

- 메모: 재시작마다 리밸런스가 두 번 일어날 수 있다는 것은 일반 설명이에요. 예시 숫자는 설명용이에요.
