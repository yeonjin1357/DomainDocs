# 사실 검토: 데이터 없음과 0은 달라요

- 글: src/content/docs/foundations/no-data-vs-zero.mdx
- 검토일: 2026-10-13
- 결과: 수정 필요 3건 / 확인 47건

검증 방법: PromQL은 GitHub 릴리스에서 받은 promtool 3.15.0(sha256 일치)의 `test rules`로 돌렸어요. 15초 수집이고, 기대값을 일부러 틀리게 넣어 실제 결과를 찍었어요. HTTP API는 prometheus.exe 3.15.0을 127.0.0.1:19090에 띄워 curl로 확인하고 껐어요. JavaScript는 node v22.17.1, Python 클라이언트는 prometheus_client 0.26.0으로 돌렸어요. Grafana는 머리말의 고정 커밋 소스를 읽었어요. 아래 "직접 실행"은 모두 이 결과예요.

작성자 걱정 ①~⑤ 요약:
- ① 고정 커밋의 기본값은 모두 맞아요. Connect null values는 `false`(Never), Disconnect values도 `false`예요. 완전히 빈 결과는 "No data"로 떠요. 문서의 "-"는 No value 입력 칸의 placeholder예요. 다만 Stat 패널 기본 계산은 Last *이고, 대시보드 Prometheus 질의는 기본이 range예요. 그래서 수집이 멈춘 경우엔 No data가 아니라 멈추기 전 마지막 값이 떠요(핵심 3 행).
- ② 맞아요. 문서와 코드 모두 기본 2번 평가 뒤 Normal(MissingSeries)로 해제하고 해제 알림을 보내요.
- ③ 맞아요. 마지막 샘플 뒤 4분 44초까지는 값이 나오고, 4분 45초부터 비어요. stale 표시가 있든 없든 같아요. 구간 선택은 stale 표시를 건너뛰고 lookback을 쓰지 않아요.
- ④ 맞아요. 계측 문서는 레이블 붙은 지표를 따로 말하지 않아요. Go·Python 한정 설명은 정확하고, Java도 같아요.
- ⑤ 더 깊이의 `??`·`||` 설명은 맞아요. Check ②만 틀렸어요. API 값은 문자열 "NaN"이고, `"NaN" || 0`은 그대로 "NaN"이에요.

