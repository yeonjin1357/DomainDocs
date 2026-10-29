import type { Heading, Root, RootContent } from 'mdast';
import { visit } from 'unist-util-visit';
import { visitParents } from 'unist-util-visit-parents';
import {
  componentChildren,
  jsxAttrs,
  jsxOnlyParagraph,
  parseErrorLocation,
  parseMdx,
  readFrontmatter,
  type JsxElement,
} from '../../src/lib/mdx/parse';
import { endsPolitely, extractProse, findBanned, sentencesOf } from '../../src/lib/mdx/prose';
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
  | 'analogy-limit'
  | 'glossary'
  | 'quiz'
  | 'reference'
  | 'markdown-link'
  | 'unknown-component'
  | 'demo-hydration';

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

export type DocType = 'overview' | 'concept' | 'guide';

export interface DocMeta {
  id: string;
  type: DocType | null;
  draft: boolean;
}

/** 용어 파일의 용어 하나. key는 영역/id 형식이다. */
export interface TermMeta {
  key: string;
  doc?: string;
}

export interface LintContext {
  docs: Map<string, DocMeta>;
  terms: Map<string, TermMeta>;
}

type Report = (rule: RuleId, line: number, column: number, message: string) => void;

/** 개념·한눈에 보기 글 최상위에 둘 수 있는 블록 */
const DOC_BLOCKS = ['OnDashboard', 'KeyPoints', 'Analogy', 'Figure', 'Checkpoints', 'Deeper'];
/** 글마다 한 번까지만 쓰는 블록 */
const ONCE_BLOCKS = ['KeyPoints', 'Analogy', 'Checkpoints', 'Deeper'];
/** 그림 컴포넌트. <Figure>나 <OnDashboard> 안에만 둔다. */
const FIGURE_COMPONENTS = ['MiniLineChart', 'StatTile', 'Waterfall', 'Scatter', 'ServiceMap', 'Flow', 'Sequence', 'Layers', 'Compare', 'Timeline', 'Strip'];
const GUIDE_BLOCKS = ['Situation', 'FirstLook', 'Checkpoints'];
const GUIDE_FREE_COMPONENTS = ['OnDashboard', 'Figure', 'Analogy'];
const FREE_NODES = ['paragraph', 'heading', 'list', 'table', 'code', 'blockquote'];
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

