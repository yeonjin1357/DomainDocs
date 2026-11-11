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

## 2026-11-11 보강: VPC 밖과 잇기

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 피어링 = 두 VPC를 사설 IP로 잇기, 다른 계정·리전도, 게이트웨이·VPN이 아니라 단일 고장 지점·대역폭 병목 없음 | https://docs.aws.amazon.com/vpc/latest/peering/what-is-vpc-peering.html |
| IP 범위가 겹치면 못 이음, 거쳐 가기 안 됨(A–B, A–C여도 B→C 불가), 상대의 인터넷 게이트웨이·NAT·VPN·Direct Connect 못 씀, 양쪽 라우팅 테이블에 경로 필요 | https://docs.aws.amazon.com/vpc/latest/peering/vpc-peering-basics.html |
| Transit Gateway = VPC와 사내망을 잇는 중심, VPC·VPN·Direct Connect 게이트웨이 붙이기, 자체 라우팅 테이블, 연결마다 시간당·처리량 요금 | https://docs.aws.amazon.com/vpc/latest/tgw/what-is-transit-gateway.html |
| 사이트 간 VPN은 IPsec, 연결마다 터널 둘 | https://docs.aws.amazon.com/vpn/latest/s2svpn/VPC_VPN.html |
| TunnelState는 살아 있으면 1, 끊기면 0, 사이 값이면 하나 이상이 끊김 | https://docs.aws.amazon.com/vpn/latest/s2svpn/monitoring-cloudwatch-vpn.html |
| Direct Connect는 광케이블로 연결 지점에 이어 인터넷 사업자를 거치지 않음 | https://docs.aws.amazon.com/directconnect/latest/UserGuide/Welcome.html |
| 인터페이스 엔드포인트는 서브넷에 네트워크 인터페이스, AZ마다 시간당·GB당 요금, 사설 DNS로 기존 서비스 주소가 사설 IP로 풀림, 엔드포인트가 없으면 비공개 서브넷은 NAT를 거침 | https://docs.aws.amazon.com/vpc/latest/privatelink/privatelink-access-aws-services.html |
| 게이트웨이 엔드포인트는 S3·DynamoDB, 라우팅 테이블 경로, 추가 요금 없음 | https://docs.aws.amazon.com/vpc/latest/privatelink/gateway-endpoints.html |
| Azure: 가상 네트워크 피어링, VPN Gateway로 사이트 간 VPN, ExpressRoute(인터넷 안 거침), Private Link·서비스 엔드포인트 | https://learn.microsoft.com/en-us/azure/virtual-network/virtual-networks-overview |

- Transit Gateway에 맞는 Azure 항목은 원문으로 확인하지 않아 쓰지 않았어요. 360px에서 세 칸 표가 좁아서, 표는 AWS 이름만 두고 Azure 이름은 각 절의 문장으로 옮겼어요.
- 함께 한 것: 용어 vpc-peering, transit-gateway, vpc-endpoint를 올렸어요. 퀴즈 3문제를 더했어요. 그림 3개(vpc-peering, vpc-hub, vpc-endpoint).
