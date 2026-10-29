# 사실 확인: 로그가 갑자기 많아질 때

- 글: src/content/docs/logs/volume-spike.mdx
- 확인일: 2026-10-29

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 수집 속도 한도를 넘으면 distributor가 HTTP 429로 거절, reason `rate_limited`, 요청 전체를 저장 전에 거절, `loki_discarded_samples_total`·`loki_discarded_bytes_total` 증가, `per_stream_rate_limit` 기본 3MB·버스트 15MB | https://grafana.com/docs/loki/latest/operations/request-validation-rate-limits/ |
| throttle 필터는 창 평균이 Rate를 넘으면 메시지를 버림(쌓지 않음) | https://docs.fluentbit.io/manual/data-pipeline/filters/throttle |
| 잘 돌던 시스템이 달라지면 최근 변경(배포, 설정)부터 봄 | https://sre.google/sre-book/effective-troubleshooting/ |

- 전체 수집 한도(`ingestion_rate_mb`)의 기본값은 문서에 없어서 쓰지 않았어요.
- 처음 쓴 "보통 한두 서비스가 대부분", "흔해요"는 근거가 없어 조건문과 가능성으로 고쳤어요.
- 함께 한 것: 퀴즈 4문제를 썼어요.
