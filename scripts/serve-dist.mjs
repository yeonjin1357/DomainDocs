// 빌드 결과(dist/)를 base 경로 아래에서만 서빙하는 테스트용 정적 서버.
// GitHub Pages처럼 동작한다: base 밖은 404, 디렉터리는 끝에 /를 붙여 리다이렉트, 없는 경로는 404.html.
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const port = Number(process.argv[2] ?? 4329);
const base = (process.env.BASE_PATH ?? '/DomainDocs').replace(/\/+$/, '');
const root = join(process.cwd(), 'dist');
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.png': 'image/png',
  '.wasm': 'application/wasm',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml',
};

async function statOrNull(path) {
  try {
    return await stat(path);
  } catch {
    return null;
  }
}

createServer(async (req, res) => {
  const { pathname } = new URL(req.url ?? '/', 'http://localhost');
  if (pathname === base) {
    res.writeHead(301, { Location: `${base}/` }).end();
    return;
  }
  if (!pathname.startsWith(`${base}/`)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('base 경로 밖이에요');
    return;
  }
  const rel = decodeURIComponent(pathname.slice(base.length + 1));
  let file = normalize(join(root, rel));
  if (!file.startsWith(root)) {
    res.writeHead(403).end();
    return;
  }
  let status = 200;
  const info = await statOrNull(file);
  if (info?.isDirectory()) {
    if (!pathname.endsWith('/')) {
      res.writeHead(301, { Location: `${pathname}/` }).end();
      return;
    }
    file = join(file, 'index.html');
  }
  if (!(await statOrNull(file))?.isFile()) {
    file = join(root, '404.html');
    status = 404;
    if (!(await statOrNull(file))?.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('없는 페이지예요');
      return;
    }
  }
  res.writeHead(status, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
  res.end(await readFile(file));
}).listen(port, () => {
  console.log(`dist를 http://localhost:${port}${base}/ 에서 서빙해요`);
});
