# 사실 검토: 카운터와 rate

- 글: src/content/docs/foundations/counters-and-rate.mdx
- 검토일: 2026-10-13
- 결과: 수정 필요 0건 / 확인 48건

계산은 Prometheus v3.15.0 `extrapolatedRate`(float, 기능 플래그 없음)를 node로 옮겨 다시 했어요. 아래 "직접 계산"은 모두 이 결과예요.

| 주장(인용) | 판정 | 근거(URL과 짧은 인용) | 수정 제안 |
| --- | --- | --- | --- |
| 머리말 summary: "카운터는 쌓이기만 하는 값이고, rate는 초당 증가량이에요." | 맞음 | https://prometheus.io/docs/concepts/metric_types/ "whose value can only increase or be reset to zero on restart." / https://prometheus.io/docs/prometheus/latest/querying/functions/ "calculates the per-second average rate of increase" | — |
| 대시보드 카운터 values `[1000, 1030, 1060, 1090, 1120, 20, 50, 80, 110, 140]`와 ariaLabel "계속 오르다가 재시작 때 0 근처로 떨어진 뒤 다시 오르는 그래프" | 맞음 | 직접 확인: 1,000→1,120은 30씩 오르고, 20으로 떨어진 뒤 다시 30씩 올라요. | — |
| 대시보드 rate values `[3, 3, 3, 3, 2, 3, 3, 3, 3]`, value "초당 3건", ariaLabel "초당 3건으로 고르게 이어지고, 재시작 구간에서만 2건으로 조금 내려가는 그래프" | 맞음 | 직접 계산: 이웃한 두 샘플 차이 ÷ 10초 = 3,3,3,3,(20÷10=)2,3,3,3,3. irate와 같은 값이에요. 참고: Prometheus `rate(...[20s])`로 그리면 재시작 다음 점(20→50)은 0 아래 외삽 제한 때문에 2.5예요. `rate(...[1m])`이면 재시작이 든 구간은 모두 2.8이에요. | (선택) caption에 "아래 선은 이웃한 두 샘플의 차이를 10초로 나눈 값이에요."를 더해요. |
| caption "재시작한 순간에도 rate는 이어져요." | 맞음 | https://prometheus.io/docs/prometheus/latest/querying/functions/ rate: "Breaks in monotonicity (such as counter resets due to target restarts) are automatically adjusted for." | — |
| "`http_requests_total` 같은 카운터(counter)는 프로세스가 시작된 뒤 처리한 요청 수를 계속 더한 값이에요." | 맞음 | https://prometheus.io/docs/concepts/metric_types/ "A counter is a cumulative metric that represents a single monotonically increasing counter" | — |
| "그래서 1,000,000이라는 값만으로는 지금 바쁜지 알 수 없어요." | 맞음 | 누적값은 시작 뒤 총량이라 현재 속도를 담지 않아요(위 정의에서 따라 나와요). | — |
| "값이 줄어드는 건 재시작해서 0부터 다시 셀 때뿐이에요." | 맞음 | https://prometheus.io/docs/concepts/metric_types/ "can only increase or be reset to zero on restart." | — |
| "rate(초당 증가량)는 구간 동안 늘어난 양을 구간 길이(초)로 나눈 값이에요." | 맞음 | https://prometheus.io/docs/prometheus/latest/querying/functions/ "per-second average rate of increase". 실제로는 외삽한 증가량을 구간 초로 나눠요(소스 L623-L625 `factor /= ms.Range.Seconds()`). Deeper에서 설명해요. | — |
| "5분(300초) 동안 1,000,000에서 1,030,000이 됐다면 30,000 ÷ 300 = 초당 100건이에요." | 맞음 | 직접 계산: (1,030,000 − 1,000,000) ÷ 300 = 100 | — |
| "대시보드에는 카운터가 아니라 이 값을 그려요." | 맞음 | https://prometheus.io/docs/prometheus/latest/querying/functions/ rate: "It is best suited for alerting, and for graphing of slow-moving counters." | — |
| "Prometheus의 `rate`와 `increase`(구간 증가량)는 재시작을 알아서 처리해요." | 맞음 | https://prometheus.io/docs/prometheus/latest/querying/functions/ rate·increase 모두 "Breaks in monotonicity ... are automatically adjusted for." | — |
| "재시작 앞뒤 값을 그냥 빼면 20 − 1,050 = −1,030이에요." | 맞음 | 직접 계산: 20 − 1,050 = −1,030 | — |
| "두 함수는 값이 줄어든 순간을 재시작으로 보고, 재시작 전에 늘어난 50과 뒤의 20을 더해 70으로 세요." | 맞음 | https://github.com/prometheus/prometheus/blob/v3.15.0/promql/functions.go#L512-L533 `resultFloat = last − first`, `if currPoint.F < prevPoint.F { resultFloat += prevPoint.F }` → (20 − 1,000) + 1,050 = 70. 직접 계산도 70. 참고: 70은 외삽 전 값이라 `increase()`가 돌려주는 값은 구간에 따라 70과 달라요(Deeper에서 설명). | — |
| Check: "카운터 값을 그대로 그린 그래프는 지금 상태를 말해 주지 않아요. … rate로 바꿨는지 확인하세요." | 맞음 | 위 카운터 정의와 rate 문서 "best suited for alerting, and for graphing" | — |
| Check: "코드에서 직접 계산한 rate가 음수로 나온다면 재시작 처리가 빠진 거예요. 값이 줄었다면 그 구간 증가량은 줄어든 뒤의 값으로 봐요. 앞의 예에서는 20이에요." | 맞음 | https://www.robustperception.io/how-does-a-prometheus-counter-work/ "Any time a counter appears to decrease it'll be treated as though there was a reset to 0 right after the first data point." → 그 구간 증가량은 20 − 0 = 20 | — |
| Check: "여러 서버의 카운터를 먼저 더한 뒤 rate를 구했다면 틀려요. 한 서버만 재시작해도 합계가 줄어, 합계 전체를 재시작으로 보고 rate가 크게 튀어요. `sum(rate(...))`처럼 …" | 맞음 | https://prometheus.io/docs/prometheus/latest/querying/functions/ "always take a `rate()` first, then aggregate. Otherwise `rate()` cannot detect counter resets when your target restarts." 직접 계산: A 1000→1090, B 5000,5030,(재시작)20,50 → 합계 먼저: 6,108,6건/초, 서버별 먼저: 6,5,6건/초 | — |
| Check: "게이지(gauge, 오르내리는 현재 값)에 rate를 썼다면 의미 없는 값이에요. rate는 값이 줄 때마다 재시작으로 보고 엉뚱하게 더해요. 게이지의 변화는 `delta()`나 `deriv()`로 봐요." | 맞음 | https://prometheus.io/docs/concepts/metric_types/ gauge "can arbitrarily go up and down." / functions: "`rate` should only be used with counters", "`delta` should only be used with gauges", "`deriv` should only be used with gauges" | — |
| "`rate`는 구간 전체의 평균 초당 증가율이에요. `rate(http_requests_total[5m])`는 최근 5분 동안의 평균이에요." | 맞음 | https://prometheus.io/docs/prometheus/latest/querying/functions/ "calculates the per-second average rate of increase of the time series in the range vector." | — |
| "`increase`는 구간 전체의 증가량이에요. rate × 구간 초와 같아서, 앞의 예라면 100 × 300 = 30,000이에요." | 맞음 | 같은 문서: "It is syntactic sugar for `rate(v)` multiplied by the number of seconds under the specified time range window". 직접 계산: 100 × 300 = 30,000 | — |
| "\"5분 동안 30,000건\"처럼 사람이 읽을 숫자가 필요할 때 써요." | 맞음 | 같은 문서: "should be used primarily for human readability." | — |
| "`irate`는 구간의 마지막 두 샘플만 써요. `irate(http_requests_total[5m])`도 5분 중 마지막 두 샘플 사이만 봐요." | 맞음 | 같은 문서: "This is based on the last two data points." / 소스 L851-L852 "Add the last 2 float samples" | — |
| "그래서 짧은 변화에 민감하고 선이 많이 흔들려요." | 맞음 | 같은 문서: "brief changes in the rate can reset the `FOR` clause and graphs consisting entirely of rare spikes are hard to read." | — |
| "Prometheus 문서는 빠르게 변하는 카운터를 그래프로 볼 때만 irate를 쓰라고 해요. 알림과 천천히 변하는 카운터에는 rate를 써요." | 맞음 | 같은 문서: "`irate` should only be used when graphing volatile, fast-moving counters. Use `rate` for alerts and slow-moving counters" | — |
| "그림에서 재시작한 구간의 rate는 초당 2건이에요. 1,120 다음 값이 20이라서, 그 10초 동안 20만 늘었다고 세기 때문이에요." | 맞음 | 직접 계산: (20 − 1,120) + 1,120 = 20, 20 ÷ 10 = 2. 소스 L531-L533의 재시작 보정과 같아요. | — |
| ② "마지막 수집 뒤 재시작 전까지 센 요청은 수집되지 못하고 사라져요." | 맞음 | https://promlabs.com/blog/2021/01/29/how-exactly-does-promql-calculate-rates/ (Julius Volz) "it was incremented _after_ Prometheus's last scrape, but _before_ the reset. Those increments are lost to Prometheus forever" / https://github.com/prometheus/prometheus/pull/1161 (Brian Brazil) "if there's a counter reset or instance failure between one scrape and the next we'll lose information about the period up to the reset/failure." Prometheus처럼 끌어가는(scrape) 수집 기준이에요. | — |
| "샘플이 구간 경계에 딱 맞춰 찍히는 일은 드물어요. 그래서 Prometheus는 구간 끝까지 값을 추정(외삽)해요." | 맞음 | https://prometheus.io/docs/prometheus/latest/querying/functions/ "the calculation extrapolates to the ends of the time range, allowing for missed scrapes or imperfect alignment of scrape cycles" | — |
| "정수 카운터라도 increase가 소수로 나올 수 있는 이유예요." | 맞음 | 같은 문서: "so that it is possible to get a non-integer result even if a counter increases only by integer increments." | — |
| "10초마다 수집하면 1분 구간에는 샘플이 6개 들어와요. 첫 샘플과 끝 샘플은 50초 떨어져 있어요." | 맞음 | https://prometheus.io/docs/prometheus/latest/migration/ "range selectors are now left-open and right-closed" / "In Prometheus v3 queries like this will always return 5 samples given even spacing."(1분 간격, 5m) → 같은 원리로 60 ÷ 10 = 6개, 5 × 10초 = 50초. v2에서는 경계가 샘플과 겹치면 7개였어요. | — |
| "그사이 7이 늘었다면, increase는 60초로 늘려 7 × 60 ÷ 50 = 8.4예요." | 맞음 | 직접 계산: 7 × 60 ÷ 50 = 8.4. 소스 이식으로도 경계 거리 (10,0), (5,5), (1,9)초 모두 8.4. 첫 값이 0에 가까우면 아래 0 제한이 걸릴 수 있어요(첫 값 1일 때는 8.4 그대로). | — |
| "경계까지 거리가 샘플 간격 평균의 1.1배 이상이면, 그 평균의 절반만큼만 늘려요." | 맞음 | https://github.com/prometheus/prometheus/blob/v3.15.0/promql/functions.go#L549 `extrapolationThreshold := averageDurationBetweenSamples * 1.1`, L588-L590 `if durationToStart >= extrapolationThreshold { durationToStart = averageDurationBetweenSamples / 2 }`(끝 쪽은 L615-L617). PromLabs: "the extrapolation only extends half an average sample interval toward the window boundary" | — |
| "카운터가 0 아래로 내려가게 늘리지도 않아요." | 맞음 | 소스 L591-L611 "Counters cannot be negative. ... thereby avoiding extrapolation to negative counter values." 시작 쪽 외삽에만 걸려요. | — |
| ① "구간 안에 샘플이 2개 이상 있어야 rate가 계산돼요." | 맞음 | 소스 L488-L489 "To calculate a rate, we normally need at least two float or two histogram samples.", L572-L574 샘플 1개면 "Return nothing." / https://prometheus.io/docs/prometheus/latest/migration/ "will only return one point, which is insufficient for a rate or increase calculation, resulting in No Data returned." / PromLabs "need at least two samples under the provided range window to work." 예외는 기능 플래그뿐이에요: `use-start-timestamps`(구간 안에 시작 시각이 있으면 샘플 1개로도 계산, 소스 L489), 실험 기능 `anchored`/`smoothed`(https://prometheus.io/docs/prometheus/latest/feature_flags/). | — |
| "15초마다 수집하는데 `[15s]`로 잡으면 샘플이 대개 하나뿐이라 값이 비어요." | 맞음 | https://grafana.com/blog/2020/09/28/new-in-grafana-7.2-__rate_interval-for-prometheus-rate-queries-that-just-work/ "we are using only 15s in this case, so the range selector will just cover one sample in most cases, which is not enough to calculate the rate." 결과는 "No data". | — |
| "그래서 구간은 수집 주기보다 충분히 길게 잡아요." | 맞음 | 위 Grafana 블로그와 migration 문서 "extend the window to properly cover more than one point." | — |
| "Grafana는 구간을 수집 주기의 4배 이상으로 잡으라고 해요." | 맞음 | Grafana 블로그: "The range in a rate query should be at least four times the scrape interval." | — |
| "`$__rate_interval`은 … 값은 `$__interval + 수집 주기`와 `4 × 수집 주기` 중 큰 쪽이에요." | 맞음 | https://grafana.com/docs/grafana/latest/datasources/prometheus/template-variables/ "max($__interval + scrape_interval, 4 * scrape_interval)", "large enough to capture at least four scrape samples" | — |
| "`$__interval`은 그래프의 시간 범위와 패널 폭으로 정해지는 간격이에요." | 맞음 | 같은 문서: "Calculated interval based on time range and panel width." | — |
| "그림처럼 10초마다 수집하면 `$__rate_interval`은 40초보다 짧아지지 않아요." | 맞음 | 직접 계산: 설정 10초 → max(i+10, 40) ≥ 40, 기본값 15초 → ≥ 60. 설정을 실제보다 짧게(예: 5초) 잡을 때만 20초까지 내려가요. 다음 단락이 설정값을 쓴다고 밝혀요. | (선택) "데이터 소스 Scrape interval이 10초라면 `$__rate_interval`은 40초보다 짧아지지 않아요." |
| "이때 Grafana는 데이터 소스의 Scrape interval 설정값을 수집 주기로 써요. 쿼리에 Min step을 정했다면 그 값을 써요." | 맞음 | template-variables 문서: "The per-query Min step setting, if set." / "Otherwise, the data source's Scrape interval setting" | — |
| "기본값 15초로 둔 채 실제로는 60초마다 수집하면 구간이 너무 짧게 잡혀요." | 맞음 | https://grafana.com/docs/grafana/latest/datasources/prometheus/configure/ "The default is `15s`." 직접 계산: max($__interval+15, 60) → 짧은 시간 범위에서 60초 구간, 60초 수집이면 샘플 1개(값 없음). | — |
| "Prometheus 클래식 히스토그램의 버킷(`_bucket`)은 카운터예요." | 맞음 | https://prometheus.io/docs/concepts/metric_types/ "cumulative counters for the observation buckets, exposed as `<basename>_bucket{le=\"<upper inclusive bound>\"}`" | — |
| "그래서 여러 서버를 묶은 p99를 구할 때도, 버킷마다 rate를 먼저 구하고 더해요." | 맞음 | https://prometheus.io/docs/prometheus/latest/querying/functions/ "always take a `rate()` first, then aggregate." | — |
| "OpenTelemetry에서 카운터는 단조 증가(monotonic) Sum이에요. Sum에는 시간 기준(temporality)이 붙어요." | 맞음 | https://opentelemetry.io/docs/specs/otel/metrics/sdk/ 기본 집계 표 Counter → "Sum Aggregation", Counter → "Monotonic" / https://opentelemetry.io/docs/specs/otel/metrics/data-model/ Sums: "An *Aggregation Temporality* of delta or cumulative." | — |
| "cumulative는 시작부터 누적한 값을 보내요. delta는 지난 보고 뒤 늘어난 양만 보내요." | 맞음 | data-model: "cumulative data points cover time ranges (T0, T1], (T0, T2], (T0, T3]" / "delta data points cover time ranges (T0, T1], (T1, T2], (T2, T3]" | — |
| "Prometheus 카운터는 cumulative예요." | 맞음 | data-model: "The use of cumulative temporality for monotonic sums is common, exemplified by Prometheus." / "Counter (Monotonic, Cumulative)" | — |
| "delta는 값마다 증가량이라 재시작해도 값이 줄지 않아요. 대신 보고 누락을 조심해야 해요." | 맞음 | data-model: 단조 delta Sum은 음수가 아닌 값을 기대해요("non-negative values"). "When collection fails intermittently, gaps in the data are naturally averaged from cumulative measurements." delta는 각 점이 겹치지 않는 구간 (T1, T2]만 담아요. | — |
| "cumulative로 100, (누락), 160을 받으면 그사이 모두 60이 늘었다는 건 알 수 있어요. delta로 30, (누락), 30을 받으면 빠진 보고에 담긴 증가량은 되찾을 수 없어요." | 맞음 | 직접 계산: 160 − 100 = 60. delta의 빠진 점은 (T1, T2] 구간만 담아 다른 점으로 복원할 수 없어요. 누락 사이에 재시작이 없을 때 성립해요(재시작은 start time으로 알아요). | — |
| percentiles.mdx Deeper: "서버별 버킷 카운터마다 <Term>rate</Term>(초당 증가량)를 먼저 구하고, 같은 `le`끼리 더한 뒤 p99를 계산해요." | 맞음 | https://prometheus.io/docs/prometheus/latest/querying/functions/ "always take a `rate()` first, then aggregate." 링크한 글의 정의("rate는 초당 증가량")와도 맞아요. | — |

