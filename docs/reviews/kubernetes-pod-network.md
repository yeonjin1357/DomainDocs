# 사실 확인: 파드 네트워크(CNI)

- 글: src/content/docs/kubernetes/pod-network.mdx
- 확인일: 2026-11-03

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 파드마다 클러스터에서 하나뿐인 IP, 파드 안 컨테이너는 네트워크 공간을 나눠 써 localhost로 통신, 모든 파드는 노드와 상관없이 프록시·NAT 없이 통신, 노드의 에이전트는 그 노드 파드에 닿음 | https://github.com/kubernetes/website/blob/main/content/en/docs/concepts/services-networking/_index.md |
| 리눅스에서 대부분의 런타임은 CNI로 파드 네트워크 구현과 이야기해서 CNI 플러그인이라 부름, NetworkPolicy도 보통 파드 네트워크 구현이 맡음 | 같은 문서 |
| --node-cidr-mask-size 기본 IPv4 24, --allocate-node-cidrs로 파드 CIDR을 나눔 | https://kubernetes.io/docs/reference/command-line-tools-reference/kube-controller-manager/ |
| kubelet --max-pods 기본 110 | https://kubernetes.io/docs/reference/command-line-tools-reference/kubelet/ |
| 파드는 기본으로 들어오고 나가는 통신이 모두 열려 있고, 정책 하나가 파드를 고르면 그 방향은 허락한 것만, 지원하는 플러그인이 없으면 정책은 효과 없음 | https://kubernetes.io/docs/concepts/services-networking/network-policies/ |
| Flannel VXLAN은 커널 VXLAN으로 감쌈, encapOverhead = 50이라 MTU() = 장치 MTU − 50 | https://github.com/flannel-io/flannel/blob/master/Documentation/backends.md, pkg/backend/vxlan/vxlan_network.go |
| AWS VPC CNI는 ENI로 파드 네트워크를 만들고, max-pods를 (ENI 수 × (ENI당 IP 수 − 1)) + 2로 권함, CNI가 준비되기 전 새 파드는 IP를 받지 못해 기다림 | https://github.com/aws/amazon-vpc-cni-k8s (README) |
| cAdvisor 지표 container_network_receive_bytes_total, container_network_transmit_bytes_total, container_network_receive_packets_dropped_total | https://github.com/google/cadvisor/blob/master/docs/storage/prometheus.md |

- 그림의 IP(10.244.1.0/24 등)는 Flannel이 흔히 쓰는 꼴을 본뜬 설명용 예시예요.
- '플러그인 파드가 죽은 노드에서는 새 파드가 ContainerCreating에 머문다'는 CNI가 IP를 주지 못하면 샌드박스를 만들지 못하는 일반 동작을 쉽게 쓴 말이에요.
