# 사실 확인: 모니터링 시스템의 이중화와 확장

- 글: src/content/docs/foundations/monitoring-ha.mdx
- 확인일: 2026-11-05

| 확인한 주장 | 근거(URL) |
| --- | --- |
| remote write는 WAL을 읽어 샤드 큐로 보내고, 실패는 데이터 손실 없이 다시 시도하지만 받는 쪽이 2시간 넘게 멈추면 WAL이 정리돼 못 보낸 데이터를 잃음, 재시도 간격은 min_backoff부터 두 배씩 max_backoff까지 | https://github.com/prometheus/docs/blob/main/docs/practices/remote_write.md |
| external_labels는 시계열과 알림에 모두 붙음(federation, remote storage, Alertmanager), alert_relabel_configs는 external labels 뒤에 적용되고 HA 쌍이 같은 알림을 보내게 하는 데 씀 | https://github.com/prometheus/prometheus/blob/main/docs/configuration/configuration.md |
| Alertmanager 앞에 로드 밸런서를 두지 말고 Prometheus가 목록 전체로 보내야 함 | https://github.com/prometheus/alertmanager/blob/main/README.md (High Availability) |
| Thanos Querier `--query.replica-label`로 실행 시 중복 제거 | https://github.com/thanos-io/thanos/blob/main/docs/components/query.md |
| Mimir HA 추적: cluster·__replica__ 레이블, 리더 replica 샘플만 받음, 30초(기본) 동안 새 샘플이 없으면 리더 전환, 전환 때 수집 한 번 정도 빠질 수 있어 rate 구간을 수집 주기 4배 이상 권장 | https://github.com/grafana/mimir/blob/main/docs/sources/mimir/configure/configure-high-availability-deduplication.md |
| 에이전트 모드는 질의·알림·로컬 저장을 끄고 WAL만, 받는 쪽이 멈추면 2시간까지 디스크에 버퍼 | https://github.com/prometheus/prometheus/blob/main/docs/prometheus_agent.md |
| federation: 계층·서비스 간, `/federate`로 골라 긁음 | https://github.com/prometheus/prometheus/blob/main/docs/federation.md |
| OTel exporterhelper sending_queue: 기본 켜짐, queue_size 1000(requests), 차면 보통 버림, storage를 정하면 디스크 큐(메모리 큐 없음)로 재시작 뒤 이어 보냄 | https://github.com/open-telemetry/opentelemetry-collector/blob/main/exporter/exporterhelper/README.md |

직접 돌려 본 것(Windows, Prometheus 3.15.1 세 대, 대상은 Node로 만든 초당 10씩 느는 카운터, scrape 5초):

- A·B(external_labels replica=a/b) → C(`--web.enable-remote-write-receiver`) 70초 뒤: `count(orders_total)` 2, `sum(rate(orders_total[1m]))` 19.296, by replica a 9.296·b 10, `sum(max without (replica) (rate(orders_total[1m])))` 9.499.
- C를 60초 끔: C가 돌아오고 4초 뒤 `count_over_time(orders_total{replica="a"}[60s])`(끊긴 구간 끝 시각 기준)은 결과 없음, 30초 뒤 12. 끊긴 구간 가운데 시각의 값도 있음(983).
- 두 번째 실행에서 A의 `/metrics`: highest_timestamp − queue_highest_sent_timestamp 평소 5초, 끊기고 30초 30초, 60초 65초, 돌아오고 15초 5초. samples_pending 6 → 36 → 78 → 6, retried_total 0 → 66 → 102 → 108, failed_total 0 그대로.
- promtool 3.15.1 `check config`: external_labels(cluster, replica) + `alert_relabel_configs: [{action: labeldrop, regex: replica}]` + Alertmanager 두 대 + remote_write 설정이 SUCCESS.
