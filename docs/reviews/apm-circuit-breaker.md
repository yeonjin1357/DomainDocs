# 사실 확인: 서킷 브레이커

- 글: src/content/docs/apm/circuit-breaker.mdx
- 확인일: 2026-10-28

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 상태 CLOSED·OPEN·HALF_OPEN, 실패율이나 느린 호출 비율이 기준 이상이면 OPEN, 최소 호출 수가 쌓여야 계산(9번 모두 실패해도 열리지 않는 예), OPEN이면 `CallNotPermittedException` | https://resilience4j.readme.io/docs/circuitbreaker |
| 기본값 failureRateThreshold 50, slowCallRateThreshold 100, slowCallDurationThreshold 60000ms, permittedNumberOfCallsInHalfOpenState 10, COUNT_BASED, slidingWindowSize 100, minimumNumberOfCalls 100, waitDurationInOpenState 60000ms, automaticTransitionFromOpenToHalfOpenEnabled false | 같은 문서 |
| 지표 이름 `resilience4j.circuitbreaker.state`(state 태그), `.not.permitted.calls`, `.calls`(kind 태그), `.failure.rate` | https://github.com/resilience4j/resilience4j/blob/master/resilience4j-micrometer/src/main/java/io/github/resilience4j/micrometer/tagged/CircuitBreakerMetricNames.java , https://resilience4j.readme.io/docs/micrometer |
| 실패율은 최소 호출 수 미만이면 -1 | https://github.com/resilience4j/resilience4j/blob/master/resilience4j-circuitbreaker/src/main/java/io/github/resilience4j/circuitbreaker/CircuitBreaker.java (`getFailureRate` 주석) |
| Envoy circuit breaking은 연결·대기 요청·요청·재시도 수 한도, 기본으로 켜져 있고 예로 클러스터당 연결 1,024개 | https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/circuit_breaking |

- 재현(WSL Ubuntu, OpenJDK 17, resilience4j-circuitbreaker 2.2.0):
  - `CircuitBreakerConfig.ofDefaults()` 출력이 위 기본값과 같았어요(대기 60000ms, automaticTransition=false).
  - 창 10·최소 10·대기 1초·반열림 3으로 줄여, 10번 중 7번 실패시키니 `CLOSED to OPEN`, 실패율 70.0.
  - 다음 호출: `CallNotPermittedException: CircuitBreaker 'payment' is OPEN and does not permit further calls`.
  - 1.2초 뒤 호출 전 상태는 여전히 OPEN, 호출이 들어오자 `OPEN to HALF_OPEN`, 성공 3번 뒤 `HALF_OPEN to CLOSED`.
- 첫 화면 숫자(1,240번/분, 3ms, 평소 180ms)는 예시예요.
- 함께 한 것: 용어 circuit-breaker를 올리고 퀴즈 5문제를 썼어요. 「타임아웃과 재시도」, 「장애가 다른 서비스로 번질 때」의 related에 이 글을 더했어요.
