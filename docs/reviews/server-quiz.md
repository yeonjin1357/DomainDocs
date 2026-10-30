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

## 2026-10-30 문제 다시 보기

15편 72문제를 글과 나란히 읽고 다시 봤어요. '아닌 것은'·'모으지 않는 것은' 문제 3개를 상황을 해석하는 문제로 바꾸고, 판단을 묻는 말(괜찮을까요, 좋나요, 두 번 더해질 수 있나요)을 없앴어요. 정답만 한두 자 길던 보기 7개는 길이를 맞췄어요. OX의 O는 44%에서 52%, 정답이 가장 긴 객관식은 28%에서 13%가 됐어요.

| 문제 | 주장 | 근거 |
| --- | --- | --- |
| disk-filling-up · find-what-grew | du -x는 다른 파일 시스템을 건너뛰며 크기를 잼, 페이지 캐시는 메모리라 디스크 공간과 무관 | 글 2단계, docs/reviews/server-disk-filling-up.md |
| slow-disk · nightly-disk-spike | 백업·로그 압축·인덱스 재생성·배치가 디스크를 크게 씀, pidstat -d로 프로세스별 읽기·쓰기 | 글 3단계 |
| services-and-logs · app-log-not-in-journal | 앱이 따로 쓰는 파일 로그는 journald를 거치지 않음 | 글 본문, docs/reviews/server-services-and-logs.md |
| server-not-reporting · gap-zero-misread | 0은 재 봤더니 없었다는 기록이라, 수집 못 한 구간을 0으로 채우면 일이 없던 것처럼 읽힘 | 글 4단계, foundations/no-data-vs-zero |
