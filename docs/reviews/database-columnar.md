# 사실 확인: 열 지향 DB와 데이터 웨어하우스

- 글: src/content/docs/database/columnar.mdx
- 확인일: 2026-10-29

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 열 지향 저장은 디스크 I/O를 크게 줄임, 행 지향은 OLTP에 맞음, 100열 중 5열을 쓰면 약 5%만 읽음, 같은 종류 값이라 압축이 잘 됨, 흔한 블록 2KB~32KB·Redshift 1MB | https://docs.aws.amazon.com/redshift/latest/dg/c_columnar_storage_disk_mem_mgmnt.html |
| WLMQueueWaitTime(대기열에서 기다린 시간), WLMQueueLength(기다리는 질의 수), PercentageDiskSpaceUsed | https://docs.aws.amazon.com/redshift/latest/mgmt/metrics-listing.html |
| INSERT마다 조각(part)이 생기고 뒤에서 합침, 최소 1,000행·가능하면 1만~10만 행씩 넣기 권장 | https://clickhouse.com/docs/best-practices/selecting-an-insert-strategy |
| parts_to_delay_insert 기본 1000(넣기를 늦춤), parts_to_throw_insert 기본 3000(Too many parts 예외), 23.6 전에는 300 | https://github.com/ClickHouse/ClickHouse/blob/master/src/Storages/MergeTree/MergeTreeSettings.cpp |

- 재현(DuckDB, @duckdb/node-api): 100만 행(시각 1초 간격, 호스트 50가지, 상태 200·500, 응답시간 0~300 무작위 정수, 경로 1,000가지)을 만들었어요.
  - CSV 48.2MB, Parquet(zstd) 3.8MB.
  - parquet_metadata의 열별 압축 크기: 시각 2686.8KB, 응답시간 1108.1KB, 경로 26.0KB, 호스트 3.8KB, 상태 0.7KB.
- 「모니터링에서는」 그래프의 숫자는 예시예요.
- 함께 한 것: 용어 columnar-storage, data-warehouse, wlm을 올리고, DB 개요에 이 글을 이었어요. 퀴즈 5문제를 썼어요.
