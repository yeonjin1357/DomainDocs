# 사실 확인: DB 설정값과 바뀐 이력

- 글: src/content/docs/database/parameters.mdx
- 확인일: 2026-11-03

| 확인한 주장 | 근거(URL) |
| --- | --- |
| ALTER SYSTEM은 postgresql.auto.conf에 적고, 이 파일은 postgresql.conf를 덮어씀. pg_reload_conf로 다시 읽음, 도는 세션은 하던 명령을 마친 뒤 새 값을 받음 | https://www.postgresql.org/docs/current/config-setting.html |
| ALTER DATABASE·ALTER ROLE 값은 새 세션이 열릴 때만 적용되고 파일 값을 덮어씀 | 같은 문서 |
| pg_settings의 context(internal, postmaster, sighup, superuser-backend, backend, superuser, user), pending_restart는 파일에서 바뀌었지만 다시 시작이 필요하면 true | https://www.postgresql.org/docs/current/view-pg-settings.html |
| 실제 PostgreSQL 18.4에서 확인: 처음 checkpoint_timeout 300s(sighup), work_mem 4096kB(user), shared_buffers 16384×8kB=128MB(postmaster), max_connections 100(postmaster). ALTER SYSTEM 직후엔 셋 다 그대로. pg_reload_conf 뒤 checkpoint_timeout 600, work_mem 16MB, shared_buffers는 그대로이고 pending_restart true, 로그에 "cannot be changed without restarting the server". 세션 SET work_mem 64MB는 그 세션에만, 다른 세션은 16MB. 기본값·override가 아닌 설정 18개 | WSL ~/pgreal/settings.mjs(embedded-postgres, PG 18.4) |
| MySQL SET GLOBAL은 지금 값만, SET PERSIST는 지금 값과 mysqld-auto.cnf에, SET PERSIST_ONLY는 파일에만(다시 시작 때 쓰임) | https://dev.mysql.com/doc/refman/8.4/en/set-variable.html, https://dev.mysql.com/doc/refman/8.4/en/persisted-system-variables.html |
| innodb_buffer_pool_size는 Dynamic: Yes | https://dev.mysql.com/doc/refman/8.4/en/innodb-parameters.html |
| Oracle SCOPE=MEMORY는 바로·종료까지, SPFILE은 다음 시작부터, BOTH는 바로·계속. 정적 파라미터는 SPFILE만 | https://docs.oracle.com/en/database/oracle/oracle-database/19/sqlrf/ALTER-SYSTEM.html |
| V$PARAMETER ISSYS_MODIFIABLE: IMMEDIATE(바로), DEFERRED(다음 세션부터), FALSE(spfile로 시작했을 때만 바꾸고 다음 시작부터) | https://docs.oracle.com/en/database/oracle/oracle-database/19/refrn/V-PARAMETER.html |
| sys.configurations의 value는 config_value, value_in_use는 run_value(지금 쓰는 값), is_dynamic 1이면 RECONFIGURE로 쓰임 | https://learn.microsoft.com/en-us/sql/relational-databases/system-catalog-views/sys-configurations-transact-sql |

- 모니터링 그림의 work_mem 64MB→4MB와 시각은 설명용 예시예요.
