# 사실 검토: 평균과 백분위수

- 글: src/content/docs/foundations/percentiles.mdx
- 검토일: 2026-10-13
- 결과: 수정 필요 8건 / 확인 27건

| 주장(인용) | 판정 | 근거(URL과 짧은 인용) | 수정 제안 |
| --- | --- | --- | --- |
| 머리말 summary: "평균은 느린 요청을 숨기고, 백분위수는 드러내요." | 맞음 | https://sre.google/sre-book/service-level-objectives/ "A simple average can obscure these tail latencies, as well as changes in them." | — |
| 대시보드 ariaLabel: "평균 응답시간은 130ms 근처에서 잔잔하고, p99는 두 번 3,000ms까지 튀는 그래프" | 오해 소지 | 차트 데이터 직접 확인: 평균 values도 p99가 튄 두 시점에 130→187, 130→188로 약 44% 올라요. 낭독기 사용자에게는 이 변화가 전달되지 않아요. | "평균은 130ms 근처에서 두 번 187ms까지 오르고, p99는 같은 때 3,000ms까지 튀는 그래프" |
| 대시보드 caption: "같은 시간대인데 평균은 잔잔하고 p99만 두 번 튀어 있어요." | 오해 소지 | 같은 데이터: 평균도 같은 두 시점에 +57~58ms(약 44%) 올라요. 평균이 움직이지 않는 게 아니라 p99보다 훨씬 작게 움직여요. | "평균은 187ms까지만 오르는데, p99는 같은 때 3,000ms로 튀어요." |
| 대시보드 StatTile "평균(가장 높을 때) 187ms"와 series value '187ms' | 틀림 | 차트 평균 values의 최댓값은 188(11번째 점)이에요. 데모 정의로 느린 요청 2개일 때 평균은 187.19ms → 187ms라서, 188은 데모와도 맞지 않아요. | "values의 188을 187로 바꿔요. 그러면 두 번 튄 값이 모두 데모와 같은 187ms가 돼요." |
| 대시보드 기준선(평균 130ms, p99 160ms)과 StatTile "p99(가장 높을 때) 3,000ms" | 맞음 | 직접 계산(node, 데모 정의): 느린 요청 0개 → 평균 129.56ms·p99 160ms, 2개 → 평균 187.19ms·p99 3,000ms. p99 values 최댓값도 3000. | — |
| "요청 100개 중 98개가 0.1초, 2개가 3초 걸렸다면 평균은 0.158초예요." | 맞음 | 직접 계산: (98×0.1 + 2×3) / 100 = 15.8 / 100 = 0.158 | — |
| "그런데 0.158초 걸린 요청은 하나도 없어요." | 맞음 | 표본 값은 0.1초와 3초뿐이에요. | — |
| "평균만 보면 3초를 기다린 사용자가 보이지 않아요." | 맞음 | https://sre.google/sre-book/service-level-objectives/ "it's entirely possible for most of the requests to be fast, but for a long tail of requests to be much, much slower." | — |
| "p99는 요청을 빠른 순서로 줄 세웠을 때 99% 위치의 값이에요. 요청이 100개라면 99번째 값이에요." | 맞음 | https://en.wikipedia.org/wiki/Percentile nearest-rank "n = ⌈P/100 × N⌉" → ⌈99⌉ = 99. nearest-rank 기준이에요(보간 도구는 99번째와 100번째 사이 값). | — |
| "\"p99가 1.2초\"라면 요청의 99%가 1.2초 안에 끝났다는 뜻이에요." | 맞음 | https://en.wikipedia.org/wiki/Percentile "the smallest value in the list such that at least P percent of the data is less than or equal to that value" | — |
| "p50은 가운데 값(중앙값)이고, p95는 95% 위치의 값이에요." | 맞음 | https://sre.google/sre-book/service-level-objectives/ "the 50th percentile (also known as the median)". 참고: nearest-rank p50은 n이 짝수면 통상 중앙값과 조금 달라요(Wikipedia "if N is odd, but not if N is even"; 데모 기본값 129ms vs 129.5ms). | — |
| "요청 100개 중 3초짜리 느린 요청이 1개(1%)면 p99는 그대로예요." | 맞음 | 직접 계산(데모 정의): 0개·1개 모두 p99 160ms(기본값에 160이 두 개 있음). nearest-rank 기준이에요. NumPy 기본(linear)으로 계산하면 160→188.4ms로 올라요. | — |
| "2개(2%)가 되는 순간 p99는 느린 요청의 시간인 3초가 돼요." / "아래 데모에서 느린 요청을 하나씩 늘리며 p99가 언제 튀는지 보세요." | 맞음 | 직접 계산(데모 정의): 느린 요청 2개에서 p99 3,000ms(정렬 뒤 99·100번째가 3000). 데모도 2개에서 처음 튀어요. | — |
| "그래서 p99가 튀었다면 느린 요청이 1%를 넘었다는 신호예요." | 맞음 | 직접 계산: nearest-rank에서 "p99 ≥ X"와 "X 이상인 요청이 1% 초과"는 n=1~10,000 전부에서 동치였어요. | — |
| "서버별 p99를 구한 뒤 평균을 냈다면 틀린 값이에요. 서버별 원본 값이나 히스토그램을 먼저 합치고, p99를 다시 계산해야 해요." | 맞음 | https://prometheus.io/docs/practices/histograms/ "averaging the quantiles yields statistically nonsensical values." 직접 계산: 데모 0개 서버(p99 160)와 2개 서버(p99 3,000)의 평균은 1,580ms, 합친 200개의 p99는 160ms. | — |
| "1분짜리 p99 60개를 평균 내서 1시간 p99라고 부르면 틀려요. 1시간 p99는 1시간 동안의 요청을 모두 모아 다시 계산해야 해요." | 맞음 | 같은 원리예요. https://prometheus.io/docs/practices/histograms/ "aggregating the precomputed quantiles from a summary rarely makes sense." 위 계산(1,580ms vs 160ms)은 두 구간을 합칠 때도 똑같이 성립해요. | — |
| "응답시간 알림이 평균만 본다면 느린 요청을 놓쳐요. 앞의 예처럼 요청 2%가 3초를 기다려도 평균은 0.158초예요." | 오해 소지 | SRE는 평균 기반 알림이 꼬리 변화를 못 본다고 해요: https://sre.google/sre-book/service-level-objectives/ "Monitoring and alerting based only on the average latency would show no change in behavior". 다만 이 예의 평균은 0.1→0.158초로 58% 올라, 임계값이 0.15초면 알림이 울려요. 평균이 못 보여 주는 건 누가 얼마나 느린지예요. | "평균만 보는 알림은 느린 요청을 작게 보여 줘요. 앞의 예처럼 요청 2%가 3초를 기다려도 평균은 0.158초예요." |
| "요청이 50개뿐인 구간의 p99는 사실상 최댓값이에요. 순위를 구하면 ⌈0.99 × 50⌉ = 50번째, 곧 맨 끝 값이에요." | 맞음 | 직접 계산: ⌈49.5⌉ = 50. nearest-rank에서는 n ≤ 99이면 p99가 항상 최댓값이에요. | — |
| "가장 단순한 계산법은 nearest-rank(가장 가까운 순위) 방식이에요. 값을 오름차순으로 정렬하고, 아래 순위에 있는 값을 골라요." | 맞음 | https://en.wikipedia.org/wiki/Percentile "The simplest are nearest-rank methods that return a score from the distribution." / https://stat.ethz.ch/R-manual/R-devel/library/stats/html/quantile.html Type 1 "Inverse of empirical distribution function" | — |
| "순위 = ⌈p/100 × n⌉" | 맞음 | https://en.wikipedia.org/wiki/Percentile "n = ⌈P/100 × N⌉". 참고: JS에서 이 순서 그대로 계산하면 99.9/100*1000 = 999.0000000000001이라 1000번째를 골라요(p=7, n=100도 8번째). 데모 코드(src/lib/stats.ts)는 p×n/100 순서예요. | (선택) 데모 코드와 같은 순서로 "순위 = ⌈p × n / 100⌉"이라고 적어요. |
| "요청 100개의 p99는 ⌈0.99 × 100⌉ = 99번째 값이에요. 요청 50개의 p99는 ⌈0.99 × 50⌉ = 50번째, 곧 최댓값이에요." | 맞음 | 직접 계산: ⌈99⌉ = 99, ⌈49.5⌉ = 50 = n | — |
| "앞뒤 순위의 값 사이를 보간하는 도구도 있어요. 그래서 같은 데이터라도 도구마다 p99가 조금 다를 수 있어요." | 오해 소지 | 보간이 오히려 흔한 기본값이에요: https://numpy.org/doc/stable/reference/generated/numpy.percentile.html "7. 'linear' (default)", https://stat.ethz.ch/R-manual/R-devel/library/stats/html/quantile.html "The default method is type 7". 차이도 작지 않아요. 직접 계산: 요청 50개 중 1개만 3초(나머지 ≤160ms)면 nearest-rank 3,000ms, NumPy 기본 1,608ms. | "NumPy와 R은 기본으로 앞뒤 순위 값 사이를 보간해요. 요청이 적고 꼬리가 길면 도구마다 p99가 크게 달라져요." |
| "Prometheus 히스토그램(histogram)은 미리 정한 구간(bucket)마다 요청 수를 세요." | 오해 소지 | https://prometheus.io/docs/practices/histograms/ "histograms exist in two variants: classic histograms and native histograms." 네이티브는 "Buckets are created dynamically following an exponential bucketing schema". 이 절의 `le`, 선형 보간, 경계 일치 설명은 모두 클래식 히스토그램 기준이에요. | "Prometheus 클래식 히스토그램은 미리 정한 구간(bucket)마다 요청 수를 세요." |
| "버킷은 누적이라서, `le=\"0.5\"` 버킷에는 0.5초 이하인 요청이 모두 들어가요." | 맞음 | https://prometheus.io/docs/practices/histograms/ "This label's value is the upper inclusive boundary of a cumulative bucket" | — |
| "`histogram_quantile()`은 버킷 안에 값이 고르게 퍼져 있다고 보고 선형 보간해요." | 맞음 | https://prometheus.io/docs/prometheus/latest/querying/functions/ "it assumes a uniform distribution of observations within the bucket (also called linear interpolation)". 클래식 기준이에요. 표준 지수 스키마의 네이티브 히스토그램은 exponential interpolation을 써요. | — |
| "그래서 결과는 근사값이고, 버킷 경계가 정확도를 좌우해요." | 맞음 | https://prometheus.io/docs/practices/histograms/ "Error is limited by the width of the bucket the quantile is located in." | — |
| "예를 들어 p99가 0.5~1초 버킷에 들면, 실제 p99는 그 사이 어디든 될 수 있어요." | 맞음 | https://prometheus.io/docs/practices/histograms/ "The interpolation would estimate 295ms in this case, with the guarantee that the true value is between 200ms and 300ms." | — |
| "히스토그램은 여러 서버를 합칠 수 있어요." | 맞음 | https://prometheus.io/docs/practices/histograms/ "Using histograms, the aggregation is perfectly possible with the histogram_quantile() function." | — |
| "서버별 버킷 개수를 더한 뒤 p99를 계산하면 돼요." | 오해 소지 | "버킷 개수"는 버킷의 수로 읽혀요. 더하는 값은 버킷별 카운터의 rate예요. https://prometheus.io/docs/prometheus/latest/querying/functions/ "always take a rate() first, then aggregate. Otherwise rate() cannot detect counter resets when your target restarts." | "서버마다 버킷 카운터의 rate()를 먼저 구하고, 같은 le끼리 더한 뒤 p99를 계산해요." |
| "이때 서버마다 버킷 경계가 같아야 해요." | 맞음 | https://prometheus.io/docs/practices/histograms/ 클래식: "provided there are no changes in bucket boundaries." 클래식 기준이에요(네이티브는 "buckets are always compatible"). | — |
| "summary는 각 서버가 직접 계산한 p99 같은 값을 내보내요." | 맞음 | https://prometheus.io/docs/practices/histograms/ "summaries calculate streaming φ-quantiles within the instrumented program and expose them directly" | — |
| "이 값끼리는 합칠 수 없어서, 여러 서버를 묶은 p99를 구할 수 없어요." | 맞음 | https://prometheus.io/docs/practices/histograms/ "you cannot use a summary if you need to aggregate the observations from a number of instances." / 표: "Not aggregatable." | — |
| "`avg(http_request_duration_seconds{quantile=\"0.99\"})`처럼 평균 내는 식도 틀려요." | 맞음 | https://prometheus.io/docs/practices/histograms/ "avg(http_request_duration_seconds{quantile=\"0.95\"}) // BAD!" | — |
| `histogram_quantile(0.99, sum by (le) (rate(http_server_request_duration_seconds_bucket[5m])))` | 맞음 | https://prometheus.io/docs/prometheus/latest/querying/functions/ "To aggregate all classic histograms, specify only the le label: histogram_quantile(0.9, sum by (le) (rate(http_request_duration_seconds_bucket[10m])))". 식 형태가 같아요. 지표 이름은 예시라 판정 대상이 아니에요(summary 예와 이름이 다른 점만 참고). | — |
| "이 식은 서버별 버킷의 rate(초당 증가량)를 버킷 경계(`le`)별로 더한 뒤 p99를 구해요." | 오해 소지 | rate 정의는 맞아요: https://prometheus.io/docs/prometheus/latest/querying/functions/ "calculates the per-second average rate of increase". 하지만 `sum by (le)`는 서버뿐 아니라 le를 뺀 모든 라벨을 합쳐요: "To aggregate all classic histograms, specify only the le label". 경로별로 보려면 `sum by (job, le)`처럼 라벨을 남겨야 해요. | "이 식은 le만 남기고 서버·경로 같은 다른 라벨을 모두 합친 rate(초당 증가량)로 p99를 구해요." |

