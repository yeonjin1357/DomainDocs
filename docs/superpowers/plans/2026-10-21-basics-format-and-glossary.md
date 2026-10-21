# 기초 글 틀과 용어 사전 구현 계획

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> 이 저장소에서는 2026-10-14부터 서브 에이전트를 쓰지 않는다(사이트 주인 요청). superpowers:executing-plans로 직접 실행한다.

**Goal:** 영역을 8개로 다시 짜고, "무엇 → 어떻게 → 모니터링" 순서의 기초 글을 쓸 수 있는 틀(머리말 `stage`·`overview`, 느슨해진 글 검사, 비유·그림 블록, 새 그림 4종)과 용어 사전(데이터, 검사, 미리보기 시트, 용어 사전 페이지)을 만든다.

**Architecture:** 지금 구조를 그대로 넓힌다. 머리말은 `src/content.config.ts`의 zod 스키마, 본문 틀은 `scripts/lint-content/`의 remark 검사기가 지킨다. 새 그림은 기존 viz처럼 정적 SVG/HTML 컴포넌트이고, 좌표 계산은 `src/lib/viz/*.ts` 순수 함수로 빼서 단위 테스트한다. 용어는 영역마다 YAML 파일 하나(`src/content/terms/{domain}.yaml`)로 두고, Astro 컬렉션 `glossary`로 읽어 `<Term term>`·미리보기 시트·용어 사전 페이지에 쓴다.

