# 사실 확인: 워크로드

- 글: src/content/docs/kubernetes/workloads.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 워크로드 객체는 파드보다 높은 단계이고, 컨트롤 플레인이 그 spec대로 파드를 대신 관리 | https://kubernetes.io/docs/concepts/workloads/controllers/ |
| Deployment = 상태 없는 앱, 파드끼리 바꿔 쓸 수 있음, ReplicaSet을 간접으로 씀 | https://kubernetes.io/docs/concepts/workloads/controllers/ |
| Deployment는 원하는 상태를 정해진 속도로 맞추고, 기본 25% max unavailable·25% max surge(75% 이상 유지, 125% 이하) | https://kubernetes.io/docs/concepts/workloads/controllers/deployment/ |
| ReplicaSet = 정해진 수의 파드를 늘 유지, 보통 Deployment가 관리 | https://kubernetes.io/docs/concepts/workloads/controllers/replicaset/ |
| DaemonSet = 모든(또는 일부) 노드에 파드 하나, 노드가 들어오면 추가·빠지면 정리, 로그 수집·노드 모니터링 용도 | https://kubernetes.io/docs/concepts/workloads/controllers/daemonset/ |
| StatefulSet = 고유한 네트워크 이름, 안정된 저장소, 순서대로 배포·확장 | https://kubernetes.io/docs/concepts/workloads/controllers/statefulset/ |
| Job = 정해진 수가 성공할 때까지 파드를 재시도, backoffLimit 기본 6 | https://kubernetes.io/docs/concepts/workloads/controllers/job/ |
| CronJob = 일정마다 Job 생성, crontab 한 줄과 같음, 백업·리포트 용도 | https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/ |

- 메모: 롤링 업데이트 그래프는 파드 4개 기준의 단순화한 예시예요. 실제 순서는 준비 시간에 따라 달라요.
