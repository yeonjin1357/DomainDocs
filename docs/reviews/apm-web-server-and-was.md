# 사실 확인: 웹 서버와 WAS

- 글: src/content/docs/apm/web-server-and-was.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 요청을 다른 서버로 넘김, proxy_read_timeout 기본 60초(두 번 읽기 사이 시간) | https://nginx.org/en/docs/http/ngx_http_proxy_module.html |
| upstream으로 서버 묶음, $upstream_response_time | https://nginx.org/en/docs/http/ngx_http_upstream_module.html |
| $request_time = 첫 바이트를 받은 때부터 마지막 바이트를 보낸 뒤까지 | https://nginx.org/en/docs/http/ngx_http_log_module.html |
| Tomcat maxThreads 기본 200, maxConnections 기본 8192, acceptCount 기본 100, 대기열이 차면 거부·시간 초과 | https://tomcat.apache.org/tomcat-10.1-doc/config/http.html |
| 502·504 정의 | https://www.rfc-editor.org/rfc/rfc9110.html |

- 고친 것: 초안은 "스레드가 다 바쁘면 운영체제 대기열(100)에서 기다린다"였는데, 문서상 그 대기열은 연결 수가 maxConnections에 닿은 뒤에 쓰여요. 스레드가 바쁠 때는 WAS 안에서 기다린다고 고쳤어요. nginx가 시간 초과 때 보내는 코드는 "보통 504"로 썼어요.
