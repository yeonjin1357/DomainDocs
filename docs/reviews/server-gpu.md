# 사실 확인: GPU 사용률과 메모리

- 글: src/content/docs/server/gpu.mdx
- 확인일: 2026-11-03

| 확인한 주장 | 근거(URL) |
| --- | --- |
| GPU 사용률은 지난 샘플 구간에 커널이 하나라도 돈 시간의 비율, 구간은 제품에 따라 1초~1/6초. 메모리 사용률은 메모리를 읽거나 쓴 시간의 비율 | https://docs.nvidia.com/deploy/nvidia-smi/index.html (Utilization) |
| Clocks Event Reasons(옛 이름 Clock Throttle Reasons): SW Power Cap은 전력 때문에 클럭을 낮춤, HW Thermal Slowdown은 온도 때문에 클럭을 2배 이상 낮춤, 모두 Not Active면 최대 클럭 | 같은 문서 |
| nvidia-smi는 Compute·Graphics 자원을 쓰는 프로세스 목록을 보여 줌, FB 메모리 Total·Reserved·Used·Free | 같은 문서 |
| SM Activity(DCGM_FI_PROF_SM_ACTIVE)는 SM마다 warp가 하나라도 활성인 시간의 비율을 모든 SM에 대해 평균, 0.8 이상은 필요조건, 0.5 아래면 비효율 가능성. SM Occupancy는 높다고 늘 좋은 게 아님 | https://docs.nvidia.com/datacenter/dcgm/latest/user-guide/feature-overview.html |
| dcgm-exporter 기본 수집: GPU_UTIL, MEM_COPY_UTIL, FB_USED, FB_FREE, GPU_TEMP, POWER_USAGE, SM_CLOCK, XID_ERRORS(마지막 XID 값), PIPE_TENSOR_ACTIVE. PROF_SM_ACTIVE는 주석 처리(기본 꺼짐) | https://github.com/NVIDIA/dcgm-exporter/blob/main/etc/default-counters.csv |
| dcgm-exporter 기본 주소 :9400 | https://github.com/NVIDIA/dcgm-exporter/blob/main/pkg/cmd/app.go (CLIAddress 기본값) |
| XID는 NVIDIA 드라이버가 OS 커널 로그나 이벤트 로그에 남기는 에러 보고, 하드웨어·NVIDIA 소프트웨어·앱 문제 모두 가능 | https://docs.nvidia.com/deploy/xid-errors/introduction.html |
| GPU 메모리 할당 실패는 cudaErrorMemoryAllocation | https://docs.nvidia.com/cuda/cuda-runtime-api/group__CUDART__TYPES.html |
| PyTorch는 캐싱 할당자를 써서, 쉬는 캐시도 nvidia-smi에서는 쓰는 것으로 보임. memory_allocated와 memory_reserved로 나눠 봄 | https://github.com/pytorch/pytorch/blob/main/docs/source/notes/cuda.md (Memory management) |
| GPU는 limits에 적고, requests를 적으면 limits와 같아야 함, requests만은 안 됨 | https://kubernetes.io/docs/tasks/manage-gpus/scheduling-gpus/ |
| 장치 플러그인 설정으로 MIG(migStrategy, 기본 none)와 time-slicing 공유를 켬 | https://github.com/NVIDIA/k8s-device-plugin (README) |

- SM 수 '수십에서 백수십 개'는 A100 108개, H100 SXM 132개 같은 공개 사양을 기준으로 한 어림이에요.
- 그림 숫자(1초 중 0.4초, 24GB 중 14GB·6GB, SM 활동 22%)는 설명용 예시예요.
- `nvidia-smi --query-gpu`의 필드 이름은 공식 문서 본문에서 확인하지 못해서 글에 쓰지 않았어요.
