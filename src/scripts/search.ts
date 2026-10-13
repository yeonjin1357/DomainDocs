import { openDialog, setupDialog } from './dialog';

interface PagefindResultData {
  url: string;
  meta: { title?: string };
  excerpt: string;
}

interface Pagefind {
  init(): Promise<void>;
  options(opts: Record<string, unknown>): Promise<void>;
  search(query: string): Promise<{ results: { data(): Promise<PagefindResultData> }[] }>;
}

const MAX_RESULTS = 10;
let pagefindPromise: Promise<Pagefind> | null = null;

function loadPagefind(url: string): Promise<Pagefind> {
  pagefindPromise ??= (import(/* @vite-ignore */ url) as Promise<Pagefind>)
    .then(async (pf) => {
      // 한국어는 어간 분석이 없어 조사 붙은 단어 점수가 낮다. 유사어 감점을 끈다(사전 실험 결과).
      await pf.options({ ranking: { termSimilarity: 0 } });
      await pf.init();
      return pf;
    })
    .catch((error: unknown) => {
      pagefindPromise = null;
      throw error;
    });
  return pagefindPromise;
}

/** 검색 상태 문구. 찾은 글이 보여 주는 개수(MAX_RESULTS)보다 많으면 그 사실을 함께 알린다. */
export function searchStatus(query: string, total: number, shown: number): string {
  if (total === 0) return `'${query}'에 맞는 글이 없어요`;
  return total > shown ? `총 ${total}개 중 ${shown}개를 보여 줘요` : `${shown}개를 찾았어요`;
}

function renderResult(d: PagefindResultData): HTMLLIElement {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.className = 'search-result pressable';
  a.href = d.url;
  a.dataset.searchResult = '';
  const title = document.createElement('span');
  title.className = 'search-result-title';
  title.textContent = d.meta.title ?? d.url;
  const excerpt = document.createElement('span');
  excerpt.className = 'search-result-excerpt';
  // Pagefind 발췌문은 우리 글에서 뽑은 텍스트에 <mark>만 더한 HTML이다.
  excerpt.innerHTML = d.excerpt;
  a.append(title, excerpt);
  li.append(a);
  return li;
}

export function initSearch(): void {
  const dialog = document.getElementById('search-dialog') as HTMLDialogElement | null;
  const input = dialog?.querySelector<HTMLInputElement>('[data-search-input]');
  const status = dialog?.querySelector<HTMLElement>('[data-search-status]');
  const list = dialog?.querySelector<HTMLOListElement>('[data-search-results]');
  if (!dialog || !input || !status || !list) return;
  setupDialog(dialog);
  const url = input.dataset.pagefindUrl!;

  const open = (opener: HTMLElement | null) => {
    if (dialog.open) return;
    openDialog(dialog, opener);
    input.focus();
    input.select();
    void loadPagefind(url).catch(() => undefined);
  };

  document.querySelectorAll<HTMLElement>('[data-search-open]').forEach((button) => button.addEventListener('click', () => open(button)));
  document.addEventListener('keydown', (e) => {
    if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
    const target = e.target as HTMLElement | null;
    if (target && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))) return;
    e.preventDefault();
    open(null);
  });

  let seq = 0;
  input.addEventListener('input', async () => {
    const query = input.value.trim();
    const mySeq = ++seq;
    if (!query) {
      list.replaceChildren();
      status.textContent = '';
      return;
    }
    let data: PagefindResultData[];
    let total: number;
    try {
      const pf = await loadPagefind(url);
      const found = await pf.search(query);
      total = found.results.length;
      data = await Promise.all(found.results.slice(0, MAX_RESULTS).map((r) => r.data()));
    } catch {
      if (mySeq !== seq) return;
      list.replaceChildren();
      status.textContent = '검색 색인을 불러오지 못했어요. 빌드한 사이트에서 다시 시도해 주세요.';
      return;
    }
    if (mySeq !== seq) return;
    status.textContent = searchStatus(query, total, data.length);
    list.replaceChildren(...data.map(renderResult));
  });
}
