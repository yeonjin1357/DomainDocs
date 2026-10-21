import { describe, expect, it } from 'vitest';
import { lintQuizFile } from '../../../scripts/lint-content/quiz';
import type { LintContext } from '../../../scripts/lint-content/rules';

const ctx: LintContext = {
  docs: new Map([
    ['foundations/test', { id: 'foundations/test', type: 'concept', draft: false }],
    ['foundations/other', { id: 'foundations/other', type: 'concept', draft: false }],
    ['foundations/secret', { id: 'foundations/secret', type: 'concept', draft: true }],
  ]),
  terms: new Map([['foundations/snmp', { key: 'foundations/snmp' }]]),
};

const GOOD = `questions:
  - id: trap-direction
    type: ox
    prompt: SNMP Trap은 관리 서버가 장비에 물어봐서 받는 값인가요?
    answer: false
    explain: Trap은 장비가 먼저 보내요. 관리 서버가 묻는 건 폴링이에요.
  - id: forwarding-device
    type: choice
    prompt: 같은 네트워크 안에서 MAC 주소로 데이터를 넘기는 장비는?
    choices: [스위치, 라우터, 방화벽, 로드 밸런서]
    answer: 0
    explain: 스위치는 MAC 주소 표를 보고 같은 네트워크 안에서 넘겨요.
    doc: foundations/other
  - id: syslog-name
    type: input
    prompt: 장비가 이벤트를 문자로 남겨 보내는 표준 형식은?
    answer: [Syslog, 시스로그]
    term: foundations/snmp
    explain: Syslog는 장비가 사건을 글로 남겨 보내는 형식이에요.
`;

const lint = (source: string, id = 'foundations/test') => lintQuizFile({ file: `${id}.yaml`, id, source }, ctx);
const at = (source: string, id?: string) => lint(source, id).map((i) => [i.rule, i.line]);

describe('퀴즈 파일 검사', () => {
  it('세 형태가 고루 든 올바른 파일은 위반이 없다', () => {
    expect(lint(GOOD)).toEqual([]);
  });

  it('YAML 문법 오류와 빈 목록을 잡는다', () => {
    expect(at('questions:\n  - id: a\n    prompt: x: y\n')).toEqual([['quiz', 3]]);
    expect(at('questions: []\n')).toEqual([['quiz', 1]]);
  });

  it('모르는 필드와 id 형식·중복을 잡는다', () => {
    const bad = GOOD.replace('  - id: forwarding-device\n', '  - id: trap-direction\n').replace('    doc: foundations/other\n', '    hint: 없음\n');
    expect(at(bad)).toEqual([
      ['quiz', 7],
      ['quiz', 7],
    ]);
    expect(at(GOOD.replace('id: syslog-name', 'id: Syslog_Name'))).toEqual([['quiz', 14]]);
  });

  it('객관식은 서로 다른 보기 4개와 그 안의 정답 번호가 필요하다', () => {
    expect(at(GOOD.replace('[스위치, 라우터, 방화벽, 로드 밸런서]', '[스위치, 라우터, 방화벽]'))).toEqual([['quiz', 7]]);
    expect(at(GOOD.replace('[스위치, 라우터, 방화벽, 로드 밸런서]', '[스위치, 라우터, 스위치, 방화벽]'))).toEqual([['quiz', 7]]);
    expect(at(GOOD.replace('    answer: 0\n', '    answer: 4\n'))).toEqual([['quiz', 7]]);
  });

  it('OX는 참·거짓, 주관식은 글자 목록이 정답이다', () => {
    expect(at(GOOD.replace('    answer: false\n', '    answer: 1\n'))).toEqual([['quiz', 2]]);
    expect(at(GOOD.replace('[Syslog, 시스로그]', '[]'))).toEqual([['quiz', 14]]);
  });

  it('형태가 없거나 문제·해설이 없으면 잡는다', () => {
    expect(at(GOOD.replace('    type: ox\n', '    type: essay\n'))).toEqual([['quiz', 2]]);
    expect(at(GOOD.replace('    explain: Trap은 장비가 먼저 보내요. 관리 서버가 묻는 건 폴링이에요.\n', ''))).toEqual([['quiz', 2]]);
  });

  it('해설은 해요체와 문장 길이를 검사한다', () => {
    expect(at(GOOD.replace('관리 서버가 묻는 건 폴링이에요.', '관리 서버가 묻는 건 폴링이다.'))).toEqual([['formal-ending', 2]]);
  });

  it('글·용어 참조를 확인한다', () => {
    expect(at(GOOD, 'foundations/nothing')).toEqual([['reference', 1]]);
    expect(at(GOOD, 'foundations/secret')).toEqual([['reference', 1]]);
    expect(at(GOOD.replace('doc: foundations/other', 'doc: foundations/none'))).toEqual([['reference', 7]]);
    expect(at(GOOD.replace('term: foundations/snmp', 'term: foundations/none'))).toEqual([['reference', 14]]);
  });
});
