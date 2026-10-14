# 사실 검토: 메시지 큐 지연(consumer lag)

- 글: src/content/docs/apm/consumer-lag.mdx
- 검토일: 2026-10-14
- 방식: 초안을 다 쓴 뒤 따로 검토했어요(서브 에이전트 없이). Kafka 문서 원본(GitHub trunk의 docs), Burrow 위키, OpenTelemetry 메시징 규약 원문과 대조했고, 숫자는 손계산으로 확인했어요.
- 결과: 수정 필요 3건 / 확인 11건

| 주장(인용) | 판정 | 근거(URL과 짧은 인용) | 수정 제안 |
| --- | --- | --- | --- |
| 핵심 2 "바쁜 토픽은 잘 돌 때도 lag이 수백, 수천 건일 수 있어요." | 근거 없는 숫자 | Burrow는 바쁜 토픽에서 lag이 오르내리는 모습을 흔하다고만 해요("This pattern is common for topics that are busy"). | "lag이 0이 아닐 때가 많아요." |
| 확인 2 "컨슈머가 offset을 기록하는데 값이 그대로라면 멈춘 거예요." | 조건이 느슨함 | 새 메시지가 없으면 offset이 그대로여도 정상이에요. Burrow STALLED는 "the consumer offset does not change over the window, and the lag is either fixed or increasing"이에요. | "값이 그대로이고 lag이 남아 있다면" |
| 더 깊이 명령 출력 예 | 보충 | Kafka 문서 예에는 `CONSUMER-ID HOST CLIENT-ID` 열도 있어요. 글은 열 일부만 옮겼어요. | "Kafka 문서의 예에서 열 일부만 옮겼어요." 더함 |
| 핵심 1 lag = 로그 끝 offset − 컨슈머가 기록한 offset | 맞음 | https://github.com/apache/kafka/blob/trunk/docs/operations/basic-kafka-operations.md "show the position of all consumers in a consumer group as well as how far behind the end of the log they are", 예 `CURRENT-OFFSET 2 LOG-END-OFFSET 4 LAG 2` | — |
| 그림 초당 500·400건, 1분에 6,000건, 10분에 60,000건 | 맞음 | (500 − 400) × 60 = 6,000, × 10 = 60,000 | — |
| 핵심 2 Burrow는 고정 임계값을 두지 않음 | 맞음 | https://github.com/linkedin/Burrow/wiki/Consumer-Lag-Evaluation-Rules "without the need for setting a discrete threshold for the number of messages a consumer is allowed to be behind" | — |
| 핵심 3 60,000 ÷ 400 = 150초 | 맞음 | 손계산. 앞에 쌓인 메시지를 다 처리해야 방금 들어온 메시지 차례가 와요. | — |
| 핵심 3 들어오는 속도가 더 빠르면 lag은 계속 늘어요 | 맞음 | 1분마다 (들어오는 속도 − 처리 속도) × 60만큼 늘어요. | — |
| 확인 1 고정 임계값의 문제 | 맞음 | Burrow 위 인용과 같은 근거예요. | — |
| 확인 3 파티션 하나는 그룹 안 컨슈머 하나만 읽음 | 맞음 | https://github.com/apache/kafka/blob/trunk/docs/design/design.md "each of which is consumed by exactly one consumer within each subscribing consumer group" | — |
| 확인 4 `records-lag-max`는 컨슈머가 냄 | 맞음 | https://github.com/apache/kafka/blob/trunk/docs/operations/monitoring.md "Number of messages the consumer lags behind the producer by. Published by the consumer, not broker." | — |
| 더 깊이 창 10개, 60초 기록이면 10분 | 맞음 | Burrow "The default setting is 10 which, when combined with an offset commit interval … of 60 seconds, means we evaluate the status of a consumer group over 10 minutes." | — |
| 더 깊이 OK·STALLED·WARNING·STOPPED 규칙 | 맞음 | Burrow 규칙 1~4 "If any lag within the window is zero, the status is considered to be OK", "the partition is marked as STALLED", "the consumer is in a WARNING state", "the partition is marked as STOPPED" | — |
| 더 깊이 생산자가 생성 컨텍스트를 붙여야 함 | 맞음 | https://opentelemetry.io/docs/specs/semconv/messaging/messaging-spans/ "A producer SHOULD attach a message creation context to each message.", "Consumer traces cannot be directly correlated with producer traces if the message creation context is not attached and propagated with the message." | — |

## 반영

- 위 세 건을 고쳤어요.
