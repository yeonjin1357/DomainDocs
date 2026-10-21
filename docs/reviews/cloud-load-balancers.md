# 사실 확인: 로드 밸런서

- 글: src/content/docs/cloud/load-balancers.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| ELB = 여러 AZ의 대상에 나눔, 건강한 대상에만, 용량을 자동으로 늘림 | https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/what-is-load-balancing.html |
| cross-zone 예시(A 2대·B 8대, 켜면 10%씩, 끄면 25%·6.25%), ALB는 LB 수준에서 늘 켜짐·대상 그룹에서 끌 수 있음 | https://docs.aws.amazon.com/elasticloadbalancing/latest/userguide/how-elastic-load-balancing-works.html |
| ALB = OSI 7계층, 리스너 규칙을 우선순위 순서로 확인 | https://docs.aws.amazon.com/elasticloadbalancing/latest/application/introduction.html |
| NLB = OSI 4계층, 초당 수백만 요청 | https://docs.aws.amazon.com/elasticloadbalancing/latest/network/introduction.html |
| 상태 확인 간격 5–300초·기본 30초(lambda 35초), 비정상 2회·정상 5회 기본, 새 대상은 한 번 통과해야 정상, 모두 비정상이면 fail open | https://docs.aws.amazon.com/elasticloadbalancing/latest/application/target-group-health-checks.html |
| RequestCount, TargetResponseTime 정의, ELB_5XX는 LB가 만든 것·Target_5XX는 대상이 만든 것, HealthyHostCount | https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-cloudwatch-metrics.html |
| Azure Load Balancer = 4계층, Application Gateway = 7계층 | https://learn.microsoft.com/en-us/azure/load-balancer/load-balancer-overview |

- 메모: 빠지는 시간(2회 × 30초)과 돌아오는 시간(5회 × 30초)은 기본값으로 계산한 값이에요. 모니터링 예시 숫자는 설명용이에요.
