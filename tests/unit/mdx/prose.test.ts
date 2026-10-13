import { describe, expect, it } from 'vitest';
import { parseMdx } from '../../../src/lib/mdx/parse';
import { CODE_MASK, endsPolitely, extractProse, findBanned, sentencesOf, splitSentenceSpans } from '../../../src/lib/mdx/prose';

const split = (text: string) => splitSentenceSpans(text).map(([s, e]) => text.slice(s, e));
const sentences = (mdx: string) => extractProse(parseMdx(mdx)).flatMap((u) => sentencesOf(u).map((s) => s.text));

describe('splitSentenceSpans', () => {
  it('소수점과 Node.js에서 나누지 않는다', () => {
    expect(split('요청 100개 중 98개가 0.1초이고 2개가 3초면 평균은 0.158초예요. Node.js에서는 그래요.')).toEqual([
      '요청 100개 중 98개가 0.1초이고 2개가 3초면 평균은 0.158초예요.',
      'Node.js에서는 그래요.',
    ]);
  });
  it('물음표와 느낌표에서 나눈다', () => {
    expect(split('끝났어요! 정말요? 네.')).toEqual(['끝났어요!', '정말요?', '네.']);
  });
  it('e.g. 같은 약어와 따옴표 안의 마침표에서 나누지 않는다', () => {
    expect(split('약어는 e.g. 같은 거예요.')).toEqual(['약어는 e.g. 같은 거예요.']);
    expect(split('그는 "그래요."라고 말했어요.')).toEqual(['그는 "그래요."라고 말했어요.']);
  });
  it('띄어쓰기 없이 붙은 문장도 나눈다', () => {
    expect(split('있어요.다음 문장이에요.')).toEqual(['있어요.', '다음 문장이에요.']);
  });
});

describe('extractProse', () => {
  it('JSX 안 단락을 찾고 바깥 컴포넌트 이름을 기록한다', () => {
    const units = extractProse(parseMdx('<KeyPoints>\n  <Point title="제목">\n    첫 문장이에요. 둘째 문장이에요.\n  </Point>\n</KeyPoints>\n'));
    expect(units).toHaveLength(1);
    expect(units[0].ancestors).toEqual(['KeyPoints', 'Point']);
    expect(sentencesOf(units[0]).map((s) => s.text)).toEqual(['첫 문장이에요.', '둘째 문장이에요.']);
  });
  it('한 줄짜리 컴포넌트의 글도 그 컴포넌트를 조상으로 갖는다', () => {
    const units = extractProse(parseMdx('<Checkpoints>\n  <Check>확인해요.</Check>\n</Checkpoints>\n'));
    expect(units.map((u) => [u.text, u.ancestors])).toEqual([['확인해요.', ['Checkpoints', 'Check']]]);
  });
  it('제목·표·코드 블록·속성값은 문장으로 세지 않는다', () => {
    const mdx = [
      '<Deeper>',
      '  ## 계산 방법',
      '',
      '  | 구분 | 값 |',
      '  | --- | --- |',
      '  | p50 | 0.1초 |',
      '',
      '  ```text',
      '  p99 = sorted[ceil(0.99 * n) - 1]',
      '  ```',
      '',
      '  설명 문장이에요.',
      '</Deeper>',
      '',
      '<OnDashboard title="이 제목은 세지 않아요" caption="이 설명도 세지 않아요">',
      '</OnDashboard>',
    ].join('\n');
    expect(sentences(mdx)).toEqual(['설명 문장이에요.']);
  });
  it('물결표 범위는 취소선이 아니라 글자 그대로 남는다', () => {
    expect(sentences('응답은 1~2초 또는 3~4초예요.\n')).toEqual(['응답은 1~2초 또는 3~4초예요.']);
  });
  it('인라인 코드는 길이에 포함하지만 문장 분리와 끝맺음 검사에서는 가린다', () => {
    const [unit] = extractProse(parseMdx('`Node.js 습니다.` 명령은 짧아요.\n'));
    const [s] = sentencesOf(unit);
    expect(s.text).toBe('`Node.js 습니다.` 명령은 짧아요.'.replace(/`/g, ''));
    expect(s.length).toBe([...'Node.js 습니다. 명령은 짧아요.'].length);
    expect(endsPolitely(s.masked)).toBe(true);
  });
  it('인라인 코드로 끝나는 문장은 코드 앞의 마지막 글로 끝맺음을 본다', () => {
    const masked = (mdx: string) => sentencesOf(extractProse(parseMdx(mdx))[0])[0].masked;
    expect(endsPolitely(masked('PromQL로는 이렇게 써요: `rate(x[5m])`\n'))).toBe(true);
    expect(endsPolitely(masked('쓰는 함수는 `rate()`.\n'))).toBe(false);
    expect(endsPolitely(masked('`rate()`\n'))).toBe(true);
  });
  it('링크와 Term의 보이는 글자를 문장에 포함한다', () => {
    expect(sentences('<Term slug="foundations/beta">rate</Term>도 함께 봐요.\n')).toEqual(['rate도 함께 봐요.']);
  });
});

describe('endsPolitely', () => {
  it.each(['끝냅니다.', '그렇습니다', '좋습니다!', '합니다?', '그렇습니다."'])('%s는 합쇼체로 잡는다', (s) => {
    expect(endsPolitely(s)).toBe(false);
  });
  it.each(['평균은 느린 요청을 숨긴다.', '확인한다', '그렇다!', '느리다."'])('%s는 해라체로 잡는다', (s) => {
    expect(endsPolitely(s)).toBe(false);
  });
  it.each(['예요.', '해요.', '해요!', '그렇죠?', '그렇습니다만 아니에요.', '"합니다"라고 해요.', '"그래요."라고 해요.', '정말요…', '(예요)'])(
    '%s는 잡지 않는다',
    (s) => {
      expect(endsPolitely(s)).toBe(true);
    },
  );
  it('가려진 인라인 코드만 있는 문장은 판단하지 않고, 코드 안 글자는 끝맺음으로 보지 않는다', () => {
    expect(endsPolitely(CODE_MASK.repeat(4))).toBe(true);
    expect(endsPolitely(`설정은 ${CODE_MASK.repeat(4)}.`)).toBe(false);
  });
});

describe('findBanned', () => {
  it('가려진 텍스트에서 금지 표현을 찾는다', () => {
    const [unit] = extractProse(parseMdx('이 계산이 맞다고 주장하지 않아요.\n'));
    expect(findBanned(sentencesOf(unit)[0], ['주장하지 않', '단정하지 않'])).toEqual(['주장하지 않']);
  });
});
