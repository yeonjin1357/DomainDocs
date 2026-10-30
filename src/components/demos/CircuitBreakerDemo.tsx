import { useState } from 'react';
import { BREAKER_CONFIG, breakerCall, type Breaker } from '../../lib/demo-models';
import './demo.css';

const START: Breaker = { state: 'CLOSED', calls: [], waited: false };
const STATE_LABEL = { CLOSED: '닫힘', OPEN: '열림', HALF_OPEN: '반열림' } as const;

export default function CircuitBreakerDemo() {
  const [breaker, setBreaker] = useState<Breaker>(START);
  const [rejected, setRejected] = useState(0);
  const [last, setLast] = useState('호출을 보내 보세요. 닫힘에서는 최근 10번을 보고 열지 정해요.');

  const call = (failed: boolean) => {
    const { next, rejected: no } = breakerCall(breaker, failed);
    setBreaker(next);
    if (no) {
      setRejected((r) => r + 1);
      setLast('열려 있어서 호출을 보내지 않고 바로 거절했어요(CallNotPermittedException).');
    } else if (breaker.state !== next.state) {
      setLast(`${STATE_LABEL[breaker.state]} → ${STATE_LABEL[next.state]}으로 바뀌었어요.`);
    } else if (next.state === 'CLOSED' && next.calls.length < BREAKER_CONFIG.minCalls) {
      setLast(`호출이 ${next.calls.length}번이라, ${BREAKER_CONFIG.minCalls}번이 쌓일 때까지 실패율을 계산하지 않아요.`);
    } else if (next.state === 'HALF_OPEN') {
      setLast(`시험 호출 ${next.calls.length}/${BREAKER_CONFIG.halfOpenCalls}번째예요.`);
    } else {
      setLast('실패율이 50% 아래라 닫힌 채로 있어요.');
    }
  };
  const wait = () => {
    setBreaker({ ...breaker, waited: true });
    setLast('기다리는 시간이 지났어요. 다음 호출이 들어오면 반열림으로 바뀌어요.');
  };
  const reset = () => {
    setBreaker(START);
    setRejected(0);
    setLast('다시 시작했어요.');
  };
  const failures = breaker.calls.filter(Boolean).length;
  const slots = breaker.state === 'HALF_OPEN' ? BREAKER_CONFIG.halfOpenCalls : BREAKER_CONFIG.window;

  return (
    <figure className="demo" data-demo="circuit-breaker">
      <figcaption className="demo-title">직접 해 보기: 호출을 하나씩 보내기</figcaption>
      <div className="demo-chips" role="img" aria-label={`상태 ${STATE_LABEL[breaker.state]}, 기록된 호출 ${breaker.calls.length}번 중 실패 ${failures}번`}>
        {Array.from({ length: slots }, (_, i) => {
          const c = breaker.calls[i];
          return (
            <span key={i} className={`demo-chip is-dot ${c === undefined ? '' : c ? 'is-warn' : 'is-accent'}`.trim()} />
          );
        })}
      </div>
      <p className="demo-legend">
        {breaker.state === 'HALF_OPEN' ? '칸은 반열림의 시험 호출 3번이에요.' : '칸은 닫힘에서 실패율을 세는 최근 호출 10번이에요.'} 파란 칸은 성공, 빨간 칸은 실패예요. 글의 재현처럼 창과 최소 호출 수 10, 실패율 50%, 시험 호출 3번으로 줄였어요.
      </p>
      <div className="demo-buttons">
        <button type="button" className="demo-button" onClick={() => call(false)}>
          성공 호출
        </button>
        <button type="button" className="demo-button is-warn" onClick={() => call(true)}>
          실패 호출
        </button>
        <button type="button" className="demo-button" onClick={wait} disabled={breaker.state !== 'OPEN' || breaker.waited}>
          기다리는 시간 지나기
        </button>
        <button type="button" className="demo-button" onClick={reset}>
          다시 시작
        </button>
      </div>
      <div className="demo-stats">
        <div className={`demo-stat${breaker.state === 'CLOSED' ? '' : ' is-warn'}`} data-stat="state">
          <span className="demo-stat-label">상태</span>
          <span className="demo-stat-value">{STATE_LABEL[breaker.state]}</span>
        </div>
        <div className="demo-stat" data-stat="failure">
          <span className="demo-stat-label">기록된 실패</span>
          <span className="demo-stat-value">
            {failures}/{breaker.calls.length}번
          </span>
        </div>
        <div className={`demo-stat${rejected > 0 ? ' is-warn' : ''}`} data-stat="rejected">
          <span className="demo-stat-label">거절된 호출</span>
          <span className="demo-stat-value">{rejected}번</span>
        </div>
      </div>
      <p className="demo-message" aria-live="polite" data-demo-message>
        {last}
      </p>
    </figure>
  );
}
