# 사실 확인: 클라우드 비용은 어디서 나올까

- 글: src/content/docs/cloud/costs.mdx
- 확인일: 2026-10-23

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 들어오는 데이터는 모든 리전에서 무료, 인터넷으로 나가는 요금은 리전마다 다름, 리전 사이 전송은 유료 | https://aws.amazon.com/blogs/architecture/overview-of-data-transfer-costs-for-common-architectures/ |
| us-east-1 인터넷 송신 첫 10TB GB당 0.09달러(AWSDataTransfer 가격 목록, 2026-09-16 발행) | https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AWSDataTransfer/current/us-east-1/index.json |
| 같은 리전의 AZ 사이 EC2·RDS·ElastiCache 등 전송은 방향마다 GB당 0.01달러, 같은 AZ는 무료, 공인·탄력적 IPv4로 주고받으면 방향마다 0.01달러 | https://aws.amazon.com/ec2/pricing/on-demand/ |
| NAT 게이트웨이는 켜 둔 시간과 처리한 GB마다 과금 | https://docs.aws.amazon.com/vpc/latest/userguide/nat-gateway-pricing.html |
| 공인 IPv4는 2024-02-01부터 붙어 있든 아니든 시간당 0.005달러(VPC 가격 목록 2026-10-16 발행에서도 같음) | https://aws.amazon.com/blogs/aws/new-aws-public-ipv4-address-charge-public-ip-insights/ |
| 사용자 지정 지표 첫 1만 개 지표당 월 0.30달러, GetMetricData 지표 1,000개 요청당 0.01달러(CloudWatch 가격 목록 2026-10-07 발행) | https://pricing.us-east-1.amazonaws.com/offers/v1.0/aws/AmazonCloudWatch/current/us-east-1/index.json |
| CloudWatch는 차원 조합마다 지표 하나로 셈, 기본 지표 무료, 사용자 지정·상세 모니터링 지표 10개 무료, GetMetricData는 늘 과금 | https://aws.amazon.com/cloudwatch/pricing/ |
| Cost Explorer는 비용 자료를 적어도 24시간마다 새로 고침 | https://docs.aws.amazon.com/cost-management/latest/userguide/ce-what-is.html |
| 비용 할당 태그는 활성화해야 Cost Explorer·보고서에 나옴, 목록에 보이기까지와 활성화까지 각각 24시간까지 | https://docs.aws.amazon.com/awsaccountbilling/latest/aboutv2/activating-tags.html |

- 계산 확인: 공인 IPv4 0.005 × 720시간 = 3.6달러. 지표 200개 × 0.30 = 60달러, 6,000개 × 0.30 = 1,800달러. 지표 1,000개 × 60 × 24 × 30 = 4,320만 개, 4,320만 ÷ 1,000 × 0.01 = 432달러.
- 메모: 금액은 2026년 10월 us-east-1 값이라 글의 Deeper에 시점과 리전을 밝혔어요. AWSDataTransfer 가격 목록의 xAZ 항목은 0달러로 나와서, AZ 사이 금액은 EC2 요금 페이지의 문장을 근거로 썼어요.
- 함께 한 것: 용어 `cloud/data-transfer-cost`, `cloud/cost-allocation-tag`를 더했고, 퀴즈 5문제를 썼어요.
