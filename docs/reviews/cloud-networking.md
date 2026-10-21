# 사실 확인: 가상 네트워크

- 글: src/content/docs/cloud/networking.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| VPC = 논리적으로 격리된 가상 네트워크, 전통적인 데이터센터 네트워크와 닮음, 서브넷은 AZ 하나에 있음 | https://docs.aws.amazon.com/vpc/latest/userguide/what-is-amazon-vpc.html |
| 공개 서브넷 = 인터넷 게이트웨이로 바로 가는 경로, 비공개 = 경로 없음·NAT 필요, 서브넷마다 라우팅 테이블, VPN 전용 서브넷 | https://docs.aws.amazon.com/vpc/latest/userguide/configure-subnets.html |
| 보안 그룹 = 붙은 자원의 들고 나는 트래픽 제어, stateful, 일부 트래픽(AWS DNS 등)은 거르지 않음 | https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html |
| 허용 규칙만 적을 수 있음, 처음엔 들어오는 규칙 없음 | https://docs.aws.amazon.com/vpc/latest/userguide/security-group-rules.html |
| 네트워크 ACL = 서브넷 단위 허용·거부, stateless라 응답 자동 허용 안 됨 | https://docs.aws.amazon.com/vpc/latest/userguide/vpc-network-acls.html |
| NAT 게이트웨이 = 비공개 서브넷이 밖으로 연결, 밖에서 연결 시작은 불가 | https://docs.aws.amazon.com/vpc/latest/userguide/vpc-nat-gateway.html |
| NSG = 허용·거부 규칙, 흐름 기록으로 stateful | https://learn.microsoft.com/en-us/azure/virtual-network/network-security-groups-overview |

- 메모: "연결 문제는 설정인 경우가 많다"와 점검 순서는 일반 설명이에요.
