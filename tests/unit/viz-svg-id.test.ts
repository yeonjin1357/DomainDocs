import { describe, expect, it } from 'vitest';
import { svgId } from '../../src/lib/viz/svg-id';

describe('svgId', () => {
  it('같은 설명이면 같은 id를 만든다', () => {
    expect(svgId('flow', '스위치 구조도')).toBe(svgId('flow', '스위치 구조도'));
  });
  it('설명이 다르면 다른 id를 만들고, 앞에 prefix를 붙인다', () => {
    expect(svgId('flow', '스위치 구조도')).not.toBe(svgId('flow', '라우터 구조도'));
    expect(svgId('seq', '순서')).toMatch(/^seq-[0-9a-z]+$/);
  });
});
