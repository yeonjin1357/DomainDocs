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
