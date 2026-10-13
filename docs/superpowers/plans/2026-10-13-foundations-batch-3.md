# 공통 기초 3묶음 실행 계획: 무엇을 보고, 언제 깨울까

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. This batch runs article tasks **overlapped** (see "진행 방식").

**Goal:** 공통 기초 영역에 글 4편(개념 3, 가이드 1)을 더하고, 묶음 끝에 관련 글 링크를 정리한 뒤 공개한다.

**Architecture:** 1·2묶음과 같다. 코드 변경 없음(필요하면 화면 점검에서 작은 스타일 수정만). 글은 `src/content/docs/foundations/*.mdx`, 기존 컴포넌트만 쓴다.

**Spec:** `docs/superpowers/specs/2026-10-13-domaindocs-site-design.md`

**Selection (사용자 위임):** 2묶음 보고 때 예고한 후보(SLI·SLO·에러 버짓, 알림 조건, RED·USE, 가이드 「알림이 너무 많이 울릴 때」)로 진행한다. 사용자가 "다음 작업도 이어서 부탁할게"라고 위임함.

## Global Constraints

- 글쓰기 규칙은 `docs/writing-guide.md`가 기준이다. 특히 7장 "검토에서 반복된 지적"과 소프트 상한(더 깊이 약 2,000자, 참고 자료 약 15개, 요약은 한 문장)을 지킨다.
- `npm run lint:content`가 위반 0건이어야 한다. 검사기 규칙은 바꾸지 않는다.
- 틀: 개념 글은 OnDashboard → KeyPoints(1~3) → Checkpoints → (Deeper). 가이드는 Situation → FirstLook(1~3) → `##` 단계 → Checkpoints.
- 컴포넌트는 OnDashboard, KeyPoints, Point, Checkpoints, Check, Deeper, Situation, FirstLook, Item, Term, MiniLineChart, StatTile만 쓴다. 새 데모 없음.
- `<Term slug>`와 `related`는 작업 폴더에 파일이 있는 글만 가리킨다. 기존 글 8편: `foundations/percentiles`, `counters-and-rate`, `time-series-and-labels`, `collection-interval`, `aggregation-and-downsampling`, `no-data-vs-zero`, `why-numbers-differ`, `empty-graph`.
- 아이콘: sigma, activity, database, server, chart-line, chart-column, gauge, timer, layers, hash, clock, trending-up 중에서.
- `updated`는 작업한 날짜로 쓴다. 용어는 "레이블", "시계열", "샘플"로 통일한다.
- 커밋 메시지는 `docs: …` 형식, 마지막 줄은 각자 하네스가 지정한 Co-Authored-By.

## 진행 방식 (겹쳐 진행)

컨트롤러는 글 작업을 단계별로 겹쳐 돌린다. 예: 글 1을 사실 검토하는 동안 글 2 초안을 쓴다.

- **읽기 전용 단계는 동시에 돌려도 된다:** 초안 작성(자기 글 파일 하나만 만들고 `npm run lint:content`만 실행), 사실 검토(검토 파일만 만듦), 글 검토(읽기만).
- **빌드·테스트·커밋 단계는 한 번에 하나만:** 반영(Phase B), 수정 라운드, 화면 점검. `npm run build`와 `npm run test:e2e`가 `dist/`와 포트 4329를 함께 쓰고, 커밋이 같은 git 인덱스를 쓰기 때문이다.
- 초안 단계에서 `npm run lint:content`가 **다른 사람의 초안 파일** 때문에 위반을 보이면 무시한다. 자기 파일의 위반만 0건이면 된다.
- 커밋할 때는 `git add`에 **자기 파일 경로만** 적는다(`git add -A` 금지).
- 뒤 글이 앞 글을 `<Term>`으로 가리키는 것은 앞 글 초안 파일이 작업 폴더에 있으면 된다(검사기는 파일 존재로 판단). 앞 글이 커밋되기 전에 뒤 글을 커밋해야 하면, 링크 대상이 커밋에 함께 들어가지 않으므로 컨트롤러가 순서를 맞춘다.

## Review Focus

