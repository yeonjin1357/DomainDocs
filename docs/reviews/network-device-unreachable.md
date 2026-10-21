# 사실 확인: 장비가 응답 없음으로 보일 때

- 글: src/content/docs/network/device-unreachable.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| coldStart = 다시 시작하며 설정이 바뀌었을 수 있음, warmStart = 설정 그대로 다시 시작 | https://www.rfc-editor.org/rfc/rfc3418 |
| 명령 응답자는 UDP 161, 알림 수신자는 UDP 162에서 기다리기를 권장 | https://www.rfc-editor.org/rfc/rfc3417 |
| 라우터는 ICMP 오류 메시지 양을 제한할 수 있어야 함 | https://www.rfc-editor.org/rfc/rfc1812 |

- 메모: sysUpTime이 작아지면 재시작이라는 것과 Trap이 UDP라 사라질 수 있다는 건 network/snmp·traps-and-syslog의 근거를 따랐어요. ping·SNMP 짝표와 흔한 원인(커뮤니티, ACL, 방화벽, 장비 CPU)은 일반적인 점검 순서예요.
