const openers = new WeakMap<HTMLDialogElement, HTMLElement | null>();
const DRAG_CLOSE_PX = 80;

export function openDialog(dialog: HTMLDialogElement, opener?: HTMLElement | null): void {
  openers.set(dialog, opener ?? (document.activeElement as HTMLElement | null));
  if (!dialog.open) dialog.showModal();
}

export function closeDialog(dialog: HTMLDialogElement): void {
  if (dialog.open) dialog.close();
}

function enableDragToClose(dialog: HTMLDialogElement, handle: HTMLElement, panel: HTMLElement): void {
  let startY: number | null = null;
  handle.addEventListener('pointerdown', (e) => {
    startY = e.clientY;
    handle.setPointerCapture(e.pointerId);
    panel.style.transition = 'none';
  });
  handle.addEventListener('pointermove', (e) => {
    if (startY === null) return;
    panel.style.transform = `translateY(${Math.max(0, e.clientY - startY)}px)`;
  });
  const end = (e: PointerEvent) => {
    if (startY === null) return;
    const dy = e.clientY - startY;
    startY = null;
    panel.style.transition = '';
    panel.style.transform = '';
    if (dy > DRAG_CLOSE_PX) closeDialog(dialog);
  };
  handle.addEventListener('pointerup', end);
  handle.addEventListener('pointercancel', end);
}

/** 바깥 클릭·닫기 버튼·끌어내리기로 닫고, 닫히면 연 요소로 포커스를 돌려준다. Esc는 브라우저가 처리한다. */
export function setupDialog(dialog: HTMLDialogElement): void {
  if (dialog.dataset.ready === 'true') return;
  dialog.dataset.ready = 'true';
  dialog.addEventListener('close', () => {
    const opener = openers.get(dialog);
    openers.delete(dialog);
    opener?.focus();
  });
  dialog.addEventListener('click', (e) => {
    if (e.target === dialog) closeDialog(dialog);
  });
  dialog.querySelectorAll<HTMLElement>('[data-sheet-close]').forEach((b) => b.addEventListener('click', () => closeDialog(dialog)));
  const handle = dialog.querySelector<HTMLElement>('[data-sheet-handle]');
  const panel = dialog.querySelector<HTMLElement>('[data-sheet-panel]');
  if (handle && panel) enableDragToClose(dialog, handle, panel);
}
