# 사실 확인: 서비스 메시(Istio·Envoy)

- 글: src/content/docs/kubernetes/service-mesh.mdx
- 확인일: 2026-11-04

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 데이터 플레인은 사이드카로 붙은 Envoy, 컨트롤 플레인이 프록시를 설정, istiod는 서비스 발견·설정·인증서 관리 | https://istio.io/latest/docs/ops/deployment/architecture/ |
| HTTP 기본 재시도 두 번, Envoy HTTP 타임아웃은 기본으로 꺼짐 | https://istio.io/latest/docs/concepts/traffic-management/ |
| 기본 재시도 정책은 `attempts: 2`, `retryOn: connect-failure,refused-stream,unavailable,cancelled`(503 상태 코드는 기본에 없음) | istio/api networking/v1alpha3/virtual_service.proto(HTTPRoute.retries 주석, HTTPRetry.retry_on) |
| 프록시 둘 사이 통신은 자동으로 mTLS로 올림, 기본 PERMISSIVE, istiod CA가 CSR에 서명 | https://istio.io/latest/docs/concepts/security/ |
| `istio_requests_total`, `istio_request_duration_milliseconds`, reporter는 서버 쪽 프록시면 destination, 클라이언트 쪽이나 게이트웨이면 source, `response_flags` | https://istio.io/latest/docs/reference/config/metrics/ |
| 프록시가 구간을 보내도 잇는 정보는 앱이 헤더로 넘겨야 함(x-request-id, traceparent, tracestate, B3) | https://istio.io/latest/docs/tasks/observability/distributed-tracing/overview/ |
| 앰비언트: 노드마다 ztunnel(L4, mTLS, L4 지표), L7은 waypoint, 앱 파드에 사이드카 없음 | https://istio.io/latest/docs/ambient/overview/ |
| 앰비언트 모드 GA는 Istio 1.24 | https://istio.io/latest/news/releases/1.24.x/announcing-1.24/ |
| Istio 1.24, 1,000 rps·1KB: 사이드카 약 0.20 vCPU·60MB, waypoint 약 0.25 vCPU·60MB, ztunnel 약 0.06 vCPU·12MB | https://istio.io/latest/docs/ops/deployment/performance-and-scalability/ |
| 응답 플래그 UH·UF·UO(503), NR(404), URX(재시도 한도), UT(504), UC(503) | Envoy docs/root/configuration/advanced/substitution_formatter.rst |
| `reporter` 없이 더하면 2배, destination만 고르면 1배 | promtool 3.15.1 `test rules`: source·destination 두 시계열 각 10/s → 20, destination만 10 |

직접 돌려 본 것(WSL, Envoy 1.40.2 + Python 서버):

- `/ok`: 직접 0.054초, Envoy 거쳐 0.055초, 플래그 `-`.
- `/flaky`(늘 503, `retry_on: 5xx`, `num_retries: 2`): 응답 503 `URX`, attempts=3, 뒤쪽 3번. 앱 쪽 3번 반복하니 뒤쪽 9번.
- 없는 포트: 503 `UF`. 서킷 브레이커(`max_connections: 1`, `max_pending_requests: 1`)에 1초 요청 5개: 3개 바로 503 `UO`, `upstream_rq_pending_overflow` 3. 경로 없음: 404 `NR`.

- 고친 것: 처음엔 'HTTP 요청이 실패하면 두 번 다시 시도'라고 썼다가, 기본 retryOn에 503이 없어 '연결 실패·거절에 두 번'으로 고치고, 재시도 실험 그림은 503 재시도를 따로 설정한 경우로 밝혔어요.
