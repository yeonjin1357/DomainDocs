# 사실 확인: 공통 태그와 서비스 카탈로그

- 글: src/content/docs/foundations/service-tags.mdx
- 확인일: 2026-11-04

| 확인한 주장 | 근거(URL) |
| --- | --- |
| `service.name` 필수, 정하지 않으면 `unknown_service:` + 실행 파일 이름, `service.instance.id`는 (namespace, name, id) 셋이 유일, UUID 권장·파드 이름은 기밀로, `service.namespace`로 묶음, `service.criticality`(alpha, critical·high·medium·low) | https://opentelemetry.io/docs/specs/semconv/resource/service/ |
| `deployment.environment.name`은 서비스를 가르는 값이 아님(frontend가 production·staging이면 같은 서비스), 잘 알려진 값 production·staging·test·development | https://opentelemetry.io/docs/specs/semconv/resource/deployment-environment/ |
| `deployment.environment` → `deployment.environment.name` 이름 변경은 1.27.0, 안정은 v1.41.0 | https://github.com/open-telemetry/semantic-conventions/blob/main/CHANGELOG.md |
| 쿠버네티스에서 service.name 채우는 순서: 애노테이션 `resource.opentelemetry.io/service.name` → `app.kubernetes.io/instance` → `app.kubernetes.io/name` → deployment … pod → container | https://opentelemetry.io/docs/specs/semconv/non-normative/k8s-attributes/ |
| k8sattributes 프로세서가 service.name·version·namespace·instance.id를 채울 수 있음 | https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/processor/k8sattributesprocessor |
| `OTEL_SERVICE_NAME`이 `OTEL_RESOURCE_ATTRIBUTES`의 service.name보다 우선 | https://opentelemetry.io/docs/languages/sdk-configuration/general/ |
| Prometheus OTLP: service.name → job(namespace가 있으면 `ns/name`), instance.id → instance, 나머지는 `target_info`, 기본으로 아무것도 올리지 않음, `promote_resource_attributes`, 권장 목록에 deployment.environment와 .name 둘 다, `info()`는 실험 기능, 조인은 lookback(기본 5분) 동안 겹쳐 실패할 수 있음, 시작마다 새 UUID | https://prometheus.io/docs/guides/opentelemetry/ |
| Backstage Component: `type`·`lifecycle`·`owner` 필수, owner는 단 하나의 책임 주체(보통 팀), 파일 이름 catalog-info.yaml | https://backstage.io/docs/features/software-catalog/descriptor-format |
| Datadog 예약 태그 env·service·version, 쿠버네티스 레이블 `tags.datadoghq.com/*`을 워크로드와 파드 템플릿에, APM 앱은 DD_ENV·DD_SERVICE·DD_VERSION, 로그 서비스 기본값은 컨테이너 short-image | https://docs.datadoghq.com/getting_started/tagging/unified_service_tagging/ |
| 쿠버네티스 권장 레이블 app.kubernetes.io/name·instance·version | https://kubernetes.io/docs/concepts/overview/working-with-objects/common-labels/ |

직접 돌려 본 것:

- Prometheus 3.15.1(Windows) `--web.enable-otlp-receiver`, OpenTelemetry Python SDK 1.45.2 + OTLP HTTP 내보내기로 카운터 `orders`를 보냄.
  - checkout/production/pod-a 100, checkout/staging/pod-b 7, checkout-svc/prod/pod-c 50, 리소스 없음 3.
  - 설정 없이: `orders_total`에는 job·instance만, 환경·버전은 `target_info`에만. `sum by (job)` → checkout 107, checkout-svc 50, `unknown_service:python.exe` 3.
  - `promote_resource_attributes`에 deployment.environment.name·service.version → 지표에 `deployment_environment_name`·`service_version` 레이블.
  - 글의 여러 줄 `group_left` 조인 질의 → production 100, staging 7, prod 50으로 나뉨.
- 셸 줄 이어 쓰기: WSL bash에서 글의 `export OTEL_RESOURCE_ATTRIBUTES=\` 세 줄이 `deployment.environment.name=production,service.version=1.4.2` 한 줄이 됨.
