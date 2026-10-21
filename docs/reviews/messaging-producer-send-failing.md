# 사실 확인: 프로듀서 전송이 실패할 때

- 글: src/content/docs/messaging/producer-send-failing.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| delivery.timeout.ms 2분, max.request.size 1,048,576, buffer.memory 33,554,432(버퍼가 차면 max.block.ms 동안 막혔다가 예외), max.block.ms 60초 | https://kafka.apache.org/43/configuration/producer-configs/ |
| min.insync.replicas를 못 채우면 NotEnoughReplicas·NotEnoughReplicasAfterAppend, max.message.bytes 1,048,588 | https://kafka.apache.org/43/configuration/topic-configs/ |
| message.max.bytes 1,048,588 | https://kafka.apache.org/43/configuration/broker-configs/ |
| record-retry-rate, request-latency-avg, record-error-rate | https://kafka.apache.org/43/operations/monitoring/ |

- 메모: 큰 데이터는 저장소에 두고 위치만 보내는 방법은 일반 설계 조언이에요. 예시 숫자는 설명용이에요.
