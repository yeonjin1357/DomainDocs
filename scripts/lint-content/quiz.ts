import { isMap, isScalar, isSeq, LineCounter, parseDocument, type YAMLMap } from 'yaml';
import { lintProseText, type LintContext, type LintIssue, type RuleId } from './rules';

export interface QuizFile {
  file: string;
  /** 문제가 딸린 글 id(예: network/snmp). 파일 경로에서 온다. */
  id: string;
  source: string;
}

const ID_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const TYPES = ['ox', 'choice', 'input'];
const FIELDS = ['id', 'type', 'prompt', 'choices', 'answer', 'explain', 'doc', 'term'];
const MAX_PROMPT = 200;
const CHOICE_COUNT = 4;

const chars = (s: string) => [...s].length;
const str = (node: YAMLMap, key: string): string | undefined => {
  const v = node.get(key);
  return typeof v === 'string' ? v : undefined;
};
const strings = (node: unknown): string[] | undefined =>
  isSeq(node) && node.items.every((i) => isScalar(i) && typeof i.value === 'string') ? node.items.map((i) => String((i as { value: string }).value)) : undefined;

export function lintQuizFile(file: QuizFile, ctx: LintContext): LintIssue[] {
  const issues: LintIssue[] = [];
  const report = (rule: RuleId, line: number, message: string) => issues.push({ file: file.file, line, column: 1, rule, message });

  const target = ctx.docs.get(file.id);
  if (!target) report('reference', 1, `문제 파일은 글과 같은 경로에 둬요. 글이 없어요 (${file.id}).`);
  else if (target.draft) report('reference', 1, `초안 글에는 문제를 붙이지 않아요 (${file.id}).`);

  const lineCounter = new LineCounter();
  const doc = parseDocument(file.source, { lineCounter });
  if (doc.errors.length > 0) {
    const e = doc.errors[0];
    report('quiz', e.linePos?.[0].line ?? 1, `YAML 문법 오류예요: ${e.message.split('\n')[0]}`);
    return issues;
  }
  const questions = isMap(doc.contents) ? doc.contents.get('questions', true) : undefined;
  if (!isSeq(questions) || questions.items.length === 0) {
    report('quiz', 1, 'questions 아래에 문제를 1개 이상 적어요.');
    return issues;
  }

  const seen = new Set<string>();
  for (const item of questions.items) {
    const line = lineCounter.linePos((item as { range?: [number, number, number] }).range?.[0] ?? 0).line;
    if (!isMap(item)) {
      report('quiz', line, '문제는 id, type, prompt, answer, explain을 가진 항목으로 써요.');
      continue;
    }
    const node = item as YAMLMap;
    for (const pair of node.items) {
      const key = isScalar(pair.key) ? String(pair.key.value) : String(pair.key);
      if (!FIELDS.includes(key)) report('quiz', line, `모르는 필드예요 (${key}). ${FIELDS.join(', ')}만 써요.`);
    }

    const id = str(node, 'id');
    if (id === undefined || !ID_PATTERN.test(id)) report('quiz', line, `id는 소문자·숫자·하이픈으로 써요 (${String(node.get('id'))}).`);
    else if (seen.has(id)) report('quiz', line, `같은 id가 두 번 나와요 (${id}).`);
    else seen.add(id);

    const prompt = str(node, 'prompt');
    if (!prompt) report('quiz', line, 'prompt(문제)가 필요해요.');
    else if (chars(prompt) > MAX_PROMPT) report('quiz', line, `prompt가 ${chars(prompt)}자예요 (최대 ${MAX_PROMPT}자).`);

    const explain = str(node, 'explain');
    if (!explain) report('quiz', line, 'explain(해설)이 필요해요.');
    else for (const p of lintProseText(explain)) report(p.rule === 'glossary' ? 'quiz' : p.rule, line, p.message);

    const type = str(node, 'type');
    const answer = node.get('answer', true);
    const answerValue = node.get('answer');
    if (!type || !TYPES.includes(type)) {
      report('quiz', line, `type은 ${TYPES.join(', ')} 중 하나로 써요 (${String(node.get('type'))}).`);
    } else if (type === 'ox') {
      if (typeof answerValue !== 'boolean') report('quiz', line, 'OX 문제의 answer는 true나 false로 써요.');
    } else if (type === 'choice') {
      const choices = strings(node.get('choices', true));
      if (!choices || choices.length !== CHOICE_COUNT) report('quiz', line, `객관식은 보기(choices)를 ${CHOICE_COUNT}개 써요.`);
      else if (new Set(choices).size !== choices.length) report('quiz', line, '같은 보기가 두 번 나와요.');
      else if (!(typeof answerValue === 'number' && Number.isInteger(answerValue) && answerValue >= 0 && answerValue < CHOICE_COUNT)) {
        report('quiz', line, `객관식 answer는 정답 보기의 순서 번호(0~${CHOICE_COUNT - 1})로 써요.`);
      }
    } else {
      const accepted = strings(answer);
      if (!accepted || accepted.length === 0 || accepted.some((a) => a.trim() === '')) report('quiz', line, '주관식 answer는 정답 글자 목록으로 써요. 예: [Syslog, 시스로그]');
      const term = str(node, 'term');
      if (term !== undefined && !ctx.terms.has(term)) report('reference', line, `term: 대상 용어가 없어요 (${term}).`);
    }

    const docRef = str(node, 'doc');
    if (docRef !== undefined) {
      const linked = ctx.docs.get(docRef);
      if (!linked) report('reference', line, `doc: 대상 글이 없어요 (${docRef}).`);
      else if (linked.draft) report('reference', line, `doc: 초안 글은 가리킬 수 없어요 (${docRef}).`);
    }
  }
  return issues;
}