| 주장(인용) | 판정 | 근거(URL과 짧은 인용) | 수정 제안 |
| --- | --- | --- | --- |
| 머리말 summary: "0은 일어나지 않았다는 뜻이고, 데이터 없음은 모른다는 뜻이에요." | 맞음 | 아래 「결과가 비는 경우」 행들과 같아요. 직접 실행: 고른 시계열이 없으면 0이 아니라 빈 결과가 와요. | — |
| 그림: 제목 "에러율 · 수집이 멈추고 10분 뒤", "빈 값을 0으로 바꾼 화면" 0%, "질의 결과 그대로" 데이터 없음, caption "같은 시각, 같은 질의 결과예요." | 맞음 | 직접 실행: 10분에 멈춘 시계열로 20분에 `sum(rate(err[5m])) / sum(rate(req[5m]))`을 평가하면 `nil`(빈 결과)이에요. 같은 식에 `or vector(0)`을 붙이면 `{} 0`이에요. 근거와 Grafana 화면에서 달라지는 점은 아래 rate 행과 핵심 3 행을 보세요. | — |
| 핵심 1: "0은 재 봤더니 값이 0이었다는 기록이에요. 에러율 0%라면 요청이 들어왔고, 그중 에러는 없었다는 뜻이죠." | 맞음 | 직접 실행: 요청이 늘지 않은 구간은 `rate(idle_err[5m]) / rate(idle_req[5m])` → `{} NaN`이에요. 따라서 0%가 나오려면 요청이 있어야 해요. | — |
| 핵심 1: "데이터 없음은 기록 자체가 없다는 뜻이에요. 수집이 멈췄거나 서버가 내려갔을 수도, 아직 한 번도 기록하지 않은 값일 수도 있어요." | 맞음 | https://prometheus.io/docs/prometheus/latest/querying/basics/#staleness "A time series will go stale when it is no longer exported, or the target no longer exists." / https://prometheus.github.io/client_python/instrumenting/labels/ "Metrics with labels are not initialized when declared" | — |
| 핵심 2: "Prometheus의 Go·Python 클라이언트에서 레이블이 붙은 지표는, 그 레이블 값 조합을 처음 쓸 때 시계열이 생겨요." | 맞음 | Go: https://github.com/prometheus/client_golang/blob/55203175d738823f71cb1f058b581800fd34b0d6/prometheus/counter.go#L227-L233 "If that combination of label values is accessed for the first time, a new Counter is created." Python: 위 client_python 문서. 직접 실행(prometheus_client 0.26.0): 선언 직후엔 `# TYPE http_requests_total counter`만 있고 값 줄이 없어요. 참고: Java도 같아요. https://prometheus.github.io/client_java/getting-started/labels/ "metrics with labels only show up after the label values are first used." | (선택) "Java 클라이언트도 같아서 `initLabelValues()`로 미리 만들어요." |
| 핵심 2: "요청 수를 `route`와 `status` 레이블로 세면, 에러가 한 번도 안 난 경로엔 `status="500"` 시계열이 없어요. 그래서 이 경로의 에러율 질의는 0%가 아니라 빈 결과를 돌려줘요." | 맞음 | 직접 실행: `/b`에 200 시계열만 둘 때 `sum(rate(http_requests_total{route="/b",status="500"}[5m])) / sum(rate(http_requests_total{route="/b"}[5m]))` → `nil`이에요. | — |
| 핵심 2: "Prometheus 계측 문서는 생길 줄 아는 시계열을 미리 0 같은 기본값으로 내보내라고 권해요." | 맞음 | https://prometheus.io/docs/practices/instrumentation/ "export a default value such as 0 for any time series you know may exist in advance." 문서는 레이블 붙은 지표를 따로 말하지 않아요. | — |
| 핵심 2: "그러면 에러가 없을 때 진짜 0이 나와서, 빈 결과와 헷갈리지 않아요." | 맞음 | 직접 실행: `c.labels('/a', '500')`만 부르면 `http_requests_total{route="/a",status="500"} 0.0`이 나와요. 이 시계열이 있으면 요청이 있는 동안 에러율은 0 ÷ x = 0이에요. | — |
| 핵심 3: "화면 코드가 빈 결과를 0으로 바꾸면, 수집이 멈춘 장애가 '에러 0%'로 보여요." | 맞음 | 직접 실행: 멈추고 10분 뒤 빈 결과에 `or vector(0)`을 붙이면 `{} 0`이에요. 아래 node 행처럼 `?? 0`·`\|\| 0`도 undefined를 0으로 바꿔요. | — |
| 핵심 3: "Grafana도 기본 설정에선 시계열 패널의 선을 끊고" | 맞음 | https://github.com/grafana/grafana/blob/86037971957ea7c9c879e582643fbb0731f78b5b/public/app/plugins/panel/timeseries/config.ts#L177-L190 `defaultValue: false`. SpanNullsEditor.tsx L10-L22에서 `false`가 'Never'예요. nullInsertThreshold.ts L76은 끝 빈 구간에도 null을 넣어요: `refFieldPseudoMax > refValues.at(-1) + threshold`. | — |
| 핵심 3: "Stat 패널(숫자 하나를 크게 보여 주는 패널)에 No data를 띄워요." | 오해 소지 | 결과가 시간 범위 전체에서 비어야 No data가 떠요: https://github.com/grafana/grafana/blob/86037971957ea7c9c879e582643fbb0731f78b5b/packages/grafana-data/src/field/fieldDisplay.ts#L318-L319 `if (values.length === 0) { values.push(createNoValuesFieldDisplay(options)); }`. 그런데 Stat 기본 계산은 Last *예요: https://github.com/grafana/grafana/blob/86037971957ea7c9c879e582643fbb0731f78b5b/public/app/plugins/panel/stat/common.ts#L62 `defaultValue: [ReducerID.lastNotNull]`. 대시보드 Prometheus 질의는 기본이 range예요: https://github.com/grafana/grafana-prometheus-datasource/blob/cb5651b00a6b7769b10067f1a6baec07278f4c52/packages/grafana-prometheus/src/datasource.ts#L787-L793 `range: true, instant: false`. 그래서 수집이 멈추고 10분 뒤에도, 대시보드 시간 범위(예: 6시간)에 멈추기 전 점이 있으면 마지막 에러율이 떠요. No data가 뜨는 건 핵심 2처럼 처음부터 없는 시계열일 때예요. 핵심 3은 "수집이 멈춘 장애"를 다루는 문단이라, 읽는 사람은 Grafana 기본값이면 안전하다고 오해하기 쉬워요. | "Grafana 시계열 패널은 기본 설정에서 빈 구간의 선을 끊어요." "Stat 패널은 기본 계산(Last *)이 시간 범위의 마지막 값을 골라요." "그래서 멈추기 전 값이 범위에 남아 있으면 No data 대신 그 값이 떠요." |
| Check ①: "Prometheus HTTP API는 결과가 없으면 `result`가 빈 배열이라, `result[0]?.value[1]`은 undefined예요. 두 식 모두 이걸 0으로 바꾸니" | 맞음 | 직접 실행(서버): `nonexistent_metric` → `{"status":"success","data":{"resultType":"vector","result":[]}}`. 직접 실행(node): `result[0]?.value[1]` → undefined, `?? 0` → 0, `\|\| 0` → 0이에요. 참고: `Number(v) ?? 0`은 NaN이에요. | — |
| Check ②: "Prometheus에서 0 ÷ 0은 NaN(숫자가 아니라는 값)이고, API는 이를 문자열 "NaN"으로 보내요." | 맞음 | https://github.com/prometheus/prometheus/blob/v3.15.0/docs/querying/api.md "sample values are transferred as quoted JSON strings rather than raw numbers." 직접 실행(서버): `vector(0) / vector(0)` → `"value":[…,"NaN"]` | — |
| Check ②: "`\|\| 0`은 NaN도 0으로 바꿔서, 요청이 없던 구간이 '에러 0%'로 보여요." | 오해 소지 | 직접 실행(node): `"NaN" \|\| 0` → `"NaN"`(문자열)이에요. 비어 있지 않은 문자열은 참으로 쳐요. 숫자로 바꿔야 0이 돼요: `Number("NaN") \|\| 0` → 0, `parseFloat("NaN") \|\| 0` → 0, `"NaN" * 100 \|\| 0` → 0. 바로 앞 문장이 API 값은 문자열이라고 해서, 응답 값에 바로 붙여도 0이 된다고 읽혀요. 더 깊이의 `\|\|` 설명은 숫자 NaN 기준이라 맞아요. | "문자열을 `Number()`로 바꾼 뒤 `\|\| 0`을 붙이면 NaN도 0이 돼요." "그러면 요청이 없던 구간이 '에러 0%'로 보여요." |
| Check ③: "Prometheus 알림 규칙은 식의 결과가 비면 울리지 않고, 울리던 알림도 해제돼요." | 맞음 | https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/ "Alerting rules without the `keep_firing_for` clause will deactivate on the first evaluation where the condition is not met" / https://grafana.com/docs/grafana/latest/alerting/guides/missing-data/ "Prometheus doesn't fire alerts when the query returns no data." | — |
| Check ③: "Grafana 알림도 No Data 처리를 Normal로 두면 같고, 일부 시계열만 사라질 땐 기본 설정에서도 해제돼요." | 맞음 | https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/nodata-and-error-states/ "Set Normal state: The alert instance transitions immediately to the Normal state." / https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/stale-alert-instances/ "Stale alert instances in the Alerting, No Data, or Error states transition to the Normal state as Resolved". 코드: https://github.com/grafana/grafana/blob/86037971957ea7c9c879e582643fbb0731f78b5b/pkg/services/ngalert/models/alert_rule.go#L766-L772 `return 2 // default value`, manager.go L603-L613 `s.State = eval.Normal`, `s.StateReason = ngModels.StateReasonMissingSeries` | — |
| Check ④: "수집 목록에서 빠진 대상은 `up`(수집 성공 1, 실패 0)도 0이 아니라 사라져서, `up == 0` 알림이 놓쳐요." | 맞음 | https://prometheus.io/docs/concepts/jobs_instances/ "1 if the instance is healthy, i.e. reachable, or 0 if the scrape failed." 직접 실행: `up`에 stale 표시를 넣으면 15초 뒤 `up == 0` → `nil`이에요. collection-interval.mdx 「수집이 끊기면」과 같아요. | — |
| Check ④: "Prometheus의 `absent_over_time(up{job="api"}[10m])`은 10분 동안 값이 없으면 1을 내요." | 맞음 | 직접 실행: 마지막 샘플이 10분, stale 표시가 10분 15초일 때 19분 59초엔 `nil`이고, 20분엔 `{job="api"} 1`이에요. stale 표시는 구간 샘플로 치지 않아요(engine.go L3099). | — |
| 더 깊이: "PromQL은 고른 시계열이 없으면 0이 아니라 빈 결과를 돌려줘요. HTTP API 응답은 성공(`success`)이고, `result`만 빈 배열이에요." | 맞음 | 직접 실행(서버): 위 Check ① 응답과 같아요. | — |
| 더 깊이: "`sum()` 같은 집계도 입력이 비면 결과가 비어요. 결과 시계열을 입력 시계열의 레이블로 만들어서, 입력이 없으면 결과도 없어요." | 맞음 | https://github.com/prometheus/prometheus/blob/v3.15.0/promql/engine.go#L1645-L1667 "Create a mapping from input series to output groups." 결과는 입력 시계열마다 `result = append(result, Series{Metric: m})`로 만들어요. 직접 실행: `sum(nonexistent_metric)`, `count(nonexistent_metric)` 둘 다 `nil`이에요. | — |
| 더 깊이: "`/` 같은 이항 연산(값 둘로 계산하는 연산)은 양쪽에서 레이블이 같은 짝끼리만 계산해요. 짝이 없는 시계열은 결과에서 빠져요." | 맞음 | https://github.com/prometheus/prometheus/blob/v3.15.0/docs/querying/operators.md "By default, series for which no matching entry in the opposite vector can be found are not part of the result." 참고: 3.15에는 실험 기능 fill modifier가 있어요(L333 "must be enabled with `--enable-feature=promql-binop-fill-modifiers`"). L346 "If a series is missing on both sides, it cannot be created" | (선택) "실험 기능 `fill_left(0)`을 켜면 짝 없는 왼쪽만 0으로 채워요." "양쪽 다 없으면 채우지 않아서, 수집이 멈추면 그대로 비어요." |
| 더 깊이: "그래서 `sum by (route)`로 경로별 에러율을 구하면, 에러가 한 번도 안 난 경로는 0%가 아니라 결과에서 빠져요." | 맞음 | 직접 실행: `sum by (route) (rate(...{status="500"}[5m])) / sum by (route) (rate(...[5m]))` → `{route="/a"} 0.0909`만 나오고 `/b`는 없어요. | — |
| 더 깊이: "rate는 구간에 샘플(sample, 수집한 값 하나)이 2개 이상 있으면 값을 내요." | 맞음 | https://github.com/prometheus/prometheus/blob/v3.15.0/promql/functions.go#L572-L574 "There's a single sample, and we do not have suitable ST to calculate the increase. Return nothing." counters-and-rate.mdx 「구간 길이」와 같아요. | — |
| 더 깊이: "그래서 `[5m]`이면 수집이 멈추고도 5분 가까이 멈추기 전 샘플로 값이 나와요. 그림을 10분 뒤로 잡은 이유예요." | 맞음 | 직접 실행: 마지막 샘플이 10분일 때 14분 44초엔 `rate(req[5m])` → 0.0522, 14분 45초엔 `nil`이에요. 구간이 왼쪽 열림이라 샘플 2개가 남는 마지막 시각이에요. stale 표시가 있어도 결과가 같아요. 구간 선택은 stale 표시를 건너뛰어요: https://github.com/prometheus/prometheus/blob/v3.15.0/promql/engine.go#L3098-L3100 `if value.IsStaleNaN(f) { continue loop }`. lookback도 쓰지 않아요. 같은 시계열을 구간 없이 고르면 stale 표시 직후(10분 15초)부터 `nil`이에요. collection-interval.mdx의 "stale 표시가 붙은 뒤로는 5분이 지나지 않아도 값이 나오지 않아요"는 구간 없는 질의 이야기라 어긋나지 않아요. 다만 두 글을 이어 읽으면 헷갈릴 수 있어요. | (선택) "rate처럼 구간을 쓰는 질의는 stale 표시를 건너뛰고 구간 안 샘플로 계산해요." |
| 더 깊이: "0 ÷ 0은 IEEE 754(부동소수점 계산 표준) 규칙대로 NaN이에요. 에러와 요청 시계열이 모두 있는데 둘 다 늘지 않은 구간이 여기에 해당해요." | 맞음 | https://github.com/prometheus/prometheus/blob/v3.15.0/docs/querying/operators.md "They follow the usual IEEE 754 floating point arithmetic, including the handling of special values like `NaN`" 직접 실행: `rate(idle_err[5m]) / rate(idle_req[5m])`, `sum(...) / sum(...)` 모두 `{} NaN`이에요. | — |
| 더 깊이: "`sum(...) or vector(0)`은 왼쪽 결과가 비면 0을 내는 PromQL 패턴이에요. `or`는 왼쪽에 없는 레이블 조합만 오른쪽에서 가져와요." | 맞음 | operators.md "additionally all elements of `vector2` which do not have matching label sets in `vector1`." 직접 실행: `sum(rate(nonexistent_metric[5m])) or vector(0)` → `{} 0` | — |
| 더 깊이: "Grafana 알림 문서도 빈 결과를 0으로 바꾸는 방법으로 소개해요." | 맞음 | https://grafana.com/docs/grafana/latest/alerting/guides/missing-data/ "When NoData is not an issue, consider rewriting the query to always return data — for example, in Prometheus, use your_metric_query OR on() vector(0)". 문서가 쓰는 꼴은 `or on() vector(0)`이에요. | — |
| 더 깊이: "하지만 수집이 멈춰도 0이 나와서, 값이 왜 없는지를 지워요. 쓴다면 값이 끊긴 걸 알리는 `absent_over_time()` 알림을 함께 둬요." | 맞음 | 직접 실행: 멈추고 10분 뒤 `(… / …) or vector(0)` → `{} 0`이에요. 같은 Grafana 문서도 "Use absent_over_time() or present_over_time in Prometheus to detect when a metric or target disappears."라고 해요. | — |
| 더 깊이: "`sum by (route) (...)`처럼 레이블이 남는 결과에 붙이면, 레이블 없는 0 시계열이 하나 더 붙어요. 왼쪽이 빌 때만 0을 붙이려면 `or on() vector(0)`로 써요." | 맞음 | 직접 실행: `... or vector(0)` → `{} 0, {route="/a"} 0.0667`. `... or on() vector(0)` → `{route="/a"} 0.0667`만 나와요. 왼쪽이 비면 `or on() vector(0)` → `{} 0`이에요. | — |
| 더 깊이: "JavaScript의 `??`는 null과 undefined만 바꾸고, `\|\|`는 0, NaN, 빈 문자열처럼 거짓으로 치는 값을 모두 바꿔요." | 맞음 | 직접 실행(node), `?? 0` / `\|\| 0` 결과: null → 0 / 0, undefined → 0 / 0, NaN → NaN / 0, 0 → 0 / 0, "" → "" / 0, false → false / 0. | — |
| 더 깊이: "`?? 0`은 NaN을 그대로 둬서, 그냥 찍으면 화면에 NaN이 떠요." | 맞음 | 직접 실행: `NaN ?? 0` → NaN, `"NaN" ?? 0` → "NaN", `` `${NaN}%` `` → "NaN%" | — |
| 더 깊이: "`Number(null)`도 0이라, null로 둔 값도 숫자로 바꾸는 순간 0이 돼요." | 맞음 | 직접 실행: `Number(null)` → 0, `+null` → 0, `null * 100` → 0이에요. 참고: `parseFloat(null)`은 NaN이에요. | (선택) "`Number()`나 `* 100` 같은 계산을 거치면 null도 0이 돼요." |
| 더 깊이: "계측 코드에서 미리 내보낸 0은 달라요. 앱이 실제로 내보내는 시계열이라, 수집이 멈추면 다른 시계열과 함께 비어요." | 맞음 | 위 staleness 문서와 같아요. 직접 실행: 멈춘 시계열은 rate가 4분 45초 뒤부터 비어요. 미리 만든 0 시계열도 같은 대상의 시계열이라 똑같이 비어요. | — |
| 더 깊이: "Prometheus 계측 문서는 Go·Java·Python 등 대부분의 클라이언트가 레이블 없는 지표는 알아서 0을 내보낸다고 해요." | 맞음 | https://prometheus.io/docs/practices/instrumentation/ "Most Prometheus client libraries (including Go, Java, and Python) will automatically export a 0 for you for metrics with no labels." 직접 실행(Python): 선언만 한 레이블 없는 카운터가 `plain_total 0.0`으로 나와요. | — |
| 더 깊이: "레이블이 붙은 지표는 직접 만들어 둬요. Python 클라이언트라면 `c.labels('get', '/')`처럼 레이블 값만 넣어 한 번 불러 두면 돼요." | 맞음 | https://prometheus.github.io/client_python/instrumenting/labels/ "It is recommended to initialize the label values by calling the `.labels()` method alone: … c.labels('get', '/')". 직접 실행: 핵심 2 행과 같아요. | — |
| 더 깊이: "Grafana의 Prometheus 데이터 소스는 점 간격(step)을 함께 넘겨요." | 맞음 | https://github.com/grafana/grafana-prometheus-datasource/blob/cb5651b00a6b7769b10067f1a6baec07278f4c52/pkg/promlib/querydata/response.go#L241-L248 `frame.Fields[0].Config = &data.FieldConfig{Interval: float64(q.Step.Milliseconds())}`(L65에서 모든 프레임에 적용). "점 간격" 풀이는 aggregation-and-downsampling.mdx와 같아요. | — |
| 더 깊이: "시계열 패널은 이보다 긴 빈 구간에 null을 넣고, Connect null values 기본값(Never)대로 선을 끊어요." | 맞음 | https://github.com/grafana/grafana/blob/86037971957ea7c9c879e582643fbb0731f78b5b/packages/grafana-data/src/transformations/transformers/nulls/nullInsertThreshold.ts#L51-L86 `field.config.custom?.insertNulls \|\| refField.config.interval`, `refValues[i] - refValues[i - 1] > threshold`. 호출: timeseries/utils.ts L170-L178. 기본값: config.ts L183 `defaultValue: false`(Never). | — |
| 더 깊이: "질의 결과가 통째로 비면 Stat 패널은 No data를 띄워요." | 맞음 | https://github.com/grafana/grafana/blob/86037971957ea7c9c879e582643fbb0731f78b5b/packages/grafana-data/src/field/fieldDisplay.ts#L430-L469 `const displayName = 'No data'`. No value가 비어 있으면 표시 글자가 `''`라서 `getDisplayText`가 'No data'로 대신해요(displayProcessor.ts L185-L190). 문서의 "The default value is a hyphen (-)."는 입력 칸 placeholder예요: public/app/core/components/OptionsUI/registry.tsx L415 `placeholder: '-'`. range 질의에서 "통째로"는 시간 범위 전체라는 점은 핵심 3 행을 보세요. | — |
| 더 깊이: "패널 설정의 No value(값이 비었을 때 대신 보여 줄 글자)를 채우면 그 글자가 대신 떠요." | 맞음 | displayProcessor.ts L186-L187 `if (config.noValue) { text = config.noValue; }` | — |
| 더 깊이: "No value에 숫자를 넣으면 시계열 패널은 빈 구간도 그 숫자로 채워요. 0을 넣으면 `?? 0`과 같아요." | 맞음 | https://github.com/grafana/grafana/blob/86037971957ea7c9c879e582643fbb0731f78b5b/packages/grafana-data/src/transformations/transformers/nulls/nullToValue.ts#L3-L32 `const noValue = Number(field.config.noValue)`, `if (transformedVals[i] === null)`. 빈 구간에 넣은 null만 바꾸고 NaN은 두는 점이 `?? 0`과 같아요. NaN은 그 뒤 utils.ts L200-L202에서 null이 돼 선이 끊겨요. | — |
| 더 깊이: "NaN을 '요청 없음'처럼 보이려면 Value mappings의 Special을 써요." | 오해 소지 | Special에 NaN이 있는 건 맞아요: https://grafana.com/docs/grafana/latest/panels-visualizations/configure-value-mappings/ "maps special values like Null, NaN (not a number)". 그런데 Stat 기본 계산 Last *는 NaN을 건너뛰어요: https://github.com/grafana/grafana/blob/86037971957ea7c9c879e582643fbb0731f78b5b/packages/grafana-data/src/transformations/fieldReducer.ts#L252-L257 "Last non-null value (also excludes NaNs)", L632 `if (v != null && !Number.isNaN(v))`. 그래서 앞 값이 있으면 그 값이 뜨고, 모두 NaN이면 null이 돼요. 이때 NaN 매핑은 맞지 않아요(valueMappings.ts L82-L85 `typeof value === 'number' && isNaN(value)`). 시계열 패널은 NaN을 null로 바꿔 선을 끊어요(utils.ts L200-L202). 기본 설정 그대로 NaN 매핑만 걸면 '요청 없음'이 뜨지 않아요. | "Stat 패널의 기본 계산 Last *는 NaN을 건너뛰어요." "계산을 Last로 바꾼 뒤 Special의 NaN을 '요청 없음'으로 매핑해요." |
| 더 깊이: "Grafana 알림은 질의가 성공했는데 데이터가 하나도 없으면 기본으로 No Data 상태가 돼요." | 맞음 | https://grafana.com/docs/grafana/latest/alerting/fundamentals/alert-rule-evaluation/nodata-and-error-states/ "The No Data state occurs when the alert rule query runs successfully but returns no data points at all." / "Set No Data state (Default)". 참고: pending period를 거쳐요("Normal → Pending → No Data"). | — |
| 더 깊이: "이 처리는 Alerting, Normal, Keep Last State로 바꿀 수 있어요." | 맞음 | 같은 문서: "Set Alerting state", "Set Normal state", "Keep last state" | — |
| 더 깊이: "일부 시계열만 사라지면 No Data가 아니에요. 기본 2번 평가 동안 계속 없으면 그 알림은 Normal(MissingSeries)로 해제되고, 해제 알림도 나가요." | 맞음 | https://grafana.com/docs/grafana/latest/alerting/guides/missing-data/ "MissingSeries occurs when only some series disappear but not all." / "A resolved notification is sent if the alert was previously firing." stale 문서: "(2 by default)". 코드는 Check ③ 행과 같아요. | — |
| 더 깊이: "횟수는 Missing series evaluations to resolve로 바꿔요." | 맞음 | stale-alert-instances 문서: "In Configure no data and error handling > Missing series evaluations to resolve, you can set how many consecutive evaluation intervals must pass" | — |
| 더 깊이: "Prometheus의 `absent()`는 지금 값이 없을 때, `absent_over_time()`은 구간 내내 없을 때 1을 내요." | 맞음 | https://prometheus.io/docs/prometheus/latest/querying/functions/ "a 1-element vector with the value 1 if the vector passed to it has no elements" (absent), "if the range vector passed to it has no elements" (absent_over_time). 직접 실행: stale 표시 직후 `absent(up{job="api"})` → `{job="api"} 1` | — |
| 더 깊이: "둘 다 고른 시계열이 모두 없어야 1을 내서, 여럿 중 하나만 빠진 건 못 잡아요." | 맞음 | 같은 문서: "returns an empty vector if the vector passed to it has any elements" | — |
| 더 깊이: "Prometheus 알림 규칙의 `keep_firing_for`는 조건이 사라진 뒤에도 정한 시간만큼 알림을 유지해요." | 맞음 | https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/ "keep this alert firing for the specified duration after the firing condition was last met." | — |
| 더 깊이: "해제를 늦출 뿐이라, 값이 끊긴 걸 알리는 알림을 대신하지는 못해요." | 맞음 | 같은 문서: 쓰임새가 "false resolutions due to lack of data loss" 방지예요. 정한 시간이 지나면 해제돼서, 데이터가 끊겼다는 알림은 따로 생기지 않아요. | — |
| 머리말 sources: 고정 커밋·줄 범위 | 맞음 | 모두 열어 봤어요. 인용한 내용이 그 줄 범위에 있어요. engine.go L1645-L1667, functions.go L572-L574, config.ts L177-L190, SpanNullsEditor.tsx L10-L22, response.go L241-L248, utils.ts L170-L178, nullInsertThreshold.ts L51-L86, nullToValue.ts, fieldDisplay.ts L430-L469 | — |

