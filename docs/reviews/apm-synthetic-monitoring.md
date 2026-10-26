# 사실 확인: URL 모니터링(외부 감시)

- 글: src/content/docs/apm/synthetic-monitoring.mdx
- 확인일: 2026-10-26

| 확인한 주장 | 근거(URL) |
| --- | --- |
| `probe_success`가 성공 여부, `probe_duration_seconds / probe_timeout_seconds`로 타임아웃 사용 비율을 봄 | https://github.com/prometheus/blackbox_exporter/blob/master/README.md |
| 점검 타임아웃은 Prometheus `scrape_timeout`에서 조금 줄여 정하고, 둘 다 없으면 120초 | https://github.com/prometheus/blackbox_exporter/blob/master/README.md |
| `valid_status_codes` 기본 2xx, `follow_redirects` 기본 true, `fail_if_body_not_matches_regexp` | https://github.com/prometheus/blackbox_exporter/blob/master/CONFIGURATION.md |
| `preferred_ip_protocol` 기본 ip6, `ip_protocol_fallback` 기본 true, 같은 계열 주소가 여럿이면 첫 하나만 써서 라운드 로빈 DNS는 사실상 무작위 하나 | https://github.com/prometheus/blackbox_exporter/blob/master/CONFIGURATION.md |
| `probe_http_duration_seconds`의 phase 레이블 resolve·connect·tls·processing·transfer, 기본 User-Agent `Blackbox-Exporter/<버전>` | https://github.com/prometheus/blackbox_exporter/blob/master/prober/http.go |
| 점검 한 번은 한 위치에서 한 사용자를 흉내 냄, 스크립트·브라우저 점검 | https://grafana.com/docs/grafana-cloud/testing/synthetic-monitoring/ |
| 점검별 알림은 실패 횟수, 평균 지연, 인증서 만료 기준 | https://grafana.com/docs/grafana-cloud/testing/synthetic-monitoring/configure-alerts/configure-per-check-alerts/ |
| 예전 기본 알림 세 개는 성공률이 5분 동안 95%, 90%, 75% 아래일 때 | https://grafana.com/docs/grafana-cloud/testing/synthetic-monitoring/configure-alerts/synthetic-monitoring-alerting/ |

- 질의 확인: promtool 3.15.1로 세 위치의 `probe_success`를 넣어 시험했어요.
  - 한 위치만 실패하면 `count by (instance) (avg_over_time(probe_success[5m]) < 0.8) >= 2`는 빈 결과, 두 위치가 실패하면 2가 나왔어요.
  - 세 위치 평균을 0.9와 견주는 식은 한 위치가 5분 내내 실패하면 0.667이 되어 울렸어요. 실패가 두 번만 들어간 6분 시점에도 0.867로 울려서, 본문은 위치를 따로 세는 식을 권했어요.
- 고친 것: 처음엔 평균 성공률 식을 쓰려 했는데, 시험 결과 한 곳 실패에도 울려서 위치 수를 세는 식으로 바꿨어요.
- 메모: 화면 그림과 워터폴의 숫자는 예시예요. 용어 `apm/synthetic-monitoring`의 이어 둔 글을 이 글로 바꿨어요.
- 함께 한 것: 퀴즈 5문제를 썼어요.
