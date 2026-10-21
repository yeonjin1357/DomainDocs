# 사실 확인: 프로세스와 스레드

- 글: src/content/docs/server/processes-and-threads.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 새 프로세스는 부모와 다른 메모리 공간에서 돎 | https://man7.org/linux/man-pages/man2/fork.2.html "run in separate memory spaces" |
| 한 프로세스의 스레드는 같은 프로그램을 실행하고 전역 메모리를 함께 씀, 스택은 따로, PID·열린 파일 공유 | https://man7.org/linux/man-pages/man7/pthreads.7.html |
| 스케줄러 | https://man7.org/linux/man-pages/man7/sched.7.html |
| R·S·D·Z 상태 뜻 | https://man7.org/linux/man-pages/man1/ps.1.html |
| /proc/PID/task에 스레드마다 하위 폴더 | https://man7.org/linux/man-pages/man5/proc_pid_task.5.html |

- 메모: 스레드가 늘면 스택 메모리를 쓴다는 확인 항목은 "each thread has its own stack"에서 나온 설명이에요.
