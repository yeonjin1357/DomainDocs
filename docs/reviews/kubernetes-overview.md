# 사실 확인: 쿠버네티스가 앱을 띄우는 방식

- 글: src/content/docs/kubernetes/overview.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 클러스터 = 컨트롤 플레인 + 하나 이상의 워커 노드 | https://kubernetes.io/docs/concepts/overview/components/ |
| API 서버(HTTP API를 내놓는 중심 서버), etcd(API 서버 데이터의 키-값 저장소), 스케줄러(노드 없는 파드에 노드 배정), 컨트롤러 매니저(컨트롤러 실행) | https://kubernetes.io/docs/concepts/overview/components/ |
| kubelet(파드와 컨테이너가 돌게 함), kube-proxy(서비스용 네트워크 규칙 유지), 컨테이너 런타임(컨테이너 실행) | https://kubernetes.io/docs/concepts/overview/components/ |
| spec = 원하는 상태, status = 지금 상태, 컨트롤 플레인이 지금 상태를 원하는 상태에 계속 맞춤 | https://kubernetes.io/docs/concepts/overview/working-with-objects/ |

- 메모: "구성 요소들이 API 서버를 거쳐 움직인다"와 "API 서버가 멈춰도 이미 떠 있는 파드는 돈다"는 구성 요소 설명에서 나온 일반 설명이에요. 시퀀스 그림은 watch 구조를 단순하게 화살표로 그렸어요.
