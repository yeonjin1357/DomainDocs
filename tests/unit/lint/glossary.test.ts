import { describe, expect, it } from 'vitest';
import { lintGlossaryFile } from '../../../scripts/lint-content/glossary';
import type { LintContext } from '../../../scripts/lint-content/rules';

const ctx: LintContext = {
  docs: new Map([
    ['foundations/test', { id: 'foundations/test', type: 'concept', draft: false }],
    ['foundations/secret', { id: 'foundations/secret', type: 'concept', draft: true }],
  ]),
  terms: new Map(),
};

const GOOD = `terms:
  - id: snmp
    name: SNMP
    en: Simple Network Management Protocol
    aliases: [에스엔엠피]
    short: 장비의 상태를 묻고 답하는 표준 규약이에요.
    analogy: 관리 서버가 장비마다 놓인 문진표를 돌며 읽는 것과 같아요.
    doc: foundations/test
  - id: switch
    name: 스위치
    short: 같은 네트워크 안에서 데이터를 넘겨 주는 장비예요.
`;

const lint = (source: string, domain = 'foundations') => lintGlossaryFile({ file: `${domain}.yaml`, domain, source }, ctx);
const at = (source: string, domain?: string) => lint(source, domain).map((i) => [i.rule, i.line]);

describe('용어 파일 검사', () => {
  it('올바른 용어 파일은 위반이 없다', () => {
    expect(lint(GOOD)).toEqual([]);
  });

  it('YAML 문법 오류는 몇째 줄인지 알려 준다', () => {
    expect(at('terms:\n  - id: a\n    name: x: y\n')).toEqual([['glossary', 3]]);
  });

  it('terms 목록이 없거나 비어 있으면 잡는다', () => {
    expect(at('words: []\n')).toEqual([['glossary', 1]]);
    expect(at('terms: []\n')).toEqual([['glossary', 1]]);
  });

  it('필수 필드가 없거나 형식이 틀리면 그 용어의 줄을 알려 준다', () => {
    const bad = GOOD.replace('  - id: switch\n', '  - id: Bad_Id\n').replace('    short: 같은 네트워크 안에서 데이터를 넘겨 주는 장비예요.\n', '');
    expect(at(bad)).toEqual([
      ['glossary', 9],
      ['glossary', 9],
    ]);
  });

  it('모르는 필드를 잡는다', () => {
    expect(at(GOOD.replace('    name: 스위치\n', '    name: 스위치\n    shrot: 오타예요.\n'))).toEqual([['glossary', 9]]);
  });

  it('같은 id가 두 번 나오면 잡는다', () => {
    expect(at(GOOD.replace('id: switch', 'id: snmp'))).toEqual([['glossary', 9]]);
  });

  it('영역 id가 아닌 파일 이름을 잡는다', () => {
    expect(at(GOOD, 'infra')).toEqual([['glossary', 1]]);
  });

  it('name이 30자, short가 60자를 넘으면 잡는다', () => {
    expect(at(GOOD.replace('name: 스위치', `name: ${'가'.repeat(31)}`))).toEqual([['glossary', 9]]);
    expect(at(GOOD.replace('short: 같은 네트워크 안에서 데이터를 넘겨 주는 장비예요.', `short: ${'가'.repeat(60)}요.`))).toEqual([['glossary', 9]]);
  });

  it('short와 analogy에 문장 규칙을 쓴다', () => {
    expect(at(GOOD.replace('넘겨 주는 장비예요.', '넘겨 주는 장비입니다.'))).toEqual([['formal-ending', 9]]);
    expect(at(GOOD.replace('읽는 것과 같아요.', '읽는 것과 같다.'))).toEqual([['formal-ending', 2]]);
  });

  it('doc이 없는 글이거나 초안이면 잡는다', () => {
    expect(at(GOOD.replace('doc: foundations/test', 'doc: foundations/nope'))).toEqual([['reference', 2]]);
    expect(at(GOOD.replace('doc: foundations/test', 'doc: foundations/secret'))).toEqual([['reference', 2]]);
  });
});
