# 공통 기초 2묶음 실행 계획: 데이터가 어떻게 모이고, 왜 비어 보이는가

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task.

**Goal:** 공통 기초 영역에 글 4편(개념 3, 가이드 1)을 더하고, 작은 정리(CI 실행 환경 고정, 읽기 순서 재번호)를 마친 뒤 공개한다.

**Architecture:** 1단계에서 만든 사이트를 그대로 쓴다. 코드 변경은 Task 1의 정리뿐이다. 글은 `src/content/docs/foundations/*.mdx`에 쓰고, 기존 틀 블록·차트 컴포넌트만 쓴다(새 데모 없음).

**Spec:** `docs/superpowers/specs/2026-10-13-domaindocs-site-design.md` (특히 5장 틀, 6장 글쓰기 규칙, 7장 검사, 10장 정확성)

**Selection (사용자 위임):** 사용자가 "후보도 알아서 골라서 진행"하라고 위임함. 대시보드를 만드는 프론트엔드 개발자가 가장 자주 마주치는 "그래프가 비거나 이상하게 보이는" 원인을 한 묶음으로 엮었다. SLO·알림·RED/USE는 다음 묶음으로 미룬다.

## Global Constraints

- 글쓰기 규칙은 `docs/writing-guide.md`가 기준이다. 해요체(요/죠로 끝남), 문장 80자 이하, 단락 3문장 이하, 결론 먼저, 본문에 면책 문장 없음, 새 용어는 처음 나올 때 풀어 쓰거나 `<Term>`으로 링크한다.
- `npm run lint:content`가 위반 0건이어야 한다. 검사기 규칙은 바꾸지 않는다.
- 틀: 개념 글은 OnDashboard → KeyPoints(1~3) → Checkpoints → (Deeper). 가이드는 Situation → FirstLook(1~3) → `##` 단계 → Checkpoints.
- 쓸 수 있는 컴포넌트는 OnDashboard, KeyPoints, Point, Checkpoints, Check, Deeper, Situation, FirstLook, Item, Term, MiniLineChart, StatTile이다. 이번 묶음은 새 데모를 만들지 않는다.
- `<Term slug>`와 `related`는 이미 있는 글만 가리킨다. 기존 글: `foundations/percentiles`, `foundations/counters-and-rate`, `foundations/aggregation-and-downsampling`, `foundations/why-numbers-differ`. 이 묶음의 글은 앞선 Task에서 만든 글만 가리킬 수 있다.
- 아이콘은 `src/data/icons.ts`의 이름만 쓴다: sigma, activity, database, server, chart-line, chart-column, gauge, timer, layers, hash, clock, trending-up.
- `updated`는 작업한 날짜(YYYY-MM-DD)로 쓴다.
- 1단계 검토에서 배운 것(반드시 지킨다):
  1. `<Check>`가 같은 글의 `<Deeper>` 예시와 모순되면 안 된다.
  2. 조건은 정확하게 쓴다. 예: "지표 이름만 쓴 질의"(X) → "`[5m]` 같은 구간 없이 쓴 질의"(O).
  3. "대부분", "늘", "절대" 같은 단정은 근거가 있을 때만 쓴다.
  4. 도구마다 다른 동작은 도구와 설정을 밝힌다(Prometheus 기본값, Grafana 설정 등). 숫자 예시의 전제(수집 주기, 패널 폭 등)를 밝힌다.
  5. `<Point>` 제목은 메커니즘이 아니라 결론(takeaway)으로 쓴다. 미리보기 시트에 그대로 나온다.
  6. 핵심 하나는 5문장 안팎, 두 단락 이하로 쓰고 나머지는 Deeper로 보낸다.
  7. 캡션은 1~2문장이다.
  8. 숫자 예시는 직접 다시 계산해 보고 쓴다.
- 커밋 메시지는 `docs: …` / `ci: …` 형식, 한국어 설명, 마지막 줄은 각자 하네스가 지정한 Co-Authored-By.

## Review Focus

