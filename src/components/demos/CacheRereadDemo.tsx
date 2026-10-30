import { useId, useState } from 'react';
import { rereadHitRatio } from '../../lib/demo-models';
import './demo.css';

const pct = (v: number) => `${(Math.round(v * 1000) / 10).toLocaleString('ko-KR')}%`;

export default function CacheRereadDemo() {
  const id = useId();
  const [passes, setPasses] = useState(1);
  const { logical, physical, ratio } = rereadHitRatio(passes);
  // 첫 번째로 읽을 때 블록 2개가 캐시에 없어요. 그 뒤로는 모두 캐시에서 찾아요.
  const reads = Array.from({ length: logical }, (_, i) => (i === 1 || i === 3 ? 'miss' : 'hit'));

  return (
    <figure className="demo" data-demo="cache-reread">
      <figcaption className="demo-title">직접 해 보기: 같은 블록을 다시 읽기</figcaption>
      <div className="demo-chips" role="img" aria-label={`블록 읽기 ${logical}번 중 디스크 쪽 ${physical}번`}>
        {reads.map((r, i) => (
          <span key={i} className={`demo-chip is-dot ${r === 'miss' ? 'is-warn' : 'is-accent'}`} />
        ))}
      </div>
      <p className="demo-legend">칸 하나가 블록 읽기 한 번이에요. 파란 칸은 캐시에서 찾은 읽기, 빨간 칸은 디스크 쪽 읽기예요. 블록 4개 중 2개는 캐시에 없어서, 첫 번째로 읽을 때만 디스크 쪽에서 가져와요.</p>
      <label className="demo-control" htmlFor={`${id}-passes`}>
        <span>같은 블록을 읽는 횟수</span>
        <strong data-passes>{passes}번</strong>
      </label>
      <input id={`${id}-passes`} className="demo-range" type="range" min={1} max={10} step={1} value={passes} aria-label="같은 블록을 읽는 횟수" onChange={(e) => setPasses(Number(e.target.value))} />
      <div className="demo-stats">
        <div className="demo-stat" data-stat="logical">
          <span className="demo-stat-label">읽은 블록(일한 양)</span>
          <span className="demo-stat-value">{logical}번</span>
        </div>
        <div className="demo-stat" data-stat="physical">
          <span className="demo-stat-label">디스크 쪽 읽기</span>
          <span className="demo-stat-value">{physical}번</span>
        </div>
        <div className="demo-stat" data-stat="ratio">
          <span className="demo-stat-label">적중률</span>
          <span className="demo-stat-value">{pct(ratio)}</span>
        </div>
      </div>
      <p className="demo-message" aria-live="polite" data-demo-message>
        {passes === 1
          ? '한 번씩 읽으면 4번 중 2번을 캐시에서 찾아 50%예요.'
          : `일을 ${passes}배 했는데 적중률은 ${pct(ratio)}로 올랐어요. 디스크 쪽 읽기는 2번 그대로예요.`}
      </p>
    </figure>
  );
}
