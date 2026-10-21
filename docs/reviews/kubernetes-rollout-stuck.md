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