/** MDX 안 default import 이름. 경로가 .svg면 SVG 그림, 아니면 데모 컴포넌트다. */
function importedNames(tree: Root): { demos: Set<string>; svgs: Set<string> } {
  const demos = new Set<string>();
  const svgs = new Set<string>();
  for (const c of tree.children) {
    if (c.type !== 'mdxjsEsm') continue;
    for (const m of c.value.matchAll(/import\s+([A-Z]\w*)\s+from\s+['"]([^'"]+)['"]/g)) {
      (m[2].endsWith('.svg') ? svgs : demos).add(m[1]);
    }
  }
  return { demos, svgs };
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

const isH2 = (item: TopItem) => item.kind === 'node' && item.node.type === 'heading' && (item.node as Heading).depth === 2;
const componentName = (item: TopItem) => (item.kind === 'component' ? item.name : null);

/**
 * 개념·한눈에 보기 글의 틀. 블록 사이 순서는 자유지만, Checkpoints 뒤에는 Deeper만, Deeper는 맨 끝에 온다.
 * 기존 글(OnDashboard → KeyPoints → Checkpoints → Deeper)도 그대로 통과한다.
 * SVG 그림의 자리는 checkComponents가 본다.
 */
function checkFlexibleStructure(items: TopItem[], demos: Set<string>, svgs: Set<string>, type: 'overview' | 'concept', stage: unknown, report: Report): void {
  const valid: TopItem[] = [];
  const counts = new Map<string, number>();
  for (const item of items) {
    if (item.kind === 'node') {
      if (!FREE_NODES.includes(item.node.type)) {
        report('structure', item.line, 1, `글 최상위에 ${NODE_LABEL[item.node.type] ?? item.node.type}을(를) 둘 수 없어요.`);
        continue;
      }
      if (item.node.type === 'heading' && (item.node as Heading).depth === 1) {
        report('structure', item.line, 1, '소제목은 ##부터 써요. #은 페이지 제목에만 써요.');
        continue;
      }
    } else if (svgs.has(item.name)) {
      continue;
    } else if (FIGURE_COMPONENTS.includes(item.name)) {
      report('structure', item.line, 1, `그림은 <Figure>나 <OnDashboard> 안에 둬요. <${item.name}>을(를) 옮기세요.`);
      continue;
    } else if (!DOC_BLOCKS.includes(item.name) && !demos.has(item.name)) {
      report('structure', item.line, 1, `<${item.name}>은(는) 글 최상위에 둘 수 없어요.`);
      continue;
    } else if (ONCE_BLOCKS.includes(item.name)) {
      const n = (counts.get(item.name) ?? 0) + 1;
      counts.set(item.name, n);
      if (n === 2) report('structure', item.line, 1, `<${item.name}>은(는) 한 번만 써요.`);
    }
    valid.push(item);
  }

  const checkpointsAt = valid.findIndex((i) => componentName(i) === 'Checkpoints');
  const deeperAt = valid.findIndex((i) => componentName(i) === 'Deeper');
  if (deeperAt !== -1 && deeperAt !== valid.length - 1) {
    report('structure', valid[deeperAt].line, 1, '<Deeper>는 글 맨 끝에 둬요.');
  }
  if (checkpointsAt !== -1) {
    for (const item of valid.slice(checkpointsAt + 1)) {
      if (componentName(item) !== 'Deeper') report('structure', item.line, 1, '<Checkpoints> 뒤에는 <Deeper>만 둘 수 있어요.');
    }
  }

  const firstLine = items[0]?.line ?? 1;
  const keyPoints = counts.get('KeyPoints') ?? 0;
  const hasH2 = valid.some(isH2);
  if (type === 'concept') {
    if (keyPoints === 0) report('structure', firstLine, 1, '개념 글에는 <KeyPoints>가 필요해요.');
    if (stage === 'basics' && !hasH2) report('structure', firstLine, 1, '기초 글에는 본문 설명(## 소제목)이 1개 이상 필요해요.');
  } else {
    const at = valid.find((i) => componentName(i) === 'KeyPoints');
    if (at) report('structure', at.line, 1, '한눈에 보기 글에는 <KeyPoints>를 쓰지 않아요.');
    if (!valid.some((i) => componentName(i) === 'Figure')) report('structure', firstLine, 1, '한눈에 보기 글에는 <Figure>가 1개 이상 필요해요.');
    if (!hasH2) report('structure', firstLine, 1, '한눈에 보기 글에는 ## 소제목이 1개 이상 필요해요.');
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
    } else if (!FREE_NODES.includes(item.node.type)) {
      report('structure', item.line, 1, `가이드 본문에 ${NODE_LABEL[item.node.type] ?? item.node.type}을(를) 둘 수 없어요.`);
    } else if (item.node.type === 'heading' && (item.node as Heading).depth === 1) {
      report('structure', item.line, 1, '가이드 본문 소제목은 ##부터 써요. #은 페이지 제목에만 써요.');
    }
  }
  const hasStep = middle.some(isH2);
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
    if (name === 'Analogy') {
      const limit = jsxAttrs(node).limit;
      if (typeof limit !== 'string' || limit.trim() === '') {
        report('analogy-limit', lineOf(node), columnOf(node), '<Analogy>에 limit(비유가 안 맞는 곳)이 필요해요.');
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

const MDX_COMPONENTS: readonly string[] = LINT_CONFIG.mdxComponents;

/** 등록된 컴포넌트와 import한 데모·SVG 그림만 쓰게 한다. 데모에는 client 지시어, SVG 그림에는 Figure와 aria-label이 있어야 한다. */
function checkComponents(tree: Root, demos: Set<string>, svgs: Set<string>, report: Report): void {
  visitParents(tree, (node, ancestors) => {
    if (!isJsx(node) || node.name == null) return;
    const name = node.name;
    if (svgs.has(name)) {
      if (!ancestors.some((a) => isJsx(a) && a.name === 'Figure')) {
        report('structure', lineOf(node), columnOf(node), `SVG 그림 <${name}>은(는) <Figure> 안에 둬요.`);
      }
      const label = jsxAttrs(node)['aria-label'];
      if (typeof label !== 'string' || label.trim() === '') {
        report('structure', lineOf(node), columnOf(node), `SVG 그림 <${name}>에 aria-label(그림 설명)이 필요해요.`);
      }
    } else if (demos.has(name)) {
      const hydrated = Object.keys(jsxAttrs(node)).some((k) => k.startsWith('client:'));
      if (!hydrated) {
        report('demo-hydration', lineOf(node), columnOf(node), `<${name}>에 client 지시어가 없어서 움직이지 않는 그림으로만 보여요. <${name} client:visible />로 쓰세요.`);
      }
    } else if (!MDX_COMPONENTS.includes(name)) {
      report(
        'unknown-component',
        lineOf(node),
        columnOf(node),
        `<${name}>은(는) 쓸 수 없는 요소예요. 등록된 컴포넌트나 default import한 데모만 써요. 다른 글은 <Term>으로 이어요.`,
      );
    }
  });
}

/** MDX 밖 글(용어의 뜻·비유 등)에 문장 규칙(길이·해요체·금지 표현)을 쓴다. 줄 번호는 부르는 쪽이 단다. */
export function lintProseText(text: string): { rule: RuleId; message: string }[] {
  const found: { rule: RuleId; message: string }[] = [];
  let tree: Root;
  try {
    tree = parseMdx(text);
  } catch {
    return [{ rule: 'glossary', message: `MDX로 읽을 수 없는 글자가 있어요: "${preview(text)}"` }];
  }
  checkProse(tree, (rule, _line, _column, message) => found.push({ rule, message }));
  return found;
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
      if (!endsPolitely(s.masked)) report('formal-ending', s.line, col, `해요체(~요)로 끝내 주세요: "${preview(s.text)}"`);
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
    const { slug, term } = jsxAttrs(node);
    if ((typeof slug === 'string') === (typeof term === 'string')) {
      report('reference', lineOf(node), columnOf(node), '<Term>에는 slug(글)와 term(용어) 중 하나만 써요.');
    } else if (typeof slug === 'string') {
      targets.push({ slug, line: lineOf(node), via: 'Term' });
    } else if (!ctx.terms.has(String(term))) {
      report('reference', lineOf(node), columnOf(node), `Term: 대상 용어가 없어요 (${String(term)}).`);
    }
  });
  const selfDraft = fm.draft === true;
  for (const t of targets) {
    const target = ctx.docs.get(t.slug);
    if (t.slug === src.id) report('reference', t.line, 1, `${t.via}: 자기 자신을 가리킬 수 없어요.`);
    else if (!target) report('reference', t.line, 1, `${t.via}: 대상 글이 없어요 (${t.slug}).`);
    else if (target.draft && !selfDraft) report('reference', t.line, 1, `${t.via}: 공개 글은 초안 글을 가리킬 수 없어요 (${t.slug}).`);
  }
}

const isDocType = (t: unknown): t is DocType => t === 'overview' || t === 'concept' || t === 'guide';

export function collectMeta(src: SourceFile): DocMeta | null {
  try {
    const fm = readFrontmatter(parseMdx(src.source));
    if (!fm) return null;
    const type = isDocType(fm.type) ? fm.type : null;
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

  let fm: Record<string, unknown> | null;
  try {
    fm = readFrontmatter(tree);
  } catch (e) {
    // 머리말 YAML 문법 오류(예: 따옴표 없는 %util)는 검사기를 멈추지 않고 위반 하나로 알린다.
    const pos = (e as { linePos?: { line: number; col: number }[] }).linePos?.[0];
    report('frontmatter', (pos?.line ?? 0) + 1, pos?.col ?? 1, `머리말 YAML을 읽을 수 없어요: ${(e as Error).message.split('\n')[0]}`);
    return issues;
  }
  if (!fm) {
    report('frontmatter', 1, 1, '머리말(---)이 없어요.');
    return issues;
  }
  if (!isDocType(fm.type)) {
    report('frontmatter', 1, 1, `type은 overview, concept, guide 중 하나여야 해요. 현재: ${String(fm.type)}`);
    return issues;
  }
  const type: DocType = fm.type;
  if (type === 'concept' && fm.stage !== 'basics' && fm.stage !== 'monitoring') {
    report('frontmatter', 1, 1, `개념 글에는 stage(basics 또는 monitoring)가 필요해요. 현재: ${String(fm.stage)}`);
  } else if (type !== 'concept' && fm.stage !== undefined) {
    report('frontmatter', 1, 1, 'stage는 개념 글에만 써요.');
  }
  const folder = src.id.split('/')[0];
  if (fm.domain !== folder) report('domain-folder', 1, 1, `domain(${String(fm.domain)})이 폴더(${folder})와 달라요.`);

  const items = topLevelItems(tree);
  const { demos, svgs } = importedNames(tree);
  if (type === 'guide') checkGuideStructure(items, demos, report);
  else checkFlexibleStructure(items, demos, svgs, type, fm.stage, report);
  checkBlocks(tree, report);
  checkComponents(tree, demos, svgs, report);
  checkProse(tree, report);

  checkReferences(tree, fm, src, ctx, report);
  visit(tree, 'link', (node) => {
    report('markdown-link', lineOf(node), columnOf(node), `본문에 마크다운 링크를 쓰지 않아요. 다른 글은 <Term>으로, 출처는 머리말 sources로 옮기세요 (${node.url}).`);
  });
  return issues;
}
