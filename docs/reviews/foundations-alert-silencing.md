# 사실 확인: 알림 잠재우기와 점검 시간

- 글: src/content/docs/foundations/alert-silencing.mdx
- 확인일: 2026-10-26

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 억제는 어떤 알림이 울릴 때 다른 알림의 알림을 막음(클러스터 전체 장애 예), 사일런스는 매처로 정한 시간 동안 막음 | https://prometheus.io/docs/alerting/latest/alertmanager/ |
| `inhibit_rule`의 target·source 매처와 `equal`, 양쪽에 맞는 알림끼리는 서로 막지 않음, 겹치지 않게 잡으라고 권함 | https://prometheus.io/docs/alerting/latest/configuration/ |
| `time_interval`의 weekdays·times·location, location이 없으면 UTC, `mute_time_intervals`·`active_time_intervals`는 부모 경로에서 물려받지 않음 | https://prometheus.io/docs/alerting/latest/configuration/ |
| `amtool silence add`, `amtool silence expire` | https://github.com/prometheus/alertmanager/blob/main/README.md |
| 사일런스의 필수 항목 matchers, startsAt, endsAt, createdBy, comment | https://github.com/prometheus/alertmanager/blob/main/api/v2/openapi.yaml |
| 사일런스·점검 시간은 알림 평가를 멈추지 않고 화면에서 지우지 않음, 점검 시간은 되풀이·사일런스는 한 번 | https://grafana.com/docs/grafana/latest/alerting/configure-notifications/create-silence/ , https://grafana.com/docs/grafana/latest/alerting/configure-notifications/mute-timings/ |
| Watchdog은 늘 울려 알림 파이프라인이 살아 있는지 확인하는 알림, 끊기면 바깥 시스템이 알려야 함 | https://runbooks.prometheus-operator.dev/runbooks/general/watchdog/ |

- 설정 확인: Alertmanager 0.34.1의 `amtool check-config`로 본문의 점검 시간(location Asia/Seoul)과 억제 규칙을 담은 설정을 검사해 통과했어요. Windows용 amtool은 시간대 데이터가 없어 실패해서, WSL Ubuntu의 리눅스용으로 돌렸어요.
- 동작 확인: WSL에서 Alertmanager를 띄우고 ClusterDown(cluster=a), DiskSlow(cluster=a, warning), DiskSlow(cluster=b, warning)를 넣었어요.
  - cluster=a의 DiskSlow만 suppressed가 되고 cluster=b는 active였어요.
  - `amtool silence add alertname=DiskSlow cluster=b --duration=2h --comment=...` 뒤에는 cluster=b도 suppressed가 됐어요.
- 계산 확인: UTC 02:00은 한국 시간 11:00이에요.
- 메모: 화면 그림의 알림 수는 예시예요.
- 함께 한 것: 퀴즈 5문제를 썼어요.