**Tech Stack:** Astro 7.3, @astrojs/mdx 8, TypeScript 6, zod 4(`astro/zod`), `yaml` 2.9(이미 의존성), @lucide/astro, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-10-21-domain-basics-and-quiz-design.md` (이 계획은 9장의 1·2단계를 다룬다. 퀴즈는 DB 첫 글을 보여 드린 뒤 따로 계획한다.)

## Global Constraints

- 앞선 계획 `docs/superpowers/plans/2026-10-13-domaindocs-site.md`의 Global Constraints를 모두 따른다(Astro import 경로, base 경로와 `src/lib/paths.ts`, `compressHTML` 공백, 스크립트가 만든 DOM의 `:global()`, Playwright 상대 경로, Windows 환경 변수).
- 디자인은 바꾸지 않는다. 색은 `src/styles/tokens.css`의 변수(`--color-bg`, `--color-card`, `--color-text`, `--color-text-sub`, `--color-text-weak`, `--color-accent`, `--color-accent-weak`, `--color-warn`, `--color-warn-weak`, `--color-line`)만 쓴다. 그림 안 색도 같다.
- 화면 문구는 한국어 해요체. 360px과 1440px에서 가로 스크롤이 없어야 한다.
- 이미 공개된 글 40편은 내용을 고치지 않는다. 바꾸는 것은 개념 글 29편의 머리말에 `stage: monitoring` 한 줄을 더하는 것뿐이다. 바꾼 뒤에도 `npm run lint:content` 위반 0건이어야 한다.
- 기존 영역 id `foundations`, `apm`, `database`는 주소가 공개되어 있어 바꾸지 않는다.
- 글을 고친 단계는 `npm run lint:content`와 `npm run build`, 화면 코드를 고친 단계는 `npm run test:e2e`까지 돌린다.
- 커밋은 태스크마다 한다. 커밋 메시지 끝에 `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`을 붙인다. push는 하지 않는다(공개 배포라 사이트 주인 확인 후).

## Review Focus

1. 기존 글 40편이 새 검사를 그대로 통과하고 화면도 그대로다. → Task 3 Step 6에서 실제 글로 검사한다.
2. 글과 용어가 같은 키(`foundations/alpha`)를 쓸 때 각자 맞는 시트가 열린다. → Task 8 화면 테스트.
3. 자세한 글이 없는 용어, 그리고 JavaScript가 꺼진 환경에서도 용어 링크가 용어 사전의 그 위치로 간다. → Task 8 화면 테스트.
4. 새 그림이 360px에서 가로로 넘치지 않고, 다크 모드에서 글자가 보인다. → Task 6 화면 테스트.
5. 용어 파일의 YAML 문법 오류나 빠진 필드는 빌드를 멈추고 몇째 줄인지 알려 준다. 용어가 초안 글을 가리켜도 멈춘다. → Task 7 단위 테스트.

---

### Task 1: 영역 8개로 다시 짜기

**Files:**
- Modify: `src/data/domains.ts`
- Modify: `src/data/icons.ts`, `src/components/ui/Icon.astro`
- Modify: `src/lib/catalog.ts:43`(주석), `src/lib/content.ts:63`(주석)
- Test: `tests/e2e/home.spec.ts`, `tests/e2e/term-sheet.spec.ts`, `tests/unit/catalog.test.ts`(테스트 이름만)

**Interfaces:**
- Produces: `DOMAIN_IDS = ['foundations', 'network', 'server', 'kubernetes', 'cloud', 'apm', 'database', 'messaging']`, `DomainId`. `ICON_NAMES`에 `'network' | 'container' | 'cloud' | 'messages-square' | 'book-open'` 추가.

- [ ] **Step 1: 화면 테스트 기대값을 먼저 고친다**

`tests/e2e/home.spec.ts` 첫 테스트를 이렇게 바꾼다.

```ts
test('홈에 영역 8개가 있고, 글이 없는 영역은 준비 중이다', async ({ page }) => {
  await page.goto('./');
  const rows = cardWithTitle(page, '영역').locator('[data-row]');
  await expect(rows).toHaveCount(8);
  await expect(rows.nth(0)).toHaveAttribute('href', '/DomainDocs/foundations/');
  await expect(rows.nth(0)).toContainText('모니터링 기초');
  await expect(rows.nth(0)).toContainText('4편');
  await expect(rows.nth(1)).toContainText('네트워크');
  for (const i of [1, 2, 3, 4, 5, 6, 7]) {
    await expect(rows.nth(i)).toContainText('준비 중');
    await expect(rows.nth(i)).not.toHaveAttribute('href');
  }
});
```

같은 파일의 `toHaveText('공통 기초')`와 `tests/e2e/term-sheet.spec.ts`의 `'공통 기초 · 개념'`, `'공통 기초 · 가이드'`를 `모니터링 기초`로 바꾼다. `tests/unit/catalog.test.ts`의 테스트 이름 "공통 기초"도 "모니터링 기초"로 바꾼다.

- [ ] **Step 2: 실패를 확인한다**

Run: `npx playwright test tests/e2e/home.spec.ts --project=desktop`
Expected: FAIL — 영역 수가 4개.

- [ ] **Step 3: `src/data/domains.ts`의 `DOMAIN_IDS`와 `DOMAINS`를 바꾼다**

순서와 값은 아래 그대로다.

| id | name | description | icon |
| --- | --- | --- | --- |
| `foundations` | 모니터링 기초 | 백분위수, rate, 알림처럼 어느 영역에서나 쓰는 모니터링 개념이에요. | `sigma` |
| `network` | 네트워크 | 장비, 인터페이스, 스위치, SNMP처럼 네트워크가 이어지고 보이는 방식이에요. | `network` |
| `server` | 서버·OS | CPU, 메모리, 디스크, 프로세스처럼 서버 한 대가 일하는 방식이에요. | `server` |
| `kubernetes` | 컨테이너·쿠버네티스 | 컨테이너, 파드, 노드, 워크로드로 앱을 띄우고 관리하는 방식이에요. | `container` |
| `cloud` | 클라우드 | AWS와 Azure의 주요 서비스와, 그 서비스를 재는 지표예요. | `cloud` |
| `apm` | 애플리케이션 | WAS, 트랜잭션, 응답시간, 트레이스로 앱이 요청을 처리하는 방식이에요. | `activity` |
| `database` | 데이터베이스 | 트랜잭션, 인덱스, 잠금, 세션으로 DB가 데이터를 다루는 방식이에요. | `database` |
| `messaging` | 메시지 큐 | Kafka의 토픽, 파티션, 컨슈머 그룹으로 메시지가 오가는 방식이에요. | `messages-square` |

- [ ] **Step 4: 아이콘을 더한다**

`ICON_NAMES`에 `'network', 'container', 'cloud', 'messages-square', 'book-open'`을 더하고, `Icon.astro`의 import와 `ICONS`에 `Network`, `Container`, `Cloud`, `MessagesSquare`, `BookOpen`(모두 `@lucide/astro`)을 더한다.

- [ ] **Step 5: 검사와 테스트를 돌린다**

Run: `npm run check && npm test && npm run lint:content && npx playwright test tests/e2e/home.spec.ts tests/e2e/term-sheet.spec.ts`
Expected: 모두 PASS, 글 검사 위반 0건.

- [ ] **Step 6: Commit**

```bash
git add src/data src/components/ui/Icon.astro src/lib tests
git commit -m "feat: 영역을 8개로 다시 짜기"
```

---

### Task 2: 머리말에 `stage`와 `overview` 종류 더하기

**Files:**
- Modify: `src/content.config.ts`
- Modify: `src/lib/catalog.ts`, `src/lib/content.ts:toCard`
- Modify: `scripts/lint-content/rules.ts` (`lintSource`의 머리말 검사)
- Modify: `src/content/docs/**/*.mdx` 중 `type: concept`인 29편, `tests/fixtures/docs/foundations/{alpha,beta,demos,draft-doc}.mdx`, `tests/fixtures/lint/{good,bad}/foundations/sample.mdx`
- Test: `tests/unit/lint/rules.test.ts`

**Interfaces:**
- Produces (`src/lib/catalog.ts`): `type DocType = 'overview' | 'concept' | 'guide'`, `type Stage = 'basics' | 'monitoring'`, `TYPE_LABEL.overview = '한눈에 보기'`, `DocCard.stage?: Stage`.
- Produces (스키마): `type: z.enum(['overview', 'concept', 'guide'])`, `stage: z.enum(['basics', 'monitoring']).optional()`.
- 이 태스크의 글 검사는 `overview`를 아직 받지 않는다(Task 3에서 받는다).

- [ ] **Step 1: 실패하는 단위 테스트를 쓴다**

`tests/unit/lint/rules.test.ts`의 `FRONT`에 네 번째 인자 `stage`를 더한다. 기본값은 `type === 'concept' ? 'monitoring' : null`이고, null이 아니면 `stage: ${stage}` 줄을 넣는다. `describe('머리말과 참조 규칙')`에 더한다.

```ts
it('개념 글에 stage가 없으면 잡는다', () => {
  expect(rules(FRONT('', 'concept', 'foundations', null) + CONCEPT_BODY)).toContain('frontmatter');
});
it('stage 값이 basics·monitoring이 아니면 잡는다', () => {
  expect(rules(FRONT('', 'concept', 'foundations', 'intro') + CONCEPT_BODY)).toContain('frontmatter');
});
it('가이드에 stage가 있으면 잡는다', () => {
  expect(rules(FRONT('', 'guide', 'foundations', 'basics') + GUIDE_BODY)).toContain('frontmatter');
});
```

- [ ] **Step 2: 실패를 확인한다**

Run: `npx vitest run tests/unit/lint/rules.test.ts`
Expected: 새 테스트 3개 FAIL.

- [ ] **Step 3: 머리말 검사를 구현한다**

`lintSource`에서 `type` 확인 뒤에 검사한다. 위반 메시지는 아래 그대로다.
- 개념인데 `stage`가 `basics`·`monitoring`이 아님: `개념 글에는 stage(basics 또는 monitoring)가 필요해요. 현재: ${String(fm.stage)}`
- 개념이 아닌데 `stage`가 있음: `stage는 개념 글에만 써요.`

- [ ] **Step 4: 스키마와 카탈로그 타입을 넓힌다**

`content.config.ts`와 `catalog.ts`를 Interfaces대로 바꾸고, `toCard`가 `stage: entry.data.stage`를 넘긴다.

- [ ] **Step 5: 기존 개념 글과 테스트 글에 `stage: monitoring`을 더한다**

Run: `grep -rl '^type: concept$' src/content/docs tests/fixtures | xargs sed -i 's/^type: concept$/type: concept\nstage: monitoring/'`
Then: `grep -rc '^stage: monitoring$' src/content/docs | awk -F: '{s+=$2} END {print s}'`
Expected: `29`

- [ ] **Step 6: 검사와 테스트를 돌린다**

Run: `npm test && npm run check && npm run lint:content`
Expected: PASS, 위반 0건.

- [ ] **Step 7: Commit**

```bash
git add src scripts tests
git commit -m "feat: 개념 글 stage와 한눈에 보기 종류 추가"
```

---

### Task 3: 글 검사를 새 틀에 맞추고 `Analogy`·`Figure` 블록 만들기

**Files:**
- Create: `src/components/content/Analogy.astro`, `src/components/content/Figure.astro`
- Modify: `src/components/content/index.ts`, `scripts/lint-content/config.ts`, `scripts/lint-content/rules.ts`
- Test: `tests/unit/lint/rules.test.ts`

**Interfaces:**
- Consumes: Task 2의 `stage`.
- Produces:
  - `<Analogy limit="비유가 안 맞는 곳">비유 본문</Analogy>` — `<aside class="block analogy" data-block="analogy">`, 제목 `비유하면`(h2, `.block-title`), 본문, 그 아래 `비유가 안 맞는 곳` 소제목과 `limit` 글. `limit`은 필수.
  - `<Figure caption?="...">그림</Figure>` — `<figure class="block" data-block="figure">`. 그림 영역은 `OnDashboard`의 `.widget`처럼 `--color-bg` 바탕에 `data-pagefind-ignore`, 캡션은 그 아래 `.block-caption`(색인됨).
  - 검사기의 그림 컴포넌트 목록 `FIGURE_COMPONENTS = ['MiniLineChart', 'StatTile', 'Waterfall', 'Scatter', 'ServiceMap']`(Task 5·6에서 새 그림을 더한다). 이 컴포넌트와 SVG 그림은 `Figure`나 `OnDashboard` 안에만 둔다.
  - 새 `RuleId` `'analogy-limit'`. `'body-length'`와 `LINT_CONFIG.maxBodyChars`는 없앤다.

새 틀 규칙(개념·한눈에 보기 공통):
- 최상위에 둘 수 있는 것: `OnDashboard`, `KeyPoints`, `Analogy`, `Figure`, `Checkpoints`, `Deeper`, import한 데모, 그리고 단락·`##` 이하 소제목·목록·표·코드·인용.
- `Analogy`, `Checkpoints`, `Deeper`는 한 번까지. `Deeper`가 있으면 맨 끝. `Checkpoints` 뒤에는 `Deeper`만 온다.
- `#` 소제목은 안 된다.
- 개념: `KeyPoints`가 정확히 하나. `stage: basics`면 최상위 `##` 소제목이 하나 이상.
- 한눈에 보기: `KeyPoints`를 쓰지 않는다. 최상위 `Figure`와 `##` 소제목이 각각 하나 이상.
- 가이드: 지금 규칙 그대로. 본문(가운데)에 `Figure`와 `Analogy`도 둘 수 있다.
- MDX의 default import 중 경로가 `.svg`로 끝나는 것은 데모가 아니라 SVG 그림이다. client 지시어가 필요 없고, `Figure` 안에만 두며, `aria-label`이 있어야 한다.

- [ ] **Step 1: 실패하는 단위 테스트를 쓴다**

`tests/unit/lint/rules.test.ts`에 `BASICS_BODY`를 더한다: `KeyPoints`(Point 1개) → `Analogy limit="..."` → `## 어떻게 동작하나요` → 단락 → `<Figure caption="..."><StatTile .../></Figure>` → `Checkpoints`. 아래 테스트를 더하고, 기존의 "개념 글 최상위의 일반 단락과 소제목을 잡는다"와 "개념 본문이 1,500자를 넘으면 잡는다"는 지운다.

