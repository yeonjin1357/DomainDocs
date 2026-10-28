# 사실 확인: 파드가 Evicted로 끝날 때

- 글: src/content/docs/kubernetes/pod-evicted.mdx
- 확인일: 2026-10-28

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 노드 압박 축출은 파드 상태를 Failed로 두고 끝냄, 워크로드가 대신할 파드를 만듦 | https://kubernetes.io/docs/concepts/scheduling-eviction/node-pressure-eviction/ |
| 리눅스 하드 기준 기본값 `memory.available<100Mi`, `nodefs.available<10%`, `imagefs.available<15%`, `nodefs.inodesFree<5%` | 같은 문서 |
| 하드 기준은 끝낼 시간 0초, 소프트 기준은 정한 시간 동안 이어질 때만, `eviction-max-pod-grace-period` | 같은 문서 |
| 디스크 압박 때 먼저 끝난 파드·컨테이너를 치우고 쓰지 않는 이미지를 지움, 그다음 디스크 사용량 순으로 파드 축출 | 같은 문서 |
| 축출 순서: 요청을 넘었는지 → 우선순위 → 요청 대비 사용량. kubelet은 QoS 등급을 직접 쓰지 않음 | 같은 문서 |
| 축출 이유 `Evicted`, 메시지 `The node was low on resource: %v.`, `Pod ephemeral local storage usage exceeds the total limit of containers %s.`, `Usage of EmptyDir volume %q exceeds the limit %q.` | https://github.com/kubernetes/kubernetes/blob/master/pkg/kubelet/eviction/helpers.go |
| nodefs·imagefs 신호의 자원 이름은 `ephemeral-storage` | 같은 소스(`signalToResource`) |
| 임시 저장 한도·emptyDir 한도를 넘으면 바로(끝낼 시간 0) 축출 | https://github.com/kubernetes/kubernetes/blob/master/pkg/kubelet/eviction/eviction_manager.go |
| 임시 저장 공간에 쓰기 층, emptyDir, 파드 로그가 들어감 | https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/ |
| 끝난 파드는 `terminated-pod-gc-threshold`(기본 12500)를 넘을 때 정리 | https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/ , https://kubernetes.io/docs/reference/command-line-tools-reference/kube-controller-manager/ |
| API 축출(drain)은 허용되면 파드를 지움 | https://kubernetes.io/docs/concepts/scheduling-eviction/api-eviction/ |

- 고친 것: 「요청과 한도」의 "이때는 요청보다 더 쓰고 있는 파드만 후보가 돼요"를 고쳤어요. 문서는 요청 안에서 쓰는 파드도 마지막 순서로 쫓겨날 수 있다고 해요. "요청보다 더 쓰고 있는 파드가 먼저 쫓겨나서, 대체로 BestEffort, Burstable, Guaranteed 순"으로 바꿨어요.
- 함께 한 것: 용어 eviction, ephemeral-storage를 올리고 퀴즈 5문제를 썼어요.
