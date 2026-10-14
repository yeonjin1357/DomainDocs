# 공통 기초 4묶음 실행 계획: 숫자의 재료

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. This batch runs article tasks **overlapped** and uses the **token-saving review flow** (see "진행 방식").

**Goal:** 공통 기초 영역에 글 4편(개념 2, 가이드 2)을 더하고, 묶음 끝에 관련 글 링크를 정리한 뒤 공개한다.

**Architecture:** 1~3묶음과 같다. 코드 변경 없음(필요하면 화면 점검에서 작은 스타일 수정만). 글은 `src/content/docs/foundations/*.mdx`, 기존 컴포넌트만 쓴다.

**Spec:** `docs/superpowers/specs/2026-10-13-domaindocs-site-design.md`

**Selection (사용자 위임):** 사용자가 "후보도 알아서 골라서 진행"하라고 위임했고, 3묶음 뒤 "그렇게 진행해서 다음 묶음 진행해볼래?"라고 했다. 기존 글 다섯 편이 짧게만 언급한 히스토그램을 개념 글로 세우고, 그 위에서 자주 생기는 p99 문제를 가이드로 묶는다. 카디널리티 개념은 「시계열과 레이블」이 이미 다뤄서, 이번에는 "시계열이 갑자기 늘었을 때" 가이드로만 다룬다. 「로그, 메트릭, 트레이스」는 APM 영역으로 넘어가는 다리다.

## Global Constraints

- 글쓰기 규칙은 `docs/writing-guide.md`가 기준이다. 7장 "검토에서 자주 나온 지적"과 소프트 상한(더 깊이 약 2,000자, 참고 자료 약 15개, 요약은 한 문장)을 지킨다.
- `npm run lint:content`가 위반 0건이어야 한다. 검사기 규칙은 바꾸지 않는다.
- 틀: 개념 글은 OnDashboard → KeyPoints(1~3) → Checkpoints → (Deeper). 가이드는 Situation → FirstLook(1~3) → `##` 단계 → Checkpoints.
- 컴포넌트는 OnDashboard, KeyPoints, Point, Checkpoints, Check, Deeper, Situation, FirstLook, Item, Term, MiniLineChart, StatTile만 쓴다. 새 데모 없음.
- `<Term slug>`와 `related`는 작업 폴더에 파일이 있는 글만 가리킨다. 기존 글 12편: `foundations/percentiles`, `counters-and-rate`, `time-series-and-labels`, `collection-interval`, `aggregation-and-downsampling`, `no-data-vs-zero`, `why-numbers-differ`, `empty-graph`, `slo-and-error-budget`, `red-and-use`, `alert-conditions`, `alert-fatigue`.
- 아이콘: sigma, activity, database, server, chart-line, chart-column, gauge, timer, layers, hash, clock, trending-up 중에서.
- `updated: 2026-10-14`. 용어는 "레이블", "시계열", "샘플", "스파이크", 책 이름은 "Google SRE Book"/"Google SRE Workbook"으로 통일한다.
- PromQL 예시는 서비스(`job`)를 고르는 조건을 둔다(3묶음 묶음 검토 교훈).
- 커밋 메시지는 `docs: …` 형식, 마지막 줄은 각자 하네스가 지정한 Co-Authored-By.

## 진행 방식 (겹쳐 진행 + 토큰 절약 흐름)

글 한 편은 이렇게 간다.

1. **초안(Opus 작성자):** 자기 글 파일 하나만 만들고 `npm run lint:content`만 돌린다. 커밋하지 않는다. 쓰면서 확인한 1차 자료와 핵심 인용을 보고서에 남긴다.
2. **검토 두 개를 동시에(둘 다 Opus, 읽기 전용):** 사실 검토(부록 A, 결과는 `docs/reviews/`)와 가독성 검토(결과는 SDD 작업 폴더).
3. **반영(새 Sonnet 수정자):** 두 검토 파일을 한 번에 반영하고 `## 반영`을 채운다. 사실이 걸리면 사실 검토가 이긴다. lint와 build를 통과시키고 자기 파일만 커밋한다. 작성자를 이어 쓰지 않는다.
4. **범위 재검토(Sonnet):** 지적이 다 풀렸는지와 새 문제만 본다. 고칠 게 남으면 새 Sonnet 수정자가 한 번 더 고친다.

