# 사실 확인: 알림이 와야 하는데 안 올 때

- 글: src/content/docs/foundations/alerts-not-arriving.mdx
- 확인일: 2026-11-03

| 확인한 주장 | 근거(URL) |
| --- | --- |
| for 동안 이어져야 firing, 그 전은 pending. ALERTS{alertname, alertstate="pending|firing"} 시계열이 남음 | https://github.com/prometheus/prometheus/blob/main/docs/configuration/alerting_rules.md |
| absent()는 시계열이 없을 때 1을 돌려줌 | https://prometheus.io/docs/prometheus/latest/querying/functions/ |
| group_wait 기본 30s, group_interval 기본 5m, repeat_interval 기본 4h. group_wait 전에 풀린 알림은 보내지 않음 | https://github.com/prometheus/alertmanager/blob/main/docs/configuration.md |
| 억제는 source가 울리는 동안 equal 레이블이 같은 target을 막음, 점검 시간(mute_time_intervals)도 보내지 않음 | 같은 문서 |
| alertmanager_notifications_failed_total(실패), alertmanager_notifications_suppressed_total(사일런스·억제·시간 구간으로 막힘), integration 레이블 | https://github.com/prometheus/alertmanager/blob/main/notify/metrics.go |
| prometheus_notifications_dropped_total(Alertmanager로 보내다 에러로 버림), prometheus_notifications_errors_total | https://github.com/prometheus/prometheus/blob/main/notifier/metric.go (namespace prometheus, subsystem notifications) |
| amtool 0.34.2로 시험: 위 경로 나무에 team=payment severity=critical → pay-oncall, team=Payment severity=critical → ops-chat(기본 경로) | WSL ~/amt/am.yml, `amtool config routes test` |
| 글의 PromQL 세 식(dropped rate, failed sum by integration, absent)은 promtool check rules 통과 | scratchpad/al/rules.yml, promtool 3.5.0 |

- for 5m 시간 띠와 20초 장애 예시는 설명용이에요(규칙 평가 간격은 뺐어요).
