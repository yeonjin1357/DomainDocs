# 사실 검토: SLI·SLO·에러 버짓

- 글: src/content/docs/foundations/slo-and-error-budget.mdx
- 검토일: 2026-10-13
- 결과: 수정 필요 6건 / 확인 42건

| 주장(인용) | 판정 | 근거(URL과 짧은 인용) | 수정 제안 |
| --- | --- | --- | --- |
| 머리말 summary: "SLO는 성공 비율의 목표이고, 에러 버짓은 그 목표가 허용하는 실패의 양이에요." | 맞음 | https://sre.google/workbook/implementing-slos/ "the SLO is a target percentage and the error budget is 100% minus the SLO." 워크북이 권하는 비율형 SLI를 전제로 한 문장이에요. | — |
| 대시보드 caption: "30일 동안 요청 100만 건 중 1,000건(0.1%)까지 실패할 수 있는데, 500건이 실패했어요. 그래서 성공률은 99.95%이고, 에러 버짓은 절반이 남았어요." | 맞음 | 직접 계산(node): 1,000,000 × 0.001 = 1,000, (1,000,000 − 500) ÷ 1,000,000 = 0.9995, (1,000 − 500) ÷ 1,000 = 0.5. 같은 구조의 원문 예: https://sre.google/workbook/implementing-slos/ "a service that receives 3 million requests over a four-week period had a budget of 3,000 (0.1%) errors ... If a single outage is responsible for 1,500 errors, that error costs 50% of the error budget." | — |
| 대시보드 StatTile "30일 성공률 99.95%", "남은 에러 버짓 50%", "남은 실패 허용 500건" | 맞음 | 캡션 숫자, 핵심 3의 "100만 건이면 1,000건"과 서로 맞아요(위 계산). 다만 100만 건이라는 전제는 캡션에만 있고 타일에는 없어요. 참고: JavaScript로 (1 − 0.9995) ÷ (1 − 0.999)를 계산하면 0.4999999999999445라, 화면에 낼 때 반올림해야 50%가 돼요. | (선택) StatTile에 '30일 요청 1,000,000건'을 더해 500건의 전제를 보여 줘요. |
| 대시보드 ariaLabel: "남은 에러 버짓이 30일 동안 100%에서 50%로 줄어드는 그래프. 중간에 한 번 85%에서 70%로 크게 떨어져요" | 맞음 | values 직접 확인: 첫 값 100, 끝 값 50, 다섯째→여섯째 85→70(−15%p). 다른 구간은 −2~−5%p예요. 버짓 1,000건 기준으로 150건이 한 구간에 실패한 셈이에요. | — |
| 핵심 1 제목: "SLI는 좋은 요청의 비율이에요" | 오해 소지 | SRE Book은 비율이 아닌 SLI도 들어요: https://sre.google/sre-book/service-level-objectives/ "Most services consider request latency ... as a key SLI. Other common SLIs include the error rate ... and system throughput" / "turned into a rate, average, or percentile." 비율형은 워크북의 권장이에요: https://sre.google/workbook/implementing-slos/ "we generally recommend treating the SLI as the ratio of two numbers". 본문 첫째·둘째 문장은 정확해요. | 제목: "SLI는 좋은 요청의 비율로 두면 좋아요" |
| "SLI(service level indicator, 서비스 수준 지표)는 사용자가 겪는 서비스 품질을 잰 숫자예요." | 맞음 | https://sre.google/sre-book/service-level-objectives/ "a carefully defined quantitative measure of some aspect of the level of service that is provided." / https://sre.google/workbook/implementing-slos/ "an SLI is an indicator of the level of service that you are providing." | — |
| "Google SRE 워크북은 SLI를 '좋은 이벤트 수 ÷ 전체 이벤트 수'로 두라고 권해요. 예를 들면 '300ms 안에 성공한 요청 ÷ 전체 요청'이에요." | 맞음 | https://sre.google/workbook/implementing-slos/ "the number of good events divided by the total number of events" / 예: "Number of gRPC calls that completed successfully in < 100 ms / total gRPC requests" | — |
| "비율이라 값이 0~100% 사이에 들어서, 목표와 견주기 쉬워요." | 맞음 | https://sre.google/workbook/implementing-slos/ "The SLI ranges from 0% to 100% ... We have found this scale intuitive" | — |
| "서버 CPU 사용률 같은 내부 지표는 SLI로 두지 않아요. CPU 과부하는 느린 응답의 원인일 뿐, 사용자가 겪는 일은 아니에요." | 맞음 | https://sre.google/sre-book/monitoring-distributed-systems/ 표 6-1: 증상 "My responses are slow" ↔ 원인 "CPUs are overloaded by a bogosort..." / https://docs.cloud.google.com/architecture/framework/reliability/define-reliability-based-on-user-experience-goals "Don't rely solely on server-centric metrics, like CPU usage, which can lead to misleading conclusions about your service's reliability." | (선택) 근거로 위 Google Cloud 신뢰성 원칙 문서를 sources에 더해요. |
| "SLO(service level objective, 서비스 수준 목표)는 SLI가 이뤄야 할 목표값이에요. '30일 동안 99.9%'처럼 기간이 함께 있어야 지켰는지 판정할 수 있어요." | 맞음 | https://sre.google/sre-book/service-level-objectives/ "a target value or range of values for a service level that is measured by an SLI." / https://sre.google/workbook/implementing-slos/ "SLOs can be defined over various time intervals" | — |
| "모든 요청이 30분 동안 실패하면, 하루 기준으론 목표를 깨지만 30일 기준으론 허용 안이에요." | 오해 소지 | 시간 기준이면 맞아요: https://sre.google/sre-book/availability-table/ 99.9% "per month 43.2 minutes", "per day 1.44 minutes". 요청 기준(이 글의 대시보드)에선 장애 때 트래픽에 달려요. 직접 계산(node): 30 ÷ 43.2 = 69%라, 그 30분의 요청이 평균의 1.44배를 넘으면 30일 버짓도 다 써요. 같은 표 "services whose load varies over the course of a day or week". 같은 글 더 깊이의 "요청이 몰린 때라면 버짓을 더 써요"와도 어긋나요. | "요청이 고르게 들어올 때 모든 요청이 30분 동안 실패하면, 하루 기준으론 목표를 깨지만 30일 기준으론 허용 안이에요." |
| "SLA(service level agreement, 서비스 수준 협약)는 목표를 못 지켰을 때 환불 같은 대가를 정한 계약이에요." | 맞음 | https://sre.google/sre-book/service-level-objectives/ "an explicit or implicit contract with your users that includes consequences of meeting (or missing) the SLOs they contain. The consequences are most easily recognized when they are financial—a rebate or a penalty" | — |
| "그래서 SLA 목표는 보통 내부 SLO보다 느슨하게 둬요." | 맞음 | https://cloud.google.com/blog/products/devops-sre/sre-fundamentals-slis-slas-and-slos "Because of this, and because of the principle that availability shouldn't be much better than the SLO, the availability SLO in the SLA is normally a looser objective than the internal availability SLO." '보통'은 원문 "normally"와 같은 세기예요. SRE Book이 말하는 범위: SLO 장은 SLA가 아니라 사용자에게 알린 SLO를 두고 말해요. https://sre.google/sre-book/service-level-objectives/ "Using a tighter internal SLO than the SLO advertised to users gives you room to respond to chronic problems before they become visible externally." 같은 장 "SRE doesn't typically get involved in constructing SLAs". SLA와 직접 묶은 문장은 https://sre.google/sre-book/embracing-risk/ "we might set an external quarterly availability target of 99.9%, and back this target with a stronger internal availability target and a contract that stipulates penalties" | — |
| "SLA가 한 달 99.9%, 내부 SLO가 99.95%라면 내부 목표가 먼저 깨져서, 계약을 어기기 전에 손볼 수 있어요." | 맞음 | https://cloud.google.com/blog/products/devops-sre/sre-fundamentals-slis-slas-and-slos "an availability SLO of 99.9% over one month, with an internal availability SLO of 99.95%" / https://sre.google/sre-book/service-level-objectives/ "room to respond to chronic problems before they become visible externally". 직접 계산(node): 30일 버짓 43.2분 vs 21.6분. 두 목표를 같은 기간으로 잴 때 성립해요. | — |
| "에러 버짓(error budget)은 100%에서 SLO를 뺀 만큼의 실패예요. 30일 99.9%라면 0.1%라서, 30일 요청이 100만 건이면 1,000건까지 실패해도 돼요." | 맞음 | https://sre.google/workbook/implementing-slos/ "the error budget is 100% minus the SLO" / 직접 계산: 1,000,000 × 0.001 = 1,000 | — |
| "시간으로 재면 30일(43,200분)의 0.1%인 43.2분이에요." | 맞음 | https://sre.google/sre-book/availability-table/ 99.9% "per month" "43.2 minutes" / 직접 계산: 30 × 1,440 = 43,200, × 0.001 = 43.2 | — |
| "99.99%로 9를 하나 더하면 버짓은 4.32분으로 10분의 1이 돼요." | 맞음 | https://sre.google/sre-book/availability-table/ 99.99% "per month" "4.32 minutes" / https://sre.google/sre-book/embracing-risk/ "Each additional nine corresponds to an order of magnitude improvement toward 100% availability." | — |
| "Google SRE Book은 신뢰성을 한 단계 올리는 비용이 앞 단계의 100배일 수도 있다고 해요." | 맞음 | https://sre.google/sre-book/embracing-risk/ "an incremental improvement in reliability may cost 100x more than the previous increment." | — |
| "같은 책의 예에선 버짓이 남으면 배포를 이어 가고, 다 쓰면 잠시 멈춰요." | 맞음 | https://sre.google/sre-book/embracing-risk/ "as long as the system's SLOs are met, releases can continue. If SLO violations occur frequently enough to expend the error budget, releases are temporarily halted". 참고: 이 책의 예는 분기 버짓이에요("a quarterly error budget"). | — |
| 확인 1: "평균은 느린 요청을 숨기고, 나쁜 요청을 세지 않아 에러 버짓으로 바꾸기 어려워요. '300ms 안에 끝난 요청의 비율'처럼 임계값 안에 든 요청을 세세요." | 맞음 | https://sre.google/sre-book/service-level-objectives/ "A simple average can obscure these tail latencies" / https://sre.google/workbook/implementing-slos/ 지연 SLI "The proportion of requests that were faster than some threshold.", "this style lends itself easily to the concept of an error budget". percentiles.mdx 요약 "평균은 느린 요청을 숨기고"와 같아요. | — |
| 확인 2: "같은 99.9%라도 하루면 허용 실패가 1.44분, 30일이면 43.2분이에요." | 맞음 | https://sre.google/sre-book/availability-table/ 99.9% "per day" "1.44 minutes", "per month" "43.2 minutes" / 직접 계산: 1,440 × 0.001 = 1.44 | — |
| 확인 2: "대시보드 시간 범위(예: 최근 6시간)로 구한 성공률을 SLO와 견주면, 30일이 아니라 6시간을 판정한 거예요." | 맞음 | SLO는 정한 기간의 SLI로 판정해요: https://sre.google/workbook/implementing-slos/ "SLOs can be defined over various time intervals, and can use either a rolling window or a calendar-aligned window" | — |
| 확인 3: "SLO가 100%라면 목표부터 다시 잡으세요. 에러 버짓이 0이라 실패 한 건이 곧 위반이고, 배포할 여유도 없어요." | 맞음 | https://sre.google/workbook/implementing-slos/ "If your SLO is aligned with customer satisfaction, 100% is not a reasonable goal." / "you can never update or improve your service. The number one source of outages is change" / https://sre.google/sre-book/embracing-risk/ "100% is probably never the right reliability target." | — |
| 확인 3: "쓴 버짓을 (1 − SLI) ÷ (1 − SLO)로 구하면 0으로 나눠서, JavaScript에선 Infinity나 NaN이 돼요." | 맞음 | 직접 계산(node): (1 − 0.999) / (1 − 1) = Infinity, (1 − 1) / (1 − 1) = NaN. 식은 버짓 정의(100% − SLO)에서 나와요: 실패 비율 ÷ 허용 실패 비율. | — |
| 확인 4: "CPU가 낮아도 DB가 연결을 거부하면 사용자는 에러를 받는데, 이 SLO는 그걸 놓쳐요. 이런 원인 지표는 원인을 찾는 대시보드에 두고, SLO는 성공률과 응답시간 비율로 거세요." | 맞음 | https://sre.google/sre-book/monitoring-distributed-systems/ 표 6-1: 증상 "I'm serving HTTP 500s or 404s" ↔ 원인 "Database servers are refusing connections" / "It focuses primarily on symptoms for paging, reserving cause-oriented heuristics to serve as aids to debugging problems." | — |
| 더 깊이: "요청 기준 SLI는 성공한 요청 ÷ 전체 요청이고, 버짓은 실패해도 되는 요청 수예요. 시간 기준 SLI는 정상이던 시간 ÷ 전체 시간이고, 버짓은 분으로 세요. 43.2분은 시간 기준 숫자예요." | 맞음 | https://sre.google/sre-book/embracing-risk/ 식 그림 "availability = uptime / (uptime + downtime)", "availability = successful requests / total requests" / https://sre.google/sre-book/availability-table/ "Availability is generally calculated based on how long a service was unavailable over some period." | — |
| "요청이 고르게 들어올 때 모든 요청이 실패하면 43분, 10%만 실패하면 7.2시간 만에 30일 버짓을 다 써요." | 맞음 | https://sre.google/workbook/alerting-on-slos/ 표 5-4 "1,000 / 100% / 43 minutes" / 직접 계산(node): 43,200분 ÷ 1,000 = 43.2분, 10% ÷ 0.1% = burn rate 100 → 43,200 ÷ 100 = 432분 = 7.2시간 | — |
| "같은 10분 장애라도 요청이 몰린 때라면 버짓을 더 써요." | 맞음 | https://sre.google/sre-book/availability-table/ "Using an aggregate unavailability metric ... is more useful ... for services whose load varies over the course of a day or week" | — |
| "Google은 시간 기준 대신 요청 기준을 써요. 전 세계에 나뉜 서비스는 어느 때든 일부는 돌아가서, 멈춘 시간을 정하기 어렵기 때문이에요." | 맞음 | https://sre.google/sre-book/embracing-risk/ "a time-based metric for availability is usually not meaningful because we are looking across globally distributed services ... (i.e., we are at least partially "up" at all times). Therefore, instead of using metrics around uptime, we define availability in terms of the request success rate." | — |
| "한 시간에 10건이면 30일 요청이 7,200건이라, 99.9% 버짓은 7건 남짓이에요. 실패 한 건이 버짓의 약 14%를 써요." | 맞음 | https://sre.google/workbook/alerting-on-slos/ "if a system receives 10 requests per hour ... it consumed 13.9% of the 30-day error budget. This scenario allows for only seven failed requests in 30 days." / 직접 계산: 10 × 720 = 7,200, × 0.001 = 7.2, 1 ÷ 7.2 = 13.9% | — |
| "응답시간 SLI도 요청 수로 세요." | 맞음 | https://sre.google/workbook/implementing-slos/ "our latency SLIs are the proportion of requests that are faster than defined thresholds." | — |
| `sum(rate(http_request_duration_seconds_bucket{le="0.3"}[5m])) / sum(rate(http_request_duration_seconds_count[5m]))` ("Prometheus 클래식 히스토그램이라면 300ms 안에 끝난 요청의 비율은 이렇게 구해요.") | 오해 소지 | 원문 식은 서비스별로 나눠요: https://prometheus.io/docs/practices/histograms/ "sum by (job) (rate(http_request_duration_seconds_bucket{le="0.3"}[5m])) / sum by (job) (rate(http_request_duration_seconds_count[5m]))". 글의 식은 `by (job)`이 빠져 모든 서비스의 요청을 한 숫자로 섞어요. percentiles.mdx의 "`sum by (le)`는 ... 다른 레이블을 모두 합쳐요"와 같은 원리예요. promtool 3.15.0으로 확인: 문법 통과, 두 인스턴스(90/100, 40/50)에서 0.8667이 나와 식 자체는 설명대로 계산돼요. 참고: 이 식은 300ms 안에 끝난 실패 요청도 좋은 요청으로 세요(https://sre.google/sre-book/monitoring-distributed-systems/ "an HTTP 500 error ... might be served very quickly"). 지표 이름이 percentiles.mdx의 `http_server_request_duration_seconds_bucket`과 달라요. | 식을 `sum by (job) (rate(http_request_duration_seconds_bucket{le="0.3"}[5m])) / sum by (job) (rate(http_request_duration_seconds_count[5m]))`로 바꿔요(promtool check 통과). 덧붙일 문장: "`by (job)`을 빼면 모든 서비스의 요청이 한 숫자로 섞여요." |
| "이 식은 경계가 0.3초인 버킷(그 시간 이하 요청을 세는 칸)이 꼭 있어야 해요. 없으면 근사값도 없이 결과가 비어요." | 오해 소지 | https://prometheus.io/docs/practices/histograms/ "this expression strictly requires a bucket boundary configured at 0.3. ... Instead of an estimation, no result is returned at all. If only some of the involved histograms have such a bucket, an incomplete result is returned, but without any warning". promtool 확인: 0.3 버킷이 아예 없으면 빈 결과예요. 두 서버 중 한 곳에만 있으면 경고 없이 0.45가 나와요(실제 비율은 0.9 근처). 더 위험한 경우가 빠져 있어요. | 이어 붙일 문장: "일부 서버에만 0.3초 버킷이 있으면, 경고 없이 틀린 값이 나와요." |
| "burn rate(소진율)는 SLO에 견줘 에러 버짓을 쓰는 속도예요. 1이면 SLO 기간이 끝나는 순간 버짓이 정확히 0이 돼요. 99.9%·30일에서 에러율 0.1%가 이어지면 burn rate가 1이에요." | 맞음 | https://sre.google/workbook/alerting-on-slos/ "Burn rate is how fast, relative to the SLO, the service consumes the error budget." / "a burn rate of 1, which means that it's consuming error budget at a rate that leaves you with exactly 0 budget at the end of the SLO's time window" / "With an SLO of 99.9% over a time window of 30 days, a constant 0.1% error rate uses exactly all of the error budget: a burn rate of 1." | — |
| "burn rate는 어떤 구간의 에러율을 (1 − SLO)로 나눈 값이에요. 99.9%에서 에러율이 1%면 10이라 3일 만에, 100%면 1,000이라 43분 만에 버짓을 다 써요." | 맞음 | https://sre.google/workbook/alerting-on-slos/ 표 5-4 "Burn rate / Error rate for a 99.9% SLO / Time to exhaustion": "10 / 1% / 3 days", "1,000 / 100% / 43 minutes". 나눗셈 식은 원문에 따로 없지만, 표의 관계와 규칙식 "> 36 * 0.001"이 같은 뜻이에요. 직접 계산: 0.01 ÷ 0.001 = 10, 30일 ÷ 10 = 3일 | — |
| "SRE 워크북은 30일 99.9% SLO의 알림 출발점으로 이런 값을 권해요. 1시간 burn rate 14.4(버짓 2%)나 6시간 6(5%)이면 사람을 호출해요. 3일 1(10%)이면 티켓(나중에 처리할 작업)만 남겨요." | 맞음 | https://sre.google/workbook/alerting-on-slos/ "We recommend 2% budget consumption in one hour and 5% budget consumption in six hours as reasonable starting numbers for paging, and 10% budget consumption in three days as a good baseline for ticket alerts." 표 5-6 "2% / 1 hour / 14.4 / Page", "5% / 6 hours / 6 / Page", "10% / 3 days / 1 / Ticket". 표 5-8 "Recommended parameters for a 99.9% SLO alerting configuration". 티켓: "a ticket-based notification to address the alert the next working day" | — |
| "쓴 버짓은 burn rate × 구간 ÷ 30일이라, 14.4 × 1시간 ÷ 720시간 = 2%예요." | 맞음 | https://sre.google/workbook/alerting-on-slos/ "The error budget consumed by the time the alert fires is: burn rate × alerting window size / period" / 직접 계산(node): 14.4 × 1 ÷ 720 = 0.02, 6 × 6 ÷ 720 = 0.05, 1 × 72 ÷ 720 = 0.1 | — |
| "에러율은 실패 요청과 전체 요청 카운터의 rate로 구해요." | 맞음 | https://sre.google/workbook/alerting-on-slos/ 기록 규칙 "sum(rate(slo_errors[10m])) by (job) / sum(rate(slo_requests[10m])) by (job)". counters-and-rate.mdx의 "서버마다 rate를 먼저 구하고 더하세요"와 같은 순서예요. | — |
| `sum(rate(slo_errors[1h])) / sum(rate(slo_requests[1h])) > 14.4 * 0.001` ("워크북의 식을 풀어 쓰면 1시간 알림은 이래요.") | 오해 소지 | 원문은 job별이에요: https://sre.google/workbook/alerting-on-slos/ "sum(rate(slo_errors[10m])) by (job) / sum(rate(slo_requests[10m])) by (job)", 알림 "job:slo_errors_per_request:ratio_rate1h{job="myjob"} > (14.4*0.001)". 글의 식은 `by (job)`과 `{job="myjob"}`이 빠져 원문과 같은 식이 아니에요. promtool 확인: pay(에러 2%, burn rate 20)와 other(에러 0%, 요청 9배)를 함께 넣으면 글의 식은 0.002라 울리지 않고, `by (job)` 식은 pay에서 울려요. 문법과 연산자 우선순위(`*`가 `>`보다 먼저)는 문제없어요. | 식을 `sum by (job) (rate(slo_errors[1h])) / sum by (job) (rate(slo_requests[1h])) > 14.4 * 0.001`로 바꿔요(promtool check 통과). 덧붙일 문장: "`by (job)`이 없으면 다른 서비스 요청에 묻혀 알림이 안 울릴 수 있어요." |
| "0.001은 1 − SLO(99.9%)예요." | 맞음 | 직접 계산: 1 − 0.999 = 0.001. https://sre.google/workbook/alerting-on-slos/ "> 36 * 0.001" | — |
| "긴 구간의 1/12인 짧은 구간(1시간이면 `[5m]`)도 함께 넘을 때만 울리면, 장애가 끝나고 1시간이 아니라 5분 뒤에 알림이 풀려요." | 맞음 | https://sre.google/workbook/alerting-on-slos/ "A good guideline is to make the short window 1/12 the duration of the long window" / "exceed the 14.4x burn rate over both the previous one hour and the previous five minutes ... ceasing to fire five minutes later, rather than one hour later". promtool 확인(분당 100건, 60~70분에 에러 15%): 1시간+5분 식은 73분까지 울리고 74분에 풀려요. 1시간 식만 쓰면 120분에도 울리고 124분에는 풀려 있어요. | — |
| "고정 기간(calendar window)은 매달 1일부터 말일까지처럼 달력에 맞춘 기간이에요. 새 기간이 시작되면 처음부터 다시 세서, 말일의 큰 장애가 다음 날 셈에서 빠져요." | 맞음 | https://sre.google/workbook/implementing-slos/ "a calendar-aligned window (e.g., a month)" / "if you have a large outage on the final day of a month, your user doesn't suddenly forget about it on the first day of the following month." | — |
| "이동 기간(rolling window)은 지금부터 거슬러 올라간 30일이에요. 실패는 30일 동안 셈에 남다가 빠지고, 빠지는 날 남은 버짓이 다시 늘어요." | 오해 소지 | 이동 기간의 길이는 정하기 나름이고, 워크북 기본값은 4주예요: https://sre.google/workbook/implementing-slos/ "We have found a four-week rolling window to be a good general-purpose interval." 같은 단락 끝 문장(4주)과 바로 다음 단락(30일은 주말 수가 흔들림)과도 어긋나 보여요. | "이동 기간(rolling window)은 지금부터 거슬러 올라간 일정 기간(예: 30일)이에요." / "실패는 그 기간 동안 셈에 남다가 빠지고, 빠지는 날 남은 버짓이 다시 늘어요." |
| "SRE 워크북은 이쪽이 사용자 경험에 더 가깝다고 보고, 4주 이동 기간을 무난한 기본값으로 꼽아요." | 맞음 | https://sre.google/workbook/implementing-slos/ "Rolling windows are more closely aligned with user experience" / "We have found a four-week rolling window to be a good general-purpose interval." 참고: 글의 다른 숫자(43.2분, 4.32분, 14.4, ÷ 720시간)는 모두 30일 기준이에요. 워크북 알림 장도 30일을 써서 틀리진 않아요. 4주(28일)면 99.9% 버짓은 40.32분, 1시간에 2%를 쓰는 burn rate는 13.44예요(node). | (선택) "이 글의 숫자는 워크북 알림 장처럼 30일로 계산했어요." / "4주면 99.9% 버짓은 40.32분이에요." |
| "주 단위로 잡으면 기간마다 주말 수가 같아요. 30일 기간은 주말이 네 번일 때도, 다섯 번일 때도 있어서, 주말 트래픽이 다르면 SLI가 괜히 흔들려요." | 맞음 | https://sre.google/workbook/implementing-slos/ "We recommend defining this period as an integral number of weeks so it always contains the same number of weekends. For example, if you use a 30-day window, some periods might include four weekends while others include five weekends. If weekend traffic differs significantly from weekday traffic, your SLIs may vary for uninteresting reasons." 직접 계산(node): 30일 기간의 토·일 수는 시작 요일에 따라 4개 또는 5개예요. | — |
| "고정 기간은 분기 계획 같은 사업 일정과 맞아요. 대신 기간 중간에는 남은 기간의 요청 수를 몰라서, 요청 기준 버짓의 크기를 짐작해야 해요." | 맞음 | https://sre.google/workbook/implementing-slos/ "Calendar windows are more closely aligned with business planning and project work." / "in the middle of the quarter, it is impossible to know how many requests you will receive for the rest of the quarter. Therefore, decisions made mid-quarter must speculate as to how much error budget you'll spend" | — |
| 머리말 sources 8개 | 맞음 | 8개 URL을 모두 내려받아 위 인용을 확인했어요. Google Cloud 블로그 머리에는 "We've written an expanded and updated version of this post" 안내가 있고, 개정판 https://cloud.google.com/blog/products/devops-sre/sre-fundamentals-sli-vs-slo-vs-sla 도 같은 "normally a looser objective" 문장과 99.9%/99.95% 예를 담고 있어요. | (선택) 블로그 출처를 2021 개정판으로 바꿔요. |
| 관련 글과의 일관성(percentiles.mdx, counters-and-rate.mdx) | 맞음 | percentiles.mdx: 평균이 꼬리를 숨김, 클래식 버킷은 누적이고 `le` 이하를 셈, 서버마다 버킷 경계가 같아야 함 → 이 글의 설명과 같아요. counters-and-rate.mdx: rate = 초당 증가량, `sum(rate(...))` 순서, 알림에는 rate → 같아요. 어긋나는 설명은 없어요. 지표 이름 차이는 위 히스토그램 식 행에 적었어요. | — |