공통 규칙:
- 읽기 전용 단계(초안, 검토)는 동시에 돌려도 된다. 반영·수정·화면 점검은 한 번에 하나만 한다. `dist/`, 포트 4329, git 인덱스를 함께 쓰기 때문이다.
- 초안 단계의 lint가 **다른 사람의 초안 파일** 때문에 위반을 보이면 무시한다. 자기 파일만 0건이면 된다.
- 커밋할 때는 `git add`에 자기 파일 경로만 적는다(`git add -A` 금지).
- 글만 바뀐 라운드는 lint와 build만 돌린다. `npm run test:e2e`는 화면 코드를 고친 라운드와 묶음 끝에만 돌린다.
- promtool은 컨트롤러가 받아 둔 `C:\Users\최연진\AppData\Local\Temp\claude\C--project-DomainDocs\6b88c808-b2ca-467e-99d4-0da7ed0e227f\scratchpad\tools-b4\prometheus-3.15.0.windows-amd64\promtool.exe`(3.15.0, sha256 확인함)를 쓴다. 새로 받지 않는다. 시험 파일은 스크래치 폴더 아래 새 폴더에 둔다.
- 검토자와 수정자는 글쓰기 가이드 전체 대신 27~155행(규칙, 뼈대, 분량)과 226~285행(검사 규칙, 7장, 용어)만 읽는다.
- 뒤 글이 앞 글을 `<Term>`으로 가리키면, 앞 글 초안 파일이 있은 뒤에 뒤 글 초안을 시작한다.

순서: Task 1과 Task 3 초안을 동시에 시작한다. Task 2는 Task 1 초안 뒤, Task 4는 Task 3 초안 뒤에 시작한다.

## Review Focus

1. **`histogram_quantile`의 실제 동작**: 버킷 안 선형 보간, 가장 큰 유한 버킷 위로 가면 그 경계값을 돌려줌(+Inf), 요청이 없으면 NaN, `le` 누적. Prometheus 문서와 소스로 확인하고, 아래 예시 숫자를 promtool로 재현한다.
2. **네이티브 히스토그램의 현재 상태**: 어느 버전부터 어떤 설정으로 쓰는지, 클래식과 질의가 어떻게 다른지. 단정하지 말고 버전을 밝힌다.
3. **OpenTelemetry 신호 정의**: 트레이스·span·trace context(W3C `traceparent`), 샘플링(head·tail), exemplar. 명세 원문으로 확인한다.
4. **카디널리티 진단 도구**: Prometheus TSDB 상태 페이지가 보여 주는 항목, `sample_limit`·`label_limit`을 넘었을 때의 동작, `metric_relabel_configs`의 `labeldrop`·`drop`. 문서로 확인하고 설정은 가능하면 promtool로 검사한다.
5. **기존 글과의 일관성**: percentiles·why-numbers-differ·counters-and-rate·slo-and-error-budget·time-series-and-labels가 히스토그램·카디널리티에 대해 이미 한 말과 같아야 한다.

---

### 글 작업 공통 사항

- 쓰기 전에 `docs/writing-guide.md`(특히 7장)를 읽고, 기존 글 1편과 그 검토 기록을 읽어 톤과 밀도를 맞춘다.
- 각 Task의 **필수 내용**은 담는다. 문장은 작성자가 다듬는다. 1차 자료(공식 문서·명세·소스 코드·원 논문·SRE 책)가 없는 사실은 더하지 않는다.
- 필수 내용과 1차 자료가 어긋나면 1차 자료를 따르고 보고서에 적는다(사실 검토가 계획 문구보다 우선).
- 참고 자료는 독자에게 보일 만한 것만 약 15개 이하로 둔다. 소스 코드 줄 번호 수준의 근거는 검토 기록에 남긴다.
- 서버를 띄웠다면 끝내기 전에 끈다.

---

### Task 1: 글 「히스토그램과 버킷」

**Files:** Create `src/content/docs/foundations/histograms.mdx`, `docs/reviews/foundations-histograms.md`

