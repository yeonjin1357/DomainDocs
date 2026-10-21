# 사실 확인: 서비스로 요청이 가지 않을 때

- 글: src/content/docs/kubernetes/service-no-traffic.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 점검 순서(서비스 존재, 네트워크 정책, DNS 이름, 서비스 정의·targetPort, EndpointSlice, 파드, kube-proxy) | https://kubernetes.io/docs/tasks/debug/debug-application/debug-service/ |
| kubectl get endpointslices -l kubernetes.io/service-name=…, ENDPOINTS가 비면 셀렉터와 레이블 확인, 오타가 흔한 실수 | https://kubernetes.io/docs/tasks/debug/debug-application/debug-service/ |
| 같은 네임스페이스에서는 짧은 이름, 다른 네임스페이스는 이름.네임스페이스 | https://kubernetes.io/docs/concepts/services-networking/dns-pod-service/ |
