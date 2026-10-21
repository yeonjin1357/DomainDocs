# 사실 확인: 메모리가 모자라 보일 때

- 글: src/content/docs/server/low-memory.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| free의 available 칸 | https://man7.org/linux/man-pages/man1/free.1.html |
| vmstat si·so = 스왑 들여옴·내보냄(/s), 첫 줄은 부팅 뒤 평균 | https://man7.org/linux/man-pages/man8/vmstat.8.html |
| pidstat -r = 페이지 폴트와 메모리 사용(RSS) | https://man7.org/linux/man-pages/man1/pidstat.1.html |
| OOM killer가 끝내면 커널 로그에 "Killed process PID (이름)" | https://github.com/torvalds/linux/blob/master/mm/oom_kill.c |
| dmesg -T로 사람이 읽는 시각 | https://man7.org/linux/man-pages/man1/dmesg.1.html |

- 메모: available·RSS·스왑·OOM의 개념은 server/memory의 근거를 따랐어요. 그래프와 StatTile 숫자는 설명용이에요.
