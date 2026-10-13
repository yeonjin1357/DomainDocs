# 글쓰기 가이드

이 사이트의 글은 읽혀야 해요. 이 가이드는 읽히는 글을 쓰는 규칙이에요. 글을 쓰거나 고치기 전에 끝까지 읽어요.

## 1. 목적

독자는 모니터링 제품을 만드는 개발자예요. 코드는 AI가 쓰고, 독자는 그 결과가 맞는지 판단해요.

판단하려면 도메인 지식이 필요해요. 이 사이트는 그 지식을 짧고 분명하게 전해요.

최우선 가치는 가독성이에요. 읽혀야 머리에 들어와요.

### 반면교사

이전에 만든 100장짜리 지식서(`BOOK.html`)처럼 만들지 않아요. 내용도 재사용하지 않아요. 읽히지 않았던 이유는 다음과 같아요.

| 구분 | 문제 |
| --- | --- |
| 화면 | 본문 폭이 1000px 이상이라 한 줄에 60~70자 |
| 화면 | 100장을 한 파일에 몰아넣어 진척감이 없음 |
| 화면 | 목차·표가 모두 같은 무게라 핵심이 안 보임 |
| 문장 | 문장마다 면책·단서("~라고 주장하지 않습니다")가 붙어 핵심이 묻힘 |
| 문장 | 결론과 "그래서 무엇을 판단할 수 있는지"가 늦게 나옴 |
| 문장 | 한 단락에 새 개념이 서너 개씩 등장 |
| 문장 | 입문 설명과 커널 소스 줄 번호 수준 근거가 같은 높이에 섞임 |

## 2. 글쓰기 규칙

규칙은 아홉 가지예요. 규칙마다 나쁜 예와 좋은 예를 하나씩 달았어요.

### 2.1 해요체로 써요

본문 문장은 "~요"나 "~죠"로 끝내요. "~습니다"(합쇼체)나 "~다"(해라체)로 끝내지 않아요.

- 나쁜 예: 평균 응답시간은 전체 요청의 합을 개수로 나눈 값입니다. (해라체 "값이다."도 같아요.)
- 좋은 예: 평균 응답시간은 전체 요청 시간의 합을 요청 개수로 나눈 값이에요.

### 2.2 결론을 먼저 써요

독자가 가장 알고 싶은 것을 첫 문장에 둬요.

- 나쁜 예: 응답시간을 요약하는 방법은 여러 가지가 있고, 각각 장단점이 있어요. 그중 평균은 극단값에 약해요.
- 좋은 예: 평균은 느린 요청을 숨겨요. 느린 요청을 보려면 p99를 봐요.

### 2.3 한 문장에는 정보 하나, 한 단락은 세 문장 이하로 써요

문장은 80자를 넘기지 않아요. 단락은 3문장을 넘기지 않아요.

- 나쁜 예: p99는 요청을 빠른 순서로 줄 세웠을 때 99번째 위치의 값인데, 평균과 달리 극단값에 덜 흔들리지만 표본이 적으면 불안정해서 보통 1분 이상의 구간으로 집계해요.
- 좋은 예: p99는 요청을 빠른 순서로 줄 세웠을 때 99번째 값이에요. 100개 중 99개는 이 값보다 빨라요. 표본이 적으면 흔들려서, 보통 1분 이상으로 집계해요.

### 2.4 새 용어는 풀어 쓰거나 `<Term>`으로 이어 줘요

처음 나올 때 한 번만 풀어요. 이미 글이 있는 용어는 `<Term slug="foundations/percentiles">백분위수</Term>`처럼 이어요.

- 나쁜 예: 이때 스팬이 샘플링되면 트레이스가 끊겨요.
- 좋은 예: 이때 스팬(span, 요청 한 구간의 기록)이 샘플링되면 트레이스(요청 전체의 기록)가 끊겨요.

### 2.5 업계 영어는 영어로 쓰고, 처음 한 번만 풀어 줘요

p99, rate, span 같은 말은 영어 그대로 써요. 처음 나올 때 한 번 한글로 풀어요.

- 나쁜 예: 아흔아홉 번째 백분위 응답시간이 높아요.
- 좋은 예: p99(느린 쪽 1%의 경계값)가 높아요.

### 2.6 숫자 예시는 구체적으로 들어요

- 나쁜 예: 일부 요청이 오래 걸리면 평균이 실제 체감과 달라질 수 있어요.
- 좋은 예: 요청 100개 중 1개가 3초 걸리고 나머지가 0.1초면, 평균은 0.129초예요. 사용자 100명 중 1명은 3초를 기다려요.

