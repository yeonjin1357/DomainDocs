# 사실 확인: 보관 기간과 비용

- 글: src/content/docs/logs/retention-and-cost.mdx
- 확인일: 2026-10-29

| 확인한 주장 | 근거(URL) |
| --- | --- |
| CloudWatch Logs는 기본으로 무기한 보관, 로그 그룹마다 기간, 기간이 지나도 보통 최대 72시간 뒤 삭제, 삭제로 표시되면 보관 비용에서 빠짐, 태그로 비용 추적, PutLogEvents는 14일보다 오래되거나 2시간보다 미래인 로그를 거절 | https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/Working-with-log-groups-and-streams.html |
| Loki 보관은 compactor가 하고 기본으로 꺼져 있어 로그가 영원히 남음, retention_period, retention_stream은 라벨 선택자와 24h 이상 기간 | https://grafana.com/docs/loki/latest/operations/storage/retention/ |
| ILM 단계 hot, warm, cold, frozen, delete의 뜻 | https://www.elastic.co/docs/manage-data/lifecycle/index-lifecycle-management/index-lifecycle |

- 하루 양과 30일 양은 「로그 레벨과 구조화 로그」의 재현 크기(142·193바이트)로 계산했어요. (33.4 − 24.5) × 30 = 267GB라 "270GB쯤"으로 썼어요.
- 함께 한 것: 용어 log-retention을 올렸어요. 퀴즈 5문제를 썼어요.
