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
