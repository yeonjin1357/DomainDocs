import type { Heading, Root, RootContent } from 'mdast';
import { visit } from 'unist-util-visit';
import {
  componentChildren,
  jsxAttrs,
  jsxOnlyParagraph,
  parseErrorLocation,
  parseMdx,
  readFrontmatter,
  type JsxElement,
} from '../../src/lib/mdx/parse';
import { extractProse, findBanned, FORMAL_ENDING, sentencesOf } from '../../src/lib/mdx/prose';
import { proseChars } from '../../src/lib/mdx/analyze';
import { LINT_CONFIG } from './config';

export type RuleId =
  | 'parse'
  | 'frontmatter'
  | 'domain-folder'
  | 'structure'
  | 'block-children'
  | 'block-title'
  | 'sentence-length'
  | 'paragraph-length'
  | 'formal-ending'
  | 'banned-phrase'
  | 'body-length'
  | 'reference'
  | 'markdown-link';

export interface LintIssue {
  file: string;
  line: number;
  column: number;
  rule: RuleId;
  message: string;
}

export interface SourceFile {
  file: string;
  /** foundations/percentiles 형식 */
  id: string;
  source: string;
}

export type DocType = 'concept' | 'guide';

export interface DocMeta {
  id: string;
  type: DocType | null;
  draft: boolean;
}

export interface LintContext {
  docs: Map<string, DocMeta>;
}

type Report = (rule: RuleId, line: number, column: number, message: string) => void;

const CONCEPT_BLOCKS = ['OnDashboard', 'KeyPoints', 'Checkpoints', 'Deeper'];
const GUIDE_BLOCKS = ['Situation', 'FirstLook', 'Checkpoints'];
const GUIDE_FREE_COMPONENTS = ['OnDashboard'];
const GUIDE_FREE_NODES = ['paragraph', 'heading', 'list', 'table', 'code', 'blockquote'];
const CHILD_RULES: Record<string, { child: string; min: number; max: number }> = {
  KeyPoints: { child: 'Point', min: 1, max: 3 },
  FirstLook: { child: 'Item', min: 1, max: 3 },
  Checkpoints: { child: 'Check', min: 1, max: Number.POSITIVE_INFINITY },
};
const TITLED = ['Point', 'Item'];

type TopItem =
  | { kind: 'component'; name: string; line: number }
  | { kind: 'node'; node: RootContent; line: number };

const lineOf = (node: { position?: { start: { line: number } } }) => node.position?.start.line ?? 1;
const columnOf = (node: { position?: { start: { column: number } } }) => node.position?.start.column ?? 1;
const preview = (text: string) => ([...text].length > 24 ? `${[...text].slice(0, 24).join('')}…` : text);

function topLevelItems(tree: Root): TopItem[] {
  const items: TopItem[] = [];
  for (const c of tree.children) {
    if (c.type === 'yaml' || c.type === 'mdxjsEsm') continue;
    if (c.type === 'mdxJsxFlowElement') {
      items.push({ kind: 'component', name: c.name ?? '', line: lineOf(c) });
      continue;
    }
    if (c.type === 'paragraph') {
      const els = jsxOnlyParagraph(c);
      if (els) {
        for (const el of els) items.push({ kind: 'component', name: el.name ?? '', line: lineOf(el) });
        continue;
      }
    }
    items.push({ kind: 'node', node: c, line: lineOf(c) });
  }
  return items;
}

/** MDX 안 default import 이름(데모 컴포넌트). */
function importedNames(tree: Root): Set<string> {
  const names = new Set<string>();
  for (const c of tree.children) {
    if (c.type !== 'mdxjsEsm') continue;
    for (const m of c.value.matchAll(/import\s+([A-Z]\w*)\s+from/g)) names.add(m[1]);
  }
  return names;
}

const NODE_LABEL: Record<string, string> = {
  paragraph: '일반 단락',
  heading: '소제목',
  list: '목록',
  table: '표',
  code: '코드 블록',
  blockquote: '인용',
  thematicBreak: '구분선',
};

