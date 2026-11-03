# 사실 확인: 권한과 역할(IAM)

- 글: src/content/docs/cloud/iam.mdx
- 확인일: 2026-11-03

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 기본으로 모든 요청은 거부(루트 사용자 예외), 정책이 허락해야 통과, 명시한 Deny가 Allow보다 앞섬 | https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic_policy-eval-denyallow.html |
| 권한 경계·SCP·RCP와는 교집합, 어디서든 명시한 Deny가 이김 | https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html |
| `Version`은 `2012-10-17`이 지금 버전, `2008-10-17`은 옛 값이라 정책 변수 같은 기능을 못 씀 | https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements_version.html |
| 워크로드는 역할의 임시 자격 증명을 쓰라는 권고, 최소 권한, 루트 사용자 보호 | https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html |
| 외부 ID는 혼동된 대리인 문제를 막음, AWS는 외부 ID를 비밀로 다루지 않음 | https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_common-scenarios_third-party.html |
| EC2는 인스턴스 프로파일로 역할을 붙이고, 앱은 인스턴스 메타데이터에서 임시 자격 증명을 받음 | https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/iam-roles-for-amazon-ec2.html |
| 지표 읽기 동작 `cloudwatch:GetMetricData`, `cloudwatch:ListMetrics` | https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/permissions-reference-cw.html |
| CloudTrail 이벤트의 `errorCode`는 요청이 에러를 냈을 때의 서비스 에러 | https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-event-reference-record-contents.html |
| Azure 역할 할당 = 보안 주체·역할 정의·범위, 보안 주체는 사용자·그룹·서비스 주체·관리 ID, 거부 할당이 있으면 막힘 | https://learn.microsoft.com/en-us/azure/role-based-access-control/overview |
| 관리 ID는 앱이 자격 증명을 관리하지 않고 Entra 토큰을 받게 함 | https://learn.microsoft.com/en-us/entra/identity/managed-identities-azure-resources/overview |
| Monitoring Reader는 모든 모니터링 데이터(지표·로그)를 읽는 기본 역할 | https://learn.microsoft.com/en-us/azure/role-based-access-control/built-in-roles/monitor |

- 정책 예시 JSON은 문서의 `Version` 예시와 같은 문법으로 맞췄어요. 실제 계정에 붙여 보지는 않았어요.
- 함께 한 것: 용어 iam, iam-policy, iam-role, managed-identity를 올렸어요. 퀴즈 5문제를 썼어요.
