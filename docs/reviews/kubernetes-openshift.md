# 사실 확인: OpenShift

- 글: src/content/docs/kubernetes/openshift.mdx
- 확인일: 2026-10-29

docs.redhat.com이 503을 돌려줘서, 같은 문서의 원본 저장소(openshift/openshift-docs)에서 확인했어요.

| 확인한 주장 | 근거(URL) |
| --- | --- |
| SCC는 특권 컨테이너, UID, 권한, 볼륨 종류 등을 정함, restricted-v2는 인증된 사용자의 기본, 모든 capability를 빼고 권한 상승을 막음, restricted-v3는 restricted-v2에 사용자 네임스페이스를 강제한 것 | https://github.com/openshift/openshift-docs/blob/main/modules/security-context-constraints-about.adoc |
| MustRunAsRange는 네임스페이스의 openshift.io/sa.scc.uid-range 주석으로 범위를 채우고, 범위의 가장 작은 값을 기본으로 씀 | https://github.com/openshift/openshift-docs/blob/main/modules/security-context-constraints-pre-allocated-values.adoc |
| 프로젝트는 주석이 더 붙은 쿠버네티스 네임스페이스 | https://github.com/openshift/openshift-docs/blob/main/modules/rbac-projects-namespaces.adoc |
| `oc new-project` 예시 | https://docs.okd.io/latest/applications/projects/working-with-projects.html |
| 인그레스를 만들면 대응하는 Route를 만들고 Route가 인그레스를 주인으로 가리킴, 종료 방식 edge·passthrough·reencrypt | https://github.com/openshift/openshift-docs/blob/main/modules/nw-ingress-creating-a-route-via-an-ingress.adoc |
| DeploymentConfig는 4.14부터 deprecated, 보안·치명적 문제만 수정, Deployment 권장 | https://github.com/openshift/openshift-docs/blob/main/snippets/deployment-config-deprecated.adoc |
| 기본 모니터링 구성(Cluster Monitoring Operator, Prometheus, Alertmanager, kube-state-metrics, openshift-state-metrics, node-exporter, Thanos Querier) | https://github.com/openshift/openshift-docs/blob/main/modules/monitoring-default-monitoring-components.adoc |
| 라우터는 HAProxy가 기준 구현 | https://github.com/openshift/router |

- 문서에서 기본 SCC가 restricted-v2라는 문장과 restricted-v3가 새 설치의 기본이 된다는 문장이 함께 있어서, 글에는 "버전에 따라 v2나 v3"로 썼어요.
- 처음에는 "4.11부터 restricted-v2"라고 썼다가, 2차 자료로만 확인돼서 고쳤어요.
- 함께 한 것: 용어 openshift, openshift-route, openshift-project, scc를 올리고, 쿠버네티스 개요에 이 글을 이었어요. 퀴즈 5문제를 썼어요.

## 2026-10-29 보강

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 라우터는 서비스의 엔드포인트(파드 IP)로 바로 보내고 서비스 IP를 거치지 않음 | https://docs.openshift.com/container-platform/3.4/architecture/core_concepts/routes.html |

- 메모: 그림이 라우터 → 서비스 → 파드로 그려져 있던 것을, 라우터가 서비스에서 주소만 얻고 파드로 바로 보내도록 고쳤어요.
