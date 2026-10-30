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

## 2026-10-30 문제 다시 쓰기

- 문제: src/content/quizzes/network/*.yaml (21개 파일, 102문제)
- 바꾼 까닭: OX 정답의 O가 21%, 정답이 가장 긴 보기인 객관식이 60%였어요. "봐도 되나요", "볼 수 있나요", "의심할 만한가요" 같은 물음과 부정으로 묻는 문제("~아닌 것은?"), 엉뚱한 오답("PC의 화면 해상도", "장비 이름의 알파벳 순서")이 있었어요.
- 고친 뒤: OX 27문제 중 O 12(44%), 객관식 63문제 중 정답이 가장 긴 보기 18(29%), 정답이 가장 긴 오답의 1.2배를 넘는 문제 0개예요.
- 새로 들어간 주장은 모두 글 본문에 있는 내용을 다르게 물은 거예요. 계산(받는·보내는 쪽 각 600Mbps → 방향마다 60%, 누적 32만이어도 한 시간 증가 0이면 지금 에러 없음)은 글의 정의 그대로예요.
- 방화벽 문제의 오답으로 넣은 커널 메시지("Possible SYN flooding on port 443. Sending cookies.")는 리눅스 커널의 tcp_input.c가 남기는 문구를 줄인 거예요. 오답이라 정확한 전체 문구는 따지지 않았어요.

### 주관식 채점 결함(모든 영역)

주관식에 `term`을 이으면 그 용어의 이름과 별칭도 정답으로 받아요(src/lib/quiz/bank.ts). 이 때문에 아래처럼 틀린 답을 정답으로 받는 문제가 26개 있었어요. 모두 `term`을 빼고, 맞는 다른 표기만 `answer`에 직접 더했어요.

- 문제 글에 든 말이 정답이 됨: network/tcp-connections handshake-name("SYN"), network/tls-certificates chain-term("중간 인증서"), network/overview interface-name("포트"), kubernetes/cluster-dns ndots-name("검색 도메인"), database/plan-changed analyze-term("통계")
- 다른 개념이 정답이 됨: messaging broker-name("KRaft", "컨트롤러"), messaging isr-name("min.insync.replicas"), messaging rebalance-name(설정 이름), messaging idempotent-name("enable.idempotence"), apm cache eviction-term("LRU"), apm circuit-breaker breaker-name("Resilience4j"), apm jvm-memory heap-name("Xmx"), apm synthetic-term("랩 데이터"), apm reverse-proxy-name("게이트웨이"), apm pool-exhausted connection-leak-name("leakDetectionThreshold"), apm memory-growing heap-dump-name("GC.heap_dump"), apm page-load rum-name("필드 데이터"), apm rum source-map-name(".map"), kubernetes limitrange-name("defaultRequest"), kubernetes endpointslice-name("Endpoints"), kubernetes scc-name("restricted-v2"), database work-mem-name("hash_mem_multiplier"), database pruning-name("Subplans Removed"), logs live-tail-name("tail -f"), network/dns resolver-name("resolv.conf"), cloud throttling-term("429")
- network/flows ipfix-name는 앞서 따로 고쳤어요("NetFlow v9"가 정답이 됐어요).
- 고친 뒤 모든 주관식에서 정답으로 받는 말이 문제 글에 들어 있는 경우는 0개예요.
