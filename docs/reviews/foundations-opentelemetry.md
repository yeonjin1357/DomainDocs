# 사실 확인: OpenTelemetry의 구성

- 글: src/content/docs/foundations/opentelemetry.mdx
- 확인일: 2026-10-26

| 확인한 주장 | 근거(URL) |
| --- | --- |
| OTel은 텔레메트리를 만들고 내보내고 모으는 프레임워크, 백엔드(저장·화면)가 아님 | https://opentelemetry.io/docs/what-is-opentelemetry/ |
| Collector는 여러 형식을 받아 가공하고 여러 백엔드로 보내는 중계, SDK·계측 라이브러리·zero-code 계측 | https://opentelemetry.io/docs/concepts/components/ |
| SDK는 service.name이 없으면 `unknown_service`를 넣음, `OTEL_SERVICE_NAME`으로 정함 | https://opentelemetry.io/docs/concepts/resources/ |
| 정확한 기본값은 `unknown_service:` + 실행 파일 이름(예 `unknown_service:bash`) | https://opentelemetry.io/docs/specs/semconv/resource/service/ |
| HTTP 속성 이름 `http.request.method`, `http.response.status_code` | https://github.com/open-telemetry/semantic-conventions/blob/main/docs/http/http-spans.md |
| OTLP 기본 포트 gRPC 4317, HTTP 4318 | https://github.com/open-telemetry/opentelemetry-proto/blob/main/docs/specification.md |
| 부품은 service의 pipelines에 이어야 켜짐, Collector 기본 수신 주소는 localhost(문서 예시는 0.0.0.0) | https://opentelemetry.io/docs/collector/configuration/ |
| 에이전트는 앱 곁·같은 서버(사이드카, DaemonSet), 게이트웨이는 클러스터·데이터센터·리전마다 하나의 OTLP 입구 | https://opentelemetry.io/docs/collector/deploy/agent/ , https://opentelemetry.io/docs/collector/deploy/gateway/ |
| Collector 없이 SDK가 백엔드로 바로 보내는 방식 | https://opentelemetry.io/docs/collector/deploy/other/no-collector/ |
| 내부 지표 기본 포트 8888, `otelcol_receiver_accepted_spans`, `otelcol_receiver_refused_spans`, `otelcol_exporter_send_failed_spans`, `otelcol_exporter_queue_size`, `otelcol_exporter_queue_capacity`, 기본으로 `_total`을 붙이지 않음(v0.152.0부터 수동 설정에도) | https://opentelemetry.io/docs/collector/internal-telemetry/ |
| `otlp` 내보내기를 `otlp_grpc`로 바꾸고 `otlp`는 지원 중단 예정 별칭(2026-01-14 병합) | https://github.com/open-telemetry/opentelemetry-collector/pull/14403 |
| OTLP gRPC 내보내기는 기본으로 TLS 필요 | https://github.com/open-telemetry/opentelemetry-collector/blob/main/exporter/otlpexporter/README.md |

- 메모: 설정 예시는 공식 Configuration 문서의 예를 줄인 거예요. Collector 바이너리로 돌려 보지는 않았어요.
- 메모: 화면 그림(서비스 목록, Collector 지표 숫자)은 예시예요.
- 함께 한 것: 퀴즈 5문제를 썼어요.
