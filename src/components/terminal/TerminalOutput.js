import React, { useEffect, useRef } from 'react';

const PROMPT = (
  <span>
    <span style={{ color: 'var(--term-purple)', fontWeight: 600 }}>rohith</span>
    <span style={{ color: '#444' }}>@</span>
    <span style={{ color: 'var(--term-green)', fontWeight: 600 }}>portfolio</span>
    <span style={{ color: '#444' }}>:</span>
    <span style={{ color: 'var(--term-purple)' }}>~</span>
    <span style={{ color: '#e4e4e4' }}>$ </span>
  </span>
);

export default function TerminalOutput({ lines }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  return (
    <div className="terminal-output">
      {lines.map(line => (
        <div key={line.id} style={{ lineHeight: 1.6, minHeight: '1.2em' }}>
          {line.isCommand ? (
            <span>
              {PROMPT}
              <span style={{ color: line.color || 'var(--term-cyan)' }}>{line.text}</span>
            </span>
          ) : (
            <span style={{ color: line.color || 'var(--term-text)' }}>
              {line.text}
            </span>
          )}
        </div>
      ))}
      <div ref={bottomRef} style={{ height: 1 }} />
    </div>
  );
}
