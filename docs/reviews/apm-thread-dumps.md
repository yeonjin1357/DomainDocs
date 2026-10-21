# 사실 확인: 스레드 덤프

- 글: src/content/docs/apm/thread-dumps.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| RUNNABLE은 JVM에서 실행 중이지만 운영체제 자원(CPU 등)을 기다릴 수 있음, BLOCKED·WAITING·TIMED_WAITING 뜻과 그 상태가 되는 메서드 | https://docs.oracle.com/en/java/javase/21/docs/api/java.base/java/lang/Thread.State.html |
| Thread.print는 모든 스레드와 스택을 출력, 부담은 중간이고 스레드 수에 따라 다름 | https://docs.oracle.com/en/java/javase/21/docs/specs/man/jcmd.html |

- 메모: 덤프 예시는 HotSpot 출력 모양을 본뜬 예시예요. 쉬는 풀 스레드가 park로 기다린다는 건 "보통"으로 썼어요. 소켓 읽기가 RUNNABLE로 보인다는 건 RUNNABLE 정의("waiting for other resources from the operating system")에서 나온 설명이에요.