## 반영

- 꼭 고쳐야 할 것은 0건이에요. 선택 제안 2건을 받아들였어요(컨트롤러 판단 R12).
- (선택 제안 반영) caption을 "위는 카운터를 그대로 그린 선이에요. 아래는 이웃한 두 값 사이 증가량을 10초로 나눈 rate예요. 재시작한 순간에도 rate는 이어져요."로 바꿨어요. 이제 아래 선이 PromQL `rate()`의 결과가 아니라 이웃한 샘플로 계산한 값(irate와 같음)이라는 게 드러나요. 제안 문장의 "차이"는 "증가량"으로 바꿨어요. 재시작 구간의 값이 원래 차이(−1,100)가 아니라 재시작을 반영한 증가량(20)이기 때문이에요. 데이터와 ariaLabel은 그대로 뒀어요.
- (선택 제안 반영) `$__rate_interval` 예시에 전제를 밝혔어요. 새 문장은 "Scrape interval을 그림처럼 10초로 정했다면, `$__rate_interval`은 40초보다 짧아지지 않아요."예요. 전제가 먼저 나오도록 "Grafana는 데이터 소스의 Scrape interval 설정값을 수집 주기로 써요" 단락을 이 문장 앞으로 옮겼어요. 기본값 15초 함정 문장은 예시 문장 바로 뒤에 붙였어요.
