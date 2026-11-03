# 사실 확인: 처리에 실패한 메시지와 DLQ

- 글: src/content/docs/messaging/failed-messages.mdx (함께 고친 글: messaging/overview.mdx의 'Kafka와 큐 서비스는 달라요')
- 확인일: 2026-11-03

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 컨슈머 위치는 poll로 받을 때마다 저절로 앞으로 가고, 다시 뜨면 커밋한 위치부터 읽어요 | https://kafka.apache.org/43/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html |
| `enable.auto.commit` 기본값 true | https://kafka.apache.org/43/configuration/consumer-configs/ |
| Spring Kafka `DefaultErrorHandler` 기본 `FixedBackOff(0L, 9)`, 다 실패하면 로그만 남겨요, 역직렬화 에러 같은 치명적 예외는 다시 하지 않아요 | https://docs.spring.io/spring-kafka/reference/kafka/annotation-error-handling.html |
| `DeadLetterPublishingRecoverer`는 원래 토픽 + 꼬리, 같은 파티션으로 보내요. DLT 파티션 수가 원래 토픽 이상이어야 해요. 헤더에 에러 종류·메시지와 원래 토픽·오프셋을 넣어요 | 같은 문서 |
| 꼬리는 3.3부터 `-dlt`, 3.2까지 `.DLT` | GitHub 소스 `DeadLetterPublishingRecoverer.java`의 `DEFAULT_DESTINATION_RESOLVER`: v2.9.0·v3.0.0·v3.1.0·v3.2.0은 `".DLT"`, v3.3.0·main은 `"-dlt"` |
| `@RetryableTopic`으로 재시도 토픽(2.7부터) | https://docs.spring.io/spring-kafka/reference/retrytopic.html |
| Kafka Connect 싱크 커넥터 `errors.deadletterqueue.topic.name`, 기본은 비어 있고 첫 에러에서 실패(`errors.tolerance=none`) | https://kafka.apache.org/43/kafka-connect/user-guide/, https://kafka.apache.org/43/configuration/kafka-connect-configs/ |
| SQS redrive 정책 `maxReceiveCount`, 너무 낮게 두지 말 것, FIFO 큐에 DLQ를 쓰면 순서가 깨질 수 있어요 | https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-dead-letter-queues.html |
| SQS 표준 큐는 원래 들어온 시각부터 보관 기간을 세요(하루 머문 뒤 DLQ, DLQ 보관 4일이면 3일 뒤 삭제). DLQ 보관 기간을 더 길게 | 같은 문서 |
| SQS 기본 visibility timeout 30초, 처리 뒤 DeleteMessage로 지워요 | https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html |
| RabbitMQ dead letter: reject/nack(requeue=false), 메시지 TTL 만료, 길이 한도, quorum 큐 delivery-limit 초과. 큐 자체가 만료되면 보내지 않아요 | https://www.rabbitmq.com/docs/dlx (원문 rabbitmq-website/docs/dlx.md) |
| RabbitMQ 4.0부터 quorum 큐 delivery-limit 기본 20, 넘으면 DLX가 있으면 보내고 없으면 버려요 | https://www.rabbitmq.com/docs/quorum-queues (poison message handling) |
| RabbitMQ 처리 확인(ack)을 받으면 버려도 되는 메시지로 기록, 스트림은 읽어도 지우지 않고 다시 읽을 수 있어요 | https://www.rabbitmq.com/docs/confirms, https://www.rabbitmq.com/docs/streams |

- 예시 숫자: 오프셋 43, DLQ 2시간 1,200건, 1분씩 5번 재시도는 설명용이에요.
