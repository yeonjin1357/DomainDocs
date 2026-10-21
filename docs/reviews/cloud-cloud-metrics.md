# 사실 확인: 클라우드 지표 서비스

- 글: src/content/docs/cloud/cloud-metrics.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 네임스페이스(서로 격리), 지표, 차원(정체성의 일부, 최대 30개), 통계, 기간 | https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html |
| AWS 서비스 지표는 기본 1분 표준 해상도, 사용자 지정은 1초 고해상도 가능 | https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html |
| 보관: 60초 미만 3시간, 1분 15일, 5분 63일, 1시간 455일, 15일 뒤 5분·63일 뒤 1시간으로 묶임 | https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_concepts.html |
| 경보 상태 OK·ALARM·INSUFFICIENT_DATA 뜻, M of N, 4 of 5·1분 = 5분, 평가 기간 최대 7일·1일 | https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/alarm-evaluation.html |
| Azure 플랫폼 지표 1분마다 수집, 93일 보관, Log Analytics 에이전트 2024년 8월 은퇴 | https://learn.microsoft.com/en-us/azure/azure-monitor/metrics/data-platform-metrics |

- 메모: EC2 기본 5분 간격은 virtual-machines 글의 근거를 따랐어요. 세는 지표는 합으로 본다는 건 ALB 지표 문서("The only meaningful statistic is Sum")와 같은 취지예요.
