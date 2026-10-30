import { useId, useState } from 'react';
import { subnetRange } from '../../lib/demo-models';
import './demo.css';

const IP = '192.168.10.25';
const OCTETS = IP.split('.').map(Number);

export default function SubnetDemo() {
  const id = useId();
  const [prefix, setPrefix] = useState(24);
  const { first, last, size } = subnetRange(IP, prefix);

  return (
    <figure className="demo" data-demo="subnet">
      <figcaption className="demo-title">직접 해 보기: 접두사 길이 바꾸기</figcaption>
      <div className="demo-octets" role="img" aria-label={`${IP}/${prefix}, 앞 ${prefix}비트가 네트워크 부분`}>
        {OCTETS.map((o, oi) => (
          <div key={oi} className="demo-octet">
            <span className="demo-octet-value">{o}</span>
            <span className="demo-chips">
              {o
                .toString(2)
                .padStart(8, '0')
                .split('')
                .map((bit, bi) => (
                  <span key={bi} className={`demo-chip is-bit ${oi * 8 + bi < prefix ? 'is-accent' : ''}`.trim()}>
                    {bit}
                  </span>
                ))}
            </span>
          </div>
        ))}
      </div>
      <p className="demo-legend">{IP}의 32비트예요. 파란 칸이 네트워크 부분, 흰 칸이 그 안의 장비를 가리키는 부분이에요.</p>
      <label className="demo-control" htmlFor={`${id}-prefix`}>
        <span>접두사 길이</span>
        <strong data-prefix>/{prefix}</strong>
      </label>
      <input id={`${id}-prefix`} className="demo-range" type="range" min={8} max={30} step={1} value={prefix} aria-label="접두사 길이" onChange={(e) => setPrefix(Number(e.target.value))} />
      <div className="demo-stats">
        <div className="demo-stat is-stacked" data-stat="range">
          <span className="demo-stat-label">같은 네트워크의 주소</span>
          <span className="demo-stat-value demo-stat-small">
            {first} ~ {last}
          </span>
        </div>
        <div className="demo-stat" data-stat="size">
          <span className="demo-stat-label">주소 수</span>
          <span className="demo-stat-value">{size.toLocaleString('ko-KR')}개</span>
        </div>
      </div>
      <p className="demo-message" aria-live="polite" data-demo-message>
        앞 {prefix}비트가 같은 주소끼리 같은 네트워크예요. 접두사가 1 길어질 때마다 네트워크의 주소 수는 절반이 돼요.
      </p>
    </figure>
  );
}
