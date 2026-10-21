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