### 2.7 본문에는 면책 문장을 쓰지 않아요

꼭 필요한 예외는 `<Deeper>`에 넣어요.

- 나쁜 예: 본 문서에서는 CPU 사용률을 특정 수집기의 정의라고 주장하지 않습니다.
- 좋은 예: CPU 사용률은 계산식이 제품마다 달라요.

### 2.8 출처는 문장마다 달지 않아요

출처는 머리말 `sources`에 모아요. 본문에는 마크다운 링크를 쓰지 않아요.

- 나쁜 예: p99는 100개 중 99번째 값이에요([Prometheus 문서](https://prometheus.io/docs/)).
- 좋은 예: p99는 100개 중 99번째 값이에요. (출처는 머리말 `sources`에 `Prometheus 문서`로 적어요.)

### 2.9 한 단락에서 새 개념은 하나만 소개해요

- 나쁜 예: p99는 99번째 백분위수예요. 히스토그램은 값을 구간별로 세어요. 샘플링은 일부만 모아요.
- 좋은 예: p99는 99번째 백분위수예요. 100개 중 99개가 이 값보다 빨라요. 나머지 1개가 느린 꼬리예요.

## 3. 개념 글 뼈대

복사해서 써요. 블록 순서는 `OnDashboard` → `KeyPoints` → (데모) → `Checkpoints` → (`Deeper`)예요.

````mdx
---
title: 제목(30자 이하)
summary: 한 줄 요약(15~60자). 이것만 읽어도 무엇인지 알게 써요.
domain: foundations
type: concept
order: 1
icon: chart-column
keywords: [검색 별칭, 영어 용어]
related: [foundations/다른-글]
sources:
  - title: 출처 제목
    url: https://...
updated: 2026-10-13
---
import PercentileDemo from '../../../components/demos/PercentileDemo.tsx';

<OnDashboard title="위젯 이름" caption="그림이 보여 주는 것 한 문장">
  <MiniLineChart ariaLabel="그래프 설명" series={[{ label: '평균', values: [1, 2, 3], tone: 'sub' }]} />
  <StatTile label="p99" value="3,000" unit="ms" tone="warn" />
</OnDashboard>

<KeyPoints>
  <Point title="핵심 1 (30자 이하)">
    두세 문장이에요.
  </Point>
</KeyPoints>

<PercentileDemo client:visible />

<Checkpoints>
  <Check>AI나 동료의 구현에서 의심해야 할 지점이에요.</Check>
</Checkpoints>

<Deeper>
  공식, 예외, 세부 동작이에요.
</Deeper>
````

## 4. 가이드 글 뼈대

순서는 `Situation` → `FirstLook` → 단계별 설명 → `Checkpoints`예요. `FirstLook`에는 `Item`을 1~3개 둬요.

단계는 `##` 소제목으로 나눠요. 소제목은 1개 이상 필요해요.

````mdx
---
title: 제목(30자 이하)
summary: 한 줄 요약. 이 글로 무엇을 할 수 있는지 써요.
domain: foundations
type: guide
order: 1
sources:
  - title: 출처 제목
    url: https://...
updated: 2026-10-13
---

<Situation>
  두 화면에서 같은 지표의 숫자가 달라요.
</Situation>

<FirstLook>
  <Item title="집계 구간">점 하나가 몇 초 구간인지 봐요.</Item>
  <Item title="계산식">평균인지 합계인지 봐요.</Item>
</FirstLook>

## 1. 구간을 맞춰 보세요

<Term slug="foundations/percentiles">백분위수</Term>는 구간이 다르면 값이 달라요.

## 2. 계산식을 확인해요

계산식이 다르면 숫자도 달라요.

<Checkpoints>
  <Check>계산식이 다르다면 문서로 남기세요.</Check>
</Checkpoints>
````

## 5. 컴포넌트 목록

| 컴포넌트 | 속성 | 쓰는 곳 |
| --- | --- | --- |
| `OnDashboard` | `title`, `caption?` | 대시보드에서 만나는 모습을 작은 그림으로 보여 줘요 |
| `KeyPoints` | 없음 | 개념 글의 핵심. 안에 `Point` 1~3개 |
| `Point` | `title` (30자 이하) | `KeyPoints` 안의 핵심 하나 |
| `Checkpoints` | 없음 | 다시 확인할 지점. 안에 `Check` 1개 이상 |
| `Check` | 없음 | 의심해야 할 지점 하나 |
| `Deeper` | 없음 | 공식, 예외, 세부 동작. 기본으로 접혀요 |
| `Situation` | 없음 | 가이드의 상황 설명 |
| `FirstLook` | 없음 | 가이드의 먼저 볼 것. 안에 `Item` 1~3개 |
| `Item` | `title` (30자 이하) | `FirstLook` 안의 항목 하나 |
| `Term` | `slug` | 다른 글로 잇는 링크. 예: `foundations/percentiles` |
| `MiniLineChart` | `series`, `ariaLabel`, `yMax?`, `height?` | 작은 선 그래프. 단위는 범례 `value`에 직접 써요 |
| `StatTile` | `label`, `value`, `unit?`, `tone?`, `note?` | 숫자 하나를 크게 보여 줘요 |
| `PercentileDemo`, `DownsamplingDemo` | 없음 | 직접 만져 보는 데모. default import 후 `client:visible`로 써요 |

`MiniLineChart`와 `StatTile` 같은 viz 컴포넌트는 한 줄에 하나씩 써요. 한 줄에 여러 개를 쓰면 단락으로 묶여 배치가 깨져요.

## 6. 검사 규칙과 기준값

`npm run lint:content`가 아래 규칙을 검사해요. 위반이 하나라도 있으면 빌드가 실패해요. 코드 블록, 인라인 코드, 표, 컴포넌트 속성값은 문장 검사에서 빼요.

| 규칙 | 기준 | 출력 이름 |
| --- | --- | --- |
| 개념 글 블록 순서와 필수 여부 | 3장 순서. 최상위에는 틀 블록과 데모만 둬요 | `structure` |
| 가이드 글 블록 순서와 필수 여부 | 4장 순서 | `structure` |
| `KeyPoints` 안 `Point` 개수 | 1~3개 | `block-children` |
| `FirstLook` 안 `Item` 개수 | 1~3개 | `block-children` |
| 문장 길이 | 80자 이하 | `sentence-length` |
| 단락 길이 | 3문장 이하 | `paragraph-length` |
| 문체 | 본문 문장은 "요"나 "죠"로 끝나요. 뒤에 붙는 문장 부호와 닫는 따옴표·괄호는 괜찮아요. "~니다"(합쇼체)와 "~다"(해라체)는 위반 | `formal-ending` |
| 금지 표현 | "주장하지 않", "단정하지 않", "보장하지 않", "일반화하지 않", "이 문서에서는", "이 장에서는" | `banned-phrase` |
| 본문 분량 | 개념 1,500자 이하, 가이드 4,000자 이하 (`Deeper` 제외) | `body-length` |
| `Term`의 `slug`와 `related` | 존재하는 글. 공개 글은 초안(`draft`)을 가리킬 수 없어요 | `reference` |
| `domain` | 파일이 있는 폴더 이름과 같아요 | `domain-folder` |
| 마크다운 링크 | 본문에 쓰지 않아요 | `markdown-link` |
| `Point`·`Item` 제목 | 30자 이하 | `block-title` |
| 쓸 수 있는 요소 | 5장의 컴포넌트와 default import한 데모만 써요. `<a href="/...">`, `<img>` 같은 HTML 요소도 위반 | `unknown-component` |
| 데모의 client 지시어 | import한 데모에는 `client:visible`을 붙여요. 없으면 움직이지 않는 그림으로만 보여서 위반 | `demo-hydration` |

인라인 코드로 끝나는 문장(예: "이렇게 써요: `rate(x[5m])`")은 코드 앞의 마지막 한글로 문체를 판단해요. 코드만 있는 문장은 문체를 보지 않아요.

`Deeper` 안에서는 금지 표현 규칙만 빠져요. 나머지 규칙은 그대로 적용돼요.

기준값은 `scripts/lint-content/config.ts`에 있어요. 값을 바꾸면 이 표도 같이 고쳐요.

## 7. 작성 절차

1. 출처를 조사해요. 공식 문서, 명세, 원 논문을 먼저 봐요.
2. 초안을 써요.
3. `npm run lint:content`를 돌려요.
4. 작성자와 다른 에이전트가 사실을 검토해요. 결과는 `docs/reviews/{domain}-{slug}.md`에 남겨요.
5. 검토 내용을 반영하고 다시 검사해요.
6. 사이트 주인이 화면에서 확인해요.

## 8. 사실 검토 기록 형식

````md
# 사실 검토: <제목>

- 글: src/content/docs/<domain>/<slug>.mdx
- 검토일: YYYY-MM-DD
- 결과: 수정 필요 N건 / 확인 N건

| 주장(인용) | 판정 | 근거(URL과 인용) | 수정 제안 |
| --- | --- | --- | --- |

## 반영

- 무엇을 어떻게 고쳤는지
````
