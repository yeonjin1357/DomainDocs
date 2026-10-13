import { openDialog, setupDialog } from './dialog';

interface TermPreview {
  title: string;
  summary: string;
  points: string[];
  url: string;
  meta: string;
}

export function initTermSheet(): void {
  const dataEl = document.getElementById('term-previews');
  const dialog = document.getElementById('term-sheet') as HTMLDialogElement | null;
  if (!dataEl || !dialog) return;
  const previews = JSON.parse(dataEl.textContent ?? '{}') as Record<string, TermPreview>;
  setupDialog(dialog);
  const part = <T extends HTMLElement>(selector: string) => dialog.querySelector<T>(selector)!;

  // 스크립트가 시트를 띄울 수 있는 링크에만 알린다. 스크립트가 없으면 보통 링크로 남는다.
  document.querySelectorAll<HTMLAnchorElement>('a[data-term]').forEach((link) => {
    if (previews[link.dataset.term ?? '']) link.setAttribute('aria-haspopup', 'dialog');
  });

  document.addEventListener('click', (event) => {
    const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[data-term]');
    if (!link) return;
    // 새 탭·새 창 열기는 브라우저에 맡긴다.
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const preview = previews[link.dataset.term ?? ''];
    if (!preview) return;
    event.preventDefault();
    part('[data-term-meta]').textContent = preview.meta;
    part('[data-term-title]').textContent = preview.title;
    part('[data-term-summary]').textContent = preview.summary;
    part('[data-term-points]').replaceChildren(
      ...preview.points.map((p) => Object.assign(document.createElement('li'), { textContent: p })),
    );
    part('[data-term-points-wrap]').hidden = preview.points.length === 0;
    part<HTMLAnchorElement>('[data-term-link]').href = preview.url;
    openDialog(dialog, link);
  });
}
