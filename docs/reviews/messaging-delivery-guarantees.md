# 사실 확인: 전달 보장

- 글: src/content/docs/messaging/delivery-guarantees.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 최대 한 번·최소 한 번·정확히 한 번 정의, 쓰기 쪽과 읽기 쪽 두 문제로 나뉨 | https://kafka.apache.org/43/design/design/ |
| 0.11 전에는 다시 보내는 것뿐, 0.11부터 멱등 전송(ID+순번)과 여러 파티션 트랜잭션 쓰기 | https://kafka.apache.org/43/design/design/ |
| 읽고→커밋→처리 = 최대 한 번, 읽고→처리→커밋 = 최소 한 번 | https://kafka.apache.org/43/design/design/ |
| 기본은 최소 한 번, 최대 한 번은 재시도 끄고 처리 전 커밋, Kafka→처리→Kafka는 정확히 한 번 가능(Kafka Streams가 가장 쉬움), 다른 시스템은 그 시스템과 협력 필요 | https://kafka.apache.org/43/design/design/ |
| 멱등성은 acks=all 필요, 기본 켜짐 | https://kafka.apache.org/43/configuration/producer-configs/ |

- 메모: 이벤트 ID로 중복 거르기, 멱등한 작업으로 바꾸기는 일반적인 설계 방법이에요.
