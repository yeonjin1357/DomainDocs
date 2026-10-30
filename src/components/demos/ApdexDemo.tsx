import { useId, useMemo, useState } from 'react';
import { apdexLatencies } from '../../lib/demo-data';
import { apdex } from '../../lib/demo-models';
import './demo.css';

const TS = [0.25, 0.5, 1, 2, 4];
const W = 320;

export default function ApdexDemo() {
  const id = useId();
  const values = useMemo(() => apdexLatencies(), []);
  const [t, setT] = useState(0.5);
  const { satisfied, tolerating, frustrated, score } = apdex(values, t);
  const w = (count: number) => (count / values.length) * W;
  const label = `${score.toFixed(2)} [${t}]`;

  return (
    <figure className="demo" data-demo="apdex">
      <figcaption className="demo-title">직접 해 보기: 같은 요청에 T 바꾸기</figcaption>
      <svg className="demo-svg" viewBox={`0 0 ${W} 28`} role="img" aria-label={`요청 1,000건 중 만족 ${satisfied}, 허용 ${tolerating}, 불만 ${frustrated}`}>
        <rect className="fill-accent" x={0} y={4} width={w(satisfied)} height={20} />
        <rect className="fill-accent-mid" x={w(satisfied)} y={4} width={w(tolerating)} height={20} />
        <rect className="fill-warn" x={w(satisfied + tolerating)} y={4} width={w(frustrated)} height={20} />
      </svg>
      <p className="demo-legend">같은 요청 1,000건이에요. 파란색은 만족, 연한 색은 허용, 빨간색은 불만이에요.</p>
      <fieldset className="demo-segment">
        <legend>목표 시간 T</legend>
        {TS.map((v) => (
          <label key={v} className={t === v ? 'is-active' : undefined}>
            <input type="radio" name={`${id}-t`} checked={t === v} onChange={() => setT(v)} />
            {v}초
          </label>
        ))}
      </fieldset>
      <div className="demo-stats">
        <div className="demo-stat" data-stat="satisfied">
          <span className="demo-stat-label">만족(T 이하)</span>
          <span className="demo-stat-value">{satisfied}건</span>
        </div>
        <div className="demo-stat" data-stat="tolerating">
          <span className="demo-stat-label">허용(4T 이하)</span>
          <span className="demo-stat-value">{tolerating}건</span>
        </div>
        <div className={`demo-stat${frustrated > 0 ? ' is-warn' : ''}`} data-stat="frustrated">
          <span className="demo-stat-label">불만</span>
          <span className="demo-stat-value">{frustrated}건</span>
        </div>
      </div>
      <p className="demo-message" aria-live="polite" data-demo-message>
        점수는 <span data-score>{label}</span>이에요. 요청은 그대로인데 T만 바꿔도 점수가 달라져서, 점수 옆에 T를 함께 써요.
      </p>
    </figure>
  );
}