## 반영

- (오해 소지, 핵심 3 Stat 패널 No data) 끝 문장을 바꿨어요.
  - 새 문장은 "Grafana Stat 패널(숫자 하나를 보여 주는 패널)은 기본으로 시간 범위의 마지막 값을 띄워, 멈추기 전 값이 장애를 가리기도 해요."예요. 멈추기 전 마지막 값도 장애를 가린다는 결과를 본문에 담았어요.
  - 시계열 패널이 선을 끊는다는 말은 본문에서 빼고 더 깊이에만 뒀어요. 문장 수는 그대로 5개예요.
  - 이 문장에 기대던 곳도 고쳤어요. 그림 caption 첫 문장을 "수집이 멈추고 10분 뒤, 지금 시각의 질의 결과는 비어 있어요."로 바꿔, 타일이 지금 시각의 결과라는 걸 밝혔어요.
  - 더 깊이의 "질의 결과가 통째로 비면 Stat 패널은 No data를 띄워요."는 두 단락으로 바꿨어요.
    - 첫 단락: 대시보드의 Prometheus 질의는 기본이 범위 질의예요. Stat 기본 계산 Last *는 null과 NaN이 아닌 마지막 값을 골라요. 그래서 No data는 시간 범위 전체에 값이 없을 때만 떠요.
    - 둘째 단락: 지금 값을 보려면 질의 옵션의 Type을 Instant로 바꿔요. 시간 범위 끝 시각에 한 번만 계산해요.
  - 작성자도 소스로 확인했어요.
    - datasource.ts L787-L812: `getDefaultQuery`가 대시보드엔 `range: true, instant: false`를 줘요.
    - Grafana 문서는 "Both"를 기본이라고 해요. 하지만 같은 함수에서 Both(`instant: true, range: true`)는 Explore의 기본값이에요.
    - client.go L57-L64: Instant 질의는 `"time": formatTime(q.End)`, 곧 범위 끝 시각에 계산해요.
  - 출처를 더했어요. datasource.ts getDefaultQuery, Prometheus query editor 문서(Type), client.go, stat/common.ts(Last * 기본값), fieldReducer.ts(Last *와 Last)예요.
