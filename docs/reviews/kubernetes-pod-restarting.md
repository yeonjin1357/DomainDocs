# 사실 확인: 파드가 계속 재시작될 때

- 글: src/content/docs/kubernetes/pod-restarting.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| describe의 Last State에 종료 이유와 코드, OOMKilled 예시의 Exit Code 137 | https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/ |
| Last State: Terminated, Reason: Error, Exit Code 예시 | https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/ |
| kubectl logs --previous = 직전 컨테이너 로그 | https://kubernetes.io/docs/reference/kubectl/generated/kubectl_logs/ |
| CrashLoopBackOff 원인(앱 오류, 설정 오류, 자원 부족, 프로브 실패) | https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/ |

- 메모: 137 = 128 + SIGKILL(9)은 셸의 일반 관례예요. 그래프 숫자는 설명용이에요.
