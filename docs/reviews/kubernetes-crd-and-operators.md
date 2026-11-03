# 사실 확인: CRD와 오퍼레이터

- 글: src/content/docs/kubernetes/crd-and-operators.mdx
- 확인일: 2026-11-03
- 로컬 kubectl은 외부 클러스터를 가리켜서 실행하지 않았어요. 문서와 소스로만 확인했어요.

| 확인한 주장 | 근거(URL) |
| --- | --- |
| CRD로 새 종류를 더하고, 커스텀 리소스는 기본 오브젝트처럼 kubectl로 다뤄요 | https://kubernetes.io/docs/concepts/extend-kubernetes/api-extension/custom-resources/ |
| CRD를 지우면 API 엔드포인트를 내리고 저장된 커스텀 오브젝트를 모두 지워요 | https://kubernetes.io/docs/tasks/extend-kubernetes/custom-resources/custom-resource-definitions/ |
| 오퍼레이터 = 커스텀 리소스로 앱을 관리하는 확장, 컨트롤 루프를 따르고 사람 운영자의 지식을 담아요 | https://kubernetes.io/docs/concepts/extend-kubernetes/operator/ |
| finalizer가 있으면 Terminating에 머물고, 손으로 떼는 건 목적을 알 때만 | https://kubernetes.io/docs/concepts/overview/working-with-objects/finalizers/ |
| `serviceMonitorSelector`: 빈 셀렉터는 모두, null은 하나도 안 골라요 | Prometheus Operator API reference(Documentation/api-reference/api.md) |
| `serviceMonitorNamespaceSelector` 기본(null)은 Prometheus와 같은 네임스페이스만 | 같은 문서 |
| ServiceMonitor `namespaceSelector` 기본은 ServiceMonitor와 같은 네임스페이스, `endpoints[].port`는 Service 포트 이름(`.spec.ports[].name`) | 같은 문서(v1.ServiceMonitorSpec, v1.Endpoint) |
| kube-prometheus-stack 기본 `serviceMonitorSelectorNilUsesHelmValues: true` → `serviceMonitorSelector.matchLabels.release: <릴리스 이름>` | 차트 values.yaml, templates/prometheus/prometheus.yaml |
| Prometheus Operator 지표 `prometheus_operator_reconcile_errors_total`, `prometheus_operator_reconcile_operations_total`, `prometheus_operator_managed_resources{state="rejected"}` | prometheus-operator example/mixin/alerts.yaml |
| controller-runtime 지표 `controller_runtime_reconcile_errors_total` | controller-runtime pkg/internal/controller/metrics/metrics.go |

- 화면 예시 숫자(실패율 12% 등)는 설명용이에요.