## 반영

- (틀림) 평균 series의 둘째 봉우리 `188`을 `187`로 고쳤어요. 이제 두 봉우리, 범례 value, StatTile이 모두 데모 정의 값(187.19ms → 187ms)과 같아요.
- (오해 소지) caption을 "같은 순간 평균은 187ms까지만 오르는데, p99는 3,000ms로 튀어요."로 바꿨어요.
- (오해 소지) ariaLabel을 "평균 응답시간은 130ms 근처에서 두 번 187ms까지 조금 오르고, p99는 같은 때 3,000ms까지 튀는 그래프"로 바꿨어요.
- (오해 소지) 알림 Check의 첫 문장을 "응답시간 알림이 평균만 본다면 느린 요청이 작게 보여요."로 바꿨어요. 0.158초 예시 문장은 그대로 뒀어요.
- (오해 소지) "도구마다 p99가 조금 다를 수 있어요"를 지웠어요. 대신 "NumPy와 R은 기본으로 앞뒤 순위의 값 사이를 보간해요. 요청이 적고 꼬리가 길면 도구마다 p99가 크게 달라져요."를 넣고, 예시 단락을 하나 더했어요. 예시는 요청 50개 중 49개가 160ms, 1개가 3초일 때 nearest-rank 3,000ms, NumPy 기본값 1,608ms예요. NumPy로 직접 다시 계산했어요: `np.percentile` 기본값 1608.4, `method='inverted_cdf'` 3000. 머리말 sources에 NumPy `numpy.percentile` 문서와 R `quantile` 문서를 더했어요.
- (오해 소지) 히스토그램 첫 문장을 "Prometheus 클래식 히스토그램은 미리 정한 구간(bucket)마다 요청 수를 세요."로 바꿨어요. 그 뒤의 `le`, 선형 보간, 경계 일치 설명이 클래식 기준임을 분명히 했어요.
- (오해 소지) "서버별 버킷 개수를 더한 뒤"를 "서버별 버킷 카운터마다 rate(초당 증가량)를 먼저 구하고, 같은 `le`끼리 더한 뒤 p99를 계산해요."로 바꿨어요. "rate(초당 증가량)"이 처음 나오는 곳이 이 문장으로 바뀌었어요(Task 13의 `<Term>` 자리).
- (오해 소지) 식 설명을 "`sum by (le)`는 `le`만 남기고 서버·경로 같은 다른 라벨을 모두 합쳐요. 서비스별로 보려면 `sum by (job, le)`처럼 남길 라벨을 더 적어요."로 바꿨어요.
- (선택 제안 반영) 식을 데모 코드와 같은 순서인 `순위 = ⌈p × n / 100⌉`으로 바꿨어요. 예시도 "99 × 100 / 100 = 99번째", "⌈49.5⌉ = 50번째"로 맞췄어요. 왜 이 순서로 계산하는지 한 단락을 더했어요. JavaScript에서 `99.9 / 100 × 1000`은 999.0000000000001이라, 올림하면 1000이 돼요. node로 직접 확인했어요.
- 머리말 sources에 Prometheus 쿼리 함수 문서(`#histogram_quantile`)를 더했어요. 선형 보간과 `sum by (le)` 설명의 근거예요.
