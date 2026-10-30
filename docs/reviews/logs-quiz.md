
## 2026-10-30 문제 다시 쓰기

- 문제: src/content/quizzes/logs/*.yaml (10개 파일, 47문제)
- 바꾼 까닭: OX 12문제 중 11문제가 X라 X만 골라도 거의 맞았어요(O 8%). 정답이 가장 긴 보기인 객관식이 50%였고, "에러가 정말 사라졌는지 축하하기" 같은 장난스러운 오답이 둘 있었어요.
- 고친 뒤: OX 11문제 중 O 5(45%), 객관식 29문제 중 정답이 가장 긴 보기 8(28%), 정답이 가장 긴 오답의 1.2배를 넘는 문제 0개예요.
- 새로 들어간 주장과 계산만 아래에서 확인했어요.

| 문제(파일 · id) | 확인한 주장 | 근거 |
| --- | --- | --- |
| levels-and-structured · json-size | 텍스트 142바이트, JSON 193바이트, 초당 2,000줄이면 하루 차이가 약 8.8GB예요 | node로 계산((193 − 142) × 2,000 × 86,400). 글 본문의 하루 24.5GB, 33.4GB와도 맞아요 |
| log-metrics · count-vs-rate | 오답 bytes_over_time은 줄 수가 아니라 바이트를 세는 LogQL 함수예요 | https://grafana.com/docs/loki/latest/query/metric_queries/ (Log range aggregations) |
| live-tail · sampled | Live Tail의 표본은 화면에 보여 주는 양만 줄이고, 저장된 로그는 그대로예요 | 글 본문(사람이 읽을 속도로 맞추려고 표본만 보여 줌)과 docs/reviews/logs-live-tail.md |
| keyword-alerts · late-logs | 수집 지연보다 짧은 구간을 세면 아직 도착하지 않은 줄을 못 세요 | 글 본문 |
