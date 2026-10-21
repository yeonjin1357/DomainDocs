# 사실 확인: 가상 머신

- 글: src/content/docs/cloud/virtual-machines.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| EC2 인스턴스 = AWS 안의 가상 서버, 유형이 하드웨어를 정함, AMI = OS·소프트웨어를 묶은 틀 | https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/concepts.html |
| 유형 이름 = 시리즈·세대·옵션·크기, C·M·R·T·I 시리즈 뜻, g = Graviton, n = 네트워크·EBS 최적화 | https://docs.aws.amazon.com/ec2/latest/instancetypes/instance-type-names.html |
| 기준선·번 크레딧·쌓인 크레딧 계산, Standard는 기준선으로 서서히 내려옴, T3·T4g는 Unlimited 기본, T2는 Standard 기본 | https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/burstable-credits-baseline-concepts.html |
| Unlimited는 24시간 평균이 기준선을 넘으면 추가 요금, t3.large 기준선 30% | https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/burstable-performance-instances-unlimited-mode-concepts.html |
| 중지 시 사용 요금 없음·EBS 요금은 나옴, 중지·시작하면 인스턴스 스토어 데이터 삭제, 재부팅은 유지, 종료 시 루트 볼륨 기본 삭제 | https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-lifecycle.html |
| CPUUtilization 정의(EC2 코드 시간 포함), OS 도구와 다를 수 있음, 기본 지표 목록에 메모리 없음 | https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/viewing_metrics_with_cloudwatch.html |
| 기본 모니터링 5분, 상세 모니터링 1분·지표당 요금 | https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/manage-detailed-monitoring.html |

- 메모: "크레딧 1개 = vCPU 하나를 1분 100%"는 문서의 계산식(사용 크레딧 = vCPU 수 × 사용률 × 60분)에서 나온 값이에요. 크레딧 그래프 숫자는 설명용이에요.
