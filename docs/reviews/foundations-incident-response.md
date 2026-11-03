# 사실 확인: 장애 대응의 흐름과 MTTR

- 글: src/content/docs/foundations/incident-response.mdx
- 확인일: 2026-11-03

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 피해 멈추기(stopping the bleeding)가 첫째, 원인을 찾는 사이 시스템이 무너지면 사용자에게 도움이 안 됨, 그래도 로그 같은 증거는 남김 | https://sre.google/sre-book/effective-troubleshooting/ |
| 역할 나누기: 지휘(incident commander), 운영(시스템을 바꾸는 유일한 그룹), 소통 | https://sre.google/sre-book/managing-incidents/ |
| 회고는 blameless, 모두 그때 정보로 옳은 일을 했다고 보고, 탓하는 문화는 문제를 숨기게 함 | https://sre.google/sre-book/postmortem-culture/ |
| MTTR·MTTM 같은 통계는 시뮬레이션과 통계 분석으로 볼 때 의사 결정과 추세 분석에 잘 맞지 않음 | https://sre.google/resources/practices-and-processes/incident-metrics-in-sre/ |
| MTTR의 R은 repair·recovery·resolve·respond, MTTA는 확인(acknowledge)까지의 평균 | https://www.atlassian.com/incident-management/kpis/common-metrics |

- 장애 하나의 시각(6분, 25분, 40분)과 10건의 시간(8~240분, 평균 35.2분, 중앙값 12.5분)은 설명용 예시예요.
- '장애 시간은 대부분 짧고 몇 건만 아주 길다'는 예시로 보여 준 모양이에요. 보고서의 결론은 위 표의 문장까지만 인용했어요.

## 2026-11-03 더한 절: 런북

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 미리 생각해 플레이북에 적으면 즉석 대응보다 MTTR이 약 3배 나아짐, 플레이북이 생각하는 엔지니어를 대신하지는 못함 | https://sre.google/sre-book/introduction/ |
| kube-prometheus 알림 규칙은 `annotations.runbook_url`로 runbooks.prometheus-operator.dev를 가리켜요 | https://github.com/prometheus-operator/kube-prometheus/blob/main/manifests/kubernetesControlPlane-prometheusRule.yaml |
