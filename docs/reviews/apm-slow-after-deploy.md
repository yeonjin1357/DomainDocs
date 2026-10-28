# 사실 확인: 배포 뒤에 느려졌을 때

- 글: src/content/docs/apm/slow-after-deploy.mdx
- 확인일: 2026-10-28

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 카나리는 변경을 일부에 시간을 정해 내보내고 평가하는 것, 카나리 지표가 대조군과 많이 다르면 멈추고 되돌림, 20% 실패 버전을 5%에만 내보내면 전체 1% | https://sre.google/workbook/canarying-releases/ |
| `service.version`은 서비스 구성 요소의 버전 문자열(stable) | https://opentelemetry.io/docs/specs/semconv/registry/attributes/service/ |
| Deployment 롤링 업데이트 기본 maxUnavailable·maxSurge 25% | https://kubernetes.io/docs/concepts/workloads/controllers/deployment/ |
| 계층 컴파일: 인터프리터·클라이언트 컴파일러로 프로파일 정보를 모은 뒤 서버 컴파일러가 최적화 코드를 만듦, 기본 켜짐 | https://docs.oracle.com/en/java/javase/21/vm/java-hotspot-virtual-machine-performance-enhancements.html |
| 대시보드 주석(annotation)으로 이벤트 시각을 표시 | https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/annotate-visualizations/ |

- 재현(WSL Ubuntu, OpenJDK 17): HashMap·StringBuilder로 '요청'을 처리하는 함수를 1,000건씩 12묶음 돌려 묶음마다 요청당 평균을 쟀어요(3번 실행).
  - 첫 묶음 36.0~42.2µs, 열째 묶음 8.0~13.5µs(중간에 GC로 튀는 묶음 있음). 글에는 3~5배, 8~14µs로 적었어요.
  - `-Xint`(JIT 끔): 첫 묶음 618.9µs, 12번째 614.9µs.
- 첫 화면과 버전 비교 표의 숫자(400→900ms, v41·v42의 SQL 3번·41번)는 예시예요.
- 「응답이 느려졌을 때」가 이미 Google SRE Book을 근거로 "되돌릴 수 있으면 먼저 되돌린다"고 써 두어 이 글과 맞아요. 그 글에 이 글로 가는 줄을 더했어요.
- 함께 한 것: 용어 canary를 올리고 퀴즈 5문제를 썼어요.
