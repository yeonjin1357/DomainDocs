import type { Root } from 'mdast';
import { visit } from 'unist-util-visit';
import { componentChildren, jsxAttrs, parseMdx, type JsxElement } from './parse';
import { extractProse, sentencesOf } from './prose';

export const CHARS_PER_MINUTE = 500;

export function proseChars(tree: Root, opts: { excludeDeeper: boolean }): number {
  return extractProse(tree)
    .filter((u) => !(opts.excludeDeeper && u.ancestors.includes('Deeper')))
    .flatMap((u) => sentencesOf(u))
    .reduce((sum, s) => sum + s.length, 0);
}

function isJsx(node: { type: string }): node is JsxElement {
  return node.type === 'mdxJsxFlowElement' || node.type === 'mdxJsxTextElement';
}

export function extractTermSlugs(tree: Root): string[] {
  const slugs: string[] = [];
  visit(tree, (node) => {
    if (!isJsx(node) || node.name !== 'Term') return;
    const slug = jsxAttrs(node).slug;
    if (typeof slug === 'string' && !slugs.includes(slug)) slugs.push(slug);
  });
  return slugs;
}

export function extractPointTitles(tree: Root): string[] {
  const keyPoints = componentChildren(tree).find((el) => el.name === 'KeyPoints');
  if (!keyPoints || keyPoints.type !== 'mdxJsxFlowElement') return [];
  return componentChildren(keyPoints)
    .filter((el) => el.name === 'Point')
    .map((el) => jsxAttrs(el).title)
    .filter((t): t is string => typeof t === 'string');
}

export interface BodyAnalysis {
  readingMinutes: number;
  termSlugs: string[];
  pointTitles: string[];
}

export function analyzeBody(body: string): BodyAnalysis {
  const tree = parseMdx(body);
  return {
    readingMinutes: Math.max(1, Math.ceil(proseChars(tree, { excludeDeeper: true }) / CHARS_PER_MINUTE)),
    termSlugs: extractTermSlugs(tree),
    pointTitles: extractPointTitles(tree),
  };
}