## 반영

검증: PromQL 두 식은 GitHub 릴리스에서 받은 promtool 3.15.0으로 돌렸어요. prometheus-3.15.0.windows-amd64.zip이고, sha256 5d333b38…f87e가 sha256sums.txt와 일치했어요. 글에 실린 줄바꿈 그대로 YAML에 옮겨 `check rules`와 `test rules`를 했어요. 숫자는 node v22.17.1로 다시 계산했어요.

- (오해 소지, 핵심 1 제목) 반영. 제목을 "SLI는 좋은 요청의 비율로 두면 좋아요"(22자)로 바꿨어요. 본문 둘째 문장 "워크북은 … 두라고 권해요"와 세기가 같아요.
- (오해 소지, 핵심 2 30분 장애) 반영. "요청이 고르게 들어올 때 모든 요청이 30분 동안 실패하면, …"으로 조건을 밝혔어요.
  - 같은 주장이 있는 확인 2도 고쳤어요. 새 문장은 "같은 99.9%라도 시간으로 재면 하루는 1.44분, 30일은 43.2분까지 허용돼요."예요.
  - 더 깊이의 "43.2분은 시간 기준 숫자예요", "요청이 몰린 때라면 버짓을 더 써요"와 맞아요.
- (오해 소지, 더 깊이 히스토그램 식) 반영.
  - 식을 `sum by (job) (…{le="0.3"}[5m])) / sum by (job) (…_count[5m]))`로 바꾸고, 원문처럼 세 줄로 나눴어요.
  - 앞 문장에 "서비스(`job`)마다"를 넣고, 뒤에 "`by (job)`을 빼면 모든 서비스의 요청이 한 숫자로 섞여요."를 붙였어요.
  - 지표 이름은 percentiles.mdx·why-numbers-differ.mdx와 같은 `http_server_request_duration_seconds`로 바꿨어요. 확인 1의 `<Term>`으로 percentiles.mdx에 가면 같은 히스토그램을 다른 이름으로 보게 돼서예요.
  - promtool: pay 90/100, search 40/50 → `{job="pay"} 0.9`, `{job="search"} 0.8`(부동소수점으로 0.8999…, 0.7999…)이에요. `by` 없이 쓰면 0.8667이에요.
  - 참고로 준 "300ms 안에 끝난 실패 요청도 좋은 요청으로 세요"도 받아들였어요. 핵심 1의 예('300ms 안에 성공한 요청')와 어긋나지 않게 두 문장을 더했어요. "실패는 성공률 SLI로 따로 세요. 워크북의 예도 성공률 SLI와 응답시간 SLI를 따로 둬요."예요.
  - 근거는 워크북 "Our availability SLI is the proportion of successful requests, and our latency SLIs are the proportion of requests that are faster than defined thresholds."예요.
