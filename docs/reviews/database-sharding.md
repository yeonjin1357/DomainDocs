# 사실 확인: 샤딩(여러 DB에 나눠 담기)

- 글: src/content/docs/database/sharding.mdx
- 확인일: 2026-11-03

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 계속 커지거나 줄어드는 샤드 키는 새 쓰기를 MaxKey(MinKey) 청크 하나로 몰리게 함 | https://www.mongodb.com/docs/manual/core/sharding-choose-a-shard-key/ |
| 해시 샤딩은 고르게 나뉘지만 범위 질의는 broadcast가 되기 쉽고, 같은 값 질의는 한 샤드로 targeted | https://www.mongodb.com/docs/manual/core/hashed-sharding/ |
| mongos는 샤드 키가 있으면 targeted, 없으면 모든 샤드에 broadcast하고 결과를 합쳐요 | https://www.mongodb.com/docs/manual/core/sharded-cluster-query-router/ |
| MongoDB 5.0부터 reshardCollection으로 샤드 키 변경 | 샤드 키 문서의 Note, https://www.mongodb.com/docs/manual/core/sharding-reshard-a-collection/ |
| balancer는 샤드마다 데이터 양을 보고 옮기는 백그라운드 작업 | https://www.mongodb.com/docs/manual/core/sharding-balancer-administration/ |
| Citus의 create_distributed_table, 해시 분산 표의 co-location | https://docs.citusdata.com/en/stable/develop/api_udf.html, https://docs.citusdata.com/en/stable/sharding/data_modeling.html |

- 직접 계산(Python): 주문 10만 건으로 범위 경계 25,000/50,000/75,000을 두고 새 주문 100,001~110,000을 넣으면 범위 샤딩은 샤드 4에 100%, MD5 해시 mod 4는 25.3%·24.7%·25.2%·24.9%. 주문 번호 1000~1100 범위 질의는 범위 샤딩 1개, 해시 샤딩 4개 샤드에 닿음.
- 샤드별 초당 쓰기 그림 숫자는 설명용이에요.