- (오해 소지, 확인 2 `|| 0`과 NaN) 끝 문장을 바꿨어요. 새 문장은 "이 문자열을 `Number()`로 바꾼 뒤 `|| 0`을 붙이면 NaN도 0이 돼서, 요청이 없던 구간이 '에러 0%'로 보여요."예요.
  - 작성자의 node 결과(`Number("NaN") || 0` → 0)와 같아요.
  - 더 깊이의 `||` 설명은 숫자 NaN 기준이라 그대로 뒀어요.
- (오해 소지, 더 깊이 Value mappings로 NaN 표시) 문장을 바꿨어요. 새 문장은 "NaN을 '요청 없음'처럼 보이려면 계산을 Last로 바꾸고, Value mappings의 Special로 NaN을 매핑해요. Last *는 NaN을 건너뛰어서 매핑이 걸리지 않아요."예요.
  - fieldReducer.ts L250-L267은 Last *를 "Last non-null value (also excludes NaNs)", Last를 "Last value"로 정해 둬요.
- (선택, 핵심 2 Java) 넣지 않았어요. 본문은 확인한 Go·Python만 말하고, Java도 같다는 건 이 검토 기록에 남아요.
- (선택, 더 깊이 fill modifier) 넣지 않았어요. 실험 기능이라 켜야 쓰고, 더 깊이를 늘리지 않으려 했어요.
- (선택, 더 깊이 rate와 stale 표시) 넣지 않았어요. "멈추기 전 샘플로 값이 나와요"가 이미 구간 질의 이야기라, collection-interval.mdx의 구간 없는 질의와 부딪히지 않아요.
- (선택, 더 깊이 `Number(null)`) 받아들였어요. 새 문장은 "`Number(null)`이나 `null * 100`도 0이라, null로 둔 값도 계산을 거치면 0이 돼요."예요.
- (작성자, 분량) 고친 내용이 늘어나 더 깊이가 약 2,120자가 됐어요. 그래서 세 군데를 줄여 약 2,000자로 맞췄어요.
  - `keep_firing_for` 단락을 지웠어요. 확인 3은 이 단락 없이도 맞다고 판정됐고, 출처 제목에서도 `(keep_firing_for)`를 뺐어요.
  - 레이블 없는 지표가 알아서 0을 내보낸다는 문장을 지웠어요.
  - 짧은 문장 몇 개를 다듬었어요. 예: `sum()` 이유 문장, Grafana 알림 문서 문장.
