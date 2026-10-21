# 사실 확인: 링크가 끊겼다 붙었다 할 때

- 글: src/content/docs/network/link-flapping.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| ifOperStatus 값(up = 패킷을 주고받을 준비, down 등), ifAdminStatus가 down이면 ifOperStatus도 down | https://www.rfc-editor.org/rfc/rfc2863 |
| ifLastChange = 지금 상태로 들어간 시각의 sysUpTime 값 | https://www.rfc-editor.org/rfc/rfc2863 |
| linkDown·linkUp Trap, ifLinkUpDownTrapEnable | https://www.rfc-editor.org/rfc/rfc2863 |

- 메모: 플래핑의 흔한 물리 원인(케이블, SFP, 속도·duplex 불일치, NIC)은 일반적인 점검 목록이에요. StatTile 숫자는 설명용이에요.