1. **프론트엔드 코드의 빈 값 처리**: `?? 0`, `|| 0`, `Number(x) || 0`이 "데이터 없음"을 0으로 바꾸는 문제. Task 4·5의 Check에 반드시 들어간다.
2. **PromQL 빈 결과의 의미**: 계열이 없을 때 `sum()`, 나눗셈, `rate()`가 0이 아니라 빈 결과를 낸다는 점. 사실 검토에서 실제 동작을 확인한다.
3. **수집 주기 기본값**: Prometheus 전역 기본 scrape_interval, OpenTelemetry 주기적 내보내기 기본 간격 같은 숫자는 공식 문서·소스로 확인한다.
4. **카디널리티 숫자**: 곱셈 예시(5 × 10 × 200 = 10,000, × 50 = 500,000)와 "레이블은 적게"라는 권고의 출처.
5. **글 간 일관성**: 새 글이 「카운터와 rate」, 「집계 구간과 다운샘플링」, 「같은 지표가 화면마다 다르게 보이는 이유」와 어긋나지 않는다.

---

### Task 1: 정리 — CI 실행 환경 고정, 읽기 순서 재번호

**Files:**
- Modify: `.github/workflows/site.yml`, `src/content/docs/foundations/{percentiles,counters-and-rate,aggregation-and-downsampling,why-numbers-differ}.mdx`(각 `order:` 한 줄만)

- [ ] **Step 1: CI 실행 환경 고정.** `.github/workflows/site.yml`의 두 job(`verify`, `deploy`)에서 `runs-on: ubuntu-latest`를 `runs-on: ubuntu-24.04`로 바꾼다. GitHub이 2026-10-19부터 `ubuntu-latest`를 Ubuntu 26으로 옮기면서 Playwright 의존성 설치가 깨질 위험을 피하기 위해서다.
- [ ] **Step 2: 읽기 순서 재번호.** 새 글이 사이에 들어갈 자리를 만들기 위해 10 단위로 바꾼다. percentiles `order: 10`, counters-and-rate `order: 20`, aggregation-and-downsampling `order: 50`, why-numbers-differ `order: 70`. (이 묶음의 새 글은 time-series-and-labels 30, collection-interval 40, no-data-vs-zero 60, empty-graph 80을 쓴다. 홈의 "처음이라면 여기부터"는 order 순 앞 5편이다.)
- [ ] **Step 3: 확인.** `npm run lint:content`(4편, 위반 0건), `npm run check`(0 errors), `node -e "require('yaml').parse(require('fs').readFileSync('.github/workflows/site.yml','utf8'))"`(파싱 성공).
- [ ] **Step 4: 커밋.** `ci: 실행 환경을 ubuntu-24.04로 고정하고 글 읽기 순서를 10 단위로 재번호`

---

### 글 작업(Task 2~5) 공통 사항

이 네 작업의 결과물은 글이다. 완료 조건은 **글 검사 통과 + 별도 에이전트의 사실 검토 + 빌드·화면 테스트 통과**다.

- 쓰기 전에 `docs/writing-guide.md`를 끝까지 읽고, 기존 글 4편 중 최소 1편과 그 검토 기록(`docs/reviews/`)을 읽어 톤과 밀도를 맞춘다.
- 각 Task의 **필수 내용**은 담는다. 문장은 작성자가 다듬는다. 필수 내용에 없는 사실을 더하려면 1차 자료(공식 문서·명세·소스 코드)가 있어야 한다.
- 필수 내용과 1차 자료가 어긋나면 1차 자료를 따르고, 보고서에 무엇을 왜 바꿨는지 적는다(1단계 규칙 R13: 사실 검토 결과가 계획 문구보다 우선).
- `sources`에는 본문 주장을 뒷받침하는 출처를 더해도 된다(R9).
- 진행: ① 작성자가 초안을 쓰고 검사 통과(커밋하지 않음) → ② 컨트롤러가 다른 에이전트에게 사실 검토를 맡김(부록 A) → ③ 작성자가 반영하고 빌드·화면 테스트 후 커밋 → ④ 글 검토.
- 서버를 띄웠다면 끝내기 전에 끈다.

---

### Task 2: 글 「시계열과 레이블」

**Files:** Create `src/content/docs/foundations/time-series-and-labels.mdx`, `docs/reviews/foundations-time-series-and-labels.md`

**머리말(초안, 다듬어도 됨):**

```yaml
title: 시계열과 레이블
summary: 레이블 값 조합 하나가 시계열 하나예요. 조합이 늘면 비용이 곱으로 늘어요.
domain: foundations
type: concept
order: 30
icon: chart-line
keywords: [time series, 시계열, label, 레이블, cardinality, 카디널리티, 태그, attribute, 차원]
sources:
  - title: Prometheus — Data model
    url: https://prometheus.io/docs/concepts/data_model/
  - title: Prometheus — Metric and label naming
    url: https://prometheus.io/docs/practices/naming/
  - title: Prometheus — Instrumentation (Use labels / Do not overuse labels)
    url: https://prometheus.io/docs/practices/instrumentation/
updated: 2026-10-13
```

