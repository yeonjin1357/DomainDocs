# 사실 확인: 디스크 입출력

- 글: src/content/docs/server/disk-io.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| r/s·w/s(합친 뒤), rkB/s·wkB/s, await는 줄 시간 포함, aqu-sz, %util과 SSD·RAID의 한계 | https://man7.org/linux/man-pages/man1/iostat.1.html |
| /proc/diskstats 칸, 처리 중 요청 수 말고는 모두 누적값, 입출력 시간은 처리 중 요청이 있으면 늘어남 | https://www.kernel.org/doc/html/latest/admin-guide/iostats.html |
| D 상태는 보통 입출력 대기 | https://man7.org/linux/man-pages/man1/ps.1.html |
| 계산 | 4KB × 1,000 = 4,000KB ≈ 4MB, 1MB × 200 = 200MB |

- 고친 것: 머리말 keywords의 `%util`을 따옴표로 감쌌어요(YAML에서 %로 시작하는 값). 이 일로 머리말 YAML 오류가 검사기를 멈추던 버그를 고쳤어요.
