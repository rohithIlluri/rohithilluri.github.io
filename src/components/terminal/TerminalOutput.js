import React, { useEffect, useRef } from 'react';

const PROMPT = (
  <span className="t-prompt">song $ </span>
);

export default function TerminalOutput({ lines }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  return (
    <div className="t-output">
      {lines.map(line => (
        <div
          key={line.id}
          className={
            line.isCommand ? 't-line t-line--cmd' :
            line.green     ? 't-line t-line--green' :
            line.dim       ? 't-line t-line--dim' :
            't-line'
          }
        >
          {line.isCommand ? (
            <>{PROMPT}<span>{line.text}</span></>
          ) : (
            line.text
          )}
        </div>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
