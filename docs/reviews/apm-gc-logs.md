# 사실 확인: GC 로그 읽기

- 글: src/content/docs/apm/gc-logs.mdx
- 확인일: 2026-10-29

| 확인한 주장 | 근거(URL) |
| --- | --- |
| -Xlog의 filecount·filesize, 기본 돌려쓰기 5개·20MB, 꾸밈 기본 uptime·level·tags, PrintGCDetails → -Xlog:gc*, -Xloggc → -Xlog:gc:파일 | https://docs.oracle.com/en/java/javase/21/docs/specs/man/java.html |
| young-only와 space-reclamation(mixed) 단계, Concurrent Start·Remark·Cleanup·Prepare Mixed, Evacuation Failure가 이어지면 Full GC, humongous는 영역의 절반 이상 | https://docs.oracle.com/en/java/javase/21/gctuning/garbage-first-g1-garbage-collector1.html |
| 서버급 기준: 프로세서 2개 이상, 메모리 2GB − 256MB 이상 | https://github.com/openjdk/jdk21u/blob/master/src/hotspot/share/runtime/os.cpp |

- 재현(eclipse-temurin:21-jdk, OpenJDK 21.0.12.1): 글 Deeper의 프로그램을 `-Xmx128m -Xlog:gc`로 돌렸어요.
  - 종류별 줄: Pause Young (Normal) 33, (Concurrent Start) 7, Concurrent Mark Cycle, Remark 5, Cleanup 5, (Prepare Mixed) 4, (Mixed) 11, Pause Full (G1 Compaction Pause) 4, Pause Full (System.gc()) 1.
  - 인용한 줄 GC(3), GC(11)~(13)은 실제 출력 그대로예요. 멈춤 70번, 합계 100.3ms, 마지막 시각 0.809s(약 12%).
  - `-Xlog:gc*:file=gc.log:time,uptime,level,tags:filecount=5,filesize=10m`이 받아들여지고 GC(1)의 Eden 43->0(39), Survivor 3->6(6), Old 2->23, Humongous 0->0을 확인했어요.
  - JDK 21에서 `-XX:+PrintGCDetails`와 `-Xloggc`는 경고 후 바꿔 실행, `-XX:+UseGCLogFileRotation`은 `Unrecognized VM option`으로 시작 실패.
  - `--cpus=1 --memory=1g`, `--cpus=2 --memory=1g`, `--cpus=2 --memory=1791m`은 Using Serial, `--cpus=2 --memory=1792m`, `--memory=2g`는 Using G1.
- Oracle 문서의 man 페이지 표에는 UseGCLogFileRotation 칸의 설명이 다른 줄과 섞여 있어서, 실제 실행 결과로 썼어요.
- OnDashboard의 숫자는 예시예요.
- 함께 한 것: 용어 gc-log, young-gc, mixed-gc, full-gc, evacuation-failure를 올리고, 「GC 멈춤과 응답시간」에 이 글을 이었어요. 퀴즈 5문제를 썼어요.
