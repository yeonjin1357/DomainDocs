# 사실 확인: 로그 한 줄이 화면에 뜨기까지

- 글: src/content/docs/logs/overview.mdx
- 확인일: 2026-10-29

| 확인한 주장 | 근거(URL) |
| --- | --- |
| LogRecord의 칸(Timestamp, ObservedTimestamp, SeverityText/Number, Body, Attributes, Resource, TraceId/SpanId)과 두 시각의 뜻 | https://opentelemetry.io/docs/specs/otel/logs/data-model/ |
| Loki는 라벨만 색인하고 본문은 압축 덩어리로 둠 | https://grafana.com/docs/loki/latest/get-started/overview/ |
| Elasticsearch text 필드는 분석기로 단어 목록을 만들어 색인 | https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/text |

- 함께 한 것: 새 영역 `logs`를 만들고(영역 목록, 아이콘 scroll-text, 홈 화면 테스트의 영역 수 9), 설계 문서(2026-10-21)에 영역 추가 결정을 적었어요. 용어 log-parsing, log-index를 올렸어요. 모니터링 기초 개요와 「로그가 모이는 길」에서 이 영역을 이었어요. 퀴즈 4문제를 썼어요.
