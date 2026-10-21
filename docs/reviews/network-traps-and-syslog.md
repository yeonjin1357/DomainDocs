# 사실 확인: SNMP Trap과 Syslog

- 글: src/content/docs/network/traps-and-syslog.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| Trap에는 확인이 없음, Inform은 확인이 있고 같은 request-id로 Response | https://www.rfc-editor.org/rfc/rfc3416.html "There is no confirmation associated with this notification delivery mechanism." |
| 알림 수신 UDP 162 | https://www.rfc-editor.org/rfc/rfc3417.html |
| linkDown·linkUp 뜻 | https://www.rfc-editor.org/rfc/rfc2863.html |
| 심각도 0~7 이름과 뜻, 시설 0~23, PRI = 시설 × 8 + 심각도 | https://www.rfc-editor.org/rfc/rfc5424.html |
| UDP 514 필수, UDP는 믿을 수 없음, 확인이 없어 다시 보낼 방법이 없음 | https://www.rfc-editor.org/rfc/rfc5426.html |
| TLS 전송 표준이 있음 | https://www.rfc-editor.org/rfc/rfc5425.html |
| 계산 | 23 × 8 + 3 = 187 |
