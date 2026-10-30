import { useId, useState } from 'react';
import { tokenBucket } from '../../lib/demo-models';
import './demo.css';

/** EC2 문서의 DescribeHosts 예시: 바구니 100, 초당 20개 채움 */
const CAPACITY = 100;
const REFILL = 20;
const SECONDS = 10;
const RATES = [10, 20, 50, 100];
const W = 320;
const H = 110;
const COL = W / SECONDS;
const y = (v: number) => (v / CAPACITY) * 90;

export default function TokenBucketDemo() {
  const id = useId();
  const [rate, setRate] = useState(50);
  const seconds = tokenBucket(CAPACITY, REFILL, rate, SECONDS);
  const accepted = seconds.reduce((a, s) => a + s.accepted, 0);
  const rejected = seconds.reduce((a, s) => a + s.rejected, 0);
  const firstReject = seconds.findIndex((s) => s.rejected > 0);

  return (
    <figure className="demo" data-demo="token-bucket">
      <figcaption className="demo-title">직접 해 보기: 초당 부르는 횟수 바꾸기</figcaption>
      <svg className="demo-svg" viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`10초 동안 받아 준 요청 ${accepted}번, 거절된 요청 ${rejected}번`}>
        {seconds.map((s, i) => (
          <g key={i}>
            <rect className="fill-accent" x={i * COL + 4} y={94 - y(s.accepted)} width={COL - 8} height={y(s.accepted)} />
            <rect className="fill-warn" x={i * COL + 4} y={94 - y(s.accepted + s.rejected)} width={COL - 8} height={y(s.rejected)} />
          </g>
        ))}
        <line className="stroke-line" x1={0} x2={W} y1={94} y2={94} />
        <text x={2} y={H - 2}>1초</text>
        <text x={W - 2} y={H - 2} textAnchor="end">10초</text>
      </svg>
      <p className="demo-legend">막대 하나가 1초예요. 파란색은 받아 준 요청, 빨간색은 거절된 요청이에요. 바구니는 {CAPACITY}개까지 차고, 초당 {REFILL}개씩 다시 채워져요.</p>
      <fieldset className="demo-segment">
        <legend>초당 부르는 횟수</legend>
        {RATES.map((v) => (
          <label key={v} className={rate === v ? 'is-active' : undefined}>
            <input type="radio" name={`${id}-rate`} checked={rate === v} onChange={() => setRate(v)} />
            {v}번
          </label>
        ))}
      </fieldset>
      <div className="demo-stats">
        <div className="demo-stat" data-stat="accepted">
          <span className="demo-stat-label">10초 동안 받아 준 요청</span>
          <span className="demo-stat-value">{accepted}번</span>
        </div>
        <div className={`demo-stat${rejected > 0 ? ' is-warn' : ''}`} data-stat="rejected">
          <span className="demo-stat-label">거절된 요청</span>
          <span className="demo-stat-value">{rejected}번</span>
        </div>
      </div>
      <p className="demo-message" aria-live="polite" data-demo-message>
        {firstReject === -1
          ? `초당 ${rate}번은 채우는 속도(${REFILL}) 안이라 하나도 거절되지 않아요.`
          : `한동안은 바구니에 모아 둔 토큰으로 받아 주다가, ${firstReject + 1}초째부터 거절돼요. 오래 이어지면 초당 ${REFILL}번만 받아 줘요.`}
      </p>
    </figure>
  );
}
