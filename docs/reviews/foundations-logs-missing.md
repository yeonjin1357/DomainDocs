# 사실 확인: 로그가 안 들어올 때

- 글: src/content/docs/foundations/logs-missing.mdx
- 확인일: 2026-10-23

| 확인한 주장 | 근거(URL) |
| --- | --- |
| Fluent Bit 파서에 시간대 없는 시각에 쓸 설정 `time_zone`(IANA 이름), `time_system_timezone`(시스템 시간대 사용)이 있음 | https://docs.fluentbit.io/manual/pipeline/parsers/configuring-parser |
| 보낸 로그 수 `fluentbit_output_proc_records_total`, 재시도 한도를 넘겨 버린 묶음 수 `fluentbit_output_retries_failed_total` | https://docs.fluentbit.io/manual/administration/monitoring |
| `Retry_Limit` 기본값 1 | https://docs.fluentbit.io/manual/administration/scheduling-and-retries |
| 메모리 버퍼 한도에 닿으면 입력을 멈추고 `paused (mem buf overlimit)` 경고, 다시 받으면 이어 읽음 | https://docs.fluentbit.io/manual/administration/backpressure |
| tail의 긴 줄 한도 `buffer_max_size` 기본 32k, 파일 목록 다시 훑기 `refresh_interval` 기본 60초 | https://docs.fluentbit.io/manual/pipeline/inputs/tail |

- 메모: Fluent Bit이 시간대 없는 시각을 기본으로 어떻게 읽는지는 문서에 분명히 적혀 있지 않아요. 그래서 본문은 "UTC로 읽으면"이라는 조건으로 썼어요.
- 메모: 퀴즈 `kst-read-as-utc`의 방향(9시간 뒤)은 계산으로 확인했어요. 한국 시간 10:00(UTC 01:00)을 UTC 10:00으로 읽으면 실제보다 9시간 뒤예요.
- 메모: `ls -l /proc/<PID>/fd`는 프로세스가 연 파일을 링크로 보여 주는 리눅스 procfs 경로예요(proc(5)).
