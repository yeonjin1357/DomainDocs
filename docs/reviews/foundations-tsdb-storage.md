# 사실 확인: 시계열 DB가 저장하는 법

- 글: src/content/docs/foundations/tsdb-storage.mdx
- 확인일: 2026-11-03

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 샘플은 2시간 블록으로 묶여요. 블록 폴더 = chunks + index + meta.json(+ tombstones) | https://prometheus.io/docs/prometheus/latest/storage/ |
| 실제 데이터 폴더: 블록 폴더(ULID), `chunks_head/`, `wal/`(00000000…), `lock`, `queries.active`. 블록 meta.json: 2시간(1h59m45s), 시계열 200, 샘플 96,000 | 실제 Prometheus 3.5.0(Windows) 폴더 |
| head는 메모리, WAL로 크래시에 대비하고 재시작 때 다시 읽어요. WAL은 128MB 조각, 적어도 세 파일, 많이 들어오면 2시간 치를 지키려고 더 | https://prometheus.io/docs/prometheus/latest/storage/ |
| 재시작 로그 `Replaying WAL, this may take a while` | 실제 Prometheus 3.5.0 로그 |
| 블록은 세 배씩(2h, 6h, 18h …, `ExponentialBlockRanges(MinBlockDuration, 10, 3)`), 상한을 넘는 크기는 버려요 | https://github.com/prometheus/prometheus/blob/v3.5.0/tsdb/db.go |
| 블록 상한 = min(31d, 보관 기간/10) | https://github.com/prometheus/prometheus/blob/v3.5.0/cmd/prometheus/main.go, 저장 문서 "up to 10% of the retention time, or 31 days" |
| 보관 기본 15d, 블록째 지우고 블록 전체가 지나야 지워요, 지우기는 2시간까지 늦을 수 있어요 | 저장 문서 |
| `retention.size`는 WAL·chunks_head도 세지만 지우는 건 블록뿐, 합치는 동안 잠깐 넘을 수 있어요 | 저장 문서 |
| 샘플 평균 1~2바이트, 디스크 = 보관 초 × 초당 샘플 × 샘플 크기, 시계열 수를 줄이는 쪽이 효과적 | 저장 문서 |
| 로컬 저장소는 복제되지 않아요, 스냅샷 백업 | 저장 문서 |
| 원격 쓰기는 WAL을 읽는 큐로 보내고, 2시간 넘게 멈추면 못 보낸 데이터를 잃어요 | https://prometheus.io/docs/practices/remote_write/ |
| 원격 끝점이 없을 때 `samples_retried_total` 4,680·`samples_pending` 1,837로 늘고 `queue_highest_sent_timestamp_seconds` 0 | 실제 Prometheus 3.5.0(끝점 없는 remote_write, 20초) |
| 밀림 식 `highest_timestamp_in_seconds - ignoring(remote_name, url) group_right queue_highest_sent_timestamp_seconds` | promtool 3.5.0 `test rules` 통과(20분에 900초) |
| 지표 이름 `prometheus_tsdb_head_series`, `storage_blocks_bytes`, `compactions_failed_total`, `data_replay_duration_seconds` | 실제 Prometheus 3.5.0 `/metrics` |
| Gorilla: 점 하나 평균 1.37바이트, 12배 감소, 시각의 약 96%가 1비트, XOR 기반 값 압축 | https://www.vldb.org/pvldb/vol8/p1816-teller.pdf |

- 계산: 15일 = 1,296,000초, × 10만 × 1.5B = 194.4GB. 30일이면 388.8GB. 1년 보관이면 상한 31일(744시간)이라 486시간 블록까지.
- 고친 것: Mimir는 다운샘플링을 하지 않아서 "Thanos는 다운샘플링도 해요"로 좁혔어요.
