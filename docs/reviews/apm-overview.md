# 사실 확인: 요청 하나가 앱을 지나가는 길

- 글: src/content/docs/apm/overview.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| HTTP는 요청·응답 규약 | https://www.rfc-editor.org/rfc/rfc9110.html "stateless, application-level, request/response protocols" |
| 웹 서버가 요청을 다른 서버로 넘김 | https://nginx.org/en/docs/http/ngx_http_proxy_module.html "allows passing requests to another server" |
| Tomcat은 서블릿 등 표준 구현 | https://tomcat.apache.org/ |

- 메모: 로드 밸런서는 한 줄 정의만 썼어요.
