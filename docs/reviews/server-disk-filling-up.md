# 사실 확인: 디스크가 차오를 때

- 글: src/content/docs/server/disk-filling-up.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| df -h, df -i(inode) | https://man7.org/linux/man-pages/man1/df.1.html |
| du -x(다른 파일 시스템 건너뜀), -h, --max-depth | https://man7.org/linux/man-pages/man1/du.1.html |
| lsof +L1 = 지워졌지만 열린 파일 | https://man7.org/linux/man-pages/man8/lsof.8.html |

- 메모: 열린 채 지워진 파일의 공간이 닫힐 때까지 남는다는 것과 inode 고갈은 server/filesystem-and-capacity의 근거를 따랐어요. 흔한 원인 목록, 내용 비우기(`: > 파일`), 남은 시간 계산은 일반 설명이에요.
