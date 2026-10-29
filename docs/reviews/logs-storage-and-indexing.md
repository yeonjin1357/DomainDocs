# 사실 확인: 로그 저장과 색인

- 글: src/content/docs/logs/storage-and-indexing.mdx
- 확인일: 2026-10-29

| 확인한 주장 | 근거(URL) |
| --- | --- |
| text 필드는 분석기로 단어 목록을 만들어 색인, 전문 검색용, keyword는 정확한 값·정렬·집계용, text는 정렬에 쓰지 않고 집계에도 드묾 | https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/text |
| Loki는 본문을 색인하지 않고 스트림의 라벨만 색인, 본문은 압축 덩어리로 S3·GCS 같은 객체 저장소에, 작은 색인과 압축으로 비용을 크게 낮춤 | https://grafana.com/docs/loki/latest/get-started/overview/ |
| 값이 끝없는 라벨 금지, 조합이 많으면 스트림이 많아져 색인은 크고 덩어리는 작아짐, 정해진 값(지역, 클러스터, 서버, 앱, 네임스페이스, 환경)을 라벨로, 요청 ID는 필터로 | https://grafana.com/docs/loki/latest/get-started/labels/bp-labels/ |

- 역색인 표와 「모니터링에서는」의 스트림 수(120 → 48,000)는 설명용 예시예요.
- 함께 한 것: 용어 inverted-index, log-label, log-stream을 올리고, 「열 지향 DB와 데이터 웨어하우스」에서 이 글을 이었어요. 퀴즈 5문제를 썼어요.
