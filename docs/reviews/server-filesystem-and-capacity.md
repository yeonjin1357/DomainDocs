# 사실 확인: 파일 시스템과 디스크 용량

- 글: src/content/docs/server/filesystem-and-capacity.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 파일마다 inode가 있고 정보를 담음, inode 번호는 고유 | https://man7.org/linux/man-pages/man7/inode.7.html |
| df는 남은 공간, df -i는 inode | https://man7.org/linux/man-pages/man1/df.1.html |
| 새 파일을 만들 자리가 없으면 ENOSPC | https://man7.org/linux/man-pages/man2/open.2.html |
| 마지막 연결을 지워도 연 프로세스가 있으면 닫힐 때까지 남음 | https://man7.org/linux/man-pages/man2/unlink.2.html |
| ext 계열 예약 공간 기본 5%, 이유, bytes-per-inode는 만든 뒤 못 바꿈 | https://man7.org/linux/man-pages/man8/mke2fs.8.html |

- 메모: inode가 내용의 위치도 담는다는 건 ext4 같은 파일 시스템의 구조예요(inode(7)는 정보 목록만 들어요). 95%쯤에서 일반 앱이 막힌다는 건 기본 예약 5%에서 나온 설명이에요.
