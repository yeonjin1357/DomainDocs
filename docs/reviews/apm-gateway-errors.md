# 사실 확인: 502·504가 날 때

- 글: src/content/docs/apm/gateway-errors.mdx
- 확인일: 2026-10-26

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 502는 게이트웨이가 안쪽 서버에서 잘못된 응답을, 504는 제때 응답을 받지 못함 | https://www.rfc-editor.org/rfc/rfc9110 |
| `proxy_read_timeout` 기본 60s, 두 번 읽는 사이의 시간, `proxy_connect_timeout` 기본 60s | https://nginx.org/en/docs/http/ngx_http_proxy_module.html |
| `proxy_next_upstream` 기본 `error timeout`, POST·LOCK·PATCH는 1.9.13부터 기본으로 넘기지 않음, 응답을 보내기 시작한 뒤엔 못 넘김 | https://nginx.org/en/docs/http/ngx_http_proxy_module.html |
| upstream `keepalive_timeout` 기본 60s(1.15.3부터), `max_fails` 기본 1, `fail_timeout` 기본 10초 | https://nginx.org/en/docs/http/ngx_http_upstream_module.html |
| `$upstream_status`, `$upstream_response_time`, 서버를 고르지 못하면 `$upstream_status`는 502 | https://nginx.org/en/docs/http/ngx_http_upstream_module.html |
| 오류 문구 "upstream timed out", "connect() failed", "upstream prematurely closed connection", "no live upstreams"와 동작 문맥 "connecting to upstream", "reading response header from upstream" | https://github.com/nginx/nginx/blob/master/src/http/ngx_http_upstream.c |
| `ngx_http_upstream_next`에서 시간 초과는 504, 그 밖의 오류(연결 실패, 끊김, 살아 있는 서버 없음)는 502 | 같은 소스 |
| Node.js `server.keepAliveTimeout` 기본 5000ms | https://nodejs.org/api/http.html#serverkeepalivetimeout |

- 명령 확인: WSL Ubuntu의 Node.js v22.22.0에서 `http.createServer().keepAliveTimeout`이 5000으로 나왔어요.
- 메모: 이 PC에는 nginx가 없어 오류를 직접 재현하지 못했어요. 오류 문구와 응답 코드는 nginx 소스로 확인했어요. "(111: Connection refused)"는 리눅스 오류 번호와 문구예요.
- 함께 한 것: 퀴즈 5문제를 썼어요.
