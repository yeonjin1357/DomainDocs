# 사실 확인: 지속 프로파일링

- 글: src/content/docs/apm/continuous-profiling.mdx
- 확인일: 2026-10-26

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 프로파일 신호는 Alpha, 로그·메트릭·트레이스에 이은 네 번째 신호, On-CPU·Off-CPU·Heap·Allocations, 표본 방식, 요청(트레이스)·리소스와 잇기, 메모리 부족 로그·CPU 급등·느린 span에서 프로파일로 | https://opentelemetry.io/docs/concepts/signals/profiles/ |
| 불꽃 그래프의 가로는 표본을 이름순으로 늘어놓은 것(시간 흐름 아님), 세로는 스택 깊이, 넓을수록 자주 나옴, 맨 위가 CPU에서 돌던 함수 | https://www.brendangregg.com/flamegraphs.html |
| Go CPU 프로파일 100Hz 고정, 운영체제는 약 500Hz보다 자주 신호를 주기 어렵고 스택 읽기가 가볍지 않음 | https://github.com/golang/go/blob/master/src/runtime/pprof/pprof.go |
| 지속 프로파일링은 부담이 작은 표본 방식으로 운영에서 모아 데이터베이스에 저장 | https://grafana.com/docs/pyroscope/latest/introduction/continuous-profiling/ |
| Pyroscope가 받는 종류에 CPU(CPU 시간, 벽시계 시간), 메모리, 잠금·mutex 횟수와 시간 등 | https://grafana.com/docs/pyroscope/latest/introduction/profiling-types/ |

- 계산 확인: 100Hz × 10초 = 바쁜 코어 하나당 표본 1,000개.
- 메모: 맨 위 그림과 프로파일 그림의 함수 이름과 몫은 예시예요.
- 함께 한 것: 퀴즈 5문제를 썼어요.
