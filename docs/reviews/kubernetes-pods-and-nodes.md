# 사실 확인: 파드와 노드

- 글: src/content/docs/kubernetes/pods-and-nodes.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 파드 = 가장 작은 배포 단위, 저장소·네트워크를 함께 쓰는 컨테이너 하나 이상, 고래 떼·완두콩 꼬투리 비유 | https://kubernetes.io/docs/concepts/workloads/pods/ |
| 파드는 Deployment·Job 같은 워크로드로 만들고, 비교적 잠깐 쓰고 버리는 존재 | https://kubernetes.io/docs/concepts/workloads/pods/ |
| 파드는 일이 끝나거나, 지워지거나, 자원 부족으로 쫓겨나거나, 노드가 죽을 때까지 노드에 머묾 | https://kubernetes.io/docs/concepts/workloads/pods/ |
| 파드마다 클러스터 전체에서 하나뿐인 IP, 파드 안 컨테이너는 네트워크 네임스페이스를 함께 써 localhost로 통신, 파드끼리 프록시·NAT 없이 통신 | https://kubernetes.io/docs/concepts/services-networking/ |
| 노드 구성 요소(kubelet, kube-proxy, 컨테이너 런타임), 스케줄러가 노드 없는 파드를 배정 | https://kubernetes.io/docs/concepts/overview/components/ |

- 메모: "대부분의 파드는 컨테이너 하나, 둘 이상이면 주 앱과 보조 컨테이너"는 Pods 문서의 단일·다중 컨테이너 설명을 줄인 거예요. 다시 뜬 파드가 새 이름·IP를 받는 건 파드가 새 객체로 만들어지기 때문이에요.
