# 사실 확인: 메시지 큐가 하는 일

- 글: src/content/docs/messaging/overview.mdx
- 확인일: 2026-10-21

| 확인한 주장 | 근거(URL) |
| --- | --- |
| 이벤트 = 일어난 일의 기록, 레코드·메시지라고도 함, 키·값·시각·헤더 | https://kafka.apache.org/43/getting-started/introduction/ |
| 프로듀서·컨슈머는 서로 완전히 분리되어 모름, 이것이 확장성의 핵심 | https://kafka.apache.org/43/getting-started/introduction/ |
| 토픽은 폴더와 비슷, 여러 프로듀서·컨슈머, 읽어도 지워지지 않고 토픽별 보관 기간 뒤 버림, 파티션은 여러 브로커에 흩어짐 | https://kafka.apache.org/43/getting-started/introduction/ |
| 클러스터 = 서버 하나 이상, 저장 계층 = 브로커, 서버가 죽으면 다른 서버가 넘겨받음, 운영에선 복제 계수 3이 흔함 | https://kafka.apache.org/43/getting-started/introduction/ |
| 컨슈머 그룹 = 하나의 논리적 구독자, 한 그룹이면 큐처럼·그룹마다면 발행·구독처럼 | https://kafka.apache.org/43/javadoc/org/apache/kafka/clients/consumer/KafkaConsumer.html |
| 받는 쪽이 느리면 뒤처졌다가 따라잡음(pull 방식) | https://kafka.apache.org/43/design/design/ |
| KRaft 모드에서 서버는 컨트롤러·브로커·둘 다 역할 | https://kafka.apache.org/43/operations/kraft/ |

- 메모: 전통적인 큐와 발행·구독의 구분은 KafkaConsumer 문서의 설명을 바탕으로 한 일반 설명이에요.
