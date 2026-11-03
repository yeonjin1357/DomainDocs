# 사실 확인: 스레드 덤프

- 글: src/content/docs/apm/thread-dumps.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| RUNNABLE은 JVM에서 실행 중이지만 운영체제 자원(CPU 등)을 기다릴 수 있음, BLOCKED·WAITING·TIMED_WAITING 뜻과 그 상태가 되는 메서드 | https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Thread.State.html |
| Thread.print는 모든 스레드와 스택을 출력, 부담은 중간이고 스레드 수에 따라 다름 | https://docs.oracle.com/en/java/javase/21/docs/specs/man/jcmd.html |

- 메모: 덤프 예시는 HotSpot 출력 모양을 본뜬 예시예요. 쉬는 풀 스레드가 park로 기다린다는 건 "보통"으로 썼어요. 소켓 읽기가 RUNNABLE로 보인다는 건 RUNNABLE 정의("waiting for other resources from the operating system")에서 나온 설명이에요.

## 2026-11-03 더한 절: CPU를 쓰는 스레드 찾기

| 확인한 주장 | 근거 |
| --- | --- |
| `top -H -p PID`의 PID 칸이 스레드 번호, COMMAND 칸에 자바 스레드 이름 앞부분(`busy-wo+`) | WSL Ubuntu 24.04, JDK 11·17·21·25에서 CPU를 쓰는 스레드 하나를 띄워 직접 확인 |
| JDK 11.0.32·17.0.20: `nid=0x1c1`, `nid=0x214`처럼 16진수(top의 449, 532) | 같은 실험 `jcmd <PID> Thread.print` |
| JDK 21.0.13·25.0.5: `"busy-worker" #28 [612] … nid=612`처럼 10진수, 이름 옆 대괄호에도 번호 | 같은 실험 |
| 네 버전 모두 덤프 줄에 `cpu=…ms elapsed=…s`가 있어요 | 같은 실험 |
| 612의 16진수는 264 | `printf '%x' 612` |
