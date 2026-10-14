# 사실 검토: 서비스 맵 읽기

- 글: src/content/docs/apm/service-map.mdx
- 검토일: 2026-10-14
- 방식: 초안을 다 쓴 뒤 따로 검토했어요(서브 에이전트 없이). 문서 원문을 내려받아 대조했고, 질의는 promtool 3.15.0으로 돌렸어요(`scratchpad/b3prom/sg-test.yml`).
- 결과: 수정 필요 3건 / 확인 13건

| 주장(인용) | 판정 | 근거(URL과 짧은 인용) | 수정 제안 |
| --- | --- | --- | --- |
| 확인 2 "내부 서비스가 `user`에게 불린 것으로 나온다면 트레이스가 끊긴 거예요." | 오해 소지 | 부르는 내부 서비스가 계측되지 않았어도 `user`로 나와요. Tempo "initiated by an external system that isn't instrumented, like a scheduler, a frontend application, or an engineer using curl" | "계측된 서비스가 부르는 내부 서비스가 …" |
| 더 깊이 "부른 쪽이 없는 root span이 SERVER나 CONSUMER면 부른 쪽을 `user`로 그려요." | 보충 필요 | Tempo "the processor checks the configured peer_attributes on the server span first. If it finds a matching attribute, it uses that value as the client node name. Otherwise, the client node name defaults to user.", Collector "The client node name always defaults to user" | Tempo와 Collector의 차이를 한 문장 더함 |
| 더 깊이 선별 에러율 질의 | 보충 필요 | promtool: 결제 선은 0.042로 맞게 나오지만, 실패 시계열이 없는 재고 선은 결과에 없어요. | "실패 수 지표가 아직 없는 선은 이 결과에 나오지 않아요." 더함 |
| 핵심 1 CLIENT·SERVER span 짝으로 선을 그음 | 맞음 | https://github.com/open-telemetry/opentelemetry-collector-contrib/blob/main/connector/servicegraphconnector/README.md "looking for spans with parent-children relationship that represent a request", "the outgoing and the incoming span must have `span.kind` client and server respectively" | — |
| 핵심 1 선마다 요청 수, 실패 수, 응답시간 | 맞음 | 같은 문서 지표 표 `traces_service_graph_request_total`, `…_request_failed_total`, `…_request_server`, `…_request_client` | — |
| 핵심 2 가상 노드는 `peer.service`, `db.system` 같은 속성으로, 없으면 안 나옴 | 맞음 | https://grafana.com/docs/tempo/latest/metrics-from-traces/service_graphs/ "A client span doesn't have its matching server span, but has a peer attribute present … uses the peer attribute value as the virtual server node name." Collector "An empty list disables virtual node creation." | — |
| 핵심 3 응답시간은 양쪽에서 따로, 부른 쪽엔 네트워크·앞단 대기가 더해짐 | 맞음 | Tempo "The processor measures duration from both the client and server sides." 앞단 대기는 apm-trace-waterfall 검토의 근거와 같아요. 300 − 50 = 250 | — |
| 확인 1 계측되지 않았거나 `traceparent`가 안 넘어가면 선이 없음 | 맞음 | https://www.elastic.co/docs/solutions/observability/apm/service-map "if a service isn't instrumented, or a traceparent header isn't being propagated to it, distributed tracing will not work, and the connection will not be drawn on the map." | — |
| 확인 3 실제 호출이 있을 때만 선 | 맞음 | Elastic "Connections between nodes represent observed communication between services based on distributed trace data" | — |
| 확인 4 샘플링하면 요청 수가 적게 나옴, 비율을 곱하는 설정 | 맞음 | Tempo "When traces are sampled, the raw request counts produced by the service graph processor underrepresent actual traffic.", `span_multiplier_key` | — |
| 더 깊이 Tempo 기능을 바탕으로 함, PRODUCER·CONSUMER, DB 속성 | 맞음 | Collector "This component is based on Grafana Tempo's service graph processor", "producer and consumer respectively", "`span.kind`=client as well as db.name" | — |
| 더 깊이 메모리 저장소, `store.ttl` 기본 2초, unpaired 지표 | 맞음 | Collector "kept in an in-memory store, until its corresponding pair span is received or the maximum waiting time has passed", "`ttl` … Default: `2s`", `traces_service_graph_unpaired_spans_total` | — |
| 더 깊이 여러 인스턴스면 짝을 못 지음, load balancing exporter | 맞음 | Collector "If spans of a trace are spread out over multiple instances, spans are not paired up reliably.", load balancing exporter `routing_key` `traceID` | — |
| 더 깊이 Tempo 가상 노드 이름 순서 | 맞음 | Tempo "The default peer attributes are peer.service, db.name, db.system, and db.system.name.", "uses the first match" | — |
| 더 깊이 `span_multiplier_key` 비율 0.1이면 10건 | 맞음 | Tempo "if a span has attribute X-SampleRatio=0.1 (10% sampling) … causes each sampled span to count as 10 requests" | — |
| 그림 숫자(1,200건/초, 에러 4.2%, 35ms, 8ms) | 예시 | 설명용 가정이에요. 캡션의 "왼쪽 서비스가 오른쪽 서비스를 불러요"는 그림에 화살표가 없어서 둔 문장이에요. | — |

## 반영

- 확인 2를 "계측된 서비스가 부르는 내부 서비스가 …"로 좁혔어요.
- 더 깊이에 Tempo는 받은 쪽 span의 peer 속성을 먼저 쓰고 Collector는 늘 `user`로 쓴다는 문장을 더했어요.
- 질의 아래에 실패 수 지표가 없는 선은 결과에 나오지 않는다는 설명을 더했어요.
