# 사실 확인: 흐름 정보(NetFlow·sFlow)

- 글: src/content/docs/network/flows.mdx
- 확인일: 2026-10-23

| 확인한 주장 | 근거(URL) |
| --- | --- |
| Flow는 일정 시간 한 관찰 지점을 지난, 공통 속성을 가진 패킷의 모임 | https://www.rfc-editor.org/rfc/rfc7011 |
| IPFIX 버전 번호는 10(0x000a), NetFlow v9의 버전에 1을 더한 값 | https://www.rfc-editor.org/rfc/rfc7011 |
| IPFIX 수집기는 기본으로 SCTP·TCP·UDP 4739(보안 연결은 4740)에서 받음 | https://www.rfc-editor.org/rfc/rfc7011 |
| 템플릿보다 먼저 온 데이터 기록은 잠시 쌓아 두고 나중에 읽어도 됨(MAY) | https://www.rfc-editor.org/rfc/rfc7011 |
| 흐름이 끝나는 경우: 일정 시간 패킷 없음, 자원 부족, 긴 흐름을 주기적으로 끊음 | https://www.rfc-editor.org/rfc/rfc5470 |
| NetFlow v9는 Cisco 형식(Informational RFC), 템플릿 기반 | https://www.rfc-editor.org/rfc/rfc3954 |
| IPFIX 정보 요소 1~127은 NetFlow v9 필드와 호환 | https://www.rfc-editor.org/rfc/rfc7012 |
| sFlow는 카운터를 줄여 가며 패킷을 뜨고(1/N), 카운터 샘플링도 함, 기본 UDP 6343, drops 필드 | https://sflow.org/sflow_version_5.txt |
| 100만 개 중 0.25%(2,500개) 표본, 그중 1,000개면 40만 개로 어림, 표본 9개면 오차 65% | https://sflow.org/packetSamplingBasics/index.htm |

- 메모: 흐름이 끝났다고 보는 시간과 긴 흐름을 끊는 주기의 기본값은 장비마다 달라서 숫자를 쓰지 않았어요.
- 메모: 화면 그림(SNMP 820Mbps, 흐름 합계 790Mbps)과 퀴즈의 2MB×1,000은 예시 숫자예요.
- 함께 한 것: 용어 `network/flow`, `network/netflow`, `network/sflow`를 더했고, 퀴즈 5문제를 썼어요.
