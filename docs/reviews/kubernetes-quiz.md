# 사실 확인: 쿠버네티스 퀴즈

- 문제: src/content/quizzes/kubernetes/*.yaml (15개 파일, 75문제)
- 확인일: 2026-10-21
- 방법: 숫자·기본값·버전마다 다른 동작이 든 문제만 골라, 그 문제가 기대는 글의 문장과 글의 검토 기록 근거에 맞춰 봤어요. 글에 없는 새 주장은 넣지 않았어요.

| 문제(파일 · id) | 확인한 주장 | 근거 |
| --- | --- | --- |
| overview · api-server-down, etcd-role | API 서버가 멈춰도 떠 있는 파드는 그대로, etcd는 API 서버 데이터 저장소 | 글 본문과 docs/reviews/kubernetes-overview.md |
| containers · default-tag | 태그를 빼면 latest로 알아들음 | 글 본문과 docs/reviews/kubernetes-containers.md |
| workloads · rolling-min-available, job-backoff-limit | 기본 max unavailable 25%·max surge 25%(4개 → 최소 3개), backoffLimit 기본 6 | 글 본문·Deeper와 docs/reviews/kubernetes-workloads.md |
| requests-and-limits · cpu-limit-throttles, avg-hides-throttling, besteffort-first | CPU 한도는 스로틀링(기본 주기 100ms), 아무것도 안 적으면 BestEffort로 먼저 축출 | 글 본문과 docs/reviews/kubernetes-requests-and-limits.md |
| pod-status · backoff-doubling, readiness-fails | 재시작 대기 10초부터 두 배씩 최대 5분, 10분 정상이면 초기화, readiness 실패는 재시작 없이 대상에서 빠짐 | 글 본문과 docs/reviews/kubernetes-pod-status.md |
| services-and-ingress · clusterip-default, ingress-needs-controller | ClusterIP가 기본, 인그레스는 컨트롤러가 있어야 동작 | 글 본문과 docs/reviews/kubernetes-services-and-ingress.md |
| config-and-storage · base64-not-encryption, env-needs-restart, delete-reclaim | Secret 기본 etcd 비암호화, 환경 변수는 재시작해야 바뀜, 동적 프로비저닝 PV 기본 Delete | 글 본문과 docs/reviews/kubernetes-config-and-storage.md |
| autoscaling · hpa-calc, slow-scale-down | 올림(4 × 90 ÷ 60) = 6, 축소 안정화 창 기본 300초 | 글 본문과 docs/reviews/kubernetes-autoscaling.md |
| pod-restarting · exit-137 | 문서 예시의 OOMKilled 종료 코드 137 = 128 + 9로 읽음 | 글 본문과 docs/reviews/kubernetes-pod-restarting.md |
| node-not-ready · ready-unknown, eviction-wait | Unknown은 기본 50초 소식 없음, NotReady·unreachable taint toleration 300초 | 글 본문과 docs/reviews/kubernetes-node-not-ready.md |
| reading-events · events-expire | --event-ttl 기본 1시간 | 글 본문과 docs/reviews/kubernetes-reading-events.md |
| rollout-stuck · progress-deadline, no-auto-rollback | progressDeadlineSeconds 기본 600, 멈춤 표시만 하고 되돌리지 않음 | 글 본문과 docs/reviews/kubernetes-rollout-stuck.md |