**머리말(초안):**

```yaml
title: 히스토그램과 버킷
summary: 히스토그램은 값을 구간별로 세고, p99는 그 구간 안에서 추정한 값이에요.
domain: foundations
type: concept
order: 130
icon: chart-column
keywords: [histogram, 히스토그램, bucket, 버킷, le, histogram_quantile, native histogram, 네이티브 히스토그램, 선형 보간]
sources:
  - title: Prometheus — Histograms and summaries
    url: https://prometheus.io/docs/practices/histograms/
  - title: Prometheus — Query functions (histogram_quantile)
    url: https://prometheus.io/docs/prometheus/latest/querying/functions/
updated: 2026-10-14
```

**대시보드 그림(초안):** 제목 "결제 API · 응답시간 히스토그램 · 5분". 요청 1,000건의 누적 버킷: `le="0.1"` 600, `le="0.25"` 900, `le="0.5"` 985, `le="1"` 995, `le="2.5"` 1,000, `le="+Inf"` 1,000. `StatTile` 두 개: "p99 추정값" "0.75"(초, note "0.5~1초 버킷 안을 고르게 나눠 추정"), "실제 p99가 있을 수 있는 범위" "0.5~1"(초). 캡션 1~2문장.

**숫자 근거(사전 계산, 사실 검토가 promtool로 재현):** 990번째 요청(1,000 × 0.99)은 0.5~1초 버킷(985~995번째)에 든다. 0.5 + (990 − 985) ÷ (995 − 985) × (1 − 0.5) = 0.75초.

**필수 내용:**

| 블록 | 제목/형태 | 담을 사실 |
| --- | --- | --- |
| Point 1 | 결론형(예: "히스토그램은 구간마다 개수를 세요") | Prometheus 클래식 히스토그램은 `_bucket{le="…"}`(그 값 이하 개수, 누적), `_sum`, `_count`를 낸다. `+Inf` 버킷은 `_count`와 같다. 버킷은 카운터라 rate로 본다(`<Term slug="foundations/counters-and-rate">`). |
| Point 2 | 결론형(예: "p99는 버킷 안에서 추정한 값이에요") | `histogram_quantile`은 해당 버킷 안을 고르게 나눠(선형 보간) 값을 추정한다. 그림의 0.75초는 0.5~1초 어디든 될 수 있다. 정확도는 버킷 경계가 정한다. |
| Point 3 | 결론형(예: "버킷 경계는 판단할 값에 맞춰요") | SLO 임계값(예: 300ms)이 있으면 그 값을 경계로 둔다(`<Term slug="foundations/slo-and-error-budget">`). 가장 큰 유한 경계를 넘는 값은 그 경계값으로만 보인다. 클라이언트 라이브러리 기본 버킷이 서비스 범위와 맞는지 본다. |
| Check | 3~4개 | ① rate 없이 누적 버킷에 `histogram_quantile`을 바로 쓴 질의. ② 서버별 p99를 평균 낸 질의(`<Term slug="foundations/percentiles">`). ③ p99가 늘 가장 큰 버킷 경계와 같다면. ④(선택) 서버마다 버킷 경계가 다르면. |
| Deeper | 섹션 2~3개 | 네이티브 히스토그램(지수 버킷, `le` 없는 질의, 버전과 설정은 원문으로), summary와의 차이(클라이언트에서 계산해 합칠 수 없음, percentiles 글과 겹치지 않게 짧게), OpenTelemetry의 explicit bucket·exponential histogram. |

**Term:** `foundations/counters-and-rate`, `foundations/percentiles`(필수), `foundations/slo-and-error-budget`(필수).

---

### Task 2: 가이드 「p99가 이상하게 나올 때」

**Files:** Create `src/content/docs/foundations/p99-looks-wrong.mdx`, `docs/reviews/foundations-p99-looks-wrong.md`

**머리말(초안):**

