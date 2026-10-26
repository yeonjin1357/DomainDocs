# 사실 확인: 알림을 누구에게 보낼까

- 글: src/content/docs/foundations/alert-routing.mdx
- 확인일: 2026-10-26

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 모든 알림은 맨 위 경로로 들어오고 맨 위 경로는 조건이 없어야 함, `continue`가 false면 처음 맞는 자식에서 멈춤(기본 false), 맞는 자식이 없으면 지금 경로의 설정으로 처리, receiver·group_by 등은 물려받고 점검 시간은 물려받지 않음 | https://prometheus.io/docs/alerting/latest/configuration/ |
| Grafana도 처음 맞는 정책에서 멈추고 Continue matching siblings로 함께 보냄, 기본 정책이 모든 알림을 받음 | https://grafana.com/docs/grafana/latest/alerting/fundamentals/notifications/notification-policies/ |
| 호출 응답 시간은 사용자에게 보이거나 급한 서비스 5분, 덜 급한 시스템 30분이 흔한 값 | https://sre.google/sre-book/being-on-call/ |
| Every page should be actionable | https://sre.google/sre-book/monitoring-distributed-systems/ |
| 첫 규칙에는 바로 알리고, escalation timeout 안에 확인·해결·재지정이 없으면 다음 규칙으로, 확인하면 넘기지 않음 | https://support.pagerduty.com/main/docs/escalation-policies |
| `alertmanager_notifications_failed_total`(integration, reason 레이블) | https://github.com/prometheus/alertmanager/blob/main/notify/metrics.go |

- 설정 확인: WSL Ubuntu의 Alertmanager 0.34.1 amtool로 본문의 경로 나무를 시험했어요.
  - `team=payment severity=critical`은 pay-oncall, `team=payment severity=warning`은 pay-chat이었어요.
  - `severity=critical`(팀 없음)과 `team=Payment severity=critical`(대소문자 다름)은 ops-chat이었어요.
- 함께 한 것: 퀴즈 5문제를 썼어요.
