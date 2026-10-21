# 사실 확인: 메모리와 디스크

- 글: src/content/docs/database/memory-and-disk.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| PostgreSQL 페이지 보통 8KB, 컴파일 때 바꿈 | https://www.postgresql.org/docs/current/storage-page-layout.html "usually 8 kB, although a different page size can be selected when compiling the server" |
| SQL Server 페이지 8KB, 페이지 단위로 읽고 씀, 익스텐트는 8페이지 64KB | https://learn.microsoft.com/en-us/sql/relational-databases/pages-and-extents-architecture-guide "reads or writes whole data pages", "The size of every page is the same: 8 KiB" |
| InnoDB 기본 16KB, 64/32/16/8/4KB, 데이터 디렉터리 만들 때만 | https://dev.mysql.com/doc/refman/8.4/en/innodb-init-startup-configuration.html |
| Oracle DB_BLOCK_SIZE 기본 8192, 2048~32768 | https://docs.oracle.com/en/database/oracle/oracle-database/19/refrn/DB_BLOCK_SIZE.html |
| 버퍼 풀은 메모리에 데이터를 캐시, 덜 쓴 데이터는 LRU 변형으로 내보냄 | https://dev.mysql.com/doc/refman/8.4/en/innodb-buffer-pool.html "aged out of the cache using a variation of the least recently used (LRU) algorithm" |
| 체크포인트에 더티 블록을 모두 쓰고 로그에 표시, I/O 부하를 나눠 씀 | https://www.postgresql.org/docs/current/wal-configuration.html "all dirty data pages are flushed to disk and a special checkpoint record is written", "writing dirty buffers during a checkpoint is spread over a period of time" |
| shared_buffers 25%, 운영체제 캐시 | https://www.postgresql.org/docs/current/runtime-config-resource.html (database-buffer-cache-hit-ratio 검토에서 확인) |
| pg_prewarm, 다시 시작한 뒤 다시 채움 | https://www.postgresql.org/docs/current/pgprewarm.html "reload those same blocks after a restart" |
