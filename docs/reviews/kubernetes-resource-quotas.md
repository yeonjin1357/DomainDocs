# 사실 확인: 네임스페이스 할당량

- 글: src/content/docs/kubernetes/resource-quotas.mdx
- 확인일: 2026-10-28

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 할당량을 넘는 만들기·고치기는 `403 Forbidden`으로 거부, 할당량 변경은 이미 만든 객체에 영향 없음 | https://kubernetes.io/docs/concepts/policy/resource-quotas/ |
| `requests.cpu`·`limits.memory` 등은 끝나지 않은 파드의 합계, `pods`는 Failed·Succeeded가 아닌 파드 수, `requests.storage`·`persistentvolumeclaims`·`<class>.storageclass.storage.k8s.io/requests.storage` 항목 | https://kubernetes.io/docs/concepts/policy/resource-quotas/ |
| cpu·memory 할당량이 있으면 새 파드는 그 자원의 요청이나 한도를 적어야 하고, 안 적으면 거부될 수 있음(`must specify …`) | 같은 문서, https://github.com/kubernetes/kubernetes/blob/master/pkg/quota/v1/evaluator/core/pods.go |
| Deployment 만들기는 성공하고 파드만 덜 생김, 상태 메시지 `exceeded quota: …, requested: …, used: …, limited: …` | https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/quota-pod-namespace/ |
| 거부 메시지 형식 `exceeded quota: %s, requested: %s, used: %s, limited: %s` | https://github.com/kubernetes/kubernetes/blob/master/staging/src/k8s.io/apiserver/pkg/admission/plugin/resourcequota/controller.go |
| ReplicaSet 컨트롤러가 파드 만들기 실패를 `FailedCreate` 이벤트 `Error creating: …`로 남김 | https://github.com/kubernetes/kubernetes/blob/master/pkg/controller/controller_utils.go |
| LimitRange는 기본 요청·한도를 넣고 min·max를 검사, 파드를 만들 때만 검사해 기존 파드는 그대로, 둘 이상이면 어느 기본값이 붙을지 정해지지 않음, 기본값끼리 맞는지 검사하지 않아 `must be less than or equal to cpu limit`으로 거부될 수 있음 | https://kubernetes.io/docs/concepts/policy/limit-range/ |
| 롤링 업데이트는 기본 25%까지 파드를 더 띄움(할당량이 차면 새 파드를 못 만듦) | https://kubernetes.io/docs/concepts/workloads/controllers/deployment/ |

- 함께 한 것: 용어 resource-quota, limit-range를 올리고 퀴즈 5문제를 썼어요.
