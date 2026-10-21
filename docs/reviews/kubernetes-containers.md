# 사실 확인: 컨테이너

- 글: src/content/docs/kubernetes/containers.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 컨테이너는 VM과 비슷하지만 OS를 함께 써서 격리가 느슨하고 가벼움 | https://kubernetes.io/docs/concepts/overview/ |
| 이미지 = 앱과 모든 의존성을 묶은 바이너리, 태그 없으면 latest, 다이제스트는 특정 버전을 하나로 가리킴 | https://kubernetes.io/docs/concepts/containers/images/ |
| 네임스페이스 정의와 종류(Cgroup, IPC, Network, Mount, PID, Time, User, UTS)와 각각 나누는 것 | https://man7.org/linux/man-pages/man7/namespaces.7.html |
| cgroup = 프로세스를 계층 그룹으로 묶어 자원 사용을 제한하고 재는 기능 | https://man7.org/linux/man-pages/man7/cgroups.7.html |

- 메모: JVM이 힙 밖에서도 메모리를 쓴다는 건 apm/jvm-memory 글의 근거를 따랐어요. 쿠버네티스 네임스페이스가 리눅스 네임스페이스와 다르다는 건 일반 설명이에요.
