# 사실 확인: 배포할 때마다 에러가 잠깐 튈 때

- 글: src/content/docs/apm/deploy-errors.mdx
- 확인일: 2026-11-05

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 파드 삭제 시 kubelet이 preStop → TERM을 시작하는 것과 같은 때 컨트롤 플레인이 EndpointSlice에서 빼기 시작, 종료 중 엔드포인트는 ready=false, 유예 기본 30초, 유예 끝나면 SIGKILL, preStop이 유예를 넘으면 2초 한 번 연장 | https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/ |
| preStop은 끝나야 TERM이 감, 유예 시간은 preStop 전부터 셈, sleep 동작은 kubelet이 실행 | https://kubernetes.io/docs/concepts/containers/container-lifecycle-hooks/ |
| PodLifecycleSleepAction: 1.29 alpha, 1.30~1.33 beta(기본 켜짐), 1.34 stable | kubernetes/website feature-gates/PodLifecycleSleepAction.md |
| ALB 502 원인: 연결 시 대상의 RST, 처리 중 대상이 RST·FIN으로 닫음(대상 keep-alive가 LB 유휴 시간보다 짧은지 확인), 등록 해제 지연이 처리 중에 끝남 | https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-troubleshooting.html |
| 등록 해제 지연 기본 300초 | https://docs.aws.amazon.com/elasticloadbalancing/latest/application/edit-target-group-attributes.html |
| ALB 유휴 시간 기본 60초, 앱의 유휴 시간을 LB보다 길게 두길 권함 | https://docs.aws.amazon.com/elasticloadbalancing/latest/application/edit-load-balancer-attributes.html |
| Spring Boot 3.4부터 우아한 종료 기본, 새 요청은 네트워크 단계에서 막음, 끄려면 server.shutdown=immediate | Spring Boot 3.4 Release Notes, https://docs.spring.io/spring-boot/reference/web/graceful-shutdown.html |
| nginx는 TERM·INT에 빠른 종료, QUIT에 우아한 종료, 공식 이미지는 STOPSIGNAL SIGQUIT | https://nginx.org/en/docs/control.html , github.com/nginx/docker-nginx mainline Dockerfile |
| Envoy 응답 플래그 UF = UpstreamConnectionFailure, UC = UpstreamConnectionTermination | https://github.com/envoyproxy/envoy/blob/main/source/common/stream_info/utility.h (84·85행) |
| nginx는 처리 중 끊김을 'upstream prematurely closed connection'으로 남기고 502(NGX_HTTP_BAD_GATEWAY)로 끝냄 | https://github.com/nginx/nginx/blob/master/src/http/ngx_http_upstream.c |

직접 돌려 본 것(WSL, Envoy 1.40.2, Python ThreadingHTTPServer 두 대, 요청 하나 0.2초, 클라이언트 8개가 12초 동안 연속 요청, 4초에 A에게 SIGTERM, 새 A는 1초 뒤 포트를 엶, Envoy 헬스 체크 1초·실패 2번에 뺌·재시도 없음):

- 처리기 없음(바로 끝남): 200 477, 503 49(UC 3, UF 46). 0.5초 칸으로 −0.5초 UC 3, 0초 UF 23, 0.5초 UF 20, 1초 UF 2, 1.5초부터 0.
- SIGTERM에 shutdown → server_close(처리 중 요청 마침): 200 480, 503 48(UC 1, UF 47). A는 신호 0.085초 뒤 끝남.
- SIGTERM에 헬스 체크 503 → 3초 뒤 위와 같이 정리: 200 480, 에러 0. A는 3.27초 뒤 끝남.
