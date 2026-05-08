import React, { useMemo } from 'react';
import { COLOR_CLASS } from '../../constants/asciiPalette';

function stripLead(s) {
  return s.startsWith('\n') ? s.slice(1) : s;
}

function buildRows(art, colormap) {
  const artRows = stripLead(art).split('\n');
  const cmRows  = stripLead(colormap || '').split('\n');

  return artRows.map((row, ri) => {
    const cmRow = cmRows[ri] || '';
    const segments = [];
    let curCode = null;
    let buf = '';

    for (let i = 0; i < row.length; i++) {
      const ch = row[i];
      const code = cmRow[i] || '.';
      if (code !== curCode) {
        if (buf) segments.push({ code: curCode, text: buf });
        curCode = code;
        buf = ch;
      } else {
        buf += ch;
      }
    }
    if (buf) segments.push({ code: curCode, text: buf });
    return segments;
  });
}

function AsciiFrame({ art, colormap, className = '' }) {
  const rows = useMemo(() => buildRows(art, colormap), [art, colormap]);

  return (
    <pre className={`ac-frame ${className}`} aria-hidden="true">
      {rows.map((segs, ri) => (
        <div className="ac-row" key={ri}>
          {segs.map((s, si) => {
            const cls = COLOR_CLASS[s.code] || '';
            return cls
              ? <span key={si} className={cls}>{s.text}</span>
              : <span key={si}>{s.text}</span>;
          })}
        </div>
      ))}
    </pre>
  );
}

export default React.memo(AsciiFrame);
