import { useId, useState } from 'react';
import { hpaDesired } from '../../lib/demo-models';
import './demo.css';

const PODS = 4;
const MAX = 10;
const TARGET = 60;
const REQUESTS = [250, 500, 1000, 2000];
const cores = (m: number) => (m >= 1000 ? `${m / 1000}코어` : `${m}m`);

function message(reason: ReturnType<typeof hpaDesired>['reason'], utilization: number, desired: number): string {
  if (reason === 'tolerance') return `사용률 ${utilization}%가 목표 ${TARGET}%와 10% 안쪽이라 그대로 둬요.`;
  if (reason === 'max') return `계산으로는 더 필요하지만 최대 ${MAX}개에서 멈춰요.`;
  if (reason === 'up') return `${PODS} × ${utilization} ÷ ${TARGET}을 올림해 ${desired}개로 늘려요.`;
  if (reason === 'down') return `계산은 ${desired}개예요. 다만 줄일 때는 지난 5분 동안의 가장 큰 계산값을 따라서 바로 줄지는 않아요.`;
  return `계산해도 ${PODS}개라 그대로예요.`;
}

export default function HpaDemo() {
  const id = useId();
  const [usage, setUsage] = useState(450);
  const [request, setRequest] = useState(500);
  const { utilization, desired, reason } = hpaDesired(PODS, usage, request, TARGET, MAX);
  const pods = Array.from({ length: Math.max(PODS, desired) }, (_, i) => i);

  return (
    <figure className="demo" data-demo="hpa">
      <figcaption className="demo-title">직접 해 보기: 사용량과 요청 바꾸기</figcaption>
      <div className="demo-chips" role="img" aria-label={`파드 ${PODS}개에서 ${desired}개로`}>
        {pods.map((i) => (
          <span key={i} className={`demo-chip ${i >= desired ? 'is-sub' : i >= PODS ? 'is-accent' : ''}`.trim()}>
            파드
          </span>
        ))}
      </div>
      <p className="demo-legend">지금 파드는 {PODS}개, 목표 CPU 사용률은 {TARGET}%, 최대는 {MAX}개예요. 파란 칸은 늘릴 파드, 흐린 칸은 줄일 파드예요.</p>
      <label className="demo-control" htmlFor={`${id}-usage`}>
        <span>파드마다 쓰는 CPU</span>
        <strong data-usage>{cores(usage)}</strong>
      </label>
      <input id={`${id}-usage`} className="demo-range" type="range" min={100} max={1000} step={50} value={usage} aria-label="파드마다 쓰는 CPU" onChange={(e) => setUsage(Number(e.target.value))} />
      <fieldset className="demo-segment">
        <legend>파드마다 적은 CPU 요청</legend>
        {REQUESTS.map((v) => (
          <label key={v} className={request === v ? 'is-active' : undefined}>
            <input type="radio" name={`${id}-request`} checked={request === v} onChange={() => setRequest(v)} />
            {cores(v)}
          </label>
        ))}
      </fieldset>
      <div className="demo-stats">
        <div className="demo-stat" data-stat="utilization">
          <span className="demo-stat-label">CPU 사용률(요청 대비)</span>
          <span className="demo-stat-value">{utilization}%</span>
        </div>
        <div className={`demo-stat${reason === 'max' ? ' is-warn' : ''}`} data-stat="desired">
          <span className="demo-stat-label">원하는 파드</span>
          <span className="demo-stat-value">{desired}개</span>
        </div>
      </div>
      <p className="demo-message" aria-live="polite" data-demo-message>
        {message(reason, utilization, desired)}
      </p>
    </figure>
  );
}
