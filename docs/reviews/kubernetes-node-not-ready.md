# 사실 확인: 노드가 NotReady일 때

- 글: src/content/docs/kubernetes/node-not-ready.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| Ready True·False·Unknown 뜻, node-monitor-grace-period 기본 50초, MemoryPressure·DiskPressure·PIDPressure | https://kubernetes.io/docs/reference/node/node-status/ |
| 기본 하드 축출 기준 memory.available<100Mi(리눅스), nodefs.available<10% 등 | https://kubernetes.io/docs/concepts/scheduling-eviction/node-pressure-eviction/ |
| not-ready·unreachable taint에 tolerationSeconds=300 자동 추가, 5분 동안 노드에 남음 | https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/ |

- 메모: kubelet 점검(systemctl, journalctl)과 원인 목록은 일반 설명이에요. 워터폴의 마지막 구간 길이는 설명용이에요.

## 2026-10-29 보강

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 노드 조건(memory-pressure 등)에 따라 컨트롤 플레인이 NoSchedule taint를 자동으로 붙임 | https://kubernetes.io/docs/concepts/scheduling-eviction/taint-and-toleration/#taint-nodes-by-condition |
