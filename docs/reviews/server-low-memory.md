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
- (2026-11-06 그림 다시 그림) free·available 그림의 몫은 본문 숫자에서 거꾸로 나눴어요: (전체 − free) 97%라 free 3%, (전체 − available) 38%라 available 62%, 캐시는 62 − 3 = 59%를 모두 비울 수 있다고 친 예시예요. 스왑 그림의 사용량 80%는 설명용 예시예요.
