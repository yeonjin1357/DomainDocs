# 사실 확인: 링크와 장비 이중화(STP·LACP·VRRP)

- 글: src/content/docs/network/redundancy.mdx
- 확인일: 2026-11-03

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 옛 STP(802.1D)는 포트를 열기 전 forward delay 두 번(기본 15초 × 2)을 기다려 30초 끊김, RSTP는 잘 짜인 네트워크에서 몇백 밀리초 | https://www.cisco.com/c/en/us/support/docs/lan-switching/spanning-tree-protocol/24062-146.html |
| BRIDGE-MIB `dot1dStpPortState` 값 disabled(1)~broken(6), `dot1dStpTopChanges`는 토폴로지 변경 누적 수 | https://www.rfc-editor.org/rfc/rfc4188.html |
| 스패닝 트리 구성 변화는 플러딩이 늘어나는 흔한 원인 | 기존 network/switches-and-routers 글의 Cisco 근거(docs/reviews/network-switches-and-routers.md) |
| EtherChannel 해시는 결정적이라 같은 주소·세션은 늘 같은 포트, 순서 뒤섞임을 막음 | https://www.cisco.com/c/en/us/support/docs/lan-switching/etherchannel/12023-4.html |
| bonding 802.3ad 모드는 속도·duplex가 같은 링크로 묶음, 연결 하나는 여러 멤버에 걸치지 않음 | https://www.kernel.org/doc/html/latest/networking/bonding.html |
| VRRP 알림 기본 간격 1초, Master_Down_Interval = 3 × 간격 + Skew_Time, Skew_Time = (256 − 우선순위) × 간격 ÷ 256, 대기 라우터 기본 우선순위 100 → 약 3.61초 | https://www.rfc-editor.org/rfc/rfc5798.html 5.2.7, 6.1, 4.1 예시 |
| VRRP는 HSRP와 비슷한 기능, HSRP는 Cisco 전용 | 같은 문서 1장 |

- "이더넷 프레임에는 TTL 같은 수명 칸이 없다"는 교과서 내용이라 따로 원문을 대지 않았어요.
- 함께 한 것: 용어 stp, lacp, vrrp를 올렸어요. 퀴즈 5문제를 썼어요.
