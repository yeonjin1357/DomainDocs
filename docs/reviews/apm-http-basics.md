# 사실 확인: HTTP 요청과 응답

- 글: src/content/docs/apm/http-basics.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 상태를 기억하지 않는 요청·응답 규약 | https://www.rfc-editor.org/rfc/rfc9110.html 1.1 |
| 안전한 메서드 GET·HEAD·OPTIONS·TRACE, 멱등 메서드 PUT·DELETE·안전한 메서드 | 같은 문서 9.2.1, 9.2.2 |
| 1xx~5xx 갈래 정의 | 같은 문서 15 |
| 502(게이트웨이가 잘못된 응답을 받음), 503(일시 과부하·점검), 504(게이트웨이가 제때 응답을 못 받음) | 같은 문서 15.6.3~15.6.5 |

- 고친 것: "5xx 중 셋은 앞단 장비가 만든다"를 "502·504는 게이트웨이·프록시가 만들고, 503은 앱이나 앞단이 보낸다"로 나눴어요.

## 2026-11-03 보강: 연결은 열어 두고 다시 써요

| 확인한 주장 | 근거(URL) |
| --- | --- |
| HTTP/1.1은 기본으로 지속 연결을 써서 한 연결로 여러 요청·응답을 나름 | https://www.rfc-editor.org/rfc/rfc9112.html 9.3 "HTTP/1.1 defaults to the use of persistent connections" |
| 파이프라이닝을 해도 응답은 받은 순서대로 보내야 함 | 같은 문서 9.3.2 |
| HTTP/1.x 클라이언트는 동시 요청에 연결을 여러 개 씀, HTTP/2는 한 연결에서 메시지를 섞어(interleaving) 보내 연결 수를 줄임 | https://www.rfc-editor.org/rfc/rfc9113.html 1 |
| keep-alive 시간이 어긋나면 502(웹 서버 60초, Node.js 5초) | 기존 apm-gateway-errors 검토 기록과 같은 근거 |