- (오해 소지, 더 깊이 0.3초 버킷) 반영. 새 문장은 "없으면 결과가 비고, 일부 서버에만 있으면 경고 없이 틀린 값이 나와요."예요.
  - promtool: 0.3 버킷이 아예 없으면 빈 결과예요.
  - 두 서버 중 a에만 있으면(각 100건, a는 90건이 0.3초 이하) `{job="pay"} 0.45`(0.44999…)가 경고 없이 나와요.
- (오해 소지, 더 깊이 burn rate 식) 반영. 식을 `sum by (job) (rate(slo_errors[1h])) / sum by (job) (rate(slo_requests[1h])) > 14.4 * 0.001`로 바꾸고, 세 줄 + 비교 한 줄로 나눴어요.
  - 덧붙일 문장은 구체 숫자로 썼어요. 새 문장은 "`by (job)`이 없으면 한 서비스의 에러가 다른 서비스 요청에 묻혀요. 에러율 2%(burn rate 20)인 서비스도 요청이 9배인 정상 서비스와 합치면 0.2%라 울리지 않아요."예요.
  - promtool: pay(에러 2/분, 요청 100/분)와 other(에러 0, 요청 900/분)로 70분에 평가했어요. `by (job)` 식은 `{job="pay"} 0.02`라 알림이 울려요. `by` 없는 식은 `{} 0.002`라 울리지 않아요.
  - node: 2 ÷ 1,000 = 0.002, 0.02 ÷ 0.001 = 20이에요.
