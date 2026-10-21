# 사실 확인: 파드가 Pending에 머물 때

- 글: src/content/docs/kubernetes/pod-pending.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| FailedScheduling 이벤트, "0/42 nodes available: insufficient cpu" 예시 | https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/ |
| Pending = 노드에 놓지 못함, 자원 부족 시 파드 삭제·요청 조정·노드 추가, hostPort 제약, Waiting의 가장 흔한 원인은 이미지 받기 실패 | https://kubernetes.io/docs/tasks/debug/debug-application/debug-pods/ |
| taint는 노드가 파드를 밀어내고, toleration이 있어야 놓임 | https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/ |
| nodeSelector는 모든 레이블이 맞는 노드에만 놓음 | https://kubernetes.io/docs/concepts/scheduling-eviction/assign-pod-node/ |
| 맞는 볼륨이 없으면 PVC는 묶이지 않은 채로 남음(50Gi PV와 100Gi 요청 예) | https://kubernetes.io/docs/concepts/storage/persistent-volumes/ |
