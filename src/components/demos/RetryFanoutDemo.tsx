import { useId, useState } from 'react';
import { retryFanout } from '../../lib/demo-models';
import './demo.css';

/** 위에서부터 부르는 쪽. 계층 수만큼 앞에서 잘라 쓰고, 맨 아래는 늘 DB다. */
const CALLERS = ['브라우저', '프런트 서버', '백엔드', '서비스 A', '서비스 B'];
const LAYER_CHOICES = [1, 2, 3, 4, 5];
const ATTEMPT_CHOICES = [1, 2, 3, 4];
const n = (v: number) => v.toLocaleString('ko-KR');

function message(layers: number, attempts: number, bottom: number): string {
  if (attempts === 1) return '다시 시도하지 않으면 사용자 동작 한 번은 DB에서도 한 번이에요.';
  if (layers === 1) return `한 계층에서만 다시 시도하면 DB가 받는 요청은 많아야 ${attempts}번이에요.`;
  return `${layers}계층이 저마다 ${attempts}번씩 보내면 DB는 ${n(bottom)}번 받아요. 한 계층에서만 다시 시도하면 ${attempts}번이에요.`;
}

export default function RetryFanoutDemo() {
  const id = useId();
  const [layers, setLayers] = useState(3);
  const [attempts, setAttempts] = useState(4);
  const counts = retryFanout(layers, attempts);
  const bottom = counts.at(-1)!;
  const rows = [...CALLERS.slice(0, layers), 'DB'].map((label, i) => ({ label, count: counts[i] }));

  return (
    <figure className="demo" data-demo="retry-fanout">
      <figcaption className="demo-title">직접 해 보기: 재시도하는 계층 늘리기</figcaption>
      <ol className="demo-bars" aria-label={`사용자 동작 1번이 ${rows.map((r) => `${r.label} ${n(r.count)}번`).join(', ')}이 되는 막대`}>
        {rows.map((r, i) => (
          <li key={r.label} className={i === rows.length - 1 && bottom > 1 ? 'is-warn' : undefined} data-layer={r.label}>
            <span className="demo-bar-label">{r.label}</span>
            <span className="demo-bar-track">
              <span className="demo-bar-fill" style={{ width: `${Math.max((r.count / bottom) * 100, 1.5)}%` }} />
            </span>
            <span className="demo-bar-value">{i === 0 ? '동작 1번' : `${n(r.count)}번`}</span>
          </li>
        ))}
      </ol>
      <p className="demo-legend">맨 아래 DB가 계속 실패할 때, 계층마다 받는 요청 수예요.</p>
      <fieldset className="demo-segment">
        <legend>다시 시도하는 계층 수</legend>
        {LAYER_CHOICES.map((v) => (
          <label key={v} className={layers === v ? 'is-active' : undefined}>
            <input type="radio" name={`${id}-layers`} value={v} checked={layers === v} onChange={() => setLayers(v)} />
            {v}계층
          </label>
        ))}
      </fieldset>
      <fieldset className="demo-segment">
        <legend>계층마다 보내는 횟수(첫 시도 포함)</legend>
        {ATTEMPT_CHOICES.map((v) => (
          <label key={v} className={attempts === v ? 'is-active' : undefined}>
            <input type="radio" name={`${id}-attempts`} value={v} checked={attempts === v} onChange={() => setAttempts(v)} />
            {v}번
          </label>
        ))}
      </fieldset>
      <div className="demo-stats">
        <div className={`demo-stat${bottom > attempts ? ' is-warn' : ''}`} data-stat="bottom">
          <span className="demo-stat-label">DB가 받는 요청</span>
          <span className="demo-stat-value">{n(bottom)}번</span>
        </div>
        <div className="demo-stat" data-stat="single">
          <span className="demo-stat-label">한 계층만 재시도하면</span>
          <span className="demo-stat-value">{attempts}번</span>
        </div>
      </div>
      <p className="demo-message" aria-live="polite" data-demo-message>
        {message(layers, attempts, bottom)}
      </p>
    </figure>
  );
}
