# 사실 확인: 자동 확장

- 글: src/content/docs/kubernetes/autoscaling.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| HPA는 Deployment·StatefulSet 같은 워크로드를 자동으로 바꿈, 수평 = 파드 수, 수직 = 파드 자원 | https://kubernetes.io/docs/concepts/workloads/autoscaling/horizontal-pod-autoscale/ |
| 기본 15초마다 확인, 원하는 수 = ceil(지금 수 × 지금 값 ÷ 목표 값), 200m/100m → 두 배, 허용 범위 0.1 | https://kubernetes.io/docs/concepts/workloads/autoscaling/horizontal-pod-autoscale/ |
| 사용률 = 요청 대비 %, 요청 없는 컨테이너가 있으면 그 지표로 아무것도 안 함, Metrics Server는 따로 띄움 | https://kubernetes.io/docs/concepts/workloads/autoscaling/horizontal-pod-autoscale/ |
| 줄이기는 300초 안정화 창(그동안 계산값 중 최댓값), 늘리기는 즉시·15초마다 4개 또는 100%까지 | https://kubernetes.io/docs/concepts/workloads/autoscaling/horizontal-pod-autoscale/ |
| minReplicas 0은 object·external 지표가 하나 이상 필요 | https://kubernetes.io/docs/concepts/workloads/autoscaling/horizontal-pod-autoscale/ |
| 노드 자동 확장은 클라우드 자원(주로 VM)을 만들어 노드를 붙이고, 목표는 모든 파드를 놓을 수 있게 하는 것 | https://kubernetes.io/docs/concepts/cluster-administration/node-autoscaling/ |

- 메모: 4 × 90 ÷ 60 = 6. 그래프는 1분 간격 예시이고, 5분 창 때문에 필요한 수가 내려간 뒤 5칸 뒤에 줄어요.

## 다시 확인 (2026-10-30)

| 확인한 주장 | 근거(URL) |
| --- | --- |
| HPA 기본 허용 범위 0.1, 줄일 때 안정화 300초, 늘릴 때 15초마다 4개와 100% 중 큰 쪽 | https://kubernetes.io/docs/concepts/workloads/autoscaling/horizontal-pod-autoscale/ |
| `minReplicas: 0`은 object·external 지표가 하나 이상 있어야 함. `HPAScaleToZero` 기능 게이트는 1.16~1.36 알파(기본 꺼짐), 1.37부터 베타(기본 켜짐) | 같은 문서, https://kubernetes.io/docs/reference/command-line-tools-reference/feature-gates/ |

- 고친 것: 더 깊이 "0개까지 줄이기"에 기능 게이트와 버전을 더했어요.