**대시보드 그림(초안):** 제목 "활성 시계열 수 · 배포 전후". `MiniLineChart` 한 줄: 값 `[10, 10, 10, 10, 10, 10, 60, 110, 160, 210]`(단위 천 개, 범례 값 "21만 개"), tone warn. `StatTile` 두 개: "배포 전" "10,000"(단위 "개"), "배포 2시간 뒤" "210,000"(단위 "개", tone warn). 캡션: 레이블에 사용자 ID를 넣은 배포 뒤로 시계열이 사용자 수만큼 계속 늘어난다는 한 문장. 숫자는 예시이며, 캡션이 특정 제품의 실제 수치처럼 읽히지 않게 쓴다.

**필수 내용:**

| 블록 | 제목/형태 | 담을 사실 |
| --- | --- | --- |
| Point 1 | 결론형 제목(예: "레이블 조합 하나가 시계열 하나예요") | 시계열은 지표 이름과 레이블(키=값) 조합으로 구별되는, 시각별 값의 줄이다. `http_requests_total{method="GET", status="200"}`와 `{method="POST", status="200"}`은 서로 다른 시계열이다. |
| Point 2 | 결론형 제목(예: "시계열 수는 레이블 값 수의 곱이에요") | 카디널리티는 시계열 개수다. method 5 × status 10 × route 200 = 서버 한 대에 10,000개, 서버 50대면 500,000개. 레이블 하나를 더하면 그 값 개수만큼 곱해진다. |
| Point 3 | 결론형 제목(예: "끝없이 늘어나는 값은 레이블에 넣지 마세요") | 사용자 ID, 요청 ID, 이메일, 원본 URL처럼 값이 끝없이 늘 수 있는 것을 레이블로 쓰면 시계열이 폭발한다(Prometheus 문서 권고). 이런 값은 로그나 트레이스로 보낸다. |
| Check | 3~4개 | ① 레이블에 사용자·요청 ID, 타임스탬프, 원본 URL이 들어간다면 다시 확인한다. ② 경로 템플릿(`/users/:id`) 대신 실제 경로(`/users/123`)를 레이블로 쓰면 같은 문제가 생긴다. ③ 레이블 값이 몇 개까지 늘 수 있는지 상한을 답할 수 없다면 다시 확인한다. ④(선택) 대시보드에서 레이블로 나눠 그릴 때 선 개수가 수백 개 넘게 늘면 읽을 수 없는 그래프가 된다. |
| Deeper | 짧은 섹션 2~3개 | 시계열 하나가 저장·메모리 비용을 만든다(구체적 바이트 수는 1차 자료가 있을 때만), Prometheus 계측 문서의 레이블 수 권고, OpenTelemetry에서는 속성(attribute)이 레이블에 해당하고 SDK에 카디널리티 상한이 있다(기본값은 사양·소스로 확인), 수집 단계에서 레이블을 버리거나 바꾸는 방법(relabeling)이 있다. |

**Term:** 쓸 곳이 있으면 `foundations/counters-and-rate`(예: `http_requests_total`은 카운터).

---

### Task 3: 글 「수집 방식과 수집 주기」

**Files:** Create `src/content/docs/foundations/collection-interval.mdx`, `docs/reviews/foundations-collection-interval.md`

**머리말(초안):**

```yaml
title: 수집 방식과 수집 주기
summary: 게이지는 수집 순간만 남고, 카운터는 사이에 일어난 일도 쌓여요.
domain: foundations
type: concept
order: 40
icon: timer
keywords: [scrape, scrape interval, 수집 주기, pull, push, 푸시, Pushgateway, OTLP, export interval, staleness]
sources:
  - title: Prometheus — Configuration (scrape_interval)
    url: https://prometheus.io/docs/prometheus/latest/configuration/configuration/
  - title: Prometheus — When to use the Pushgateway
    url: https://prometheus.io/docs/practices/pushing/
  - title: Prometheus — Querying basics (staleness)
    url: https://prometheus.io/docs/prometheus/latest/querying/basics/
  - title: OpenTelemetry — Metrics SDK (Periodic exporting MetricReader)
    url: https://opentelemetry.io/docs/specs/otel/metrics/sdk/
updated: 2026-10-13
```

