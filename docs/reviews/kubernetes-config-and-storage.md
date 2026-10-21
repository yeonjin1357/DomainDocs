# 사실 확인: 설정과 저장소

- 글: src/content/docs/kubernetes/config-and-storage.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| ConfigMap = 비밀 아닌 키-값, 환경 변수·인자·볼륨 파일로 사용, 이미지와 설정 분리, 1MiB 한도, 비밀 보장 없음 | https://kubernetes.io/docs/concepts/configuration/configmap/ |
| 볼륨으로 쓴 ConfigMap은 결국 갱신, 환경 변수는 자동 갱신 안 됨·파드 재시작 필요 | https://kubernetes.io/docs/concepts/configuration/configmap/ |
| Secret = 비밀번호·토큰·키, data 값은 base64, 기본으로 etcd에 암호화 없이 저장, API·etcd 접근자와 파드 생성 권한자가 읽을 수 있음, 저장 암호화·RBAC·바깥 저장소 권장 | https://kubernetes.io/docs/concepts/configuration/secret/ |
| 컨테이너 파일은 사라짐, kubelet은 깨끗한 상태로 재시작, emptyDir은 컨테이너가 죽어도 안전하고 파드가 노드에서 사라지면 삭제 | https://kubernetes.io/docs/concepts/storage/volumes/ |
| PV = 관리자 생성 또는 StorageClass 동적 생성, 파드와 별개 생애. PVC = 사용자의 저장소 요청, 크기·접근 모드 | https://kubernetes.io/docs/concepts/storage/persistent-volumes/ |
| 접근 모드 네 가지의 뜻, RWO는 같은 노드의 여러 파드 허용 | https://kubernetes.io/docs/concepts/storage/persistent-volumes/ |
| Retain·Delete 회수 정책, 동적 생성 PV는 StorageClass 정책을 따르고 기본 Delete | https://kubernetes.io/docs/concepts/storage/persistent-volumes/ |

- 메모: PVC 사용률 예시 숫자는 설명용이에요.
