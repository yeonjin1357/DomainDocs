# 사실 확인: 지연·손실이 늘 때

- 글: src/content/docs/network/latency-and-loss.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| traceroute는 TTL을 1부터 늘려 ICMP time exceeded를 받고, 단계마다 3번 재고, 답이 없으면 * | https://man7.org/linux/man-pages/man8/traceroute.8.html |
| ICMP Time Exceeded 메시지 | https://www.rfc-editor.org/rfc/rfc792 |
| 라우터는 ICMP 오류 메시지 양을 제한할 수 있어야 함 | https://www.rfc-editor.org/rfc/rfc1812 |

- 메모: 중간 구간 하나의 손실이 진짜 손실이 아닐 수 있다는 것, 가는 길과 오는 길이 다를 수 있다는 것은 널리 알려진 traceroute 읽는 법이에요. 워터폴 숫자는 설명용이에요.
