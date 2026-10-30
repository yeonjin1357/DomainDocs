import { useId, useState } from 'react';
import { counterWrapSeconds } from '../../lib/demo-models';
import './demo.css';

const SPEEDS = [
  { label: '100Mbps', bps: 1e8 },
  { label: '1Gbps', bps: 1e9 },
  { label: '10Gbps', bps: 1e10 },
];
const POLLS = [
  { label: '1분', sec: 60 },
  { label: '5분', sec: 300 },
];

function time(sec: number): string {
  if (sec < 60) return `${Math.round(sec * 10) / 10}초`;
  if (sec < 3600) return `${Math.round((sec / 60) * 10) / 10}분`;
  if (sec < 86_400 * 365) return `${Math.round((sec / 3600) * 10) / 10}시간`;
  return `${Math.round(sec / (86_400 * 365)).toLocaleString('ko-KR')}년`;
}

export default function CounterWrapDemo() {
  const id = useId();
  const [speed, setSpeed] = useState(1e9);
  const [util, setUtil] = useState(100);
  const [poll, setPoll] = useState(60);
  const wrap32 = counterWrapSeconds(32, speed, util / 100);
  const wrap64 = counterWrapSeconds(64, speed, util / 100);
  const broken = wrap32 <= poll;

  return (
    <figure className="demo" data-demo="counter-wrap">
      <figcaption className="demo-title">직접 해 보기: 속도와 읽는 간격 바꾸기</figcaption>
      <fieldset className="demo-segment">
        <legend>인터페이스 속도</legend>
        {SPEEDS.map((s) => (
          <label key={s.label} className={speed === s.bps ? 'is-active' : undefined}>
            <input type="radio" name={`${id}-speed`} checked={speed === s.bps} onChange={() => setSpeed(s.bps)} />
            {s.label}
          </label>
        ))}
      </fieldset>
      <label className="demo-control" htmlFor={`${id}-util`}>
        <span>사용률</span>
        <strong data-util>{util}%</strong>
      </label>
      <input id={`${id}-util`} className="demo-range" type="range" min={10} max={100} step={10} value={util} aria-label="사용률" onChange={(e) => setUtil(Number(e.target.value))} />
      <fieldset className="demo-segment">
        <legend>카운터를 읽는 간격</legend>
        {POLLS.map((p) => (
          <label key={p.label} className={poll === p.sec ? 'is-active' : undefined}>
            <input type="radio" name={`${id}-poll`} checked={poll === p.sec} onChange={() => setPoll(p.sec)} />
            {p.label}
          </label>
        ))}
      </fieldset>
      <div className="demo-stats">
        <div className={`demo-stat${broken ? ' is-warn' : ''}`} data-stat="wrap32">
          <span className="demo-stat-label">32비트가 한 바퀴 도는 시간</span>
          <span className="demo-stat-value">{time(wrap32)}</span>
        </div>
        <div className="demo-stat" data-stat="wrap64">
          <span className="demo-stat-label">64비트(ifHC)</span>
          <span className="demo-stat-value">{time(wrap64)}</span>
        </div>
      </div>
      <p className="demo-message" aria-live="polite" data-demo-message>
        {broken
          ? `32비트 카운터가 읽는 간격(${POLLS.find((p) => p.sec === poll)!.label})보다 빨리 한 바퀴 돌아서, 몇 바퀴 돌았는지 몰라 트래픽이 틀려요.`
          : `읽는 사이에 32비트 카운터가 한 바퀴를 다 돌지 않아요. 속도나 사용률이 오르면 금세 넘어서요.`}
      </p>
    </figure>
  );
}
