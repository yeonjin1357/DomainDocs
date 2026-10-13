import { describe, expect, it } from 'vitest';
import { componentChildren, jsxAttrs, parseErrorLocation, parseMdx, readFrontmatter } from '../../../src/lib/mdx/parse';

const SAMPLE = `---
title: 평균과 백분위수
order: 1
related: [foundations/counters-and-rate]
updated: 2026-10-13
---
import PercentileDemo from '../../../components/demos/PercentileDemo.tsx';

<OnDashboard title="응답시간">
  <MiniLineChart series={[1, 2, 3]} ariaLabel="그래프" />
</OnDashboard>

<KeyPoints>
  <Point title="첫 번째">본문이에요.</Point>
  <Point title="두 번째">본문이에요.</Point>
</KeyPoints>

<PercentileDemo client:visible />

<Checkpoints>
  <Check>한 줄짜리 확인 문장이에요.</Check>
</Checkpoints>
`;

describe('parseMdx', () => {
  it('최상위 컴포넌트를 순서대로 찾는다', () => {
    const names = componentChildren(parseMdx(SAMPLE)).map((el) => el.name);
    expect(names).toEqual(['OnDashboard', 'KeyPoints', 'PercentileDemo', 'Checkpoints']);
  });

  it('한 줄짜리 자식 컴포넌트도 자식으로 센다', () => {
    const tree = parseMdx(SAMPLE);
    const checkpoints = componentChildren(tree).find((el) => el.name === 'Checkpoints');
    expect(checkpoints?.type).toBe('mdxJsxFlowElement');
    if (checkpoints?.type !== 'mdxJsxFlowElement') return;
    expect(componentChildren(checkpoints).map((el) => el.name)).toEqual(['Check']);
  });

  it('속성을 문자열·표현식·불리언으로 읽는다', () => {
    const tree = parseMdx(SAMPLE);
    const onDashboard = componentChildren(tree)[0];
    expect(jsxAttrs(onDashboard)).toEqual({ title: '응답시간' });
    if (onDashboard.type !== 'mdxJsxFlowElement') return;
    expect(jsxAttrs(componentChildren(onDashboard)[0])).toEqual({ series: { expression: '[1, 2, 3]' }, ariaLabel: '그래프' });
    const demo = componentChildren(tree)[2];
    expect(jsxAttrs(demo)).toEqual({ 'client:visible': true });
  });

  it('YAML 날짜는 문자열로, 목록은 배열로 읽는다', () => {
    expect(readFrontmatter(parseMdx(SAMPLE))).toEqual({
      title: '평균과 백분위수',
      order: 1,
      related: ['foundations/counters-and-rate'],
      updated: '2026-10-13',
    });
  });

  it('CRLF 줄바꿈도 같은 결과를 낸다', () => {
    const crlf = SAMPLE.replace(/\n/g, '\r\n');
    expect(componentChildren(parseMdx(crlf)).map((el) => el.name)).toEqual(['OnDashboard', 'KeyPoints', 'PercentileDemo', 'Checkpoints']);
  });

  it('닫히지 않은 태그는 위치와 함께 오류를 던진다', () => {
    let caught: unknown;
    try {
      parseMdx('<KeyPoints>\n  <Point title="x">본문이에요.\n');
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeDefined();
    const loc = parseErrorLocation(caught as { line?: number; column?: number; reason?: string });
    expect(loc.line).toBeGreaterThanOrEqual(1);
  });
});
