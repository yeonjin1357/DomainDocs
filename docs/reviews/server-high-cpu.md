# 사실 확인: CPU가 높을 때 어디부터 볼까

- 글: src/content/docs/server/high-cpu.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| mpstat -P로 코어별, %steal = 하이퍼바이저가 다른 가상 CPU를 돌보는 동안 기다린 비율 | https://man7.org/linux/man-pages/man1/mpstat.1.html |
| pidstat -u의 %usr·%system·%wait(차례를 기다린 비율), -r은 메모리 | https://man7.org/linux/man-pages/man1/pidstat.1.html |
| top의 H = 스레드 모드 토글 | https://man7.org/linux/man-pages/man1/top.1.html |
| vmstat r = 실행 중이거나 기다리는 프로세스 수, 첫 보고는 부팅 뒤 평균 | https://man7.org/linux/man-pages/man8/vmstat.8.html |

- 메모: us·sy·st·wa의 뜻과 프로세스 사용률이 코어 하나를 100%로 센다는 건 server/cpu-usage의 근거를 따랐어요. sy가 늘 때의 예(잦은 작은 입출력, 잦은 연결)와 원인 갈래는 일반 설명이에요. StatTile 숫자는 설명용이에요.
