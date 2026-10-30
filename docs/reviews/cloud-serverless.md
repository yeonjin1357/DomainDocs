# 사실 확인: 서버리스 함수

- 글: src/content/docs/cloud/serverless.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 서버 유지·용량·확장·패치를 Lambda가 맡음, 이벤트(API·S3·SQS 등)에 반응, 호출마다 상태를 나누지 않음, 쓴 만큼 과금 | https://docs.aws.amazon.com/lambda/latest/dg/welcome.html |
| 코드 내려받기·환경 준비·초기화 코드 = 콜드 스타트, 그 시간도 과금·지연, 얼려 둔 환경 재사용 = 웜 스타트, 1% 미만·100ms~1초 이상, 개발 함수에서 잦음, Provisioned Concurrency, 몇 시간마다 환경 교체, 초기화 10초 제한 | https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html |
| 동시성 = 처리 중인 요청 수, 요청마다 실행 환경, 동시성 = 초당 요청 × 평균 시간, 리전 계정 기본 1,000, 함수 단위 제어로 중요한 함수 보호 | https://docs.aws.amazon.com/lambda/latest/dg/lambda-concurrency.html |
| 제한 시간 기본 3초, 최대 900초 | https://docs.aws.amazon.com/lambda/latest/dg/configuration-timeout.html |
| Invocations(스로틀 제외), Errors(제한 시간 초과 포함), Throttles(TooManyRequestsException), Duration(콜드 스타트 제외), ConcurrentExecutions | https://docs.aws.amazon.com/lambda/latest/dg/monitoring-metrics-types.html |
| Azure Functions = 서버를 배포·관리하지 않는 서버리스 | https://learn.microsoft.com/en-us/azure/azure-functions/functions-overview |

- 메모: 워터폴의 단계별 시간과 동시성 예시(400 × 3 = 1,200)는 설명용 숫자예요. Lambda 문서는 최근 Event·Web Functions 등으로 나눠 설명하는데, 글은 이벤트 함수 기준이에요.

## 다시 확인 (2026-10-30)

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 리전 기본 동시성 한도 1,000은 그대로 | https://docs.aws.amazon.com/lambda/latest/dg/lambda-concurrency.html |
| 새 계정은 동시성·메모리 할당량이 낮게 시작하고, 쓰는 양에 따라 AWS가 자동으로 올림 | https://docs.aws.amazon.com/lambda/latest/dg/gettingstarted-limits.html |

- 고친 것: 더 깊이에 "새 계정은 한도가 낮게 시작해요"를 더하고, 출처에 Lambda quotas를 더했어요.
