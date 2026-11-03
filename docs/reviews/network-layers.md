# 사실 확인: 네트워크 계층(L2·L3·L4·L7)

- 글: src/content/docs/network/layers.mdx
- 확인일: 2026-11-03

| 확인한 주장 | 근거(URL) |
| --- | --- |
| OSI 일곱 층의 이름과 번호(응용 7, 표현 6, 세션 5, 전송 4, 네트워크 3, 데이터 링크 2, 물리 1) | https://www.itu.int/rec/T-REC-X.200-199407-I (X.200 7장 목차, "Application Layer (layer 7)" 목록) |
| 인터넷 프로토콜 계층은 응용, 전송, 인터넷, 링크 넷 | https://www.rfc-editor.org/rfc/rfc1122.html 1.1.3 |
| UDP 머리는 8바이트(Length 최솟값 8) | https://www.rfc-editor.org/rfc/rfc768.html "the minimum value of the length is eight" |
| 옵션 없는 IPv4 머리 20바이트(IHL 최솟값 5 × 32비트) | https://www.rfc-editor.org/rfc/rfc791.html "the minimum value for a correct header is 5" |
| 옵션 없는 TCP 머리 20바이트, 상대가 MSS를 안 알리면 IPv4 536(576 − 40) | https://www.rfc-editor.org/rfc/rfc9293.html 3.7.1 |
| 이더넷으로 보내는 IP 패킷 최대 1,500바이트 → MSS 1,460 | https://www.rfc-editor.org/rfc/rfc894.html "the maximum length of an IP datagram sent over an Ethernet is 1500 octets" |
| ifInOctets는 framing characters까지 셈 | https://www.rfc-editor.org/rfc/rfc2863.html ifInOctets 정의 |
| ALB는 7계층, NLB는 4계층 | 기존 docs/reviews/cloud-load-balancers.md와 같은 AWS 문서 |
| NLB CloudWatch 지표에는 HTTP 상태 코드 지표가 없음 | https://docs.aws.amazon.com/elasticloadbalancing/latest/network/load-balancer-cloudwatch-metrics.html (HTTPCode 계열 없음, TCP_ELB_Reset_Count 등만 있음) |

- 라우터가 L2 머리표를 바꾸고 IP 주소는 그대로라는 설명은 교과서 내용이라 RFC 1122(호스트는 다른 네트워크로 보낼 때 게이트웨이로 보냄)와 기존 switches-and-routers 글의 설명으로 맞췄어요.
- 함께 한 것: 용어 osi-model, encapsulation, mtu, udp를 올렸어요. 퀴즈 5문제를 썼어요.
