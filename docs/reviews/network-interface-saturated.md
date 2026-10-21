# 사실 확인: 인터페이스가 꽉 찼을 때

- 글: src/content/docs/network/interface-saturated.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| ifOutDiscards = 오류는 없지만 내보내지 않고 버린 패킷, 예: 버퍼 공간 확보 | https://www.rfc-editor.org/rfc/rfc2863 |
| ifHighSpeed = Mbps 단위 속도 | https://www.rfc-editor.org/rfc/rfc2863 |

- 메모: 사용률 계산과 64비트 카운터는 network/interfaces-and-traffic의 근거를 따랐어요. 평균이 짧은 폭주를 지운다는 건 foundations/aggregation-and-downsampling과 같은 원리예요. NetFlow·sFlow로 상위 사용자를 찾는다는 건 일반 설명이에요. 그래프 숫자는 설명용이에요.
