# 사실 확인: 파드를 놓을 노드 고르기

- 글: src/content/docs/kubernetes/scheduling.mdx
- 확인일: 2026-11-03
- 근거는 kubernetes/website 원문(raw.githubusercontent.com/kubernetes/website/main/content/en/docs/...)을 받아 대조했어요. kubectl은 돌리지 않았어요.

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 스케줄러는 필터와 점수 두 단계, 점수가 같으면 무작위, 필터 뒤 남은 노드가 없으면 놓을 수 없음, 설정 방법은 정책과 프로필 둘 | https://kubernetes.io/docs/concepts/scheduling-eviction/kube-scheduler/ |
| nodeSelector는 가장 단순한 권장 방법, 적은 레이블이 모두 있는 노드에만 놓음 | https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/ |
| required는 조건을 못 맞추면 놓지 않음, preferred는 맞는 노드가 없어도 놓음, IgnoredDuringExecution은 놓인 뒤 레이블이 바뀌어도 계속 돎 | 같은 문서 Node affinity |
| nodeSelector와 nodeAffinity를 함께 쓰면 둘 다 맞아야 함, nodeSelectorTerms는 OR, matchExpressions는 AND | 같은 문서 |
| 파드 간 어피니티는 큰 클러스터에서 스케줄링을 크게 늦춤, 수백 대 넘는 클러스터에는 권하지 않음 | 같은 문서 |
| maxSkew는 영역 사이 파드 수 차이의 허용치 | https://kubernetes.io/docs/concepts/scheduling-eviction/topology-spread-constraints/ |
| NoSchedule은 새 파드만 막고 있던 파드는 둠, PreferNoSchedule은 되도록 피함(보장 아님), NoExecute는 있던 파드도 내보냄·tolerationSeconds만큼 머묾 | https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/ |
| toleration은 배치를 허락하지만 보장하지 않음, 전용 노드는 taint와 함께 레이블·노드 어피니티를 더해야 그 노드만 씀 | 같은 문서 ("Tolerations allow scheduling but don't guarantee scheduling", Dedicated Nodes) |
| kubeadm 클러스터는 기본으로 컨트롤 플레인 노드에 파드를 두지 않음(node-role.kubernetes.io/control-plane:NoSchedule) | https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/create-cluster-kubeadm/ |

- 함께 한 것: 용어 node-affinity, taint, toleration을 올리고, scheduler 용어의 doc을 이 글로 바꿨어요. 퀴즈 5문제를 썼어요.
