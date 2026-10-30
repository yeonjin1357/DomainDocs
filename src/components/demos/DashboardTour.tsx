import { Fragment, useState } from 'react';
import { TOURS, type TourScreen, type TourWidget } from '../../data/dashboard-tours';
import { docPath } from '../../lib/paths';
import { linePath, type ChartBox } from '../../lib/viz/line';
import './demo.css';

const BOX: ChartBox = { width: 300, height: 70, padding: 4 };

/** 2열 격자에서 칸들이 몇째 줄에 놓이는지 묶어요. 설명은 고른 칸의 줄 바로 뒤에 펼쳐요. */
function rowsOf(widgets: TourWidget[]): number[][] {
  const rows: number[][] = [];
  let used = 2;
  widgets.forEach((w, i) => {
    if (used + w.span > 2) {
      rows.push([]);
      used = 0;
    }
    rows.at(-1)!.push(i);
    used += w.span;
  });
  return rows;
}

function Visual({ w }: { w: TourWidget }) {
  if (w.kind === 'stat') {
    return (
      <>
        <span className={`tour-value${w.tone === 'warn' ? ' is-warn' : ''}`}>
          {w.value}
          {w.unit && <small> {w.unit}</small>}
        </span>
        {w.note && <span className="tour-note">{w.note}</span>}
      </>
    );
  }
  if (w.kind === 'line') {
    return (
      <>
        <svg className="tour-chart" viewBox={`0 0 ${BOX.width} ${BOX.height}`} preserveAspectRatio="none" aria-hidden="true">
          {w.series.map((s) => (
            <path key={s.label} className={`tour-line${s.tone ? ` is-${s.tone}` : ''}`} d={linePath(s.values, w.yMax, BOX)} vectorEffect="non-scaling-stroke" />
          ))}
        </svg>
        <span className="tour-legend">
          {w.series.map((s) => (
            <span key={s.label} className={s.tone ? `is-${s.tone}` : undefined}>
              {s.label} <b>{s.value}</b>
            </span>
          ))}
        </span>
      </>
    );
  }
  if (w.kind === 'bars') {
    const max = Math.max(...w.rows.map((r) => r.value));
    return (
      <span className="tour-bars">
        {w.rows.map((r) => (
          <span key={r.label} className={`tour-bar${r.tone === 'warn' ? ' is-warn' : ''}`}>
            <span className="tour-bar-label">{r.label}</span>
            <span className="tour-bar-track">
              <span className="tour-bar-fill" style={{ width: `${(r.value / max) * 100}%` }} />
            </span>
            <span className="tour-bar-text">{r.text}</span>
          </span>
        ))}
      </span>
    );
  }
  return (
    <span className="tour-table">
      <span className="tour-tr is-head" style={w.cols ? { gridTemplateColumns: w.cols } : undefined}>
        {w.head.map((h) => (
          <span key={h}>{h}</span>
        ))}
      </span>
      {w.rows.map((r) => (
        <span key={r.cells[0]} className={`tour-tr${r.tone === 'warn' ? ' is-warn' : ''}`} style={w.cols ? { gridTemplateColumns: w.cols } : undefined}>
          {r.cells.map((c, i) => (
            <span key={i}>{c}</span>
          ))}
        </span>
      ))}
    </span>
  );
}

export default function DashboardTour({ screen }: { screen: TourScreen }) {
  const tour = TOURS[screen];
  const widgets = tour.widgets as TourWidget[];
  const [selected, setSelected] = useState<number | null>(null);
  const rows = rowsOf(widgets);
  const go = (i: number) => setSelected((i + widgets.length) % widgets.length);

  const panel = (i: number) => {
    const w = widgets[i];
    return (
      <div className="tour-panel" aria-live="polite" data-tour-panel>
        <p className="tour-panel-title">
          <span className="tour-num">{i + 1}</span>
          {w.title}
        </p>
        <dl className="tour-explain">
          <dt>무엇인가요</dt>
          <dd>{w.what}</dd>
          <dt>이렇게 읽어요</dt>
          <dd>{w.read}</dd>
          <dt>흔한 함정</dt>
          <dd>{w.trap}</dd>
        </dl>
        <div className="tour-links">
          {w.links.map((l) => (
            <a key={l.slug} href={docPath(l.slug)}>
              {l.title}
            </a>
          ))}
        </div>
        <div className="demo-buttons">
          <button type="button" className="demo-button" onClick={() => go(i - 1)}>
            이전 칸
          </button>
          <button type="button" className="demo-button" onClick={() => go(i + 1)}>
            다음 칸
          </button>
        </div>
      </div>
    );
  };

  return (
    <figure className="demo" data-demo={`tour-${screen}`}>
      <figcaption className="demo-title">직접 해 보기: 화면의 칸을 눌러 보기</figcaption>
      <div className="tour-screen">
        <p className="tour-bar-title">{tour.title}</p>
        <div className="tour-grid">
          {rows.map((row, r) => (
            <Fragment key={r}>
              {row.map((i) => {
                const w = widgets[i];
                return (
                  <button
                    key={w.id}
                    type="button"
                    className={`tour-widget span-${w.span}${selected === i ? ' is-selected' : ''}`}
                    aria-pressed={selected === i}
                    data-tour-widget={w.id}
                    onClick={() => setSelected(selected === i ? null : i)}
                  >
                    <span className="tour-widget-head">
                      <span className="tour-num">{i + 1}</span>
                      {w.title}
                    </span>
                    <Visual w={w} />
                  </button>
                );
              })}
              {selected !== null && row.includes(selected) && panel(selected)}
            </Fragment>
          ))}
        </div>
      </div>
      <p className="demo-legend">숫자는 설명용 예시예요. 칸을 누르면 바로 아래에 설명이 펼쳐져요.</p>
    </figure>
  );
}
