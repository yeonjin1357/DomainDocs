# 사실 확인: 요청 한도와 스로틀링

- 글: src/content/docs/cloud/throttling.mdx
- 확인일: 2026-10-26

| 확인한 주장 | 근거(URL) |
| --- | --- |
| EC2 API는 토큰 버킷으로 한도, 넘으면 `RequestLimitExceeded`, API마다 바구니가 따로 | https://docs.aws.amazon.com/ec2/latest/devguide/ec2-api-throttling.html |
| DescribeHosts는 바구니 100개, 초당 20개 채움, 비면 5초 뒤 가득 참 | 같은 문서 |
| 필터·페이지 나누기 없는 DescribeInstances 등은 50개, 초당 10개 | 같은 문서 |
| SDK 표준 모드는 기본 시도 3번(처음 포함), 지수 백오프와 지터, 스로틀링 기준 지연 1,000ms·일시 오류 50ms, 상한 20초, 재시도용 바구니, DynamoDB는 4번 | https://docs.aws.amazon.com/sdkref/latest/guide/feature-retry-behavior.html |
| 할당량은 계정·리전마다, 조정 가능한 할당량은 늘려 달라고 요청 | https://docs.aws.amazon.com/servicequotas/latest/userguide/intro.html |
| GetMetricData 요청은 계정·리전마다 초당 500(조정 가능) | https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/cloudwatch_limits.html |
| Lambda 동시 실행 기본 1,000(리전마다, 늘릴 수 있음) | https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html |
| 사용량 지표는 `AWS/Usage` 네임스페이스, 상한에 가까울 때 알림 | https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch-Service-Quota-Integration.html |
| 429는 주어진 시간에 요청이 너무 많음, `Retry-After`를 붙일 수 있음 | https://www.rfc-editor.org/rfc/rfc6585 |
| Lambda Invoke는 동시 실행 한도를 넘으면 TooManyRequestsException(HTTP 429) | https://docs.aws.amazon.com/lambda/latest/api/API_Invoke.html |

- 메모: 그림의 토큰 그래프는 EC2 문서의 DescribeHosts 예를 그대로 그린 거예요.
- 함께 한 것: 용어 `cloud/throttling`, `cloud/service-quota`를 더했고, 퀴즈 5문제를 썼어요.
