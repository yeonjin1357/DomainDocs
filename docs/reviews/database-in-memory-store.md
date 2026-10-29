# 사실 확인: 인메모리 저장소(Redis)

- 글: src/content/docs/database/in-memory-store.mdx
- 확인일: 2026-10-29

| 확인한 주장 | 근거(URL) |
| --- | --- |
| maxmemory 0은 한도 없음(64비트 기본), 정책 목록과 volatile 정책은 TTL 키가 없으면 noeviction처럼 동작, noeviction은 새 데이터를 넣는 명령에 오류·읽기는 정상, 적중률 공식, evicted_keys | https://redis.io/docs/latest/develop/reference/eviction/ |
| maxmemory-policy 기본 noeviction, slowlog-log-slower-than 10000µs, slowlog-max-len 128, appendonly no, appendfsync 기본 everysec, io-threads 기본 꺼짐 | https://github.com/redis/redis/blob/8.2/redis.conf |
| OOM 오류 문구 `OOM command not allowed when used memory > 'maxmemory'.` | https://github.com/redis/redis/blob/8.2/src/server.c (shared.oomerr) |
| RDB는 fork로 자식이 저장, 데이터가 크면 fork로 수 ms에서 1초까지 멈출 수 있음, AOF everysec는 1초쯤 잃을 수 있음 | https://redis.io/docs/latest/operate/oss_and_stack/management/persistence/ |
| KEYS는 운영 코드에서 쓰지 말 것, 보급형 노트북에서 키 100만 개 40ms, 대신 SCAN | https://redis.io/docs/latest/commands/keys/ |
| SLOWLOG 시간은 클라이언트와 주고받는 시간을 빼고 실행 시간만 | https://redis.io/docs/latest/commands/slowlog-get/ |
| used_memory, connected_clients, evicted_keys, keyspace_hits/misses, latest_fork_usec(µs) 정의 | https://redis.io/docs/latest/commands/info/ |
| ElastiCache 지표가 INFO에서 옴, Valkey와 Redis OSS 지표가 같음, EngineCPUUtilization은 엔진 스레드의 CPU이고 4 vCPU 이상에서 이 값을 보라고 함, CacheHitRate 공식, Evictions, CurrConnections, DatabaseMemoryUsagePercentage | https://docs.aws.amazon.com/AmazonElastiCache/latest/dg/CacheMetrics.Redis.html |

- 처음에는 redis:8.2 컨테이너로 기본값, OOM 오류, 축출, KEYS 중 PING 지연을 재현하려 했어요. 실험 도중 Docker Desktop이 종료돼서 재현하지 못했고, 위 문서와 소스로만 확인했어요.
- 4 vCPU에서 스레드 하나가 꽉 차면 25%라는 문장은 계산이에요.
- 함께 한 것: 용어 in-memory-store, rdb, aof, slowlog를 올리고, DB 개요와 「캐시와 적중률」에 이 글을 이었어요. 퀴즈 5문제를 썼어요.
