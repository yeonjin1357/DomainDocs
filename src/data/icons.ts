/** 글 머리말 icon에 쓸 수 있는 이름. 늘리면 Icon.astro의 ICONS에도 추가한다(타입 검사가 빠뜨림을 잡는다). */
export const ICON_NAMES = [
  'sigma',
  'activity',
  'database',
  'server',
  'chart-line',
  'chart-column',
  'gauge',
  'timer',
  'layers',
  'hash',
  'clock',
  'trending-up',
] as const;

export type IconName = (typeof ICON_NAMES)[number];
