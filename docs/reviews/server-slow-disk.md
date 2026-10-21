# 사실 확인: 디스크가 느릴 때

- 글: src/content/docs/server/slow-disk.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| r_await = 줄에서 기다린 시간 + 처리 시간(ms), aqu-sz = 평균 요청 줄 길이, %util은 병렬 장치(SSD·RAID)의 한계를 반영하지 않음, -x 확장 통계, -y 첫 보고 생략 | https://man7.org/linux/man-pages/man1/iostat.1.html |
| pidstat -d = 프로세스별 입출력(kB_rd/s, kB_wr/s) | https://man7.org/linux/man-pages/man1/pidstat.1.html |
| vmstat b = 입출력 완료를 기다리며 막힌 프로세스 수 | https://man7.org/linux/man-pages/man8/vmstat.8.html |
| ps STAT D = 중단할 수 없는 잠(보통 입출력) | https://man7.org/linux/man-pages/man1/ps.1.html |

- 메모: 캐시가 줄면 디스크 읽기가 늘어난다는 것과 원인 갈래는 server/memory·disk-io의 근거와 일반 설명이에요. StatTile 숫자는 설명용이에요.
