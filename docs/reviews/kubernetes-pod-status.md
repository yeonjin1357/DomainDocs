# 사실 확인: 파드 상태와 재시작

- 글: src/content/docs/kubernetes/pod-status.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 다섯 단계의 뜻, Running에 시작·재시작 중 포함, Unknown은 보통 노드와 통신 오류 | https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/ |
| 컨테이너 상태 Waiting·Running·Terminated와 reason·종료 코드·시각 | https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/ |
| restartPolicy Always(기본)·OnFailure·Never, Deployment는 Always만, Job은 OnFailure·Never | https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/ |
| 재시작 간격 10s·20s·40s, 최대 300초, 10분 문제없이 돌면 초기화, 같은 노드·같은 파드 안 | https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/ |
| CrashLoopBackOff의 뜻과 흔한 원인 네 가지 | https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/ |
| startup·liveness·readiness 프로브의 동작, liveness는 readiness를 기다리지 않음 | https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/ |
| ImagePullBackOff = 이미지를 못 받음, 간격을 늘려 최대 300초 | https://kubernetes.io/docs/concepts/containers/images/ |
| Pending에 머무름 = 노드에 놓지 못함, 보통 자원 부족 | https://kubernetes.io/docs/tasks/debug/debug-application/debug-pods/ |
| liveness 잘못 만들면 연쇄 장애, liveness는 앱 자신만·readiness는 바깥 서비스까지 | https://kubernetes.io/docs/concepts/configuration/liveness-readiness-startup-probes/ |
| `kubectl logs --previous` = 이전 컨테이너 실행의 로그 | https://kubernetes.io/docs/reference/kubectl/generated/kubectl_logs/ |

- 메모: 노드마다 최대 대기를 바꾸는 설정은 Pod Lifecycle 문서의 KubeletCrashLoopBackOffMax(베타) 항목이에요.
