# 사실 확인: 배포 방식과 지켜보기

- 글: src/content/docs/foundations/deployments.mdx
- 확인일: 2026-11-03

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 장애의 약 70%가 운영 중인 시스템의 변경 때문, 할 일은 점진 배포·빠른 탐지·안전한 되돌리기 | https://sre.google/sre-book/introduction/ (Change Management) |
| 변경을 받은 쪽이 카나리, 나머지가 대조군(control). 카나리는 A/B 시험과 같음 | https://sre.google/workbook/canarying-releases/ |
| 배포 전후 비교(before/after)는 시간이 가장 큰 변화 원인이라 위험 | 같은 문서 'Before/After Evaluation Is Risky' |
| 카나리가 작아 전체 에러율에 묻히니 버전별로 나눠 봄, 카나리 에러율이 대조군과 너무 다르면 멈추고 되돌림 | 같은 문서(Figure 16-3, 16-4 설명) |
| 30분 카나리를 1시간 단위 지표로 평가해 엉뚱한 결론 | 같은 문서(errors-per-hour 예) |
| Deployment 방식은 Recreate와 RollingUpdate(기본), maxSurge·maxUnavailable 기본 25%, maxSurge는 올림, maxUnavailable은 내림 | https://kubernetes.io/docs/concepts/workloads/controllers/deployment/ |
| 블루·그린은 라우터를 돌려 전환·되돌림, DB 스키마가 어려워서 스키마 변경을 앱과 따로 먼저 배포 | https://martinfowler.com/bliki/BlueGreenDeployment.html |
| 기능 플래그는 기능 공개와 코드 배포를 나눔, release toggle은 대개 한두 주 안에 정리, ops toggle은 성능이 걱정되는 기능을 바로 끄거나 줄임 | https://martinfowler.com/articles/feature-toggles.html |
| 넓혔다 좁히기: expand, migrate, contract 세 단계 | https://martinfowler.com/bliki/ParallelChange.html |
| `service.version` 속성(stable) | OpenTelemetry semantic-conventions docs/registry/attributes/service.md |
| 버전별 에러율 질의와 카나리 비교 알림(2배 이상, 10분 500건 넘음) | promtool 3.5.0 `test rules` 통과: v1.4 0.193%, v1.5 1.667%, 알림 발생 |

- 계산: 10분 30건 중 1건 = 3.3%. 롤링 중 전체 에러율 = 0.2% + 1.8% × 새 버전 몫(10~60%) = 0.38~1.28%. 파드 10개의 25%: maxSurge 2.5 → 3, maxUnavailable 2.5 → 2.
- 화면 예시(카나리 비교 표, 배포 표시 그래프)의 숫자는 설명용이에요.
