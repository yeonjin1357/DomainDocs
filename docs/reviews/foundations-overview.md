# 사실 확인: 숫자가 그래프와 알림이 되기까지

- 글: src/content/docs/foundations/overview.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 지표는 이름과 키·값 레이블로 구별되는 시계열로 저장, Prometheus는 대상에서 값을 가져가는(pull) 방식 | https://prometheus.io/docs/introduction/overview/ |
| 메트릭·로그·트레이스의 구분, 트레이스는 요청 하나가 지나간 길 | https://opentelemetry.io/docs/concepts/observability-primer/ |
| 모니터링은 증상(무엇이 깨졌나)과 원인(왜)을 나눠 보고, 사람을 부르는 알림은 증상에 검 | https://sre.google/sre-book/monitoring-distributed-systems/ |

- 메모: 이 글은 영역 안내 글이라 새 숫자나 기본값을 쓰지 않았어요. 단계마다의 주장은 이어 둔 각 글과 그 검토 기록에 근거가 있어요.
- 함께 한 것: 이 영역에 한눈에 보기 글이 없어 홈의 "처음이라면 여기부터"에 모니터링 기초가 빠져 있었어요. 이 글을 order 0으로 더하고, 퀴즈 4문제를 함께 넣었어요.
