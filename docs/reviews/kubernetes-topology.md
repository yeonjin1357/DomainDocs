# 사실 확인: 토폴로지 읽기

- 글: src/content/docs/kubernetes/topology.mdx
- 확인일: 2026-10-29

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 소유 관계는 dependent의 metadata.ownerReferences에 적힘, ReplicaSet·Deployment·Job 등의 컨트롤러가 자동으로 채움, 레이블·셀렉터와 다른 개념 | https://kubernetes.io/docs/concepts/overview/working-with-objects/owners-dependents/ |
| 셀렉터가 있는 서비스는 컨트롤 플레인이 EndpointSlice를 만들어 맞는 파드를 적음 | https://kubernetes.io/docs/concepts/services-networking/endpoint-slices/ |
| serving은 파드의 Ready와 이어짐, ready는 serving이면서 terminating이 아님, 프록시는 보통 terminating을 무시하지만 모두 종료 중이면 serving·terminating으로도 보냄 | 같은 문서 |
| 슬라이스당 기본 100개, --max-endpoints-per-slice로 최대 1000 | 같은 문서 |
| PVC와 PV 연결은 ClaimRef로 일대일, 파드는 volumes의 persistentVolumeClaim으로 씀 | https://kubernetes.io/docs/concepts/storage/persistent-volumes/ |

- OnDashboard 그림은 예시예요.
- 함께 한 것: 용어 owner-reference, endpoint-slice를 올리고, 쿠버네티스 개요에 이 글을 이었어요. 퀴즈 5문제를 썼어요.
