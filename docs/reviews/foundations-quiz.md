# 사실 확인: 모니터링 기초 퀴즈

- 문제: src/content/quizzes/foundations/*.yaml (16개 파일, 79문제)
- 확인일: 2026-10-21
- 방법: 숫자·기본값·도구마다 다른 동작이 든 문제만 골라, 그 문제가 기대는 글의 문장과 글의 검토 기록 근거에 맞춰 봤어요. 계산은 글에 나온 숫자를 그대로 썼어요. 글에 없는 새 주장은 넣지 않았어요.

| 문제(파일 · id) | 확인한 주장 | 근거 |
| --- | --- | --- |
| percentiles · mean-calc, one-slow-p99, small-sample-p99 | (98 × 0.13 + 2 × 3) ÷ 100 = 0.187, 1%면 p99 그대로·2%면 3초, 50건 nearest-rank p99 = 최댓값 | 글 본문·Deeper와 docs/reviews/foundations-percentiles.md |
| counters-and-rate · rate-calc, restart-increase, gauge-change | 30,000 ÷ 300 = 100/s, 재시작 시 50 + 20 = 70, 게이지는 delta()·deriv() | 글 본문과 docs/reviews/foundations-counters-and-rate.md |
| time-series-and-labels · cardinality-calc | 5 × 10 × 200 = 10,000 | 글 본문과 docs/reviews/foundations-time-series-and-labels.md |
| collection-interval · counter-average, rate-window, deleted-pod-up | (57×40 + 3×100) ÷ 60 = 43%, Grafana 권장 4배, 디스커버리에서 빠진 대상의 up은 사라짐 | 글 본문·Deeper와 docs/reviews/foundations-collection-interval.md |
| aggregation-and-downsampling · avg-hides-peak | 30초 95% 피크의 5분 평균 약 45% | 글 본문과 docs/reviews/foundations-aggregation-and-downsampling.md |
| no-data-vs-zero · never-seen-series, alert-on-empty | 레이블 조합은 처음 쓸 때 생김, 알림 규칙은 결과가 비면 울리지 않음 | 글 본문과 docs/reviews/foundations-no-data-vs-zero.md |
| why-numbers-differ · rate-window-peak | (4 × 100 + 400) ÷ 5 = 160/s | 글 본문과 docs/reviews/foundations-why-numbers-differ.md |
| empty-graph · retention-15d, regex-full-match, otlp-no-up | Prometheus 기본 보관 15일, =~는 전체 일치, OTLP 앱엔 up 없음 | 글 본문과 docs/reviews/foundations-empty-graph.md |
| slo-and-error-budget · budget-requests, budget-minutes | 100만 × 0.1% = 1,000건, 43,200분 × 0.1% = 43.2분 | 글 본문과 docs/reviews/foundations-slo-and-error-budget.md |
| red-and-use · error-count-vs-rate | 1,200 × 0.4% = 4.8, 2,400 × 0.4% = 9.6 | 글 Checkpoints(계산) |
| alert-conditions · pending-reset, burn-days | pending 중 조건이 깨지면 처음부터, 버짓 1%에 에러율 2% → 15일 | 글 본문·Checkpoints와 docs/reviews/foundations-alert-conditions.md |
| alert-fatigue · slo-threshold-noisy, group-by-cluster | SLO와 같은 임계값이면 하루 최대 144번, group_by [cluster, alertname] | 글 본문과 docs/reviews/foundations-alert-fatigue.md |
| histograms · interpolated-p99 | 985·995 사이 선형 보간 → 0.75초 | 글 본문과 docs/reviews/foundations-histograms.md |
| p99-looks-wrong · low-traffic-spike, zero-requests-nan | 50건 중 1건 느리면 p99 약 1.75초, 요청 0건이면 NaN | 글 본문과 docs/reviews/foundations-p99-looks-wrong.md |
| logs-metrics-traces · head-sampling-miss | 0.9의 5제곱 ≈ 59% | 글 Checkpoints(계산) |
| cardinality-explosion · sample-limit-all, labeldrop-collision | sample_limit을 넘으면 수집 전체 실패, labeldrop 뒤 조합이 겹치면 값이 사라짐 | 글 본문과 docs/reviews/foundations-cardinality-explosion.md |

## 2026-10-30 문제 다시 보기

26편 128문제를 글과 나란히 읽고 다시 봤어요. 흘리는 말(괜찮나요, 0으로 읽어도 되나요, 망가졌다는 뜻인가요, 좋은 SLI인가요, 넉넉해지나요, 느려질 일은 없나요, 어긋날 수 있나요, ~만 설치하면 할 수 있나요)을 없앴어요. '들지 않는 것은' 문제와 엉뚱한 오답을 고치고, 글끼리 겹치던 문제(서버별 p99 평균, 정규식 전체 일치, rate 먼저 sum 나중)는 그 글만의 내용으로 바꿨어요. OX의 O는 37%에서 55%가 됐어요.

| 문제 | 주장 | 근거 |
| --- | --- | --- |
| percentiles · two-slow-p99 | 0.13초 98개와 3초 2개의 nearest-rank p99(99번째)는 3초, 느린 요청이 1개면 0.13초 | 글 본문의 계산 |
| percentiles · p99-tail-count | p99가 1.2초면 요청의 1%가 그보다 오래 걸림 | 글 본문의 정의 |
| units-and-notation · df-h-g-is-1024 | df -h는 1024로 나누며 G라고 적고, df -H는 1000으로 나눔 | docs/reviews/foundations-units-and-notation.md (man7.org df(1)) |
| promql-basics · without-keeps-rest | sum without (instance)는 instance만 빼고 job·status를 남김 | promtool 3.15.1 test rules: {job="api", status="500"} 6, {job="api", status="503"} 1 |
| empty-graph · explore-ok-panel-empty | Explore에서 나오는데 패널만 비면 Transformations를 봄 | 글 2단계 |
| why-numbers-differ · utc-2pm-vs-kst-5am | KST는 UTC+9라 UTC 14시는 KST 23시 | 글 4단계 |
| slo-and-error-budget · cpu-slo-misses-db | CPU 같은 원인 지표 SLO는 DB 연결 거부로 인한 실패를 재지 못함 | 글 Checkpoints |
