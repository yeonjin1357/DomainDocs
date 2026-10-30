import { useId, useState } from 'react';
import { partitionForKey } from '../../lib/demo-models';
import './demo.css';

const KEYS = ['user-1', 'user-2', 'user-3', 'user-4', 'user-5', 'user-6', 'user-7', 'user-8'];
const BEFORE = 4;
const COUNTS = [4, 5, 6, 8];

export default function PartitionKeyDemo() {
  const id = useId();
  const [count, setCount] = useState(BEFORE);
  const rows = KEYS.map((key) => ({ key, before: partitionForKey(key, BEFORE), now: partitionForKey(key, count) }));
  const moved = rows.filter((r) => r.before !== r.now).length;

  return (
    <figure className="demo" data-demo="partition-key">
      <figcaption className="demo-title">직접 해 보기: 파티션 늘리기</figcaption>
      <ol className="demo-list is-two" aria-label="키마다 고른 파티션">
        {rows.map((r) => (
          <li key={r.key} className={r.before !== r.now ? 'is-warn' : undefined} data-key={r.key}>
            <span className="demo-list-name">{r.key}</span>
            <span className="demo-list-value">
              {r.before !== r.now ? `P${r.before} → P${r.now}` : `P${r.now}`}
            </span>
          </li>
        ))}
      </ol>
      <p className="demo-legend">Kafka 기본 파티셔너와 같은 해시(murmur2)로 고른 파티션이에요. 빨간 줄은 파티션 {BEFORE}개일 때와 자리가 달라진 키예요.</p>
      <fieldset className="demo-segment">
        <legend>파티션 수</legend>
        {COUNTS.map((v) => (
          <label key={v} className={count === v ? 'is-active' : undefined}>
            <input type="radio" name={`${id}-count`} checked={count === v} onChange={() => setCount(v)} />
            {v}개
          </label>
        ))}
      </fieldset>
      <div className="demo-stats">
        <div className={`demo-stat${moved > 0 ? ' is-warn' : ''}`} data-stat="moved">
          <span className="demo-stat-label">자리가 바뀐 키</span>
          <span className="demo-stat-value">
            {moved}/{KEYS.length}개
          </span>
        </div>
      </div>
      <p className="demo-message" aria-live="polite" data-demo-message>
        {moved === 0
          ? `파티션이 ${BEFORE}개면 같은 키는 늘 같은 파티션으로 가요.`
          : `파티션을 ${count}개로 바꾸자 키 ${moved}개의 파티션이 바뀌었어요. 바뀌기 전 이벤트와 뒤 이벤트는 서로 다른 파티션에 있어서 순서가 섞일 수 있어요.`}
      </p>
    </figure>
  );
}