**대시보드 그림(초안):** 제목 "CPU 사용률 · 15초마다 수집". `MiniLineChart` 두 개, `yMax={100}`. ① "게이지(수집 순간 값)" `[40, 40, 40, 40, 40, 40, 40, 40, 40, 40]`, 범례 "최고 40%". ② "카운터로 구한 1분 rate" `[40, 40, 40, 40, 43, 40, 40, 40, 40, 40]`, 범례 "최고 43%". 캡션: 3초짜리 100% 스파이크가 수집 사이에 끝나서 게이지에는 안 남고, 카운터의 rate에는 평균으로 조금 남는다는 1~2문장.

**숫자 근거(사전 계산):** 1분(60초) 중 57초는 40%, 3초는 100%면 평균은 (57×0.4 + 3×1.0) ÷ 60 = 25.8 ÷ 60 = 0.43, 곧 43%다. CPU 카운터(예: `node_cpu_seconds_total`)의 1분 rate는 그 1분의 평균 사용률이다.

**필수 내용:**

| 블록 | 제목/형태 | 담을 사실 |
| --- | --- | --- |
| Point 1 | 결론형(예: "게이지는 수집하는 순간의 값만 남아요") | 게이지는 수집 시각의 값을 찍는다. 15초마다 수집하면 그 사이 3초짜리 스파이크는 기록되지 않을 수 있다. |
| Point 2 | 결론형(예: "카운터는 수집 사이에 일어난 일도 쌓아 둬요") | 카운터는 사이 사건도 누적하므로 사라지지 않는다. 다만 rate로 보면 구간 평균이라 43%처럼 낮게 보인다(위 숫자). |
| Point 3 | 결론형(예: "수집 주기가 그래프와 알림의 해상도 하한이에요") | 수집 주기보다 짧은 일은 해상도 밖이다. rate 구간과 알림 조건은 수집 주기보다 충분히 길어야 한다(「카운터와 rate」와 일치하게). |
| Check | 3~4개 | ① 15초 주기 게이지로 몇 초짜리 스파이크 알림을 만들었다면 다시 확인한다. ② 수집 주기를 바꾸고 rate 구간·알림 조건을 그대로 뒀다면 다시 확인한다. ③ 수집 주기의 2배보다 짧은 rate 구간은 빈 결과가 나올 수 있다(근거 확인 후 정확한 조건으로). ④(선택) push 방식에서 마지막 값을 계속 그려 수집 끊김을 숨기는 화면. |
| Deeper | 섹션 2~3개 | pull(Prometheus가 대상에 가서 가져옴)과 push(애플리케이션이 보냄)의 차이와 `up` 지표, Pushgateway는 배치 작업처럼 짧게 사는 작업용이라는 공식 권고, Prometheus 전역 기본 scrape_interval과 OpenTelemetry 주기적 내보내기 기본 간격(둘 다 1차 자료로 확인), staleness(대상이 사라지면 계열이 끊기는 규칙). |

**Term:** `foundations/counters-and-rate`(필수), `foundations/aggregation-and-downsampling`(쓸 곳이 있으면), `foundations/time-series-and-labels`(쓸 곳이 있으면).

---

### Task 4: 글 「데이터 없음과 0」

**Files:** Create `src/content/docs/foundations/no-data-vs-zero.mdx`, `docs/reviews/foundations-no-data-vs-zero.md`

**머리말(초안):**

```yaml
title: 데이터 없음과 0은 달라요
summary: 0은 일어나지 않았다는 뜻이고, 데이터 없음은 모른다는 뜻이에요.
domain: foundations
type: concept
order: 60
icon: gauge
keywords: [no data, 데이터 없음, null, NaN, 결측, missing, absent, 빈 값, 0으로 채우기]
sources:
  - title: Prometheus — Instrumentation (Avoid missing metrics)
    url: https://prometheus.io/docs/practices/instrumentation/
  - title: Prometheus — Query functions (absent)
    url: https://prometheus.io/docs/prometheus/latest/querying/functions/
  - title: Prometheus — Operators (vector matching)
    url: https://prometheus.io/docs/prometheus/latest/querying/operators/
updated: 2026-10-13
```

