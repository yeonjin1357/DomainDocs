# 사실 확인: 메모리

- 글: src/content/docs/server/memory.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| MemTotal·MemFree·MemAvailable·Cached(페이지 캐시)·Dirty 뜻 | https://man7.org/linux/man-pages/man5/proc_meminfo.5.html |
| free·buff/cache·available 뜻, available은 페이지 캐시를 셈, 3.14부터 | https://man7.org/linux/man-pages/man1/free.1.html |
| VmSize는 가상 메모리 크기, VmRSS는 상주 크기(RssAnon+RssFile+RssShmem), 정확하지 않음 | https://man7.org/linux/man-pages/man5/proc_pid_status.5.html |
| 정확한 값은 smaps·smaps_rollup | https://man7.org/linux/man-pages/man5/proc_pid_statm.5.html |
| vmstat si·so | https://man7.org/linux/man-pages/man8/vmstat.8.html |
| OOM 점수 0~1000, 허락된 메모리를 다 쓰면 1000, oom_score_adj −1000이면 끄기 | https://man7.org/linux/man-pages/man5/proc_pid_oom_score_adj.5.html |
| 예시 숫자 | 사용 5 + free 1.2 + buff/cache 9.8 = 16GB, available 10.1 ≤ free + buff/cache 11.0 |

- 메모: RSS 합이 전체보다 클 수 있다는 건 RssFile·RssShmem(공유)이 프로세스마다 들어간다는 데서 나온 설명이에요. 캐시 비우기와 스왑은 순서를 정하지 않고 둘 다 쓰는 것으로 썼어요.
