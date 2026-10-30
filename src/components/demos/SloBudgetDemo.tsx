import { useId, useState } from 'react';
import { sloBudget } from '../../lib/demo-models';
import './demo.css';

const SLOS = [
  { label: '99%', budget: 0.01 },
  { label: '99.9%', budget: 0.001 },
  { label: '99.99%', budget: 0.0001 },
];
const ERROR_RATES = [
  { label: '0.1%', rate: 0.001 },
  { label: '1%', rate: 0.01 },
  { label: '10%', rate: 0.1 },
  { label: '100%', rate: 1 },
];
const PERIOD_HOURS = 30 * 24;
const W = 320;
const n = (v: number) => v.toLocaleString('ko-KR', { maximumFractionDigits: 2 });

function duration(hours: number): string {
  if (hours >= 24) return `${n(Math.round((hours / 24) * 10) / 10)}일`;
  if (hours >= 1) return `${n(Math.round(hours * 10) / 10)}시간`;
  return `${n(Math.round(hours * 600) / 10)}분`;
}

function message(burnRate: number, exhaustHours: number): string {
  if (burnRate < 1) return `burn rate ${n(burnRate)}이라 30일 안에 버짓을 다 쓰지 않아요.`;
  if (burnRate === 1) return 'burn rate 1이라 30일이 끝나는 순간 버짓이 정확히 0이 돼요.';
  return `burn rate ${n(burnRate)}이라 이 에러율이 이어지면 ${duration(exhaustHours)} 만에 30일 버짓을 다 써요.`;
}

export default function SloBudgetDemo() {
  const id = useId();
  const [budget, setBudget] = useState(0.001);
  const [rate, setRate] = useState(0.01);
  const { budgetMinutes, burnRate, exhaustHours } = sloBudget(budget, rate);
  const gone = Math.min(exhaustHours / PERIOD_HOURS, 1);

  return (
    <figure className="demo" data-demo="slo-budget">
      <figcaption className="demo-title">직접 해 보기: SLO와 에러율 바꾸기</figcaption>
      <svg className="demo-svg" viewBox={`0 0 ${W} 48`} role="img" aria-label={`30일 기간 중 ${gone < 1 ? `${duration(exhaustHours)} 만에` : '끝까지'} 버짓이 남는 막대`}>
        <rect className="fill-card" x={0} y={8} width={W} height={18} rx={6} />
        <rect className={gone < 1 ? 'fill-warn' : 'fill-accent'} x={0} y={8} width={W * gone} height={18} rx={6} />
        <text x={0} y={44}>0일</text>
        <text x={W} y={44} textAnchor="end">30일</text>
      </svg>
      <p className="demo-legend">막대는 30일이에요. 색칠한 길이만큼 버짓이 버텨요.</p>
      <fieldset className="demo-segment">
        <legend>SLO(30일)</legend>
        {SLOS.map((s) => (
          <label key={s.label} className={budget === s.budget ? 'is-active' : undefined}>
            <input type="radio" name={`${id}-slo`} checked={budget === s.budget} onChange={() => setBudget(s.budget)} />
            {s.label}
          </label>
        ))}
      </fieldset>
      <fieldset className="demo-segment">
        <legend>지금 에러율</legend>
        {ERROR_RATES.map((r) => (
          <label key={r.label} className={rate === r.rate ? 'is-active' : undefined}>
            <input type="radio" name={`${id}-rate`} checked={rate === r.rate} onChange={() => setRate(r.rate)} />
            {r.label}
          </label>
        ))}
      </fieldset>
      <div className="demo-stats">
        <div className="demo-stat" data-stat="budget">
          <span className="demo-stat-label">30일 에러 버짓</span>
          <span className="demo-stat-value">{n(budgetMinutes)}분</span>
        </div>
        <div className={`demo-stat${burnRate > 1 ? ' is-warn' : ''}`} data-stat="burn">
          <span className="demo-stat-label">burn rate</span>
          <span className="demo-stat-value">{n(burnRate)}</span>
        </div>
        <div className={`demo-stat${gone < 1 ? ' is-warn' : ''}`} data-stat="exhaust">
          <span className="demo-stat-label">버짓을 다 쓰는 데</span>
          <span className="demo-stat-value">{gone < 1 ? duration(exhaustHours) : '30일 넘게'}</span>
        </div>
      </div>
      <p className="demo-message" aria-live="polite" data-demo-message>
        {message(burnRate, exhaustHours)}
      </p>
    </figure>
  );
}
