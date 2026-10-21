# 사실 확인: 주소: IP, MAC, 포트

- 글: src/content/docs/network/addresses.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| IPv4 주소는 32비트 | https://www.rfc-editor.org/rfc/rfc791.html "Addresses are fixed length of four octets (32 bits)." |
| IPv6는 128비트 | https://www.rfc-editor.org/rfc/rfc8200.html |
| /숫자는 앞쪽 몇 비트가 네트워크 부분인지 | https://www.rfc-editor.org/rfc/rfc4632.html "the number of significant bits" |
| 사설 대역 세 개 | https://www.rfc-editor.org/rfc/rfc1918.html |
| ARP는 IP를 48비트 이더넷 주소로 바꿈 | https://www.rfc-editor.org/rfc/rfc826.html |
| 포트는 앱 서비스를 구별, 소켓 한 쌍이 연결을 정함, 소켓은 주소 + 포트 | https://www.rfc-editor.org/rfc/rfc9293.html, https://www.rfc-editor.org/rfc/rfc793.html "A pair of sockets uniquely identifies each connection." |

- 메모: 443(HTTPS)·5432(PostgreSQL)는 흔한 기본값이라 "보통"으로 썼어요. 클라이언트 포트를 운영체제가 고른다는 것도 "보통"으로 썼어요.
