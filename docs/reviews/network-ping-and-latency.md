# 사실 확인: ping과 지연·손실

- 글: src/content/docs/network/ping-and-latency.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 에코 요청의 데이터를 에코 응답에 그대로 돌려줌, ICMP는 처리 중 문제를 알림 | https://www.rfc-editor.org/rfc/rfc792.html |
| ping은 ECHO_REQUEST로 ECHO_RESPONSE를 받음, 왕복 시간·손실 통계, mdev는 표준 편차, DNS 실패로 달라질 수 있음 | https://man7.org/linux/man-pages/man8/ping.8.html |
| 계산 | (12 + 14 + 40) ÷ 3 = 22ms, 1 ÷ 4 = 25% |

- 고친 것: "방화벽이 ICMP만 막는 경우가 흔하다"를 "막을 수 있다"로 낮췄어요. 손실 1%가 "1초 넘게" 늦춘다는 단정을 "크게 늦어질 수 있다"로 바꿨어요.
