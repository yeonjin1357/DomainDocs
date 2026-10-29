# 사실 확인: 배포가 끝나지 않을 때

- 글: src/content/docs/kubernetes/rollout-stuck.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| progressDeadlineSeconds 기본 600, 넘으면 Progressing False·ProgressDeadlineExceeded, 컨트롤러는 계속 재시도, 쿠버네티스는 표시 말고 아무것도 안 함 | https://kubernetes.io/docs/concepts/workloads/controllers/deployment/ |
| 멈추는 이유: 할당량 부족, readiness 실패, 이미지 받기 실패, 권한 부족, limit range, 앱 설정 오류 | https://kubernetes.io/docs/concepts/workloads/controllers/deployment/ |
| kubectl rollout status, kubectl rollout undo | https://kubernetes.io/docs/concepts/workloads/controllers/deployment/ |
| readiness 실패 파드는 서비스 대상에서 빠짐 | https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/ |

- 메모: 예시 숫자는 설명용이에요.

## 2026-10-29 보강

| 확인한 주장 | 근거(URL) |
| --- | --- |
| replicas 3에서 이미지가 잘못된 새 버전은 새 ReplicaSet 1개(DESIRED 1, READY 0), 옛 ReplicaSet 3개로 멈춤, describe 출력 "3 desired, 1 updated, 4 total, 3 available" | https://kubernetes.io/docs/concepts/workloads/controllers/deployment/ (Rolling Back a Deployment) |
| maxSurge 기본 25%는 올림, maxUnavailable 기본 25%는 내림 | https://kubernetes.io/docs/concepts/workloads/controllers/deployment/ (Max Surge, Max Unavailable) |
| 할당량을 넘으면 파드가 만들어지지 않고 ReplicaSet에 FailedCreate가 남음 | kubernetes-resource-quotas 검토 참고 |

- 메모: 처음 예시는 "파드 4개 중 새 1, 옛 3"이었는데, replicas 4면 maxSurge 1·maxUnavailable 1이라 새 파드가 2개까지 떠서 맞지 않았어요. 공식 예시처럼 replicas 3으로 고쳤어요.
- 메모: 표의 Pending 행에서 할당량을 빼고, 할당량은 "새 파드가 아예 없음" 행으로 나눴어요.
