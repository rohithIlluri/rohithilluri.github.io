import React, { useRef, useEffect } from 'react';

export default function TerminalInput({ value, onChange, onKeyDown, disabled }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (!disabled) {
      const t = setTimeout(() => inputRef.current?.focus(), 80);
      return () => clearTimeout(t);
    }
  }, [disabled]);

  return (
    <div className="t-input-line" onClick={() => inputRef.current?.focus()}>
      <span className="t-prompt">song $ </span>
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
        className="t-input"
      />
    </div>
  );
}
