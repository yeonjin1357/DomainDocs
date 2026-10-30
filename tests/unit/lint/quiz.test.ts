import { describe, expect, it } from 'vitest';
import { lintQuizBank, lintQuizFile } from '../../../scripts/lint-content/quiz';
import type { LintContext } from '../../../scripts/lint-content/rules';

const ctx: LintContext = {
  docs: new Map([
    ['foundations/test', { id: 'foundations/test', type: 'concept', draft: false }],
    ['foundations/other', { id: 'foundations/other', type: 'concept', draft: false }],
    ['foundations/secret', { id: 'foundations/secret', type: 'concept', draft: true }],
  ]),
  terms: new Map([['foundations/snmp', { key: 'foundations/snmp', names: ['SNMP', '에스엔엠피'] }]]),
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

describe('문제 글만 보고 답이 보이는 문제', () => {
  it('정답 보기가 가장 긴 오답보다 1.2배(짧은 보기는 3자) 넘게 길면 잡는다', () => {
    expect(at(GOOD.replace('[스위치, 라우터, 방화벽, 로드 밸런서]', '[같은 네트워크 안을 잇는 스위치, 라우터, 방화벽, 로드 밸런서]'))).toEqual([['quiz', 7]]);
    // 짧은 보기는 3자까지 봐준다: 정답 9자, 가장 긴 오답 6자.
    expect(at(GOOD.replace('[스위치, 라우터, 방화벽, 로드 밸런서]', '[L2 스위치 장비, 라우터, 방화벽, 로드 밸런서]'))).toEqual([]);
  });

  it('정답 보기에만 괄호 설명이 붙으면 잡는다', () => {
    expect(at(GOOD.replace('[스위치, 라우터, 방화벽, 로드 밸런서]', '[스위치(L2), 라우터, 방화벽, 로드 밸런서]'))).toEqual([['quiz', 7]]);
    expect(at(GOOD.replace('[스위치, 라우터, 방화벽, 로드 밸런서]', '[스위치(L2), 라우터(L3), 방화벽, 로드 밸런서]'))).toEqual([]);
  });

  it('주관식에서 정답으로 받는 말이 문제 글에 들어 있으면 잡는다', () => {
    expect(at(GOOD.replace('남겨 보내는 표준 형식은?', '남겨 보내는 표준 형식(syslog)은?'))).toEqual([['quiz', 14]]);
    // term으로 이은 용어의 이름·별칭도 정답으로 받으니 함께 본다.
    expect(at(GOOD.replace('남겨 보내는 표준 형식은?', 'SNMP 말고, 남겨 보내는 표준 형식은?'))).toEqual([['quiz', 14]]);
  });
});

describe('문제 전체의 비율', () => {
  const ox = (n: number, trues: number) =>
    Array.from({ length: n }, (_, i) => `  - id: ox-${i}\n    type: ox\n    prompt: 문제 ${i}인가요?\n    answer: ${i < trues}\n    explain: 해설이에요.\n`).join('');
  const choice = (n: number, longest: number) =>
    Array.from({ length: n }, (_, i) => {
      const choices = i < longest ? '[정답이에요, 오답, 오답2, 오답3]' : '[정답, 오답이에요, 오답2, 오답3]';
      return `  - id: ch-${i}\n    type: choice\n    prompt: 문제 ${i}는?\n    choices: ${choices}\n    answer: 0\n    explain: 해설이에요.\n`;
    }).join('');
  const bank = (body: string) => lintQuizBank([{ file: 'a.yaml', id: 'foundations/test', source: `questions:\n${body}` }]).map((i) => i.rule);

  it('OX 정답의 O가 40~60%를 벗어나면 잡는다', () => {
    expect(bank(ox(20, 8) + choice(20, 0))).toEqual([]);
    expect(bank(ox(20, 4) + choice(20, 0))).toEqual(['quiz']);
    expect(bank(ox(20, 13) + choice(20, 0))).toEqual(['quiz']);
  });

  it('정답이 가장 긴 보기인 객관식이 35%를 넘으면 잡는다', () => {
    expect(bank(ox(20, 10) + choice(20, 7))).toEqual([]);
    expect(bank(ox(20, 10) + choice(20, 8))).toEqual(['quiz']);
  });

  it('OX나 객관식이 20개보다 적으면 그 비율은 보지 않는다', () => {
    expect(bank(ox(3, 0) + choice(3, 3))).toEqual([]);
  });
});

describe('문제 파일의 용어 규칙', () => {
  it('prompt·choices·explain의 쓰지 않는 말을 잡고, answer는 둔다', () => {
    expect(at(GOOD.replace('answer: [Syslog, 시스로그]', 'answer: [Syslog, 시스로그, 오류]'))).toEqual([]);
    expect(at(GOOD.replace('받는 값인가요?', '받는 오류인가요?'))).toEqual([['term', 2]]);
    expect(at(GOOD.replace('[스위치, 라우터, 방화벽, 로드 밸런서]', '[스위치, 라우터, 방화벽, 톰캣]'))).toEqual([['term', 7]]);
    expect(at(GOOD.replace('폴링이에요.', '폴링이라 `오류`는 없어요.'))).toEqual([]);
  });
});
