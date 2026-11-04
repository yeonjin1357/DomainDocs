# 사실 확인: JVM 밖의 런타임: Node.js·Python·Go

- 글: src/content/docs/apm/runtimes.mdx
- 확인일: 2026-11-04

| 확인한 주장 | 근거(URL) |
| --- | --- |
| Node.js는 이벤트 루프 하나와 Worker Pool(k개)을 씀, 막힌 스레드는 다른 클라이언트를 처리하지 못함, fs·dns.lookup·crypto.pbkdf2 등·zlib은 스레드 풀 | https://nodejs.org/en/learn/asynchronous-work/dont-block-the-event-loop |
| libuv 스레드 풀 기본 4개, `UV_THREADPOOL_SIZE`로 바꿈, 최대 1024 | https://docs.libuv.org/en/v1.x/threadpool.html |
| prom-client 이벤트 루프 지표 이름, `monitorEventLoopDelay` 값을 그대로 내보내고 수집마다 reset, `eventLoopMonitoringPrecision` 기본 10 | https://github.com/siimon/prom-client (README, lib/metrics/eventLoopLag.js, lib/defaultMetrics.js) |
| GIL: 한 번에 한 스레드만 Python 바이트코드 실행, I/O 때는 늘 GIL을 놓음, 3.13부터 끌 수 있는 빌드 | https://docs.python.org/3/glossary.html |
| free-threaded 빌드는 3.13부터, 기본이 아니고 설치 때 고르는 빌드, `sys._is_gil_enabled()` | https://docs.python.org/3/howto/free-threading-python.html |
| 3.14에서 free-threaded 공식 지원(PEP 779), 한 스레드 코드 5~10% 느림 | https://docs.python.org/3/whatsnew/3.14.html |
| asyncio에서 1초 계산을 그대로 부르면 모든 작업이 1초 늦음 | https://docs.python.org/3/library/asyncio-dev.html |
| Gunicorn은 pre-fork(마스터가 워커 관리), 워커 수 (2 × CPU 코어) + 1, sync 워커는 한 번에 요청 하나 | https://gunicorn.org/design/ (원문 docs/content/design.md) |
| client_python은 스레드 모델을 전제, 프로세스마다 파일을 남기고 MultiProcessCollector가 합침 | https://prometheus.github.io/client_python/multiprocess/ |
| 고루틴은 OS 스레드에 나눠 돌고, 스택은 몇 KB로 시작해 늘었다 줄며, 수십만 개도 실용적 | https://go.dev/doc/faq |
| Go 1.25: 리눅스에서 cgroup CPU 제한(쿠버네티스 CPU limit, request 아님)이 작으면 GOMAXPROCS 기본값으로, 바뀌면 다시 맞춤, 환경 변수나 `runtime.GOMAXPROCS`로 정하면 꺼짐 | https://go.dev/doc/go1.25 |
| `go_goroutines`, `go_threads`, `go_gc_duration_seconds`, 기본 runtime/metrics에 `/sched/gomaxprocs:threads` | client_golang go_collector.go, internal/go_collector_options.go |

직접 돌려 본 것:

- Node.js 22.22(WSL): `/slow`(300ms 계산) 중 `/fast` 0.27초, 혼자면 0.009초. pbkdf2 8개 동시 → 32·32·32·32·63·63·63·63ms, `UV_THREADPOOL_SIZE=8`이면 31~38ms. `monitorEventLoopDelay` 막힘 없음: 간격 1ms p50 1.10, 10ms p50 10.11, 20ms p50 20.14ms. 1초마다 100ms 막기 5초: p99 10.6ms, max 110.0ms(샘플 453개).
- Python 3.12.3(WSL, GIL 있음): 4천만 번 더하기 1개 0.74초, 4개 차례로 3.11초, 스레드 4개 3.41초, 프로세스 4개 0.95초, sleep(1) 4개를 스레드 4개로 1.00초.
- Go 1.27.1(리눅스로 빌드해 WSL에서 실행): NumCPU 16, GOMAXPROCS 16. 고루틴 10만 개 StackInuse +195.8MiB(하나 2.00KiB). Windows에서는 8KiB였음(글에는 리눅스 값만). `systemd-run -p CPUQuota=200%` 안에서 GOMAXPROCS 2. 받는 쪽 없는 채널에 보내는 고루틴을 1,000번 만들면 NumGoroutine 1,001.
- 모니터링 그림 두 장(이벤트 루프 지연과 p99, 7일 고루틴 수)은 설명용 예시예요.