1. **에러 버짓 숫자**: 30일 × (1 − 0.999) = 43.2분, 99.99%는 4.32분, 99%는 7.2시간. burn rate 같은 SRE 워크북 숫자는 원문으로 확인한다.
2. **알림 `for`의 실제 동작**: pending → firing 전환, 평가 주기(`evaluation_interval`)와의 관계, Grafana의 pending period. 아래 예시 숫자와 맞는지.
3. **RED·USE·골든 시그널의 출처와 정의**: 제안자와 원문 정의를 확인한다(RED: Tom Wilkie, USE: Brendan Gregg, 네 가지 골든 시그널: Google SRE Book).
4. **기존 글과의 일관성**: rate 구간, 수집 주기, 데이터 없음 처리, 백분위수 집계 규칙이 기존 글과 같은 말을 해야 한다.
5. **판단 가치**: 확인 문장이 AI·동료가 만든 알림 규칙과 대시보드를 검토할 때 바로 쓸 수 있어야 한다.

---

### 글 작업 공통 사항

- 쓰기 전에 `docs/writing-guide.md`(특히 7장)를 읽고, 기존 글 1편과 그 검토 기록을 읽어 톤과 밀도를 맞춘다.
- 각 Task의 **필수 내용**은 담는다. 문장은 작성자가 다듬는다. 1차 자료(공식 문서·명세·원 논문·SRE 책)가 없는 사실은 더하지 않는다.
- 필수 내용과 1차 자료가 어긋나면 1차 자료를 따르고 보고서에 적는다(사실 검토가 계획 문구보다 우선).
- 참고 자료는 독자에게 보일 만한 것만 약 15개 이하로 둔다. 소스 코드 줄 번호 수준의 근거는 검토 기록(`docs/reviews/`)에 남긴다.
- 진행: ① 초안(커밋 없음, lint만) → ② 다른 에이전트의 사실 검토(부록 A) → ③ 반영·빌드·화면 테스트·커밋(한 번에 하나) → ④ 글 검토 → (필요하면 수정 라운드).
- 서버를 띄웠다면 끝내기 전에 끈다.

---

### Task 1: 글 「SLI·SLO·에러 버짓」

**Files:** Create `src/content/docs/foundations/slo-and-error-budget.mdx`, `docs/reviews/foundations-slo-and-error-budget.md`

**머리말(초안):**

```yaml
title: SLI·SLO·에러 버짓
summary: SLO는 실패를 얼마나 허용할지 정한 약속이고, 남은 실패 여유가 에러 버짓이에요.
domain: foundations
type: concept
order: 90
icon: gauge
keywords: [SLI, SLO, SLA, error budget, 에러 버짓, 오류 예산, burn rate, 소진율, 가용성]
sources:
  - title: Google SRE Book — Service Level Objectives
    url: https://sre.google/sre-book/service-level-objectives/
  - title: Google SRE Workbook — Implementing SLOs
    url: https://sre.google/workbook/implementing-slos/
  - title: Google SRE Workbook — Alerting on SLOs
    url: https://sre.google/workbook/alerting-on-slos/
updated: 2026-10-13
```

**대시보드 그림(초안):** 제목 "결제 API · SLO 99.9% · 30일". `StatTile` 세 개: "이번 30일 성공률" "99.95"(%), "남은 에러 버짓" "50"(%), "허용 실패 시간" "43.2"(분). `MiniLineChart` 하나: "남은 에러 버짓(%)" `[100, 96, 91, 88, 85, 70, 66, 62, 58, 55, 52, 50]`, `yMax={100}`. 숫자는 서로 맞게 쓴다(성공률 99.95%면 허용 실패 0.1% 중 절반을 쓴 것 → 남은 버짓 50%). 캡션 1~2문장.

**숫자 근거(사전 계산):** 30일 = 43,200분. 99.9% → 0.1% = 43.2분. 99.99% → 4.32분. 99% → 432분 = 7.2시간. 요청 기준이면 100만 건 중 1,000건 실패까지 허용(99.9%).

**필수 내용:**

