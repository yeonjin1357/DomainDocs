# 사실 확인: 단위와 숫자 표기

- 글: src/content/docs/foundations/units-and-notation.mdx
- 확인일: 2026-10-23

| 확인한 주장 | 근거(URL) |
| --- | --- |
| IEC가 1998년에 2의 거듭제곱 접두어(Ki 2¹⁰, Mi 2²⁰, Gi 2³⁰)를 정함, k·M·G는 1000의 거듭제곱 | https://physics.nist.gov/cuu/Units/binary.html |
| `df -h`는 1024의 거듭제곱으로 나누고 `G`처럼 적음, `-H`(`--si`)는 1000의 거듭제곱 | https://man7.org/linux/man-pages/man1/df.1.html |
| Prometheus는 기본 단위(초, 바이트)를 쓰고, 비트가 흔해 보여도 바이트, 퍼센트 대신 0~1 비율, 한 지표에서 초와 밀리초를 섞지 말라고 함 | https://prometheus.io/docs/practices/naming/ |
| Grafana 단위 `bytes(IEC)`·`bytes(SI)`, `bits(IEC)`·`bits(SI)`, `Percent (0-100)`·`Percent (0.0-1.0)` | https://github.com/grafana/grafana/blob/main/packages/grafana-data/src/valueFormats/categories.ts |

- 계산 확인: 10¹² ÷ 1024³ = 931.3GiB. 1Gbps ÷ 8 = 125MB/초. TB에서 1024와 1000의 차이는 1 − 10¹²/2⁴⁰ ≈ 9.1%라 본문은 "약 10%"로 썼어요.
- 메모: 쿠버네티스 `Mi`·`M`·`m`의 차이는 이어 둔 kubernetes/requests-and-limits 글의 검토 기록에 근거가 있어요.
- 함께 한 것: 퀴즈 5문제. `ratio-unit-in-grafana`는 위 Grafana 단위 근거와 같아요.
