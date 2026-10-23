# 사실 확인: 이상 탐지와 기준선

- 글: src/content/docs/foundations/anomaly-detection.mdx
- 확인일: 2026-10-23

| 확인한 주장 | 근거(URL) |
| --- | --- |
| `offset`은 선택자 바로 뒤에 붙여야 하고, `offset 1w`로 일주일 전 값을 가져옴(1w = 7d) | https://prometheus.io/docs/prometheus/latest/querying/basics/ |
| `predict_linear(v, t)`는 단순 선형 회귀로 t초 뒤를 예측하고 게이지에만 씀 | https://prometheus.io/docs/prometheus/latest/querying/functions/ |
| `double_exponential_smoothing`은 Prometheus 2의 `holt_winters`이고, Holt-Winters가 보통 세 겹(계절성 포함)을 뜻해 헷갈려 이름을 바꿈 | https://prometheus.io/docs/prometheus/latest/querying/functions/ |
| 이 함수는 `--enable-feature=promql-experimental-functions`를 켜야 씀 | https://prometheus.io/docs/prometheus/latest/feature_flags/ |
| Prometheus 3에서 `holt_winters`가 이름이 바뀌고 실험 기능 플래그 뒤로 감 | https://prometheus.io/docs/prometheus/latest/migration/ |
| z-score로 ±3 밖을 이상으로 봄, 에러율·지연·대기열 길이는 정규분포가 아니라 고정 임계값이 나은 경우가 많음, 합친 값에 써야 함 | https://about.gitlab.com/blog/anomaly-detection-using-prometheus/ |
| 1·2·3주 전 같은 시간대로 만든 예측의 중앙값(quantile 0.5)을 씀, 공휴일 한 주가 끼어도 덜 흔들림 | https://about.gitlab.com/blog/anomaly-detection-using-prometheus/ |
| GitLab은 이상을 찾으면 Slack에만 알리고 당직자는 부르지 않음 | https://about.gitlab.com/blog/anomaly-detection-using-prometheus/ |
| Datadog basic(계절성 없음, rolling quantile), agile(SARIMA 변형, 수준 변화를 빨리 따라감), robust(계절-추세 분해, 오래 이어지는 이상에 안정), 주 단위 계절성은 최소 3주 데이터 | https://docs.datadoghq.com/monitors/types/anomaly/ |
| 사람을 부르는 알림은 증상에 검 | https://sre.google/sre-book/monitoring-distributed-systems/ |

- 질의 확인: promtool 3.15.1의 `test rules`로 세 질의를 돌렸어요. 지난주 대비 비율 질의는 0.5, z-score 질의는 값 10~50에서 1.4142, `predict_linear(...[6h], 4 * 3600)`은 시간당 100씩 줄어드는 값에서 0이 나왔어요.
- 계산 확인: 정규분포에서 ±3σ 밖은 0.27%예요. 1,440 × 0.0027 ≈ 3.9라 본문은 "하루 4번쯤", 지표 100개면 389라 "390번쯤"으로 썼어요.
- 메모: 화면 그림의 주문 수는 예시 숫자예요.
- 함께 한 것: 퀴즈 5문제. `three-sigma-daily`는 위 계산과 같아요.
