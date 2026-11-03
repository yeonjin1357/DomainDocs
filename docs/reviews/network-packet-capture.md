# 사실 확인: 패킷 캡처(tcpdump)

- 글: src/content/docs/network/packet-capture.mdx
- 확인일: 2026-11-03

실험: WSL Ubuntu 24.04(커널 6.18.33.2-microsoft-standard-WSL2)에 tcpdump 4.99.4·libpcap 1.10.4를 sudo 없이 풀고(apt-get download + dpkg -x), `unshare -rn`으로 만든 네트워크 네임스페이스의 루프백에서 실제로 잡았어요(`-Z root` 필요). netem으로 패킷마다 15ms 지연, ingress 필터로 5432 포트 SYN을 버림.

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 줄 모양 `20:44:57.583856 IP 10.0.1.5.47258 > 10.0.2.9.8080: Flags [S], seq …, length 0`, `[S.]`, `[.]`, `[P.]`, `[F.]`, `[R.]` | 실험 출력 |
| HTTP 요청 한 번: S → S. → . → P.(GET) → P.(200 OK) → F. | 실험 출력 |
| 닫힌 포트(9): `[S]` 뒤 15ms 만에 `[R.]` | 실험 출력 |
| 답을 버린 포트(5432): `[S]`가 +1.01s, +1.02s, +1.02s 뒤 되풀이, curl 4초에 포기(exit 28) | 실험 출력 |
| `tcp_syn_linear_timeouts` 기본 4, SYN RTO 1, 1, 1, 1, 1, 2, 4 | https://docs.kernel.org/networking/ip-sysctl.html, 실험 커널 값 4. 문서에 처음 나온 버전은 v6.5(v6.4 문서에는 없음, GitHub torvalds/linux 태그별 Documentation/networking/ip-sysctl.rst로 확인) |
| 기본 snapshot length 262144, `-n`은 주소·포트를 이름으로 안 바꿈, `-C` 기본 단위 백만 바이트, `-W`는 `-C`와 함께 돌려 씀, 저장 파일 읽기는 권한 불필요 | https://www.tcpdump.org/manpages/tcpdump.1.html, 실험 출력 `snapshot length 262144 bytes` |
| nstat 카운터 이름 `TcpRetransSegs`, `TcpExtTCPSynRetrans`, `TcpOutRsts` | 실험(WSL `nstat -az`) |

- 고친 것: SYN 재전송을 '처음 4번 1초'에서 문서대로 '1, 1, 1, 1, 1, 2, 4초'로, SNI는 '대개' 보인다로(ECH를 쓰면 안 보임).
