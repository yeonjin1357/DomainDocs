# 사실 확인: 컨테이너 이미지와 레이어

- 글: src/content/docs/kubernetes/images-and-layers.mdx
- 확인일: 2026-10-29

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 레이어는 더한 것·고친 것·지운 것의 변경분, 지움은 `.wh.` 화이트아웃, 레이어는 차례로 겹침, 화이트아웃은 아래 레이어에만 적용 | https://github.com/opencontainers/image-spec/blob/main/layer.md |
| 레이어는 읽기 전용 차이의 묶음, 컨테이너마다 얇은 쓰기 레이어, 쓸 때 복사, 뒤에서 지운 파일도 이미지 크기에 남음, 같은 이미지의 컨테이너는 읽기 전용 데이터를 공유, ps -s의 size·virtual 뜻, Engine 29는 새로 설치하면 containerd 이미지 저장소 | https://docs.docker.com/engine/storage/drivers/ |
| imagePullPolicy 기본값(latest·태그 없음 → Always, 그 밖의 태그·다이제스트 → IfNotPresent), Always여도 캐시된 레이어는 다시 받지 않음, 받기 재시도 간격 최대 300초 | https://kubernetes.io/docs/concepts/containers/images/ |
| 디스크 사용률이 High를 넘으면 오래 안 쓴 이미지부터 Low까지 지움 | https://kubernetes.io/docs/concepts/architecture/garbage-collection/ |
| imageGCHighThresholdPercent 기본 85, imageGCLowThresholdPercent 기본 80 | https://kubernetes.io/docs/reference/config-api/kubelet-config.v1beta1/ |
| 이미지 이벤트 이름 Pulling, Pulled, Failed, BackOff | https://github.com/kubernetes/kubernetes/blob/master/pkg/kubelet/events/event.go |

- 재현(Docker 29.5.3, Docker Desktop): 글의 Dockerfile로 이미지를 만들어 `docker history`에서 8.47MB / 52.4MB / 4.1kB 레이어를 봤어요. 컨테이너 안에서 `/big.bin`은 보이지 않았어요.
  - alpine:3.20, 큰 파일 이미지, 파일 하나를 COPY한 이미지의 첫 레이어가 모두 `sha256:08bc4e534116…`로 같았어요.
  - 새 파일을 만들고 `/etc/motd`를 고친 컨테이너의 `docker diff`: `C /etc`, `C /etc/motd`, `A /new.txt`. `docker ps -s`는 `24.6kB (virtual 8.52MB)`.
  - 큰 파일 이미지는 `docker image inspect`의 Size 56,078,147바이트, `docker images`의 크기 117MB였어요.
- 「모니터링에서는」의 86%는 예시예요.
- 함께 한 것: 용어 image-layer, writable-layer, copy-on-write, registry, image-pull-policy를 올리고, 쿠버네티스 개요와 「컨테이너」에 이 글을 이었어요. 퀴즈 5문제를 썼어요.
