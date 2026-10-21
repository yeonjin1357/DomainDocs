# 사실 확인: 서버·OS 퀴즈

- 문제: src/content/quizzes/server/*.yaml (12개 파일, 57문제)
- 확인일: 2026-10-21
- 방법: 숫자·기본값·도구마다 다른 동작이 든 문제만 골라, 그 문제가 기대는 글의 문장과 글의 검토 기록 근거에 맞춰 봤어요. 글에 없는 새 주장은 넣지 않았어요.

| 문제(파일 · id) | 확인한 주장 | 근거 |
| --- | --- | --- |
| overview · proc-is-virtual, cumulative-cpu-time | /proc은 읽을 때마다 커널이 값을 만드는 가상 파일, /proc/stat CPU 시간은 부팅 뒤 누적값 | 글 본문과 docs/reviews/server-overview.md |
| processes-and-threads · d-state-surge, zombie-fix | D = 깨울 수 없는 잠(보통 디스크 입출력), Z = 부모가 거두지 않은 프로세스 | 글의 표와 docs/reviews/server-processes-and-threads.md |
| cpu-usage · low-usage-high-load, iowait-not-busy, steal-meaning | 리눅스 부하는 R과 D를 셈, iowait는 쉬는 동안 입출력을 기다린 시간, st는 다른 가상 머신에 빼앗긴 시간 | 글 본문과 docs/reviews/server-cpu-usage.md |
| cpu-usage · average-hides-core | 코어 8개 중 하나만 100% → 평균 12.5% | 글 Checkpoints(계산) |
| memory · available-is-headroom, swap-used-not-active | available = 스왑 없이 새 프로그램에 줄 수 있는 추정치, si·so가 오가는 양 | 글 본문과 docs/reviews/server-memory.md |
| disk-io · util-100-ssd, await-includes-queue, throughput-from-iops | %util = 요청이 하나라도 있던 시간 비율(병렬 장치에선 한계를 못 보여 줌), await에 줄에서 기다린 시간 포함, 4KB × 1,000 = 약 4MB/초 | 글 본문과 docs/reviews/server-disk-io.md |
| filesystem-and-capacity · reserved-blocks, inode-ratio-fixed, deleted-open-file | ext4 기본 예약 5%, inode 비율은 만든 뒤 못 바꿈, 열린 파일은 마지막 디스크립터가 닫힐 때까지 남음 | 글 본문과 docs/reviews/server-filesystem-and-capacity.md |
| high-cpu · vmstat-first-line, is-work-queuing | vmstat 첫 줄은 부팅 뒤 평균, r = 실행 중이거나 기다리는 프로세스 수 | 글 본문과 docs/reviews/server-high-cpu.md |
| low-memory · vanished-process, container-oom | OOM killer는 커널 로그에 Killed process를 남김, 컨테이너는 자기 한도를 넘어도 끝남 | 글 본문과 docs/reviews/server-low-memory.md |
| disk-filling-up · df-du-gap, truncate-not-rm | df와 du의 차이, lsof +L1, 내용 비우기 | 글 본문과 docs/reviews/server-disk-filling-up.md |
| clock-drift · no-sudden-step, ntp-name | chrony는 보통 서서히 맞추고 makestep은 일부 소프트웨어에 심각한 영향 경고 | 글 본문과 docs/reviews/server-clock-drift.md |