```yaml
title: p99가 이상하게 나올 때
summary: 버킷 경계, 질의 순서, 요청 수, 서버별 버킷을 차례로 확인해요.
domain: foundations
type: guide
order: 140
icon: timer
keywords: [p99, histogram_quantile, 백분위수 이상, NaN, +Inf, 버킷 경계, sum by le, percentile wrong]
sources:
  - title: Prometheus — Histograms and summaries
    url: https://prometheus.io/docs/practices/histograms/
  - title: Prometheus — Query functions (histogram_quantile)
    url: https://prometheus.io/docs/prometheus/latest/querying/functions/
updated: 2026-10-14
```

**필수 내용:**

| 블록 | 형태 | 담을 내용 |
| --- | --- | --- |
| Situation | 두 단락 | p99가 몇 시간째 정확히 2.5초에 붙어 있거나, 새벽에 크게 튀거나, 그래프가 비어 있다. 결론: 대부분 버킷·질의·요청 수 문제라 네 가지를 차례로 보면 된다. |
| FirstLook | Item 3개 | "값이 버킷 경계와 같은지", "질의가 rate → sum by (le) → histogram_quantile 순서인지", "그때 요청이 몇 건이었는지". |
| `## 1. 값이 버킷 경계에 붙어 있는지 보세요` | 단락 2~3개 | 가장 큰 유한 경계값에 붙어 있으면 실제 값은 그보다 크다(+Inf 버킷). 확인 방법: 버킷별 rate를 함께 그려 본다. `<Term slug="foundations/histograms">`. |
| `## 2. 질의 순서를 확인하세요` | 단락 2~3개 | rate를 먼저, 같은 `le`끼리 합치고, 마지막에 histogram_quantile. `by (le)`가 빠지거나 p99를 평균 내면 틀린다(`<Term slug="foundations/why-numbers-differ">`). 서비스(`job`)를 고른다. |
| `## 3. 요청 수를 같이 보세요` | 단락 2~3개 | 요청이 적으면 p99는 몇 건에 크게 흔들린다. 요청이 0이면 결과가 비거나 NaN이다(원문 확인, `<Term slug="foundations/no-data-vs-zero">`). 확인 방법: 같은 패널에 요청 수를 띄운다. |
| `## 4. 서버마다 버킷이 같은지 보세요` | 단락 2~3개 | 버킷 경계가 다른 서버를 합치면 경고 없이 틀린 값이 나올 수 있다(3묶음 slo 사실 검토 근거 참고, 원문으로 다시 확인). 확인 방법: `count by (le)`로 서버별 경계를 비교한다. |
| Checkpoints | Check 3개 | ① rate 없이 쓴 histogram_quantile ② `sum` 뒤 `by (le)` 누락 ③ 요청 수 없이 p99만 띄운 패널. |

본문 4,000자 이하, 단계마다 결론 먼저와 "확인 방법".

---

### Task 3: 글 「로그, 메트릭, 트레이스」

**Files:** Create `src/content/docs/foundations/logs-metrics-traces.mdx`, `docs/reviews/foundations-logs-metrics-traces.md`

**머리말(초안):**

```yaml
title: 로그, 메트릭, 트레이스
summary: 메트릭은 얼마나, 트레이스는 어디서, 로그는 왜를 알려 줘요.
domain: foundations
type: concept
order: 150
icon: layers
keywords: [logs, metrics, traces, 로그, 메트릭, 트레이스, span, 스팬, trace id, 샘플링, OpenTelemetry, observability, 관측 가능성]
sources:
  - title: OpenTelemetry — Signals
    url: https://opentelemetry.io/docs/concepts/signals/
  - title: W3C — Trace Context
    url: https://www.w3.org/TR/trace-context/
updated: 2026-10-14
```

**대시보드 그림(초안):** 제목 "같은 장애를 세 신호로 · 결제 API". `StatTile` 세 개: 메트릭 "에러율" "4.8"(%), 트레이스 "느린 구간" "2.1"(초, note "DB 조회 span"), 로그 "같은 시각 에러 로그" "312"(건, note "connection refused"). 숫자는 예시라 서로 모순만 없게 쓴다. 캡션 1~2문장.

**필수 내용:**

