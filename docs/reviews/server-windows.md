# 사실 확인: 윈도우 서버는 무엇이 다를까

- 글: src/content/docs/server/windows.mdx
- 확인일: 2026-11-03
- 이 PC(한국어 Windows 11)에서 PowerShell로 직접 읽어 확인한 것이 많아요.

| 확인한 주장 | 근거 |
| --- | --- |
| 카운터 경로 `\Processor(_Total)\% Processor Time`, `\System\Processor Queue Length`, `\Memory\Available MBytes`, `\Memory\Committed Bytes`, `\Memory\Commit Limit`, `\LogicalDisk(C:)\% Free Space`, `\PhysicalDisk(_Total)\Avg. Disk sec/Read`가 한국어 윈도우에서도 영어 경로로 읽힘 | `Get-Counter`로 실제로 읽음(2026-11-03) |
| Processor Queue Length는 실행 중인 스레드를 빼고 준비된 스레드만 셈, CPU가 여럿이어도 줄은 하나라 CPU 수로 나눔, CPU당 10개 이하면 대개 정상 | 카운터 설명(PerformanceCounter.CounterHelp)을 이 PC에서 읽음 |
| Available MBytes는 대기·빈·0으로 채운 페이지 목록의 합 | 같은 방법 |
| Committed Bytes는 커밋된 가상 메모리, Commit Limit은 페이징 파일을 늘리지 않고 커밋할 수 있는 크기이고 페이징 파일이 커지면 함께 늚 | 같은 방법 |
| Avg. Disk sec/Read는 읽기 평균 시간(초) | 같은 방법 |
| 6008(EventLog, 오류)은 직전 종료가 예기치 않음, 1074(User32, 정보)는 프로세스가 재시작·종료를 시작함, 7034(SCM)는 서비스가 예기치 않게 끝남·몇 번째인지, 7031(SCM)은 끝나서 복구 동작을 함 | `Get-WinEvent`로 이 PC System 로그의 실제 이벤트 문구를 읽음 |
| System 로그 기본 방식은 덮어쓰기(Circular) | `(Get-WinEvent -ListLog System).LogMode` |
| `Get-Service`가 Status와 StartType(Automatic·Manual)을 보여 줌, 글의 `Get-WinEvent -FilterHashtable` 예시가 돌아감 | 이 PC에서 실행 |
| `Get-Counter -SampleInterval 2 -MaxSamples 3` 예시 | https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.diagnostics/get-counter |
| windows_exporter 기본 포트 9182, 경로 /metrics, cpu·memory·logical_disk·service 수집기 기본 켜짐 | https://github.com/prometheus-community/windows_exporter (README) |
| `windows_cpu_time_seconds_total{core, mode}`, mode는 dpc·idle·interrupt·privileged·user | docs/collector.cpu.md |
| `windows_service_state`는 지금 상태에만 1 | docs/collector.service.md |

- privileged를 리눅스 sy에 "가깝다"고 한 건 둘 다 커널 모드 시간이라는 뜻으로 쓴 비유예요.
- 함께 한 것: 용어 performance-counter, event-log를 올렸어요. 퀴즈 5문제를 썼어요.
