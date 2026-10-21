# 사실 확인: 이벤트로 원인 찾기

- 글: src/content/docs/kubernetes/reading-events.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 이벤트는 보존 기간이 짧고, 계기·문구가 바뀔 수 있어 참고용·최선 노력의 보조 자료로 다룸 | https://kubernetes.io/docs/reference/kubernetes-api/cluster-resources/event-v1/ |
| kubectl events, --types(종류 거르기), --for(객체 거르기) | https://kubernetes.io/docs/reference/kubectl/generated/kubectl_events/ |
| --event-ttl 기본 1h0m0s | https://kubernetes.io/docs/reference/command-line-tools-reference/kube-apiserver/ |

- 메모: 이유별 다음 글 표는 이 사이트의 다른 글로 잇는 안내예요. 워터폴 시각은 설명용이에요.
