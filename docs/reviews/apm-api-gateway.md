# 사실 확인: API 게이트웨이

- 글: src/content/docs/apm/api-gateway.mdx
- 확인일: 2026-11-04

| 확인한 주장 | 근거(URL) |
| --- | --- |
| `Latency`는 게이트웨이가 요청을 받고 답할 때까지, `IntegrationLatency`를 포함하고 게이트웨이 오버헤드도 더함. `IntegrationLatency`는 뒤쪽에 넘기고 답을 받을 때까지(ms) | https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-metrics-and-dimensions.html |
| `4XXError`·`5XXError`는 Sum이 개수, Average가 비율, `Count`가 분모. 메서드·리소스 단위는 상세 지표를 켜야 하고 요금이 붙음 | 같은 문서 |
| REST API 통합 타임아웃 50ms~29초(모든 통합 형태), 리전·비공개 API는 29초 넘게 올릴 수 있음(리전 스로틀 할당량이 줄 수 있음), 엣지 최적화는 못 올림 | https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-execution-service-limits-table.html |
| `kong_kong_latency_ms`(Kong이 더한 시간), `kong_upstream_latency_ms`(뒤쪽), `kong_request_latency_ms`(전체), 지연 지표는 `latency_metrics`로 켜야 함(기본 꺼짐) | https://developer.konghq.com/plugins/prometheus/ |
| Kong rate limiting의 local(메모리), cluster, redis 정책, 여러 노드에서 맞추려면 redis | https://developer.konghq.com/plugins/rate-limiting/ |
| Envoy 응답 플래그 RL(로컬 rate limit, 429), UT(504) | Envoy docs/root/configuration/advanced/substitution_formatter.rst |
| 429 Too Many Requests | https://www.rfc-editor.org/rfc/rfc6585 |

직접 돌려 본 것(WSL, Envoy 1.40.2 + Python 서버):

- `/orders`에 local rate limit(토큰 5개, 1초마다 5개): 요청 10개를 한꺼번에 → 200 5개, 429 5개(플래그 RL, 0ms, 본문 `local_rate_limited`), 뒤쪽은 5번만 받음. 1.2초 뒤 다시 200.
- `/slow` 타임아웃 1초, 뒤쪽 2초: 클라이언트 1.000초에 504(플래그 UT), 뒤쪽 기록 "worked 2.00s, sent".
- `/ok`: 전체 101~102ms, `x-envoy-upstream-service-time` 101ms.
- 그림의 120ms = 105 + 15ms는 설명용 예시예요.