- (오해 소지, 더 깊이 이동 기간 정의) 반영. "지금부터 거슬러 올라간 일정 기간(예: 30일)이에요. 실패는 그 기간 동안 셈에 남다가 빠지고, …"로 바꿨어요.
  - 30일과 4주가 어긋나 보이지 않게 (선택) 제안도 넣었어요. 새 문장은 "이 글의 숫자는 워크북 알림 장처럼 30일로 계산했고, 4주(28일)면 99.9% 버짓은 40.32분이에요."예요(node: 28 × 1,440 × 0.001 = 40.32).
  - 본문의 '30일 동안 99.9%'는 예시라 그대로 뒀어요.
- (선택, 대시보드 100만 건 전제) 반영. 타일 "30일 요청 100만건"을 맨 앞에 더했고, "남은 실패 허용 500건"에 note "1,000건 중"을 달았어요. 이제 타일만 읽어도 500건이 어디서 나왔는지 보여요.
  - 타일이 4개라 좁은 화면에서는 2 × 2로 놓여요. 3개일 때의 2 + 1보다 고르게 보여요.
- (선택, CPU 근거 문서) 반영. sources에 "Google Cloud — Define reliability based on user-experience goals (CPU 같은 서버 지표)"를 더했어요.
  - 받아서 확인한 문장은 "Don't rely solely on server-centric metrics, like CPU usage, which can lead to misleading conclusions about your service's reliability."예요.
