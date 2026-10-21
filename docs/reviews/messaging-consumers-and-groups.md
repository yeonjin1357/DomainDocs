# 사실 확인: 컨슈머와 컨슈머 그룹

- 글: src/content/docs/messaging/consumers-and-groups.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 컨슈머는 리더에게 오프셋을 주고 fetch, pull 방식이라 뒤처졌다가 따라잡음, 되돌아가 다시 읽기 가능 | https://kafka.apache.org/43/design/design/ |
| 위치 = 다음에 줄 오프셋, 커밋된 위치 = 안전하게 저장된 오프셋·재시작 시 복구 지점, 자동·수동 커밋 | https://kafka.apache.org/43/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html |
| 처리 후 커밋 = 최소 한 번, 커밋 후 처리 = 최대 한 번, 자동 커밋도 poll로 받은 것을 다 처리하면 최소 한 번 | https://kafka.apache.org/43/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html |
| 같은 group.id = 한 그룹, 파티션 하나는 그룹 안 컨슈머 하나, 파티션 4·컨슈머 2면 둘씩, 구성원 변화·파티션 추가 시 리밸런스, max.poll.interval.ms 넘으면 그룹 떠남·커밋 실패 | https://kafka.apache.org/43/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html |
| auto.offset.reset 기본 latest·earliest·none, enable.auto.commit 기본 true, 5초, session.timeout.ms 45초(하트비트 없으면 제외), max.poll.interval.ms 5분, group.protocol 기본 classic | https://kafka.apache.org/43/configuration/consumer-configs/ |
| 4.0부터 KIP-848 GA, 점진적 설계로 리밸런스 시간 단축 | https://kafka.apache.org/43/operations/consumer-rebalance-protocol/ |
| records-lag-max(현재 위치 기준), rebalance-rate-per-hour, commit-latency-avg, last-poll-seconds-ago | https://kafka.apache.org/43/operations/monitoring/ |
