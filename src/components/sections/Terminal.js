import React, { useRef, useCallback } from 'react';
import useTerminal from '../../hooks/useTerminal';
import TerminalBoot from '../terminal/TerminalBoot';
import TerminalOutput from '../terminal/TerminalOutput';
import TerminalInput from '../terminal/TerminalInput';
import CreatureMascot from '../terminal/CreatureMascot';

export default function Terminal() {
  const {
    lines,
    inputValue,
    setInputValue,
    creatureState,
    isBooting,
    handleKeyDown,
    handleBootComplete,
  } = useTerminal();

  const containerRef = useRef(null);

  const focusInput = useCallback(() => {
    const input = containerRef.current?.querySelector('input');
    input?.focus();
  }, []);

  return (
    <section
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: 'calc(100vh - 160px)',
        marginBottom: '1rem',
      }}
    >
      {/* Decorative title bar */}
      <div className="terminal-titlebar">
        <span className="terminal-dot terminal-dot--red" />
        <span className="terminal-dot terminal-dot--yellow" />
        <span className="terminal-dot terminal-dot--green" />
        <span className="terminal-titlebar-label">
          rohith@portfolio — terminal
        </span>
      </div>

      {/* Main terminal body */}
      <div
        className="terminal-body"
        ref={containerRef}
        onClick={focusInput}
      >
        {/* Scrollable output area */}
        <div className="terminal-scroll-area">
          {isBooting && <TerminalBoot onComplete={handleBootComplete} />}
          <TerminalOutput lines={lines} />

          {/* Creature lives here, floating in bottom-right */}
          <CreatureMascot animationState={creatureState} />
        </div>

        {/* Sticky input line */}
        {!isBooting && (
          <div className="terminal-input-wrapper">
            <TerminalInput
              value={inputValue}
              onChange={setInputValue}
              onKeyDown={handleKeyDown}
              disabled={isBooting}
            />
          </div>
        )}
      </div>
    </section>
  );
}
