# 사실 확인: 복제가 모자란 파티션이 생길 때

- 글: src/content/docs/messaging/under-replicated.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| UnderReplicatedPartitions, UnderMinIsrPartitionCount, OfflinePartitionsCount, IsrShrinksPerSec·IsrExpandsPerSec(브로커 재시작 때 말고는 0) | https://kafka.apache.org/43/operations/monitoring/ |
| replica.lag.time.max.ms 30초, auto.leader.rebalance.enable 기본 true | https://kafka.apache.org/43/configuration/broker-configs/ |
| 재시작한 브로커는 팔로워로 돌아오고, 기본으로 선호 리더에게 리더를 되돌림 | https://kafka.apache.org/43/operations/basic-kafka-operations/ |
| ISR이 min.insync.replicas보다 적으면 acks=all 쓰기가 NotEnoughReplicas로 실패 | https://kafka.apache.org/43/configuration/topic-configs/ |
| kafka-topics.sh --under-replicated-partitions 옵션 | https://github.com/apache/kafka/blob/trunk/tools/src/main/java/org/apache/kafka/tools/TopicCommand.java |
