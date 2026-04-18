import React, { useState, useEffect, useRef } from 'react';
import { BOOT_TEXT } from '../../constants/terminalCommands';

export default function TerminalBoot({ onComplete }) {
  const [displayed, setDisplayed] = useState('');
  const hasStarted = useRef(false);

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(BOOT_TEXT.slice(0, i));
      if (i >= BOOT_TEXT.length) {
        clearInterval(interval);
        setTimeout(onComplete, 300);
      }
    }, 12);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <pre style={{
      color: 'var(--term-green)',
      fontFamily: 'inherit',
      fontSize: 'inherit',
      margin: '0 0 8px 0',
      whiteSpace: 'pre-wrap',
      lineHeight: 1.5,
    }}>
      {displayed}
      <span className="term-cursor" />
    </pre>
  );
}
