import React, { useState, useEffect, useRef } from 'react';
import { BOOT_TEXT } from '../../constants/terminalCommands';

export default function TerminalBoot({ onComplete }) {
  const [displayed, setDisplayed] = useState('');
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    let i = 0;
    const iv = setInterval(() => {
      i++;
      setDisplayed(BOOT_TEXT.slice(0, i));
      if (i >= BOOT_TEXT.length) {
        clearInterval(iv);
        setTimeout(onComplete, 500);
      }
    }, 10);

    return () => clearInterval(iv);
  }, [onComplete]);

  return (
    <pre className="boot-text">{displayed}</pre>
  );
}
