import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { TOURS, type TourWidget } from '../../src/data/dashboard-tours';
import { DOMAIN_IDS } from '../../src/data/domains';

const docFile = (slug: string) => `src/content/docs/${slug}.mdx`;
// 머리말 title은 따옴표로 감싸기도 해요(예: '알림 조건: 임계값과 지속 시간'). 감싼 따옴표는 빼고 견줘요.
const titleOf = (slug: string) =>
  readFileSync(docFile(slug), 'utf8')
    .match(/^title: (.*)$/m)?.[1]
    .replace(/^(['"])(.*)\1$/, '$2');

describe('화면 둘러보기 데이터', () => {
  const widgets = Object.values(TOURS).flatMap((t) => t.widgets as TourWidget[]);

  it('모든 영역에 화면이 있고, 화면마다 제목과 칸 6개 이상이 있다', () => {
    expect(new Set(Object.keys(TOURS))).toEqual(new Set(DOMAIN_IDS));
    for (const [domain, t] of Object.entries(TOURS)) {
      expect(t.title, domain).not.toBe('');
      expect(t.widgets.length, domain).toBeGreaterThanOrEqual(6);
    }
  });

  it('링크는 있는 글을 가리키고, 제목이 글 제목과 같다', () => {
    for (const w of widgets) {
      for (const l of w.links) {
        expect(existsSync(docFile(l.slug)), `${w.id} → ${l.slug}`).toBe(true);
        expect(l.title, `${w.id} → ${l.slug}`).toBe(titleOf(l.slug));
      }
    }
  });

  it('칸마다 설명 셋을 해요체로 쓴다', () => {
    for (const w of widgets) {
      for (const text of [w.what, w.read, w.trap]) expect(text, w.id).toMatch(/[요죠][.?!)]*$/);
    }
  });

  it('화면 안의 칸 id는 겹치지 않는다', () => {
    for (const t of Object.values(TOURS)) {
      const ids = (t.widgets as TourWidget[]).map((w) => w.id);
      expect(new Set(ids).size).toBe(ids.length);
    }
  });

  it('개요 글마다 그 영역의 화면을 넣었다', () => {
    for (const domain of DOMAIN_IDS) {
      expect(readFileSync(docFile(`${domain}/overview`), 'utf8'), domain).toContain(`<DashboardTour client:visible screen="${domain}" />`);
    }
  });
});
