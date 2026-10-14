# 사실 검토: 응답시간 분포도 읽기

- 글: src/content/docs/apm/response-time-distribution.mdx
- 검토일: 2026-10-14
- 방식: 초안을 다 쓴 뒤 따로 검토했어요(서브 에이전트 없이). 문서 원문을 내려받아 대조했고(WhaTap은 한국어판도 함께), 숫자는 손계산으로 확인했어요.
- 결과: 수정 필요 2건 / 확인 13건

| 주장(인용) | 판정 | 근거(URL과 짧은 인용) | 수정 제안 |
| --- | --- | --- | --- |
| 핵심 1 "가로축은 끝난 시각, 세로축은 그 요청의 응답시간이에요." (세로줄 설명이 이 축에 기대요) | 보충 필요 | WhaTap은 "X-axis is the transaction end time"이라고 밝혀요. JENNIFER 글은 가로축을 시각이라고만 하고, 부하 시험 도구에는 시작 시각으로 찍는 예가 있어요(informit "A transaction starting 60 seconds into a run and lasting 5 seconds … point (60, 5)"). 시작 시각 축이면 같은 잠금이 세로줄이 아니라 사선이 돼요. | 더 깊이에 시작 시각 축일 때의 모양과 "가로축이 무슨 시각인지 먼저 봐요"를 더함 |
| 더 깊이 JENNIFER 설명에 끌어 고르기가 빠짐 | 보충 | https://jennifersoft.com/en/?p=2311 "Drag to select an area … you can launch the 'X-View transaction analysis pop-up' window." 핵심 1의 "영역을 끌어 고르면 …" 근거가 WhaTap 하나뿐이었어요. | JENNIFER 문장에 끌어 고르기를 더함 |
| 핵심 1 "응답시간 분포도는 요청이 끝날 때마다 점을 하나 찍어요." | 맞음 | WhaTap(위). JENNIFER p=167 "X-View is a chart indicating the response time of all transactions as individual dots", 끝난(closed) 트랜잭션을 실시간으로 분석 | — |
| 핵심 1 "영역을 끌어 고르면 그 요청들의 트레이스를 열 수 있어요." | 맞음 | https://docs.whatap.io/en/java/trs-view "If you drag the real-time hitmap chart, the TX trace list appears". JENNIFER(위) | — |
| 핵심 1 "점은 요청이 끝나야 찍혀요. 그래서 … 멈춰 있는 요청은 보이지 않아요." | 맞음 | 가로축이 끝난 시각이라 끝나지 않은 요청은 찍을 자리가 없어요(WhaTap 축 정의에서 나와요). | — |
| 핵심 2 세로줄 = 잠금이 풀리며 함께 끝난 요청 | 맞음 | WhaTap "If a temporary lock (not only DB lock) occurs … If the lock is released, pending transactions are finished together at a similar time. This creates vertical lines" | — |
| 핵심 2 가로줄 = 타임아웃, 높이가 타임아웃 값 | 맞음 | WhaTap "In the 10-second timeout condition, if the resources are insufficient, the transactions wait for 10 seconds until a timeout error occurs. At this time, horizontal lines appear near 10 seconds" | — |
| 핵심 2 제목 "줄이 보이면 병목이 있어요" | 맞음 | WhaTap "A line in the transaction response distribution indicates a bottleneck." | — |
| 핵심 3 히트맵은 칸마다 요청 수를 색 진하기로, 칸을 눌러 들어가야 개별 요청 | 맞음 | https://pinpoint-apm.gitbook.io/pinpoint/documents/heatmap "Heatmap aggregates transactions into time/elapsed-time buckets and displays density using color intensity", "Click on a cell to drill down into the individual transactions" | — |
| 확인 2 재시도하면 가로줄이 타임아웃 간격마다 되풀이 | 맞음 | WhaTap "If there is a logic to retry after timeout, the horizontal lines repeat every 10 seconds" | — |
| 확인 3 90%가 50ms, 10%가 2,000ms면 평균 245ms | 맞음 | 0.9 × 50 + 0.1 × 2,000 = 45 + 200 = 245. 두 무리: https://www.brendangregg.com/HeatMaps/latency.html "the application has a \"fast path\" and a \"slow path\", or a resource has cache hits vs cache misses" | — |
| 확인 4 히스토그램 히트맵의 칸 세로 폭은 버킷 경계 | 맞음 | https://grafana.com/docs/grafana/latest/visualizations/panels-visualizations/visualizations/heatmap/ "Calculate from data … already a calculated heatmap", "pre-bucketed data in the wide, one-field-per-bucket data structure", 눈금 맞춤 "Top (LE)" | — |
| 더 깊이 WhaTap 이름·색, Pinpoint 두 화면과 10초 칸, 히트맵을 더한 이유 | 맞음 | WhaTap "they appear in orange or red on the HITMAP transaction chart". Pinpoint "aggregating counts per time bucket (10-second intervals)", "significantly improves rendering performance for high-volume applications" | — |
| 더 깊이 Elastic Latency distribution, 표본 최대 500개 | 맞음 | https://www.elastic.co/docs/solutions/observability/apm/transactions-ui "shows a plot of all transaction durations for the given time period", "Click and drag to select a latency duration bucket to display up to 500 trace samples." | — |
| 더 깊이 뒷단 DB 잠금도 앞단 분포도에 세로줄, 커넥션 풀 예 | 맞음 | WhaTap "The vertical lines for response patterns in the front applications are also detected when any lock occurs in the DB used by the back-end system.", "ConnectionPool is exhausted due to section load, (2) the secondary timeout failure occurred" | — |
| 더 깊이 Grafana 색 대응, 로그 눈금 / Gregg 저장 비용 고정 | 맞음 | Grafana "The leftmost color on the spectrum represents the minimum count", Y Bucket scale "Logarithmic"·"Log". Gregg "the storage cost is fixed, unlike a scatter plot which must store x and y coordinates for every data point. This can make heat maps suitable for visualizing millions of data elements." | — |

## 반영

- 더 깊이 「줄이 생기는 이유」에 가로축이 시작 시각인 도구에서는 같은 현상이 오른쪽 아래로 기운 사선으로 보인다는 단락을 더했어요. 시작 = 끝난 시각 − 응답시간이라, 일찍 시작한 요청일수록 응답시간이 길어요.
- JENNIFER 문장에 끌어 고르면 트랜잭션 분석 창이 뜬다는 내용을 더했어요.