function checkConceptStructure(items: TopItem[], demos: Set<string>, report: Report): void {
  for (const item of items) {
    if (item.kind === 'node') {
      const label = NODE_LABEL[item.node.type] ?? item.node.type;
      report('structure', item.line, 1, `개념 글 최상위에는 틀 블록과 데모만 둘 수 있어요. ${label}을(를) 블록 안으로 옮기세요.`);
    } else if (!CONCEPT_BLOCKS.includes(item.name) && !demos.has(item.name)) {
      report('structure', item.line, 1, `<${item.name}>은(는) 개념 글 최상위에 둘 수 없어요.`);
    }
  }
  const seq = items.flatMap((i) => (i.kind === 'component' && CONCEPT_BLOCKS.includes(i.name) ? [i.name] : []));
  const expected = seq.at(-1) === 'Deeper' ? CONCEPT_BLOCKS : CONCEPT_BLOCKS.slice(0, 3);
  if (seq.join() !== expected.join()) {
    const first = items.find((i) => i.kind === 'component');
    report(
      'structure',
      first?.line ?? 1,
      1,
      `개념 글 블록은 OnDashboard → KeyPoints → Checkpoints → (Deeper) 순서여야 해요. 현재: ${seq.join(' → ') || '없음'}`,
    );
  }
}

function checkGuideStructure(items: TopItem[], demos: Set<string>, report: Report): void {
  const nameAt = (i: number) => {
    const item = items.at(i);
    return item?.kind === 'component' ? item.name : null;
  };
  const seq = items.flatMap((i) => (i.kind === 'component' && GUIDE_BLOCKS.includes(i.name) ? [i.name] : []));
  if (nameAt(0) !== 'Situation' || nameAt(1) !== 'FirstLook' || nameAt(-1) !== 'Checkpoints' || seq.length !== 3) {
    report('structure', items[0]?.line ?? 1, 1, `가이드는 Situation → FirstLook → (단계별 설명) → Checkpoints 순서여야 해요. 현재 블록: ${seq.join(' → ') || '없음'}`);
    return;
  }
  const middle = items.slice(2, -1);
  for (const item of middle) {
    if (item.kind === 'component') {
      if (!GUIDE_FREE_COMPONENTS.includes(item.name) && !demos.has(item.name)) {
        report('structure', item.line, 1, `<${item.name}>은(는) 가이드 본문에 둘 수 없어요.`);
      }
    } else if (!GUIDE_FREE_NODES.includes(item.node.type)) {
      report('structure', item.line, 1, `가이드 본문에 ${NODE_LABEL[item.node.type] ?? item.node.type}을(를) 둘 수 없어요.`);
    } else if (item.node.type === 'heading' && (item.node as Heading).depth === 1) {
      report('structure', item.line, 1, '가이드 본문 소제목은 ##부터 써요. #은 페이지 제목에만 써요.');
    }
  }
  const hasStep = middle.some((i) => i.kind === 'node' && i.node.type === 'heading' && (i.node as Heading).depth === 2);
  if (!hasStep) report('structure', middle[0]?.line ?? items[1].line, 1, '가이드에는 단계별 설명(## 소제목)이 1개 이상 필요해요.');
}

function isJsx(node: { type: string }): node is JsxElement {
  return node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement';
}

function checkBlocks(tree: Root, report: Report): void {
  visit(tree, (node) => {
    if (!isJsx(node)) return;
    const name = node.name ?? '';
    const rule = CHILD_RULES[name];
    if (rule && node.type === 'mdxJsxFlowElement') {
      for (const c of node.children) {
        const ok =
          (c.type === 'mdxJsxFlowElement' && c.name === rule.child) ||
          (c.type === 'paragraph' && (jsxOnlyParagraph(c)?.every((x) => x.name === rule.child) ?? false));
        if (!ok) report('block-children', lineOf(c), columnOf(c), `<${name}> 안에는 <${rule.child}>만 둘 수 있어요.`);
      }
      const n = componentChildren(node).filter((x) => x.name === rule.child).length;
      if (n < rule.min || n > rule.max) {
        const range = Number.isFinite(rule.max) ? `${rule.min}~${rule.max}개` : `${rule.min}개 이상`;
        report('block-children', lineOf(node), columnOf(node), `<${name}> 안의 <${rule.child}>는 ${range}여야 해요. 현재 ${n}개예요.`);
      }
    }
    if (TITLED.includes(name)) {
      const title = jsxAttrs(node).title;
      if (typeof title !== 'string' || title.trim() === '') {
        report('block-title', lineOf(node), columnOf(node), `<${name}>에 title이 필요해요.`);
      } else if ([...title].length > LINT_CONFIG.maxBlockTitleChars) {
        report('block-title', lineOf(node), columnOf(node), `<${name}> 제목이 ${[...title].length}자예요 (최대 ${LINT_CONFIG.maxBlockTitleChars}자).`);
      }
    }
  });
}

