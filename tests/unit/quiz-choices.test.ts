import { describe, expect, it } from 'vitest';
import { shuffleChoices } from '../../src/lib/quiz/choices';

describe('보기 섞기', () => {
  const choices = ['a', 'b', 'c', 'd'];

  it('보기 순서를 섞고, 정답 위치도 함께 옮긴다', () => {
    // rng가 늘 0이면 섞은 결과는 b, c, d, a다.
    const out = shuffleChoices(choices, 0, () => 0);
    expect(out).toEqual({ choices: ['b', 'c', 'd', 'a'], answer: 3 });
  });

  it('어떻게 섞어도 정답 보기의 글은 그대로다', () => {
    for (const r of [0, 0.3, 0.6, 0.99]) {
      const out = shuffleChoices(choices, 2, () => r);
      expect(out.choices[out.answer]).toBe('c');
      expect([...out.choices].sort()).toEqual(choices);
    }
  });

  it('받은 보기 배열은 바꾸지 않는다', () => {
    shuffleChoices(choices, 0, () => 0);
    expect(choices).toEqual(['a', 'b', 'c', 'd']);
  });
});
