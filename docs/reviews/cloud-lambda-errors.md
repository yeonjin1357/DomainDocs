# 사실 확인: 서버리스 함수 오류가 늘 때

- 글: src/content/docs/cloud/lambda-errors.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| Errors = 코드·런타임 오류(시간 초과 포함), Throttles, 스로틀은 Invocations에 안 들어감, ConcurrentExecutions | https://docs.aws.amazon.com/lambda/latest/dg/monitoring-metrics-types.html |
| "Task timed out after 3.00 seconds" 로그, 함수 하나가 동시성을 다 써 다른 함수가 스로틀, 예약 동시성의 뜻 | https://docs.aws.amazon.com/lambda/latest/dg/troubleshooting-invocation.html |
| 리전 계정 동시성 기본 1,000 | https://docs.aws.amazon.com/lambda/latest/dg/lambda-concurrency.html |
| 비동기: 함수 오류 시 기본 두 번 더 시도, 스로틀(429)·시스템 오류(5xx)는 기본 6시간까지 다시 시도 | https://docs.aws.amazon.com/lambda/latest/dg/invocation-async-error-handling.html |
| 제한 시간 기본 3초, 최대 900초 | https://docs.aws.amazon.com/lambda/latest/dg/configuration-timeout.html |

- 메모: 예시 숫자는 설명용이에요.
