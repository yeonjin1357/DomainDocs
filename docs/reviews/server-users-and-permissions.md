# 사실 확인: 리눅스 사용자와 권한

- 글: src/content/docs/server/users-and-permissions.mdx
- 확인일: 2026-11-04

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 주인이면 주인 칸, 그룹(기본·보조 그룹)이 맞으면 그룹 칸, 아니면 나머지 칸을 씀. 파일 검사는 fsuid(보통 유효 UID) | https://man7.org/linux/man-pages/man7/path_resolution.7.html |
| 경로를 따라가며 디렉터리마다 검색(x) 권한이 없으면 EACCES | 같은 문서 |
| CAP_DAC_OVERRIDE는 모든 검사를 넘지만 실행은 x가 하나라도 있을 때만, CAP_DAC_READ_SEARCH는 파일 읽기·디렉터리 읽기와 검색 | 같은 문서, https://man7.org/linux/man-pages/man7/capabilities.7.html |
| UID 0은 커널 권한 검사를 건너뜀, 리눅스 2.2부터 root의 힘을 capability로 나눔, CAP_NET_RAW(RAW·PACKET 소켓), CAP_NET_BIND_SERVICE(1024 아래 포트), CAP_SYS_PTRACE, setcap으로 파일에 붙임 | https://man7.org/linux/man-pages/man7/capabilities.7.html |
| /proc/PID/fd는 ptrace 접근 검사(PTRACE_MODE_READ_FSCREDS) | https://man7.org/linux/man-pages/man5/proc_pid_fd.5.html |
| systemd `User=`, `SupplementaryGroups=`, `AmbientCapabilities=`로 일반 사용자 서비스에 capability를 줌 | https://www.freedesktop.org/software/systemd/man/latest/systemd.exec.html |
| 시스템 저널은 root와 systemd-journal, adm, wheel 그룹이 읽음 | https://www.freedesktop.org/software/systemd/man/latest/journalctl.html |
| sudo는 허락받은 사용자가 명령을 root나 다른 사용자로 실행 | https://www.sudo.ws/docs/man/sudo.man/ |
| Docker 기본 capability 14개, SYS_TIME·SYS_PTRACE는 기본에 없음 | https://docs.docker.com/engine/containers/run/ |

직접 돌려 본 것(WSL Ubuntu 24.04, 커널 6.18, root로 실험용 사용자 생성):

- `/var/log/syslog`·`/var/log/auth.log`는 `-rw-r----- syslog adm`. 실험용 사용자는 Permission denied, adm에 넣은 뒤 새 프로세스는 읽음. 넣기 전에 띄운 프로세스의 `/proc/PID/status` Groups는 그대로(989만), 새 프로세스는 `4 989`.
- 644 파일, 중간 디렉터리 700 → `cat` Permission denied, `namei -l` 출력 그대로. 711로 바꾸면 파일은 읽고 `ls`는 Permission denied.
- 주인이 실험용 사용자인 `-------r--` 파일: 주인은 Permission denied, nobody는 읽음.
- 실험용 사용자로 `/proc/stat`, `/proc/1/cmdline` 읽음, `/proc/1/fd`, `/proc/1/io`는 Permission denied.
- python 복사본: RAW 소켓 Operation not permitted → `setcap cap_net_raw+ep` 뒤 성공. 80번 bind는 Permission denied → `setcap cap_net_bind_service+ep` 뒤 성공, 이때 CapEff `0000000000000400`(capsh가 cap_net_bind_service로 풂)이라 앞의 cap_net_raw는 빠짐. cap_dac_read_search를 붙이면 syslog 읽기는 되고 쓰기는 Permission denied.
- `/proc/sys/kernel/cap_last_cap` = 40 → capability 41개(0~40).
- journalctl은 그룹 없이 자기 기록만 보며 "Users in groups 'adm', 'systemd-journal' can see all messages" 안내.
- `/var/log/auth.log`에 `sudo: 사용자 : ... USER=root ; COMMAND=...` 줄이 남음.
