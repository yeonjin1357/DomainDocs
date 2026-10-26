# 사실 확인: 쿠버네티스 지표는 어디서 오나

- 글: src/content/docs/kubernetes/metrics-sources.mdx
- 확인일: 2026-10-26

| 확인한 주장 | 근거(URL) |
| --- | --- |
| cAdvisor가 cgroup에서 컨테이너 값을 읽고 kubelet이 `/metrics/resource` 등으로 내보냄, 메모리는 working set으로 보고, working set은 운영체제마다 계산이 다르고 파일 캐시 일부도 들어감 | https://kubernetes.io/docs/tasks/debug/debug-cluster/resource-metrics-pipeline/ |
| kubelet 엔드포인트 `/metrics/cadvisor`, `/metrics/resource`, `/metrics/probes` | https://kubernetes.io/docs/concepts/cluster-administration/system-metrics/ |
| metrics-server는 자동 확장용, 모니터링 솔루션의 지표 출처로 쓰지 말고 kubelet `/metrics/resource`에서 모으라고 함, 정확한 사용량 출처로 쓰지 말라고 함 | https://github.com/kubernetes-sigs/metrics-server/blob/master/README.md |
| metrics-server는 15초마다 모으고, 파드마다 값을 메모리 캐시에 갱신해 두었다가 꺼내 줌(README의 순서도) | https://github.com/kubernetes-sigs/metrics-server/blob/master/README.md |
| kube-state-metrics는 API 서버를 지켜보며 객체 상태로 지표를 만들고, 개별 구성 요소의 건강이 아니라 객체에 집중, 값을 가공하지 않음 | https://github.com/kubernetes/kube-state-metrics/blob/main/README.md |
| `kube_pod_status_phase`, `kube_pod_container_status_restarts_total`(Counter), `kube_pod_container_resource_requests`, 요청은 kube-scheduler의 `kube_pod_resource_request`를 권함 | https://github.com/kubernetes/kube-state-metrics/blob/main/docs/metrics/workload/pod-metrics.md |
| `container_cpu_usage_seconds_total`(누적 CPU 초), `container_memory_usage_bytes`(언제 접근했든 모든 메모리), `container_memory_working_set_bytes` | https://github.com/google/cadvisor/blob/master/docs/storage/prometheus.md |
| kubernetes-mixin 규칙이 cAdvisor 지표에서 `image!=""`로 거름 | https://github.com/kubernetes-monitoring/kubernetes-mixin/blob/master/rules/apps.libsonnet |

- 질의 확인: promtool 3.15.1로 컨테이너 줄(400MB, image 있음), 이미지 없는 상위 줄(410MB), 요청(500MB)을 넣었어요.
  - 본문이 설명하는 비율(사용량 합 ÷ 요청 합)은 0.8이었어요. 지표 이름이 360px 한 줄보다 길어서 본문 코드에는 사용량 부분만 두었어요.
  - 거르지 않고 더하면 810MB로 두 배 가까이 나왔어요.
- 메모: 이 PC의 kubectl 설정이 외부 클러스터를 가리켜 실제 클러스터로는 확인하지 않았어요. 맨 위 그림의 숫자는 예시예요.
- 함께 한 것: 퀴즈 5문제를 썼어요.