| 블록 | 제목/형태 | 담을 사실 |
| --- | --- | --- |
| Point 1 | 결론형(예: "메트릭은 얼마나를 싸게 알려 줘요") | 메트릭은 숫자를 시간별로 모은 것(`<Term slug="foundations/time-series-and-labels">`). 저장이 싸고 오래 두며 알림에 쓴다. 개별 요청은 알 수 없다. |
| Point 2 | 결론형(예: "트레이스는 요청 하나가 지난 길이에요") | 트레이스는 요청 하나가 여러 서비스를 지나며 남긴 span(구간)의 묶음이다. trace id로 이어진다(W3C `traceparent`). 보통 일부만 샘플링해 남긴다. |
| Point 3 | 결론형(예: "로그는 왜를 남기고, trace id로 이어 봐요") | 로그는 사건 하나의 기록이다. 자세하지만 양이 많아 비싸다. 로그에 trace id를 남기면 트레이스와 이어 볼 수 있다. 흐름: 메트릭으로 알아채고 → 트레이스로 위치를 찾고 → 로그로 이유를 본다. |
| Check | 3~4개 | ① 사용자 ID·요청 ID를 메트릭 레이블로 둔 코드. ② 로그를 매번 세어 대시보드를 그리는 경우(메트릭으로 옮길 대상). ③ 샘플링 비율이 낮으면 드문 에러의 트레이스가 없을 수 있다. ④ 로그에 trace id가 없으면 이어 볼 수 없다. |
| Deeper | 섹션 2~3개 | OpenTelemetry의 신호 구분(원문의 현재 목록대로), head 샘플링과 tail 샘플링, exemplar(메트릭 점에 trace id를 붙여 트레이스로 건너가기, Prometheus·OpenMetrics 지원은 원문으로). |

**Term:** `foundations/time-series-and-labels`(필수), `foundations/red-and-use`(쓸 곳이 있으면).

---

### Task 4: 가이드 「시계열이 갑자기 늘었을 때」

**Files:** Create `src/content/docs/foundations/cardinality-explosion.mdx`, `docs/reviews/foundations-cardinality-explosion.md`

**머리말(초안):**

```yaml
title: 시계열이 갑자기 늘었을 때
summary: 늘어난 지표와 레이블을 찾고, 계측 코드를 고친 뒤 수집 한도를 둬요.
domain: foundations
type: guide
order: 160
icon: hash
keywords: [cardinality explosion, 카디널리티 폭발, 시계열 폭증, high cardinality, TSDB status, sample_limit, relabel, labeldrop]
sources:
  - title: Prometheus — Instrumentation (Use labels)
    url: https://prometheus.io/docs/practices/instrumentation/
  - title: Prometheus — Configuration (scrape_config)
    url: https://prometheus.io/docs/prometheus/latest/configuration/configuration/
updated: 2026-10-14
```

**필수 내용:**

| 블록 | 형태 | 담을 내용 |
| --- | --- | --- |
| Situation | 두 단락 | 배포 뒤 Prometheus 메모리가 오르고 질의가 느려지거나 비용 경고가 온다. 대부분 값이 끝없이 늘어나는 레이블 하나 때문이다. 결론: 늘어난 지표와 레이블을 찾아 계측을 고친다. |
| FirstLook | Item 3개 | "어느 지표의 시계열이 늘었는지", "어떤 레이블의 값이 끝없이 늘었는지", "언제부터 늘었는지(배포 시점)". |
| `## 1. 시계열이 많은 지표를 찾으세요` | 단락 2~3개 | Prometheus TSDB 상태 페이지(보여 주는 항목은 원문 확인), 또는 지표별로 세는 질의. 전체를 세는 질의는 무거우니 주의. `<Term slug="foundations/time-series-and-labels">`. |
| `## 2. 값이 늘어나는 레이블을 찾으세요` | 단락 2~3개 | 레이블마다 값 개수를 센다. 흔한 원인: 요청 경로 원문(`/users/123`), 사용자·요청 ID, 에러 메시지 원문. 확인 방법: 질의 예시. |
| `## 3. 계측 코드를 고치세요` | 단락 2~3개 | 경로 틀(`/users/:id`)로 바꾸고, 사용자별 값은 로그·트레이스로 옮긴다(`<Term slug="foundations/logs-metrics-traces">`). 급하면 `metric_relabel_configs`로 레이블이나 지표를 버린다(동작과 한계는 원문으로). |
| `## 4. 수집 한도를 두세요` | 단락 2~3개 | `sample_limit`·`label_limit` 같은 수집 설정의 한도와 넘었을 때의 동작(원문 확인). 시계열 수 증가를 알림으로 본다(`prometheus_tsdb_head_series` 등, 원문 확인). OpenTelemetry SDK의 카디널리티 상한은 「시계열과 레이블」과 같은 말로. |
| Checkpoints | Check 3개 | ① 경로 원문·ID·메시지를 레이블로 둔 코드 ② relabel로 지우기만 하고 계측은 그대로 ③ 한도 없는 수집 설정. |

