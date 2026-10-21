import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { LINT_CONFIG } from '../../../scripts/lint-content/config';
import { lintSource, type DocMeta, type LintContext, type RuleId } from '../../../scripts/lint-content/rules';

const FRONT = (extra = '', type = 'concept', domain = 'foundations', stage: string | null = type === 'concept' ? 'monitoring' : null) => `---
title: 테스트 글
summary: 검사 규칙을 확인하려고 만든 글이에요.
domain: ${domain}
type: ${type}
${stage === null ? '' : `stage: ${stage}\n`}order: 1
sources:
  - title: 예시 출처
    url: https://example.com/
updated: 2026-10-13
${extra}---
`;

const CONCEPT_BODY = `
<OnDashboard title="응답시간">
  <StatTile label="p99" value="1.2" unit="초" />
</OnDashboard>

<KeyPoints>
  <Point title="첫 번째 핵심">
    응답은 1~2초 사이예요. <Term slug="foundations/other">다른 개념</Term>과 함께 봐요.
  </Point>
</KeyPoints>

<Checkpoints>
  <Check>평균만 보고 있다면 다시 확인하세요.</Check>
</Checkpoints>
`;

const GUIDE_BODY = `
<Situation>
  두 화면의 숫자가 달라요.
</Situation>

<FirstLook>
  <Item title="집계 구간">한 점이 몇 초인지 봐요.</Item>
</FirstLook>

## 1. 구간을 맞춰 보세요

<Term slug="foundations/other">다른 개념</Term>을 떠올려요.

<Checkpoints>
  <Check>계산식이 다르다면 문서로 남기세요.</Check>
</Checkpoints>
`;

const BASICS_BODY = `
<KeyPoints>
  <Point title="스위치는 같은 네트워크 안을 이어요">
    스위치는 같은 네트워크 안에서 데이터를 넘겨요.
  </Point>
</KeyPoints>

<Analogy limit="실제 스위치는 주소를 스스로 배워요.">
  스위치는 아파트 우편함 분류실과 비슷해요.
</Analogy>

## 어떻게 동작하나요

스위치는 받은 데이터의 목적지 주소를 봐요.

<Figure caption="서버 둘이 스위치에 꽂힌 모습이에요.">
  <StatTile label="포트" value="24" unit="개" />
</Figure>

<Checkpoints>
  <Check>포트 수만 보고 있다면 다시 확인하세요.</Check>
</Checkpoints>
`;

const DOCS: DocMeta[] = [
  { id: 'foundations/test', type: 'concept', draft: false },
  { id: 'foundations/other', type: 'concept', draft: false },
  { id: 'foundations/secret', type: 'concept', draft: true },
];
const ctx: LintContext = { docs: new Map(DOCS.map((d) => [d.id, d])) };
const lint = (source: string, id = 'foundations/test') => lintSource({ file: `${id}.mdx`, id, source }, ctx);
const rules = (source: string, id?: string): RuleId[] => lint(source, id).map((i) => i.rule);

describe('통과 사례', () => {
  it('올바른 개념 글은 위반이 없다', () => {
    expect(lint(FRONT() + CONCEPT_BODY)).toEqual([]);
  });
  it('올바른 가이드 글은 위반이 없다', () => {
    expect(lint(FRONT('', 'guide') + GUIDE_BODY)).toEqual([]);
  });
  it('CRLF 줄바꿈도 위반이 없다', () => {
    expect(lint((FRONT() + CONCEPT_BODY).replace(/\n/g, '\r\n'))).toEqual([]);
  });
  it('import한 데모는 최상위 어디에 둬도 된다', () => {
    const body = CONCEPT_BODY.replace('<Checkpoints>', "<PercentileDemo client:visible />\n\n<Checkpoints>");
    expect(lint(`${FRONT()}import PercentileDemo from '../../../components/demos/PercentileDemo.tsx';\n${body}`)).toEqual([]);
  });
  it('Deeper 안에서는 금지 표현을 허용한다', () => {
    expect(lint(`${FRONT() + CONCEPT_BODY}\n<Deeper>\n  모든 버전을 보장하지 않아요.\n</Deeper>\n`)).toEqual([]);
  });
  it('초안 글은 초안을 가리켜도 된다', () => {
    const body = CONCEPT_BODY.replace('foundations/other', 'foundations/secret');
    expect(lint(FRONT('draft: true\n') + body)).toEqual([]);
  });
});

