import { useId, useState } from 'react';
import { assignPartitions } from '../../lib/demo-models';
import './demo.css';

export default function ConsumerGroupDemo() {
  const id = useId();
  const [partitions, setPartitions] = useState(4);
  const [consumers, setConsumers] = useState(2);
  const assigned = assignPartitions(partitions, consumers);
  const idle = assigned.filter((a) => a.length === 0).length;
  const busiest = Math.max(...assigned.map((a) => a.length));

  return (
    <figure className="demo" data-demo="consumer-group">
      <figcaption className="demo-title">직접 해 보기: 파티션과 컨슈머 수 바꾸기</figcaption>
      <ol className="demo-list" aria-label="컨슈머마다 맡은 파티션">
        {assigned.map((parts, i) => (
          <li key={i} className={parts.length === 0 ? 'is-warn' : undefined} data-consumer={i + 1}>
            <span className="demo-chips">
              {parts.length === 0 ? (
                <span className="demo-chip is-sub">맡은 파티션 없음</span>
              ) : (
                parts.map((p) => (
                  <span key={p} className="demo-chip is-accent">
                    P{p}
                  </span>
                ))
              )}
            </span>
            <span className="demo-list-value">컨슈머 {i + 1}</span>
          </li>
        ))}
      </ol>
      <p className="demo-legend">한 그룹 안에서 파티션 하나는 컨슈머 하나만 맡아요. 차례로 고르게 나눈 예시예요.</p>
      <label className="demo-control" htmlFor={`${id}-partitions`}>
        <span>파티션</span>
        <strong data-partitions>{partitions}개</strong>
      </label>
      <input id={`${id}-partitions`} className="demo-range" type="range" min={1} max={8} step={1} value={partitions} aria-label="파티션 수" onChange={(e) => setPartitions(Number(e.target.value))} />
      <label className="demo-control" htmlFor={`${id}-consumers`}>
        <span>그룹 안의 컨슈머</span>
        <strong data-consumers>{consumers}개</strong>
      </label>
      <input id={`${id}-consumers`} className="demo-range" type="range" min={1} max={8} step={1} value={consumers} aria-label="컨슈머 수" onChange={(e) => setConsumers(Number(e.target.value))} />
      <div className="demo-stats">
        <div className="demo-stat" data-stat="working">
          <span className="demo-stat-label">일하는 컨슈머</span>
          <span className="demo-stat-value">{consumers - idle}개</span>
        </div>
        <div className={`demo-stat${idle > 0 ? ' is-warn' : ''}`} data-stat="idle">
          <span className="demo-stat-label">노는 컨슈머</span>
          <span className="demo-stat-value">{idle}개</span>
        </div>
      </div>
      <p className="demo-message" aria-live="polite" data-demo-message>
        {idle > 0
          ? `파티션이 ${partitions}개라 컨슈머 ${idle}개는 맡을 파티션 없이 놀아요. 더 빨리 처리하려면 파티션부터 늘려야 해요.`
          : `컨슈머마다 파티션을 많게는 ${busiest}개 맡아요. 컨슈머는 파티션 수인 ${partitions}개까지 늘려 볼 수 있어요.`}
      </p>
    </figure>
  );
}
