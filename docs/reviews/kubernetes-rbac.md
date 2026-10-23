# 사실 확인: 권한과 서비스 계정(RBAC)

- 글: src/content/docs/kubernetes/rbac.mdx
- 확인일: 2026-10-23

| 확인한 주장 | 근거(URL) |
| --- | --- |
| RBAC 권한은 더하기만 하고 금지(deny) 규칙이 없음 | https://kubernetes.io/docs/reference/access-authn-authz/rbac/ |
| Role은 한 네임스페이스, ClusterRole은 클러스터 전체(노드 같은 클러스터 자원, 모든 네임스페이스의 자원) | https://kubernetes.io/docs/reference/access-authn-authz/rbac/ |
| RoleBinding은 같은 네임스페이스의 Role이나 ClusterRole을 그 네임스페이스에만 묶음, 대상은 사용자·그룹·서비스 계정 | https://kubernetes.io/docs/reference/access-authn-authz/rbac/ |
| 규칙 형식 `apiGroups: [""]`, `resources`, `verbs: ["get", "list", "watch"]` | https://kubernetes.io/docs/reference/access-authn-authz/rbac/ |
| 기본 RBAC 정책은 kube-system 밖의 서비스 계정에 권한을 주지 않음(API discovery 역할만) | https://kubernetes.io/docs/reference/access-authn-authz/rbac/ |
| 인가가 거부하면 HTTP 403(Forbidden), `kubectl auth can-i`와 `--as system:serviceaccount:<ns>:<name>` | https://kubernetes.io/docs/reference/access-authn-authz/authorization/ |
| 네임스페이스마다 `default` 서비스 계정, 따로 정하지 않은 파드에 자동 지정 | https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/ |
| 토큰 경로 `/var/run/secrets/kubernetes.io/serviceaccount/`, `automountServiceAccountToken: false`는 계정·파드에 쓰고 파드가 우선 | https://kubernetes.io/docs/tasks/configure-pod-container/configure-service-account/ |
| 처음 있는 네임스페이스 default, kube-system 등, 노드는 네임스페이스에 속하지 않음 | https://kubernetes.io/docs/concepts/overview/working-with-objects/namespaces/ |
| Secret에 대한 list·watch도 내용을 드러냄 | https://kubernetes.io/docs/concepts/security/rbac-good-practices/ |

- 명령 확인: 이 PC의 kubectl 설정이 외부 클러스터를 가리키고 있어 실제로 돌리지 않았어요. `kubectl auth can-i` 형식은 공식 문서의 예와 대조했어요.
- 메모: 화면 그림(파드 list yes, 노드 list no)은 예시예요.
- 함께 한 것: 용어 `kubernetes/k8s-namespace`, `kubernetes/rbac`, `kubernetes/service-account`를 더했고, 퀴즈 5문제를 썼어요.
