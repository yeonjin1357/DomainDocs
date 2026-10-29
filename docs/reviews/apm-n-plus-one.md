# 사실 확인: 같은 SQL이 수백 번 불릴 때(N+1)

- 글: src/content/docs/apm/n-plus-one.mdx
- 확인일: 2026-10-28

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 자바 데이터 접근 코드가 느린 가장 흔한 원인이 N+1 selects, 손으로 짠 JDBC 코드에도 생김 | https://docs.hibernate.org/orm/7.0/introduction/html_single/Hibernate_Introduction.html (8장) |
| 거의 언제나 outer join fetching을 쓰라, 배치 가져오기는 줄여 줄 뿐 없애지 못함, 조인이 카테시안 곱·큰 결과가 되는 드문 경우에만 배치 | 같은 문서 8.5·8.6 |
| 배치 가져오기 설정 `hibernate.default_batch_fetch_size`, `@BatchSize` | 같은 문서 표 52 |
| JPA 3.2 기본값: ManyToOne EAGER, OneToMany LAZY(OneToOne EAGER, ManyToMany LAZY) | https://github.com/jakartaee/persistence/blob/3.2.1-TCK-RELEASE/api/src/main/java/jakarta/persistence/ManyToOne.java 등 |
| `pg_stat_statements`의 `calls`, `mean_exec_time` | https://www.postgresql.org/docs/current/pgstatstatements.html |
| Elastic APM 자바 에이전트 `transaction_max_spans` 기본 500 | https://github.com/elastic/apm-agent-java/blob/main/docs/reference/config-core.md |

- 재현(PGlite 0.3.16, PostgreSQL 17.5, `enable_seqscan = on`): 고객 1만 명, 주문 10만 건, `orders(customer_id)` 인덱스. 최근 주문 100건과 고객 이름을 30번씩 가져와 중앙값을 봤어요.
  - N+1: SQL 101번, 23.89ms.
  - 고객 번호를 모아 `id = any($1)`: SQL 2번, 1.06ms.
  - 조인: SQL 1번, 0.72ms.
- 참고: Jakarta Persistence 4.0(마일스톤)에서는 to-one 연관의 기본값이 `FetchType.DEFAULT`(영속성 단위 설정을 따름)로 바뀌어서, 글에는 "JPA 3.2의 기본값"으로 버전을 밝혔어요.
- 함께 한 것: 용어 n-plus-one, lazy-loading을 올리고 퀴즈 5문제를 썼어요. 「트레이스 워터폴 읽기」 본문과 「Top SQL」의 Check 링크를 이 글로 이었어요.

## 다시 확인 (2026-10-29)

| 확인한 주장 | 근거(URL) |
| --- | --- |
| JPQL 질의가 EAGER 연관을 빼먹으면 Hibernate는 연관마다 secondary select를 보내 N+1이 될 수 있음, 그래서 LAZY로 두고 질의마다 함께 가져오는 편이 나음 | https://docs.hibernate.org/orm/6.6/userguide/html_single/Hibernate_User_Guide.html#fetching |

- 고친 것: `getCustomer()` 예시는 LAZY일 때의 동작인데, 표는 `@ManyToOne` 기본값이 EAGER라고 해서 어긋났어요. EAGER에서도 목록을 가져오는 순간 N+1이 생긴다는 문단을 더했어요.
