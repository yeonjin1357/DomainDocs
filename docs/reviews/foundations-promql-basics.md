# 사실 확인: PromQL 읽는 법

- 글: src/content/docs/foundations/promql-basics.mdx
- 확인일: 2026-10-26

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 레이블 조건 `=`, `!=`, `=~`, `!~`, 정규식은 값 전체와 맞음(`env=~"foo"`는 `^foo$`) | https://prometheus.io/docs/prometheus/latest/querying/basics/ |
| 구간 없는 선택은 lookback(기본 5분) 안의 가장 최근 값, 사라진 시계열은 stale 표시 뒤 결과에서 빠짐 | https://prometheus.io/docs/prometheus/latest/querying/basics/ |
| `[5m]`은 왼쪽이 열리고 오른쪽이 닫힌 구간 | https://prometheus.io/docs/prometheus/latest/querying/basics/ |
| rate와 집계를 섞을 때는 rate를 먼저 해야 카운터 재시작을 알아챔 | https://prometheus.io/docs/prometheus/latest/querying/functions/ |
| 이항 연산은 레이블이 똑같은 시계열끼리 짝짓고, 짝 없는 시계열은 결과에서 빠짐, `ignoring`·`on`·`group_left`·`group_right` | https://prometheus.io/docs/prometheus/latest/querying/operators/ |
| `by`는 적은 레이블만 남기고 `without`은 적은 레이블을 뺌 | https://prometheus.io/docs/prometheus/latest/querying/operators/ |

- 질의 확인: promtool 3.15.1 `test rules`로 api 서버 두 대(200·500, 200·503)와 web 한 대(200·500)의 카운터를 1분 간격으로 넣고 10분 시점에 계산했어요.
  - `sum by (job) (rate(...{status=~"5.."}[5m]))`는 api 0.5, web 0.05였어요.
  - 비율 질의는 api 0.025, web 0.01이었어요.
  - 왼쪽만 `by (job, status)`로 바꾸면 빈 결과였어요.
  - `ignoring(status) group_left`를 쓰면 api 500은 0.01, api 503은 0.015, web 500은 0.01이었어요.
  - `{status=~"5"}`는 빈 결과였어요.
  - a 서버 200의 rate는 9.6, 전체 `sum(rate(...))`는 25였어요.
- 함께 한 것: 퀴즈 5문제를 썼어요. 모니터링 기초는 용어 파일이 없어 용어는 더하지 않았어요.
