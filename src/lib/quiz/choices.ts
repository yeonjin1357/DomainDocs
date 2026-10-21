import { shuffle } from './schedule';

/**
 * 객관식 보기를 섞고 정답 위치를 함께 옮긴다. 풀 때마다 섞어서, 정답 자리를 외워 맞히지 못하게 한다.
 * 그래서 문제 파일에는 정답을 아무 자리에 써도 된다.
 */
export function shuffleChoices(choices: readonly string[], answer: number, rng: () => number = Math.random): { choices: string[]; answer: number } {
  const order = shuffle(
    choices.map((_, i) => i),
    rng,
  );
  return { choices: order.map((i) => choices[i]), answer: order.indexOf(answer) };
}
