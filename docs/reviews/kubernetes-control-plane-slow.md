# 사실 확인: 컨트롤 플레인이 느릴 때

- 글: src/content/docs/kubernetes/control-plane-slow.mdx
- 확인일: 2026-11-03

| 확인한 주장 | 근거(URL) |
| --- | --- |
| apiserver_request_duration_seconds(verb·resource 등 레이블, 히스토그램), apiserver_request_total(code 레이블), apiserver_flowcontrol_rejected_requests_total(APF가 거절한 요청), apiserver_admission_webhook_admission_duration_seconds(name 레이블) | https://kubernetes.io/docs/reference/instrumentation/metrics/ |
| apiserver_storage_objects는 1.34에서 지원 중단, apiserver_resource_objects를 권함(글에는 쓰지 않음) | 같은 문서 |
| APF가 줄을 넘친 요청을 HTTP 429로 거절 | https://kubernetes.io/docs/concepts/cluster-administration/flow-control/ |
| watch로 처음 요청 이후 바뀐 것만 받음, 컨트롤러는 informer를 씀 | https://kubernetes.io/docs/reference/using-api/api-concepts/ |
| 웹훅 failurePolicy: Fail(기본)은 거절, Ignore는 웹훅을 건너뜀 | https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/ |
| etcd 기본 저장 한도 2GiB(--quota-backend-bytes), 8GiB 권장 최대 | https://etcd.io/docs/v3.5/dev-guide/limit/ |
| 한도를 넘으면 클러스터 전체 NOSPACE 경보, 읽기와 지우기만 받음, "mvcc: database space exceeded", 정리와 조각 모으기 뒤 경보를 풀어야 함 | https://etcd.io/docs/v3.5/op-guide/maintenance/ |
| wal_fsync_duration_seconds p99 10ms 아래, backend_commit_duration_seconds p99 25ms 아래 | https://etcd.io/docs/v3.5/faq/ |
| etcd 지표 이름 has_leader, wal_fsync_duration_seconds, db_total_size_in_bytes(etcd 소스 server/etcdserver, storage/wal, storage/mvcc의 metrics.go) | https://github.com/etcd-io/etcd |
| 글의 histogram_quantile 식은 promtool check rules 통과 | scratchpad/cp/rules.yml |

- '파드 수천 개를 자주 LIST하는 에이전트가 흔한 원인'은 사례를 든 말이에요. LIST가 비싼 까닭과 watch를 권하는 근거는 위 API Concepts 문서예요.