| 블록 | 제목/형태 | 담을 사실 |
| --- | --- | --- |
| Point 1 | 결론형(예: "SLI는 좋은 경험의 비율이에요") | SLI는 사용자 경험을 "좋은 이벤트 ÷ 전체 이벤트" 비율로 잰 지표다. 예: 300ms 안에 성공한 요청의 비율. 서버 CPU 같은 내부 지표는 SLI가 아니다. |
| Point 2 | 결론형(예: "SLO는 목표와 기간을 함께 정해요") | SLO는 SLI의 목표와 측정 기간이다(예: 30일 동안 99.9%). 기간이 없으면 목표를 판정할 수 없다. SLA는 계약상 약속(보상 포함)으로 보통 SLO보다 느슨하게 둔다(원문 확인). |
| Point 3 | 결론형(예: "에러 버짓은 남은 실패 여유예요") | 에러 버짓 = 1 − SLO. 99.9%·30일이면 43.2분(요청 기준 100만 건 중 1,000건). 99.99%면 4.32분으로 열 배 빡빡해진다 — 9 하나가 비용을 크게 바꾼다는 결론. |
| Check | 3~4개 | ① SLI를 평균 응답시간으로 정의했다면 다시 확인(비율·임계값으로, `<Term slug="foundations/percentiles">`). ② 목표만 있고 기간이 없으면. ③ 100% 목표. ④(선택) CPU·메모리 같은 원인 지표를 SLO로 둔 경우. |
| Deeper | 섹션 2~3개 | 요청 기준과 시간 기준 SLI의 차이, burn rate(버짓을 쓰는 속도. 1이면 기간 끝에 정확히 소진 — SRE 워크북의 정의와 예시 숫자를 원문으로 확인), 고정 기간(달력)과 이동 기간(rolling)의 차이. |

**Term:** `foundations/percentiles`(필수), `foundations/counters-and-rate`(쓸 곳이 있으면, 성공률을 rate로 구할 때).

---

### Task 2: 글 「RED와 USE: 무엇부터 볼까」

**Files:** Create `src/content/docs/foundations/red-and-use.mdx`, `docs/reviews/foundations-red-and-use.md`

**머리말(초안):**

```yaml
title: RED와 USE
summary: 서비스는 요청 수·에러·지연(RED)으로, 자원은 사용률·포화·에러(USE)로 봐요.
domain: foundations
type: concept
order: 100
icon: activity
keywords: [RED, USE, golden signals, 골든 시그널, rate, errors, duration, utilization, saturation, 포화]
sources:
  - title: Brendan Gregg — The USE Method
    url: https://www.brendangregg.com/usemethod.html
  - title: Grafana Labs — The RED Method (Tom Wilkie)
    url: https://grafana.com/blog/2018/08/02/the-red-method-how-to-instrument-your-services/
  - title: Google SRE Book — Monitoring Distributed Systems
    url: https://sre.google/sre-book/monitoring-distributed-systems/
updated: 2026-10-13
```

**대시보드 그림(초안):** 제목 "주문 API · 서비스 첫 화면". `StatTile` 세 개: "요청(Rate)" "1,200"(건/초), "에러(Errors)" "0.4"(%), "지연 p99(Duration)" "820"(ms). 캡션 1~2문장.

**필수 내용:**

| 블록 | 제목/형태 | 담을 사실 |
| --- | --- | --- |
| Point 1 | 결론형(예: "서비스는 RED로 봐요") | 요청을 처리하는 서비스는 Rate(초당 요청), Errors(실패 비율·개수), Duration(지연 분포)로 본다. Tom Wilkie가 제안했다(원문 확인). 사용자가 겪는 것과 직접 이어진다. |
| Point 2 | 결론형(예: "자원은 USE로 봐요") | CPU·메모리·디스크·네트워크 같은 자원은 Utilization(사용률), Saturation(포화, 처리 못 해 쌓인 일), Errors로 본다. Brendan Gregg의 USE 방법(원문 정의 확인). |
| Point 3 | 결론형(예: "포화는 사용률 100% 전에 보여요") | 사용률 평균이 60%여도 대기열·실행 대기(run queue)가 쌓이면 이미 느려진다. 그래서 사용률만 보지 말고 포화 지표를 함께 본다(예시는 원문 근거로). |
| Check | 3~4개 | ① 서비스 대시보드 첫 화면이 CPU 사용률뿐이면 사용자 영향이 안 보인다. ② Errors를 개수로만 보여 주면 트래픽이 늘 때 착시가 생긴다(비율과 함께). ③ Duration을 평균으로만 보여 주면 느린 요청이 숨는다(`<Term slug="foundations/percentiles">`). ④(선택) 포화 지표 없이 사용률만으로 용량을 판단. |
| Deeper | 섹션 2~3개 | Google SRE Book의 네 가지 골든 시그널(지연·트래픽·에러·포화)과 RED·USE의 대응, USE 체크리스트를 자원마다 적용하는 법(원문의 예시 지표 몇 개), RED의 Rate·Errors는 카운터의 rate로 구한다(`<Term slug="foundations/counters-and-rate">`). |

**Term:** `foundations/percentiles`(필수), `foundations/counters-and-rate`(필수), `foundations/time-series-and-labels`(쓸 곳이 있으면).

---

### Task 3: 글 「알림 조건: 임계값과 지속 시간」