- (글 검토 1차) 확인 4의 `absent_over_time(up{job="api"}[10m])` 조건을 밝혔어요. 새 문장은 "api 대상이 10분 동안 모두 사라져야 1을 내요."예요. 더 깊이의 "여럿 중 하나만 빠진 건 못 잡아요"와 맞아요.
- (글 검토 1차) 핵심 3 둘째 단락을 처방, 예외, 해결책 순서로 다시 썼어요. 문장 수는 그대로 5개예요.
  - 처방: "빈 값은 그래프에선 선을 끊고, 숫자 칸에선 '데이터 없음'으로 보여 주세요."
  - 예외: "다만 Grafana Stat 패널(…)은 기본으로 범위의 마지막 값을 띄워, 멈추기 전 값이 장애를 가릴 수 있어요."
  - 해결책: "질의 Type을 Instant(범위 끝 시각만 계산)로 바꾸면, 지금 값이 없을 때 No data가 떠요."
- (글 검토 1차) null을 숫자로 바꾸면 0이 되는 함정에 할 일을 붙였어요.
  - 확인 1은 "null(…)은 숫자로 바꾸기 전에 걸러 '데이터 없음'으로 그리세요."로 바꿨어요.
  - 더 깊이에는 "`(v * 100).toFixed(1)`은 v가 null이어도 "0.0"을 찍어요."와 "null과 NaN을 먼저 걸러 … 남은 값만 숫자로 바꿔요."를 더했어요.
  - node로 확인했어요. `(null * 100).toFixed(1)`은 "0.0"이고, 먼저 거르는 함수는 undefined·null → 데이터 없음, "NaN" → 요청 없음, "0.0123" → 1.2%를 내요.
