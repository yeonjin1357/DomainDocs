# 사실 확인: 가상 머신 상태 검사가 실패할 때

- 글: src/content/docs/cloud/vm-status-check.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 시스템·인스턴스·붙은 EBS 검사의 뜻, 매분 검사, 모두 통과 OK·하나라도 실패 impaired | https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/monitoring-system-instance-status-check.html |
| 시스템 검사 실패 예(네트워크·전원·물리 호스트 소프트웨어·하드웨어), EBS 인스턴스는 멈췄다 켜면 대개 새 호스트로 | https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/monitoring-system-instance-status-check.html |
| 인스턴스 검사 실패 예(시스템 검사 실패, 네트워크·부팅 설정, 메모리 고갈, 파일 시스템 손상, 맞지 않는 커널), 재부팅 중 잠깐 실패 | https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/monitoring-system-instance-status-check.html |
| StatusCheckFailed_System·_Instance = 지난 1분 통과 0·실패 1 | https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/viewing_metrics_with_cloudwatch.html |
| 재부팅은 같은 호스트, 중지·시작하면 인스턴스 스토어 삭제 | https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-lifecycle.html |

- 메모: 콘솔의 시스템 로그·화면 캡처와 자동 복구 설명은 일반 설명이에요. 예시 숫자는 설명용이에요.