**대시보드 그림(초안):** 제목 "에러율 · 수집이 멈춘 10분". `StatTile` 두 개: "빈 값을 0으로 바꾼 화면" "0"(단위 "%"), "질의 결과 그대로" "데이터 없음"(tone warn). 캡션: 같은 시간에 한 화면은 0%, 다른 화면은 데이터 없음을 보여 준다는 1문장.

**필수 내용:**

| 블록 | 제목/형태 | 담을 사실 |
| --- | --- | --- |
| Point 1 | 결론형(예: "0은 '없었다', 데이터 없음은 '모른다'예요") | 0은 측정했고 값이 0이었다는 사실이다. 데이터 없음은 측정값이 없다는 사실이다(수집 장애, 대상 중단, 아직 한 번도 생기지 않은 계열 등). |
| Point 2 | 결론형(예: "한 번도 생기지 않은 계열은 0이 아니라 없어요") | 에러가 한 번도 안 난 레이블 조합은 계열이 아예 없어서, 에러율 질의가 0이 아니라 빈 결과를 낼 수 있다. Prometheus 계측 문서는 미리 0으로 초기화하라고 권한다(정확한 문구 확인). |
| Point 3 | 결론형(예: "빈 값을 0으로 채우면 장애가 정상처럼 보여요") | 화면에서 빈 값을 0으로 바꾸면 수집이 멈춘 장애가 "에러 0%"로 보인다. 그래프는 끊긴 선이나 "데이터 없음"으로 그대로 보여 주는 편이 판단에 안전하다. |
| Check | 3~4개 | ① 프론트엔드 코드가 `?? 0`, `|| 0`으로 빈 응답을 0으로 바꾼다면 다시 확인한다(대상 독자에게 가장 중요). ② 에러율 = 에러 ÷ 전체에서 요청이 0이면 0 ÷ 0이 되는 경우를 어떻게 보여 주는지. ③ 알림이 "데이터 없음"을 정상으로 처리한다면 다시 확인한다. ④(선택) 계열이 사라진 것을 알리는 장치(예: `absent()`)가 없는 핵심 지표. |
| Deeper | 섹션 2~3개 | PromQL에서 빈 결과가 생기는 경우(계열 없음, 이항 연산에서 짝이 없을 때, 빈 벡터의 `sum`), `or vector(0)` 같은 0 채우기 패턴과 그 위험(계열이 없는 이유를 지움), 0 ÷ 0의 결과(NaN), Grafana의 빈 값 표시 옵션과 알림의 No Data 상태 처리(설정 이름은 Grafana 문서로 확인). |

**Term:** `foundations/counters-and-rate`, `foundations/time-series-and-labels`, `foundations/collection-interval` 중 쓸 곳이 있는 것.

---

### Task 5: 가이드 「그래프가 비어 있을 때 무엇부터 볼까」

**Files:** Create `src/content/docs/foundations/empty-graph.mdx`, `docs/reviews/foundations-empty-graph.md`

**머리말(초안):**

```yaml
title: 그래프가 비어 있을 때 무엇부터 볼까
summary: 시간 범위, 질의, 수집 상태, 실제로 일이 없었는지 순서로 확인해요.
domain: foundations
type: guide
order: 80
icon: activity
keywords: [No data, 데이터 없음, 빈 그래프, 끊긴 그래프, empty panel, 수집 장애, 그래프 안 나옴]
sources:
  - title: Prometheus — Querying basics
    url: https://prometheus.io/docs/prometheus/latest/querying/basics/
updated: 2026-10-13
```

**필수 내용:**

