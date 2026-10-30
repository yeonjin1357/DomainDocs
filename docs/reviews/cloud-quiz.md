# 사실 확인: 클라우드 퀴즈

- 문제: src/content/quizzes/cloud/*.yaml (14개 파일, 68문제)
- 확인일: 2026-10-21
- 방법: 숫자·기본값·서비스마다 다른 동작이 든 문제만 골라, 그 문제가 기대는 글의 문장과 글의 검토 기록 근거에 맞춰 봤어요. 글에 없는 새 주장은 넣지 않았어요.

| 문제(파일 · id) | 확인한 주장 | 근거 |
| --- | --- | --- |
| overview · iaas-os-patch, s3-azure-pair | IaaS의 OS 패치는 고객, S3 ↔ Blob Storage | 글 본문과 docs/reviews/cloud-overview.md |
| regions-and-zones · az-latency | Azure 가용 영역 사이 왕복 지연 목표 약 2ms 아래 | 글 본문과 docs/reviews/cloud-regions-and-zones.md |
| virtual-machines · credits-exhausted, credit-unit, instance-store-lost | t3.large 기준선 30%, 크레딧 1 = vCPU 하나 1분 100%, 중지 후 시작하면 인스턴스 스토어 삭제 | 글 본문과 docs/reviews/cloud-virtual-machines.md |
| networking · sg-stateful, nacl-stateless, subnet-one-az | 보안 그룹 stateful, ACL stateless, 서브넷은 가용 영역 하나 | 글 본문과 docs/reviews/cloud-networking.md |
| load-balancers · health-check-delay, fail-open, cross-zone-off | ALB 기본 30초 간격·2번 실패, 모두 실패하면 fail open, 2대·8대 예시에서 4배 | 글 본문과 docs/reviews/cloud-load-balancers.md |
| storage · ebs-same-az, s3-read-after-write | EBS와 인스턴스는 같은 가용 영역, S3 강한 read-after-write 일관성 | 글 본문과 docs/reviews/cloud-storage.md |
| managed-databases · standby-no-reads, standby-sync, maintenance-window | 다중 AZ 대기 서버는 동기·읽기 불가, 미룬 변경은 유지 보수 시간에 적용 | 글 본문과 docs/reviews/cloud-managed-databases.md |
| serverless · concurrency-calc, throttles-not-errors, default-timeout | 400 × 3 = 1,200, 리전 기본 1,000, 스로틀은 Invocations·Errors에 없음, 기본 제한 시간 3초·최대 900초 | 글 본문과 docs/reviews/cloud-serverless.md |
| cloud-metrics · rollup-15-days, insufficient-data | 1분 자료는 15일 뒤 5분·63일 뒤 1시간, INSUFFICIENT_DATA의 뜻 | 글 본문과 docs/reviews/cloud-cloud-metrics.md |
| lb-5xx · 502-keepalive, 503-meaning | keep-alive가 유휴 시간 제한보다 짧으면 502, 등록·정상 대상이 없으면 503 | 글 본문과 docs/reviews/cloud-lb-5xx.md |
| cloud-metrics-missing · zero-not-reported, not-breaching, five-minute-default | 0이 아닐 때만 보고하는 지표, 경보 빠진 데이터 기본 missing·notBreaching, EC2 기본 5분 | 글 본문과 docs/reviews/cloud-cloud-metrics-missing.md |
| lambda-errors · async-retries | 비동기 호출 함수 오류 시 기본 두 번 더 시도 | 글 본문과 docs/reviews/cloud-lambda-errors.md |
| vm-status-check · reboot-same-host, auto-recovery-limit | 재부팅은 같은 호스트에 머물 수 있음, 자동 복구는 새 호스트로 옮길 뿐 | 글 본문과 docs/reviews/cloud-vm-status-check.md |

## 2026-10-30 문제 다시 쓰기

- 문제: src/content/quizzes/cloud/*.yaml (17개 파일, 83문제)
- 바꾼 까닭: OX 정답의 O가 29%, 정답이 가장 긴 보기인 객관식이 47%였어요. 부정으로 묻는 문제가 둘, 판단을 묻는 OX("볼 만한가요", "늘 옮겨지나요")가 있었어요.
- 정답이 둘이 되는 문제: throttling의 토큰 바구니 문제는 "가득 찬 바구니(100개, 초당 20개 채움)로 1초 동안 몇 번 성공하나"를 묻고 정답을 100으로 뒀어요. 실제 토큰 바구니는 그 1초 동안에도 채워져서 오답 120도 맞을 수 있었어요. 글의 데모는 초마다 한 번에 계산하는 단순 모델이라 100이 나와요. "계속 부를 때 이어서 성공하는 속도"(초당 20번)를 묻는 문제(token-bucket-sustained)로 바꿨어요.
- 고친 뒤: OX 28문제 중 O 15(54%), 객관식 53문제 중 정답이 가장 긴 보기 12(23%), 정답이 가장 긴 오답의 1.2배를 넘는 문제 0개예요.
- 새로 들어간 주장만 아래에서 확인했어요.

| 문제(파일 · id) | 확인한 주장 | 근거 |
| --- | --- | --- |
| lb-5xx · deploy-503 | 대상 그룹에 등록된 대상이 없으면 ALB가 503을 줘요 | https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-troubleshooting.html (HTTP 503: Service unavailable, no registered targets) |
| vm-status-check · reboot-same-host | 재부팅은 같은 물리 호스트에 머물고, 멈췄다 켜야 대개 새 호스트로 옮겨져요 | 글 본문과 https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-instance-reboot.html |
| regions-and-zones · split-by-az | 세 영역 중 한 곳만 30%면 고르게 나뉜 전체는 10%예요 | 계산 |
| throttling · monitoring-throttled | GetMetricData 한도는 계정·리전마다라, 같은 계정의 도구들이 나눠 써요 | 글 본문과 docs/reviews/cloud-throttling.md |
| cloud-metrics-missing · not-breaching | 오답 후보였던 ignore는 경보 상태를 그대로 두는 설정이라 이 문제의 증상도 멈출 수 있어서 보기에서 뺐어요 | https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/AlarmThatSendsEmail.html (treat missing data) |
