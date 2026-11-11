# 사실 확인: 가상 머신 자동 확장

- 글: src/content/docs/cloud/auto-scaling.mdx
- 확인일: 2026-11-11

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 그룹은 원하는 대수만큼 띄워 유지, 고장 난 서버는 지우고 새로 띄움, 최소·최대 안에서 원하는 대수를 바꿈, 여러 AZ에 고르게 나눔, 스팟 회수 때도 대신 띄움 | https://docs.aws.amazon.com/autoscaling/ec2/userguide/auto-scaling-groups.html |
| 목표 추적 = 지표와 목표값, 그룹이 CloudWatch 경보를 만들고 관리(고치거나 지우지 말 것), 평균 CPU 50% 예, 하나라도 늘리자면 늘리고 모두가 줄이자면 줄임, 줄일 때 천천히(가용성 우선), 1.5대면 2대로 올림, 준비 시간 동안 그룹 지표에서 빠짐 | https://docs.aws.amazon.com/autoscaling/ec2/userguide/as-scaling-target-tracking.html |
| 단계 Pending → InService → Terminating → Terminated, 서비스 중이 되기 전 로드 밸런서 등록, 종료 중엔 등록 해제 대기 시간 동안 하던 요청 처리, 훅은 Pending:Wait·Terminating:Wait, 띄운 순간부터 요금 | https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-lifecycle.html |
| 기본 상태 검사는 EC2 상태 검사, running이 아니거나 impaired면 고장, 로드 밸런서 상태 확인은 켜야 씀(기본은 무시), 상태 검사 실패는 몇 분 기다림, running이 아니면 바로 교체, 예정 이벤트가 걸린 서버도 교체 | https://docs.aws.amazon.com/autoscaling/ec2/userguide/health-checks-overview.html |
| 유예 시간 기본: 콘솔 300초, CLI·SDK 0초(끔) | https://docs.aws.amazon.com/autoscaling/ec2/userguide/health-check-grace-period.html |
| 기본 종료 정책: AZ 균형 먼저, 가장 많은 AZ에서 옛 시작 구성·템플릿·버전 먼저 | https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-termination-policies.html |
| 그룹 지표(GroupDesiredCapacity, GroupInServiceInstances 등)는 켜야 오고 1분 단위, 추가 요금 없음, InService는 대기·종료 중 제외 | https://docs.aws.amazon.com/autoscaling/ec2/userguide/ec2-auto-scaling-metrics.html |
| EC2 지표의 AutoScalingGroupName 차원은 그룹 안 서버 전체를 묶음, 기본·상세 모니터링 모두 | https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/viewing_metrics_with_cloudwatch.html |
| EKS 관리형 노드 그룹의 노드는 자동 확장 그룹으로 띄움 | https://docs.aws.amazon.com/eks/latest/userguide/managed-node-groups.html |
| Azure VMSS는 지표 규칙(Percentage CPU 등)과 일정으로 대수를 바꿈 | https://learn.microsoft.com/en-us/azure/virtual-machine-scale-sets/virtual-machine-scale-sets-autoscale-overview |

- 계산 예시: 4대 × 75% = 300, 300 ÷ 50% = 6대. 문서의 1.5대 → 2대 예시와 같은 셈이에요.
- 그림(asg-tracking)의 곡선은 이 셈에 맞춰 그린 예시예요. 실제 목표 추적 경보의 판정 주기는 그리지 않았어요.
- 함께 한 것: 용어 auto-scaling-group, launch-template, desired-capacity, target-tracking, lifecycle-hook를 올렸어요. 퀴즈 5문제를 썼어요. 그림 4개(scripts/figures/cloud.mjs).
