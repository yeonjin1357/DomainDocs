# 사실 검토: 장애가 다른 서비스로 번질 때 어디부터 볼까

- 글: src/content/docs/apm/cascading-failure.mdx
- 검토일: 2026-10-14
- 방식: 초안을 다 쓴 뒤 따로 검토했어요(서브 에이전트 없이). Google SRE Book, Amazon Builders' Library, Tempo 문서 원문과 대조했고, 질의는 promtool 3.15.0으로 돌렸어요(`scratchpad/b4prom/b4-test.yml`).
- 결과: 수정 필요 0건 / 확인 12건

| 주장(인용) | 판정 | 근거(URL과 짧은 인용) | 수정 제안 |
| --- | --- | --- | --- |
| 상황 "연쇄 장애는 한 곳의 과부하가 재시도와 자원 고갈을 타고 퍼지는 일이에요." | 맞음 | https://sre.google/sre-book/addressing-cascading-failures/ "The most common cause of cascading failures is overload.", 같은 장의 Resource Exhaustion·Retries 절 | — |
| 1단계 부르는 쪽은 기다리느라 함께 느려지고, 받은 쪽 시간으로 출발점을 찾음 | 맞음 | 선의 시간을 양쪽에서 재요. Tempo "The processor measures duration from both the client and server sides." 출발점은 "후보"로만 썼어요. | — |
| 1단계 질의(받은 쪽 p95) | 맞음 | Tempo 지표 이름 `traces_service_graph_request_server_seconds`. promtool: 0.5~1초 버킷만 있는 입력에서 0.975(선형 보간) | — |
| 2단계 재시도가 회복을 늦춤 | 맞음 | https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/ "They can even delay recovery by keeping the load high long after the original issue is resolved." | — |
| 2단계 재시도 그래프는 증상으로 오해받기 쉬움 | 맞음 | SRE "Graphs of retry rates can be an indication of bad retry behavior, but may be confused as a symptom instead of a compounding cause." | — |
| 2단계 질의(선마다 요청 수) | 맞음 | promtool: 초당 100 | — |
| 3단계 스레드가 모자라면 헬스 체크 실패, 서버가 빠짐 | 맞음 | SRE "Thread starvation can directly cause errors or lead to health check failures.", "servers can appear unhealthy to the load balancing layer, resulting in reduced load balancing capacity" | — |
| 3단계 타임아웃이 길수록 오래 붙잡힘 | 맞음 | SRE "High deadlines can result in resource consumption in higher levels of the stack when lower levels of the stack are having problems." | — |
| 4단계 10,000 → 11,000, 9,000으로는 안 됨, 10%면 1,000 | 맞음 | SRE "if a service was healthy at 10,000 QPS, but started a cascading failure due to crashes at 11,000 QPS, dropping the load to 9,000 QPS will almost certainly not stop the crashes", "if 10% of the servers are healthy enough to handle requests, the request rate would need to drop to about 1,000 QPS" | — |
| 4단계 부하 줄이는 방법(재시도 끄기, 503, 기능 덜기, 배치 멈추기) | 맞음 | SRE "you must dramatically reduce or eliminate the load on the frontends until the retries stop", "return an HTTP 503 (service unavailable)", "Graceful degradation", 응급 조치 "Eliminate Batch Load" | — |
| 확인 2 1,000 QPS 클러스터에 1,200 | 맞음 | SRE "If cluster B fails (Figure 22-3), requests to cluster A increase to 1,200 QPS. The frontends in A are not able to handle requests at 1,200 QPS" | — |
| 확인 3 헬스 체크 실패로 남은 서버 부하가 커짐 | 맞음 | 3단계 근거와 같아요. | — |

## 반영

- 고칠 곳은 없었어요.