describe('문장 규칙', () => {
  it('합쇼체 끝맺음을 잡는다', () => {
    expect(rules(FRONT() + CONCEPT_BODY.replace('사이예요.', '사이입니다.'))).toEqual(['formal-ending']);
  });
  it('해라체 끝맺음도 잡는다', () => {
    const issues = lint(FRONT() + CONCEPT_BODY.replace('응답은 1~2초 사이예요.', '평균은 느린 요청을 숨긴다.'));
    expect(issues.map((i) => i.rule)).toEqual(['formal-ending']);
    expect(issues[0].message).toBe('해요체(~요)로 끝내 주세요: "평균은 느린 요청을 숨긴다."');
    expect(rules(FRONT() + CONCEPT_BODY.replace('다시 확인하세요.', '다시 확인한다'))).toEqual(['formal-ending']);
  });
  it('~요, ~죠로 끝나면 문장 부호와 닫는 따옴표가 붙어도 통과한다', () => {
    const body = CONCEPT_BODY.replace('응답은 1~2초 사이예요.', '"그래요."라고 해요. 그렇죠?').replace('다시 확인하세요.', '다시 봐요!');
    expect(lint(FRONT() + body)).toEqual([]);
  });
  it('80자를 넘는 문장을 잡는다', () => {
    const long = `${'가'.repeat(80)}예요.`;
    expect(rules(FRONT() + CONCEPT_BODY.replace('응답은 1~2초 사이예요.', long))).toEqual(['sentence-length']);
  });
  it('한 단락에 문장이 4개면 잡는다', () => {
    const para = '하나예요. 둘이에요. 셋이에요. 넷이에요.';
    expect(rules(FRONT() + CONCEPT_BODY.replace('응답은 1~2초 사이예요.', para))).toEqual(['paragraph-length']);
  });
  it('본문의 금지 표현을 잡는다', () => {
    expect(rules(FRONT() + CONCEPT_BODY.replace('사이예요.', '사이라고 단정하지 않아요.'))).toEqual(['banned-phrase']);
  });
});

describe('틀 규칙', () => {
  it('최상위에 둘 수 없는 컴포넌트를 잡는다', () => {
    expect(rules(`${FRONT()}${CONCEPT_BODY}\n<Point title="밖">밖이에요.</Point>\n`)).toEqual(['structure']);
  });
  it('Point가 4개면 잡는다', () => {
    const point = '  <Point title="추가">추가예요.</Point>\n';
    const body = CONCEPT_BODY.replace('</KeyPoints>', `${point}${point}${point}</KeyPoints>`);
    expect(rules(FRONT() + body)).toEqual(['block-children']);
  });
  it('KeyPoints 안의 맨 글자를 잡는다', () => {
    expect(rules(FRONT() + CONCEPT_BODY.replace('</KeyPoints>', '  맨 글자예요.\n</KeyPoints>'))).toEqual(['block-children']);
  });
  it('Point 제목이 없거나 30자를 넘으면 잡는다', () => {
    expect(rules(FRONT() + CONCEPT_BODY.replace(' title="첫 번째 핵심"', ''))).toEqual(['block-title']);
    expect(rules(FRONT() + CONCEPT_BODY.replace('첫 번째 핵심', '가'.repeat(31)))).toEqual(['block-title']);
  });
  it('가이드에 ## 소제목이 없으면 잡는다', () => {
    expect(rules(FRONT('', 'guide') + GUIDE_BODY.replace('## 1. 구간을 맞춰 보세요\n', ''))).toEqual(['structure']);
  });
  it('가이드에 KeyPoints를 쓰면 잡는다', () => {
    const body = GUIDE_BODY.replace('## 1.', '<KeyPoints>\n  <Point title="x">x예요.</Point>\n</KeyPoints>\n\n## 1.');
    expect(rules(FRONT('', 'guide') + body)).toEqual(['structure']);
  });
});

