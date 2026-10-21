# 사실 확인: 서버 수집이 끊겼을 때

- 글: src/content/docs/server/server-not-reporting.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| uptime -s = 켜진 시각 | https://man7.org/linux/man-pages/man1/uptime.1.html |
| last reboot = 재부팅 기록 | https://man7.org/linux/man-pages/man1/last.1.html |
| journalctl --list-boots = 부팅마다 첫·마지막 기록 시각 | https://man7.org/linux/man-pages/man1/journalctl.1.html |
| systemctl status = 서비스 상태와 최근 로그 | https://man7.org/linux/man-pages/man1/systemctl.1.html |

- 메모: 바깥→안 순서(네트워크·서버·수집기)와 흔한 원인 목록은 일반적인 점검 순서예요. 데이터 없음과 0의 차이는 foundations/no-data-vs-zero를 따랐어요.
