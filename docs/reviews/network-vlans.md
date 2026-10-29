# 사실 확인: VLAN

- 글: src/content/docs/network/vlans.mdx
- 확인일: 2026-10-29

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 802.1Q 태그는 4바이트, 보낸 MAC 뒤에 끼고 FCS를 다시 계산, TPID 0x8100, 우선순위 3비트·CFI 1비트·VID 12비트(0~4095) | https://www.cisco.com/c/en/us/support/docs/lan-switching/8021q/17056-741-4.html |
| 트렁크 양쪽의 네이티브 VLAN은 같아야 하고, 네이티브 VLAN은 태그 없이 다님 | 같은 문서 |
| VLAN 번호 1~4094, 네이티브 VLAN 기본값 VLAN 1, 트렁크는 기본으로 모든 VLAN 허용, VLAN 사이 트래픽은 라우팅해야 함 | https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst2960/software/release/12-2_58_se/configuration/guide/2960scg/swvlan.html |
| 일반 범위 1~1005, 확장 범위 1006~4094, 1002~1005는 토큰 링·FDDI 예약, VLAN 1은 지울 수 없음 | https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst9500/software/release/17-7/configuration_guide/vlan/b_177_vlan_9500_cg/configuring_vlans.html |
| VLAN 관리용 표준 MIB가 RFC 4363(Q-BRIDGE-MIB) | https://www.rfc-editor.org/rfc/rfc4363.html |

- SVI는 Cisco가 쓰는 이름이라 "Cisco는 이렇게 불러요"로만 썼어요.
- 「모니터링에서는」의 인터페이스 이름(Gi1/0/1, Vlan10)은 예시예요.
- 함께 한 것: 용어 vlan, vlan-tag, access-port, trunk-port, native-vlan, svi를 올리고, 네트워크 개요와 「스위치와 라우터」에 이 글을 이었어요. 퀴즈 5문제를 썼어요.
