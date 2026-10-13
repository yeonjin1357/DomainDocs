# 사실 검토: 집계 구간과 다운샘플링

- 글: src/content/docs/foundations/aggregation-and-downsampling.mdx
- 검토일: 2026-10-13
- 결과: 수정 필요 7건 / 확인 31건

계산은 데모 정의(10초 간격 360개, 값 40 + ((i×7) mod 11) − 5, i=192~194만 95)를 node로 다시 했어요. Prometheus 기본 질의는 "시각마다 그 시각 이하의 가장 최근 샘플"로 옮겼어요. Grafana 간격은 grafana-prometheus-datasource `CalculatePrometheusInterval` → `intervalv2.Calculate` → `gtime.RoundInterval` 순서로 옮겼어요. 정렬은 Grafana `AlignTimeRange`처럼 step의 배수로 뒀어요(1시간이 정시에 시작).

## ① "그래프의 점 하나는 구간 하나의 요약이에요" 관점

판정: 오해 소지예요. 핵심 1에서 step을 "집계 구간"이라 부른 부분은 틀림이에요.

- 맞는 곳(점 = 구간 요약)
  - PromQL `avg_over_time(x[$__interval])`, `max_over_time(...)`: "the average value of all float or histogram samples in the specified interval" (https://prometheus.io/docs/prometheus/latest/querying/functions/#aggregation_over_time)
  - 함수 없이 읽은 Thanos 5분·1시간 데이터: "In the default case, we retrieve count and sum to compute an average." (https://github.com/thanos-io/thanos/blob/v0.42.4/pkg/query/querier.go#L273-L274)
  - Grafana가 `$__interval`로 묶는 데이터 소스: "group by time (for InfluxDB, MySQL, Postgres, MSSQL), Date histogram interval (for Elasticsearch), or as a _summarize_ function parameter (for Graphite)" (https://grafana.com/docs/grafana/latest/visualizations/dashboards/variables/global-variables/)
  - Graphite: 픽셀보다 점이 많으면 "Graphite consolidates the values", 기본은 "'average'" (https://graphite.readthedocs.io/en/latest/functions.html consolidateBy)
  - Datadog: "Every metric query is inherently aggregated.", "defaulting to the `avg` method" (https://docs.datadoghq.com/dashboards/functions/rollup/)
  - CloudWatch: "Each statistic represents an aggregation of the metrics data collected for a specified period of time." (https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html)
- 안 맞는 곳(점 = 샘플 하나)
  - Prometheus 기본 질의, Grafana + Prometheus 기본 패널: "The value returned will be that of the most recent sample at or before the query's evaluation timestamp" (https://prometheus.io/docs/prometheus/latest/querying/basics/)
  - 데모 정의로 `cpu_usage`를 step 5분으로 그리면 점 12개가 35~45%예요. 최고값 45%는 5분 평균값과 숫자만 같고, 실제로는 평소 값이에요.
  - 피크(30초)가 잡히는 정렬은 step 5분에서 300초 중 30초(10%), step 10분에서 5%예요. 잡히면 95%예요.
- 섞이는 곳
  - Thanos 5분 데이터라도 step이 10분이면 lookback으로 5분 평균 두 개 중 하나만 골라요. 데모 정의로 45.3이 잡히거나 40.1만 보여요.
  - Thanos Query는 기본으로 원본만 읽어요: `max_source_resolution` 기본값 "`step / 5` or `0` if `query.auto-downsampling` is false (default: False)" (https://github.com/thanos-io/thanos/blob/v0.42.4/docs/components/query.md)
  - step 10분에 `avg_over_time(cpu_usage[5m])`처럼 구간을 step보다 짧게 잡으면 구간 절반이 빠져 최고 40.24%예요. `[10m]`이면 42.73%예요.
- 글에 미치는 영향
  - 더 깊이 "조회할 때 정해지는 간격"은 정확해요. 그런데 머리말 summary, 대시보드 그림, 핵심 1이 그와 반대로 말해요.
  - 핵심 2·3과 확인 4개는 "평균으로/최댓값으로 묶으면"이라는 조건을 달아서 그 자체로는 맞아요. 다만 핵심 1의 틀을 그대로 받아요.
  - Prometheus 사용자는 7일 그래프의 평평한 선을 "평균에 묻힘"으로 읽어요. 실제로는 피크가 빠진 거예요.
  - 7일 그래프에 95% 점이 잡히면 5분 요약으로 읽어요. 실제로는 10초 샘플 하나예요.
  - 최댓값으로 보려면 표시 설정이 아니라 `max_over_time(cpu_usage[$__interval])`가 필요하다는 점도 놓쳐요.

## ② "최근 7일 · 한 점 5분" 표기

판정: 오해 소지예요. 근거는 아래와 같아요.

- Grafana Prometheus 백엔드는 (끝 − 시작) ÷ Max data points를 구해요. Min interval보다 작으면 Min interval을 쓰고, 아니면 `RoundInterval`로 맞춰 step으로 보내요(https://github.com/grafana/grafana-prometheus-datasource/blob/cb5651b00a6b7769b10067f1a6baec07278f4c52/pkg/promlib/intervalv2/intervalv2.go#L48-L65, https://github.com/grafana/grafana-prometheus-datasource/blob/cb5651b00a6b7769b10067f1a6baec07278f4c52/pkg/promlib/models/query.go#L395-L403).
- `RoundInterval`: "case interval <= 450000*time.Millisecond: return ... // 5m", "case interval <= 750000*time.Millisecond: return ... // 10m" (https://github.com/grafana/grafana-plugin-sdk-go/blob/5b3ec26fea665b17c2bd467fb425c69517bca601/backend/gtime/gtime.go#L276-L281). 프런트엔드도 같은 경계예요(https://github.com/grafana/grafana/blob/e047f6c26821151e4222c31923fef953bd13b072/packages/grafana-data/src/datetime/rangeutil.ts#L715-L720).
- 직접 계산: 7일 = 604,800초. 1,000px → 604.8초 → 10분. 약 807~1,344px → 10분, 1,345~2,879px → 5분(1,600px → 378초 → 5분).
- Min interval은 하한이라 5m으로 정해도 10분이 5분으로 줄지 않아요. 5분이 되려면 Max data points가 1,345 이상이어야 해요(예: 2,016 = 7일 ÷ 5분).
- 10분으로 평균하면 데모 정의로 최고 42.70%(43%)예요.
- 제안 1(숫자 유지): 라벨을 "최근 7일 · 5분 평균"으로 바꿔요. 간격이 패널 폭이 아니라 묶는 방법에서 온다는 게 드러나요.
- 제안 2(1,000px 기준): 라벨 "최근 7일 · 10분 평균", value "최고 43%", values의 45를 43으로 바꿔요.

| 주장(인용) | 판정 | 근거(URL과 짧은 인용) | 수정 제안 |
| --- | --- | --- | --- |
| 머리말 summary: "기간을 넓히면 점 하나가 더 긴 시간을 대표해서 피크가 묻혀요." | 오해 소지 | https://prometheus.io/docs/prometheus/latest/querying/basics/ "The value returned will be that of the most recent sample at or before the query's evaluation timestamp". Prometheus 기본 질의는 점마다 샘플 하나라, 피크가 묻히지 않고 빠지거나 그대로 잡혀요. 묻히는 건 평균으로 묶을 때예요(① 참고). | "기간을 넓히면 점 하나가 맡는 시간이 길어져, 짧은 피크가 묻히거나 빠져요." |
| 대시보드 위 그래프: label "최근 1시간 · 한 점 10초", value "최고 95%", ariaLabel "한 점이 10초라 95%까지 오른 피크가 보여요" | 맞음 | 직접 계산: 3,600초 ÷ 1,000px = 3.6초 → Min interval로 올라가요. https://github.com/grafana/grafana-prometheus-datasource/blob/cb5651b00a6b7769b10067f1a6baec07278f4c52/pkg/promlib/intervalv2/intervalv2.go#L58-L60 "if calculatedInterval < minInterval { return ... minInterval }". Min interval을 비우면 데이터 소스 Scrape interval(기본 15s)을 써요(https://github.com/grafana/grafana-plugin-sdk-go/blob/5b3ec26fea665b17c2bd467fb425c69517bca601/backend/gtime/gtime.go#L157-L181 `GetIntervalFrom`). Scrape interval을 10초로 정하면 10초예요. step 10초면 샘플이 모두 그려져 95%가 보여요. 점 12개는 도식이에요. | (선택) 30초 = 10초 점 3개라, values를 `[41, 40, 39, 42, 40, 95, 95, 95, 39, 41, 40, 42]`로 바꾸면 그림이 글과 맞아요. |
| 대시보드 아래 그래프 label "최근 7일 · 한 점 5분" | 오해 소지 | ② 참고. 직접 계산: 604,800초 ÷ 1,000px = 604.8초 → `RoundInterval` "case interval <= 750000*time.Millisecond: return ... // 10m"(https://github.com/grafana/grafana-plugin-sdk-go/blob/5b3ec26fea665b17c2bd467fb425c69517bca601/backend/gtime/gtime.go#L279-L281) → 10분. 5분은 Max data points(기본값 패널 폭)가 약 1,345~2,879일 때만이에요. "한 점 5분"은 묶는 방법도 말하지 않아요. | label: "최근 7일 · 5분 평균"(value·values 그대로). 1,000px 기준을 따르려면 label "최근 7일 · 10분 평균", value "최고 43%", values의 45를 43으로 바꿔요(데모 정의로 10분 평균 최고 42.70). |
| 아래 그래프 value "최고 45%", ariaLabel "최근 7일 그래프. 한 점이 5분이라 같은 피크가 45%로 낮아져 보여요" | 오해 소지 | ① 참고. 45%는 5분 평균일 때 값이에요(직접 계산: 앞에서부터 30개씩 평균 45.30, `avg_over_time(cpu_usage[5m])` step 5분 45.33). Prometheus 기본 질의 step 5분은 점 12개가 35~45%예요. 최고 45%로 숫자는 같지만 평소 값이에요. 피크가 잡히는 정렬은 10%뿐이고, 잡히면 95%예요. https://prometheus.io/docs/prometheus/latest/querying/basics/ "It does so by taking the newest sample that is less than the lookback period ago." | ariaLabel: "최근 7일 그래프. 5분씩 평균해 같은 피크가 45%로 낮아져 보여요" |
| OnDashboard caption "1시간으로 보면 95%까지 오른 피크가, 7일로 보면 45% 언저리로 묻혀요." | 오해 소지 | 기간만 바꿔서는 평균이 되지 않아요. Grafana + Prometheus 기본 패널은 7일·1,000px에서 step 10분으로 샘플을 골라요. 직접 계산: 피크가 95%로 잡히는 정렬은 20번에 1번꼴이고, 나머지는 빠져요. 평균으로 묶는 곳은 따로 있어요: Graphite "from the default of 'average'"(https://graphite.readthedocs.io/en/latest/functions.html consolidateBy), Datadog "defaulting to the `avg` method"(https://docs.datadoghq.com/dashboards/functions/rollup/). | "같은 피크가 1시간 그래프에선 95%, 5분 평균으로 묶은 7일 그래프에선 45%예요." / "Prometheus 기본 질의로 그리면 이 피크는 95%로 잡히거나 아예 빠져요." |
| 핵심 1 소제목 "그래프의 점 하나는 구간 하나의 요약이에요" | 오해 소지 | 평균·최댓값으로 묶는 질의와 저장소에선 맞아요(① "맞는 곳"). Prometheus 기본 질의는 "the most recent sample at or before the query's evaluation timestamp"(https://prometheus.io/docs/prometheus/latest/querying/basics/)라 요약이 아니에요. 글의 더 깊이 "지표 이름만 쓴 질의는 값을 묶지 않아요"와도 어긋나요. | 소제목: "기간이 길면 점 사이 간격이 벌어져요" |
| "7일 치는 그래프 폭의 픽셀 수보다 훨씬 많아서, 여러 값을 묶어 점 하나로 그려요." | 오해 소지 | 앞부분은 맞아요(60,480 ≫ 패널 폭). 줄이는 방법은 데이터 소스마다 달라요. https://grafana.com/docs/grafana/latest/panels-visualizations/query-transform-data/#query-options "the data source reduces the number of points returned by aggregating them together by average, max, or another function"은 일반 설명이에요. Prometheus는 step마다 하나를 골라요: "the range query is just like an instant query run multiple times at different timestamps"(https://prometheus.io/docs/prometheus/latest/querying/basics/). | "7일 치는 그래프 폭의 픽셀 수보다 훨씬 많아서, 점 수를 줄여 그려요." |
| "조회 기간이 길수록 점 하나가 대표하는 시간도 길어져요. 이 시간을 집계 구간이라고 해요. Prometheus는 step, Grafana는 interval이라고 불러요." | 틀림 | https://prometheus.io/docs/prometheus/latest/querying/api/#range-queries step: "Query resolution step width". 값을 계산하는 시각 사이 간격이고, 값을 묶는 구간은 `[5m]` 같은 범위 선택자예요. Grafana Interval은 "a time span that you can use when aggregating or grouping data points by time"(query options)이지만, Prometheus에는 step으로 보내져요(https://github.com/grafana/grafana-prometheus-datasource/blob/cb5651b00a6b7769b10067f1a6baec07278f4c52/pkg/promlib/models/query.go#L395-L403). | "조회 기간이 길수록 점과 점 사이 간격도 길어져요." / "이 간격을 Prometheus는 step, Grafana는 interval이라고 불러요." / "간격 사이 값은 묶거나, 하나만 골라서 줄여요." / "Prometheus 기본 질의는 묶지 않고 시각마다 가장 최근 샘플 하나를 골라요." / "고르면 짧은 피크는 95%로 잡히거나 아예 빠져요." / "`avg_over_time`, 함수 없이 읽은 Thanos 5분·1시간 데이터, Graphite·Datadog 기본값은 평균으로 묶어요." / "묶을 때 점 하나가 맡는 시간을 집계 구간이라고 해요." |
| "10초마다 수집하면 값이 1시간에 360개, 7일이면 60,480개예요." | 맞음 | 직접 계산: 3,600 ÷ 10 = 360, 7 × 24 × 360 = 60,480(= 604,800초 ÷ 10). | — |
| "이렇게 점 수를 줄이는 일을 다운샘플링(downsampling)이라고 해요." | 맞음 | https://thanos.io/tip/components/compact.md/#downsampling "Downsampling is a process of rewriting series' to reduce overall resolution of the samples". | — |
| 핵심 2 소제목 "평균으로 묶으면 짧은 피크가 묻혀요" | 맞음 | https://prometheus.io/docs/prometheus/latest/querying/functions/#aggregation_over_time avg_over_time "the average value of all float or histogram samples in the specified interval". 아래 계산처럼 구간이 길수록 낮아져요. 조건("평균으로 묶으면")이 붙어 있어 그 자체로는 맞아요. | — |
| "평소 40% 안팎인 서버가 30초 동안 95%였다고 해 봐요. 1분씩 평균을 내면 피크가 든 점은 67%로 보여요. 5분이면 45%, 15분이면 42%예요." | 맞음 | 직접 계산(데모 정의, 앞에서부터 6/30/90개씩): 67.17 / 45.30 / 41.80 → 67 / 45 / 42. 피크 세 점이 한 구간에 다 든 정렬이에요. 평소 값을 정확히 40으로 두면 67.5 / 45.5 / 41.8이에요. | — |
| "구간이 길수록 30초가 차지하는 몫이 작아지기 때문이에요. 15분 구간에서 30초는 1/30뿐이에요." | 맞음 | 직접 계산: 30 ÷ 900 = 1/30(1분 1/2, 5분 1/10). | — |
| 핵심 3: "5분씩 묶을 때 평균 대신 최댓값을 쓰면 95%가 그대로 남아요." | 맞음 | 직접 계산: 최댓값으로 묶으면 1분·5분·15분 모두 95. https://prometheus.io/docs/prometheus/latest/querying/functions/#aggregation_over_time max_over_time "the maximum value of all float samples in the specified interval". | — |
| "대신 30초짜리 피크가 5분 내내 이어진 것처럼 보여요." | 맞음 | 직접 계산: 원본은 95인 점 3개(30초), 5분 최댓값은 95인 점 1개(5분 구간)예요. 점 하나 안에서는 길이를 구별할 수 없어요. | — |
| 확인 1: "1시간 그래프와 7일 그래프의 최고값이 다르다면 버그보다 집계 구간부터 확인하세요. 앞의 예에서도 같은 피크가 원본으로는 95%, 5분 평균으로는 45%예요." | 맞음 | 직접 계산: 원본 95, 5분 평균 45.30. 점 간격(step)이 원인이라는 조언은 Prometheus에서도 맞아요(① 참고). | — |
| 확인 2: "평균으로 줄인 데이터로 알림을 판단하면 짧은 장애를 놓치기 쉬워요. … 5분 평균은 45%라, '90% 초과' 조건에 걸리지 않아요." | 맞음 | 직접 계산: 5분 평균 45.30 < 90. 10초마다 미는 5분 이동 평균도 최고 45.63이라 걸리지 않아요. | — |
| 확인 3: "툴팁에 한 점이 몇 초 구간인지 나오지 않으면 … '5분 평균'처럼 구간과 묶는 방법을 함께 보여 주세요." | 맞음 | 권고예요. https://grafana.com/docs/grafana/latest/panels-visualizations/query-transform-data/#query-options "the same query can return a more detailed series in view mode than in the dashboard grid." 같은 질의도 패널 크기에 따라 간격이 달라져요. | — |
| 확인 4: "p99를 평균으로 다시 묶었다면 틀린 값이에요. 1분 p99 5개의 평균은 5분 p99가 아니에요. 5분 동안의 원본 값이나 히스토그램으로 다시 계산해야 해요." | 맞음 | https://prometheus.io/docs/practices/histograms/ "aggregating the precomputed quantiles from a summary rarely makes sense", 평균은 "statistically nonsensical values". 히스토그램은 "Ad-hoc with PromQL expression"으로 다시 묶을 수 있어요. | — |
| 더 깊이: "Prometheus 범위 질의(range query)는 start, end, step을 받아요." | 맞음 | https://prometheus.io/docs/prometheus/latest/querying/api/#range-queries "`start=<rfc3339 \| unix_timestamp>`: Start timestamp, inclusive.", "`step=<duration \| float>`: Query resolution step width". | — |
| "start부터 end까지 step 간격으로 시각을 정하고, 시각마다 값을 하나씩 계산해요." | 맞음 | https://prometheus.io/docs/prometheus/latest/querying/basics/ "a range query at equally-spaced steps between a start and an end time", "the range query is just like an instant query run multiple times at different timestamps." | — |
| "지표 이름만 쓴 질의는 값을 묶지 않아요. 시각마다 가장 최근 샘플(sample, 수집한 값 하나) 하나만 골라요. 그사이 샘플은 쓰이지 않아요." | 맞음 | 같은 문서 "The value returned will be that of the most recent sample at or before the query's evaluation timestamp", "taking the newest sample that is less than the lookback period ago."(기본 5분). | — |
| "그래서 step이 5분이면 30초짜리 피크가 보일지는 점을 찍는 시각에 달려요. 그 시각에 걸리면 95%로, 아니면 아예 보이지 않아요." | 맞음 | 직접 계산: 피크 샘플(1,920·1,930·1,940초)이 가장 최근 샘플인 시각은 1,920~1,949초, 30초예요. step 5분이면 정렬 300가지 중 30가지(10%)만 95%, 나머지는 35~45%예요. | — |
| "구간을 묶으려면 `avg_over_time(cpu_usage[5m])`나 `max_over_time(cpu_usage[5m])`처럼 써요. 대괄호 구간을 step과 같게 잡으면 빠지는 샘플이 없어요." | 맞음 | https://prometheus.io/docs/prometheus/latest/querying/basics/ "The range is a left-open and right-closed interval" → (t−5m, t] 구간이 step 5분마다 겹치지도 비지도 않아요. 직접 계산: step 10분에 `[5m]`이면 최고 40.24(피크 빠짐), `[10m]`이면 42.73. | — |
| "Grafana는 시간 범위와 그래프 폭(픽셀 수)으로 간격을 자동으로 계산해요. 이 값이 `$__interval`이에요. 대략 시간 범위 ÷ 픽셀 수예요." | 맞음 | https://grafana.com/docs/grafana/latest/visualizations/dashboards/variables/global-variables/ "The `$__interval` is calculated using the time range and the width of the graph (the number of pixels).", "Approximate Calculation: `(to - from) / resolution`". 실제로는 딱 떨어지는 값으로 맞춰요(② 참고). | (선택, ② 반영) "Grafana는 이 값을 5분, 10분처럼 딱 떨어지는 간격으로 맞춰요." / "7일을 폭 1,000px 패널로 보면 604.8초라 10분 간격이 돼요." / "5분 간격이 되려면 Max data points가 1,345 이상이어야 해요." |
| "Max data points는 시리즈 하나에 받을 점의 최대 개수예요. 기본값은 그래프 폭의 픽셀 수예요." | 맞음 | https://grafana.com/docs/grafana/latest/panels-visualizations/query-transform-data/#query-options "this sets the maximum number of data points for each series returned.", "The default value is the width (or number of pixels) of the graph". Prometheus에선 step 계산에 쓰여요(https://github.com/grafana/grafana-prometheus-datasource/blob/cb5651b00a6b7769b10067f1a6baec07278f4c52/pkg/promlib/intervalv2/intervalv2.go#L48-L65). | — |
| "Min interval은 자동 간격의 하한이에요. 보통 수집 주기로 잡아요." | 맞음 | 같은 문서 "Sets a minimum limit for the automatically calculated interval, which is typically the minimum scrape interval." | (선택) "Min interval은 하한이라, 7일·1,000px에서 5m으로 정해도 10분 그대로예요." |
| "step이 rate 구간보다 길면, 점과 점 사이 데이터가 계산에서 빠져요. step 5분에 `rate(http_requests_total[1m])`로 그리면, 점마다 직전 1분만 보고 나머지 4분은 건너뛰어요." | 맞음 | 위 range query 원리(시각마다 독립 계산)와 범위 선택자 정의. 직접 계산: 5 − 1 = 4분. | — |
| "그래서 rate 구간은 step보다 짧게 잡지 않아요. Grafana의 `$__rate_interval`은 늘 `$__interval`보다 길게 잡혀요." | 맞음 | https://grafana.com/docs/grafana/latest/datasources/prometheus/template-variables/ "max($__interval + scrape_interval, 4 * scrape_interval)" → 늘 수집 주기 이상 길어요. https://grafana.com/blog/2020/09/28/new-in-grafana-7.2-__rate_interval-for-prometheus-rate-queries-that-just-work/ "extends the usual `$__interval` by one scrape interval so that the ranges overlap just enough to ensure complete coverage of all counter increases." 구간 = step이면 경계의 증가분 하나가 빠져요. | (선택) "rate 구간은 step에 수집 주기 하나를 더한 만큼은 잡아요." |
| "Thanos(Prometheus 데이터를 오래 보관하는 도구)는 저장할 때 다운샘플링을 해요. 이 일은 compactor가 맡아요." | 맞음 | https://thanos.io/ "Open source, highly available Prometheus setup with long term storage capabilities." / https://thanos.io/tip/components/compact.md/ "Compactor is also responsible for downsampling of data." | — |
| "compactor는 원본 외에 5분, 1시간 해상도(resolution) 데이터를 만들어요." | 맞음 | 같은 문서 "for each series we collect various aggregations with a given interval: 5m or 1h (depending on resolution)", "it adds 2 more blocks for each raw block". | — |
| "해상도는 그래프에서 점과 점 사이 시간이에요." | 맞음 | 같은 문서 "Resolution is a distance between data points on your graphs." 다만 그래프의 점 간격은 step이 정해요. 5분 데이터를 step 10분으로 보면 점은 10분 간격이에요. | (선택) "해상도는 저장한 값과 값 사이 시간이에요." |
| "40시간이 지난 원본은 5분, 10일이 지난 5분 해상도는 1시간 해상도로 줄여요." | 맞음 | 같은 문서 "All raw resolution metrics that are older than **40 hours** are downsampled at a 5m resolution", "All 5m resolution metrics older than **10 days** are downsampled at a 1h resolution". 코드는 블록 길이로 판단해요: https://github.com/thanos-io/thanos/blob/v0.42.4/cmd/thanos/downsample.go#L298 `if m.MaxTime-m.MinTime < downsample.ResLevel1DownsampleRange`. | (선택) "원본 블록이 40시간 이상으로 합쳐지면 5분 해상도를 만들어요." |
| "구간마다 count(개수), sum(합), min(최솟값), max(최댓값), counter(카운터 값)를 보관해요. 그래서 줄인 뒤에도 평균(sum ÷ count), 최댓값(max), rate(counter)를 다시 계산할 수 있어요." | 맞음 | 같은 문서 `AggrChunk`: "Chunk count = 4; Chunk sum = 5; Chunk min = 6; Chunk max = 7; Chunk counter = 8;". https://github.com/thanos-io/thanos/blob/v0.42.4/pkg/query/querier.go#L256-L275 rate·increase·irate·resets → `Aggr_COUNTER`. 네이티브 히스토그램은 "only store 3 aggregations - counter, count, and sum"이에요. | — |
| "줄인 데이터를 함수 없이 조회하면 구간마다 평균값이 나와요. 최댓값을 보려면 `max_over_time`처럼 max를 읽는 함수를 써요." | 맞음 | https://github.com/thanos-io/thanos/blob/v0.42.4/pkg/query/querier.go#L256-L275 `if f == "max" \|\| strings.HasPrefix(f, "max_")` → `Aggr_MAX`, 기본은 "we retrieve count and sum to compute an average". 줄인 데이터를 읽는 건 `max_source_resolution`이 허용할 때예요(https://github.com/thanos-io/thanos/blob/v0.42.4/docs/components/query.md "`0` - Only use raw data."). | (선택) "Thanos Query는 `max_source_resolution`이 허용할 때만 줄인 데이터를 읽어요." |
| "다운샘플링의 목적은 긴 기간 질의를 빠르게 하는 거예요. 원본은 그대로 두고 데이터를 더 만들어서, 저장 공간은 오히려 늘어요." | 맞음 | https://thanos.io/tip/components/compact.md/ "The goal of downsampling is to provide an opportunity to get fast results for range queries of big time intervals", "downsampling doesn't save you **any** space", "can increase the size of your storage a bit (~3x)". 원본 보존 기간 기본값은 "kept forever"(`--retention.resolution-raw` 미설정). | — |
| 머리말 sources 8개 | 맞음 | 8개 URL을 모두 열어 확인했어요. https://github.com/thanos-io/thanos/blob/v0.42.4/pkg/query/querier.go#L256-L275 는 `aggrsFromFunc` 함수 전체(L256 선언 ~ L275 끝)예요. | — |
| 데모 DownsamplingDemo: 점 360/60/12/4개, 평균 최고 95/67/45/42%, 최댓값 묶기 95% | 맞음 | 직접 계산(src/lib/demo-data.ts `cpuSeries`, src/lib/stats.ts `downsample`과 같은 정의): 점 360/60/12/4, 평균 최고 95 / 67.17 / 45.30 / 41.80, 최댓값 묶기 모두 95. | — |

## 반영

컨트롤러 판단 R13(사실 검토가 brief로 정한 문구보다 앞선다)에 따라 글의 틀을 바꿨어요. 앞세운 일반 사실은 "기간이 길면 점 사이 간격이 벌어진다"예요. 그 간격의 값을 하나로 만드는 방법은 시스템마다 달라요. 하나를 고르면(Prometheus 기본) 피크가 빠지거나 운에 따라 잡혀요. 평균으로 묶으면 묻히고, 최댓값으로 묶으면 남지만 길어 보여요.

- (오해 소지) 머리말 summary를 "기간을 넓히면 점 하나가 맡는 시간이 길어져, 짧은 피크가 묻히거나 빠져요."로 바꿨어요(제안 그대로).
- (오해 소지) 아래 그래프 label "최근 7일 · 한 점 5분"을 "최근 7일 · 5분 평균"으로 바꿨어요(제안 1). values와 value "최고 45%"는 그대로예요. 1,000px 기준 10분 간격 문제는 더 깊이에 "7일을 폭 1,000픽셀 패널로 보면 604.8초라 10분이 돼요."로 따로 밝혔어요.
- (오해 소지) 아래 그래프 ariaLabel을 "최근 7일 그래프. 5분씩 평균해 같은 피크가 45%로 낮아져 보여요"로 바꿨어요(제안 그대로).
- (오해 소지) caption을 "같은 피크가 1시간 그래프에선 95%, 5분 평균으로 묶은 7일 그래프에선 45%예요."로 바꿨어요. 제안의 둘째 문장(Prometheus 기본 질의)은 caption을 한 문장으로 두려고 핵심 1 셋째 단락으로 옮겼어요.
- (오해 소지) 핵심 1 소제목을 "기간이 길면 점 사이 간격이 벌어져요"로 바꿨어요(제안 그대로).
- (오해 소지) "여러 값을 묶어 점 하나로 그려요"를 "점 수를 줄여 그려요"로 바꿨어요(제안 그대로). 다운샘플링 정의는 "이 일을 다운샘플링(downsampling)이라고 해요."로 이었어요.
- (틀림) step을 "집계 구간"이라 부른 부분을 고쳤어요. 핵심 1 둘째 단락은 "조회 기간이 길수록 점과 점 사이 간격도 벌어져요. 이 간격을 Prometheus는 step, Grafana는 interval이라고 불러요."예요. 셋째 단락에 "한 간격 안의 값은 하나만 고르거나, 묶어서 하나로 요약해요."와 Prometheus 기본 질의 설명을 넣었어요. 집계 구간 정의("값을 묶을 때 점 하나가 맡는 시간")는 핵심 2 첫 문장으로 옮겼어요. 평균으로 묶는 도구 목록(`avg_over_time`, Thanos 줄인 데이터, Graphite·Datadog 기본값)은 본문을 늘리지 않으려고 더 깊이에 뒀어요.
- 위 틀에 맞춰 함께 고친 곳
  - 확인 1의 "집계 구간부터"를 "점 간격과 묶는 방법부터"로 바꿨어요. 이제 집계 구간은 묶을 때만 쓰는 말이라서, 고르는 질의에도 맞게 했어요.
  - 확인을 하나 더했어요. "긴 기간을 그리는 Prometheus 질의가 `cpu_usage`처럼 지표 이름뿐이라면, 짧은 피크는 점에 걸릴 때만 보여요. 피크를 놓치면 안 되는 패널은 `max_over_time(cpu_usage[$__interval])`로 그려요." ①의 "최댓값으로 보려면 표시 설정이 아니라 `max_over_time(...)`가 필요하다"를 반영한 거예요.
  - 핵심 3 데모 안내를 "아래 데모는 값을 평균이나 최댓값으로 묶을 때를 보여 줘요."로 바꿨어요. 데모가 Prometheus 기본 질의를 흉내 내는 게 아님을 밝혔어요.
  - 더 깊이 피크 문장에 숫자를 넣었어요. "step이 5분이면 점 시각이 놓일 수 있는 300초 중 30초에서만 앞의 피크가 걸려요. 걸리면 95%, 아니면 평소 값인 35~45%가 보여요."
  - 더 깊이에 "평균으로 묶는 도구도 많아요. Graphite는 … 기본으로 평균을 내요. Datadog도 … 기본으로 구간 평균을 써요."를 더했어요. 직접 확인: Graphite consolidateBy "Graphite consolidates the values … from the default of 'average'", Datadog rollup "defaulting to the `avg` method".
- (선택 제안 반영) `$__interval` 반올림: "계산한 값은 5분, 10분처럼 딱 떨어지는 간격으로 맞춰요. 7일을 폭 1,000픽셀 패널로 보면 604.8초라 10분이 돼요." 직접 확인: `intervalv2.Calculate`(시간 범위 ÷ Max data points, Min interval보다 작으면 Min interval, 아니면 `RoundInterval`), `RoundInterval`의 450000ms → 5m, 750000ms → 10m 경계.
- (선택 제안 반영) rate 구간: "구간을 step과 똑같이 잡아도, 구간 경계를 넘는 증가분이 빠져요. 그래서 rate 구간은 step에 수집 주기 하나를 더한 만큼은 잡아요. Grafana의 `$__rate_interval`은 늘 그 이상이에요."로 바꿨어요. 이전 문장 "step보다 짧게 잡지 않아요"는 구간 = step이면 충분하다고 읽힐 수 있었어요.
- (선택 제안 반영) 해상도 정의를 "해상도는 저장한 값과 값 사이 시간이에요."로 바꿨어요.
- (선택 제안 반영) "Thanos로 질의할 때는 기본으로 원본만 읽어요. `max_source_resolution` 파라미터나 `--query.auto-downsampling` 옵션을 써야 줄인 데이터를 읽어요."를 더했어요. 직접 확인: query.md "`step / 5` or `0` if `query.auto-downsampling` is false (default: False)".
- (선택 제안 반영 안 함) 1시간 그래프 values를 95 세 개로 바꾸는 제안은 받지 않았어요. 점 12개짜리 도식에서 95가 세 개면 피크가 1시간의 1/4(15분)처럼 보여요. 95 한 개가 30초 피크에 더 가까워요.
- (선택 제안 반영 안 함) Min interval 하한 예시와 40시간 블록 길이 설명은 더 깊이가 길어지지 않게 넣지 않았어요.
- 머리말 sources에 6개를 더했어요(8개 → 14개). Grafana `intervalv2.Calculate`·`gtime.RoundInterval` 소스, Grafana Blog `$__rate_interval`, Graphite Functions, Datadog Rollup, Thanos Querier 문서예요.
