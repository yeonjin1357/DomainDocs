# 사실 확인: 대시보드는 어떻게 짤까

- 글: src/content/docs/foundations/dashboard-design.mdx
- 확인일: 2026-10-26

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 네 가지 신호는 latency, traffic, errors, saturation이고, 사용자가 쓰는 시스템에서 넷만 잴 수 있다면 이 넷에 집중하라고 함 | https://sre.google/sre-book/monitoring-distributed-systems/ |
| 대시보드는 이야기를 하거나 질문에 답해야 함, 큰 것에서 작은 것·일반에서 구체로, 인지 부담을 줄임 | https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/best-practices/ |
| 서비스마다 한 줄, 줄 순서는 데이터 흐름, 계층형 대시보드와 drill-down | 같은 문서 |
| 크기가 다른 서비스는 나누고, CPU는 코어 수로 맞춘 %로, 색에 뜻(빨강은 나쁨)과 임계값 | 같은 문서 |
| 템플릿 변수로 대시보드 복사(sprawl)를 막음, 패널 설명 달기, 대시보드끼리 링크 | 같은 문서 |
| 데이터가 바뀌는 속도보다 잦은 새로고침은 피함, 단위가 다르면 왼쪽·오른쪽 축, 누적 그래프는 오해를 부를 수 있어 대부분 끔 | 같은 문서 |

- 계산 확인: 60초 ÷ 5초 = 12라 "질의만 열두 배"로 썼어요.
- 메모: 맨 위 그림의 네 줄 구성은 위 원칙을 묶은 예시예요. 특정 제품의 화면이 아니에요.
- 함께 한 것: 퀴즈 5문제를 썼어요.
