import { useId, useState } from 'react';
import { cfsThrottle } from '../../lib/demo-models';
import './demo.css';

const LIMITS = [0.5, 1, 2];
const THREADS = [1, 2, 4];
/** 요청 하나에 드는 CPU 시간. 스레드가 나눠서 해요. */
const CPU_MS = 200;
const PERIOD = 100;
const SPAN = 400;
const W = 320;
const x = (ms: number) => (ms / SPAN) * W;

export default function CpuThrottleDemo() {
  const id = useId();
  const [limit, setLimit] = useState(1);
  const [threads, setThreads] = useState(4);
  const perThread = CPU_MS / threads;
  const { periods, wallMs, throttledPeriods } = cfsThrottle(limit, threads, perThread);
  const quotaMs = limit * PERIOD;

  return (
    <figure className="demo" data-demo="cpu-throttle">
      <figcaption className="demo-title">직접 해 보기: CPU 한도와 스레드 수 바꾸기</figcaption>
      <svg className="demo-svg" viewBox={`0 0 ${W} 56`} role="img" aria-label={`100ms 주기마다 일한 시간과 멈춘 시간, 모두 ${wallMs}ms`}>
        {periods.map((p, i) => (
          <g key={i}>
            <rect className="fill-accent" x={x(i * PERIOD)} y={8} width={x(p.run)} height={20} />
            {p.throttled > 0 && <rect className="fill-warn" x={x(i * PERIOD + p.run)} y={8} width={x(p.throttled)} height={20} />}
          </g>
        ))}
        {[0, 100, 200, 300, 400].map((t) => (
          <g key={t}>
            <line className="stroke-line" x1={x(t)} x2={x(t)} y1={4} y2={32} />
            <text x={Math.min(Math.max(x(t), 12), W - 22)} y={48} textAnchor="middle">{t}ms</text>
          </g>
        ))}
      </svg>
      <p className="demo-legend">요청 하나에 CPU 200ms가 드는 일을 스레드가 나눠서 해요(코어는 넉넉하다고 본 예시). 파란색은 일한 때, 빨간색은 몫을 다 써서 멈춘 때예요.</p>
      <fieldset className="demo-segment">
        <legend>CPU 한도(100ms마다 {quotaMs}ms까지)</legend>
        {LIMITS.map((v) => (
          <label key={v} className={limit === v ? 'is-active' : undefined}>
            <input type="radio" name={`${id}-limit`} checked={limit === v} onChange={() => setLimit(v)} />
            {v}코어
          </label>
        ))}
      </fieldset>
      <fieldset className="demo-segment">
        <legend>함께 일하는 스레드</legend>
        {THREADS.map((v) => (
          <label key={v} className={threads === v ? 'is-active' : undefined}>
            <input type="radio" name={`${id}-threads`} checked={threads === v} onChange={() => setThreads(v)} />
            {v}개
          </label>
        ))}
      </fieldset>
      <div className="demo-stats">
        <div className={`demo-stat${throttledPeriods > 0 ? ' is-warn' : ''}`} data-stat="wall">
          <span className="demo-stat-label">걸린 시간</span>
          <span className="demo-stat-value">{wallMs}ms</span>
        </div>
        <div className="demo-stat" data-stat="unlimited">
          <span className="demo-stat-label">한도가 없으면</span>
          <span className="demo-stat-value">{perThread}ms</span>
        </div>
        <div className={`demo-stat${throttledPeriods > 0 ? ' is-warn' : ''}`} data-stat="throttled">
          <span className="demo-stat-label">멈춘 주기</span>
          <span className="demo-stat-value">{throttledPeriods}번</span>
        </div>
      </div>
      <p className="demo-message" aria-live="polite" data-demo-message>
        {throttledPeriods === 0
          ? '한 주기에 쓰는 CPU가 몫 안이라 멈추지 않아요.'
          : `스레드 ${threads}개가 몫 ${quotaMs}ms를 ${Math.round(quotaMs / threads)}ms 만에 다 써서, 주기의 나머지 동안 멈춰요.`}
      </p>
    </figure>
  );
}
