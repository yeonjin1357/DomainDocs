# 사실 확인: 로그가 모이는 길

- 글: src/content/docs/foundations/log-collection.mdx
- 확인일: 2026-10-23

| 확인한 주장 | 근거(URL) |
| --- | --- |
| Fluent Bit tail의 위치 기록은 `db`(기본값 none), `read_from_head` 기본 false, `read_newly_discovered_files_from_head` 기본 true | https://docs.fluentbit.io/manual/pipeline/inputs/tail |
| `refresh_interval` 기본 60초, `rotate_wait` 기본 5초, `buffer_max_size` 기본 32k이고 넘으면 그 파일 감시를 멈춤(`skip_long_lines`를 켜면 긴 줄만 건너뜀) | https://docs.fluentbit.io/manual/pipeline/inputs/tail |
| 경로 패턴이 회전된 파일까지 고르면 다시 읽어 겹침, 갑자기 죽으면 db 위치가 보낸 위치보다 뒤처질 수 있음 | https://docs.fluentbit.io/manual/pipeline/inputs/tail |
| `mem_buf_limit`에 닿으면 입력을 멈추고 `paused (mem buf overlimit)` 경고를 남김 | https://docs.fluentbit.io/manual/administration/backpressure |
| `Retry_Limit` 기본값 1, 한도를 넘긴 묶음은 버림 | https://docs.fluentbit.io/manual/administration/scheduling-and-retries |
| 지표 경로 `/api/v2/metrics/prometheus`, 지표 이름 `fluentbit_input_bytes_total`, `fluentbit_output_proc_records_total`, `fluentbit_output_retries_total`, `fluentbit_output_retries_failed_total`, `fluentbit_output_dropped_records_total` | https://docs.fluentbit.io/manual/administration/monitoring |
| copytruncate는 복사와 비우기 사이의 짧은 틈에 쓴 로그를 잃을 수 있음 | https://man7.org/linux/man-pages/man8/logrotate.8.html |
| OpenTelemetry filelog의 `start_at` 기본 end, `storage`가 없으면 위치를 메모리에만 둠 | https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/filelogreceiver |
| kubelet 컨테이너 로그 회전 기본값 `containerLogMaxSize` 10Mi, `containerLogMaxFiles` 5 | https://kubernetes.io/docs/concepts/cluster-administration/logging/ |

- 메모: 화면 그림(읽은 120,000·보낸 96,000·버린 24,000줄)은 예시 숫자예요.
- 함께 한 것: 퀴즈 5문제. `retry-limit-default`, `restart-without-offset`는 위 기본값 근거와 같아요.
