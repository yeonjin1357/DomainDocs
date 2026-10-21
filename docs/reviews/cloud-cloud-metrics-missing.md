# 사실 확인: 클라우드 지표가 비어 있을 때

- 글: src/content/docs/cloud/cloud-metrics-missing.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| ALB 5xx 지표의 보고 기준 = 0이 아닌 값이 있을 때 | https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-cloudwatch-metrics.html |
| 빠진 데이터 처리: notBreaching·breaching·ignore·missing, 기본값 missing | https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/alarms-and-missing-data.html |
| EC2 기본 5분, 상세 1분 | https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/manage-detailed-monitoring.html |
| 15일 뒤 5분, 63일 뒤 1시간으로 묶임, 차원은 지표 정체성의 일부 | https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html |

- 메모: 인스턴스 ID가 바뀌면 지표가 끊긴다는 것은 차원 정의에서 나온 설명이에요.
