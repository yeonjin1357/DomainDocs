import { useId, useState } from 'react';
import { sampledErrorRate } from '../../lib/demo-models';
import './demo.css';

const TOTAL = 10_000;
const POLICIES = [
  { value: 'head' as const, label: 'head(확률로)' },
  { value: 'tail' as const, label: 'tail(에러는 모두)' },
];
const KEEPS = [0.01, 0.1, 0.5];
const ERRORS = [0.001, 0.005, 0.01];
const pct = (v: number) => `${(Math.round(v * 1000) / 10).toLocaleString('ko-KR')}%`;
const n = (v: number) => v.toLocaleString('ko-KR');

export default function TailSamplingDemo() {
  const id = useId();
  const [policy, setPolicy] = useState<'head' | 'tail'>('tail');
  const [keep, setKeep] = useState(0.1);
  const [errorRate, setErrorRate] = useState(0.005);
  const { kept, keptErrors, rate } = sampledErrorRate(TOTAL, errorRate, keep, policy);
  const skewed = Math.abs(rate - errorRate) > 1e-9;

  return (
    <figure className="demo" data-demo="tail-sampling">
      <figcaption className="demo-title">직접 해 보기: 샘플링 방식과 비율 바꾸기</figcaption>
      <fieldset className="demo-segment">
        <legend>고르는 방식</legend>
        {POLICIES.map((p) => (
          <label key={p.value} className={policy === p.value ? 'is-active' : undefined}>
            <input type="radio" name={`${id}-policy`} checked={policy === p.value} onChange={() => setPolicy(p.value)} />
            {p.label}
          </label>
        ))}
      </fieldset>
      <fieldset className="demo-segment">
        <legend>{policy === 'tail' ? '에러가 아닌 요청을 남기는 비율' : '남기는 비율'}</legend>
        {KEEPS.map((v) => (
          <label key={v} className={keep === v ? 'is-active' : undefined}>
            <input type="radio" name={`${id}-keep`} checked={keep === v} onChange={() => setKeep(v)} />
            {pct(v)}
          </label>
        ))}
      </fieldset>
      <fieldset className="demo-segment">
        <legend>실제 에러율(요청 {n(TOTAL)}건)</legend>
        {ERRORS.map((v) => (
          <label key={v} className={errorRate === v ? 'is-active' : undefined}>
            <input type="radio" name={`${id}-error`} checked={errorRate === v} onChange={() => setErrorRate(v)} />
            {pct(v)}
          </label>
        ))}
      </fieldset>
      <div className="demo-stats">
        <div className="demo-stat" data-stat="kept">
          <span className="demo-stat-label">남은 트레이스</span>
          <span className="demo-stat-value">{n(kept)}건</span>
        </div>
        <div className="demo-stat" data-stat="actual">
          <span className="demo-stat-label">실제 에러율</span>
          <span className="demo-stat-value">{pct(errorRate)}</span>
        </div>
        <div className={`demo-stat${skewed ? ' is-warn' : ''}`} data-stat="traced">
          <span className="demo-stat-label">남은 트레이스로 센 에러율</span>
          <span className="demo-stat-value">{pct(rate)}</span>
        </div>
      </div>
      <p className="demo-message" aria-live="polite" data-demo-message>
        {skewed
          ? `에러 ${n(keptErrors)}건을 모두 남겨서, 트레이스로 세면 에러율이 실제의 ${Math.round(rate / errorRate)}배쯤으로 보여요.`
          : `모든 요청을 같은 확률로 골라서, 트레이스로 센 에러율이 실제와 같아요. 대신 에러 트레이스도 ${n(keptErrors)}건만 남아요.`}
      </p>
    </figure>
  );
}