function checkProse(tree: Root, report: Report): void {
  for (const unit of extractProse(tree)) {
    const sentences = sentencesOf(unit);
    if (sentences.length > LINT_CONFIG.maxSentencesPerParagraph) {
      report('paragraph-length', unit.line, 1, `한 단락에 문장이 ${sentences.length}개예요 (최대 ${LINT_CONFIG.maxSentencesPerParagraph}개). 단락을 나누세요.`);
    }
    for (const s of sentences) {
      const col = s.column || 1;
      if (s.length > LINT_CONFIG.maxSentenceChars) {
        report('sentence-length', s.line, col, `문장이 ${s.length}자예요 (최대 ${LINT_CONFIG.maxSentenceChars}자): "${preview(s.text)}"`);
      }
      if (FORMAL_ENDING.test(s.masked)) report('formal-ending', s.line, col, `해요체로 써 주세요: "${preview(s.text)}"`);
      if (unit.ancestors.includes('Deeper')) continue;
      for (const b of findBanned(s, LINT_CONFIG.bannedPhrases)) {
        report('banned-phrase', s.line, col, `본문에 쓰지 않는 표현이에요("${b}"). 꼭 필요하면 <Deeper>로 옮기세요.`);
      }
    }
  }
}

function checkReferences(tree: Root, fm: Record<string, unknown>, src: SourceFile, ctx: LintContext, report: Report): void {
  const targets: { slug: string; line: number; via: string }[] = [];
  if (Array.isArray(fm.related)) for (const r of fm.related) targets.push({ slug: String(r), line: 1, via: 'related' });
  visit(tree, (node) => {
    if (!isJsx(node) || node.name !== 'Term') return;
    const slug = jsxAttrs(node).slug;
    if (typeof slug !== 'string') report('reference', lineOf(node), columnOf(node), '<Term>에 slug가 필요해요.');
    else targets.push({ slug, line: lineOf(node), via: 'Term' });
  });
  const selfDraft = fm.draft === true;
  for (const t of targets) {
    const target = ctx.docs.get(t.slug);
    if (t.slug === src.id) report('reference', t.line, 1, `${t.via}: 자기 자신을 가리킬 수 없어요.`);
    else if (!target) report('reference', t.line, 1, `${t.via}: 대상 글이 없어요 (${t.slug}).`);
    else if (target.draft && !selfDraft) report('reference', t.line, 1, `${t.via}: 공개 글은 초안 글을 가리킬 수 없어요 (${t.slug}).`);
  }
}

export function collectMeta(src: SourceFile): DocMeta | null {
  try {
    const fm = readFrontmatter(parseMdx(src.source));
    if (!fm) return null;
    const type = fm.type === 'concept' || fm.type === 'guide' ? fm.type : null;
    return { id: src.id, type, draft: fm.draft === true };
  } catch {
    return null;
  }
}

export function lintSource(src: SourceFile, ctx: LintContext): LintIssue[] {
  const issues: LintIssue[] = [];
  const report: Report = (rule, line, column, message) => issues.push({ file: src.file, line, column, rule, message });

  let tree: Root;
  try {
    tree = parseMdx(src.source);
  } catch (e) {
    const err = e as { line?: number; column?: number; reason?: string };
    const loc = parseErrorLocation(err);
    report('parse', loc.line, loc.column, `MDX를 읽을 수 없어요: ${err.reason ?? String(e)}`);
    return issues;
  }

  const fm = readFrontmatter(tree);
  if (!fm) {
    report('frontmatter', 1, 1, '머리말(---)이 없어요.');
    return issues;
  }
  if (fm.type !== 'concept' && fm.type !== 'guide') {
    report('frontmatter', 1, 1, `type은 concept 또는 guide여야 해요. 현재: ${String(fm.type)}`);
    return issues;
  }
  const type: DocType = fm.type;
  const folder = src.id.split('/')[0];
  if (fm.domain !== folder) report('domain-folder', 1, 1, `domain(${String(fm.domain)})이 폴더(${folder})와 달라요.`);

  const items = topLevelItems(tree);
  const demos = importedNames(tree);
  if (type === 'concept') checkConceptStructure(items, demos, report);
  else checkGuideStructure(items, demos, report);
  checkBlocks(tree, report);
  checkProse(tree, report);

  const chars = proseChars(tree, { excludeDeeper: true });
  const max = LINT_CONFIG.maxBodyChars[type];
  if (chars > max) {
    report('body-length', 1, 1, `본문이 ${chars}자예요 (${type === 'concept' ? '개념' : '가이드'} 최대 ${max}자, '더 깊이' 제외).`);
  }

  checkReferences(tree, fm, src, ctx, report);
  visit(tree, 'link', (node) => {
    report('markdown-link', lineOf(node), columnOf(node), `본문에 마크다운 링크를 쓰지 않아요. 다른 글은 <Term>으로, 출처는 머리말 sources로 옮기세요 (${node.url}).`);
  });
  return issues;
}
