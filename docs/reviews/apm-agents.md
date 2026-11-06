# 사실 확인: APM 에이전트는 어떻게 재나

- 글: src/content/docs/apm/agents.mdx
- 확인일: 2026-11-03

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 계측 방식은 메서드의 바이트코드 수정, 에이전트는 JAR로 묶고 -javaagent:<jarpath>로 시작, premain은 앱 main보다 먼저 불림 | https://docs.oracle.com/en/java/javase/21/docs/api/java.instrument/java/lang/instrument/package-summary.html |
| 실행 중인 JVM에 붙일 땐 Agent-Class와 agentmain, 그때마다 JVM이 표준 에러에 경고를 남김 | 같은 문서 |
| JEP 451: 동적 로딩에 경고를 내고, 앞으로 기본으로 막을 준비. 시작할 때 붙이는 도구는 경고 없음 | https://openjdk.org/jeps/451 |
| OpenTelemetry Java 에이전트는 -javaagent로 붙이고, JAVA_TOOL_OPTIONS로도 지정 가능 | https://opentelemetry.io/docs/zero-code/java/agent/getting-started/ |
| @WithSpan으로 특정 메서드에 span을 만듦 | https://opentelemetry.io/docs/zero-code/java/agent/annotations/ |
| 에이전트는 같은 JVM에서 CPU·메모리·네트워크를 씀, 하나의 부하 수치는 낼 수 없어 직접 재야 함, span 양이 부하에 영향, 샘플링과 계측 끄기(-Dotel.instrumentation.jdbc.enabled=false), JDBC·Redis는 span이 많음, 모든 메서드 @WithSpan은 span을 크게 늘림 | https://opentelemetry.io/docs/zero-code/java/agent/performance/ |

- 워터폴 숫자(900ms, 40ms, 720ms, 120ms)는 설명용 예시예요.
- '스레드에 번호를 붙여 들고 다닌다'는 컨텍스트 전파를 쉽게 푼 말이에요. 자세한 동작은 apm/broken-traces 검토 기록을 따라요.
- (2026-11-06 그림 다시 그림) 메서드 그림의 findOrder(id)는 예시로 붙인 이름이에요. 옵션 -javaagent:otel-agent.jar는 본문의 실행 명령과 같아요.
