# 사실 확인: gRPC·GraphQL·WebSocket 호출

- 글: src/content/docs/apm/grpc-graphql-websocket.mdx
- 확인일: 2026-11-05

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 응답은 (Response-Headers, 메시지, Trailers) 또는 Trailers-Only, HTTP-Status는 `:status 200`, Status는 트레일러의 `grpc-status`, OK여도 트레일러에 보냄 | https://github.com/grpc/grpc/blob/master/doc/PROTOCOL-HTTP2.md |
| 상태 코드 0~16(17개)과 이름 | https://github.com/grpc/grpc/blob/master/doc/statuscodes.md |
| OTel gRPC: 클라이언트 스팬은 OK가 아니면 모두 에러, 서버 스팬은 UNKNOWN·DEADLINE_EXCEEDED·UNIMPLEMENTED·INTERNAL·UNAVAILABLE·DATA_LOSS만 에러, `rpc.status_code`(string, Stable) | https://github.com/open-telemetry/semantic-conventions/blob/main/docs/rpc/grpc.md |
| v1.40.0에서 `rpc.grpc.status_code`를 `rpc.response.status_code`로 대체(deprecate), v1.45.0에서 `rpc.status_code`로 이름 바꿈 | https://github.com/open-telemetry/semantic-conventions/blob/main/CHANGELOG.md |
| OTel GraphQL 스팬은 Development, 이름은 기본 `{graphql.operation.type}`, operation 이름은 클라이언트가 정해 카디널리티가 높을 수 있음 | https://github.com/open-telemetry/semantic-conventions/blob/main/docs/graphql/graphql-spans.md |
| GraphQL over HTTP는 Current Working Draft, data 없는 결과는 4xx·5xx, data와 errors가 함께면 294 권장, application/json만 받는 옛 클라이언트도 같은 규칙에 Content-Type만 바꿔 응답하라고 함 | https://github.com/graphql/graphql-over-http/blob/main/spec/GraphQLOverHTTP.md (Status Codes 절) |
| 101 Switching Protocols로 시작, 1000 정상 종료, 1006은 닫힘 프레임에 넣으면 안 되는 예약 값(비정상 종료 표시) | https://www.rfc-editor.org/rfc/rfc6455 |
| nginx는 뒤쪽이 60초 동안 데이터를 안 보내면 WebSocket 연결을 닫음(proxy_read_timeout) | https://nginx.org/en/docs/http/websocket.html |

직접 돌려 본 것(WSL, Envoy 1.40.2, 접근 로그 `%REQ(:PATH)% %RESPONSE_CODE% %GRPC_STATUS(NUMBER)% %DURATION% %RESPONSE_FLAGS%`):

- grpcio 1.85.1 generic handler 서버: 정상 `http=200 grpc=0`, `ctx.abort(NOT_FOUND)` `http=200 grpc=5`, 처리 안 된 예외 `http=200 grpc=2`(클라이언트 'Exception calling application: bug'), 서버를 끈 뒤 `http=200 grpc=14 flags=UF`(클라이언트 UNAVAILABLE). 마감 0.3초로 1초짜리 호출 → 클라이언트 DEADLINE_EXCEEDED 302ms, Envoy `http=0 flags=DR`. 1초마다 5번 흘려보내는 스트리밍 `http=200 grpc=0 5002ms`.
- graphql 17.1.0 + graphql-http 1.23.1: 정상 200, 가격 필드만 throw → 200 + `data.order.price: null` + `errors[0].path [order, price]`, 없는 필드 `colour` → Accept application/json이면 200, application/graphql-response+json이면 400. 부분 성공을 graphql-response+json으로 받아도 200(294 아님). 접근 로그는 모두 `POST /graphql`.
- ws 8.22.1: 핸드셰이크 101, 5초 뒤 클라이언트가 닫으면 code 1000(메시지 4개), 3초 뒤 서버 프로세스를 끄면 code 1006. Envoy 로그 `GET /live 101 5009ms`, `2968ms`, 둘 다 flags=UC.
