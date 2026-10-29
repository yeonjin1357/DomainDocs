# 사실 확인: 로그 검색이 느릴 때

- 글: src/content/docs/logs/slow-search.mdx
- 확인일: 2026-10-29

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 시간 범위를 먼저 좁힘, Loki는 하루마다 색인 파일 하나라 여러 날 검색은 색인 파일을 더 읽음, 가장 구체적인 라벨부터, 파서는 줄 필터 뒤에, 정규식보다 단순 포함·제외가 빨리 평가됨, 남은 느림은 recording rule | https://grafana.com/docs/loki/latest/query/bp-query/ |
| 넓은 라벨 대신 정해진 값의 라벨, 요청 ID는 필터로 | https://grafana.com/docs/loki/latest/get-started/labels/bp-labels/ |
| 정확한 값 찾기는 keyword 필드 | https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/text |

- 함께 한 것: 퀴즈 4문제를 썼어요.
