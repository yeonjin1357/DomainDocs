# 사실 확인: 로드 밸런서에서 5xx가 늘 때

- 글: src/content/docs/cloud/lb-5xx.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 502 원인: 대상의 TCP RST, 처리 중 대상이 연결을 닫음(keep-alive가 유휴 시간보다 짧음), 깨진 응답, 응답 헤더 32K 초과 | https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-troubleshooting.html |
| 503 원인: 등록된 대상이 없거나 모두 쓰지 않는 상태 | https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-troubleshooting.html |
| 504 원인: 10초 안에 연결 실패, 유휴 시간 안에 응답 없음, 네트워크 ACL이 임시 포트(1024-65535) 막음 | https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-troubleshooting.html |
| HTTPCode_ELB_5XX_Count(LB가 만든 것)와 HTTPCode_Target_5XX_Count(대상이 만든 것) | https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-cloudwatch-metrics.html |

- 메모: 배포 중 503이 튀는 경우는 일반 설명이에요. 예시 숫자는 설명용이에요.
