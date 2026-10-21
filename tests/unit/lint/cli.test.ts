import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

function runLint(dir: string, termsDir = 'tests/fixtures/lint/no-terms') {
  return spawnSync(process.execPath, ['--import', 'tsx', 'scripts/lint-content/index.ts'], {
    env: { ...process.env, DOCS_CONTENT_DIR: dir, TERMS_CONTENT_DIR: termsDir },
    encoding: 'utf8',
  });
}

describe('lint:content CLI', () => {
  it('올바른 글만 있으면 0으로 끝난다', () => {
    const res = runLint('tests/fixtures/lint/good');
    expect(res.stdout).toContain('위반 0건');
    expect(res.status).toBe(0);
  });
  it('위반이 있으면 파일:줄과 규칙 이름을 출력하고 1로 끝난다', () => {
    const res = runLint('tests/fixtures/lint/bad');
    expect(res.stdout).toMatch(/foundations[\\/]sample\.mdx:\d+:\d+ \[formal-ending\]/);
    expect(res.status).toBe(1);
  });
  it('폴더가 없으면 1로 끝난다', () => {
    expect(runLint('tests/fixtures/lint/missing').status).toBe(1);
  });
  it('용어 파일의 위반도 파일:줄과 규칙 이름을 출력하고 1로 끝난다', () => {
    const res = runLint('tests/fixtures/lint/good', 'tests/fixtures/lint/terms-bad');
    expect(res.stdout).toMatch(/foundations\.yaml:\d+:\d+ \[formal-ending\]/);
    expect(res.stdout).toContain('용어 파일 1개');
    expect(res.status).toBe(1);
  });
});