- (선택, 블로그 개정판) 반영. sources를 2021 개정판 "SRE fundamentals: SLI vs SLO vs SLA"(https://cloud.google.com/blog/products/devops-sre/sre-fundamentals-sli-vs-slo-vs-sla)로 바꿨어요.
  - 받아서 확인했어요. "normally a looser objective than the internal availability SLO" 문장과 99.9% / 99.95% 예가 그대로 있어요.
- (참고, JavaScript 반올림) 반영 안 함. node로 (1 − 0.9995) ÷ (1 − 0.999) = 0.4999999999999445인 건 확인했어요.
  - 하지만 이 글에는 남은 버짓을 계산하는 코드 예가 없어요.
  - 본문은 1,408자(최대 1,500자)이고, 확인 3이 이미 같은 식의 0 나누기를 다뤄요. 그래서 넣지 않았어요.
- (작성자) `related`에 이번에 커밋된 `foundations/red-and-use`를 더했어요. SLI의 에러·응답시간이 RED의 Errors·Duration과 같은 재료라서예요.
- (작성자, 분량) 본문 1,408자, 더 깊이 1,842자(문장 기준, 코드 블록 2개 별도), 출처 9개예요. 문장은 모두 80자 이하이고, `npm run lint:content`는 위반 0건이에요.
- (글 검토 1차, 그림) 타일을 캡션과 같은 계산 순서로 바꿨어요: 30일 요청 100만건 → 성공률 99.95% → 실패한 요청 500건(note "허용 1,000건 중") → 남은 에러 버짓 50%.
  - 이제 500은 캡션과 같이 '실패한 수'라는 한 뜻만 있어요.
  - 숫자는 사실 검토 때 확인한 그대로예요(1,000,000 × 0.001 = 1,000, 500 ÷ 1,000 = 50%).
- (글 검토 1차) 핵심 2의 "허용 안이에요"를 "허용 범위 안이에요"로 바꿨어요. '허용 안 돼요'로 거꾸로 읽히지 않게 했어요.
- (글 검토 1차) 더 깊이의 실패 요청 문장을 핵심 1의 예와 이었어요.
  - 새 문장은 "이 식은 300ms 안에 끝난 실패 요청도 좋은 요청으로 세서, 핵심 1의 '300ms 안에 성공한 요청'과 달라요. 이 식을 쓴다면 실패는 성공률 SLI로 따로 세요."예요.
  - 근거 문장도 원문대로 "예시 서비스"로 좁혔어요.
- (글 검토 1차) 더 깊이를 다듬었어요. 사실은 위 검토 범위 안이에요.
  - `slo_errors`·`slo_requests`가 같은 책의 예시 이름이라고 밝히고, 기준 "1시간 에러율이 1.44%를 넘으면 울려요"를 더했어요(14.4 × 0.001).
  - 히스토그램 식의 분자·분모 풀이를 더했어요.
  - 버킷이 일부에만 있을 때 "실제보다 낮은 값"이라고 방향을 밝혔어요. promtool 결과 0.9 → 0.45와 같아요.
  - 짧은 구간은 "길게는 1시간 남던 알림이 5분 안에 풀려요"로 바꿨어요. 사실 검토의 promtool 결과는 1시간 구간만 쓰면 약 50분 넘게 남고, 5분 구간을 함께 쓰면 4분 안에 풀렸어요.
  - "43분"을 "43.2분"으로 맞췄어요.
  - burn rate 숫자 앞에 "burn rate"·"버짓"을 붙였어요.
  - 그림의 burn rate 0.5를 더했어요(0.05% ÷ 0.1%).
  - "Google은 …"을 "Google SRE Book은 가용성을 시간 대신 요청 기준으로 재요"로 좁혔어요.
  - 4주 문장을 따로 단락으로 뺐어요.
- (글 검토 1차) 본문을 다듬었어요.
  - 핵심 3과 확인 2의 "시간으로 재면"을 "정상이던 시간으로 재면"으로 바꿨어요. 요청 기준 버짓을 시간으로 바꾼다는 뜻으로 읽히지 않게 했어요.
  - 확인 4의 끝을 "SLO는 성공률과 '300ms 안에 끝난 비율'에 거세요"로 바꿨어요.
  - 요약을 "SLO는 좋은 요청 비율의 목표이고, …"로 바꿔 핵심 1과 같은 말로 맞췄어요.
- (묶음 규칙) 본문의 책 이름을 "Google SRE Book"·"Google SRE Workbook"으로 통일했어요. 뒤에 다시 나오는 곳은 "같은 책"으로 줄였어요.
- (글 검토 1차, 분량) 본문 1,435자, 더 깊이 2,086자예요(약 4% 넘음). 검토의 우선순위에 따라 버리거나 줄인 것은 아래와 같아요.
  - 4주 burn rate 13.44와 JavaScript 반올림 문장은 넣지 않았어요.
  - "괄호 안의 비율은 …"을 지웠어요. 괄호에 "버짓 2%"라고 쓰게 돼서 겹쳐요.
  - 예시 이름 풀이는 식 앞 문장에 합쳤어요.
  - 저트래픽 단락을 두 문장으로 줄였어요.

### 묶음 최종 검토 반영 (2026-10-13)

묶음 최종 검토(`.superpowers/sdd/2026-10-13-foundations-batch-3/final-review.md`)의 M5·M6·M7을 반영했어요.

- **M7 짧은 구간 식:** burn rate 식에 같은 식의 `[5m]` 판을 `and`로 이었어요. 두 조건을 괄호로 묶어 Workbook 식과 같은 모양으로 썼어요. PromQL은 `/`·`>`를 `and`보다 먼저 계산해서, 괄호가 없어도 결과는 같아요.
  - 식 앞 문장은 "1시간 알림을 5분 구간과 함께 풀어 쓰면 이래요", 뒤 문장은 "1시간과 5분 에러율이 모두 1.44%를 넘어야 울려요"로 바꿨어요.
  - 짧은 구간 단락은 "1시간 조건만 두면 장애가 끝난 뒤에도 길게는 1시간 울려요. 긴 구간의 1/12인 5분 조건을 함께 걸면 5분 안에 풀려요."예요. 숫자는 앞 기록(약 50분 넘게 남음 / 4분 안에 풀림)과 같아요.
  - promtool 3.15.0으로 확인했어요. red-and-use 기록과 같은 배포본이고 sha256이 일치했어요. 글의 코드 블록을 줄바꿈 그대로 읽어 알림 규칙 Burn1hAnd5m으로 넣고, 고치기 전 1시간 식을 Burn1hOnly로 함께 돌렸어요. `check rules` SUCCESS(2 rules), `test rules` SUCCESS예요.
  - 입력(1분 간격): pay는 분당 요청 100건이고, 60~90분에 분당 에러 10건(10%, burn rate 100)이에요. other는 분당 요청 900건, 에러 0건이에요.
  - 결과(울린 job): 65분은 둘 다 없음(1시간 에러율 약 0.83%라 긴 구간이 아직 안 넘음), 85분은 둘 다 pay예요. 100분(끝나고 10분)과 130분은 Burn1hAnd5m 없음, Burn1hOnly pay예요. 160분은 둘 다 없어요. other는 어느 시점에도 울리지 않았어요.
- **M6 14.4:** "쓴 버짓은 …" 단락에 "버짓 비율로 정한 기준이라, 30일 기간이면 SLO가 99%여도 14.4는 같아요."를 더했어요. 14.4 × 1시간 ÷ 720시간 = 0.02라 식에 SLO 목표가 없어요. alert-conditions 더 깊이의 99% 예(같은 14.4, burn rate 1.67)와 맞아요.
- **M5:** "사람을 호출해요" → "사람을 불러요"예요. alert-conditions·alert-fatigue의 "사람을 부르는 알림"과 같은 말이에요.
- 분량: 본문 1,435자(그대로), 더 깊이 2,129자예요(전 2,083자, M6 문장 +43자, 짧은 구간 단락은 조금 줄임). `npm run lint:content` 위반 0건이에요.
