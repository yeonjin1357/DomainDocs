# 사실 확인: 리전과 가용 영역

- 글: src/content/docs/cloud/regions-and-zones.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 리전 = 떨어진 지리적 지역, 서로 격리, 대부분 자원은 리전에 속해 리전을 골라야 보임 | https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-regions-availability-zones.html |
| 리전마다 여러 AZ, AZ는 하나 이상의 데이터센터·전력·네트워크 이중화, 물리적으로 떨어져 화재·홍수가 한 AZ만 영향, 저지연 전용 네트워크, 여러 AZ에 배포 권장, AZ에 묶이는 자원 | https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-regions-availability-zones.html |
| AZ마다 전력·냉방·네트워크 따로, 몇 km 떨어지고 보통 100km 안, 왕복 약 2ms 미만 목표·동기 복제 가능, AZ 없는 리전도 있음 | https://learn.microsoft.com/en-us/azure/reliability/availability-zones-overview |
| Local Zones, Wavelength Zones | https://docs.aws.amazon.com/global-infrastructure/latest/regions/aws-regions-availability-zones.html |

- 메모: 리전 고르는 기준(지연, 데이터 위치 규정, 서비스·가격 차이)은 일반 설명이에요. AZ 수(대부분 3, 일부 4)는 Azure 문서의 리전 표를 보고 적었어요.
