import { useId, useState } from 'react';
import { littlesLaw } from '../../lib/demo-models';
import './demo.css';

const THREADS = 200;
const W = 320;
const n = (v: number) => v.toLocaleString('ko-KR');
const sec = (ms: number) => `${(ms / 1000).toFixed(1)}초`;

function message(ms: number, needed: number, saturated: boolean, served: number): string {
  if (!saturated) return `늘 ${n(needed)}건이 처리 중이에요. 스레드 ${THREADS}개 안이라 들어온 만큼 끝내요.`;
  return `${n(needed)}건이 동시에 필요한데 스레드는 ${THREADS}개예요. 처리량은 ${THREADS} ÷ ${sec(ms)} ≈ ${n(served)}건으로 떨어지고, 나머지 요청은 줄을 서요.`;
}

export default function LittlesLawDemo() {
  const id = useId();
  const [arrival, setArrival] = useState(200);
  const [ms, setMs] = useState(500);
  const { needed, saturated, served } = littlesLaw(arrival, ms, THREADS);
  const scale = Math.max(needed, THREADS);
  const x = (v: number) => (v / scale) * W;

  return (
    <figure className="demo" data-demo="littles-law">
      <figcaption className="demo-title">직접 해 보기: 처리량과 응답시간 바꾸기</figcaption>
      <svg className="demo-meter" viewBox={`0 0 ${W} 44`} role="img" aria-label={`동시에 필요한 요청 ${n(needed)}건, 스레드 ${THREADS}개${saturated ? `, ${n(needed - THREADS)}건이 줄을 섬` : ''}`}>
        <rect className="demo-meter-track" x={0} y={8} width={x(THREADS)} height={20} rx={6} />
        <rect className="demo-meter-fill" x={0} y={8} width={x(Math.min(needed, THREADS))} height={20} rx={6} />
        {saturated && <rect className="demo-meter-over" x={x(THREADS)} y={8} width={x(needed) - x(THREADS)} height={20} rx={6} />}
        <line className="demo-meter-limit" x1={x(THREADS)} x2={x(THREADS)} y1={2} y2={34} />
      </svg>
      <p className="demo-legend">파란 막대가 처리 중인 요청, 세로선이 스레드 {THREADS}개예요.{saturated ? ' 주황 막대는 스레드를 기다리는 몫이에요.' : ''}</p>
      <label className="demo-control" htmlFor={`${id}-arrival`}>
        <span>들어오는 요청</span>
        <strong data-arrival>초당 {n(arrival)}건</strong>
      </label>
      <input id={`${id}-arrival`} className="demo-range" type="range" min={50} max={400} step={10} value={arrival} aria-label="초당 들어오는 요청" onChange={(e) => setArrival(Number(e.target.value))} />
      <label className="demo-control" htmlFor={`${id}-ms`}>
        <span>요청 하나의 응답시간</span>
        <strong data-response>{sec(ms)}</strong>
      </label>
      <input id={`${id}-ms`} className="demo-range" type="range" min={100} max={2000} step={100} value={ms} aria-label="응답시간" onChange={(e) => setMs(Number(e.target.value))} />
      <div className="demo-stats">
        <div className={`demo-stat${saturated ? ' is-warn' : ''}`} data-stat="needed">
          <span className="demo-stat-label">동시에 필요한 수</span>
          <span className="demo-stat-value">{n(needed)}건</span>
        </div>
        <div className="demo-stat" data-stat="threads">
          <span className="demo-stat-label">스레드</span>
          <span className="demo-stat-value">{THREADS}개</span>
        </div>
        <div className={`demo-stat${saturated ? ' is-warn' : ''}`} data-stat="served">
          <span className="demo-stat-label">실제 처리량</span>
          <span className="demo-stat-value">초당 {n(served)}건</span>
        </div>
      </div>
      <p className="demo-message" aria-live="polite" data-demo-message>
        {message(ms, needed, saturated, served)}
      </p>
    </figure>
  );
}