**Files:** Create `src/content/docs/foundations/alert-conditions.mdx`, `docs/reviews/foundations-alert-conditions.md`

**머리말(초안):**

```yaml
title: 알림 조건: 임계값과 지속 시간
summary: 지속 시간이 짧으면 알림이 흔들리고, 길면 늦게 울려요.
domain: foundations
type: concept
order: 110
icon: clock
keywords: [alert, 알림, alerting rule, for, pending, firing, flapping, 흔들림, threshold, 임계값]
sources:
  - title: Prometheus — Alerting rules
    url: https://prometheus.io/docs/prometheus/latest/configuration/alerting_rules/
  - title: Prometheus — Alertmanager
    url: https://prometheus.io/docs/alerting/latest/alertmanager/
  - title: Google SRE Book — Monitoring Distributed Systems
    url: https://sre.google/sre-book/monitoring-distributed-systems/
updated: 2026-10-13
```

`title`에 콜론이 있어 YAML에서 따옴표로 감싸야 할 수 있다(빌드로 확인).

**대시보드 그림(초안):** 제목 "에러율 · 1분마다 평가 · 임계값 2%". `MiniLineChart` 하나: `[0.5, 0.6, 2.1, 0.7, 2.3, 0.6, 0.5, 2.2, 2.4, 2.5, 2.6, 2.7, 0.6]`(단위 %, tone warn). `StatTile` 두 개: "지속 시간 없음" "3"(번 울림), "for: 3m" "1"(번 울림, note "3분 늦게"). 캡션 1~2문장.

**숫자 근거(사전 계산, node로 확인함):** 1분마다 평가하고 2% 초과를 조건으로 할 때, 지속 시간이 없으면 2분·4분·7분에 세 번 울린다. `for: 3m`이면 7분부터 이어진 문제에만 10분에 한 번 울린다(문제 시작보다 3분 늦음). 2분·4분의 한 번짜리 튐은 울리지 않는다.

**필수 내용:**

| 블록 | 제목/형태 | 담을 사실 |
| --- | --- | --- |
| Point 1 | 결론형(예: "알림 조건은 질의·임계값·지속 시간이에요") | 알림 규칙은 질의 결과가 임계값을 넘는 상태가 지속 시간(Prometheus `for`) 동안 이어지면 울린다. 그 전에는 pending 상태다(원문 확인). |
| Point 2 | 결론형(예: "지속 시간은 흔들림과 늦음을 맞바꿔요") | 위 숫자 예시. 짧으면 한 번짜리 튐에도 울려 흔들리고(flapping), 길면 진짜 문제에도 늦게 울린다. |
| Point 3 | 결론형(예: "원인보다 증상에 알림을 걸어요") | 사용자가 겪는 증상(에러율, 지연)에 알림을 걸고, 원인(CPU 등)은 대시보드로 본다(Google SRE Book의 권고, 원문 확인). SLO와 이어진다(`<Term slug="foundations/slo-and-error-budget">`). |
| Check | 3~4개 | ① 지속 시간 없는 알림(또는 평가 주기·수집 주기보다 짧은 지속 시간). ② rate 구간이 수집 주기에 비해 짧은 알림 질의(`<Term slug="foundations/collection-interval">`). ③ 데이터 없음일 때 어떻게 되는지 정하지 않은 알림(`<Term slug="foundations/no-data-vs-zero">`). ④(선택) 임계값의 근거(SLO, 과거 분포)가 없는 알림. |
| Deeper | 섹션 2~3개 | Prometheus 평가 주기(`evaluation_interval`)와 `for`의 관계, 해제를 늦추는 `keep_firing_for`(도입 버전 확인), Grafana 알림의 pending period, Alertmanager가 알림을 묶고(group) 반복 간격(repeat interval)으로 다시 보내는 방식(기본값은 원문으로 확인). |

**Term:** `foundations/slo-and-error-budget`, `foundations/collection-interval`, `foundations/no-data-vs-zero`, `foundations/counters-and-rate` 중 위에 지정한 것.

---

### Task 4: 가이드 「알림이 너무 많이 울릴 때」

**Files:** Create `src/content/docs/foundations/alert-fatigue.mdx`, `docs/reviews/foundations-alert-fatigue.md`

**머리말(초안):**

