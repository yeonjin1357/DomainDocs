# 사실 확인: SNMP

- 글: src/content/docs/network/snmp.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 관리 노드마다 SNMP 개체, 관리 서버가 하나 이상, MIB는 관리 객체 모음, OID 배정 | https://www.rfc-editor.org/rfc/rfc3410.html |
| v1·v2c는 평문 커뮤니티 문자열, 근본적으로 안전하지 않음, v3를 강하게 권장 | 같은 문서 8.2, Abstract |
| 요청 종류(Get, GetNext, GetBulk, Set, Response) | https://www.rfc-editor.org/rfc/rfc3416.html |
| 에이전트 UDP 161, 알림 수신 UDP 162 | https://www.rfc-editor.org/rfc/rfc3417.html |
| sysUpTime = 관리 기능 재초기화 뒤 0.01초 단위 시간, { system 3 } | https://www.rfc-editor.org/rfc/rfc3418.html |
| 재초기화 때 카운터가 끊김 | https://www.rfc-editor.org/rfc/rfc2863.html |

- 메모: mib-2 = 1.3.6.1.2.1, interfaces = mib-2 2는 MIB-II 배정이에요. 벤더 MIB는 enterprises 아래에 제조사마다 정해요. 답이 없을 때 다시 묻는 건 관리 서버 구현에 따라 달라서 "보통"으로 썼어요.
