# 사실 확인: 클라우드가 빌려주는 것

- 글: src/content/docs/cloud/overview.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 클라우드 정의(공유 자원을 네트워크로 필요할 때, 적은 관리 노력으로 빌리고 반납), 다섯 특징, 측정은 보통 쓴 만큼 과금 | https://csrc.nist.gov/pubs/sp/800/145/final (PDF 원문 대조) |
| IaaS = 처리·저장·네트워크를 빌리고 OS·저장소·앱은 고객이 관리, PaaS = 고객 앱을 올림, SaaS = 사업자 앱을 씀 | https://csrc.nist.gov/pubs/sp/800/145/final |
| AWS는 클라우드의 보안(인프라)을, 고객은 클라우드 안의 보안을 맡음, EC2는 IaaS라 게스트 OS 업데이트·패치가 고객 몫 | https://aws.amazon.com/compliance/shared-responsibility-model/ |
| 모든 배포 형태에서 데이터와 계정(ID)은 고객이 소유하고 지킴 | https://learn.microsoft.com/en-us/azure/security/fundamentals/shared-responsibility |

- 메모: AWS·Azure 서비스 짝 표는 각 사업자의 제품 이름을 나란히 놓은 일반 설명이에요.
