import { expect, test } from '@playwright/test';

test('사이트의 모든 내부 링크가 base 경로 안에서 200으로 열린다', async ({ request, baseURL }, testInfo) => {
  test.skip(testInfo.project.name !== 'desktop', '데스크톱에서 한 번만 돈다');
  const start = new URL(baseURL!);
  const basePath = start.pathname; // '/DomainDocs/'
  const queue = [start.toString()];
  const seen = new Set(queue);
  const escaped: string[] = [];

  while (queue.length > 0) {
    const url = queue.shift()!;
    const res = await request.get(url);
    expect(res.status(), url).toBe(200);
    if (!(res.headers()['content-type'] ?? '').includes('text/html')) continue;
    const html = await res.text();
    for (const [, href] of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
      const target = new URL(href, url);
      if (target.origin !== start.origin) continue;
      if (!target.pathname.startsWith(basePath)) {
        escaped.push(`${url} → ${href}`);
        continue;
      }
      const key = `${target.origin}${target.pathname}`;
      if (!seen.has(key)) {
        seen.add(key);
        queue.push(key);
      }
    }
  }
  expect(escaped, 'base 경로 밖을 가리키는 링크').toEqual([]);
  expect(seen.size).toBeGreaterThan(5);
});
