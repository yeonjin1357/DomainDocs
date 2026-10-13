import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { collectMeta, lintSource, type LintContext, type SourceFile } from './rules';

const root = process.env.DOCS_CONTENT_DIR ?? 'src/content/docs';

function listMdx(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return listMdx(full);
    return name.endsWith('.mdx') ? [full] : [];
  });
}

if (!existsSync(root)) {
  console.error(`글 폴더가 없어요: ${root}`);
  process.exit(1);
}

const files: SourceFile[] = listMdx(root).map((full) => ({
  file: relative(process.cwd(), full),
  id: relative(root, full).split(sep).join('/').replace(/\.mdx$/, ''),
  source: readFileSync(full, 'utf8'),
}));

const ctx: LintContext = { docs: new Map() };
for (const f of files) {
  const meta = collectMeta(f);
  if (meta) ctx.docs.set(meta.id, meta);
}

const issues = files.flatMap((f) => lintSource(f, ctx));
for (const i of issues) console.log(`${i.file}:${i.line}:${i.column} [${i.rule}] ${i.message}`);
console.log(`글 ${files.length}편 검사, 위반 ${issues.length}건`);
process.exitCode = issues.length > 0 ? 1 : 0;
