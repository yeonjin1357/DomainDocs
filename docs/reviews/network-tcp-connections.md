# 사실 확인: TCP 연결

- 글: src/content/docs/network/tcp-connections.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 3방향 핸드셰이크로 연결을 맺음, 재전송으로 모든 세그먼트 전달 | https://www.rfc-editor.org/rfc/rfc9293.html "The 'three-way handshake' is the procedure used to establish a connection.", "TCP uses retransmission to ensure delivery of every segment." |
| CLOSE-WAIT = 이쪽 사용자(앱)의 종료 요청을 기다림, TIME-WAIT, MSL 2분 | 같은 문서 3.3.2, 3.4.2 |
| RTO는 측정 전 1초, 만료 때 두 배, 최댓값은 60초 이상 | https://www.rfc-editor.org/rfc/rfc6298.html |
| 거부 = 듣는 쪽이 없음, 시간 초과 = 서버가 바빠 못 받을 수 있음, SYN 쿠키면 길어질 수 있음 | https://man7.org/linux/man-pages/man2/connect.2.html |
| ss로 상태별 연결을 봄 | https://man7.org/linux/man-pages/man8/ss.8.html |

- 고친 것: "RTO는 처음에 보통 1초"를 "표준은 측정 전 1초로 시작"으로 좁혔어요(실제 값은 왕복 시간으로 정하고 운영체제마다 최솟값이 달라요).
