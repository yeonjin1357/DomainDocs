import { todayString } from '../lib/quiz/schedule';
import { dueCount, loadRecords } from '../lib/quiz/storage';

/**
 * 홈과 퀴즈 홈의 "다시 볼 문제" 줄을 이 브라우저의 기록으로 채운다.
 * 기록이 없거나 저장소를 못 쓰면 페이지에 적어 둔 기본 문구가 그대로 남는다.
 */
export function initQuizDue(): void {
  const records = loadRecords();
  const count = dueCount(records, null, todayString());
  const hasRecords = Object.keys(records).length > 0;
  document.querySelectorAll<HTMLElement>('[data-quiz-due]').forEach((el) => {
    const title = el.querySelector('.row-title');
    const desc = el.querySelector('.row-desc');
    if (el.dataset.quizDue === 'home') {
      if (count > 0 && title) title.textContent = `오늘 다시 볼 문제 ${count}개`;
    } else if (desc) {
      if (count > 0) desc.textContent = `오늘 다시 볼 문제가 ${count}개 있어요.`;
      else if (hasRecords) desc.textContent = '오늘 다시 볼 문제가 없어요.';
    }
  });
}