describe('새 틀 규칙', () => {
  const BASICS = FRONT('', 'concept', 'foundations', 'basics');
  const OVERVIEW_BODY = BASICS_BODY.replace(/<KeyPoints>[\s\S]*?<\/KeyPoints>/, '');
  const SVG_IMPORT = "import SwitchFigure from '../../../assets/figures/foundations/switch.svg';\n";
  const TILE = '<StatTile label="포트" value="24" unit="개" />';

  it('기초 글 틀은 통과한다', () => {
    expect(lint(BASICS + BASICS_BODY)).toEqual([]);
  });
  it('기존 틀(OnDashboard → KeyPoints → Checkpoints → Deeper)도 통과한다', () => {
    expect(lint(`${FRONT() + CONCEPT_BODY}\n<Deeper>\n  더 깊은 이야기예요.\n</Deeper>\n`)).toEqual([]);
  });
  it('본문이 길어도 분량 위반이 없다', () => {
    const long = '응답시간은 요청 하나를 끝내는 데 걸린 시간이에요.\n\n'.repeat(80);
    expect(rules(BASICS + BASICS_BODY.replace('## 어떻게 동작하나요', `## 어떻게 동작하나요\n\n${long}`))).toEqual([]);
  });
  it('KeyPoints가 없으면 잡는다', () => {
    expect(rules(BASICS + OVERVIEW_BODY)).toEqual(['structure']);
  });
  it('Checkpoints 뒤에 단락이 오면 잡는다', () => {
    expect(rules(`${BASICS + BASICS_BODY}\n뒤에 붙은 단락이에요.\n`)).toEqual(['structure']);
  });
  it('Deeper가 맨 끝이 아니면 잡는다', () => {
    expect(rules(BASICS + BASICS_BODY.replace('<Checkpoints>', '<Deeper>\n  더 깊은 이야기예요.\n</Deeper>\n\n<Checkpoints>'))).toEqual(['structure']);
  });
  it('Analogy를 두 번 쓰면 잡는다', () => {
    const analogy = BASICS_BODY.match(/<Analogy[\s\S]*?<\/Analogy>/)![0];
    expect(rules(BASICS + BASICS_BODY.replace('## 어떻게', `${analogy}\n\n## 어떻게`))).toEqual(['structure']);
  });
  it('기초 글에 ## 소제목이 없으면 잡는다', () => {
    expect(rules(BASICS + BASICS_BODY.replace('## 어떻게 동작하나요\n', ''))).toEqual(['structure']);
  });
  it('# 소제목을 잡는다', () => {
    expect(rules(BASICS + BASICS_BODY.replace('## 어떻게', '# 어떻게'))).toContain('structure');
  });
  it('그림 컴포넌트를 Figure 밖 최상위에 두면 잡는다', () => {
    expect(rules(BASICS + BASICS_BODY.replace('<Checkpoints>', `${TILE}\n\n<Checkpoints>`))).toEqual(['structure']);
  });
  it('Analogy에 limit이 없으면 잡는다', () => {
    expect(rules(BASICS + BASICS_BODY.replace(' limit="실제 스위치는 주소를 스스로 배워요."', ''))).toEqual(['analogy-limit']);
  });
  it('한눈에 보기는 Figure와 ##가 있으면 통과하고, KeyPoints가 있거나 Figure가 없으면 잡는다', () => {
    const overview = FRONT('', 'overview');
    expect(lint(overview + OVERVIEW_BODY)).toEqual([]);
    expect(rules(overview + BASICS_BODY)).toEqual(['structure']);
    expect(rules(overview + OVERVIEW_BODY.replace(/<Figure[\s\S]*?<\/Figure>/, ''))).toEqual(['structure']);
  });
  it('가이드 본문에 Figure를 둘 수 있다', () => {
    const figure = '<Figure caption="구간 그림이에요.">\n  <StatTile label="구간" value="1" unit="분" />\n</Figure>\n';
    expect(lint(FRONT('', 'guide') + GUIDE_BODY.replace('## 1. 구간을 맞춰 보세요\n', `## 1. 구간을 맞춰 보세요\n\n${figure}`))).toEqual([]);
  });
  it('SVG import는 데모가 아니고, Figure 밖에 두거나 aria-label이 없으면 잡는다', () => {
    expect(lint(BASICS + SVG_IMPORT + BASICS_BODY.replace(TILE, '<SwitchFigure aria-label="스위치 그림" />'))).toEqual([]);
    expect(rules(BASICS + SVG_IMPORT + BASICS_BODY.replace('<Checkpoints>', '<SwitchFigure aria-label="스위치 그림" />\n\n<Checkpoints>'))).toEqual(['structure']);
    expect(rules(BASICS + SVG_IMPORT + BASICS_BODY.replace(TILE, '<SwitchFigure />'))).toEqual(['structure']);
  });
});

