import { useId, useMemo, useState } from 'react';
import { lagOutlook } from '../../lib/demo-models';
import { linePath, type ChartBox } from '../../lib/viz/line';
import './demo.css';

const LAG = 60_000;
const MINUTES = 10;
const Y_MAX = 120_000;
const BOX: ChartBox = { width: 320, height: 120, padding: 6 };
const n = (v: number) => Math.round(v).toLocaleString('ko-KR');

function time(sec: number): string {
  if (sec < 60) return `${Math.round(sec)}초`;
  return `${Math.round((sec / 60) * 10) / 10}분`;
}

export default function LagDrainDemo() {
  const id = useId();
  const [inRate, setInRate] = useState(500);
  const [outRate, setOutRate] = useState(400);
  const { waitSec, drainSec } = lagOutlook(LAG, inRate, outRate);
  const series = useMemo(
    () => Array.from({ length: MINUTES * 6 + 1 }, (_, i) => Math.min(Y_MAX, Math.max(0, LAG + (inRate - outRate) * i * 10))),
    [inRate, outRate],
  );
  const after = series.at(-1)!;

  return (
    <figure className="demo" data-demo="lag-drain">
      <figcaption className="demo-title">직접 해 보기: 들어오는 속도와 처리 속도 바꾸기</figcaption>
      <svg className="demo-chart" viewBox={`0 0 ${BOX.width} ${BOX.height}`} preserveAspectRatio="none" role="img" aria-label={`lag ${n(LAG)}건에서 10분 뒤 ${n(after)}건`}>
        <line className="demo-chart-base" x1={0} x2={BOX.width} y1={BOX.height - BOX.padding} y2={BOX.height - BOX.padding} />
        <path className="demo-chart-line" d={linePath(series, Y_MAX, BOX)} vectorEffect="non-scaling-stroke" />
      </svg>
      <p className="demo-legend" data-after>
        lag {n(LAG)}건에서 시작한 10분 · 10분 뒤 {n(after)}건
      </p>
      <label className="demo-control" htmlFor={`${id}-in`}>
        <span>들어오는 속도</span>
        <strong data-in>초당 {n(inRate)}건</strong>
      </label>
      <input id={`${id}-in`} className="demo-range" type="range" min={300} max={600} step={50} value={inRate} aria-label="들어오는 속도" onChange={(e) => setInRate(Number(e.target.value))} />
      <label className="demo-control" htmlFor={`${id}-out`}>
        <span>처리 속도</span>
        <strong data-out>초당 {n(outRate)}건</strong>
      </label>
      <input id={`${id}-out`} className="demo-range" type="range" min={300} max={600} step={50} value={outRate} aria-label="처리 속도" onChange={(e) => setOutRate(Number(e.target.value))} />
      <div className="demo-stats">
        <div className="demo-stat" data-stat="wait">
          <span className="demo-stat-label">방금 들어온 메시지가 기다릴 시간</span>
          <span className="demo-stat-value">{time(waitSec)}</span>
        </div>
        <div className={`demo-stat${Number.isFinite(drainSec) ? '' : ' is-warn'}`} data-stat="drain">
          <span className="demo-stat-label">lag이 0이 되기까지</span>
          <span className="demo-stat-value">{Number.isFinite(drainSec) ? time(drainSec) : '줄지 않아요'}</span>
        </div>
      </div>
      <p className="demo-message" aria-live="polite" data-demo-message>
        {Number.isFinite(drainSec)
          ? `처리가 초당 ${n(outRate - inRate)}건 빨라서, 쌓인 ${n(LAG)}건은 ${time(drainSec)} 뒤 0이 돼요.`
          : inRate === outRate
            ? '들어오는 만큼만 처리해서 lag이 그대로예요. 쌓인 몫을 줄이려면 처리가 더 빨라야 해요.'
            : `들어오는 게 초당 ${n(inRate - outRate)}건 더 많아서 lag이 계속 늘어요. 컨슈머를 늘리거나 한 건의 처리 시간을 줄여야 해요.`}
      </p>
    </figure>
  );
}
