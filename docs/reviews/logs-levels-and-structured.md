# 사실 확인: 로그 레벨과 구조화 로그

- 글: src/content/docs/logs/levels-and-structured.mdx
- 확인일: 2026-10-29

| 확인한 주장 | 근거(URL) |
| --- | --- |
| SeverityNumber 범위(TRACE 1~4, DEBUG 5~8, INFO 9~12, WARN 13~16, ERROR 17~20, FATAL 21~24), 0은 정하지 않음, SeverityText가 없으면 짧은 이름으로 대신 | https://opentelemetry.io/docs/specs/otel/logs/data-model/ |
| Loki `\| json`은 JSON 필드를 레이블로 꺼냄, `\| logfmt`가 따로 있음 | https://grafana.com/docs/loki/latest/query/log_queries/ |

- 재현(Node 22): 글의 텍스트 줄 142바이트, JSON 줄 193바이트(UTF-8). 초당 2,000줄 × 86,400초로 하루 24.5GB, 33.4GB.
- 함께 한 것: 용어 log-level, structured-log를 올렸어요. 퀴즈 5문제를 썼어요.
