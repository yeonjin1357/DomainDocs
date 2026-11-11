# 사실 확인: 클라우드 쪽 장애와 예정된 작업

- 글: src/content/docs/cloud/provider-health.mdx
- 확인일: 2026-11-11

| 확인한 주장 | 근거(URL) |
| --- | --- |
| AWS Health Dashboard는 모든 고객이 추가 요금·설정 없이 씀, EventBridge로 받는 것도 추가 요금 없음, Health API는 Business Support+·Enterprise·Unified Operations(또는 이전 Business 이상) 플랜 필요 | https://docs.aws.amazon.com/health/latest/ug/what-is-aws-health.html |
| 계정 이벤트와 공개 이벤트, 공개 이벤트는 그 서비스를 안 써도 보임, 로그인 없이 보는 Service health 페이지, 영향받는 자원(affected entities), 종류 issue·scheduledChange·accountNotification과 예시 코드, 상태 open·upcoming·closed, 90일, actionability 세 값과 서비스 장애엔 없음, 조직 보기, 플랜 없으면 SubscriptionRequiredException | https://docs.aws.amazon.com/health/latest/ug/aws-health-concepts-and-terms.html |
| EC2 예정 이벤트 다섯 가지와 그 시각에 일어나는 일(instance-retirement는 EBS 루트면 멈춤, 인스턴스 스토어 루트면 지움), 이메일과 AWS Health 이벤트로 미리 알림, 일부는 날짜 다시 잡기·사용자 지정 이벤트 창 | https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/monitoring-instances-status-check_sched.html |
| 자동 확장 그룹은 예정 이벤트가 걸린 서버를 고장으로 보고 교체 | https://docs.aws.amazon.com/autoscaling/ec2/userguide/health-checks-overview.html |
| Azure status·Service Health·Resource Health 세 갈래 | https://learn.microsoft.com/en-us/azure/service-health/overview |
| Resource Health 상태 넷(Unknown은 10분 넘게 소식 없음, 할당 해제 VM에서 흔함), 플랫폼·비플랫폼 일, VM 중단 원인 72시간 안, 포털 30일 기록 | https://learn.microsoft.com/en-us/azure/service-health/resource-health-overview |

- "공지는 사업자가 확인한 뒤 올라온다"는 공지가 사람이 확인해 쓰는 것이라는 일반 설명이에요. 늦는 시간을 숫자로 쓰지 않았어요.
- 범위부터 좁히는 점검 순서와 AZ 격자 그림은 일반 설명과 예시예요.
- 함께 한 것: 용어 health-event, scheduled-event, resource-health를 올렸어요. 퀴즈 5문제를 썼어요.
