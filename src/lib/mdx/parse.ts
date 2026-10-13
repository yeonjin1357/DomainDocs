import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMdx from 'remark-mdx';
import { parse as parseYaml } from 'yaml';
import type { Paragraph, PhrasingContent, Root, RootContent, Yaml } from 'mdast';
import type { MdxJsxAttribute, MdxJsxFlowElement, MdxJsxTextElement } from 'mdast-util-mdx';

// astro.config.mjs와 같은 해석: GFM 표는 켜고, 물결표 하나짜리 취소선은 끈다.
const processor = unified()
  .use(remarkParse)
  .use(remarkFrontmatter, ['yaml'])
  .use(remarkGfm, { singleTilde: false })
  .use(remarkMdx);

/** 잘못된 MDX면 VFileMessage(.line, .column, .reason)를 던진다. */
export function parseMdx(source: string): Root {
  return processor.parse(source.replace(/\r\n?/g, '\n')) as Root;
}

/** 파일 끝에서 닫히지 않은 태그는 line이 비어 있어 reason의 "(줄:칸" 표기에서 위치를 읽는다. */
export function parseErrorLocation(e: { line?: number; column?: number; reason?: string }): { line: number; column: number } {
  if (e.line != null) return { line: e.line, column: e.column ?? 1 };
  const m = /\((\d+):(\d+)/.exec(e.reason ?? '');
  return m ? { line: Number(m[1]), column: Number(m[2]) } : { line: 1, column: 1 };
}

export function readFrontmatter(tree: Root): Record<string, unknown> | null {
  const node = tree.children.find((n): n is Yaml => n.type === 'yaml');
  if (!node) return null;
  const data: unknown = parseYaml(node.value);
  return data && typeof data === 'object' ? (data as Record<string, unknown>) : null;
}

export type JsxElement = MdxJsxFlowElement | MdxJsxTextElement;

export function jsxAttrs(el: JsxElement): Record<string, string | true | { expression: string }> {
  const out: Record<string, string | true | { expression: string }> = {};
  for (const a of el.attributes) {
    if (a.type !== 'mdxJsxAttribute') continue;
    const attr = a as MdxJsxAttribute;
    if (attr.value == null) out[attr.name] = true;
    else if (typeof attr.value === 'string') out[attr.name] = attr.value;
    else out[attr.name] = { expression: attr.value.value };
  }
  return out;
}

const isBlankText = (n: PhrasingContent) => n.type === 'text' && n.value.trim() === '';

/** `<Check>…</Check>`처럼 한 줄에 JSX만 있는 단락이면 그 요소들을 돌려준다. */
export function jsxOnlyParagraph(p: Paragraph): MdxJsxTextElement[] | null {
  const meaningful = p.children.filter((c) => !isBlankText(c));
  return meaningful.length > 0 && meaningful.every((c) => c.type === 'mdxJsxTextElement')
    ? (meaningful as MdxJsxTextElement[])
    : null;
}

/** 자식 컴포넌트를 순서대로 돌려준다. 한 줄짜리 컴포넌트 단락은 풀어서 센다. */
export function componentChildren(parent: Root | MdxJsxFlowElement): JsxElement[] {
  const out: JsxElement[] = [];
  for (const c of parent.children as RootContent[]) {
    if (c.type === 'mdxJsxFlowElement') out.push(c);
    else if (c.type === 'paragraph') out.push(...(jsxOnlyParagraph(c) ?? []));
  }
  return out;
}
