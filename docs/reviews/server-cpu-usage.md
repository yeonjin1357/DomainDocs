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
