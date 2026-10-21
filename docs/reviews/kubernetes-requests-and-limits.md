# 사실 확인: 요청과 한도

- 글: src/content/docs/kubernetes/requests-and-limits.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 스케줄러는 요청으로 노드를 고르고, 요청 합계가 용량보다 작게 놓음. 실제 사용이 낮아도 거절 | https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/ |
| 노드에 여유가 있으면 요청보다 더 쓸 수 있음, CPU 경합 시 요청이 크면 CPU 시간을 더 받음 | https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/ |
| CPU 한도 = 스로틀링, 메모리 한도 = OOM으로 프로세스 종료, PID 1이면 재시작, 종료 이유 OOMKilled | https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/ |
| CPU 1 = 물리 또는 가상 코어 1개, 0.1 = 100m, Mi는 2의 거듭제곱 단위, 400m 메모리 = 0.4바이트 | https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/ |
| 한도만 적으면 요청 = 한도, 런타임은 CPU 사용으로 컨테이너를 끝내지 않음 | https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/ |
| QoS 세 등급의 조건, 축출 순서 BestEffort → Burstable → Guaranteed, 요청을 넘은 파드만 후보 | https://kubernetes.io/docs/concepts/workloads/pods/pod-qos/ |
| CFS 기본 주기 100ms, 몫을 다 쓰면 다음 주기까지 멈춤, nr_throttled·throttled_time | https://docs.kernel.org/scheduler/sched-bwc.html |

- 메모: StatTile 예시(4코어 노드, 요청 합계 3, 새 파드 1.5)와 메모리 그래프는 설명용으로 만든 숫자예요.
