import { useId, useMemo, useState } from 'react';
import { cpuSeries, RAW_PEAK, RESOLUTIONS } from '../../lib/demo-data';
import { downsample, type Aggregation } from '../../lib/stats';
import { linePath, type ChartBox } from '../../lib/viz/line';
import './demo.css';

const BOX: ChartBox = { width: 320, height: 140, padding: 6 };
const Y_MAX = 100;
const AGGREGATIONS: { value: Aggregation; label: string }[] = [
  { value: 'avg', label: '평균' },
  { value: 'max', label: '최댓값' },
];

function message(bucket: number, label: string, how: Aggregation, peak: number): string {
  if (bucket === 1) return '10초 단위 원본이에요. 30초 동안 95%까지 올랐어요.';
  if (how === 'avg') return `${label}마다 평균을 내니 30초짜리 피크가 ${peak}%로 묻혔어요.`;
  return `최댓값으로 묶으면 피크는 남아요. 대신 ${label} 내내 높았던 것처럼 보여요.`;
}

export default function DownsamplingDemo() {
  const id = useId();
  const raw = useMemo(() => cpuSeries(), []);
  const [bucket, setBucket] = useState<number>(RESOLUTIONS[0].bucket);
  const [how, setHow] = useState<Aggregation>('avg');
  const series = useMemo(() => downsample(raw, bucket, how), [raw, bucket, how]);
  const peak = Math.round(Math.max(...series));
  const label = RESOLUTIONS.find((r) => r.bucket === bucket)?.label ?? '';

  return (
    <figure className="demo" data-demo="downsampling">
      <figcaption className="demo-title">직접 해 보기: 그래프 한 점의 크기 바꾸기</figcaption>
      <svg
        className="demo-chart"
        viewBox={`0 0 ${BOX.width} ${BOX.height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`CPU 사용률 그래프, 점 ${series.length}개, 보이는 최고값 ${peak}%`}
      >
        <line className="demo-chart-base" x1={0} x2={BOX.width} y1={BOX.height - BOX.padding} y2={BOX.height - BOX.padding} />
        <path className="demo-chart-line" d={linePath(series, Y_MAX, BOX)} vectorEffect="non-scaling-stroke" />
      </svg>
      <p className="demo-legend" data-point-count>
        점 {series.length}개 · 한 점 = {label}
      </p>
      <fieldset className="demo-segment">
        <legend>그래프 한 점이 나타내는 시간</legend>
        {RESOLUTIONS.map((r) => (
          <label key={r.bucket} className={bucket === r.bucket ? 'is-active' : undefined}>
            <input type="radio" name={`${id}-bucket`} value={r.bucket} checked={bucket === r.bucket} onChange={() => setBucket(r.bucket)} />
            {r.label}
          </label>
        ))}
      </fieldset>
      <fieldset className="demo-segment">
        <legend>구간을 묶는 방법</legend>
        {AGGREGATIONS.map((a) => (
          <label key={a.value} className={how === a.value ? 'is-active' : undefined}>
            <input type="radio" name={`${id}-how`} value={a.value} checked={how === a.value} onChange={() => setHow(a.value)} />
            {a.label}
          </label>
        ))}
      </fieldset>
      <div className="demo-stats">
        <div className="demo-stat" data-stat="visible-peak">
          <span className="demo-stat-label">그래프에 보이는 최고값</span>
          <span className="demo-stat-value">{peak}%</span>
        </div>
        <div className="demo-stat is-warn" data-stat="real-peak">
          <span className="demo-stat-label">실제 최고값</span>
          <span className="demo-stat-value">{RAW_PEAK}%</span>
        </div>
      </div>
      <p className="demo-message" aria-live="polite" data-demo-message>
        {message(bucket, label, how, peak)}
      </p>
    </figure>
  );
}
