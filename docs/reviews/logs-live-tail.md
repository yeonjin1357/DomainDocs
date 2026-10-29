# 사실 확인: 라이브 테일

- 글: src/content/docs/logs/live-tail.mdx
- 확인일: 2026-10-29

| 확인한 주장 | 근거(URL) |
| --- | --- |
| Live Tail은 들어오는 로그를 거의 실시간으로 보여 줌, 세션 최대 3시간, 필터에 맞는 로그가 초당 500건을 넘으면 표본, 콘솔에서 로그 그룹 최대 10개, 필터는 대소문자 구분, 세션 시간(분)만큼 비용, 보인 비율(% displayed) 표시, 명령줄은 1초마다 새 줄, 웹소켓을 막으면 콘솔에서 못 씀 | https://docs.aws.amazon.com/AmazonCloudWatch/latest/logs/CloudWatchLogs_LiveTail.html |
| `kubectl logs -f`는 스트리밍, 선택자로 고르면 `--max-log-requests` 기본 5, `--tail` 기본은 선택자가 있으면 10 | https://kubernetes.io/docs/reference/kubectl/generated/kubectl_logs/ |

- "kubectl logs는 API 서버를 통해 노드의 kubelet에서 읽는다"는 쿠버네티스 로깅 구조의 일반 설명이에요. 「로그가 모이는 길」의 근거(Kubernetes Logging Architecture)와 같은 내용이에요.
- OnDashboard의 숫자(초당 1,240건, 40%)는 500 ÷ 1,240으로 맞춘 예시예요.
- 함께 한 것: 용어 live-tail을 올렸어요. 퀴즈 5문제를 썼어요.
