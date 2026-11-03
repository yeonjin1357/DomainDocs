# 사실 확인: 대시보드가 느리게 뜰 때

- 글: src/content/docs/foundations/slow-dashboard.mdx
- 확인일: 2026-11-03

실험: Prometheus 3.5.0(Windows)에 `http_requests_total` 시계열 200개(인스턴스 20 × 경로 10), 6시간, 15초 간격 데이터를 `promtool tsdb create-blocks-from openmetrics`로 넣고 `query_range`에 `stats=all`을 붙여 쟀어요.

| 확인한 주장 | 근거(URL) |
| --- | --- |
| `sum(rate(x[5m]))` 6시간 step 15초: 1,440점, totalQueryableSamples 5,726,000 | 실제 Prometheus 3.5.0 |
| step 60초 1,433,000, step 300초 288,200 / `path="/p1"`(20개) 572,600 / `instance=~"i0.*"`(100개) 2,863,000 | 실제 Prometheus 3.5.0 |
| `sum` 없이 `rate(x[5m])`: 시계열 200개, 288,000점, 211ms(`sum`은 98ms, 한 번 잰 값) | 실제 Prometheus 3.5.0 |
| `[1h]`로 바꾸면 63,432,000(11배) | 실제 Prometheus 3.5.0 |
| 기록 규칙 `job:http_requests:rate5m`을 `promtool tsdb create-blocks-from rules`로 채운 뒤 `sum(job:http_requests:rate5m)`: 1,439점, 1,439샘플, 가운데 점 값 1973.817로 원래 질의와 같음 | 실제 Prometheus 3.5.0 |
| step 1초로 6시간(21,600점): `exceeded maximum resolution of 11,000 points per timeseries. Try decreasing the query resolution (?step=XX)` | 실제 Prometheus 3.5.0 |
| 기본 플래그 `query.max-samples` 50000000, `query.timeout` 2m, `query.max-concurrency` 20 | 실제 Prometheus 3.5.0 `/api/v1/status/flags`, https://prometheus.io/docs/prometheus/latest/command-line/prometheus/ |
| `--query.max-samples=100000`이면 `query processing would load too many samples into memory in query execution`. 한도는 한꺼번에 올린 수(peakSamples)를 봐요: 총합 63M인 `[1h]` 질의도 기본 한도에서 통과 | 실제 Prometheus 3.5.0 |
| `query_log_file`의 줄 모양(`timings.execTotalTime`, `execQueueTime`, `samples.totalQueryableSamples`, `peakSamples`) | 실제 Prometheus 3.5.0, https://prometheus.io/docs/guides/query-log/ |
| `stats=all`이면 응답에 `totalQueryableSamples` 등이 와요 | https://prometheus.io/docs/prometheus/latest/querying/api/ |
| 기록 규칙은 자주 쓰거나 무거운 식을 미리 계산해 새 시계열로 저장, 대시보드에 특히 유용 | https://prometheus.io/docs/prometheus/latest/configuration/recording_rules/ |
| 이름은 `level:metric:operations`, rate를 쓰면 `_total`을 떼요 | https://prometheus.io/docs/practices/rules/ |
| Grafana Stats 탭: 질의 시간, 보낸 질의 수, 행 수 | https://grafana.com/docs/grafana/latest/panels-visualizations/panel-inspector/ |
| Max data points 기본은 패널 폭 픽셀 수, Min interval은 보통 수집 주기 | https://grafana.com/docs/grafana/latest/panels-visualizations/query-transform-data/ |
| All 값은 기본으로 모든 값을 이어 붙여 길어지고 느릴 수 있어서 Custom all value(예: `.+`)를 권함 | https://grafana.com/docs/grafana/latest/dashboards/variables/add-template-variables/ |
| 새 대시보드는 기본으로 화면에 들어온 패널만 질의(`default_preload` 기본 false) | https://grafana.com/docs/grafana/latest/setup-grafana/configure-grafana/ (원문 grafana/docs/sources/setup-grafana/configure-grafana/_index.md) |

- 계산: 30일 ÷ 15초 = 172,800점.
