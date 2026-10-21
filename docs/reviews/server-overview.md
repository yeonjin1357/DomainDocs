# 사실 확인: 서버 한 대가 일하는 방식

- 글: src/content/docs/server/overview.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 시스템 콜은 앱과 커널 사이의 기본 통로 | https://man7.org/linux/man-pages/man2/syscalls.2.html "The system call is the fundamental interface between an application and the Linux kernel." |
| 스케줄러가 다음에 실행할 스레드를 고름 | https://man7.org/linux/man-pages/man7/sched.7.html |
| /proc는 커널 자료 구조에 닿는 가상 파일 시스템 | https://man7.org/linux/man-pages/man5/proc.5.html |
| /proc/stat CPU 시간은 USER_HZ 단위 누적값 | https://man7.org/linux/man-pages/man5/proc_stat.5.html |
