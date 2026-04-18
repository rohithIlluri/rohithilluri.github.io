import React, { memo } from 'react';

const STATS = [
  { key: 'deadlift_pr',  value: '340 lbs' },
  { key: 'bench_press',  value: '180 lbs' },
  { key: 'run',          value: '11.32 miles' },
  { key: 'typing_30s',   value: '95 wpm' },
  { key: 'typing_15s',   value: '103.13 wpm' },
];

const Stats = () => (
  <section id="stats" aria-label="Stats" style={{ marginBottom: '0.5rem' }}>
    <div className="term-block">
      <div className="term-cmd">
        <span className="term-prompt">❯</span>
        <span className="term-command">cat stats.json</span>
      </div>
      <div className="term-output">
        <div className="term-json-block">
          <span style={{ color: '#6b6b6b' }}>{'{'}</span>
          {STATS.map((s, i) => (
            <div key={s.key} style={{ paddingLeft: '1.25rem' }}>
              <span style={{ color: '#c084fc' }}>"{s.key}"</span>
              <span style={{ color: '#6b6b6b' }}>: </span>
              <span style={{ color: '#4ade80' }}>"{s.value}"</span>
              {i < STATS.length - 1 && <span style={{ color: '#6b6b6b' }}>,</span>}
            </div>
          ))}
          <span style={{ color: '#6b6b6b' }}>{'}'}</span>
        </div>
      </div>
    </div>
  </section>
);

export default memo(Stats);
