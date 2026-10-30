import { useMemo, useState } from 'react';
import { histogramLatencies } from '../../lib/demo-data';
import { histogramQuantile } from '../../lib/demo-models';
import { percentile } from '../../lib/stats';
import './demo.css';

const BASE = [0.1, 0.25, 0.5, 1, 2.5];
const EXTRA = [0.75, 0.9];
const W = 320;
const PAD = 12;
/** 그림은 0.5~1초 칸만 크게 보여 줘요. */
const x = (sec: number) => PAD + ((sec - 0.5) / 0.5) * (W - PAD * 2);
const sec = (v: number) => `${v.toFixed(2)}초`;

function message(extra: number[], estimate: number, actual: number): string {
  if (extra.length === 0) return `0.5초와 1초 사이에 경계가 없어서, 그 칸을 고르게 나눠 ${sec(estimate)}로 봐요. 실제는 ${sec(actual)}예요.`;
  const gap = Math.abs(actual - estimate);
  return `경계를 더하자 추정이 ${sec(estimate)}가 돼서, 실제 ${sec(actual)}와의 차이가 ${sec(gap)}로 줄었어요.`;
}

export default function HistogramQuantileDemo() {
  const values = useMemo(() => histogramLatencies(), []);
  const inBucket = useMemo(() => values.filter((v) => v > 0.5 && v <= 1), [values]);
  const actual = useMemo(() => percentile(values, 99), [values]);
  const [extra, setExtra] = useState<number[]>([]);
  const bounds = [...BASE, ...extra].sort((a, b) => a - b);
  const estimate = histogramQuantile(0.99, values, bounds);
  const toggle = (b: number, on: boolean) => setExtra((e) => (on ? [...e, b] : e.filter((v) => v !== b)));

  return (
    <figure className="demo" data-demo="histogram-quantile">
      <figcaption className="demo-title">직접 해 보기: 버킷 경계 더하기</figcaption>
      <svg className="demo-svg" viewBox={`0 0 ${W} 86`} role="img" aria-label={`0.5~1초 칸의 요청 10건, 추정 p99 ${sec(estimate)}, 실제 p99 ${sec(actual)}`}>
        <line className="stroke-line" x1={PAD} x2={W - PAD} y1={44} y2={44} />
        {bounds
          .filter((b) => b >= 0.5 && b <= 1)
          .map((b) => (
            <g key={b}>
              <line className="stroke-text" x1={x(b)} x2={x(b)} y1={30} y2={58} />
              <text x={x(b)} y={76} textAnchor="middle">{b}</text>
            </g>
          ))}
        {inBucket.map((v) => (
          <circle key={v} className={v === actual ? 'fill-warn' : 'fill-sub'} cx={x(v)} cy={44} r={4.5} />
        ))}
        <path className="fill-accent" d={`M${x(estimate) - 6},12 L${x(estimate) + 6},12 L${x(estimate)},22 Z`} />
        <text x={x(estimate)} y={9} textAnchor="middle">추정</text>
      </svg>
      <p className="demo-legend">0.5~1초 칸만 크게 그렸어요. 점이 요청 하나, 빨간 점이 실제 p99(990번째), 파란 삼각형이 추정이에요.</p>
      <fieldset className="demo-segment">
        <legend>더할 경계(le)</legend>
        {EXTRA.map((b) => (
          <label key={b} className={extra.includes(b) ? 'is-active' : undefined}>
            <input type="checkbox" checked={extra.includes(b)} onChange={(e) => toggle(b, e.target.checked)} />
            {b}초
          </label>
        ))}
      </fieldset>
      <div className="demo-stats">
        <div className="demo-stat" data-stat="estimate">
          <span className="demo-stat-label">histogram_quantile</span>
          <span className="demo-stat-value">{sec(estimate)}</span>
        </div>
        <div className="demo-stat is-warn" data-stat="actual">
          <span className="demo-stat-label">실제 p99</span>
          <span className="demo-stat-value">{sec(actual)}</span>
        </div>
      </div>
      <p className="demo-message" aria-live="polite" data-demo-message>
        {message(extra, estimate, actual)}
      </p>
    </figure>
  );
}