```ts
describe('새 틀 규칙', () => {
  it('기초 글 틀은 통과한다', () => {
    expect(lint(FRONT('', 'concept', 'foundations', 'basics') + BASICS_BODY)).toEqual([]);
  });
  it('기존 틀(OnDashboard → KeyPoints → Checkpoints → Deeper)도 통과한다', () => {
    expect(lint(`${FRONT() + CONCEPT_BODY}\n<Deeper>\n  더 깊은 이야기예요.\n</Deeper>\n`)).toEqual([]);
  });
  it('본문이 길어도 분량 위반이 없다', () => {
    const long = '응답시간은 요청 하나를 끝내는 데 걸린 시간이에요.\n\n'.repeat(80);
    expect(rules(FRONT('', 'concept', 'foundations', 'basics') + BASICS_BODY.replace('## 어떻게 동작하나요', `## 어떻게 동작하나요\n\n${long}`))).toEqual([]);
  });
  it('KeyPoints가 없으면 잡는다', () => { /* BASICS_BODY에서 KeyPoints 블록을 지운다 → 'structure' */ });
  it('Checkpoints 뒤에 단락이 오면 잡는다', () => { /* → 'structure' */ });
  it('Deeper가 맨 끝이 아니면 잡는다', () => { /* → 'structure' */ });
  it('기초 글에 ## 소제목이 없으면 잡는다', () => { /* → 'structure' */ });
  it('# 소제목을 잡는다', () => { /* → 'structure' */ });
  it('그림 컴포넌트를 Figure 밖 최상위에 두면 잡는다', () => { /* <StatTile>을 최상위에 → 'structure' */ });
  it('Analogy에 limit이 없으면 잡는다', () => { /* → 'analogy-limit' */ });
  it('한눈에 보기는 Figure와 ##가 있으면 통과하고, KeyPoints가 있거나 Figure가 없으면 잡는다', () => { /* type overview */ });
  it('가이드 본문에 Figure를 둘 수 있다', () => { /* GUIDE_BODY 가운데에 Figure → [] */ });
  it('SVG import는 데모가 아니고, Figure 밖에 두거나 aria-label이 없으면 잡는다', () => {
    // import SwitchFigure from '../../../assets/figures/foundations/switch.svg';
    // <Figure><SwitchFigure aria-label="스위치 그림" /></Figure> → []
    // 최상위 <SwitchFigure aria-label="..." /> → 'structure'
    // <Figure><SwitchFigure /></Figure> → 'structure'
  });
});
```

주석으로 적은 테스트도 위와 같은 방식(`rules(...)`에 `toContain(규칙)`)으로 실제 본문을 써서 만든다.

- [ ] **Step 2: 실패를 확인한다**

Run: `npx vitest run tests/unit/lint/rules.test.ts`
Expected: 새 테스트 FAIL.

- [ ] **Step 3: `Analogy.astro`와 `Figure.astro`를 만들고 등록한다**

Interfaces대로 만들고, `src/components/content/index.ts`의 `mdxComponents`와 `LINT_CONFIG.mdxComponents`에 `Analogy`, `Figure`를 더한다(두 목록이 같은지 단위 테스트가 확인한다). `Analogy` 바탕은 `--color-accent-weak`, 모서리는 기존 블록과 같은 `var(--radius-card)`.

- [ ] **Step 4: 검사기를 고친다**

`rules.ts`에서 `checkConceptStructure`를 위 규칙의 `checkFlexibleStructure(items, demos, svgs, type, stage, report)`로 바꾸고, 개념과 한눈에 보기가 함께 쓴다. `importedNames`는 `{ demos: Set<string>; svgs: Set<string> }`를 돌려주게 바꾼다(`import X from '...svg'`의 경로로 나눈다). `checkComponents`는 `svgs`를 등록된 컴포넌트처럼 받되, `Figure` 안에 있는지와 `aria-label`을 본다. 분량 검사와 `maxBodyChars`를 지운다. 머리말 검사는 `type`으로 `overview`도 받는다. 위반 메시지 예:
- `그림은 <Figure>나 <OnDashboard> 안에 둬요.`
- `<Analogy>에 limit(비유가 안 맞는 곳)이 필요해요.`
- `기초 글에는 본문 설명(## 소제목)이 1개 이상 필요해요.`
- `한눈에 보기 글에는 <Figure>가 1개 이상 필요해요.`

- [ ] **Step 5: 단위 테스트를 돌린다**

Run: `npm test`
Expected: PASS.

- [ ] **Step 6: 실제 글 40편으로 확인한다 (Review Focus 1)**

Run: `npm run lint:content && npm run build`
Expected: `글 40편 검사, 위반 0건`, 빌드 성공.

- [ ] **Step 7: Commit**

```bash
git add src/components/content scripts tests
git commit -m "feat: 새 글 틀 검사와 비유·그림 블록"
```

---

### Task 4: 읽는 순서, 영역 페이지, 홈

**Files:**
- Modify: `src/lib/catalog.ts`, `src/pages/[domain]/index.astro`, `src/pages/index.astro`
- Create: `tests/fixtures/docs/foundations/map.mdx`
- Modify: `tests/fixtures/docs/foundations/alpha.mdx`
- Test: `tests/unit/catalog.test.ts`, `tests/e2e/home.spec.ts`, `tests/e2e/doc-page.spec.ts`, `tests/e2e/helpers.ts`

**Interfaces:**
- Consumes: Task 2의 `DocCard.type`·`stage`, Task 3의 `Figure`.
- Produces (`src/lib/catalog.ts`):
  - `readingSequence<T extends Pick<DocCard, 'id' | 'type' | 'stage' | 'order'>>(docs: readonly T[]): T[]` — 한눈에 보기(`order` 순) → 기초 개념(`order` 순) → 나머지(모니터링 개념과 가이드를 섞어 `order` 순). 같은 `order`는 `id` 순.
  - `nextInDomain`은 같은 영역 글을 `readingSequence`로 줄 세운 뒤 다음 글을 준다.
  - `domainSections<T extends Pick<DocCard, 'id' | 'type' | 'stage' | 'order'>>(docs: readonly T[]): { overview: T[]; basics: T[]; monitoring: T[]; guides: T[] }`
  - `homeLists`의 처음 목록: `DOMAIN_IDS` 순서로 영역마다 첫 한눈에 보기 글. 하나도 없으면 지금처럼 `foundations`를 `order` 순으로 `limit`개.

- [ ] **Step 1: 실패하는 단위 테스트를 쓴다**

`tests/unit/catalog.test.ts`의 `card()`에 `stage` 인자를 더하고 아래를 더한다.

```ts
describe('readingSequence', () => {
  const docs = [
    card('apm/g', 5, '2026-10-01', 'apm', 'guide'),
    card('apm/m', 1, '2026-10-01', 'apm', 'concept', 'monitoring'),
    card('apm/b2', 30, '2026-10-01', 'apm', 'concept', 'basics'),
    card('apm/b1', 20, '2026-10-01', 'apm', 'concept', 'basics'),
    card('apm/ov', 99, '2026-10-01', 'apm', 'overview'),
  ];
  it('한눈에 보기 → 기초 → 나머지(order 순) 순서다', () => {
    expect(readingSequence(docs).map((d) => d.id)).toEqual(['apm/ov', 'apm/b1', 'apm/b2', 'apm/m', 'apm/g']);
  });
  it('다음 글도 이 순서를 따른다', () => {
    expect(nextInDomain(docs, 'apm/b2')?.id).toBe('apm/m');
    expect(nextInDomain(docs, 'apm/g')).toBeUndefined();
  });
  it('영역 페이지 묶음으로 나눈다', () => {
    const s = domainSections(docs);
    expect([s.overview, s.basics, s.monitoring, s.guides].map((l) => l.map((d) => d.id))).toEqual([['apm/ov'], ['apm/b1', 'apm/b2'], ['apm/m'], ['apm/g']]);
  });
});

it('처음 목록은 영역 순서대로 한눈에 보기 글을 고른다', () => {
  const docs = [...DOCS, card('database/ov', 0, '2026-10-01', 'database', 'overview'), card('network/ov', 0, '2026-10-01', 'network', 'overview')];
  expect(homeLists(docs).starter.map((d) => d.id)).toEqual(['network/ov', 'database/ov']);
});
```

- [ ] **Step 2: 실패를 확인한다**

Run: `npx vitest run tests/unit/catalog.test.ts`
Expected: FAIL — `readingSequence`가 없다.

- [ ] **Step 3: `catalog.ts`를 구현한다**

Interfaces대로 만든다.

- [ ] **Step 4: 영역 페이지를 바꾼다**

카드 순서와 제목: `한눈에 보기`(overview), `기초`(basics), `모니터링에서는`(monitoring), `상황 가이드`(guides). 빈 묶음의 카드는 숨긴다. 홈은 `homeLists`만 바뀌므로 그대로 둔다.

- [ ] **Step 5: 테스트 글을 고치고 화면 테스트 기대값을 바꾼다**

- `map.mdx`: `title: 지도 글`, `summary: 테스트용 한눈에 보기 글이에요. 영역 전체를 그려요.`, `type: overview`, `order: 0`, `updated: 2026-10-05`, 본문은 `<Figure caption="테스트용 지도예요.">`(안에 fixture beta의 `ServiceMap` 하나) → `## 지도 읽기` → 단락 하나.
- `alpha.mdx`: `stage: basics`로 바꾸고, `KeyPoints` 다음에 `## 알파가 동작하는 방식`과 단락 하나를 더한다.
- `home.spec.ts`: 영역 줄의 글 수 기대값을 `'5편'`으로, 처음 목록 기대값을 `['지도 글']`로, 최근 목록 테스트는 "최근 추가된 글에 `지도 글`이 없다"로, 영역 페이지 테스트는 아래로 바꾼다.

```ts
await expect(page.locator('h1')).toHaveText('모니터링 기초');
await expect(cardWithTitle(page, '한눈에 보기').locator('.row-title')).toHaveText(['지도 글']);
await expect(cardWithTitle(page, '기초').locator('.row-title')).toHaveText(['알파 개념']);
await expect(cardWithTitle(page, '모니터링에서는').locator('.row-title')).toHaveText(['데모 모음', '베타 개념']);
await expect(cardWithTitle(page, '상황 가이드').locator('.row-title')).toHaveText(['감마 가이드']);
```

- `doc-page.spec.ts:54`: 알파의 다음 글 기대값을 `'데모 모음'`으로 바꾼다. 지도 글의 다음 글이 `'알파 개념'`이고 문서 종류 표시가 `'한눈에 보기'`인 테스트를 더한다.
- `helpers.ts`의 `PAGES`에 `'foundations/map/'`을 더한다.

- [ ] **Step 6: 테스트를 돌린다**

Run: `npm test && npm run check && npm run test:e2e`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src tests
git commit -m "feat: 한눈에 보기·기초·모니터링 순서로 영역 페이지 묶기"
```

---

### Task 5: 구조도(`Flow`)와 주고받기(`Sequence`) 그림

**Files:**
- Create: `src/lib/viz/flow.ts`, `src/lib/viz/sequence.ts`, `src/components/viz/Flow.astro`, `src/components/viz/Sequence.astro`
- Modify: `src/components/content/index.ts`, `scripts/lint-content/config.ts`, `scripts/lint-content/rules.ts`(`FIGURE_COMPONENTS`)
- Test: `tests/unit/viz-flow.test.ts`, `tests/unit/viz-sequence.test.ts`

**Interfaces:**
- Produces (`src/lib/viz/flow.ts`):
  ```ts
  export type FigureTone = 'accent' | 'sub' | 'warn';
  export interface FlowNode { id: string; label: string; col: number; row: number; note?: string; tone?: FigureTone }
  export interface FlowEdge { from: string; to: string; label?: string; tone?: FigureTone; both?: boolean; dashed?: boolean }
  export interface FlowGroup { label: string; cols: [number, number]; rows: [number, number] }
  export const FLOW = { cellW: 100, cellH: 72, nodeW: 84, nodeH: 40 } as const;
  export interface FlowLayout {
    width: number; height: number;
    nodes: (FlowNode & { cx: number; cy: number })[];
    edges: { x1: number; y1: number; x2: number; y2: number; lx: number; ly: number; label?: string; tone: FigureTone; both: boolean; dashed: boolean }[];
    groups: { label: string; x: number; y: number; w: number; h: number }[];
  }
  export function layoutFlow(nodes: readonly FlowNode[], edges: readonly FlowEdge[], groups?: readonly FlowGroup[]): FlowLayout
  ```
  상자 가운데는 `((col + 0.5) * cellW, (row + 0.5) * cellH)`, 그림 크기는 `((maxCol + 1) * cellW, (maxRow + 1) * cellH)`. 화살표는 두 가운데를 잇는 선을 각 상자 테두리(반폭 42, 반높이 20)에서 자른다: `t = min(hw / |dx|, hh / |dy|)`, 끝점 = 가운데 + t·(dx, dy). 글자 위치는 선 가운데. 묶음 테두리는 `x = cols[0] * cellW + 4`, `y = rows[0] * cellH + 4`, `w = (cols[1] - cols[0] + 1) * cellW - 8`, `h = (rows[1] - rows[0] + 1) * cellH - 8`. 좌표는 소수 둘째 자리로 반올림.
- Produces (`src/lib/viz/sequence.ts`):
  ```ts
  export interface SeqMessage { from: string; to: string; label: string; tone?: FigureTone; dashed?: boolean }
  export const SEQ = { width: 320, headH: 36, rowH: 44, padX: 16, footH: 12 } as const;
  export interface SeqLayout { width: number; height: number; lanes: { label: string; x: number }[]; arrows: { x1: number; x2: number; y: number; label: string; tone: FigureTone; dashed: boolean }[] }
  export function layoutSequence(participants: readonly string[], messages: readonly SeqMessage[]): SeqLayout
  ```
  참여자 x = `padX + (width - 2 * padX) * (i + 0.5) / n`, k번째 화살표 y = `headH + rowH * (k + 0.5) + 6`, 높이 = `headH + rowH * m + footH`.
- MDX 쓰임: `<Figure caption="..."><Flow ariaLabel="..." nodes={[...]} edges={[...]} groups={[...]} /></Figure>`, `<Figure><Sequence ariaLabel="..." participants={['관리 서버', '장비']} messages={[...]} /></Figure>`.

- [ ] **Step 1: 실패하는 단위 테스트를 쓴다**

```ts
// tests/unit/viz-flow.test.ts
const a = { id: 'a', label: 'A', col: 0, row: 0 };
it('가로로 이웃한 상자는 테두리끼리 잇는다', () => {
  const l = layoutFlow([a, { id: 'b', label: 'B', col: 1, row: 0 }], [{ from: 'a', to: 'b' }]);
  expect(l.edges[0]).toMatchObject({ x1: 92, y1: 36, x2: 108, y2: 36, lx: 100, ly: 36, tone: 'sub', both: false, dashed: false });
  expect([l.width, l.height]).toEqual([200, 72]);
});
it('세로로 이웃한 상자도 테두리끼리 잇는다', () => {
  expect(layoutFlow([a, { id: 'b', label: 'B', col: 0, row: 1 }], [{ from: 'a', to: 'b' }]).edges[0]).toMatchObject({ x1: 50, y1: 56, x2: 50, y2: 88 });
});
it('대각선은 먼저 닿는 테두리에서 자른다', () => {
  expect(layoutFlow([a, { id: 'b', label: 'B', col: 1, row: 1 }], [{ from: 'a', to: 'b' }]).edges[0]).toMatchObject({ x1: 77.78, y1: 56, x2: 122.22, y2: 88 });
});
it('묶음 테두리는 칸 범위를 4씩 안쪽으로 감싼다', () => {
  const l = layoutFlow([a, { id: 'b', label: 'B', col: 1, row: 0 }], [], [{ label: '서버실', cols: [0, 1], rows: [0, 0] }]);
  expect(l.groups[0]).toEqual({ label: '서버실', x: 4, y: 4, w: 192, h: 64 });
});
it('없는 상자를 이으면 오류를 낸다', () => {
  expect(() => layoutFlow([a], [{ from: 'a', to: 'z' }])).toThrow('a → z');
});
it('같은 칸에 상자가 둘이면 오류를 낸다', () => {
  expect(() => layoutFlow([a, { id: 'b', label: 'B', col: 0, row: 0 }], [])).toThrow('같은 칸');
});

// tests/unit/viz-sequence.test.ts
it('참여자를 고르게 놓고 화살표를 아래로 쌓는다', () => {
  const l = layoutSequence(['관리 서버', '장비'], [{ from: '관리 서버', to: '장비', label: 'GET' }, { from: '장비', to: '관리 서버', label: '응답' }]);
  expect(l.lanes.map((x) => x.x)).toEqual([88, 232]);
  expect(l.arrows.map((x) => [x.x1, x.x2, x.y])).toEqual([[88, 232, 64], [232, 88, 108]]);
  expect(l.height).toBe(136);
});
it('참여자 4명이면 52, 124, 196, 268에 놓는다', () => {
  expect(layoutSequence(['a', 'b', 'c', 'd'], [{ from: 'a', to: 'd', label: 'x' }]).lanes.map((x) => x.x)).toEqual([52, 124, 196, 268]);
});
it('참여자가 2~4명이 아니거나, 없는 참여자거나, 자기에게 보내면 오류를 낸다', () => {
  expect(() => layoutSequence(['a'], [])).toThrow('2~4');
  expect(() => layoutSequence(['a', 'b'], [{ from: 'a', to: 'z', label: 'x' }])).toThrow('z');
  expect(() => layoutSequence(['a', 'b'], [{ from: 'a', to: 'a', label: 'x' }])).toThrow('자기');
});
```

- [ ] **Step 2: 실패를 확인한다**

Run: `npx vitest run tests/unit/viz-flow.test.ts tests/unit/viz-sequence.test.ts`
Expected: FAIL — 모듈이 없다.

- [ ] **Step 3: `layoutFlow`와 `layoutSequence`를 구현한다**

Interfaces의 식 그대로 만든다. 오류 메시지는 `Flow: 없는 상자를 잇는 화살표예요 (a → z)`, `Flow: 같은 칸에 상자가 둘이에요 (0, 0)`, `Sequence: 참여자는 2~4명이어야 해요`, `Sequence: 없는 참여자예요 (z)`, `Sequence: 자기 자신에게 보내는 화살표는 그릴 수 없어요`.

- [ ] **Step 4: 단위 테스트를 돌린다**

Run: `npx vitest run tests/unit/viz-flow.test.ts tests/unit/viz-sequence.test.ts`
Expected: PASS.

- [ ] **Step 5: `Flow.astro`와 `Sequence.astro`를 만들고 등록한다**

- 둘 다 `<svg viewBox="0 0 {width} {height}" role="img" aria-label={ariaLabel}>` 하나로 그린다. 폭은 100%, `max-width`는 `Flow`가 `width * 1.3`px, `Sequence`가 420px. `data-flow`, `data-sequence`를 붙인다.
- 글자: 상자 이름 13, 메모·화살표 글자 11(viewBox 단위). 이름 `fill: var(--color-text)`, 메모·화살표 글자 `var(--color-text-sub)`.
- 상자: `rect`(rx 10) 클래스 `flow-node`, 바탕 `var(--color-card)`, 테두리는 tone별(`accent` → `--color-accent`, `sub` → `--color-line`, `warn` → `--color-warn`). 화살표는 `line.flow-edge`, 끝에 `marker-end`(`both`면 `marker-start`도), `dashed`면 `stroke-dasharray: 4 3`. 선 색은 `ServiceMap.astro`의 tone 규칙과 같다. 화살표 글자는 바탕색 테두리(`paint-order: stroke`)로 선 위에서도 읽히게 한다. 묶음은 `rect.flow-group`, 점선, 왼쪽 위에 이름.
- `Sequence`: 위쪽에 참여자 상자(`.seq-lane`), 아래로 점선 생명선, 화살표 `line.seq-arrow` 위 6에 글자.
- `mdxComponents`, `LINT_CONFIG.mdxComponents`, `FIGURE_COMPONENTS`에 `Flow`, `Sequence`를 더한다.

- [ ] **Step 6: 검사를 돌린다**

Run: `npm test && npm run check`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src scripts tests
git commit -m "feat: 구조도와 주고받기 그림"
```

---

### Task 6: 계층도(`Layers`)·비교(`Compare`)·SVG 그림과 그림 화면 테스트

**Files:**
- Create: `src/components/viz/Layers.astro`, `src/components/viz/Compare.astro`
- Create: `tests/fixtures/docs/foundations/figures.mdx`, `tests/fixtures/figures/sample.svg`
- Modify: `src/components/content/index.ts`, `scripts/lint-content/config.ts`, `scripts/lint-content/rules.ts`(`FIGURE_COMPONENTS`)
- Test: `tests/e2e/figures.spec.ts`, `tests/e2e/helpers.ts`, `tests/e2e/home.spec.ts`, `tests/e2e/doc-page.spec.ts`

**Interfaces:**
- Consumes: Task 5의 `FigureTone`.
- Produces:
  - `<Layers ariaLabel="..." layers={[{ label, note?, tone? }]} />` — 위에서 아래로 쌓은 `<ol aria-label data-layers>`. 층마다 `li.layer`(이름 굵게, 메모는 보조 글자색). tone은 테두리 왼쪽 띠 색.
  - `<Compare columns={['폴링', 'Trap']} rows={[{ label: '누가 먼저', values: ['관리 서버', '장비'] }]} />` — `data-compare`. 위에 두 열 제목, 행마다 작은 행 이름과 나란한 두 칸. `values`가 두 개가 아니면 `Compare: 값은 두 개여야 해요 (누가 먼저)` 오류.
  - SVG 그림 쓰는 법: 실제 글은 `src/assets/figures/{domain}/{name}.svg`에 두고 MDX에서 default import. 색은 `fill`/`stroke`에 `currentColor`나 `var(--color-…)`만 쓴다.

- [ ] **Step 1: 그림 모음 테스트 글을 만든다**

`figures.mdx`: `title: 그림 모음`, `summary: 테스트용 기초 글이에요. 새 그림을 모두 담았어요.`, `type: concept`, `stage: basics`, `order: 2`, `updated: 2026-09-15`. 본문: `KeyPoints`(Point 1개) → `<Analogy limit="테스트용 한계 문장이에요.">테스트용 비유 문장이에요.</Analogy>` → `## 그림들` → 아래 다섯 개를 각각 `<Figure caption="...">`로 감싼다.
- `Flow` ariaLabel `서버 둘이 스위치 하나에 꽂힌 구조도`: 상자 `sw`(스위치, 1,0, accent), `s1`(서버 1, 0,1), `s2`(서버 2, 2,1). 화살표 `s1→sw`, `s2→sw`(label `1Gbps`). 묶음 `{ label: '랙', cols: [0, 2], rows: [0, 1] }`.
- `Sequence` ariaLabel `관리 서버가 묻고 장비가 답하는 순서`: 참여자 `['관리 서버', '장비']`, 메시지 `GET` → `응답`(dashed).
- `Layers` ariaLabel `세 층으로 쌓인 계층도`: `응용`, `전송`(note `TCP`, tone accent), `네트워크`.
- `Compare` columns `['폴링', 'Trap']`, 행 2개.
- `import Sample from '../../figures/sample.svg';` → `<Sample aria-label="테스트용 SVG 그림" />`. `sample.svg`는 `viewBox="0 0 100 40"`의 `rect`와 `text` 하나, `fill="currentColor"`.

- [ ] **Step 2: 실패하는 화면 테스트를 쓴다**

```ts
// tests/e2e/figures.spec.ts
test.beforeEach(async ({ page }) => { await page.goto('foundations/figures/'); });

test('비유 블록은 비유와 안 맞는 곳을 보여 준다', async ({ page }) => {
  const block = page.locator('[data-block="analogy"]');
  await expect(block.getByRole('heading', { name: '비유하면' })).toBeVisible();
  await expect(block).toContainText('비유가 안 맞는 곳');
  await expect(block).toContainText('테스트용 한계 문장이에요.');
});
test('구조도는 상자·화살표·묶음을 그린다', async ({ page }) => {
  const flow = page.getByRole('img', { name: '서버 둘이 스위치 하나에 꽂힌 구조도' });
  await expect(flow.locator('.flow-node')).toHaveCount(3);
  await expect(flow.locator('.flow-edge')).toHaveCount(2);
  await expect(flow.locator('.flow-edge').first()).toHaveAttribute('marker-end', /url\(#/);
  await expect(flow.locator('.flow-group')).toHaveCount(1);
  await expect(flow).toContainText('1Gbps');
});
test('주고받기는 참여자와 화살표를 순서대로 그린다', async ({ page }) => {
  const seq = page.getByRole('img', { name: '관리 서버가 묻고 장비가 답하는 순서' });
  await expect(seq.locator('.seq-lane')).toHaveCount(2);
  await expect(seq.locator('.seq-arrow')).toHaveCount(2);
});
test('계층도와 비교는 글자를 순서대로 보여 준다', async ({ page }) => {
  await expect(page.locator('[data-layers] .layer-label')).toHaveText(['응용', '전송', '네트워크']);
  await expect(page.locator('[data-compare] [data-compare-head]')).toHaveText(['폴링', 'Trap']);
});
test('SVG 그림은 이름 붙은 그림이다', async ({ page }) => {
  await expect(page.getByRole('img', { name: '테스트용 SVG 그림' })).toBeVisible();
});
test('다크 모드에서도 그림 글자가 본문 색이다 (Review Focus 4)', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  const fill = await page.locator('[data-flow] .flow-label').first().evaluate((el) => getComputedStyle(el).fill);
  expect(fill).toBe('rgb(232, 233, 236)');
});
```

`helpers.ts`의 `PAGES`에 `'foundations/figures/'`를 더한다(360px 가로 넘침 검사). `home.spec.ts`의 영역 줄 글 수를 `'6편'`으로, 기초 카드 기대값을 `['알파 개념', '그림 모음']`으로, `doc-page.spec.ts:54`의 알파 다음 글을 `'그림 모음'`으로 바꾼다.

- [ ] **Step 3: 실패를 확인한다**

Run: `npx playwright test tests/e2e/figures.spec.ts --project=desktop`
Expected: FAIL — 빌드에서 `Layers`·`Compare`가 없다.

- [ ] **Step 4: `Layers.astro`와 `Compare.astro`를 만들고 등록한다**

Interfaces대로 만든다. `mdxComponents`, `LINT_CONFIG.mdxComponents`, `FIGURE_COMPONENTS`에 더한다.

- [ ] **Step 5: 화면 테스트를 모두 돌린다**

Run: `npm test && npm run check && npm run test:e2e`
Expected: PASS(데스크톱·모바일 모두).

- [ ] **Step 6: Commit**

```bash
git add src scripts tests
git commit -m "feat: 계층도·비교·SVG 그림과 그림 화면 테스트"
```

---

### Task 7: 용어 데이터와 검사

**Files:**
- Modify: `src/content.config.ts`
- Create: `src/lib/glossary.ts`, `scripts/lint-content/glossary.ts`
- Modify: `scripts/lint-content/index.ts`, `scripts/lint-content/rules.ts`, `src/lib/mdx/analyze.ts`, `src/lib/content.ts`, `playwright.config.ts`
- Create: `tests/fixtures/terms/foundations.yaml`, `tests/fixtures/lint/terms-bad/foundations.yaml`
- Test: `tests/unit/glossary.test.ts`, `tests/unit/lint/glossary.test.ts`, `tests/unit/lint/rules.test.ts`, `tests/unit/mdx/analyze.test.ts`

**Interfaces:**
- 파일 형식(`{domain}.yaml`, 파일 이름이 영역 id):
  ```yaml
  terms:
    - id: snmp                      # 필수, 소문자·숫자·하이픈
      name: SNMP                    # 필수, 30자 이하
      en: Simple Network Management Protocol   # 선택
      aliases: [에스엔엠피]           # 선택
      short: 장비의 상태를 묻고 답하는 표준 규약이에요.   # 필수, 60자 이하, 해요체
      analogy: 관리 서버가 장비마다 놓인 문진표를 돌며 읽는 것과 같아요.   # 선택, 해요체
      doc: network/snmp             # 선택, 공개 글
  ```
- 컬렉션: `glossary = defineCollection({ loader: glob({ pattern: '*.yaml', base: process.env.TERMS_CONTENT_DIR ?? './src/content/terms' }), schema: z.object({ terms: z.array(termSchema).min(1) }) })`.
- Produces (`src/lib/glossary.ts`, astro 의존 없음):
  ```ts
  export interface RawTerm { id: string; name: string; en?: string; aliases?: string[]; short: string; analogy?: string; doc?: string }
  export interface GlossaryTerm extends Omit<RawTerm, 'aliases'> { key: string /* 'network/snmp' */; domain: string; aliases: string[] }
  export function flattenGlossary(files: readonly { domain: string; terms: readonly RawTerm[] }[]): GlossaryTerm[]
  export function sortTerms<T extends Pick<GlossaryTerm, 'name'>>(terms: readonly T[]): T[] // 한글로 시작하는 이름(ko 정렬) → 나머지(en, 대소문자 무시)
  export function termAnchor(id: string): string // `term-${id}`
  ```
- Produces (`src/lib/content.ts`): `getGlossary(): Promise<GlossaryTerm[]>`. `assertReferences`가 `<Term term>`이 있는 용어인지, 용어의 `doc`이 공개 글인지도 확인한다.
- Produces (`src/lib/mdx/analyze.ts`): `BodyAnalysis.glossaryKeys: string[]`(본문의 `<Term term>` 값, 등장 순, 중복 없음). `termSlugs`는 지금처럼 글만 담는다.
- Produces (검사기): `LintContext.terms: Map<string, { key: string; doc?: string }>`. 새 `RuleId` `'glossary'`. `lintGlossaryFile(file: { file: string; domain: string; source: string }, ctx: LintContext): LintIssue[]`. `rules.ts`는 `lintProseText(text: string): { rule: RuleId; message: string }[]`를 내보내 용어 글에도 문장 규칙(길이·해요체·금지 표현)을 쓴다.
- `<Term>`은 `slug`와 `term` 중 정확히 하나를 가진다.

- [ ] **Step 1: 실패하는 단위 테스트를 쓴다**

```ts
// tests/unit/glossary.test.ts
it('영역과 id로 키를 만들고 aliases 기본값은 빈 배열이다', () => {
  expect(flattenGlossary([{ domain: 'network', terms: [{ id: 'snmp', name: 'SNMP', short: '규약이에요.' }] }])[0]).toMatchObject({ key: 'network/snmp', domain: 'network', aliases: [] });
});
it('한글 이름을 가나다순으로 먼저, 나머지를 ABC순으로 줄 세운다', () => {
  const names = ['SNMP', '스위치', 'icmp', '인터페이스', '가상 LAN'].map((name) => ({ name }));
  expect(sortTerms(names).map((t) => t.name)).toEqual(['가상 LAN', '스위치', '인터페이스', 'icmp', 'SNMP']);
});
it('용어 사전 안 위치 이름을 만든다', () => { expect(termAnchor('snmp')).toBe('term-snmp'); });

// tests/unit/lint/glossary.test.ts — ctx.docs에 foundations/test(공개)와 foundations/secret(초안)
it('올바른 용어 파일은 위반이 없다', ...);
it('YAML 문법 오류는 몇째 줄인지 알려 준다 (Review Focus 5)', () => {
  const issues = lintGlossaryFile({ file: 'f.yaml', domain: 'foundations', source: 'terms:\n  - id: a\n    name: [깨짐\n' }, ctx);
  expect(issues[0]).toMatchObject({ rule: 'glossary', line: 3 });
});
it('필수 필드가 없거나 형식이 틀리면 그 용어의 줄을 알려 준다', ...); // id: Bad_Id, short 없음 → 'glossary', 해당 줄
it('같은 id가 두 번 나오면 잡는다', ...);           // 'glossary'
it('영역 id가 아닌 파일 이름을 잡는다', ...);       // domain 'infra' → 'glossary'
it('short가 60자를 넘으면 잡는다', ...);            // 'glossary'
it('short와 analogy에 문장 규칙을 쓴다', ...);      // '입니다.'로 끝남 → 'formal-ending'
it('doc이 없는 글이거나 초안이면 잡는다', ...);     // 'reference'

// tests/unit/lint/rules.test.ts — ctx.terms에 foundations/alpha
it('Term term은 있는 용어를 가리켜야 한다', ...);   // term="foundations/nope" → 'reference'
it('Term에 slug와 term을 함께 쓰거나 둘 다 없으면 잡는다', ...); // 'reference'

// tests/unit/mdx/analyze.test.ts
it('Term term은 glossaryKeys로, Term slug는 termSlugs로 모은다', ...);
```

`...`로 적은 테스트는 바로 위 테스트처럼 실제 YAML·MDX 문자열을 넣어 `rule`과 `line`을 확인한다.

- [ ] **Step 2: 실패를 확인한다**

Run: `npx vitest run tests/unit/glossary.test.ts tests/unit/lint tests/unit/mdx/analyze.test.ts`
Expected: FAIL.

- [ ] **Step 3: `src/lib/glossary.ts`를 구현한다**

`sortTerms`: 첫 글자가 한글 음절(`/^[가-힣]/`)인 이름을 `localeCompare(b, 'ko')`로, 나머지를 `localeCompare(b, 'en', { sensitivity: 'base' })`로 정렬해 이어 붙인다.

- [ ] **Step 4: 용어 검사기를 구현한다**

`scripts/lint-content/glossary.ts`: `yaml`의 `parseDocument(source, { lineCounter })`로 읽고, 문법 오류는 `doc.errors[0].linePos[0].line`, 용어별 위반은 그 용어 노드 `range[0]`의 `lineCounter.linePos(...).line`으로 줄을 단다. `index.ts`는 `TERMS_CONTENT_DIR ?? 'src/content/terms'`의 `*.yaml`을 읽어 먼저 `ctx.terms`를 채우고(폴더가 없으면 용어 없음), 글 검사 뒤 용어 파일을 검사한다. 마지막 줄은 `글 N편, 용어 파일 M개 검사, 위반 K건`.

- [ ] **Step 5: 스키마, 분석, 참조 확인을 잇는다**

`content.config.ts`에 `glossary` 컬렉션을 더하고(`termSchema`는 Interfaces의 필드·길이 그대로), `analyze.ts`에 `glossaryKeys`, `content.ts`에 `getGlossary()`와 `assertReferences` 확장을 넣는다. `playwright.config.ts`의 `webServer.env`에 `TERMS_CONTENT_DIR: './tests/fixtures/terms'`를 더한다.

- [ ] **Step 6: 테스트용 용어 파일을 만든다**

`tests/fixtures/terms/foundations.yaml`: `alpha`(name `알파`, short `테스트용 알파 용어예요.`, doc `foundations/alpha`), `snmp`(name `SNMP`, en `Simple Network Management Protocol`, short `장비의 상태를 묻고 답하는 표준 규약이에요.`, analogy `관리 서버가 장비마다 놓인 문진표를 돌며 읽는 것과 같아요.`), `switch`(name `스위치`, short `같은 네트워크 안에서 데이터를 넘겨 주는 장비예요.`), `icmp`(name `ICMP`, short `장비가 살아 있는지 확인할 때 쓰는 규약이에요.`). `tests/fixtures/lint/terms-bad/foundations.yaml`은 해요체가 아닌 short 하나를 담는다.

- [ ] **Step 7: 테스트를 돌린다**

Run: `npm test && npm run check && npm run lint:content`
Expected: PASS, 위반 0건(실제 용어 파일은 아직 없다).

- [ ] **Step 8: Commit**

```bash
git add src scripts tests playwright.config.ts
git commit -m "feat: 용어 데이터와 용어 검사"
```

---

### Task 8: 용어 미리보기 시트와 용어 사전 페이지

**Files:**
- Modify: `src/components/content/Term.astro`, `src/components/doc/TermSheet.astro`, `src/scripts/term-sheet.ts`, `src/lib/content.ts`, `src/lib/paths.ts`, `src/layouts/DocLayout.astro`, `src/pages/[domain]/index.astro`
- Create: `src/pages/terms/[domain].astro`
- Modify: `tests/fixtures/docs/foundations/beta.mdx`
- Test: `tests/unit/paths.test.ts`, `tests/e2e/glossary.spec.ts`, `tests/e2e/helpers.ts`

**Interfaces:**
- Consumes: Task 7의 `getGlossary`, `GlossaryTerm`, `sortTerms`, `termAnchor`, `BodyAnalysis.glossaryKeys`.
- Produces:
  - `glossaryPath(domain: string): string` → `withBase(\`terms/${domain}/\`)`.
  - `<Term slug="…">`는 지금 그대로다. `<Term term="network/snmp">`는 `href = glossaryPath('network') + '#term-snmp'`, `data-term="term:network/snmp"`.
  - `TermPreview`에 `en?: string`, `analogy?: string`, `linkLabel: string`을 더한다. 글은 `linkLabel: '전체 보기'`. 용어는 `title = name`, `summary = short`, `points = []`, `meta = '{영역 이름} · 용어'`, `doc`이 있으면 `url = docPath(doc)`와 `'전체 보기'`, 없으면 `url = 용어 사전의 그 위치`와 `'용어 사전에서 보기'`.
  - `getTermPreviews(slugs: readonly string[], glossaryKeys: readonly string[] = [])` — 결과의 키는 글이면 `slug`, 용어면 `term:{key}`.
  - 용어 사전 페이지 `/terms/{domain}/`: 용어가 있는 영역만 만든다. 제목 `{영역 이름} 용어 사전`, 뒤로 가기는 영역 페이지(영역 페이지가 없으면 홈). 용어마다 `<section id="term-{id}" data-term-entry>`에 이름(h2), 영어 원말, 한 줄 뜻, `비유:` 줄, 글이 있으면 `자세히 보기` 링크. `sortTerms` 순서. 본문은 `data-pagefind-body`.
  - 영역 페이지: 용어가 있으면 맨 아래 카드 `더 알아보기`에 줄 하나(아이콘 `book-open`, 제목 `용어 사전`, 설명 `용어 {N}개를 한 줄 뜻과 비유로 모았어요.`).

- [ ] **Step 1: 실패하는 테스트를 쓴다**

`tests/unit/paths.test.ts`: `glossaryPath('network')`가 base 아래 `terms/network/`로 끝나는지.

`beta.mdx`의 Point 하나에 문장 `<Term slug="foundations/alpha">알파 개념</Term>과 <Term term="foundations/alpha">알파 용어</Term>, <Term term="foundations/snmp">SNMP</Term>를 함께 봐요.`를 더한다.

```ts
// tests/e2e/glossary.spec.ts
test.describe('용어 미리보기', () => {
  test.beforeEach(async ({ page }) => { await page.goto('foundations/beta/'); });
  test('용어를 누르면 이름·영어·뜻·비유가 나온다', async ({ page }) => {
    await page.locator('a.term[data-term="term:foundations/snmp"]').click();
    const sheet = page.locator('#term-sheet');
    await expect(sheet.locator('[data-term-meta]')).toHaveText('모니터링 기초 · 용어');
    await expect(sheet.locator('[data-term-title]')).toHaveText('SNMP');
    await expect(sheet.locator('[data-term-en]')).toHaveText('Simple Network Management Protocol');
    await expect(sheet.locator('[data-term-summary]')).toHaveText('장비의 상태를 묻고 답하는 표준 규약이에요.');
    await expect(sheet.locator('[data-term-analogy]')).toHaveText('관리 서버가 장비마다 놓인 문진표를 돌며 읽는 것과 같아요.');
    await expect(sheet.locator('[data-term-points-wrap]')).toBeHidden();
  });
  test('글이 없는 용어는 용어 사전의 그 위치로 간다 (Review Focus 3)', async ({ page }) => {
    await page.locator('a.term[data-term="term:foundations/snmp"]').click();
    await page.locator('#term-sheet').getByRole('link', { name: '용어 사전에서 보기' }).click();
    await expect(page).toHaveURL(/terms\/foundations\/#term-snmp$/);
  });
  test('같은 키의 글과 용어는 각자 맞는 시트를 연다 (Review Focus 2)', async ({ page }) => {
    await page.locator('a.term[data-term="foundations/alpha"]').click();
    await expect(page.locator('#term-sheet [data-term-meta]')).toHaveText('모니터링 기초 · 개념');
    await page.keyboard.press('Escape');
    await page.locator('a.term[data-term="term:foundations/alpha"]').click();
    await expect(page.locator('#term-sheet [data-term-meta]')).toHaveText('모니터링 기초 · 용어');
    await page.locator('#term-sheet').getByRole('link', { name: '전체 보기' }).click();
    await expect(page).toHaveURL(/foundations\/alpha\/$/);
  });
});

test.describe('자바스크립트 없이', () => {
  test.use({ javaScriptEnabled: false });
  test('용어 링크는 용어 사전의 그 위치로 간다 (Review Focus 3)', async ({ page }) => {
    await page.goto('foundations/beta/');
    await page.locator('a.term[data-term="term:foundations/snmp"]').click();
    await expect(page).toHaveURL(/terms\/foundations\/#term-snmp$/);
  });
});

test('용어 사전은 가나다 다음 ABC 순이고, 글이 있으면 자세히 보기로 잇는다', async ({ page }) => {
  await page.goto('terms/foundations/');
  await expect(page.locator('h1')).toHaveText('모니터링 기초 용어 사전');
  await expect(page.locator('[data-term-entry] h2')).toHaveText(['스위치', '알파', 'ICMP', 'SNMP']);
  await expect(page.locator('#term-alpha').getByRole('link', { name: '자세히 보기' })).toHaveAttribute('href', '/DomainDocs/foundations/alpha/');
});

test('용어 사전도 검색된다', async ({ page }) => {
  await page.goto('./');
  await page.getByRole('button', { name: '검색' }).click();
  await page.getByRole('searchbox', { name: '검색어' }).fill('문진표');
  await expect(page.locator('[data-search-result]').first()).toContainText('용어 사전');
});

test('영역 페이지에 용어 사전 줄이 있다', async ({ page }) => {
  await page.goto('foundations/');
  await expect(page.getByRole('link', { name: /용어 사전/ })).toHaveAttribute('href', '/DomainDocs/terms/foundations/');
});
```

`helpers.ts`의 `PAGES`에 `'terms/foundations/'`를 더한다.

- [ ] **Step 2: 실패를 확인한다**

Run: `npx vitest run tests/unit/paths.test.ts && npx playwright test tests/e2e/glossary.spec.ts --project=desktop`
Expected: FAIL.

- [ ] **Step 3: 경로, `Term`, 미리보기 데이터를 구현한다**

`paths.ts`에 `glossaryPath`, `Term.astro`는 Interfaces대로(둘 다 있거나 둘 다 없으면 오류), `content.ts`의 `TermPreview`·`getTermPreviews`를 넓히고, `DocLayout.astro`가 `analysis.glossaryKeys`를 넘긴다.

- [ ] **Step 4: 시트를 넓힌다**

`TermSheet.astro`에 제목 아래 `<p data-term-en>`, 요약 아래 `<div data-term-analogy-wrap><h3 class="sheet-subtitle">비유</h3><p data-term-analogy></p></div>`를 더한다. `term-sheet.ts`는 값이 없으면 `data-term-en`과 `data-term-analogy-wrap`을 숨기고, 버튼 글자를 `preview.linkLabel`로 바꾼다.

- [ ] **Step 5: 용어 사전 페이지와 영역 페이지 줄을 만든다**

Interfaces대로 만든다. 스타일은 기존 `Card`·`ListRow`·`.prose`를 쓴다.

- [ ] **Step 6: 테스트를 모두 돌린다**

Run: `npm test && npm run check && npm run test:e2e`
Expected: PASS(데스크톱·모바일).

- [ ] **Step 7: Commit**

```bash
git add src tests
git commit -m "feat: 용어 미리보기 시트와 용어 사전 페이지"
```

---

### Task 9: 작업 규칙과 글쓰기 가이드 고치기

**Files:**
- Modify: `CLAUDE.md`, `docs/writing-guide.md`, `README.md`(분량 규칙이나 영역 4개를 적은 곳이 있으면)

**Interfaces:**
- Consumes: Task 1~8의 컴포넌트 이름·속성·검사 규칙·용어 파일 형식.

- [ ] **Step 1: `CLAUDE.md`를 고친다**

- 사실 검토 줄을 이렇게 바꾼다: `새 글은 틀리면 위험한 주장(숫자, 기본값, 버전마다 다른 동작, 명령어·질의, 표준의 정의)만 따로 확인하고, 확인한 주장과 근거를 docs/reviews/에 몇 줄로 남겨요(서브 에이전트는 쓰지 않아요).`
- `글(src/content/docs/**)을 쓰거나 고치기 전에` 줄에 용어 파일(`src/content/terms/**`)도 더한다.
- 설계 줄에 `docs/superpowers/specs/2026-10-21-domain-basics-and-quiz-design.md`를 더한다.

- [ ] **Step 2: `docs/writing-guide.md`를 고친다**

- 1장 목적: "도메인 기초가 먼저, 모니터링 관점은 그 위에"와 "처음 보는 사람 기준" 두 문단을 더한다.
- 3장: 개념 글 뼈대를 `KeyPoints` → `Analogy` → `##` 본문(`Figure`) → `## 모니터링에서는`(`OnDashboard`) → `Checkpoints` → `Deeper`로 바꾸고 `stage` 설명을 더한다. 블록 분량 표에서 `Point` 5문장 기준을 지우고 "기초 글의 Point는 결론만 짧게, 설명은 본문에"로 바꾼다.
- 새 절 "한눈에 보기 글 뼈대": `Figure` 1개 이상, `##` 1개 이상, `KeyPoints` 없음.
- 5장 컴포넌트 표: `Analogy`, `Figure`, `Flow`, `Sequence`, `Layers`, `Compare`, SVG 그림(경로·색·`aria-label`), `Term`의 `term` 속성. `Flow`는 "한 줄에 3칸까지가 360px에서 읽혀요", 상자 이름은 8자 안팎.
- 6장 검사 표: `body-length` 행을 지우고, `structure` 행을 새 규칙으로, `analogy-limit`·`glossary` 행을 더한다.
- 8장 작성 절차: 설계 7.1의 가벼운 절차로 바꾼다(초안 → 위험한 주장 확인 → 가독성 자가 점검 → 공개, 한 편씩).
- 9장 검토 기록 형식: `확인한 주장 | 근거 URL` 몇 줄로 줄인다.
- 새 10장 "용어 쓰는 법": 파일 위치와 형식(Task 7), `short`는 60자 이하 해요체, 비유는 한 줄, 글에서 처음 나올 때 `<Term term>`으로 잇는다.

- [ ] **Step 3: 검사를 돌린다**

Run: `npm run lint:content && npm test`
Expected: PASS, 위반 0건(`config.ts` 값과 가이드 표가 맞는지 눈으로 대조한다).

- [ ] **Step 4: Commit**

```bash
git add CLAUDE.md docs/writing-guide.md README.md
git commit -m "docs: 기초 글 틀과 가벼운 작성 절차로 규칙 고치기"
```

---

### Task 10: 전체 확인과 화면 점검

**Files:** 없음(문제가 나오면 해당 태스크의 파일)

- [ ] **Step 1: 모든 검사를 돌린다**

Run: `npm run lint:content && npm run check && npm test && npm run build && npm run test:e2e`
Expected: 모두 PASS. 글 검사 `글 40편, 용어 파일 0개 검사, 위반 0건`.

- [ ] **Step 2: 그림과 용어 화면을 눈으로 본다**

테스트 글로 빌드한 사이트(`DOCS_CONTENT_DIR=./tests/fixtures/docs TERMS_CONTENT_DIR=./tests/fixtures/terms npm run build && node scripts/serve-dist.mjs 4329`)에서 `foundations/figures/`, `foundations/map/`, `terms/foundations/`, `foundations/`를 360px·1440px, 라이트·다크로 캡처해 직접 본다. 글자가 잘리거나 겹치는 그림, 다크 모드에서 안 보이는 선이 있으면 고치고 Step 1부터 다시 돈다.

- [ ] **Step 3: 실제 사이트도 그대로인지 본다**

실제 글로 빌드(`npm run build && node scripts/serve-dist.mjs 4329`)해서 홈(영역 8개), `database/`, `foundations/percentiles/`를 360px에서 캡처해 기존 화면과 달라진 곳이 영역 목록과 카드 제목뿐인지 본다. 서버는 끝나면 끈다.

- [ ] **Step 4: 사이트 주인에게 알린다**

push는 하지 않는다. 바뀐 점(영역 8개, 영역 페이지 묶음, 새 그림, 용어 사전)을 알리고, 이어서 DB 첫 글(한눈에 보기 + 기초 2편 + 용어)로 넘어간다.
