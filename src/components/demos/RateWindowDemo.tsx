import { useId, useState } from 'react';
import { samplesInWindow } from '../../lib/demo-models';
import './demo.css';

const INTERVALS = [
  { label: '15초', sec: 15 },
  { label: '30초', sec: 30 },
  { label: '1분', sec: 60 },
];
const WINDOWS = [
  { label: '[15s]', sec: 15 },
  { label: '[30s]', sec: 30 },
  { label: '[1m]', sec: 60 },
  { label: '[2m]', sec: 120 },
  { label: '[5m]', sec: 300 },
];
/** 그림에 보이는 시간(초). 오른쪽 끝이 지금이에요. */
const SPAN = 360;
const W = 320;
const PAD = 10;
const x = (secAgo: number) => W - PAD - (secAgo / SPAN) * (W - PAD * 2);

/** lost는 빠진 수집이 구간 안에 들었는지예요. */
function message(count: number, ratio: number, lost: boolean): string {
  if (count < 2 && lost) return `수집이 한 번 빠지자 구간 안 샘플이 ${count}개뿐이라 rate가 비어요.`;
  if (count < 2) return `구간 안에 샘플이 ${count}개뿐이라 rate가 비어요. 구간을 수집 주기보다 길게 잡아요.`;
  if (ratio < 4) return `샘플이 ${count}개라 값은 나와요. 수집 주기의 4배보다 짧아서, 수집이 빠지면 쉽게 비어요.`;
  if (lost) return `수집이 한 번 빠져도 샘플이 ${count}개라 값이 나와요. Grafana가 권하는 수집 주기의 4배 이상이에요.`;
  return `샘플이 ${count}개라 수집이 한 번쯤 빠져도 값이 나와요. Grafana가 권하는 수집 주기의 4배 이상이에요.`;
}

export default function RateWindowDemo() {
  const id = useId();
  const [scrape, setScrape] = useState(15);
  const [windowSec, setWindowSec] = useState(15);
  const [missed, setMissed] = useState(false);
  const count = samplesInWindow(scrape, windowSec, missed);
  const ratio = windowSec / scrape;
  const dots = Array.from({ length: Math.floor(SPAN / scrape) + 1 }, (_, k) => k * scrape);

  return (
    <figure className="demo" data-demo="rate-window">
      <figcaption className="demo-title">직접 해 보기: rate 구간과 수집 주기 바꾸기</figcaption>
      <svg className="demo-timeline" viewBox={`0 0 ${W} 64`} role="img" aria-label={`최근 6분 동안 ${scrape}초마다 수집한 샘플 가운데 구간 안에 든 것이 ${count}개`}>
        <rect className="demo-window" x={x(windowSec) + 5} y={6} width={x(0) - x(windowSec)} height={36} rx={6} />
        <line className="demo-chart-base" x1={PAD} x2={W - PAD} y1={24} y2={24} />
        {dots.map((ago) => {
          const inside = ago < windowSec;
          const lost = missed && ago === scrape;
          return <circle key={ago} className={`demo-sample${inside ? ' is-in' : ''}${lost ? ' is-lost' : ''}`} cx={x(ago)} cy={24} r={4.5} />;
        })}
        <text className="demo-axis" x={x(0)} y={60} textAnchor="end">지금</text>
        <text className="demo-axis" x={x(SPAN)} y={60} textAnchor="start">6분 전</text>
      </svg>
      <p className="demo-legend">점 하나가 수집한 샘플 하나예요. 색칠한 칸이 구간이고, 속이 빈 점은 수집에 실패한 때예요.</p>
      <fieldset className="demo-segment">
        <legend>수집 주기</legend>
        {INTERVALS.map((v) => (
          <label key={v.sec} className={scrape === v.sec ? 'is-active' : undefined}>
            <input type="radio" name={`${id}-scrape`} value={v.sec} checked={scrape === v.sec} onChange={() => setScrape(v.sec)} />
            {v.label}
          </label>
        ))}
      </fieldset>
      <fieldset className="demo-segment">
        <legend>rate 구간</legend>
        {WINDOWS.map((v) => (
          <label key={v.sec} className={windowSec === v.sec ? 'is-active' : undefined}>
            <input type="radio" name={`${id}-window`} value={v.sec} checked={windowSec === v.sec} onChange={() => setWindowSec(v.sec)} />
            {v.label}
          </label>
        ))}
      </fieldset>
      <fieldset className="demo-segment">
        <legend>수집 실패</legend>
        <label className={missed ? 'is-active' : undefined}>
          <input type="checkbox" checked={missed} onChange={(e) => setMissed(e.target.checked)} />
          바로 앞 수집 한 번 실패
        </label>
      </fieldset>
      <div className="demo-stats">
        <div className={`demo-stat${count < 2 ? ' is-warn' : ''}`} data-stat="samples">
          <span className="demo-stat-label">구간 안 샘플</span>
          <span className="demo-stat-value">{count}개</span>
        </div>
        <div className={`demo-stat${count < 2 ? ' is-warn' : ''}`} data-stat="rate">
          <span className="demo-stat-label">rate 값</span>
          <span className="demo-stat-value">{count < 2 ? '비어요' : '나와요'}</span>
        </div>
        <div className="demo-stat" data-stat="ratio">
          <span className="demo-stat-label">수집 주기의</span>
          <span className="demo-stat-value">{Number.isInteger(ratio) ? ratio : ratio.toFixed(1)}배</span>
        </div>
      </div>
      <p className="demo-message" aria-live="polite" data-demo-message>
        {message(count, ratio, missed && windowSec > scrape)}
      </p>
    </figure>
  );
}
