# 사실 확인: Job·CronJob이 실패하거나 안 돌 때

- 글: src/content/docs/kubernetes/job-failed.mdx
- 확인일: 2026-10-28

| 확인한 주장 | 근거(URL) |
| --- | --- |
| `backoffLimit` 기본 6, 실패한 파드 다시 만들기 지연 10초·20초·40초…, 최대 10분 | https://kubernetes.io/docs/concepts/workloads/controllers/job/ , https://github.com/kubernetes/kubernetes/blob/master/pkg/controller/job/job_controller.go (`DefaultJobPodFailureBackOff = 10s`, `MaxJobPodFailureBackOff = 10m`) |
| 실패 판단은 실패 수 > backoffLimit | 같은 소스(`jobCtx.failed > *job.Spec.BackoffLimit`) |
| `activeDeadlineSeconds`가 backoffLimit보다 먼저, 닿으면 돌던 파드를 멈추고 `DeadlineExceeded`, Failed가 된 Job은 저절로 다시 돌지 않음 | Job 문서 |
| 실패 조건 메시지 `Job has reached the specified backoff limit`, `Job was active longer than specified deadline` | Job 컨트롤러 소스 |
| `OnFailure`는 같은 파드에서 컨테이너를 다시 시작, 재시도를 다 쓰면 파드가 끝나 디버깅이 어려움, `Never`나 로그 수집 권장, Job을 지우면 파드도 지워짐 | Job 문서 |
| Job 파드 레이블 `batch.kubernetes.io/job-name` | Job 문서 |
| `ttlSecondsAfterFinished` | Job 문서 |
| `successfulJobsHistoryLimit` 기본 3, `failedJobsHistoryLimit` 기본 1 | https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/ |
| timeZone을 적지 않으면 kube-controller-manager의 시간대, `.spec.timeZone`은 1.27부터 stable, 일정 안 `CRON_TZ`·`TZ`는 검증 오류 | CronJob 문서 |
| `concurrencyPolicy` Allow(기본)·Forbid·Replace, `suspend`, 한 일정에 Job이 둘 생기거나 안 생길 수 있어 멱등이어야 함 | CronJob 문서 |
| 이벤트 이유 `MissSchedule`, `JobAlreadyActive`, `TooManyMissedTimes`, `FailedCreate`(`Error creating job: …`) | https://github.com/kubernetes/kubernetes/blob/master/pkg/controller/cronjob/cronjob_controllerv2.go , https://github.com/kubernetes/kubernetes/blob/master/pkg/controller/cronjob/utils.go |
| 컨트롤러가 돌아오면 가장 최근에 놓친 일정 하나만 돌림, `startingDeadlineSeconds`를 넘긴 일정은 건너뜀 | 같은 소스(`mostRecentScheduleTime`, `tooLate`) |
| `kubectl get cronjob`의 TIMEZONE 칸, 비면 `<none>` | https://github.com/kubernetes/kubernetes/blob/master/pkg/printers/internalversion/printers.go |
| `kube_cronjob_status_last_successful_time` | https://github.com/kubernetes/kube-state-metrics/blob/main/docs/metrics/workload/cronjob-metrics.md |

- 질의 확인: promtool 3.15.1로 `time() - kube_cronjob_status_last_successful_time > 26 * 3600`을 시험했어요. 평가 시각 27시간에 마지막 성공이 24.2시간 전인 CronJob은 빠지고, 26.2시간 전인 CronJob만 나왔어요.
- 글에 넣지 않은 것: CronJob 문서는 놓친 일정이 100번을 넘으면 "Job을 시작하지 않는다"고 하지만, 지금 소스는 `TooManyMissedTimes` 경고만 남기고 가장 최근 일정을 그대로 처리해요. 그래서 글에는 "100번을 넘었어요"라는 이벤트 뜻만 적었어요.
- 함께 한 것: 「워크로드」에 이 글로 가는 줄을 더하고, 퀴즈 5문제를 썼어요.
