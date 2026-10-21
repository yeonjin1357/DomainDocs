# 사실 확인: 서버 시계가 어긋날 때

- 글: src/content/docs/server/clock-drift.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| timedatectl 출력의 System clock synchronized, NTP service, Time zone | https://man7.org/linux/man-pages/man1/timedatectl.1.html |
| chronyc tracking의 System time(NTP 시간보다 얼마나 느린지·빠른지), sources, 보통은 시계 속도를 조절해 서서히 맞춤, makestep은 한 번에 맞추고 일부 소프트웨어가 심각한 영향을 받는다는 경고 | https://chrony-project.org/doc/4.6/chronyc.html |
| NTP 프로토콜 | https://www.rfc-editor.org/rfc/rfc5905 |

- 메모: 트레이스 구간 시각이 각 서버 시계로 찍힌다는 것과 9시간 차이(UTC와 한국 시간)는 일반 설명이에요. 오프셋 예시 숫자는 설명용이에요.
