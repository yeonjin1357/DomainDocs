# 사실 확인: 시각과 시간대

- 글: src/content/docs/foundations/time-and-timezones.mdx
- 확인일: 2026-11-05

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 오프셋이 없으면 날짜만 있는 글은 UTC, 시각까지 있는 글은 로컬로 읽음(역사적 실수로 굳음) | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date (mdn/content index.md 174행) |
| proto3 JSON에서 int64·fixed64·uint64는 10진 문자열, 2^53 넘는 수가 파서마다 조용히 깎이기 때문 | https://protobuf.dev/programming-guides/json/ |
| OTLP JSON은 proto3 표준 JSON 매핑을 따르고, traceId·spanId는 hex, enum은 정수로만 다름 | https://github.com/open-telemetry/opentelemetry-proto/blob/main/docs/specification.md (JSON Protobuf Encoding) |
| PromQL hour·day_of_week·day_of_month 등은 UTC 기준, time()은 1970 UTC부터 초 | https://prometheus.io/docs/prometheus/latest/querying/functions/ |
| date_trunc(text, timestamptz, text) 세 인자 꼴이 있고 시간대 이름을 받음 | https://www.postgresql.org/docs/current/functions-datetime.html |
| Grafana 대시보드 시간대: Default는 사용자·팀·조직 설정, 없으면 브라우저 시간대. Browser time, UTC 등 고를 수 있음 | https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/modify-dashboard-settings/ |
| 리눅스는 POSIX에 따라 epoch 초에서 윤초를 뺌 | https://man7.org/linux/man-pages/man2/time.2.html |

직접 돌려 본 것(WSL Ubuntu 24.04):

- Node.js 22.22.0, `TZ=Asia/Seoul`: 2026-11-05T09:00:00+09:00 = 2026-11-05T00:00:00Z = 1793836800초(10자리)·…000(13)·…000000(16)·19자리. `new Date(1793836800)` → 1970-01-21T18:17:16.800Z, `new Date(ms*1000)` → +058814-06-05. `Number('1793836800123456789')`는 1793836800123456768(출력 …800, 21ns 차이), `JSON.parse`도 같음. `new Date('2026-11-05')` → 11-05T00:00Z, `'2026-11-05T00:00:00'` → 11-04T15:00Z(`TZ=UTC`면 둘 다 00:00Z). 같은 순간 UTC 00:00 / Seoul 09:00 GMT+9 / New York 11-04 19:00 GMT−5 / Berlin 01:00 GMT+1.
- Python 3.12 zoneinfo: New York 2026-03-08은 23시간, 11-01은 25시간. 03-08 02:30은 UTC 07:30 → 다시 03:30 EDT(없는 시각). 11-01 01:30은 fold 0이 05:30 UTC(EDT), fold 1이 06:30 UTC(EST). UTC 04~08시를 뉴욕으로 읽으면 00:00 EDT, 01:00 EDT, 01:00 EST, 02:00 EST, 03:00 EST. 서울의 오프셋 변화는 1987-05-10, 1987-10-11, 1988-05-08, 1988-10-09가 마지막.
- PostgreSQL 18.4(embedded-postgres): 한국 11/04 00시~11/06 23시 시간당 10건, 11/05 07~10시만 500건. `set timezone='UTC'` + `date_trunc('day', ts)`: 11/03 90(9시간), 11/04 1,220, 11/05 730, 11/06 150(15시간). `'Asia/Seoul'`: 240, 1,710, 240. UTC 세션에서 `date_trunc('day', ts, 'Asia/Seoul')`도 240, 1,710, 240.
- promtool 3.5.0 `test rules`: `up == 0 and on() hour() < 9`가 eval_time 2h(UTC 02시)엔 결과 있음, 10h엔 비어 있음, `hour()` at 10h = 10.
