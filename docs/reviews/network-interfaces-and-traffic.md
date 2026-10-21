# 사실 확인: 인터페이스와 트래픽

- 글: src/content/docs/network/interfaces-and-traffic.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| ifInOctets·ifHCInOctets(64비트 판), ifInErrors·ifInDiscards 뜻(버퍼 공간 예), ifSpeed 한계와 ifHighSpeed(Mbps), ifAdminStatus(원하는 상태)·ifOperStatus(지금 상태) | https://www.rfc-editor.org/rfc/rfc2863.html |
| 20Mbps 이하 32비트, 650Mbps 이상 64비트 카운터 | 같은 문서 3.1.6 |
| 재초기화 때 카운터가 끊김, ifCounterDiscontinuityTime | 같은 문서 |
| 계산 | 3,750,000,000 × 8 ÷ 60 = 500,000,000bps. 2^32 ÷ 125,000,000 ≈ 34.4초, 10Gbps면 ≈ 3.4초. 2^64 ≈ 1,845경, 1Gbps에서 ≈ 4,700년, 10Gbps에서 ≈ 470년 |

- 메모: 방향마다 사용률을 따로 계산하는 건 보통의 전이중 링크를 전제로 "보통"이라고 썼어요. 오류에 물리 문제를 먼저 의심한다는 건 "흔히"로 썼어요.
