# 사실 확인: 로그 검색이 느릴 때

- 글: src/content/docs/logs/slow-search.mdx
- 확인일: 2026-10-29

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 시간 범위를 먼저 좁힘, Loki는 하루마다 색인 파일 하나라 여러 날 검색은 색인 파일을 더 읽음, 가장 구체적인 라벨부터, 파서는 줄 필터 뒤에, 정규식보다 단순 포함·제외가 빨리 평가됨, 남은 느림은 recording rule | https://grafana.com/docs/loki/latest/query/bp-query/ |
| 넓은 라벨 대신 정해진 값의 라벨, 요청 ID는 필터로 | https://grafana.com/docs/loki/latest/get-started/labels/bp-labels/ |
| 정확한 값 찾기는 keyword 필드 | https://www.elastic.co/docs/reference/elasticsearch/mapping-reference/text |

- 함께 한 것: 퀴즈 4문제를 썼어요.

## 2026-11-03 줄 나누기 확인

- 모바일에서 옆으로 밀리지 않게 질의를 여러 줄로 나눴어요. logcli 3.5.3 `query --stdin`으로 문법을 확인했어요. 로그 질의는 실제로 맞는 줄을 걸렀고, 지표 질의는 해석을 통과했어요(stdin 모드가 지표 질의 실행은 지원하지 않음).
