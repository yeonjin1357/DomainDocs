# 사실 확인: 클라우드 지표를 가져오는 두 방식

- 글: src/content/docs/cloud/metric-collection.mdx
- 확인일: 2026-10-26

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 지표 스트림은 거의 실시간·낮은 지연으로 계속 보냄, Firehose로 S3·다른 업체로 전달, Datadog·Dynatrace·New Relic 등 바로 이어 주는 설정, 필터는 스트림마다 1,000개까지·포함과 제외를 섞지 못함, 새로 생긴 지표도 필터에 맞으면 포함 | https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-Metric-Streams.html |
| 스트림은 Minimum, Maximum, SampleCount, Sum을 늘 보냄, 백분위수 등은 지표마다 더할 수 있음, 통계 여섯 개를 더하면 갱신 하나가 세 건으로 셈 | https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-metric-streams-statistics.html |
| 형식은 JSON, OpenTelemetry 1.0.0, 0.7.0 | https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-metric-streams-formats.html |
| 한 시각의 값을 보낸 뒤 그 값이 바뀌어도 다시 보내지 않음 | https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-metric-streams-troubleshoot.html |
| GetMetricData 요청은 계정·리전마다 초당 500 | https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_limits.html |
| us-east-1 단가: GetMetricData 지표 1,000개 요청당 0.01달러, Metric Streams 갱신 1,000건당 0.003달러(CloudWatch 가격 목록 2026-10-07 발행) | https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonCloudWatch/current/us-east-1/index.json |

- 계산 확인: 1,000 × 60 × 24 × 30 = 43,200,000건. API는 43,200 × 0.01 = 432달러, 스트림은 43,200 × 0.003 = 129.6달러(그림은 130으로 반올림). 평균 = Sum ÷ SampleCount.
- 메모: 스트림 쪽 금액에는 Firehose 요금이 빠져 있어서 그림과 본문에 밝혔어요.
- 함께 한 것: 퀴즈 5문제를 썼어요.
