# 사실 확인: 가상화와 하이퍼바이저

- 글: src/content/docs/server/virtualization.mdx
- 확인일: 2026-11-05

| 확인한 주장 | 근거(URL) |
| --- | --- |
| CPU Ready % = 합계 ÷ (차트 간격 초 × 1000) × 100, 실시간 20초(÷200)·하루 300초(÷3,000)·한 주 ÷18,000·한 달 ÷72,000·한 해 ÷864,000, vCPU를 모두 더한 값, vCPU별 지표는 기본으로 실시간만 | https://knowledge.broadcom.com/external/article/306576/converting-between-cpu-summation-and-cpu.html |
| 풍선 드라이버는 게스트 물리 메모리를 할당해 잡아 둠(allocates and pins), 여유가 있으면 성능 영향 없음, 없으면 게스트가 내보낼 페이지를 골라 자기 스왑으로, VMware Tools가 있어야 풍선이 됨 | 백서 3.3절·983행, https://web.archive.org/web/2021/https://www.vmware.com/content/dam/digitalmarketing/vmware/en/pdf/techpaper/perf-vsphere-memory_management.pdf |
| 빈 메모리가 soft 쪽으로 줄면 풍선, 모자라거나 hard 쪽이면 스왑을 함께 씀, 호스트 스왑은 게스트가 모르고 커널 페이지까지 내보낼 수 있음(이중 페이징) | 같은 백서 3.4·3.5절 |
| 메모리 한도(limit)를 넘으면 호스트가 high 상태여도 풍선·스왑으로 되가져감 | 같은 백서 3.5절 끝 |
| 스냅숏 하나를 72시간 넘게 두지 말 것, 백업으로 쓰지 말 것, 체인 최대 32개·권장 2~3개, 오래 두면 커지며 공간·성능 영향 | https://knowledge.broadcom.com/external/article/318825/best-practices-for-using-vmware-snapshots.html |
| /proc/stat의 steal(8번째 칸, 2.6.11부터)은 가상 환경에서 다른 운영체제가 쓴 시간 | https://man7.org/linux/man-pages/man5/proc_stat.5.html |
| KVM steal은 vCPU가 돌지 못한 시간(ns), idle이던 시간은 steal로 안 셈 | https://docs.kernel.org/virt/kvm/x86/msr.html |
| virtio 풍선은 DEFLATE_ON_OOM 기능이 없을 때만 adjust_managed_page_count(MemTotal 감소) | https://github.com/torvalds/linux/blob/master/drivers/virtio/virtio_balloon.c (955행) |
| vmw_balloon에는 adjust_managed_page_count가 없음(MemTotal 그대로) | https://github.com/torvalds/linux/blob/master/drivers/misc/vmw_balloon.c |
| VMware 리눅스 게스트는 하이퍼바이저에 stealclock 지원을 물어 될 때만 steal을 셈, mshyperv.c에는 steal 처리가 없음 | https://github.com/torvalds/linux/blob/master/arch/x86/kernel/cpu/vmware.c , arch/x86/kernel/cpu/mshyperv.c |

직접 돌려 본 것(WSL 2, 커널 6.18.33.2-microsoft-standard, /dev/kvm 있음, QEMU 8.2 + Ubuntu 6.8.0-147 게스트 커널, busybox initramfs):

- `taskset -c 4 qemu ... -smp 1`, 게스트 셸 덧셈 400만 번: 혼자 4.53초(user 94·system 3·idle 3·steal 0%), 같은 CPU에 `while :; do :; done` 이웃 8.64초(user 46·system 1·idle 1·steal 51%), `-smp 2`로 일꾼 둘 8.65초(steal 50%), `-smp 2`에 일꾼 하나 4.43초(steal 4%·idle 48%).
- WSL 안 bash 일꾼 16개(300만 번): 혼자 14.44초 steal 0%, Windows에서 PowerShell 바쁜 루프 16개를 돌리는 동안 20.20초 steal 0%.
- `-m 1024 -device virtio-balloon-pci`, 모니터 `balloon 512`: deflate-on-oom=off는 MemTotal 984,572 → 460,284kB(MemAvailable 876,956 → 361,112), on은 MemTotal 그대로 MemFree 947,524 → 431,680kB(MemAvailable 360,900). 사용률(1 − available/total) 10.9% → 21.5% / 63.3%. `balloon 1024`로 되돌리면 원래대로.
