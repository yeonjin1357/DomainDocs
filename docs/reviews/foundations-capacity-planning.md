# 사실 확인: 용량 계획과 예측

- 글: src/content/docs/foundations/capacity-planning.mdx
- 확인일: 2026-11-04

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 꼭 할 세 가지: 리드 타임보다 먼 자연 증가 예측, 출시·행사 같은 계획된(inorganic) 수요 더하기, 정기 부하 테스트로 서버·디스크 같은 자원과 서비스 용량 잇기 | https://sre.google/sre-book/introduction/ |
| 서비스마다 N + 2 같은 중복을 요구하는 예 | https://sre.google/sre-book/software-engineering-in-sre/ |
| 부하 테스트 종류: smoke, average-load(평소 부하 5~60분), stress(평균 넘게 5~60분), soak(평소 부하 몇 시간), spike(몇 분 아주 크게), breakpoint(무너질 때까지 조금씩) | https://grafana.com/docs/k6/latest/testing-guides/test-types/ |
| 닫힌 모형은 앞 반복이 끝나야 다음을 시작, 느려지면 보내는 양이 줄고 coordinated omission이라 부름, 열린 모형은 `constant-arrival-rate`·`ramping-arrival-rate` | https://grafana.com/docs/k6/latest/using-k6/scenarios/concepts/open-vs-closed/ |
| `deriv()`·`predict_linear()`는 단순 선형 회귀, 게이지에만 씀 | https://prometheus.io/docs/prometheus/latest/querying/functions/ |
| M/M/1 평균 응답시간 1/(μ − λ) = 1/(μ(1 − ρ)), ρ = λ/μ는 사용률, λ < μ일 때만 안정 | https://en.wikipedia.org/wiki/M/M/1_queue |
| 남은 일수 질의와 30일 `predict_linear` 알림 | promtool 3.15.1 `test rules`: 500GB에서 하루 20GB씩 7일 줄어 360GB일 때 남은 일수 18.0, 30일 뒤 예측 −2.4e11(알림 발생) |

- 대기열 흉내(Python, 40만 요청, 처리 시간 지수분포 평균 10ms): M/M/1 평균 응답시간 50% 20.2ms, 70% 33.5, 80% 50.3, 90% 103.2(식 100). M/M/4 평균 50% 1.09배, 80% 1.76배, 90% 3.05배, 95% 6.11배, p99 50% 47.8ms, 70% 55.4, 80% 69.8, 90% 125.7, 95% 283.7.
- 계산: 1,500 × 1.05⁶ = 2,010, 2,010 ÷ 320 = 6.28 → 7대 + 1 = 8대. 1,500 × 1.05¹² = 2,694, 직선(75씩) 2,400. 하루 요청 그림의 평균 822.9 ≈ 823.
- 그림의 서비스 숫자(하루 요청, 12주 CPU 추세, 리드 타임 6주)는 설명용 예시예요.
- (2026-11-06 그림 다시 그림) 사용률 곡선은 M/M/1 평균 응답시간 = 처리 시간 ÷ (1 − 사용률)로 그렸어요: 50% 2배, 70% 3.33배, 80% 5배, 90% 10배, 95% 20배(위 흉내 결과와 맞아요). 대수 그림의 2,010 ÷ 320 = 6.28은 그림에 6.3으로 적었어요. p99 그림의 점은 위 M/M/4 흉내 p99(48, 55, 70, 126, 284ms)예요.
