# 사실 검토: 처리량과 동시성

- 글: src/content/docs/apm/throughput-and-concurrency.mdx
- 검토일: 2026-10-14
- 방식: 초안을 다 쓴 뒤 따로 검토했어요(서브 에이전트 없이). Little(2011) 원문은 PDF에서 글자를 뽑아 읽었고, 숫자는 node로 계산했어요.
- 결과: 수정 필요 0건 / 확인 15건 (초안을 쓰는 중에 Tomcat 대기열 설명 1건을 원문대로 바로잡음, 아래 반영 참고)

| 주장(인용) | 판정 | 근거(URL과 짧은 인용) | 수정 제안 |
| --- | --- | --- | --- |
| 핵심 1 "처리량(throughput)은 초당 처리한 트랜잭션 수로, TPS(transactions per second)라고도 불러요." | 맞음 | 용어 정의예요. 처리량을 요청 수의 rate로 구하는 방식은 foundations/red-and-use의 Rate와 같아요. | — |
| 핵심 1 "보통 요청이 끝날 때 늘어나는 요청 수 카운터의 rate로 구해요. 그래서 요청이 밀리면 들어온 수보다 끝낸 수가 먼저 줄어요." | 맞음 | https://opentelemetry.io/docs/specs/semconv/http/http-metrics/ `http.server.request.duration` "Duration of HTTP server requests." 걸린 시간은 요청이 끝나야 알 수 있어서, 이 히스토그램의 개수(`_count`)는 끝날 때 늘어요. "보통"은 다른 방식(들어올 때 세는 카운터)도 있어서 붙였어요. | — |
| 핵심 2 "OpenTelemetry의 `http.server.active_requests`가 이 값이에요. 요청이 시작하면 1 늘고, 끝나면 1 줄어요." | 맞음 | 같은 문서 "Number of active HTTP server requests.", 종류 "UpDownCounter", 단위 "{request}". UpDownCounter는 늘고 줄 수 있는 합계라서, 시작에 +1·끝에 −1로 기록해요. | — |
| 핵심 2 "처리량이 그대로인데 이 값이 늘면, 요청 하나를 붙잡는 시간이 길어졌다는 뜻이에요." | 맞음 | L = λW에서 λ가 같고 L이 늘면 W가 늘어요. | — |
| 핵심 3 "평균 활성 트랜잭션은 평균 처리량에 평균 응답시간을 곱한 값이에요." | 맞음 | Little(2011) p.536 "Little's Law says that the average number of items in a queuing system, denoted L, equals the average arrival rate of items to the system, λ, multiplied by the average waiting time of an item in the system, W." 안정된 상태에선 도착률과 처리량이 같아요. | — |
| 핵심 3 숫자: 200 × 0.5 = 100, 200 × 1.5 = 300, 200 ÷ 1.5 ≈ 133 / 대시보드 133건/초, 1.5초(평소 0.5초, "세 배"), 활성 200 | 맞음 | node: `100 133.33 120 300`. 스레드 200개가 모두 1.5초씩 붙잡히면 끝내는 속도는 200 ÷ 1.5 = 133.3건/초예요(L = 200, W = 1.5 → λ = 133.3). 그래프는 100에서 200으로 오른 뒤 평평해서 캡션과 같아요. | — |
| 핵심 3 "나머지 요청은 스레드를 기다리며 쌓여서, 사용자는 1.5초보다 오래 기다려요." | 맞음 | 아래 Tomcat 행. 들어오는 요청(초당 200)이 끝내는 속도(133)보다 많아서 기다리는 요청이 늘어요. | — |
| 확인 1 "응답시간과 활성 트랜잭션이 함께 늘었다면 … 포화예요. 손님이 줄었다면 활성 트랜잭션도 함께 줄어요." | 맞음 | L = λW. λ가 줄고 W가 같으면 L도 줄어요. 포화 정의는 foundations/red-and-use와 같아요. | — |
| 확인 2 "Tomcat은 따로 정하지 않으면 요청 처리 스레드가 200개예요." | 맞음 | https://tomcat.apache.org/tomcat-10.1-doc/config/http.html `maxThreads` "The maximum number of request processing threads … If not specified, this attribute is set to 200." | — |
| 확인 3 "초당 300건을 0.4초씩 처리하면 평균 120개가 늘 쓰이고" | 맞음 | node: 300 × 0.4 = 120. | — |
| 더 깊이 "관찰 기간의 시작과 끝에 시스템이 비어 있으면 정확히 맞아요. 도착이 시간대마다 달라져도 맞고, 처리 순서와도 상관없어요." | 맞음 | Little(2011) Theorem LL.1 "For a queuing system observed over [0, T] that is empty at 0 and T and has 0 < T < ∞, the formula L = λW holds." "LL.1 holds under nonstationary conditions." "LL.1 holds independent of queue discipline." | — |
| 더 깊이 "기간을 요청 시간보다 충분히 길게 잡으면, 경계에 걸친 요청 몫은 작아져요." | 맞음(추론) | LL.2는 시작·끝에 남은 항목이 있어도 정의를 조금 바꿔 성립해요. 그 차이는 경계에 걸친 항목에서만 나와서, 기간이 길수록 몫이 작아요. | — |
| 더 깊이 "무엇을 시스템으로 보느냐에 따라 W가 달라져요." | 맞음 | Little(2011) "Sometimes a distinction is made between number in queue and total number in queue plus service, the latter being called number in system." | — |
| 더 깊이 Tomcat: `maxThreads` 기본 200, `maxConnections` 기본 8,192, "스레드가 모두 바빠도 연결은 이 수까지 받아 두고, 스레드가 비면 처리해요." | 맞음(추론 포함) | `maxThreads` "determines the maximum number of simultaneous requests that can be handled", `maxConnections` "The maximum number of connections that the server will accept and process at any given time … The default value is 8192". 동시 처리(200)보다 받아 두는 연결(8,192)이 많아서, 나머지 연결은 스레드를 기다려요. 이 대기를 문서가 한 문장으로 쓰지는 않아서 "추론"으로 적어요. | — |
| 더 깊이 "연결이 `maxConnections`에 닿으면, 운영체제 대기열(`acceptCount`, 기본 100)에 연결이 쌓여요. 이 대기열도 차면 새 연결은 거절되거나 시간 초과로 끊길 수 있어요." | 맞음 | `acceptCount` "The maximum length of the operating system provided queue for incoming connection requests when `maxConnections` has been reached." "When this queue is full, the operating system may actively refuse additional connections or those connections may time out. The default value is 100." | — |

## 반영

- 쓰는 중 바로잡은 것: 처음에는 "스레드가 다 차면 `acceptCount` 대기열에 쌓인다"로 쓰려 했어요. Tomcat 문서를 보니 `acceptCount`는 `maxConnections`에 닿은 뒤의 운영체제 대기열이라, 원문대로 두 단계로 나눠 썼어요.
- 가독성 점검(가이드 7장): "스레드"를 처음 쓰는 곳을 "요청을 처리할 스레드"로 풀었어요. 다른 글을 「1편」으로 가리키던 곳은 `<Term>` 링크로 바꿨어요. 핵심은 모두 5문장 이하, 결론형 제목이에요.
