# 사실 확인: SNMP 폴링과 스트리밍 텔레메트리

- 글: src/content/docs/network/telemetry.mdx
- 확인일: 2026-10-26

| 확인한 주장 | 근거(URL) |
| --- | --- |
| gNMI는 gRPC 기반 규약, Subscribe RPC로 구독하고 ONCE·POLL·STREAM 세 방식 | https://github.com/openconfig/reference/blob/master/rpc/gnmi/gnmi-specification.md |
| STREAM의 ON_CHANGE(처음 전부 보낸 뒤 바뀔 때만, heartbeat 간격 가능), SAMPLE(sample_interval 나노초, 감당 못 하면 InvalidArgument로 거절, 0이면 장비의 가장 짧은 간격), suppress_redundant, TARGET_DEFINED | 같은 문서 |
| 타임스탬프는 유닉스 시각의 나노초(int64) | 같은 문서 |
| 구독의 갱신들을 한 시점의 스냅숏으로 가정하면 안 됨 | 같은 문서 |
| OpenConfig 인터페이스 모델의 `state/counters/in-octets`, `oper-status` | https://github.com/openconfig/public/blob/master/release/models/interfaces/openconfig-interfaces.yang |
| SNMP GetBulkRequest | https://www.rfc-editor.org/rfc/rfc3416 |

- 메모: gNMI를 지원하는 장비가 없어 직접 구독해 보지는 않았어요. 규격 문서와 대조했어요.
- 메모: 맨 위 그래프의 숫자는 예시예요. "SNMP는 보통 받은 시각으로 기록"은 SNMP 응답에 값의 시각이 따로 없어서 수집 쪽 시각을 쓰는 일반적인 방식을 말한 거예요.
- 함께 한 것: 퀴즈 5문제를 썼어요.
