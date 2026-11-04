# 사실 확인: eBPF로 코드 안 고치고 보기

- 글: src/content/docs/server/ebpf.mdx
- 확인일: 2026-11-04

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 이벤트 기반 훅(시스템 콜, 함수 입·출구, tracepoint, 네트워크), kprobe·uprobe, 검사기(반드시 끝남, 초기화 안 된 변수·범위 밖 메모리 금지, 복잡도 한도), JIT, 맵(해시·배열·링 버퍼 등, 사용자 공간에서 읽음), root나 CAP_BPF가 필요 | https://ebpf.io/what-is-ebpf/ |
| unprivileged_bpf_disabled 0·1·2의 뜻(1은 다시 못 풂, 2는 관리자가 바꿀 수 있음), 막히면 CAP_SYS_ADMIN·CAP_BPF 없이 EPERM | https://docs.kernel.org/admin-guide/sysctl/kernel.html |
| CAP_BPF·CAP_PERFMON은 리눅스 5.8부터, CAP_SYS_ADMIN에서 떼어 냄 | https://man7.org/linux/man-pages/man7/capabilities.7.html |
| "CAP_PERFMON and CAP_BPF are required to load tracing programs." | https://raw.githubusercontent.com/torvalds/linux/master/include/uapi/linux/capability.h |
| BTF를 /sys/kernel/btf/vmlinux로 노출, CO-RE로 한 번 컴파일해 여러 커널에서 실행 | https://docs.kernel.org/bpf/libbpf/libbpf_overview.html |
| Datadog USM: 리눅스 커널 4.14 이상, HTTP·HTTPS(OpenSSL) 지원, Go TLS는 Preview, GKE Autopilot 미지원, 설정에 /lib/modules·/usr/src·kernel-headers-download-dir·runtime-compiler-output-dir 마운트 | https://docs.datadoghq.com/universal_service_monitoring/setup/ |
| JSSE는 "Implemented in 100% pure Java", SunJSSE 제공자 | https://docs.oracle.com/en/java/javase/21/security/java-secure-socket-extension-jsse-reference-guide.html |
| Go TLS는 표준 라이브러리 crypto/tls | https://pkg.go.dev/crypto/tls |

직접 돌려 본 것(WSL Ubuntu 24.04, 커널 6.18.33.2-microsoft-standard-WSL2, bpftrace 0.20.2, 논리 CPU 16개):

- 커널 설정: CONFIG_BPF_SYSCALL·BPF_JIT·DEBUG_INFO_BTF·KPROBES·UPROBES=y, /sys/kernel/btf/vmlinux 있음, unprivileged_bpf_disabled = 2.
- Python 3.12.3 http.server(평문): 글의 `t:syscalls:sys_enter_sendto` 프로그램 → `HTTP/1.0 200 OK`, `ok`. recvfrom 반환과 sendto 시각을 짝지어 /fast 0 ms, /slow 200 ms.
- 같은 서버를 TLS로: write 시스템 콜 첫 바이트 `\x16\x03\x03`(핸드셰이크), `\x17\x03\x03`(응용 데이터). libssl.so.3(OpenSSL 3.0.13) `SSL_read_ex`·`SSL_write_ex` uprobe에서 `GET /slow HTTP/1`, `HTTP/1.0 200 OK`. `SSL_write`에는 0번, `SSL_write_ex`에는 2번(헤더, 본문).
- Go 1.27.1로 리눅스용 HTTPS 서버(정적 링크, ldd "not a dynamic executable"): libssl 훅 0번, write에는 `\x17\x03\x03…`만.
- 부담: `dd if=/dev/zero of=/dev/null bs=1 count=1000000` 시간. 프로그램 없음 0.210·0.210·0.210·0.233·0.222·0.218초, sys_enter_write마다 count 0.242·0.246·0.242초, comm별 count + hist + 64바이트 str 0.298·0.293·0.292초.
- 권한: uid 1000에서 ctypes로 bpf(BPF_MAP_CREATE) → Operation not permitted, root는 fd 3. bpftrace는 일반 사용자에게 "only supports running as the root user".
- 검사기: `BEGIN { while (nsecs > 0) { @x = count(); } }` → `infinite loop detected at insn 27`, `processed 40 insns (limit 1000000)`.
- WSL은 배포판의 PID 네임스페이스가 따로라 셸의 $!로 `pid ==` 거르면 아무것도 안 잡힘 → comm으로 거름.
