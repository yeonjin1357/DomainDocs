# 사실 확인: 오류·버린 패킷이 늘 때

- 글: src/content/docs/network/errors-and-discards.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| ifInErrors = 오류로 위로 넘기지 못한 받은 패킷, ifInDiscards·ifOutDiscards = 오류 없이 버린 패킷(예: 버퍼 확보) | https://www.rfc-editor.org/rfc/rfc2863 |
| dot3StatsFCSErrors = FCS 검사를 통과하지 못한 프레임, dot3StatsLateCollisions = 늦은 충돌, dot3StatsDuplexStatus = 현재 이중 통신 모드 | https://www.rfc-editor.org/rfc/rfc3635 |

- 메모: duplex 불일치 때 한쪽은 FCS 오류, 다른 쪽은 늦은 충돌이 는다는 건 널리 알려진 현상이라 일반 설명으로 적었어요(RFC에는 카운터 정의만 있어요). 물리 원인 목록도 일반 점검 목록이에요. 예시 숫자는 설명용이에요.
