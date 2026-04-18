import React, { useRef, useEffect } from 'react';

export default function TerminalInput({ value, onChange, onKeyDown, disabled }) {
  const inputRef = useRef(null);

  // Focus when enabled (after boot)
  useEffect(() => {
    if (!disabled) {
      // Slight delay prevents iOS keyboard pop-up on load
      const t = setTimeout(() => inputRef.current?.focus(), 100);
      return () => clearTimeout(t);
    }
  }, [disabled]);

  return (
    <div
      className="terminal-input-line"
      onClick={() => inputRef.current?.focus()}
    >
      <span style={{ color: 'var(--term-purple)', fontWeight: 600 }}>rohith</span>
      <span style={{ color: '#444' }}>@</span>
      <span style={{ color: 'var(--term-green)', fontWeight: 600 }}>portfolio</span>
      <span style={{ color: '#444' }}>:</span>
      <span style={{ color: 'var(--term-purple)' }}>~</span>
      <span style={{ color: '#e4e4e4' }}>$ </span>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        disabled={disabled}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        inputMode="text"
        aria-label="terminal input"
        style={{
          background: 'transparent',
          border: 'none',
          outline: 'none',
          color: 'var(--term-cyan)',
          fontFamily: 'inherit',
          fontSize: 'inherit',
          caretColor: 'var(--term-green)',
          flex: 1,
          minWidth: 0,
          width: '100%',
        }}
      />
      {!value && !disabled && <span className="term-cursor" />}
    </div>
  );
}
