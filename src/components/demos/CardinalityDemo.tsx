import { useState } from 'react';
import { maxSeries } from '../../lib/demo-models';
import './demo.css';

const LABELS = [
  { name: 'method', count: 5 },
  { name: 'status', count: 10 },
  { name: 'route', count: 200 },
  { name: 'instance', count: 50 },
  { name: 'user_id', count: 10_000, unbounded: true },
];
const n = (v: number) => v.toLocaleString('ko-KR');

function message(on: typeof LABELS, total: number): string {
  if (on.some((l) => l.unbounded)) return `user_id는 사용자가 늘 때마다 값이 늘어요. 시계열이 최대 ${n(total)}개까지 불어나요.`;
  if (on.length === 0) return '레이블이 없으면 지표 하나가 시계열 하나예요.';
  return `레이블 ${on.length}개의 값 수를 곱하면 시계열은 최대 ${n(total)}개예요.`;
}

export default function CardinalityDemo() {
  const [picked, setPicked] = useState<string[]>(['method', 'status', 'route']);
  const on = LABELS.filter((l) => picked.includes(l.name));
  const total = maxSeries(on.map((l) => l.count));
  const toggle = (name: string, checked: boolean) => setPicked((p) => (checked ? [...p, name] : p.filter((x) => x !== name)));

  return (
    <figure className="demo" data-demo="cardinality">
      <figcaption className="demo-title">직접 해 보기: 레이블 붙이고 떼기</figcaption>
      <p className="demo-formula" data-formula>
        {on.length === 0 ? '1' : on.map((l) => `${n(l.count)}`).join(' × ')} = <strong>{n(total)}</strong>
      </p>
      <fieldset className="demo-segment">
        <legend>http_requests_total에 붙일 레이블</legend>
        {LABELS.map((l) => (
          <label key={l.name} className={[picked.includes(l.name) && 'is-active', l.unbounded && 'is-warn'].filter(Boolean).join(' ') || undefined}>
            <input type="checkbox" checked={picked.includes(l.name)} onChange={(e) => toggle(l.name, e.target.checked)} />
            {l.name} {n(l.count)}개
          </label>
        ))}
      </fieldset>
      <p className="demo-legend">instance는 서버 50대, user_id는 사용자 1만 명으로 잡은 예시예요.</p>
      <div className="demo-stats">
        <div className={`demo-stat${total > 1_000_000 ? ' is-warn' : ''}`} data-stat="series">
          <span className="demo-stat-label">시계열 최대 개수</span>
          <span className="demo-stat-value">{n(total)}개</span>
        </div>
      </div>
      <p className="demo-message" aria-live="polite" data-demo-message>
        {message(on, total)}
      </p>
    </figure>
  );
}
