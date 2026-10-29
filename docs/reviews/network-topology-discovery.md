# 사실 확인: 토폴로지 자동 발견(LLDP·CDP)

- 글: src/content/docs/network/topology-discovery.mdx
- 확인일: 2026-10-29

| 확인한 주장 | 근거(URL) |
| --- | --- |
| LLDP 기본 전송 간격 30초, 배수 4, TTL = 간격 × 배수(120초) | http://ieee802.org/1/files/public/MIBs/LLDP-MIB-200505060000Z.mib |
| 이웃 정보는 lldpRemTable에 쌓이고 lldpRemChassisId, lldpRemPortId, lldpRemSysName으로 이웃을 나타냄 | 같은 MIB |
| LLDP는 IEEE 802.1AB의 제조사 중립 규약, 기본 보관 120초·전송 30초, 기본으로 보내는 정보 목록 | https://www.cisco.com/c/en/us/td/docs/switches/datacenter/sw/5_x/nx-os/system_management/configuration/guide/sm_nx_os_cg/sm_lldp.html |
| CDP 기본 전송 60초, 보관 180초 | https://www.cisco.com/c/en/us/td/docs/switches/lan/catalyst2960/software/release/12-2_55_se/configuration/guide/scg_2960/swcdp.html |

- 「바로 옆에서 멈추는 이유」: LLDP가 다리(bridge)가 넘기지 않는 예약 주소(01-80-C2-00-00-0E, nearest bridge)로 간다는 내용은 IEEE 802.1AB 표를 인용한 Linux netdev 메일링 리스트에서 확인했어요(https://lists.openwall.net/netdev/2011/10/17/82). 표준 원문을 직접 보지 못해서 글에는 주소 값을 쓰지 않았어요.
- 처음 쓴 Deeper에는 "LLDP가 기본으로 켜져 있는지는 장비마다 다르다"는 문장이 있었어요. 검색 요약으로만 본 내용이라 지웠어요.
- 함께 한 것: 용어 lldp, cdp, topology를 올리고, 네트워크 개요와 「SNMP」에 이 글을 이었어요. 퀴즈 5문제를 썼어요.
