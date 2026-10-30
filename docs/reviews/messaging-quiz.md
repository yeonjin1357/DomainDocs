# 사실 확인: 메시지 큐 퀴즈

- 문제: src/content/quizzes/messaging/*.yaml (11개 파일, 54문제)
- 확인일: 2026-10-21
- 방법: 숫자·기본값·버전마다 다른 동작이 든 문제만 골라, 그 문제가 기대는 글의 문장과 글의 검토 기록 근거에 맞춰 봤어요. 글에 없는 새 주장은 넣지 않았어요.

| 문제(파일 · id) | 확인한 주장 | 근거 |
| --- | --- | --- |
| overview · kafka-keeps-events, separate-groups | 읽어도 보관 기간 동안 남음, 그룹이 다르면 그룹마다 모두 받음 | 글 본문과 docs/reviews/messaging-overview.md |
| topics-and-partitions · order-per-partition, no-shrink, added-partitions-reorder | 순서는 파티션 안에서만, 파티션은 늘릴 수만 있음, 늘리면 키와 파티션 짝이 바뀜 | 글 본문과 docs/reviews/messaging-topics-and-partitions.md |
| producers · acks-1-risk, min-isr-one, linger-tradeoff | acks 0·1·all의 뜻(기본 all), batch.size 16,384·linger.ms 5ms, 멱등성 기본 켜짐 | 글 본문과 docs/reviews/messaging-producers.md |
| consumers-and-groups · latest-default, slow-processing-rebalance | auto.offset.reset 기본 latest, max.poll.interval.ms 기본 5분, session.timeout.ms 기본 45초 | 글 본문과 docs/reviews/messaging-consumers-and-groups.md |
| replication · isr-lag-time, unclean-election-off | replica.lag.time.max.ms 기본 30초, unclean leader election 기본 false | 글 본문과 docs/reviews/messaging-replication.md |
| retention · retention-default, segment-granularity | retention.ms 기본 7일, 세그먼트 단위 삭제(기본 1GiB) | 글 본문과 docs/reviews/messaging-retention.md |
| delivery-guarantees · at-least-once, eos-not-external-db | 기본은 최소 한 번, 정확히 한 번은 Kafka 안의 읽기·처리·쓰기 흐름 | 글 본문과 docs/reviews/messaging-delivery-guarantees.md |
| lag-growing · catch-up-time | 500,000 ÷ 100 = 5,000초 ≈ 83분 | 글 본문(계산) |
| rebalance-storm · reduce-poll-records, static-membership | max.poll.records 기본 500, group.instance.id 고정 멤버 | 글 본문과 docs/reviews/messaging-rebalance-storm.md |
| under-replicated · isr-shrinks-zero | 내려갔다 올라올 때 말고는 IsrShrinksPerSec·IsrExpandsPerSec가 0 | 글 본문과 docs/reviews/messaging-under-replicated.md |
| producer-send-failing · delivery-timeout, record-too-large | delivery.timeout.ms 기본 2분, max.request.size 1,048,576바이트 | 글 본문과 docs/reviews/messaging-producer-send-failing.md |

## 2026-10-30 문제 다시 쓰기

- 문제: src/content/quizzes/messaging/*.yaml (12개 파일, 59문제)
- 바꾼 까닭: OX 정답의 O가 31%, 정답이 가장 긴 보기인 객관식이 61%였어요. 정답에만 기본값 괄호("(기본 5분)", "(기본 500)")가 붙은 문제가 다섯, 부정으로 묻는 문제가 둘이었어요.
- 고친 뒤: OX 16문제 중 O 9(56%), 객관식 38문제 중 정답이 가장 긴 보기 9(24%), 정답이 가장 긴 오답의 1.2배를 넘는 문제 0개예요.
- 새로 들어간 주장만 아래에서 확인했어요. 나머지는 글 본문과 각 글의 검토 기록에 기대요.

| 문제(파일 · id) | 확인한 주장 | 근거 |
| --- | --- | --- |
| under-replicated · below-min-isr | ISR이 min.insync.replicas보다 적으면 acks=all 쓰기만 실패하고, acks=1 쓰기는 그대로 돼요(오답 "acks=1 쓰기도 실패해요") | https://kafka.apache.org/documentation/#topicconfigs_min.insync.replicas ("When a producer sets acks to "all" (or "-1"), min.insync.replicas specifies...") |
| delivery-guarantees · duplicates-possible | 프로듀서 멱등성은 쓰는 구간에서 로그에 한 번만 쌓이게 할 뿐, 컨슈머가 커밋 전에 죽으면 같은 이벤트를 다시 처리해요 | 글 본문(보장은 쓰는 구간과 읽는 구간을 따로 봄)과 https://kafka.apache.org/documentation/#semantics |
| metrics-sources · active-controller-sum | 클러스터의 ActiveControllerCount 합이 2면 이상 상태예요 | 글 본문(클러스터 합 1, 0이거나 2 이상이면 문제) |
| retention · tombstone | 키는 있고 값이 빈 이벤트는 삭제 표시(툼스톤)예요 | 글 본문과 docs/reviews/messaging-retention.md |
