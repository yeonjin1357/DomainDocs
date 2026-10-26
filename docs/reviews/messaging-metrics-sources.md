# 사실 확인: Kafka 지표 읽는 법

- 글: src/content/docs/messaging/metrics-sources.mdx
- 확인일: 2026-10-26

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 서버는 Yammer Metrics, 자바 클라이언트는 Kafka Metrics를 쓰고 둘 다 JMX로 내놓음, 비율 지표마다 `-total` 누적값이 있음 | https://kafka.apache.org/43/operations/monitoring/ |
| `UnderReplicatedPartitions`, `UnderMinIsrPartitionCount` 평소 0, `OfflinePartitionsCount`, `ActiveControllerCount`는 클러스터에서 한 대만 1, `IsrShrinksPerSec` 평소 0 | 같은 문서 |
| `MessagesInPerSec`·`BytesInPerSec`·`BytesOutPerSec`는 토픽별이고 토픽을 빼면 모든 토픽 합, 복제 바이트는 `ReplicationBytesInPerSec`·`ReplicationBytesOutPerSec` | 같은 문서 |
| `TotalTimeMs`는 Produce·FetchConsumer·FetchFollower별, 대기·처리·원격·응답 시간으로 나뉨, `RequestHandlerAvgIdlePercent`·`NetworkProcessorAvgIdlePercent`는 0~1에서 0.3보다 크길 권함 | 같은 문서 |
| `records-lag-max`는 브로커가 아니라 컨슈머가 냄 | 같은 문서 |
| 원격 JMX는 기본으로 꺼짐, 운영에서는 켤 때 보안을 꼭 켜야 함, KRaft 쿼럼·컨트롤러·브로커 지표를 나눠 적음 | 같은 문서 |
| JMX Exporter는 MBean 값을 모으는 수집기, 자바 에이전트 방식을 대부분에게 권함(원격 JMX 불필요) | https://github.com/prometheus/jmx_exporter/blob/main/README.md , https://prometheus.github.io/jmx_exporter/ |

- 메모: Kafka를 직접 띄워 보지는 않았어요. JMX 이름과 권장 값은 Kafka 4.3 운영 문서와 대조했어요.
- 메모: 맨 위 그림의 숫자는 예시예요. Prometheus로 바뀐 지표 이름은 exporter 규칙마다 달라서 글에서는 JMX 이름의 끝부분으로 불렀어요.
- 함께 한 것: 퀴즈 5문제를 썼어요.
