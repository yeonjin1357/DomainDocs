# 사실 확인: 메모리가 계속 늘 때

- 글: src/content/docs/apm/memory-growing.mdx
- 확인일: 2026-10-28

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 힙 덤프가 누수를 찾는 가장 중요한 자료, `jcmd GC.heap_dump`와 `-XX:+HeapDumpOnOutOfMemoryError`로 뜸 | https://docs.oracle.com/en/java/javase/21/troubleshoot/troubleshooting-memory-leaks.html |
| `GC.heap_dump`는 부하 High, `-all`이 없으면 Full GC를 먼저 요청 | https://docs.oracle.com/en/java/javase/21/docs/specs/man/jcmd.html |
| `MaxRAMPercentage` 기본 25%, `UseContainerSupport`(리눅스) 컨테이너 자원 감지, `MaxDirectMemorySize`를 정하지 않으면 JVM이 자동으로 정함 | https://docs.oracle.com/en/java/javase/21/docs/specs/man/java.html |
| NMT `-XX:NativeMemoryTracking=summary`, `jcmd VM.native_memory`·`baseline`·`summary.diff`, 켜면 5~10% 성능 부하 | 누수 문서, https://docs.oracle.com/en/java/javase/21/vm/native-memory-tracking.html |
| OOMKilled는 컨테이너 메모리 한도를 넘어 커널이 프로세스를 끝냄 | https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/ |

- 재현(WSL Ubuntu, OpenJDK 17.0.20.1):
  - `java -XX:+PrintFlagsFinal`: `MaxRAMPercentage = 25`, `UseContainerSupport = true`, `MaxDirectMemorySize = 0`(정하지 않음), G1.
  - 누수 흉내(`-Xmx64m -Xlog:gc`, 요청마다 1MB를 정적 리스트에 넣음): GC 직후 크기가 7 → 31 → 41 → 51 → 55 → 59 → 61MB로 올랐고, 마지막 Full GC 두 번이 `61M->61M`, 이어서 `java.lang.OutOfMemoryError: Java heap space`. `-XX:+HeapDumpOnOutOfMemoryError`로 `java_pid480.hprof`(34.6MB)가 생김. 글의 그래프 값(GC 직전 29~61, 직후 7~61)은 이 기록에서 다섯 번째 GC마다 뽑았어요.
  - 다이렉트 버퍼(`-XX:MaxDirectMemorySize=32m`): `OutOfMemoryError: Cannot reserve 1048576 bytes of direct buffer memory (allocated: 33554432, limit: 33554432)`.
- 함께 한 것: 용어 memory-leak, heap-dump를 올리고 퀴즈 5문제를 썼어요. 「JVM과 힙 메모리」, 「GC 멈춤」의 related에 이 글을 더했어요.
