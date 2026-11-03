# 사실 확인: 비즈니스 지표

- 글: src/content/docs/apm/business-metrics.mdx
- 확인일: 2026-11-03

| 확인한 주장 | 근거(URL) |
| --- | --- |
| OpenTelemetry 파이썬 `meter.create_counter("orders.created", unit="{order}")`, `add(1, {"payment.method": "card"})` | 직접 실행: Windows Python, opentelemetry-sdk 1.45.2, opentelemetry-exporter-prometheus 0.66b2(scratchpad에 --target 설치) |
| Prometheus로 내보낸 이름 `orders_created_total{payment_method="card"} 2.0`, `orders_amount_KRW_total{…} 32000.0`, `otel_scope_name="shop"` 레이블 | 같은 실행의 /metrics 출력 |
| 중괄호 안의 단위는 빼고, 다른 단위는 이름 뒤에 붙이며, 합계(카운터)에는 `_total`, 금지 문자는 `_`로 | https://opentelemetry.io/docs/specs/otel/compatibility/prometheus_and_openmetrics/ (원문 specification/compatibility/prometheus_and_openmetrics.md 425~446, 495행) |
| `sum(rate(x[10m])) / sum(rate(x[10m] offset 1w)) < 0.5` | promtool 3.5.0 `test rules` 통과: 분당 120에서 10으로 줄면 비율 0.0833, 지속 10분 뒤 알림 |
| offset 수식어로 지난 시각의 값을 읽어요 | https://prometheus.io/docs/prometheus/latest/querying/basics/ |

- 화면 예시와 퍼널 숫자는 설명용이에요.