| 블록 | 형태 | 담을 내용 |
| --- | --- | --- |
| Situation | 두 단락 | 대시보드 패널에 "No data"가 뜨거나 선이 중간에 끊겼다. 장애일까, 수집 문제일까, 질의 문제일까? 원인은 대개 네 갈래로 나뉜다는 점을 결론으로. |
| FirstLook | Item 3개 | "시간 범위와 시간대", "질의가 가리키는 계열이 있는지", "수집이 살아 있는지". |
| `## 1. 시간 범위와 시간대를 확인하세요` | 단락 2~3개 | 화면의 기간·시간대·패널별 상대 시간 설정이 맞는지. 「같은 지표가 화면마다 다르게 보이는 이유」와 겹치는 내용은 `<Term slug="foundations/why-numbers-differ">`로 넘긴다. |
| `## 2. 질의가 존재하는 계열을 가리키는지 보세요` | 단락 2~3개 | 레이블 이름·값 오타, 배포로 바뀐 레이블 값, 카디널리티 제한으로 버려진 계열. `<Term slug="foundations/time-series-and-labels">`. 확인 방법: 레이블 조건을 하나씩 빼며 결과가 생기는지. |
| `## 3. 수집이 살아 있는지 보세요` | 단락 2~3개 | 대상이 내려가거나 수집이 실패하면 계열이 끊긴다(`up` 같은 수집 상태 지표). 수집 주기보다 짧은 rate 구간도 빈 결과를 낸다. `<Term slug="foundations/collection-interval">`, `<Term slug="foundations/counters-and-rate">`. |
| `## 4. 정말 일이 없었는지 보세요` | 단락 2~3개 | 한 번도 생기지 않은 계열, 0과 데이터 없음의 차이. `<Term slug="foundations/no-data-vs-zero">`. |
| Checkpoints | Check 3개 | ① 빈 결과를 0으로 바꿔 그리는 화면 코드 ② "데이터 없음"을 정상으로 처리하는 알림 ③ 수집 상태를 보여 주는 패널이 없는 대시보드. |

본문은 4,000자 이하, 훑어 읽기 쉽게. 개념 글이 다룬 내용은 다시 가르치지 말고 링크한다.

---

### Task 6: 화면 점검

**Files:** 필요한 경우에만 스타일 수정. 글 본문은 바꾸지 않는다(문제는 보고).

- [ ] `npm run build` 후 `node scripts/serve-dist.mjs 4330`을 띄우고 `node scripts/capture-screens.mjs`를 실행한다. 캡처 스크립트의 PAGES 목록에 새 글 4편을 추가하고(`['time-series', 'foundations/time-series-and-labels/']` 등), 시트 캡처는 가이드 `foundations/empty-graph/`도 쓰게 바꾼다.
- [ ] 새 글 4편과 홈·영역 페이지를 라이트·다크 × 데스크톱·모바일로 본다. 확인: 넘침, 위계, 대시보드 그림의 숫자 타일 배치, "처음이라면 여기부터"와 "최근 추가된 글" 구성, 미리보기 시트.
- [ ] 고친 것이 있으면 `npm run check`, `npx vitest run`, `npm run test:e2e`를 통과시키고 커밋한다. 서버를 끈다.

공개(main 병합·푸시)는 컨트롤러가 한다. 1단계에서 정한 진행 방식("묶음이 끝나면 화면 점검 후 main에 푸시")에 따른다.

---

## 부록 A: 사실 검토 프롬프트

```text
너는 한국어 모니터링 지식 사이트의 사실 검토자야. 문체는 평가하지 마. 사실만 본다.

검토할 글: <src/content/docs/foundations/글이름.mdx>
글의 머리말 sources와, 필요하면 네가 찾은 1차 자료(공식 문서, 명세, 소스 코드)를 근거로 써. WebFetch로 원문을 직접 확인해. 기억에 의존하지 마.
이 글은 같은 폴더의 다른 글들과 링크로 이어져 있어. 그 글들과 어긋나는 설명이 있으면 지적해(다른 글 자체는 다시 검토하지 마).

할 일:
1. 글의 모든 사실 주장, 숫자, 식, 예시 계산, 코드 예시를 하나씩 뽑아.
2. 예시 계산은 직접 다시 계산해. node를 써도 돼.
3. 각 주장에 판정: 맞음 / 틀림 / 오해 소지 / 확인 불가. "오해 소지"는 사실은 맞지만 개발자가 잘못 판단하게 만들 만큼 단순화된 경우야.
4. 틀림·오해 소지·확인 불가에는 해요체 수정 문장을 제안해. 한 문장 80자 이하, 면책 문장 없이.
5. 아래 형식으로 <docs/reviews/foundations-글이름.md>에 저장해. 결과 요약도 돌려줘.

# 사실 검토: <제목>

- 글: <경로>
- 검토일: <YYYY-MM-DD>
- 결과: 수정 필요 N건 / 확인 N건

| 주장(인용) | 판정 | 근거(URL과 짧은 인용) | 수정 제안 |
| --- | --- | --- | --- |

## 반영

(작성자가 채운다)

규칙: 글 파일과 다른 파일은 고치지 마. 검토 파일만 만들어. 커밋·푸시하지 마. 서버를 띄우지 마. 하위 에이전트를 띄우지 마.
```
