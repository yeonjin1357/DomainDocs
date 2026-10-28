# 사실 확인: 볼륨이 붙지 않을 때

- 글: src/content/docs/kubernetes/volume-not-attaching.mdx
- 확인일: 2026-10-28

| 확인한 주장 | 근거(URL) |
| --- | --- |
| `volumeBindingMode` 기본 `Immediate`, 영역에 묶인 저장소는 파드 조건을 모른 채 만들어 스케줄 못 할 수 있음, `WaitForFirstConsumer`가 파드가 생길 때까지 미룸 | https://kubernetes.io/docs/concepts/storage/storage-classes/ |
| PVC 이벤트 `waiting for first consumer to be created before binding`, `no persistent volumes available for this claim and no storage class is set` | https://github.com/kubernetes/kubernetes/blob/master/pkg/controller/volume/persistentvolume/pv_controller.go |
| `storageClassName: ""`은 기본 등급을 쓰지 않음, 맞는 볼륨이 없으면 PVC는 계속 묶이지 않음 | https://kubernetes.io/docs/concepts/storage/persistent-volumes/ |
| 스케줄러 메시지: 1.32까지 `node(s) had volume node affinity conflict`, 1.33부터 `node(s) didn't match PersistentVolume's node affinity` | https://github.com/kubernetes/kubernetes/blob/release-1.32/pkg/scheduler/framework/plugins/volumebinding/binder.go , 같은 파일 release-1.33·master |
| FailedAttachVolume 메시지: 1.34까지 `Multi-Attach error for volume …`, 1.35부터 `Waiting for detach for volume …`, 뒷부분 `Volume is already used by pod(s) …` / `Volume is already exclusively attached …` | https://github.com/kubernetes/kubernetes/blob/release-1.34/pkg/controller/volume/attachdetach/reconciler/reconciler.go , 같은 파일 release-1.35·master |
| 메시지 조립 `%v for volume %q %v` | https://github.com/kubernetes/kubernetes/blob/master/pkg/volume/util/operationexecutor/operation_executor.go |
| CSI 노드 구성 요소는 DaemonSet으로 모든 노드에 | https://kubernetes-csi.github.io/docs/deploying.html |
| `allowVolumeExpansion`이 true여야 PVC 확장, 줄이기는 지원 안 함, 파일 시스템은 XFS·Ext3·Ext4 | https://kubernetes.io/docs/concepts/storage/persistent-volumes/ |
| `kubelet_volume_stats_available_bytes`, `kubelet_volume_stats_capacity_bytes`, 레이블 `namespace`·`persistentvolumeclaim` | https://github.com/kubernetes/kubernetes/blob/master/pkg/kubelet/metrics/metrics.go , https://github.com/kubernetes/kubernetes/blob/master/pkg/kubelet/metrics/collectors/volume_stats.go |

- 함께 한 것: 용어 storage-class를 올리고(PV 용어의 StorageClass 별칭은 뺐어요), 「설정과 저장소」에 이 글로 가는 줄을 더했어요. 퀴즈 5문제를 썼어요.
