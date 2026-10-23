# 사실 확인: Too many open files가 날 때

- 글: src/content/docs/server/too-many-open-files.mdx
- 확인일: 2026-10-23

| 확인한 주장 | 근거(URL) |
| --- | --- |
| RLIMIT_NOFILE을 넘는 열기(open, pipe, dup 등)는 EMFILE로 실패, 소프트 한도를 커널이 적용하고 하드 한도는 그 천장 | https://man7.org/linux/man-pages/man2/getrlimit.2.html |
| EMFILE은 Too many open files(프로세스 한도), ENFILE은 Too many open files in system(file-max) | https://man7.org/linux/man-pages/man3/errno.3.html |
| `/proc/<PID>/fd`의 항목은 링크, 소켓은 `socket:[inode]` 꼴 | https://man7.org/linux/man-pages/man5/proc_pid_fd.5.html |
| `/proc/<PID>/limits`가 소프트·하드 한도를 보여 줌(Max open files 줄) | https://man7.org/linux/man-pages/man5/proc_pid_limits.5.html |
| `/proc/sys/fs/file-nr`는 할당 수, 빈 수, 최대치(file-max와 같음) | https://man7.org/linux/man-pages/man5/proc_sys_fs.5.html |
| limits.conf(pam_limits)는 사용자 로그인 세션에 한도를 적용 | https://man7.org/linux/man-pages/man5/limits.conf.5.html |
| `LimitNOFILE`은 `ulimit -n`에 해당, select(2) 때문에 소프트 1024를 유지, 하드 기본 524288 | https://www.freedesktop.org/software/systemd/man/latest/systemd.exec.html |
| `DefaultLimitNOFILE=` 기본 1024:524288 | https://www.freedesktop.org/software/systemd/man/latest/systemd-system.conf.html |
| `ss`의 `state close-wait` 필터 | https://man7.org/linux/man-pages/man8/ss.8.html |
| 표준 프로세스 지표 `process_open_fds`, `process_max_fds` | https://prometheus.io/docs/instrumenting/writing_clientlibs/ |
| node_exporter filefd는 file-nr의 첫째(allocated)와 셋째(maximum) 값을 냄 | https://github.com/prometheus/node_exporter/blob/master/collector/filefd_linux.go |

- 명령 확인: WSL Ubuntu 24.04(systemd 255)에서 소켓 40개, 같은 파일 25번, CLOSE-WAIT 연결 하나를 연 python 프로세스를 띄워 본문의 명령을 그대로 돌렸어요. fd 수, Max open files 줄, 소켓 수, 같은 대상 횟수(25 /etc/hostname), `ss -tanp state close-wait`의 프로세스·fd 표시, file-nr 세 숫자가 모두 나왔어요.
- 메모: 같은 우분투의 `systemctl show`는 DefaultLimitNOFILE이 1024:1048576이었어요. 하드 한도는 배포판마다 달라서, 본문은 "systemd 문서가 밝힌 기본값"으로 쓰고 실제 값을 확인하게 했어요.
- 메모: `systemctl edit`는 편집 뒤 daemon-reload와 같은 다시 읽기를 해요(systemctl(1)). 그래서 직접 고친 경우에만 daemon-reload를 적었어요.
- 함께 한 것: 용어 `server/file-descriptor`를 더했고, 퀴즈 5문제를 썼어요.