본문 4,000자 이하, 단계마다 결론 먼저와 "확인 방법".

---

### Task 5: 관련 글 링크 정리와 화면 점검

- [ ] 이번 묶음 4편끼리 `related`를 보강한다(각 5개 이하). 기존 글 percentiles·why-numbers-differ·counters-and-rate·time-series-and-labels에서 새 글로 가는 `related`가 자연스러우면 추가한다(머리말 `related` 줄만). 기존 글 본문에서 히스토그램을 짧게 설명한 곳에 `<Term slug="foundations/histograms">`를 걸 만하면 건다(문장은 바꾸지 않는다).
- [ ] `scripts/capture-screens.mjs`의 PAGES에 새 글 4편을 추가하고, 미리보기 시트 캡처에 `foundations/p99-looks-wrong/`를 더한다.
- [ ] `npm run build` 후 캡처해서 새 글 4편과 홈을 라이트·다크 × 데스크톱·모바일로 본다. 넘침, 위계, 숫자 타일 배치, 홈 카드 구성.
- [ ] `npm run check`, `npx vitest run`, `npm run test:e2e`를 통과시키고 커밋한다. 서버를 끈다.

공개(main 병합·푸시)는 컨트롤러가 한다.

---

## 부록 A: 사실 검토 프롬프트

```text
너는 한국어 모니터링 지식 사이트의 사실 검토자야. 문체는 평가하지 마. 사실만 본다.

검토할 글: <src/content/docs/foundations/글이름.mdx>
글의 머리말 sources와, 필요하면 네가 찾은 1차 자료(공식 문서, 명세, 소스 코드, 원 논문, SRE 책)를 근거로 써. WebFetch로 원문을 직접 확인해. 기억에 의존하지 마. PromQL·설정 동작은 컨트롤러가 받아 둔 promtool(경로는 진행 방식 참고)로, 숫자는 node로 직접 확인해(띄운 서버는 끝내기 전에 꺼).
이 글은 같은 폴더의 다른 글들과 링크로 이어져 있어. 그 글들과 어긋나는 설명이 있으면 지적해(다른 글 자체는 다시 검토하지 마).

할 일:
1. 글의 모든 사실 주장, 숫자, 식, 예시 계산, 설정 예시를 하나씩 뽑아.
2. 예시 계산과 설정은 직접 다시 계산·실행해.
3. 각 주장에 판정: 맞음 / 틀림 / 오해 소지 / 확인 불가. "오해 소지"는 사실은 맞지만 개발자가 잘못 판단하게 만들 만큼 단순화된 경우야.
4. 틀림·오해 소지·확인 불가에는 해요체 수정 문장을 제안해. 한 문장 80자 이하, 면책 문장 없이. 같은 주장이 본문·확인·캡션 여러 곳에 있으면 모든 위치를 적어.
5. 아래 형식으로 <docs/reviews/foundations-글이름.md>에 저장해. 결과 요약도 돌려줘.

# 사실 검토: <제목>

- 글: <경로>
- 검토일: <YYYY-MM-DD>
- 결과: 수정 필요 N건 / 확인 N건

| 주장(인용) | 판정 | 근거(URL과 짧은 인용) | 수정 제안 |
| --- | --- | --- | --- |

## 반영

(수정자가 채운다)

규칙: 글 파일과 다른 파일은 고치지 마. 검토 파일만 만들어. 커밋·푸시하지 마. 빌드·e2e를 돌리지 마. 하위 에이전트를 띄우지 마.
```
