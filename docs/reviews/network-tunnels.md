# 사실 확인: 터널과 오버레이(VPN·VXLAN)

- 글: src/content/docs/network/tunnels.mdx
- 확인일: 2026-11-03

| 확인한 주장 | 근거(URL) |
| --- | --- |
| VXLAN은 바깥 IPv4·UDP·VXLAN 머리(8바이트) 안에 안쪽 이더넷 프레임을 넣음. 안쪽 IP보다 20+8+8+14=50바이트 큼 | https://www.rfc-editor.org/rfc/rfc7348.html (Section 5 형식) |
| VTEP은 VXLAN 패킷을 쪼개지 않아야 하고, 쪼갠 조각은 조용히 버려도 됨. 물리 네트워크 MTU를 감싼 크기에 맞추길 권하고, PMTUD도 쓸 수 있음 | 같은 문서 |
| GRE 머리는 기본 4바이트(C·Reserved0·Ver·Protocol Type), 체크섬은 선택 | https://www.rfc-editor.org/rfc/rfc2784.html |
| PMTUD: DF를 붙여 보내고, 쪼개야 하면 라우터가 버리고 fragmentation needed(Datagram Too Big)를 Next-Hop MTU와 함께 돌려보냄 | https://www.rfc-editor.org/rfc/rfc1191.html |
| IPv6는 Packet Too Big 메시지(ICMPv6 type 2) | https://www.rfc-editor.org/rfc/rfc4443.html |
| 방화벽이 ICMP를 모두 막으면 보내는 쪽이 줄일 줄 모르고 큰 패킷을 계속 보내 PMTUD 블랙홀에 빠짐 | https://www.rfc-editor.org/rfc/rfc2923.html |
| --clamp-mss-to-pmtu는 MSS를 경로 MTU − 40(IPv4), −60(IPv6)으로 고정, SYN에 거는 예시 | https://ipset.netfilter.org/iptables-extensions.man.html (TCPMSS) |
| WSL(iputils 20240117, eth0 MTU 1500)에서 `ping -M do -s 1472 -c 1 1.1.1.1`은 응답, `-s 1473`은 "1473(1501) bytes" 뒤 "local error: message too long, mtu=1500" | 직접 실행 |
| Flannel VXLAN이 파드 MTU를 장치 MTU − 50으로 잡음 | kubernetes-pod-network.md 검토 기록 |

- 시퀀스 그림의 1,500바이트 응답과 ICMP 차단 흐름은 설명용 예시예요.
