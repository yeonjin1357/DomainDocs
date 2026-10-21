# 사실 확인: 보관과 정리

- 글: src/content/docs/messaging/retention.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 읽어도 지우지 않고 토픽별 기간 뒤 버림, 성능이 데이터 크기와 무관해 오래 보관 가능 | https://kafka.apache.org/43/getting-started/introduction/ |
| retention.ms 7일·-1이면 무제한·"컨슈머가 읽어야 하는 SLA", retention.bytes -1, cleanup.policy delete, segment.bytes 1GiB, delete.retention.ms 1일 | https://kafka.apache.org/43/configuration/topic-configs/ |
| 파티션 = 디렉터리, 세그먼트 단위 삭제, 시간 기준은 세그먼트의 가장 큰 타임스탬프 | https://kafka.apache.org/43/implementation/log/ |
| 압축 = 키마다 최소 마지막 값 유지, 오프셋 불변, 툼스톤(키+빈 값)은 일정 시간 뒤 지워짐, 활성 세그먼트는 압축 안 함 | https://kafka.apache.org/43/design/design/ |
| 커밋 위치가 지워졌으면 auto.offset.reset을 따름 | https://kafka.apache.org/43/configuration/consumer-configs/ |

- 메모: delete와 compact를 함께 주는 것은 cleanup.policy 설명의 일반 내용이에요. "보관 기간을 줄여도 바로 안 줄어든다"는 세그먼트 단위 삭제에서 나온 설명이에요.
