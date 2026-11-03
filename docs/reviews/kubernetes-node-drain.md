# 사실 확인: 노드 비우기와 PDB

- 글: src/content/docs/kubernetes/node-drain.mdx
- 확인일: 2026-11-03
- 로컬 kubectl은 외부 클러스터를 가리켜서 실행하지 않았어요. 문서와 소스로만 확인했어요.

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 뜻밖의 중단(하드웨어 고장, 커널 패닉, 자원 부족 축출 등)과 계획된 중단(노드 점검·업그레이드, 노드 줄이기) | https://kubernetes.io/docs/concepts/workloads/pods/disruptions/ |
| 파드나 Deployment를 직접 지우면 PDB를 거치지 않아요. 롤링 업데이트로 빠진 파드는 예산에 셈하지만 롤링 업데이트는 PDB에 막히지 않아요. 뜻밖의 중단은 못 막지만 예산에는 셈해요 | 같은 문서 |
| 운영 도구는 직접 지우지 말고 Eviction API를 써야 PDB를 지켜요, drain은 거절되면 주기적으로 다시 시도 | 같은 문서 |
| 노드 drain 때 `AlwaysAllow` 정책을 권해요 | 같은 문서 |
| cordon = Mark node as unschedulable, drain = 노드를 unschedulable로 표시하고 파드를 축출(지원 안 되면 DELETE) | https://kubernetes.io/docs/reference/kubectl/generated/kubectl_cordon/, https://kubernetes.io/docs/reference/kubectl/generated/kubectl_drain/ |
| `kubectl get nodes` 상태 `SchedulingDisabled` | kubernetes 소스 pkg/printers/internalversion/printers.go (`status = append(status, "SchedulingDisabled")`) |
| 끝나면 uncordon, 한 번에 노드 하나씩 drain | https://kubernetes.io/docs/tasks/administer-cluster/safely-drain-node/ |
| DaemonSet 파드는 `--ignore-daemonsets`, DaemonSet 컨트롤러가 바로 다시 만들어요 | 같은 문서 |
| `--delete-emptydir-data`(emptyDir 데이터 지워짐), `--force`(컨트롤러 없는 파드), `--disable-eviction`(PDB 건너뜀), `--timeout` 0은 무한 | kubectl drain 참조 |
| 축출 응답 200 허용, 429 PDB로 거절(나중에 다시), 500 여러 PDB 같은 설정 오류, PDB 없는 파드는 늘 200 | https://kubernetes.io/docs/concepts/scheduling-eviction/api-eviction/ |
| `maxUnavailable` 0 또는 `minAvailable`=복제본 수면 drain이 끝나지 않아요 | https://kubernetes.io/docs/tasks/run-application/configure-pdb/ |
| 앱별 예시(상태 없는 앞단 minAvailable 90%, 쿼럼 크기, 한 개짜리는 PDB 없음 또는 maxUnavailable 0, 재시작 가능한 Job은 PDB 없음) | 같은 문서 |
| 비율은 올림(7개 × 90% = 6.3 → 7) | 같은 문서(예: 7개 50% → 4개) |
| healthy = Ready 조건이 True, `unhealthyPodEvictionPolicy` 기본 IfHealthyBudget, 1.31부터 stable | 같은 문서 |
| kube-state-metrics `kube_poddisruptionbudget_status_pod_disruptions_allowed`, `kube_node_spec_unschedulable` | kube-state-metrics docs/metrics (policy/poddisruptionbudget-metrics.md, cluster/node-metrics.md) |
