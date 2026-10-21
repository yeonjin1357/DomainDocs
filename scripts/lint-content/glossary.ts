import { isMap, isScalar, isSeq, LineCounter, parseDocument, type YAMLMap } from 'yaml';
import { DOMAIN_IDS } from '../../src/data/domains';
import { lintProseText, type LintContext, type LintIssue, type RuleId, type TermMeta } from './rules';

export interface GlossaryFile {
  file: string;
  /** 파일 이름. 영역 id여야 한다. */
  domain: string;
  source: string;
}

const ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const FIELDS = ['id', 'name', 'en', 'aliases', 'short', 'analogy', 'doc'];
const MAX = { name: 30, short: 60 };

const chars = (s: string) => [...s].length;

/** 용어 목록을 읽는다. 형식이 틀려도 읽을 수 있는 용어는 돌려준다(글 검사의 <Term term> 확인에 쓴다). */
function readTerms(source: string): { items: { node: YAMLMap; line: number }[]; error?: { line: number; message: string } } {
  const lineCounter = new LineCounter();
  const doc = parseDocument(source, { lineCounter });
  if (doc.errors.length > 0) {
    const e = doc.errors[0];
    return { items: [], error: { line: e.linePos?.[0].line ?? 1, message: `YAML 문법 오류예요: ${e.message.split('\n')[0]}` } };
  }
  const terms = isMap(doc.contents) ? doc.contents.get('terms', true) : undefined;
  if (!isSeq(terms) || terms.items.length === 0) return { items: [], error: { line: 1, message: 'terms 아래에 용어를 1개 이상 적어요.' } };
  return {
    items: terms.items.map((node) => ({
      node: node as YAMLMap,
      line: lineCounter.linePos((node as { range?: [number, number, number] }).range?.[0] ?? 0).line,
    })),
  };
}

const str = (node: YAMLMap, key: string): string | undefined => {
  const v = node.get(key);
  return typeof v === 'string' ? v : undefined;
};

/** 글 검사 전에 용어 키를 모은다. 읽을 수 없는 파일은 건너뛴다(위반은 lintGlossaryFile이 낸다). */
export function collectTerms(file: GlossaryFile): TermMeta[] {
  return readTerms(file.source).items.flatMap(({ node }) => {
    const id = isMap(node) ? str(node, 'id') : undefined;
    return id ? [{ key: `${file.domain}/${id}`, doc: str(node, 'doc') }] : [];
  });
}

export function lintGlossaryFile(file: GlossaryFile, ctx: LintContext): LintIssue[] {
  const issues: LintIssue[] = [];
  const report = (rule: RuleId, line: number, message: string) => issues.push({ file: file.file, line, column: 1, rule, message });

  if (!(DOMAIN_IDS as readonly string[]).includes(file.domain)) {
    report('glossary', 1, `파일 이름(${file.domain})이 영역 id가 아니에요. ${DOMAIN_IDS.join(', ')} 중 하나로 써요.`);
  }
  const { items, error } = readTerms(file.source);
  if (error) {
    report('glossary', error.line, error.message);
    return issues;
  }

  const seen = new Set<string>();
  for (const { node, line } of items) {
    if (!isMap(node)) {
      report('glossary', line, '용어는 id, name, short를 가진 항목으로 써요.');
      continue;
    }
    for (const pair of node.items) {
      const key = isScalar(pair.key) ? String(pair.key.value) : String(pair.key);
      if (!FIELDS.includes(key)) report('glossary', line, `모르는 필드예요 (${key}). ${FIELDS.join(', ')}만 써요.`);
    }
    const id = str(node, 'id');
    if (id === undefined || !ID_PATTERN.test(id)) report('glossary', line, `id는 소문자·숫자·하이픈으로 써요 (${String(node.get('id'))}).`);
    else if (seen.has(id)) report('glossary', line, `같은 id가 두 번 나와요 (${id}).`);
    else seen.add(id);

    const name = str(node, 'name');
    if (!name) report('glossary', line, 'name(보여 줄 이름)이 필요해요.');
    else if (chars(name) > MAX.name) report('glossary', line, `name이 ${chars(name)}자예요 (최대 ${MAX.name}자).`);

    const short = str(node, 'short');
    if (!short) report('glossary', line, 'short(한 줄 뜻)가 필요해요.');
    else if (chars(short) > MAX.short) report('glossary', line, `short가 ${chars(short)}자예요 (최대 ${MAX.short}자).`);

    const aliases = node.get('aliases');
    if (aliases !== undefined && !(isSeq(aliases) && aliases.items.every((a) => isScalar(a) && typeof a.value === 'string'))) {
      report('glossary', line, 'aliases는 글자 목록으로 써요. 예: [에스엔엠피]');
    }

    for (const text of [short, str(node, 'analogy')]) {
      if (text) for (const p of lintProseText(text)) report(p.rule, line, p.message);
    }

    const doc = str(node, 'doc');
    if (doc !== undefined) {
      const target = ctx.docs.get(doc);
      if (!target) report('reference', line, `doc: 대상 글이 없어요 (${doc}).`);
      else if (target.draft) report('reference', line, `doc: 용어는 초안 글을 가리킬 수 없어요 (${doc}).`);
    }
  }
  return issues;
}
