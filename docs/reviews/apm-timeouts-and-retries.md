# 사실 검토: 타임아웃과 재시도

- 글: src/content/docs/apm/timeouts-and-retries.mdx
- 검토일: 2026-10-14
- 방식: 초안을 다 쓴 뒤 따로 검토했어요(서브 에이전트 없이). Amazon Builders' Library, Google SRE Book, gRPC 문서 원문과 대조했어요.
- 결과: 수정 필요 3건 / 확인 12건

| 주장(인용) | 판정 | 근거(URL과 짧은 인용) | 수정 제안 |
| --- | --- | --- | --- |
| 더 깊이 "gRPC는 이 마감 시각을 호출에 실어 넘겨요." | 일반화 | https://grpc.io/docs/guides/deadlines/ "Automatically propagating the deadline from an incoming RPC to an outgoing one is supported by some gRPC implementations." | "일부 gRPC 구현은 … 자동으로 넘겨요." |
| 핵심 2 "그래서 재시도는 한 계층에서만 해요." | 출처를 밝힐 것 | Amazon의 권고이고, 대상도 "low-cost control-plane and data-plane operations"예요. | "그래서 Amazon은 재시도를 한 계층에서만 하라고 권해요." |
| 핵심 3 "재시도 간격을 두 배씩 늘리고(지수 백오프)" | 오해 소지 | 지수 백오프의 배수가 꼭 2는 아니에요. | "두 배씩처럼 점점 늘리고" |
| 그림 1 → 4 → 16 → 64 | 맞음 | https://sre.google/sre-book/addressing-cascading-failures/ "the backend, frontend, and JavaScript layers all issue 3 retries (4 attempts), then a single user action may create 64 attempts (4^3) on the database." | — |
| 핵심 1 타임아웃이 없거나 길면 자원을 붙잡음 | 맞음 | SRE "Setting either no deadline or an extremely high deadline may cause short-term problems that have long since passed to continue to consume server resources", "High deadlines can result in resource consumption in higher levels of the stack" | — |
| 핵심 1 헛 타임아웃 0.1%, p99.9 | 맞음 | https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/ "we choose an acceptable rate of false timeouts (such as 0.1%). Then, we look at the corresponding latency percentile on the downstream service (p99.9 in this example)." | — |
| 핵심 2 과부하 중 재시도는 회복을 늦춤 | 맞음 | Amazon "When failures are caused by overload, retries that increase load can make matters significantly worse. They can even delay recovery" | — |
| 핵심 3 같은 간격이면 다시 몰림, jitter | 맞음 | Amazon "If all the failed calls back off to the same time, they cause contention or overload again when they are retried. Our solution is jitter." SRE "Always use randomized exponential backoff" | — |
| 확인 1 gRPC 기본은 마감 시각 없음 | 맞음 | gRPC "By default, gRPC does not set a deadline which means it is possible for a client to end up waiting for a response effectively forever." | — |
| 확인 2 마감 시각 전파 | 맞음 | SRE "Rather than inventing a deadline when sending RPCs to backends, servers should employ deadline propagation." | — |
| 확인 3 재시도 비율 그래프는 증상으로 오해받기 쉬움 | 맞음 | SRE "Graphs of retry rates can be an indication of bad retry behavior, but may be confused as a symptom instead of a compounding cause." | — |
| 확인 4 영구 실패·잘못된 요청은 재시도하지 않음 | 맞음 | SRE "Don't retry permanent errors or malformed requests in a client, because neither will ever succeed." | — |
| 더 깊이 p99.9가 p50에 가까우면 여유를 더함 | 맞음 | Amazon "This approach also doesn't work with services that have tight latency bounds, where p99.9 is close to p50. In these cases, adding some padding helps" | — |
| 더 깊이 30초 중 7초 쓰면 23초 | 맞음 | SRE "if server A selects a 30-second deadline, and processes the request for 7 seconds before sending an RPC to server B, the RPC from A to B will have a 23-second deadline." | — |
| 더 깊이 시도 3번, 재시도 비율 10%, 분당 60번 | 맞음 | https://sre.google/sre-book/handling-overload/ "a per-request retry budget of up to three attempts", "A request will only be retried as long as this ratio is below 10%." SRE(cascading) "only allow 60 retries per minute in a process" | — |
| 더 깊이 243배, 토큰 버킷 | 맞음 | Amazon "a five-deep stack … three retries at each layer … the load on the database will increase 243x", "retry as long as there are tokens, and then retry at a fixed rate when the tokens are exhausted. AWS added this behavior to the AWS SDK in 2016." | — |
| 더 깊이 주기 작업 jitter, 평균 지표에 안 보이는 몰림 | 맞음 | Amazon "These spikes of traffic can be very short, and are often hidden by aggregated metrics.", "the first few seconds after midnight for daily jobs" | — |

## 반영

- 위 세 건을 고쳤어요. 확인 1에 gRPC 기본값 문장을 더했어요.
