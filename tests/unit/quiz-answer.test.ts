import { describe, expect, it } from 'vitest';
import { isInputCorrect, normalizeAnswer } from '../../src/lib/quiz/answer';

describe('주관식 채점', () => {
  it('대소문자, 띄어쓰기, 하이픈, 밑줄을 무시한다', () => {
    expect(normalizeAnswer(' Load-Average ')).toBe('loadaverage');
    expect(isInputCorrect('load average', ['Load-Average'])).toBe(true);
    expect(isInputCorrect('LOAD_AVERAGE', ['load average'])).toBe(true);
  });

  it('전각 문자도 같은 글자로 본다', () => {
    expect(isInputCorrect('ＳＮＭＰ', ['SNMP'])).toBe(true);
  });

  it('정답 중 하나만 맞으면 된다', () => {
    expect(isInputCorrect('시스로그', ['Syslog', '시스로그'])).toBe(true);
    expect(isInputCorrect('syslog-ng', ['Syslog', '시스로그'])).toBe(false);
  });

  it('빈 답은 틀린다', () => {
    expect(isInputCorrect('   ', ['SNMP'])).toBe(false);
  });
});
