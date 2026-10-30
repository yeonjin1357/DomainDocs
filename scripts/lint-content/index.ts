import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { collectTerms, lintGlossaryFile, type GlossaryFile } from './glossary';
import { lintQuizBank, lintQuizFile, type QuizFile } from './quiz';
import { collectMeta, lintSource, type LintContext, type SourceFile } from './rules';

const root = process.env.DOCS_CONTENT_DIR ?? 'src/content/docs';
const termsRoot = process.env.TERMS_CONTENT_DIR ?? 'src/content/terms';
const quizzesRoot = process.env.QUIZZES_CONTENT_DIR ?? 'src/content/quizzes';

function listFiles(dir: string, ext: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) return listFiles(full, ext);
    return name.endsWith(ext) ? [full] : [];
  });
}

if (!existsSync(root)) {
  console.error(`글 폴더가 없어요: ${root}`);
  process.exit(1);
}

const files: SourceFile[] = listFiles(root, '.mdx').map((full) => ({
  file: relative(process.cwd(), full),
  id: relative(root, full).split(sep).join('/').replace(/\.mdx$/, ''),
  source: readFileSync(full, 'utf8'),
}));

// 용어 폴더는 없어도 된다(용어가 아직 없는 경우).
const glossaries: GlossaryFile[] = existsSync(termsRoot)
  ? readdirSync(termsRoot)
      .filter((name) => name.endsWith('.yaml'))
      .map((name) => ({
        file: relative(process.cwd(), join(termsRoot, name)),
        domain: name.replace(/\.yaml$/, ''),
        source: readFileSync(join(termsRoot, name), 'utf8'),
      }))
  : [];

// 문제 파일은 글과 같은 경로에 둔다(quizzes/{domain}/{slug}.yaml). 폴더는 없어도 된다.
const quizzes: QuizFile[] = existsSync(quizzesRoot)
  ? listFiles(quizzesRoot, '.yaml').map((full) => ({
      file: relative(process.cwd(), full),
      id: relative(quizzesRoot, full).split(sep).join('/').replace(/\.yaml$/, ''),
      source: readFileSync(full, 'utf8'),
    }))
  : [];

const ctx: LintContext = { docs: new Map(), terms: new Map() };
for (const f of files) {
  const meta = collectMeta(f);
  if (meta) ctx.docs.set(meta.id, meta);
}
for (const g of glossaries) for (const t of collectTerms(g)) ctx.terms.set(t.key, t);

const issues = [
  ...files.flatMap((f) => lintSource(f, ctx)),
  ...glossaries.flatMap((g) => lintGlossaryFile(g, ctx)),
  ...quizzes.flatMap((q) => lintQuizFile(q, ctx)),
  ...lintQuizBank(quizzes, quizzesRoot),
];
for (const i of issues) console.log(`${i.file}:${i.line}:${i.column} [${i.rule}] ${i.message}`);
console.log(`글 ${files.length}편, 용어 파일 ${glossaries.length}개, 문제 파일 ${quizzes.length}개 검사, 위반 ${issues.length}건`);
process.exitCode = issues.length > 0 ? 1 : 0;
