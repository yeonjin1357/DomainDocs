# 사실 확인: HPA가 파드를 늘리지 않을 때

- 글: src/content/docs/kubernetes/hpa-not-scaling.mdx
- 확인일: 2026-10-28

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 기본 15초마다 계산, 허용 범위 0.1, 줄일 때 안정화 창 300초, 늘릴 때 15초마다 4개와 100% 중 큰 쪽 | https://kubernetes.io/docs/concepts/workloads/autoscaling/horizontal-pod-autoscale/ |
| 자원 사용률 기반이면 파드에 요청을 적어야 함 | 같은 문서 |
| 준비되지 않은 파드는 CPU로 늘릴 때 0%로 보수적으로 계산 | 같은 문서 |
| HPA를 쓰면 Deployment 매니페스트에서 `spec.replicas`를 빼라고 권함 | 같은 문서 |
| 조건 AbleToScale·ScalingActive·ScalingLimited의 뜻 | https://kubernetes.io/docs/tasks/run-application/horizontal-pod-autoscale-walkthrough/ |
| 이벤트·조건 이유 `FailedGetResourceMetric`, `TooManyReplicas`("the desired replica count is more than the maximum replica count"), `ScaleUpLimit` | https://github.com/kubernetes/kubernetes/blob/master/pkg/controller/podautoscaler/horizontal.go |
| 메시지 `failed to get cpu utilization: missing request for cpu in container … of Pod …` | 같은 소스(`failed to get %s utilization`), https://github.com/kubernetes/kubernetes/blob/master/pkg/controller/podautoscaler/replica_calculator.go (`missing request for %s in container %s of Pod %s`) |
| `kubectl get hpa` TARGETS의 `<unknown>`, 1.30부터 `cpu: …/60%`처럼 자원 이름이 붙음(API 서버의 표 출력) | https://github.com/kubernetes/kubernetes/blob/release-1.30/pkg/printers/internalversion/printers.go (1.29에는 없음) |

- 숫자 확인: 파드 4개 × 90% ÷ 60% = 6개(올림 없이 정수).
- 함께 한 것: 「자동 확장」에 이 글로 가는 줄을 더하고, 퀴즈 5문제를 썼어요.
