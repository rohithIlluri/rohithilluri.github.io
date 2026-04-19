import React, { useRef, useCallback } from 'react';
import useTerminal from '../../hooks/useTerminal';
import TerminalBoot from '../terminal/TerminalBoot';
import TerminalOutput from '../terminal/TerminalOutput';
import TerminalInput from '../terminal/TerminalInput';
import CreatureMascot from '../terminal/CreatureMascot';

export default function Terminal() {
  const {
    lines, inputValue, setInputValue,
    creatureState, isBooting,
    handleKeyDown, handleBootComplete,
  } = useTerminal();

  const containerRef = useRef(null);
  const focusInput = useCallback(() => {
    containerRef.current?.querySelector('input')?.focus();
  }, []);

  return (
    <div className="t-root" ref={containerRef} onClick={focusInput}>
      <div className="t-scroll">
        {isBooting && <TerminalBoot onComplete={handleBootComplete} />}
        <TerminalOutput lines={lines} />
        <CreatureMascot animationState={creatureState} />
      </div>

      {!isBooting && (
        <div className="t-input-wrapper">
          <TerminalInput
            value={inputValue}
            onChange={setInputValue}
            onKeyDown={handleKeyDown}
            disabled={isBooting}
          />
        </div>
      )}
    </div>
  );
}
