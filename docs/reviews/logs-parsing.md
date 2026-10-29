# 사실 확인: 파싱과 필드 추출

- 글: src/content/docs/logs/parsing.mdx
- 확인일: 2026-10-29

| 확인한 주장 | 근거(URL) |
| --- | --- |
| Fluent Bit 파서의 Format(json, regex, ltsv, logfmt), Regex는 Ruby 정규식, Time_Key, Time_Format(strptime), Time_Keep(기본 false면 원래 시각 필드를 지움), Time_Offset(시간대 없는 시각에 쓸 고정 UTC 차이) | https://docs.fluentbit.io/manual/data-pipeline/parsers/configuring-parser |
| Loki 파서 json, logfmt, pattern, regexp, regexp는 RE2이고 `(?P<name>re)`로 이름 붙임 | https://grafana.com/docs/loki/latest/query/log_queries/ |
| 파서가 줄 필터보다 비싸서 줄 필터 뒤에 두라는 권고 | https://grafana.com/docs/loki/latest/query/bp-query/ |
| Timestamp와 ObservedTimestamp | https://opentelemetry.io/docs/specs/otel/logs/data-model/ |

- 재현(Node 22):
  - 글의 정규식이 `2026-10-29 17:22:19 ERROR [order-api] payment failed order_id=A1042`를 time, level, service, msg로 나눴어요. `2026/10/29 …`로 바꾼 줄에는 null이었어요.
  - `new Date('2026-10-29T17:22:19')`를 `TZ=Asia/Seoul`에서 `2026-10-29T08:22:19.000Z`, `TZ=UTC`에서 `2026-10-29T17:22:19.000Z`로 읽어 9시간 차이.
- 「모니터링에서는」 그래프의 숫자는 예시예요.
- 함께 한 것: 퀴즈 5문제를 썼어요.
