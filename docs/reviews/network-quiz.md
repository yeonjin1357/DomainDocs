# 사실 확인: 네트워크 퀴즈

- 문제: src/content/quizzes/network/*.yaml (14개 파일, 67문제)
- 확인일: 2026-10-21
- 방법: 숫자·기본값·표준의 정의가 든 문제만 골라, 그 문제가 기대는 글의 문장과 글의 검토 기록 근거에 맞춰 봤어요. 글에 없는 새 주장은 넣지 않았어요.

| 문제(파일 · id) | 확인한 주장 | 근거 |
| --- | --- | --- |
| addresses · same-subnet, private-ip-overlap | /24는 앞 24비트가 네트워크 부분, 사설 대역은 조직마다 따로 씀(RFC 1918) | 글 본문·Deeper와 docs/reviews/network-addresses.md |
| dns · five-second-delay, ttl-old-answer, negative-cache, a-record | resolv.conf timeout 기본 5초, TTL 동안 캐시, 부정 캐시, A = IPv4·AAAA = IPv6 | 글 본문과 docs/reviews/network-dns.md |
| switches-and-routers · unknown-mac-flood, mac-aging, default-route | 모르는 MAC은 받은 포트 빼고 플러딩, 에이징, 0.0.0.0/0은 모든 주소에 맞는 기본 경로 | 글 본문과 docs/reviews/network-switches-and-routers.md |
| interfaces-and-traffic · octets-to-bps, counter-wrap, admin-down-ok | 3,750,000,000 × 8 ÷ 60 = 500Mbps, 32비트 카운터는 1Gbps에서 약 34초에 한 바퀴, 관리 상태 down은 정상 | 글 본문과 docs/reviews/network-interfaces-and-traffic.md |
| snmp · agent-port, vendor-oid, uptime-dropped, community-plaintext | 에이전트 UDP 161, Trap 162, Syslog 514, CPU 등은 벤더 MIB, sysUpTime은 재시작 뒤 흐른 시간, v1·v2c 커뮤니티는 평문 | 글 본문과 docs/reviews/network-snmp.md |
| traps-and-syslog · severity-direction, inform-acked | 심각도 0(Emergency)~7(Debug), Inform은 Response로 확인 | 글 본문과 docs/reviews/network-traps-and-syslog.md |
| tcp-connections · close-wait-app, time-wait-normal, retransmit-spikes | CLOSE-WAIT는 이쪽 앱이 닫아야 끝남, TIME-WAIT는 정상, RTO 1초 시작·두 배씩 늘림(RFC 6298) | 글 본문과 docs/reviews/network-tcp-connections.md |
| ping-and-latency · loss-and-average, mdev-meaning | 4개 중 3개 → 손실 25%, (12+14+40)÷3 = 22ms, mdev는 표준 편차 | 글 Deeper(계산)와 docs/reviews/network-ping-and-latency.md |
| device-unreachable · uptime-reset | 가동 시간이 줄면 재시작 | 글 본문과 docs/reviews/network-device-unreachable.md |
| errors-and-discards · error-ratio, duplex-mismatch | 3,000 ÷ 600,000 = 0.5%, 이중 통신 불일치 시 한쪽 FCS·다른 쪽 늦은 충돌 | 글 본문과 docs/reviews/network-errors-and-discards.md |
| latency-and-loss · middle-hop-loss, traceroute-how | 라우터는 ICMP 오류 양을 제한할 수 있음(RFC 1812), traceroute는 TTL을 늘리며 시간 초과 답을 받음 | 글 본문과 docs/reviews/network-latency-and-loss.md |
