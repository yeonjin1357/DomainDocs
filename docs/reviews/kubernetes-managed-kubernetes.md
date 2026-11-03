# 사실 확인: 관리형 쿠버네티스(EKS·AKS·GKE)

- 글: src/content/docs/kubernetes/managed-kubernetes.mdx
- 확인일: 2026-11-03
- 로컬 kubectl은 외부 클러스터를 가리켜서 실행하지 않았어요. 문서로만 확인했어요.

| 확인한 주장 | 근거(URL) |
| --- | --- |
| EKS 표준 지원 14개월, 이어서 연장 지원 12개월(추가 비용), 끝나면 가장 오래된 지원 버전으로 자동 업그레이드, 자동 업그레이드는 되돌릴 수 없음 | https://docs.aws.amazon.com/eks/latest/userguide/kubernetes-versions.html |
| 관리형 노드 그룹은 컨트롤 플레인을 올릴 때 저절로 올라가지 않음 | 같은 문서 FAQ |
| 쿠버네티스 커뮤니티는 평균 넉 달마다 새 마이너 버전 | 같은 문서, https://kubernetes.io/blog/2021/07/20/new-kubernetes-release-cadence/ (해마다 세 번) |
| EKS 클러스터당 시간당 0.10달러, 연장 지원 버전이면 0.60달러(0.10 포함) | https://aws.amazon.com/eks/pricing/ |
| 컨트롤 플레인 로그 다섯 종류(api, audit, authenticator, controllerManager, scheduler), 기본으로 CloudWatch Logs에 보내지 않고 종류마다 켜야 함, CloudWatch Logs 비용 | https://docs.aws.amazon.com/eks/latest/userguide/control-plane-logs.html |
| API 서버 /metrics는 그대로, 1.28부터 metrics.eks.amazonaws.com으로 kube-scheduler·kube-controller-manager 지표 | https://docs.aws.amazon.com/eks/latest/userguide/view-raw-metrics.html |
| GKE Autopilot: Google이 노드·확장·보안 설정을 관리 | https://cloud.google.com/kubernetes-engine/docs/concepts/autopilot-overview |
| Fargate의 파드는 저마다 계산 경계(커널·CPU·메모리·ENI)를 따로 가짐 | https://docs.aws.amazon.com/eks/latest/userguide/fargate.html |
| GKE 릴리스 채널 Rapid·Regular·Stable·Extended, 채널에 맞춰 자동 업그레이드 | https://cloud.google.com/kubernetes-engine/docs/concepts/release-channels |
| AKS는 GA 마이너 버전 셋(N, N-1, N-2)을 지원 | https://learn.microsoft.com/en-us/azure/aks/supported-kubernetes-versions |
| kubelet은 kube-apiserver보다 새로우면 안 되고, 세 마이너 버전까지 낮아도 됨(1.25 미만 kubelet은 둘) | https://kubernetes.io/releases/version-skew-policy/ |

- 고친 것: 확인하지 못한 'Autopilot은 노드에 들어가거나 설정을 바꾸는 일이 제한돼요'를 빼고 Fargate 설명으로 바꿨어요.
