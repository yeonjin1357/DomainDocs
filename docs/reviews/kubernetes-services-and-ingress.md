# 사실 확인: 서비스와 인그레스

- 글: src/content/docs/kubernetes/services-and-ingress.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 서비스 = 파드에서 도는 앱을 네트워크에 내놓는 방법, 파드는 생기고 사라지며 IP가 바뀌는 문제를 풂, 대상은 보통 셀렉터로 정함 | https://kubernetes.io/docs/concepts/services-networking/service/ |
| ClusterIP(기본, 클러스터 안), NodePort(노드 IP의 고정 포트, 30000-32767, 클러스터 IP도 만듦), LoadBalancer(바깥 로드 밸런서, 쿠버네티스가 직접 주지 않음), ExternalName | https://kubernetes.io/docs/concepts/services-networking/service/ |
| EndpointSlice = 서비스 뒤 엔드포인트 목록, readiness 실패 시 파드 IP를 뺌 | https://kubernetes.io/docs/concepts/services-networking/service/ |
| 서비스 DNS 이름 my-svc.my-namespace.svc.cluster-domain, 클러스터 IP로 풀림, 검색 도메인으로 짧은 이름 확장, 헤드리스는 파드 IP 목록 | https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/ |
| 인그레스 = 바깥 HTTP 접근 관리, 로드 밸런싱·TLS 종료·이름 기반 가상 호스팅, 컨트롤러 없으면 효과 없음, Gateway 권장, API 동결·제거 계획 없음 | https://kubernetes.io/docs/concepts/services-networking/ingress/ |
| Gateway API는 애드온 API 묶음 | https://kubernetes.io/docs/concepts/services-networking/gateway/ |
| 레이블 = 객체에 붙이는 키-값 | https://kubernetes.io/docs/concepts/overview/working-with-objects/labels/ |

- 메모: 특정 인그레스 컨트롤러 제품 이름은 일부러 적지 않았어요(제품 지원 상태가 자주 바뀌어요).