```yaml
title: 알림이 너무 많이 울릴 때
summary: 조치할 알림만 남기도록 증상, 지속 시간, 묶음 순서로 정리해요.
domain: foundations
type: guide
order: 120
icon: trending-up
keywords: [알림 피로, alert fatigue, 알림 폭주, noisy alert, 오탐, 알림 정리, Alertmanager]
sources:
  - title: Google SRE Book — Monitoring Distributed Systems
    url: https://sre.google/sre-book/monitoring-distributed-systems/
  - title: Prometheus — Alertmanager
    url: https://prometheus.io/docs/alerting/latest/alertmanager/
updated: 2026-10-13
```

**필수 내용:**

| 블록 | 형태 | 담을 내용 |
| --- | --- | --- |
| Situation | 두 단락 | 하루 알림이 수십 건이고 대부분 확인해 보면 정상이다. 그러다 진짜 알림을 놓친다. 결론: 조치할 알림만 남기면 된다. |
| FirstLook | Item 3개 | "조치할 일이 있는 알림인지", "증상인지 원인인지", "같은 장애로 여러 알림이 울리는지". |
| `## 1. 지난 알림을 조치 여부로 나눠 보세요` | 단락 2~3개 | 최근 알림 목록을 "조치함/조치할 게 없었음"으로 나눈다. 조치할 게 없던 알림이 정리 대상이다(SRE Book의 "모든 알림은 조치 가능해야 한다" 취지, 원문 확인). |
| `## 2. 원인 알림을 증상 알림으로 바꾸세요` | 단락 2~3개 | CPU·메모리 같은 원인 알림 대신 에러율·지연·SLO 소진 같은 증상 알림으로. `<Term slug="foundations/red-and-use">`, `<Term slug="foundations/slo-and-error-budget">`. |
| `## 3. 지속 시간과 임계값을 다시 잡으세요` | 단락 2~3개 | 한 번짜리 튐에 울리는 알림은 지속 시간을, 근거 없는 임계값은 SLO·과거 분포로. `<Term slug="foundations/alert-conditions">`. 확인 방법: 지난 알림 중 몇 분 안에 저절로 풀린 것의 비율. |
| `## 4. 같은 장애의 알림을 묶으세요` | 단락 2~3개 | Alertmanager의 묶기(group_by)와 억제(inhibit) 같은 기능으로 한 장애가 알림 수십 개가 되지 않게. 기능 이름과 동작은 원문으로. |
| Checkpoints | Check 3개 | ① 받는 사람이 할 일이 없는 알림 ② 대시보드로 충분한 정보를 알림으로 보내는 규칙 ③ 데이터 없음 처리가 정해지지 않은 알림(`<Term slug="foundations/no-data-vs-zero">`). |

본문 4,000자 이하, 단계마다 결론 먼저와 "확인 방법".

---

### Task 5: 관련 글 링크 정리와 화면 점검

- [ ] 이번 묶음 4편이 모두 있으니, 서로 이어지는 글끼리 `related`를 보강한다(각 5개 이하). 기존 글 중 percentiles·counters-and-rate·no-data-vs-zero에서 새 글로 가는 `related`가 자연스러우면 추가한다(머리말 `related` 줄만).
- [ ] `scripts/capture-screens.mjs`의 PAGES에 새 글 4편을 추가하고, 미리보기 시트 캡처에 `foundations/alert-fatigue/`를 더한다.
- [ ] `npm run build` 후 캡처해서 새 글 4편과 홈을 라이트·다크 × 데스크톱·모바일로 본다. 넘침, 위계, 숫자 타일 배치, 홈 카드 구성.
- [ ] 고친 것이 있으면 `npm run check`, `npx vitest run`, `npm run test:e2e`를 통과시키고 커밋한다. 서버를 끈다.

공개(main 병합·푸시)는 컨트롤러가 한다.

---

## 부록 A: 사실 검토 프롬프트

```text
너는 한국어 모니터링 지식 사이트의 사실 검토자야. 문체는 평가하지 마. 사실만 본다.

검토할 글: <src/content/docs/foundations/글이름.mdx>
글의 머리말 sources와, 필요하면 네가 찾은 1차 자료(공식 문서, 명세, 소스 코드, 원 논문, SRE 책)를 근거로 써. WebFetch로 원문을 직접 확인해. 기억에 의존하지 마. PromQL·설정 동작은 가능하면 promtool이나 로컬 실행으로, 숫자는 node로 직접 확인해(띄운 서버는 끝내기 전에 꺼).
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

(작성자가 채운다)

규칙: 글 파일과 다른 파일은 고치지 마. 검토 파일만 만들어. 커밋·푸시하지 마. 하위 에이전트를 띄우지 마.
```
