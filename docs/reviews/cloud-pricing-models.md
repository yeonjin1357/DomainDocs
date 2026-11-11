# 사실 확인: 싸게 빌리는 법, 약정과 스팟

- 글: src/content/docs/cloud/pricing-models.mdx
- 확인일: 2026-11-11

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 온디맨드는 초 단위, Savings Plans는 1·3년 시간당 금액 약정, 예약 인스턴스는 구성 약정 | https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-purchasing-options.html |
| Savings Plans 최대 72%, 저절로 붙음, 선결제 세 가지 | https://docs.aws.amazon.com/savingsplans/latest/userguide/what-is-savings-plans.html |
| Compute SP 최대 66%(종류·크기·리전·Fargate·Lambda), EC2 Instance SP 최대 72%(한 리전의 한 계열) | https://docs.aws.amazon.com/savingsplans/latest/userguide/plan-types.html |
| 약정을 넘는 사용은 온디맨드 요금, 시간마다의 약정은 다음 시간으로 넘어가지 않음, 예약 → EC2 Instance SP → Compute SP 순, 할인율 큰 사용부터 | https://docs.aws.amazon.com/savingsplans/latest/userguide/sp-applying.html |
| 활용률 = 약정 중 쓴 몫(10달러 약정에 9.8달러면 98%) | https://docs.aws.amazon.com/savingsplans/latest/userguide/ce-sp-usingPR.html |
| 커버리지 = 대상 사용 비용 중 약정이 덮은 몫 | https://docs.aws.amazon.com/savingsplans/latest/userguide/ce-sp-usingCR.html |
| 예약 인스턴스는 실제 서버가 아닌 청구 할인, AWS는 SP를 권함, 자동 갱신 없음(만료 뒤 온디맨드), 취소 불가, 표준·전환형, 선결제 세 가지, 최대 72% | https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-reserved-instances.html |
| 스팟 최대 90% 할인 | https://aws.amazon.com/ec2/spot/ |
| 회수 2분 전 예고, EventBridge 이벤트 이름, 메타데이터 spot/instance-action, terminate·stop·hibernate, 최대 절전은 2분 여유 없음, 최선 노력 전달 | https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/spot-instance-termination-notices.html |
| Azure 예약 1·3년 최대 72%, 같은 종류로 교환, 12개월 5만 달러까지 환불 | https://learn.microsoft.com/en-us/azure/cost-management-billing/reservations/save-compute-costs-reservations |
| Azure Spot 회수 최대 30초 전 Scheduled Events, 기본 Deallocate, 디스크 요금 계속 | https://learn.microsoft.com/en-us/azure/virtual-machines/spot-vms |

- 막대 그림의 28과 10은 문서의 "최대 72%·최대 90%"를 온디맨드 100에 견준 값이에요. 실제 할인율은 유형·리전·시점마다 달라서 caption에 밝혔어요.
- 시간대별 약정 그림(pm-hourly)의 금액은 개념을 보이려고 정한 예시예요.
- "약정을 하루 최저 사용보다 크게 잡으면 차이만큼 버려진다"는 위 적용 규칙에서 나오는 셈이에요.
- 함께 한 것: 용어 on-demand, savings-plans, reserved-instance, spot-instance, sp-utilization, sp-coverage를 올렸어요. 퀴즈 5문제를 썼어요.
