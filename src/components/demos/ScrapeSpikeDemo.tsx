import { useId, useState } from 'react';
import { scrapesInSpike } from '../../lib/demo-models';
import './demo.css';

const INTERVALS = [5, 15, 30];
const SPIKES = [3, 10];
const SPAN = 60;
const SPIKE_AT = 20;
const W = 320;
const PAD = 10;
const x = (s: number) => PAD + (s / SPAN) * (W - PAD * 2);

export default function ScrapeSpikeDemo() {
  const id = useId();
  const [interval, setScrapeInterval] = useState(15);
  const [spike, setSpike] = useState(3);
  const [offset, setOffset] = useState(0);
  const start = Math.min(offset, interval - 1);
  const times = Array.from({ length: Math.ceil((SPAN - start) / interval) }, (_, k) => start + k * interval);
  const hits = scrapesInSpike(interval, start, SPAN, SPIKE_AT, spike);
  const chance = Math.min(1, spike / interval);

  return (
    <figure className="demo" data-demo="scrape-spike">
      <figcaption className="demo-title">직접 해 보기: 수집 주기와 수집 시각 바꾸기</figcaption>
      <svg className="demo-svg" viewBox={`0 0 ${W} 80`} role="img" aria-label={`1분 동안 ${interval}초마다 수집, ${spike}초짜리 100% 스파이크에 걸린 수집 ${hits.length}번`}>
        <rect className="fill-card" x={PAD} y={30} width={W - PAD * 2} height={22} rx={4} />
        <rect className="fill-warn" x={x(SPIKE_AT)} y={14} width={x(SPIKE_AT + spike) - x(SPIKE_AT)} height={38} rx={3} />
        {times.map((t) => (
          <line key={t} className={hits.includes(t) ? 'stroke-text' : 'stroke-sub'} x1={x(t)} x2={x(t)} y1={6} y2={60} />
        ))}
        <text x={x(0)} y={76}>0초</text>
        <text x={x(SPAN)} y={76} textAnchor="end">60초</text>
      </svg>
      <p className="demo-legend">회색 띠는 평소 40%, 빨간 칸은 100%로 치솟은 동안이에요. 세로선이 수집하는 순간이에요.</p>
      <fieldset className="demo-segment">
        <legend>수집 주기</legend>
        {INTERVALS.map((v) => (
          <label key={v} className={interval === v ? 'is-active' : undefined}>
            <input type="radio" name={`${id}-interval`} checked={interval === v} onChange={() => setScrapeInterval(v)} />
            {v}초
          </label>
        ))}
      </fieldset>
      <fieldset className="demo-segment">
        <legend>스파이크 길이</legend>
        {SPIKES.map((v) => (
          <label key={v} className={spike === v ? 'is-active' : undefined}>
            <input type="radio" name={`${id}-spike`} checked={spike === v} onChange={() => setSpike(v)} />
            {v}초
          </label>
        ))}
      </fieldset>
      <label className="demo-control" htmlFor={`${id}-offset`}>
        <span>첫 수집 시각</span>
        <strong data-offset>{start}초</strong>
      </label>
      <input id={`${id}-offset`} className="demo-range" type="range" min={0} max={interval - 1} step={1} value={start} aria-label="첫 수집 시각" onChange={(e) => setOffset(Number(e.target.value))} />
      <div className="demo-stats">
        <div className={`demo-stat${hits.length === 0 ? ' is-warn' : ''}`} data-stat="recorded">
          <span className="demo-stat-label">기록에 남은 최고값</span>
          <span className="demo-stat-value">{hits.length > 0 ? '100%' : '40%'}</span>
        </div>
        <div className="demo-stat" data-stat="chance">
          <span className="demo-stat-label">수집 시각이 아무 때일 때 걸릴 확률</span>
          <span className="demo-stat-value">{Math.round(chance * 100)}%</span>
        </div>
      </div>
      <p className="demo-message" aria-live="polite" data-demo-message>
        {hits.length > 0
          ? `${hits.join(', ')}초 수집이 스파이크에 걸려서 100%가 기록에 남아요.`
          : `수집하는 순간이 모두 스파이크 밖이라, 기록에는 40%만 남아요.`}
      </p>
    </figure>
  );
}
