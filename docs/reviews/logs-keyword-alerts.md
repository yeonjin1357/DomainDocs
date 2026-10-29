# 사실 확인: 키워드로 알림 만들기

- 글: src/content/docs/logs/keyword-alerts.mdx
- 확인일: 2026-10-29

| 확인한 주장 | 근거(URL) |
| --- | --- |
| `\|=`, `!=`, `\|~`, `!~`의 뜻, `\|=`는 "포함"이고 대소문자 구분, 정규식도 기본 구분하고 `(?i)`로 끔 | https://grafana.com/docs/loki/latest/query/log_queries/ |
| count_over_time은 구간 안의 줄 수를 스트림마다 셈, 예 `count_over_time({job="mysql"}[5m])` | https://grafana.com/docs/loki/latest/query/metric_queries/ |
| 지표 필터는 맞는 줄마다 값을 더해 지표를 만듦, 지난 로그를 세지 않음, 기본값은 로그가 들어왔는데 맞는 줄이 없을 때 보내고 로그가 없던 분에는 보내지 않음, 차원을 붙이면 기본값 불가·새 값마다 새 지표, 적어도 한 번 반영(가끔 중복) | https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/MonitoringLogData.html |

- 질의 두 개(`sum(count_over_time({…} |= "ERROR" [5m])) > 20`, `| json | level="ERROR"`)는 위 문서의 문법으로 맞췄어요. Loki 서버에서 직접 돌리지는 못했어요.
- 「결과가 비면」의 Loki 동작은 "비어 있을 수 있어요"로만 쓰고, 단정은 문서로 확인한 CloudWatch 동작으로 했어요.
- 함께 한 것: 용어 metric-filter를 올렸어요. 퀴즈 5문제를 썼어요.
