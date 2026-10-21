# 사실 확인: 스위치와 라우터

- 글: src/content/docs/network/switches-and-routers.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 스위치는 보낸 쪽 주소로 포트를 배워 포워딩 표에 둠, 동적 항목은 시간이 지나면 지움 | https://www.rfc-editor.org/rfc/rfc4188.html dot1dTpFdbTable, dot1dTpAgingTime |
| 모르는 목적지는 받은 포트를 빼고 같은 VLAN의 모든 포트로 플러딩, 원인(비대칭 경로·스패닝 트리 변화·표 넘침) | https://www.cisco.com/c/en/us/support/docs/switches/catalyst-6000-series-switches/23563-143.html "flooded out of all forwarding ports in its VLAN (except the port it was received on)" |
| 라우터는 둘 이상의 인터페이스, 다음 장비를 경로 데이터베이스로 고름, 기본 경로는 접두 길이 0 | https://www.rfc-editor.org/rfc/rfc1812.html |
| 호스트는 연결된 네트워크면 직접, 아니면 게이트웨이로 | https://www.rfc-editor.org/rfc/rfc1122.html |

- 메모: L2·L3 스위치는 업계에서 흔히 부르는 이름이라 "불러요"로만 썼어요.
