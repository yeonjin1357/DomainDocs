# 사실 확인: 서비스와 시스템 로그

- 글: src/content/docs/server/services-and-logs.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| systemd는 부팅 때 첫 프로세스(PID 1)로 떠서 시스템 매니저로 일함 | https://man7.org/linux/man-pages/man1/systemd.1.html |
| Restart= 값(no·on-success·on-failure 등), 기본값 no, on-failure = 0이 아닌 종료 코드·신호로 종료·시간 초과 시 재시작, 오래 도는 서비스엔 on-failure 권장, RestartSec 기본 100ms | https://man7.org/linux/man-pages/man5/systemd.service.5.html |
| StartLimitIntervalSec·StartLimitBurst: interval 안에 burst보다 많이 시작하면 더 시작 못 함, Restart=로 띄운 것뿐 아니라 손으로 띄운 것도 셈, 한도에 닿은 유닛은 더 재시작하지 않음, reset-failed로 횟수를 비움 | https://man7.org/linux/man-pages/man5/systemd.unit.5.html |
| DefaultStartLimitIntervalSec 기본 10s, DefaultStartLimitBurst 기본 5 | https://man7.org/linux/man-pages/man5/systemd-system.conf.5.html |
| systemctl status 예시(Loaded·Active·Main PID·최근 로그 줄), Active 값 active·inactive·activating·deactivating·failed(크래시·오류 코드·시간 초과), enabled 유닛은 부팅 때 등 자동으로 시작 | https://man7.org/linux/man-pages/man1/systemctl.1.html |
| 유닛 파일 위치: /etc/systemd/system(관리자가 만든 것), /usr/lib/systemd/system(패키지 관리자가 설치한 것) | https://man7.org/linux/man-pages/man5/systemd.unit.5.html |
| NRestarts: Restart=로 재시작할 때마다 느는 횟수, systemctl show -p NRestarts, systemd 235부터 | https://github.com/systemd/systemd/blob/main/NEWS |
| journald가 모으는 것: 커널 메시지(kmsg), syslog(3), 네이티브 저널 API, 서비스의 표준 출력·표준 오류, 감사 기록 | https://man7.org/linux/man-pages/man8/systemd-journald.service.8.html |
| Storage=: volatile은 /run/log/journal(메모리), persistent는 /var/log/journal, auto는 /var/log/journal이 있으면 persistent. 기본값은 빌드 때 정해짐(지금 문서는 persistent, 예전 문서는 auto) | https://man7.org/linux/man-pages/man5/journald.conf.5.html |
| SystemMaxUse 기본 10%, SystemKeepFree 기본 15%, 각각 4G 상한 | https://man7.org/linux/man-pages/man5/journald.conf.5.html |
| journalctl -u(유닛), -k(커널 메시지, 이번 부팅), -b -1(지난 부팅), --list-boots(부팅별 첫·마지막 기록 시각) | https://man7.org/linux/man-pages/man1/journalctl.1.html |
| dmesg는 커널 링 버퍼를 읽음, -T 시각은 절전·재개 뒤 부정확할 수 있다는 경고 | https://man7.org/linux/man-pages/man1/dmesg.1.html |
| 커널 메시지는 정해진 크기의 순환 버퍼(cyclic buffer)에 쌓임 | https://man7.org/linux/man-pages/man2/syslog.2.html |

- 메모: Storage= 기본값은 버전·빌드마다 달라 글에는 특정 값을 쓰지 않았어요. "since 시각은 다시 띄우면 바뀐다"와 그림의 숫자(4초, 37번)는 설명용 예시예요.
- 함께 고친 것: server/overview에 이 글 안내 한 줄, server/server-not-reporting 3단계에 "죽었다 살아나기를 되풀이" 경우와 이 글 링크, server/low-memory 4단계의 "커널 로그"를 이 글로 이음. 퀴즈 server/services-and-logs 5문제 추가.
