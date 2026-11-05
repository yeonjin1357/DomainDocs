# 사실 확인: 프로세스가 끝나는 방식

- 글: src/content/docs/server/process-exit.mdx
- 확인일: 2026-11-05

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 치명적 신호 N으로 끝나면 bash는 128+N을 종료 상태로 씀 | https://www.gnu.org/software/bash/manual/html_node/Exit-Status.html |
| init(PID 1)에는 처리기를 단 신호만 전해짐, 바깥 네임스페이스에서 보낸 SIGKILL·SIGSTOP은 강제로 전해짐 | https://man7.org/linux/man-pages/man7/pid_namespaces.7.html |
| SIGKILL은 잡거나 막거나 무시할 수 없음, 신호 번호(TERM 15, KILL 9, INT 2, HUP 1, SEGV 11, ABRT 6) | https://man7.org/linux/man-pages/man7/signal.7.html |
| docker stop 기본 대기 시간은 리눅스 10초, Windows 30초, 그 뒤 SIGKILL | https://github.com/docker/cli/blob/master/docs/reference/commandline/container_stop.md |
| 쿠버네티스 기본 유예 30초, preStop을 먼저 돌리고 PID 1에 TERM, 유예가 끝나면 SIGKILL, 런타임은 이미지 STOPSIGNAL을 따름 | https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/ (kubernetes/website main의 pod-lifecycle.md) |
| Go는 처리기가 없으면 SIGHUP·SIGINT·SIGTERM에 프로그램이 끝남 | https://pkg.go.dev/os/signal |
| JVM 크래시 기록 파일 hs_err_pid<pid>.log | https://docs.oracle.com/en/java/javase/21/troubleshoot/fatal-error-log.html |
| Spring Boot 3.4부터 내장 웹 서버의 우아한 종료가 기본 | https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.4-Release-Notes |
| x86 페이지 폴트 에러 코드 비트(0 보호 위반, 1 쓰기, 2 사용자 모드) | Linux arch/x86/include/asm/trap_pf.h |

직접 돌려 본 것(WSL Ubuntu 24.04, 커널 6.18, Python 3.12.3, Node.js 22.22.0, OpenJDK 17.0.20.1, Go 1.27.1 리눅스 빌드):

- `sleep 30`에 kill: TERM 143, KILL 137, SEGV 139(core dumped), ABRT 134, HUP 129. 스크립트 안의 `&` 프로세스는 SIGINT를 무시해 0이 나와 표에서 뺐어요.
- 처리 안 된 에러: Python 1, Node 1(unhandled rejection도 1), Go nil map panic 2(`panic: assignment to entry in nil map`).
- 처리기 없는 Python·Node에 SIGTERM: 143. JVM: 셧다운 훅 실행 뒤 143.
- `unshare --pid --fork --mount-proc`의 PID 1에 SIGTERM: 처리기 없는 Python·Node, `sh -c`로 감싼(처리기 있는) Python은 3초 넘게 살아 있음 → SIGKILL. 처리기 있는 Python 0.1초, JVM 0.1초(훅 실행, 143).
- `python3 -c 'import ctypes; ctypes.string_at(0)'` → 139, dmesg `python3[1537]: segfault at 0 ip 0000755b84d8badd sp ... error 4 in libc.so.6[...]`.
- JVM `Unsafe.putAddress(0, 0)` → hs_err_pid645.log, 종료 코드 134. `-XX:-CreateCoredumpOnCrash`면 1.
- systemd: `DefaultTimeoutStopUSec=1min 30s`. `systemd-run -p TimeoutStopSec=3`로 SIGTERM을 무시하는 Python을 멈추자 3초 뒤 `State 'stop-sigterm' timed out. Killing.` → `code=killed, status=9/KILL` → `Failed with result 'timeout'`.
- WSL의 core_pattern은 `|/wsl-capture-crash %t %E %p %s`, `ulimit -c` 0.
