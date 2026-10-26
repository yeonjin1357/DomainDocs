# 사실 확인: 서버 지표는 어디서 오나

- 글: src/content/docs/server/metrics-sources.mdx
- 확인일: 2026-10-26

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 커널은 /proc로 상태를 내놓음 | https://man7.org/linux/man-pages/man5/proc.5.html |
| node_exporter 기본 포트 9100, 수집기 `--collector.<이름>`·`--no-collector.<이름>`, 컨테이너로 돌릴 때 루트를 읽기 전용으로 붙이고 `--path.rootfs`, textfile 수집기와 Pushgateway 구분 | https://github.com/prometheus/node_exporter/blob/master/README.md |
| cgroup v2 `memory.current`(지금 쓰는 메모리), `memory.max`(한도), `cpu.stat`(usage_usec 등) | https://docs.kernel.org/admin-guide/cgroup-v2.html |
| /proc/meminfo, /proc/stat 등을 컨테이너에 맞춘 값으로 보여 주려고 LXCFS를 만듦 | https://github.com/lxc/lxcfs/blob/main/README.md |

- 실행 확인: WSL Ubuntu에서 node_exporter 1.12.1을 띄워 `/metrics`를 받았어요.
  - `node_cpu_seconds_total{cpu,mode}`, `node_memory_MemAvailable_bytes`, `node_filesystem_avail_bytes`(HELP: available to non-root users), `node_disk_io_time_seconds_total`, `node_network_receive_bytes_total` 이름과 설명을 확인했어요.
  - 같은 장치(/dev/sdd)가 `/`와 `/mnt/wslg/distro` 두 마운트로 따로 나왔어요.
  - `/proc/stat`의 cpu 줄은 틱 단위였고 `getconf CLK_TCK`는 100이었어요. node_exporter 값은 초 단위였어요.
- 질의 확인: promtool 3.15.1로 코어 두 개(idle 25%, 75%)를 넣어 `1 - avg by (instance) (rate(node_cpu_seconds_total{mode="idle"}[5m]))`가 0.5인지 확인했어요.
- 메모: 맨 위 그림의 세 숫자는 예시예요.
- 함께 한 것: 퀴즈 5문제를 썼어요.
