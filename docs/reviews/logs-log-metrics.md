# 사실 확인: 로그에서 지표 만들기

- 글: src/content/docs/logs/log-metrics.mdx
- 확인일: 2026-10-29

| 확인한 주장 | 근거(URL) |
| --- | --- |
| rate는 초당 줄 수, count_over_time은 구간 안의 줄 수, unwrap으로 레이블 값을 숫자로 써서 sum_over_time·quantile_over_time 등을 냄 | https://grafana.com/docs/loki/latest/query/metric_queries/ |
| json 파서는 필드를 레이블로 꺼냄 | https://grafana.com/docs/loki/latest/query/log_queries/ |
| recording rule은 정한 시각에 질의를 돌려 결과를 미리 계산 | https://grafana.com/docs/loki/latest/query/bp-query/ |
| 지표 필터는 맞는 줄마다 1 또는 찾은 숫자를 더함, 지난 로그를 세지 않음, 기본값 0, 차원을 붙이면 기본값 불가 | https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/MonitoringLogData.html |

- 질의 두 개는 위 문서의 문법으로 맞췄고, Loki 서버에서 직접 돌리지는 못했어요.
- OnDashboard 그래프의 숫자는 예시예요.
- 함께 한 것: 퀴즈 5문제를 썼어요.