- (글 검토 1차) 더 깊이에서 Grafana 해결책 두 가지를 이었어요.
  - 새 문장은 "Instant로 바꿔도 결과가 NaN이면 Last *가 건너뛰어요. 그래서 '요청 없음'을 보이려면 계산도 Last로 함께 바꾸고, Value mappings의 Special로 NaN을 매핑해요."예요.
  - Instant 설명은 본문으로 옮겨서, 더 깊이의 Instant 단락과 따로 있던 NaN 매핑 단락을 이 단락 하나로 합쳤어요.
- (글 검토 1차, 분량) `sum()` 이유 문장을 "`sum()` 같은 집계도 입력이 비면 0이 아니라 빈 결과예요."로 줄였어요. 더 깊이는 약 1,980자, 본문은 1,412자예요.
- (최종 검토) 확인 1의 할 일이 바로 앞 예시와 어긋났어요. 예시 `result[0]?.value[1]`은 undefined인데, 할 일은 null만 거르라고 했어요. 끝 문장을 "두 식 모두 이걸 0으로 바꾸니, 빈 값(undefined·null)은 숫자로 바꾸기 전에 걸러 '데이터 없음'으로 그리세요."로 바꿨어요.
  - 같은 할 일이 더 깊이 「0으로 채우는 코드」에도 있어서 함께 고쳤어요. 새 문장은 "그래서 undefined·null과 NaN을 먼저 걸러 '데이터 없음'·'요청 없음'으로 보내고, 남은 값만 숫자로 바꿔요."예요.
  - node로 확인했어요. `[][0]?.value[1]`은 undefined이고, `?? 0`과 `|| 0` 모두 0을 내요. `(undefined * 100).toFixed(1)`은 "NaN"이에요.
- (최종 검토) 본문에 처음 나오는 용어 두 개에 풀이를 달았어요.
  - 핵심 2 첫 문장은 "Prometheus의 Go·Python 클라이언트(앱에서 지표를 만드는 라이브러리)는 레이블 값 조합을 처음 쓸 때 그 시계열을 만들어요."예요. 풀이를 그대로 넣으면 80자를 넘어서, 주어를 클라이언트로 바꿨어요(77자). 레이블 값 조합을 처음 쓸 때 시계열이 생긴다는 사실은 그대로예요.
  - 핵심 2 둘째 단락은 "Prometheus 계측(코드에 지표를 심는 일) 문서는 …"으로 바꿨어요.
- (최종 검토) 출처 제목 세 개의 "Grafana Prometheus 데이터 소스 소스 — "를 "Grafana 소스 — "로 바꿨어요. response.go, datasource.ts getDefaultQuery, client.go 줄이에요. aggregation-and-downsampling.mdx, why-numbers-differ.mdx가 출처 이름을 붙이는 방식과 맞췄어요.
- (최종 검토, 분량) 본문은 1,435자예요(최대 1,500자). 문장은 모두 80자 이하예요.
