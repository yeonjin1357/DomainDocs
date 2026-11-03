# 사실 확인: 디스크 건강(SMART)과 RAID

- 글: src/content/docs/server/disk-health.mdx
- 확인일: 2026-11-03
- 실제 디스크와 root가 없어서 실험 대신 원문과 소스로 확인했어요.

| 확인한 주장 | 근거(URL) |
| --- | --- |
| RAW_VALUE는 실제 수, VALUE는 제조사가 1~254로 바꾼 정규화 값, THRESH(0~255) 이하면 실패, WORST, Pre-fail 종류가 고장 직전을 뜻하지 않음 | smartmontools smartctl.8.in(1210~1262행) |
| Backblaze 다섯 항목 5·187·188·197·198의 RAW가 0보다 크면 살펴봄, 고장 디스크 76.7%·운영 디스크 4.2%가 하나 이상 0보다 큼, 23.3%는 신호 없음, 0→20(하루)과 60(5년) 예 | https://www.backblaze.com/blog/what-smart-stats-indicate-hard-drive-failures/ |
| NVMe Percentage Used: 제조사 예상 수명 대비 쓴 몫, 100은 고장을 뜻하지 않을 수 있고 100을 넘을 수 있음, Available Spare Threshold 아래면 비동기 이벤트가 생길 수 있음 | nvme-cli libnvme/doc/man/nvme_smart_log-libnvme3.2 |
| smartctl NVMe 출력 이름 `Percentage Used`, `Available Spare`, `Available Spare Threshold`, `Media and Data Integrity Errors` | smartmontools nvmeprint.cpp |
| /proc/mdstat의 디스크 표시 `U`(in sync) / `_` | linux drivers/md/raid5.c 8347행 `seq_printf(seq, "%s", rdev && test_bit(In_sync, &rdev->flags) ? "U" : "_")` |
| node_exporter `node_md_degraded`(빠진 디스크 수), `node_md_disks{state}`, `node_md_state{state="active|inactive|recovering|resync|check"}` | node_exporter collector/mdadm_linux.go |
| smartctl_exporter `smartctl_device_attribute{attribute_name, attribute_value_type}`, value/worst/thresh/raw | smartctl_exporter metrics.go, smartctl.go |
| EBS 볼륨 상태 확인은 5분마다 | https://docs.aws.amazon.com/ebs/latest/userguide/monitoring-volume-checks.html |

- 계산: RAID 용량은 4TB × 4 기준 RAID 0 16TB, RAID 5 12TB, RAID 6 8TB, RAID 10 8TB. 리빌드 4,000,000MB ÷ 100MB/s = 40,000초 ≈ 11.1시간(초당 100MB는 가정).
- 고친 것: Backblaze가 어느 쪽이 위험하다고 단정하지 않아 '견주는 예를 들어요'로, NVMe 경고는 '보낼 수 있어요'로.
