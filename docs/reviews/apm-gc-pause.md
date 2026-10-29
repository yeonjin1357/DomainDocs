# 사실 검토: GC 멈춤과 응답시간

- 글: src/content/docs/apm/gc-pause.mdx
- 검토일: 2026-10-14
- 방식: 초안을 다 쓴 뒤 따로 검토했어요(서브 에이전트 없이). Oracle·OpenJDK 문서, Micrometer 소스, OpenTelemetry 규약 원문과 대조했고, 질의는 promtool 3.15.0으로 돌렸어요(`scratchpad/b4prom/b4-test.yml`).
- 결과: 수정 필요 3건 / 확인 13건

| 주장(인용) | 판정 | 근거(URL과 짧은 인용) | 수정 제안 |
| --- | --- | --- | --- |
| 핵심 1 "세로줄이 생기고, 그 높이는 멈춘 시간만큼이에요." | 오해 소지 | 멈춤이 풀린 뒤 남은 처리를 마쳐야 끝나서, 가장 긴 응답시간은 멈춘 시간 + 평소 처리 시간이에요. 그림도 1.2초 멈춤에 꼭대기가 1.4초예요. | "줄의 꼭대기는 멈춘 시간에 평소 처리 시간을 더한 만큼이에요." |
| 확인 2 "그 1초 동안 들어온 요청은 모두 1초씩 늦어요." | 틀림 | 멈춤 끝 무렵에 들어온 요청은 덜 기다려요. 늦어지는 시간은 최대 1초예요. | "그 1초 동안 처리 중이던 요청은 최대 1초씩 늦어요." |
| 더 깊이 Full GC 해석에 출처가 없음 | 보충 | https://docs.oracle.com/en/java/javase/21/gctuning/garbage-first-garbage-collector-tuning.html "The reason that a Full GC occurs is because the application allocates too many objects that can't be reclaimed quickly enough." | 출처 추가(기본 수집기 근거인 Available Collectors도 함께) |
| 핵심 1 몇몇 단계는 앱 스레드를 모두 세움 | 맞음 | https://docs.oracle.com/en/java/javase/21/gctuning/garbage-first-g1-garbage-collector1.html "G1 performs garbage collections and space reclamation in stop-the-world pauses." | — |
| 핵심 2 대부분의 서버에서 기본 G1 | 맞음 | https://docs.oracle.com/en/java/javase/21/gctuning/available-collectors.html "G1 is selected by default on most hardware and operating system configurations" | — |
| 핵심 2·더 깊이 멈춤 목표 200ms, 보장 아님 | 맞음 | https://docs.oracle.com/en/java/javase/17/gctuning/garbage-first-g1-garbage-collector1.html 기본값 표 "-XX:MaxGCPauseMillis=200 The goal for the maximum pause time." JDK 21 문서 "The Garbage-First collector is not a real-time collector. It tries to meet set pause-time targets with high probability over a longer time, but not always with absolute certainty for a given pause." | — |
| 핵심 2 G1은 밀리초~초, ZGC는 마이크로초 | 맞음 | https://openjdk.org/jeps/439 "ZGC's pause times are consistently measured in microseconds; by contrast the pause times of the default garbage collector, G1, range from milliseconds to seconds." | — |
| 핵심 3·더 깊이 Micrometer `jvm.gc.pause`·`jvm.gc.concurrent.phase.time` | 맞음 | JvmGcMetrics `Timer.builder("jvm.gc.concurrent.phase.time")` "Time spent in concurrent phase", `Timer.builder("jvm.gc.pause")` "Time spent in GC pause". JvmMemory `isConcurrentPhase`: `"No GC".equals(cause)`, `"Shenandoah Cycles"`, `name.startsWith("ZGC") && name.endsWith("Cycles")` | — |
| 확인 2 1분에 1초는 1.7% | 맞음 | 1 / 60 = 0.0167. promtool: `rate(jvm_gc_pause_seconds_sum[5m])` = 0.01667 | — |
| 확인 3 ZGC·Shenandoah는 Cycles와 Pauses를 따로 알림 | 맞음 | JvmGcMetrics 주석 "Skip Shenandoah and ZGC gc notifications with the name Pauses", 이름 `"Shenandoah Cycles"`, `"ZGC Major Cycles"` | — |
| 확인 4 GC 멈춤은 워터폴에서 하위 구간 없는 빈칸 | 맞음 | 멈춘 동안 새 span이 생기지 않아요. 빈칸 해석은 apm-trace-waterfall 검토 근거와 같아요. | — |
| 더 깊이 young collection 멈춤, Remark·Cleanup | 맞음 | G1 문서 "Marking finishes with two special stop-the-world pauses: Remark and Cleanup." | — |
| 더 깊이 Full GC는 대비책, 힙 전체를 멈춘 채 정리 | 맞음 | G1 문서 "As backup, if the application runs out of memory while gathering liveness information, G1 performs an in-place stop-the-world full heap compaction (Full GC)" | — |
| 더 깊이 ZGC 1ms, 힙 크기 무관 | 맞음 | JEP 439 "Pause times should not exceed 1 millisecond", "ZGC's low pause times are independent of heap size: … a few hundred megabytes all the way up to multiple terabytes" | — |
| 더 깊이 Prometheus 이름, 비율 질의 | 맞음 | Micrometer Timer는 Prometheus에서 `_seconds_count`·`_sum`·`_max`로 나가요. promtool: 서버 a 0.01667, b 0 | — |
| 더 깊이 OpenTelemetry `jvm.gc.duration`, `jvm.gc.name`, `jvm.gc.action` | 맞음 | https://opentelemetry.io/docs/specs/semconv/runtime/jvm-metrics/ "Duration of JVM garbage collection actions.", 예 `G1 Young Generation`, `end of minor GC` | — |

## 반영

- 위 세 건을 고쳤어요. 출처에 G1 튜닝 문서와 Available Collectors를 더했어요.

## 2026-10-29 보강

- 메모: "대부분의 서버에서 기본 G1"에 조건(CPU 2개, 메모리 1792MB 이상)을 붙였어요. 근거는 apm-gc-logs 검토의 JDK 소스와 컨테이너 실험이에요. apm/jvm-memory에도 같은 조건과 GC 로그 읽기 링크를 더했어요.
