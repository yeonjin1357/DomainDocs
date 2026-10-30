import { useId, useState } from 'react';
import { dnsLookupOrder } from '../../lib/demo-models';
import './demo.css';

/** shop 네임스페이스 파드의 검색 도메인과, 실제로 있는 이름 셋(예시) */
const SEARCH = ['shop.svc.cluster.local', 'svc.cluster.local', 'cluster.local'];
const EXISTS = new Set(['pay.shop.svc.cluster.local', 'pay.billing.svc.cluster.local', 'api.example.com']);
const NAMES = ['pay', 'pay.billing', 'api.example.com', 'api.example.com.'];
const NDOTS = [5, 2, 1];

function message(name: string, ndots: number, count: number): string {
  const dots = name.replace(/\.$/, '').split('.').length - 1;
  if (name.endsWith('.')) return '끝에 점이 있어서 검색 도메인을 붙이지 않고 한 번에 물어요.';
  if (dots >= ndots) return `점이 ${dots}개로 ndots ${ndots} 이상이라, 이름 그대로부터 물어요. ${count}번째에 답을 받아요.`;
  return `점이 ${dots}개로 ndots ${ndots}보다 적어서, 검색 도메인부터 붙여 봐요. ${count}번째에 답을 받아요.`;
}

export default function DnsSearchDemo() {
  const id = useId();
  const [name, setName] = useState('api.example.com');
  const [ndots, setNdots] = useState(5);
  const queries = dnsLookupOrder(name, ndots, SEARCH, EXISTS);

  return (
    <figure className="demo" data-demo="dns-search">
      <figcaption className="demo-title">직접 해 보기: 이름과 ndots 바꾸기</figcaption>
      <fieldset className="demo-segment">
        <legend>shop 네임스페이스의 파드가 찾는 이름</legend>
        {NAMES.map((v) => (
          <label key={v} className={name === v ? 'is-active' : undefined}>
            <input type="radio" name={`${id}-name`} checked={name === v} onChange={() => setName(v)} />
            {v}
          </label>
        ))}
      </fieldset>
      <fieldset className="demo-segment">
        <legend>ndots</legend>
        {NDOTS.map((v) => (
          <label key={v} className={ndots === v ? 'is-active' : undefined}>
            <input type="radio" name={`${id}-ndots`} checked={ndots === v} onChange={() => setNdots(v)} />
            {v === 5 ? '5(기본)' : v}
          </label>
        ))}
      </fieldset>
      <ol className="demo-list" aria-label="리졸버가 차례로 묻는 이름">
        {queries.map((q) => (
          <li key={q.query} className={q.found ? 'is-accent' : 'is-warn'}>
            <span className="demo-list-name">
              {q.query.split('.').map((part, i) => (
                <span key={i}>
                  {i > 0 && '.'}
                  {i > 0 && <wbr />}
                  {part}
                </span>
              ))}
            </span>
            <span className="demo-list-value">{q.found ? '찾음' : '없음'}</span>
          </li>
        ))}
      </ol>
      <div className="demo-stats">
        <div className={`demo-stat${queries.length > 1 ? ' is-warn' : ''}`} data-stat="queries">
          <span className="demo-stat-label">물은 이름</span>
          <span className="demo-stat-value">{queries.length}번</span>
        </div>
        <div className="demo-stat" data-stat="with-aaaa">
          <span className="demo-stat-label">A·AAAA를 함께 찾으면</span>
          <span className="demo-stat-value">{queries.length * 2}번</span>
        </div>
      </div>
      <p className="demo-message" aria-live="polite" data-demo-message>
        {message(name, ndots, queries.length)}
      </p>
    </figure>
  );
}
