# 사실 확인: CPU 사용률과 부하

- 글: src/content/docs/server/cpu-usage.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| CPU 시간 항목(user, nice, system, idle, iowait, irq, softirq, steal), USER_HZ 누적 | https://man7.org/linux/man-pages/man5/proc_stat.5.html |
| iowait를 믿기 어려운 이유 세 가지 | 같은 문서 "This value is not reliable, for the following reasons" |
| 부하 = R + D 상태의 1·5·15분 평균, 넷째 칸 | https://man7.org/linux/man-pages/man5/proc_loadavg.5.html |
| 멀티스레드 프로세스는 100%를 넘을 수 있음, us·sy·ni·id·wa·hi·si·st 뜻 | https://man7.org/linux/man-pages/man1/top.1.html |
| 예시 계산 | 4 × 10 × 100 = 4,000, (4,000 − 1,000) ÷ 4,000 = 75%. 코어 8개 중 1개가 100%면 평균 12.5% |

## 2026-11-03 보강: 코어는 운영체제가 보는 CPU 수로 세요

| 확인한 주장 | 근거(URL) |
| --- | --- |
| SMT는 코어 하나에서 여러 스레드를 함께 돌리고, 스레드 하나가 vCPU 하나로 보임. m5.xlarge는 코어 2개 × 코어당 스레드 2개 = vCPU 4개 | https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-optimize-cpu.html |
| nproc은 현재 프로세스가 쓸 수 있는 처리 단위 수를 출력 | https://man7.org/linux/man-pages/man1/nproc.1.html |
| lscpu가 CPU·스레드·코어·소켓 수를 보여 줌, 필드 이름 `Thread(s) per core` | https://man7.org/linux/man-pages/man1/lscpu.1.html, WSL Ubuntu에서 실행해 확인(Thread(s) per core: 2) |
- (2026-11-06 그림 다시 그림) 사용률과 부하 그림은 한순간을 센 예시예요(바쁠 때 실행 4 + 차례 4 = 8, 디스크 기다릴 때 실행 1 + D 상태 8 = 9, 사용률 4/4 = 100%와 1/4 = 25%). 디스크를 기다리는 시간은 쉰 시간(iowait)으로 세고 부하에는 D 상태로 들어간다는 건 본문 표와 부하 근거와 같아요.
