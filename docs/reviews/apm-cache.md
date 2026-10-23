# 사실 확인: 캐시와 적중률

- 글: src/content/docs/apm/cache.mdx
- 확인일: 2026-10-23

| 확인한 주장 | 근거(URL) |
| --- | --- |
| INFO의 `keyspace_hits`, `keyspace_misses`(main dictionary 조회 성공·실패 수), `evicted_keys`(maxmemory 때문에 지운 키), `expired_keys`, `used_memory`, `maxmemory` | https://redis.io/docs/latest/commands/info/ |
| `noeviction`은 지우지 않고 새 데이터를 넣는 명령에 오류, 읽기는 그대로 됨, `allkeys-lru`는 오래 안 쓴 키부터 | https://redis.io/docs/latest/develop/reference/eviction/ |
| `maxmemory` 0은 한도 없음(64비트 기본), LRU는 근삿값이고 `maxmemory-samples` 5 | https://redis.io/docs/latest/develop/reference/eviction/ |
| `maxmemory-policy` 기본값 noeviction | https://github.com/redis/redis/blob/unstable/redis.conf |
| cache miss는 캐시 확인, DB 조회, 캐시 쓰기 세 번을 오가서 늦어짐, 읽을 때만 채우면 옛 값이 남음 | https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/Strategies.html |
| 같은 시각에 만료되면 DB에 부하가 몰리니 TTL에 jitter를 더하라고 함 | https://docs.aws.amazon.com/whitepapers/latest/database-caching-strategies-using-redis/cache-validity.html |

- 계산 확인: DB로 가는 몫은 1 − 적중률이에요. 90%→80%는 10%→20%, 99%→98%는 1%→2%, 퀴즈의 95%→90%는 5%→10%라 모두 2배예요.
- 메모: 화면 그림(적중률 92%, 축출 1,200개/분, 메모리 97%)은 예시 숫자예요.
- 함께 한 것: 용어 `apm/cache`, `apm/cache-hit-ratio`, `apm/ttl`, `apm/eviction`을 더했고, 퀴즈 5문제를 썼어요.
