# 사실 확인: 로그 샘플링

- 글: src/content/docs/logs/sampling.mdx
- 확인일: 2026-11-04

| 확인한 주장 | 근거(URL) |
| --- | --- |
| Vector sample: `rate`(1/N), `key_field`(값을 해시해 같은 값끼리 함께 샘플링, 트랜잭션의 로그를 함께), `exclude`(샘플링에서 뺄 조건), `sample_rate_key`(기본 `sample_rate`), 값이 고르지 않으면 실제 비율이 벗어날 수 있음 | https://vector.dev/docs/reference/configuration/transforms/sample/ |
| journald 기본 30초에 1만 개, 서비스마다 따로, 넘으면 구간이 끝날 때까지 버리고 버린 수를 남김, 여유 공간에 따른 배수(log2) | https://www.freedesktop.org/software/systemd/man/latest/journald.conf.html |
| 배수 식 `burst × (log2(여유) − 16) / 4`, 1MB 이하면 그대로, "Suppressed %i messages from %s" | systemd v255 src/journal/journald-rate-limit.c(burst_modulate), journald-server.c |

직접 돌려 본 것:

- Vector 0.61.0(WSL): 요청 1만 개 × 5줄(요청 100개는 다섯째 줄이 error)을 stdin으로 넣음.
  - `rate = 10`만: 5,000줄 남음, 5줄이 다 남은 요청 0개, 일부만 남은 요청 5,000개, 에러 줄 0개(10번째 줄마다 남김).
  - `rate = 10`, `key_field = "trace_id"`, `exclude = '.level == "error"'`: 4,963줄, 다 남은 요청 974개, 일부만 남은 요청 93개, 에러 줄 100개, 실패 요청 중 다섯 줄이 다 남은 것 7개. 남긴 줄의 `sample_rate`는 "10", 에러 줄에는 없음.
  - 에러 줄 비율: 그대로 2.01%, 실제 0.20%, `sample_rate`로 되돌리면 0.21%.
- journald(WSL Ubuntu 24.04, systemd 255): `systemd-run`으로 5만 줄 → 37,500줄 남음(저널 여유 3.2GB, log2 31 → 10,000 × 15 / 4). 32초 뒤 한 줄을 더 쓰자 `Suppressed 12500 messages from logflood2-281.service`가 남음.
