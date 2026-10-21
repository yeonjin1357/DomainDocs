import { describe, expect, it } from 'vitest';
import { parseMdx } from '../../../src/lib/mdx/parse';
import { analyzeBody, extractPointTitles, extractTermSlugs, proseChars } from '../../../src/lib/mdx/analyze';

const BODY = [
  '<KeyPoints>',
  '  <Point title="평균은 느린 요청을 숨겨요">',
  '    가나다라마바사예요. <Term slug="foundations/beta">베타</Term>와 <Term slug="foundations/beta">베타</Term>를 봐요.',
  '  </Point>',
  '  <Point title="두 번째 핵심">',
  '    <Term slug="foundations/gamma">감마</Term>도 있어요.',
  '  </Point>',
  '</KeyPoints>',
  '',
  '<Deeper>',
  '  더 깊은 설명은 읽는 시간에서 빠져요.',
  '</Deeper>',
].join('\n');

describe('analyze', () => {
  it('Term slug를 등장 순서대로 중복 없이 모은다', () => {
    expect(extractTermSlugs(parseMdx(BODY))).toEqual(['foundations/beta', 'foundations/gamma']);
  });
  it('KeyPoints 안 Point 제목을 모은다', () => {
    expect(extractPointTitles(parseMdx(BODY))).toEqual(['평균은 느린 요청을 숨겨요', '두 번째 핵심']);
  });
  it('Term term은 glossaryKeys로, Term slug는 termSlugs로 모은다', () => {
    const body = '<Term term="network/snmp">SNMP</Term>와 <Term slug="foundations/beta">베타</Term>, <Term term="network/snmp">SNMP</Term>예요.';
    const result = analyzeBody(body);
    expect(result.glossaryKeys).toEqual(['network/snmp']);
    expect(result.termSlugs).toEqual(['foundations/beta']);
  });
  it('Deeper를 뺀 글자 수를 센다', () => {
    const tree = parseMdx(BODY);
    const withDeeper = proseChars(tree, { excludeDeeper: false });
    const withoutDeeper = proseChars(tree, { excludeDeeper: true });
    expect(withDeeper - withoutDeeper).toBe([...'더 깊은 설명은 읽는 시간에서 빠져요.'].length);
  });
  it('읽는 시간은 500자당 1분, 최소 1분이다', () => {
    expect(analyzeBody(BODY).readingMinutes).toBe(1);
    const long = `${'가나다라마바사아자차카타파하 문장이에요. '.repeat(3)}\n\n`.repeat(20);
    expect(analyzeBody(long).readingMinutes).toBe(Math.ceil(proseChars(parseMdx(long), { excludeDeeper: true }) / 500));
    expect(analyzeBody(long).readingMinutes).toBeGreaterThan(1);
  });
});
