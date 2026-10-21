# 사실 확인: DNS

- 글: src/content/docs/network/dns.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 이름 공간은 나무 구조, 레이블 63바이트까지, 네임 서버는 일부를 맡고 다른 서버를 가리킴, 리졸버는 네임 서버에 물어 답을 모음(참조를 따라감), TTL은 캐시 시간 | https://www.rfc-editor.org/rfc/rfc1034 |
| A·NS·CNAME·MX 뜻, TTL 0은 캐시하지 말라는 뜻, UDP·TCP 53번 | https://www.rfc-editor.org/rfc/rfc1035 |
| AAAA = IPv6 주소 하나 | https://www.rfc-editor.org/rfc/rfc3596 |
| "없다"는 답도 캐시(부정 캐시) | https://www.rfc-editor.org/rfc/rfc2308 |
| nameserver 3개까지, search, timeout 기본 5초, attempts 기본 2 | https://man7.org/linux/man-pages/man5/resolv.conf.5.html |

- 메모: 루트→com→example.com 순서 그림은 반복 질의를 단순하게 그린 거예요. "5초, 10초로 딱 떨어지는 지연"은 기본 timeout에서 나온 설명이에요.