describe('컴포넌트 규칙', () => {
  const DEMO_IMPORT = "import PercentileDemo from '../../../components/demos/PercentileDemo.tsx';\n";
  it('등록되지 않은 JSX 요소(날것의 a, img)를 잡는다', () => {
    const withA = CONCEPT_BODY.replace('과 함께 봐요.', '과 <a href="/foundations/other/">문서</a>를 함께 봐요.');
    const issues = lint(FRONT() + withA);
    expect(issues.map((i) => i.rule)).toEqual(['unknown-component']);
    expect(issues[0].message).toContain('<a>');
    const withImg = `${FRONT() + CONCEPT_BODY}\n<Deeper>\n  <img src="chart.png" alt="그래프" />\n\n  설명이에요.\n</Deeper>\n`;
    expect(rules(withImg)).toEqual(['unknown-component']);
  });
  it('import하지 않은 이름이나 named import는 알 수 없는 컴포넌트예요', () => {
    const body = CONCEPT_BODY.replace('<Checkpoints>', '<FancyDemo client:visible />\n\n<Checkpoints>');
    expect(rules(`${FRONT()}import { FancyDemo } from './fancy.tsx';\n${body}`)).toContain('unknown-component');
  });
  it('등록된 컴포넌트와 client 지시어를 붙인 데모는 통과한다', () => {
    const body = CONCEPT_BODY.replace('<Checkpoints>', '<PercentileDemo client:visible />\n\n<Checkpoints>');
    expect(lint(FRONT() + DEMO_IMPORT + body)).toEqual([]);
  });
  it('client 지시어가 없는 데모를 잡는다', () => {
    const body = CONCEPT_BODY.replace('<Checkpoints>', '<PercentileDemo />\n\n<Checkpoints>');
    const issues = lint(FRONT() + DEMO_IMPORT + body);
    expect(issues.map((i) => i.rule)).toEqual(['demo-hydration']);
    expect(issues[0].message).toContain('client:visible');
  });
  it('검사기의 컴포넌트 목록은 MDX 컴포넌트 맵과 같다', () => {
    const src = readFileSync('src/components/content/index.ts', 'utf8');
    const map = /export const mdxComponents = \{([^}]*)\}/.exec(src);
    const keys = map![1].split(',').map((s) => s.trim()).filter(Boolean);
    expect([...LINT_CONFIG.mdxComponents].sort()).toEqual(keys.sort());
  });
});

describe('머리말과 참조 규칙', () => {
  it('domain이 폴더와 다르면 잡는다', () => {
    expect(rules(FRONT('', 'concept', 'apm') + CONCEPT_BODY)).toEqual(['domain-folder']);
  });
  it('type이 잘못되면 잡는다', () => {
    expect(rules(FRONT('', 'essay') + CONCEPT_BODY)).toEqual(['frontmatter']);
  });
  it('개념 글에 stage가 없으면 잡는다', () => {
    expect(rules(FRONT('', 'concept', 'foundations', null) + CONCEPT_BODY)).toContain('frontmatter');
  });
  it('stage 값이 basics·monitoring이 아니면 잡는다', () => {
    expect(rules(FRONT('', 'concept', 'foundations', 'intro') + CONCEPT_BODY)).toContain('frontmatter');
  });
  it('가이드에 stage가 있으면 잡는다', () => {
    expect(rules(FRONT('', 'guide', 'foundations', 'basics') + GUIDE_BODY)).toContain('frontmatter');
  });
  it('없는 글을 가리키는 Term과 related를 잡는다', () => {
    expect(rules(FRONT() + CONCEPT_BODY.replace('foundations/other', 'foundations/nope'))).toEqual(['reference']);
    expect(rules(FRONT('related: [foundations/nope]\n') + CONCEPT_BODY)).toEqual(['reference']);
  });
  it('공개 글이 초안을 가리키면 잡는다', () => {
    expect(rules(FRONT() + CONCEPT_BODY.replace('foundations/other', 'foundations/secret'))).toEqual(['reference']);
  });
  it('마크다운 링크를 잡는다', () => {
    expect(rules(FRONT() + CONCEPT_BODY.replace('사이예요.', '사이예요. [문서](https://example.com)를 봐요.'))).toEqual(['markdown-link']);
  });
  it('MDX 문법 오류는 parse 위반 하나로 끝낸다', () => {
    const issues = lint(`${FRONT()}\n<KeyPoints>\n  <Point title="x">열린 채로 끝나요.\n`);
    expect(issues.map((i) => i.rule)).toEqual(['parse']);
    expect(issues[0].line).toBeGreaterThanOrEqual(1);
  });
});
