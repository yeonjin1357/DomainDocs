# 사실 확인: 방화벽과 NAT

- 글: src/content/docs/network/firewalls-and-nat.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 전통적 NAT = Basic NAT(주소만) + NAPT(주소와 TCP/UDP 포트), NAPT는 여러 주소·포트를 주소 하나와 그 포트로 바꿈, 세션은 사설 쪽에서 밖으로 나가는 방향(반대는 고정 매핑으로 예외), 한 세션의 요청과 응답은 같은 NAT 라우터를 지나야 함 | https://www.rfc-editor.org/rfc/rfc3022 |
| 사설 주소 경로 정보는 인터넷 쪽 라우터에서 걸러짐(인터넷으로 내보내지 않는 주소) | https://www.rfc-editor.org/rfc/rfc1918 |
| iptables: 규칙에 맞지 않으면 다음 규칙을 보고, 맞으면 타깃(ACCEPT·DROP 등)이 정함, DROP은 패킷을 버림 | https://man7.org/linux/man-pages/man8/iptables.8.html |
| REJECT는 오류 패킷을 돌려보내고 그 밖에는 DROP과 같음(icmp-port-unreachable 등), conntrack 상태 NEW·ESTABLISHED·RELATED·INVALID의 뜻 | https://man7.org/linux/man-pages/man8/iptables-extensions.8.html |
| nf_conntrack_count(지금 항목 수), nf_conntrack_max(기본 = nf_conntrack_buckets), buckets는 메모리 ÷ 16384로 정하고 1,024~262,144, /proc/sys/net/netfilter/ 아래, nf_conntrack_tcp_timeout_established 기본 432000초(5일) | https://docs.kernel.org/networking/nf_conntrack-sysctl.html |
| 표가 꽉 차면 "nf_conntrack: table full, dropping packet" 로그를 남기고 패킷을 버림 | https://github.com/torvalds/linux/blob/master/net/netfilter/nf_conntrack_core.c |
| 보안 그룹은 stateful(보낸 요청의 응답은 들어오는 규칙과 상관없이 허용), 허용 규칙만 둠 | https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html |
| NAT 게이트웨이는 350초 이상 쉰 연결을 끊고, 이어 보내면 RST를 돌려줌, 해결책은 트래픽을 보내거나 keepalive를 350초보다 짧게, 목적지별 동시 연결 한도에 닿으면 새 연결을 못 맺음 | https://docs.aws.amazon.com/vpc/latest/userguide/nat-gateway-troubleshooting.html |

- 메모: REJECT 응답을 받은 앱의 오류는 응답 종류에 따라 연결 거부나 도달 불가로 보여요. 그림의 숫자(262,144, 1,200/분)는 설명용 예시예요. "규칙 맞추는 방식은 제품마다 다름"은 iptables와 AWS 보안 그룹을 예로 들었어요.
- 함께 고친 것: network/overview에 안내 한 줄, network/tcp-connections "연결 실패 두 가지"에 방화벽이 두 오류를 만드는 문장과 링크, network/device-unreachable의 "방화벽"을 용어로 이음. 용어 3개(firewall, nat, conntrack)와 퀴즈 5문제 추가.
