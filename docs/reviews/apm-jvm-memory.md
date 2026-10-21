# 사실 확인: JVM과 힙 메모리

- 글: src/content/docs/apm/jvm-memory.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| -Xmx 최대 힙, -Xms 최소·처음 힙, -Xss 스레드 스택, MaxMetaspaceSize 기본 무제한 | https://docs.oracle.com/en/java/javase/21/docs/specs/man/java.html |
| G1은 세대형, young·old, 영역으로 나눔, young 수집이 old로 승격 | https://docs.oracle.com/en/java/javase/21/gctuning/garbage-first-g1-garbage-collector1.html |
| G1이 기본 수집기 | https://docs.oracle.com/en/java/javase/21/gctuning/available-collectors.html (apm-gc-pause 검토에서 확인) |
| Java heap space 뜻, 누수가 아닐 수 있음, 설정 문제일 수 있음, Metaspace 오류 | https://docs.oracle.com/en/java/javase/21/troubleshoot/troubleshooting-memory-leaks.html |
| GC.heap_info | https://docs.oracle.com/en/java/javase/21/docs/specs/man/jcmd.html |

- 고친 것: 메타스페이스 오류의 원인을 단정한 문장을 뺐어요. GC 직후 바닥이 오르면 살아 있는 객체가 쌓인다는 건 GC의 정의에서 나온 설명이에요.
