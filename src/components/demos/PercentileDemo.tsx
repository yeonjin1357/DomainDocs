import { useId, useMemo, useState } from 'react';
import { latencySample, REQUEST_COUNT, SLOW_MS } from '../../lib/demo-data';
import { mean, percentile } from '../../lib/stats';
import './demo.css';

const MAX_SLOW = 10;
const P99_INDEX = Math.ceil((99 * REQUEST_COUNT) / 100) - 1;
const ms = (v: number) => `${Math.round(v).toLocaleString('ko-KR')}ms`;

function statsOf(sample: number[]) {
  return { mean: mean(sample), p50: percentile(sample, 50), p99: percentile(sample, 99) };
}

const BASE = statsOf(latencySample(0));

function message(slow: number): string {
  if (slow === 0) return '느린 요청이 없어요. 평균과 p99가 모두 낮아요.';
  if (slow === 1) return '느린 요청이 1%예요. p99는 아직 그대로예요.';
  return `느린 요청이 ${slow}%가 되자 p99가 3초로 튀었어요.`;
}

function Stat({ label, value, base, testId, warn }: { label: string; value: number; base: number; testId: string; warn?: boolean }) {
  const diff = Math.round(value) - Math.round(base);
  return (
    <div className={`demo-stat${warn ? ' is-warn' : ''}`} data-stat={testId}>
      <span className="demo-stat-label">{label}</span>
      <span className="demo-stat-value">{ms(value)}</span>
      <span className="demo-stat-diff">{diff === 0 ? '변화 없음' : `${diff > 0 ? '+' : ''}${diff.toLocaleString('ko-KR')}ms`}</span>
    </div>
  );
}

export default function PercentileDemo() {
  const id = useId();
  const [slow, setSlow] = useState(0);
  const sample = useMemo(() => latencySample(slow), [slow]);
  const sorted = useMemo(() => [...sample].sort((a, b) => a - b), [sample]);
  const stats = statsOf(sample);

  return (
    <figure className="demo" data-demo="percentile">
      <figcaption className="demo-title">직접 해 보기: 느린 요청 늘리기</figcaption>
      <div className="demo-dots" role="img" aria-label={`요청 ${REQUEST_COUNT}개 중 느린 요청 ${slow}개`}>
        {sorted.map((v, i) => (
          <span key={i} className={`dot${v === SLOW_MS ? ' is-slow' : ''}${i === P99_INDEX ? ' is-p99' : ''}`} />
        ))}
      </div>
      <p className="demo-legend">빠른 순서로 줄 세운 요청 100개예요. 테두리가 있는 점이 99번째, 곧 p99예요.</p>
      <label className="demo-control" htmlFor={`${id}-slow`}>
        <span>느린 요청(3초)</span>
        <strong data-slow-count>{slow}개</strong>
      </label>
      <input
        id={`${id}-slow`}
        className="demo-range"
        type="range"
        min={0}
        max={MAX_SLOW}
        step={1}
        value={slow}
        aria-label="느린 요청 수"
        onChange={(e) => setSlow(Number(e.target.value))}
      />
      <div className="demo-stats">
        <Stat label="평균" value={stats.mean} base={BASE.mean} testId="mean" />
        <Stat label="p50" value={stats.p50} base={BASE.p50} testId="p50" />
        <Stat label="p99" value={stats.p99} base={BASE.p99} testId="p99" warn={stats.p99 === SLOW_MS} />
      </div>
      <p className="demo-message" aria-live="polite" data-demo-message>
        {message(slow)}
      </p>
    </figure>
  );
}
