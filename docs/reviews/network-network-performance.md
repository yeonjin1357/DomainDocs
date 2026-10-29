# 사실 확인: 네트워크 성능 모니터링(NPM)

- 글: src/content/docs/network/network-performance.mdx
- 확인일: 2026-10-29

| 확인한 주장 | 근거(URL) |
| --- | --- |
| tcpRetransSegs는 이미 보낸 바이트를 하나 이상 담아 다시 보낸 조각 수, tcpOutSegs는 재전송한 바이트만 담은 조각을 뺀 보낸 조각 수 | https://www.rfc-editor.org/rfc/rfc4022.html |
| ss -i의 rtt:<rtt>/<rttvar>는 평균 왕복 시간과 평균 편차(ms) | https://man7.org/linux/man-pages/man8/ss.8.html |
| eBPF는 커널 소스를 고치거나 모듈을 올리지 않고 커널 안에서 프로그램을 돌림, 붙이기 전에 verifier가 안전을 검사, 관측에 낮은 부담 | https://ebpf.io/what-is-ebpf/ |

- 재현(WSL Ubuntu, iproute2 6.1.0, 읽기만 함): `ss -tin`으로 실제 연결 하나의 `rtt:236.89/89.307 … minrtt:236.599 … cwnd:10 … unacked:2`를 봤고, `/proc/net/snmp`의 Tcp 줄에서 `OutSegs`, `RetransSegs` 이름을 확인했어요.
- OnDashboard와 그래프의 숫자(38ms, 3.1% 등)는 예시예요.
- 함께 한 것: 용어 npm, ebpf를 올리고, 네트워크 개요와 「TCP 연결」에 이 글을 이었어요. 퀴즈 5문제를 썼어요.
