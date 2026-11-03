# 사실 확인: 라우팅 프로토콜(OSPF·BGP)

- 글: src/content/docs/network/routing-protocols.mdx
- 확인일: 2026-11-03

| 확인한 주장 | 근거(URL) |
| --- | --- |
| OSPF HelloInterval의 근거리 망 예시 값 10초, RouterDeadInterval은 그 배수(예: 4), 두 값은 같은 망의 라우터끼리 같아야 함 | https://www.rfc-editor.org/rfc/rfc2328.html 부록 C.3 |
| 브로드캐스트·NBMA 망에서는 모든 라우터가 DR·BDR하고만 인접, 인접하지 않기로 하면 2-Way에서 멈춤 | 같은 문서 10.4 |
| `ospfNbrState` 값 down(1)~full(8) | https://www.rfc-editor.org/rfc/rfc4750.html |
| BGP는 TCP 179번 포트, 권장 Hold Time 90초, Keepalive는 Hold Time의 1/3 | https://www.rfc-editor.org/rfc/rfc4271.html 4·10장 |
| Active 상태는 TCP 연결을 기다리고 받아들이며 이웃을 얻으려는 상태 | 같은 문서 8.2.2 Active State |
| `bgpPeerState` 값 idle(1)~established(6), `bgpPeerFsmEstablishedTransitions`는 Established로 들어간 횟수, `bgpBackwardTransNotification`은 높은 번호에서 낮은 번호 상태로 갈 때 나가며 이웃 주소·마지막 에러·상태를 담음 | https://www.rfc-editor.org/rfc/rfc4273.html |

- 이웃이 끊기면 그 이웃에게 배운 길을 지운다는 설명은 RouterDeadInterval·HoldTime 정의에서 나온 교과서 동작이라 따로 원문을 대지 않았어요.
- 함께 한 것: 용어 routing-protocol, ospf, bgp를 올렸어요. 퀴즈 5문제를 썼어요.
