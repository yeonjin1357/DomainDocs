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

## 2026-10-30 문제 다시 쓰기

- 문제: src/content/quizzes/kubernetes/*.yaml (26개 파일, 130문제)
- 바꾼 까닭: OX 정답의 O가 11%, 정답이 가장 긴 보기인 객관식이 63%라 눈치로 맞힐 수 있었어요. 글끼리 겹치는 문제(셀렉터, 짧은 이름, Running인데 대상 아님, CronJob 성공)와 빈칸 뚫기에 가까운 문제도 있었어요.
- 고친 뒤: OX 34문제 중 O 19(56%), 객관식 85문제 중 정답이 가장 긴 보기 13(15%), 정답이 가장 긴 오답의 1.2배를 넘는 문제 0개예요.
- 새로 들어간 주장만 아래에서 확인했어요. 나머지는 글 본문과 각 글의 검토 기록에 기대요.

| 문제(파일 · id) | 확인한 주장 | 근거 |
| --- | --- | --- |
| requests-and-limits · avg-hides-throttling | 한도 1코어, 1초에 한 번 스레드 8개가 20ms씩 쓰면 평균 0.16코어여도 스로틀링돼요 | WSL Ubuntu cgroup v2에 cpu.max "100000 100000"을 걸고 node 워커 8개로 5초 돌림: 쓴 CPU 약 810ms, nr_throttled 5(일한 횟수와 같음). 한도 max로는 0번. https://docs.kernel.org/scheduler/sched-bwc.html |
| images-and-layers · pull-policy-default | 태그를 적은 이미지는 기본 IfNotPresent라, 노드에 같은 이름·태그가 있으면 다시 받지 않아요 | https://kubernetes.io/docs/concepts/containers/images/#image-pull-policy |
| config-and-storage · emptydir-lost | 컨테이너가 죽어도 파드는 노드에 남아 emptyDir 데이터가 그대로예요 | https://kubernetes.io/docs/concepts/storage/volumes/#emptydir |
| rbac · role-scope | RoleBinding이 ClusterRole을 가리키면 그 바인딩의 네임스페이스 안에서만 권한이 생겨요. 노드 같은 클러스터 전체 자원은 ClusterRoleBinding이 필요해요 | https://kubernetes.io/docs/reference/access-authn-authz/rbac/#rolebinding-and-clusterrolebinding |
| node-not-ready · disk-pressure | 디스크 압박이면 kubelet이 끝난 파드·컨테이너와 안 쓰는 이미지를 먼저 지우고, 모자라면 파드를 내보내요 | https://kubernetes.io/docs/concepts/scheduling-eviction/node-pressure-eviction/#reclaim-node-resources |
| node-not-ready · stale-running | 연락이 끊기고 2분째에는 파드 단계가 Running 그대로예요. 파드를 Failed로 바꾸는 PodGC는 노드가 없어졌거나, out-of-service taint 노드에서 종료 중인 파드가 대상이에요. 축출은 taint 뒤 300초예요 | https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/ (Pod garbage collection) |
| pod-status · running-may-restart | 시작 중이거나 재시작 중인 컨테이너가 있어도 단계는 Running이에요 | https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-phase |
| pod-restarting · probe-killing | Unhealthy 이벤트는 프로브 종류와 상관없이 남고, 컨테이너를 다시 시작하는 건 liveness 실패예요 | https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#container-probes |
| workloads · cronjob-not-job-success | 앞 Job이 실패로 끝나도 다음 일정에 새 Job을 만들어요. concurrencyPolicy는 아직 도는 Job에만 걸려요 | https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/#concurrency-policy |
| openshift · scc-uid | 기본 restricted 계열 SCC는 프로젝트 범위의 UID로 실행해서, 이미지의 USER 값을 따르지 않아요 | https://docs.redhat.com/en/documentation/openshift_container_platform/4.16/html/authentication_and_authorization/managing-pod-security-policies |
| cluster-dns · first-query | ndots:5에서 api.example.com은 검색 도메인 셋 뒤 넷째로 원래 이름을 물어요 | 글 본문과 docs/reviews/kubernetes-cluster-dns.md의 질의 세기 실험 |
