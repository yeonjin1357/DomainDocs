# 사실 확인: 프로듀서

- 글: src/content/docs/messaging/producers.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 프로듀서는 중간 단계 없이 파티션 리더 브로커로 직접 보냄, 모든 노드가 메타데이터 요청에 답함, 메모리에 모아 큰 묶음으로 보냄 | https://kafka.apache.org/43/design/design/ |
| 0.11부터 멱등 전송(프로듀서 ID + 순번으로 중복 제거), 여러 파티션에 트랜잭션처럼 쓰기 | https://kafka.apache.org/43/design/design/ |
| acks 0·1·all 뜻과 잃는 경우, 기본 all, 멱등성은 all 필요, enable.idempotence 기본 true, batch.size 16384, linger.ms 5, retries 2147483647, delivery.timeout.ms 120000 | https://kafka.apache.org/43/configuration/producer-configs/ |
| min.insync.replicas 기본 1, 복제 계수 3 + 최소 2 + acks=all이 흔한 조합 | https://kafka.apache.org/43/configuration/topic-configs/ |
| record-send-rate, record-error-rate, record-retry-rate, request-latency-avg, batch-size-avg 뜻 | https://kafka.apache.org/43/operations/monitoring/ |

- 메모: 팔로워가 리더에게서 복제해 가는(fetch) 그림은 Design의 복제 설명을 단순하게 그린 거예요.
