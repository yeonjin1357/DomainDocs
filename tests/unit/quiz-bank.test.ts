import { describe, expect, it } from 'vitest';
import { buildBank, type BankDoc, type DocQuizFile } from '../../src/lib/quiz/bank';
import type { GlossaryTerm } from '../../src/lib/glossary';

const term = (domain: string, id: string, name: string, short: string, extra: Partial<GlossaryTerm> = {}): GlossaryTerm => ({
  key: `${domain}/${id}`,
  domain,
  id,
  name,
  short,
  aliases: [],
  ...extra,
});

const terms: GlossaryTerm[] = [
  term('network', 'snmp', 'SNMP', '장비의 상태를 묻고 답하는 표준 규약이에요.', { aliases: ['에스엔엠피'] }),
  term('network', 'switch', '스위치', '같은 네트워크 안에서 데이터를 넘겨 주는 장비예요.'),
  term('network', 'router', '라우터', '네트워크와 네트워크를 이어 주는 장비예요.'),
  term('network', 'mib', 'MIB', 'SNMP로 읽을 수 있는 값들의 목록이에요. MIB 파일로 나눠요.'),
  term('server', 'rss', 'RSS', '프로세스가 실제 메모리에 올려 둔 양이에요.'),
  term('server', 'swap', '스왑', '메모리 내용을 잠시 디스크에 내보내는 공간이에요.'),
];

describe('문제 은행', () => {
  const docs: BankDoc[] = [
    { id: 'network/snmp', domain: 'network', title: 'SNMP', url: '/network/snmp/' },
    { id: 'network/overview', domain: 'network', title: '한눈에 보기', url: '/network/overview/' },
  ];
  const file: DocQuizFile = {
    docId: 'network/snmp',
    questions: [
      { id: 'q1', type: 'ox', prompt: '물음?', answer: false, explain: '해설이에요.' },
      { id: 'q2', type: 'input', prompt: '이름은?', answer: ['단순 망 관리'], term: 'network/snmp', explain: '해설이에요.', doc: 'network/overview' },
    ],
  };

  it('글 문제의 키는 글 id#문제 id이고, 관련 글을 잇는다', () => {
    const bank = buildBank([file], docs, terms);
    const q1 = bank.find((x) => x.key === 'network/snmp#q1')!;
    expect(q1).toMatchObject({ domain: 'network', docId: 'network/snmp', link: { url: '/network/snmp/', title: 'SNMP' } });
    const q2 = bank.find((x) => x.key === 'network/snmp#q2')!;
    expect(q2.link.title).toBe('한눈에 보기');
    expect(q2.answer).toEqual(['단순 망 관리', 'SNMP', '에스엔엠피']);
  });

  it('글에 쓴 문제만 담고, 용어 사전으로 문제를 만들지 않는다', () => {
    expect(buildBank([file], docs, terms).map((x) => x.key)).toEqual(['network/snmp#q1', 'network/snmp#q2']);
  });

  it('없는 글이나 용어를 가리키면 오류를 낸다', () => {
    expect(() => buildBank([{ ...file, docId: 'network/none' }], docs, terms)).toThrow(/network\/none/);
    const badTerm = { ...file, questions: [{ ...file.questions[1], term: 'network/none' }] };
    expect(() => buildBank([badTerm], docs, terms)).toThrow(/network\/none/);
  });
});
