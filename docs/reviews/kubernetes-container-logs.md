# 사실 확인: 컨테이너 로그가 남는 곳

- 글: src/content/docs/kubernetes/container-logs.mdx
- 확인일: 2026-11-03
- 로컬 kubectl은 외부 클러스터를 가리켜서 실행하지 않았어요. 문서와 소스로만 확인했어요.

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 런타임이 stdout·stderr를 받아 CRI 로그 형식으로 쓰고, 기본 위치는 `/var/log/pods`(podLogsDir로 바꿀 수 있음) | https://kubernetes.io/docs/concepts/cluster-administration/logging/ |
| 재시작하면 끝난 컨테이너 하나를 로그와 함께 남겨요, 파드가 축출되면 로그도 함께 사라져요 | 같은 문서 |
| `containerLogMaxSize` 기본 10Mi, `containerLogMaxFiles` 기본 5, `containerLogMonitorInterval` 기본 10s | 같은 문서, kubelet config v1beta1 types.go 주석 |
| kubectl logs는 가장 최근 파일만(40MiB 쓰고 10MiB마다 회전하면 최대 10MiB) | 같은 문서 |
| 노드 에이전트(DaemonSet 권장), 사이드카, 앱이 직접 보내기 | 같은 문서 |
| kubelet·런타임은 systemd 노드에서 journald, `journalctl -u kubelet` | 같은 문서 |
| 경로 `<podLogsDir>/<네임스페이스>_<파드>_<UID>/<컨테이너>/<재시작 횟수>.log` | kubernetes pkg/kubelet/kuberuntime/helpers.go (BuildPodLogsDirectory, buildContainerLogsPath) |
| `/var/log/containers`의 링크 이름 `파드_네임스페이스_컨테이너-ID.log` | pkg/kubelet/kuberuntime/legacy.go (legacyLogSymlink) |
| CRI 형식 `시각 stdout|stderr P|F 내용`, P는 여러 줄의 일부, F는 한 줄 또는 마지막 조각 | staging/src/k8s.io/cri-client/pkg/logs/logs.go(parseCRILog 예), cri-api constants.go(LogTagPartial/Full) |
| 회전 파일 이름 끝 `20060102-150405` 형식 시각, 회전할 때 앞서 회전된 파일을 gzip으로 압축 | pkg/kubelet/logs/container_log_manager.go (timestampFormat, rotateLog→compressLog) |
| containerd `max_container_log_line_size` 기본 16384, 넘으면 여러 줄로 나눔 | containerd docs/cri/config.md |

- 계산: 50MiB = 52,428,800B. 초당 10KB면 5,243초(약 87분), 100KB면 524초(약 9분), 1MB면 52초.
