# 사실 확인: 브로커와 복제

- 글: src/content/docs/messaging/replication.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 파티션마다 복제, 복제 계수는 토픽별, 리더 하나와 팔로워, 쓰기는 리더로·읽기는 리더나 팔로워, 리더가 브로커에 고르게 분산 | https://kafka.apache.org/43/design/design/ |
| 팔로워는 일반 컨슈머처럼 리더에게서 가져감, ISR 관리, ISR 모두 받아야 커밋, ISR 안에서만 리더 선출, f+1 복제본으로 f개 고장 견딤 | https://kafka.apache.org/43/design/design/ |
| unclean leader election 끄면 멈춤을 택함(기본 false) | https://kafka.apache.org/43/configuration/topic-configs/ |
| replica.lag.time.max.ms 30초 | https://kafka.apache.org/43/configuration/broker-configs/ |
| UnderReplicatedPartitions, UnderMinIsrPartitionCount, OfflinePartitionsCount, IsrShrinksPerSec(브로커 재시작 때 말고는 0이 정상), ActiveControllerCount(클러스터 전체에서 하나) | https://kafka.apache.org/43/operations/monitoring/ |
| 운영에선 복제 계수 3이 흔함 | https://kafka.apache.org/43/getting-started/introduction/ |
