import { useState, useCallback, useRef } from 'react';
import { runCommand, TAB_COMPLETIONS } from '../constants/terminalCommands';

let lineIdCounter = 0;
const makeId = () => `l${++lineIdCounter}`;

export default function useTerminal() {
  const [lines, setLines]             = useState([]);
  const [inputValue, setInputValue]   = useState('');
  const [cmdHistory, setCmdHistory]   = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [creatureState, setCreatureState] = useState('boot');
  const [isBooting, setIsBooting]     = useState(true);
  const creatureTimer = useRef(null);

  const triggerCreature = useCallback((state) => {
    if (!state || state === 'idle') return;
    clearTimeout(creatureTimer.current);
    setCreatureState(state);
    const dur = state === 'spin' ? 1500 : state === 'celebrate' ? 1200 : 1000;
    creatureTimer.current = setTimeout(() => setCreatureState('idle'), dur);
  }, []);

  const appendLines = useCallback((newLines) => {
    setLines(prev => [
      ...prev,
      ...newLines.map(l => ({ ...l, id: makeId() })),
    ]);
  }, []);

  const executeCommand = useCallback(async (raw) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    setLines(prev => [
      ...prev,
      { id: makeId(), text: trimmed, isCommand: true },
    ]);

    setCmdHistory(prev => {
      const next = [trimmed, ...prev];
      return next;
    });
    setHistoryIndex(-1);
    setCreatureState('thinking');

    const snapshot = await new Promise(resolve => {
      setCmdHistory(h => { resolve(h); return h; });
    });

    const { lines: outLines, creatureHint } = await runCommand(trimmed, {
      history: snapshot,
    });

    if (outLines === null) {
      setLines([]);
    } else if (outLines && outLines.length) {
      appendLines(outLines);
    }

    triggerCreature(creatureHint || 'celebrate');
  }, [appendLines, triggerCreature]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      const val = inputValue;
      setInputValue('');
      executeCommand(val);

    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCmdHistory(hist => {
        const next = Math.min(historyIndex + 1, hist.length - 1);
        setHistoryIndex(next);
        if (hist[next] !== undefined) setInputValue(hist[next]);
        return hist;
      });

    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = historyIndex - 1;
      setHistoryIndex(next);
      setInputValue(next < 0 ? '' : cmdHistory[next] || '');

    } else if (e.key === 'Tab') {
      e.preventDefault();
      const matches = TAB_COMPLETIONS.filter(
        c => c.startsWith(inputValue) && c !== inputValue
      );
      if (matches.length === 1) {
        setInputValue(matches[0]);
      } else if (matches.length > 1) {
        appendLines([{ text: matches.join('   '), dim: true }]);
      }

    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      if (inputValue) {
        setLines(prev => [
          ...prev,
          { id: makeId(), text: `${inputValue}^C`, isCommand: true, dim: true },
        ]);
      }
      setInputValue('');
      setHistoryIndex(-1);

    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      setLines([]);
    }
  }, [inputValue, historyIndex, cmdHistory, executeCommand, appendLines]);

  const handleBootComplete = useCallback(() => {
    setIsBooting(false);
    setCreatureState('idle');
  }, []);

  return {
    lines,
    inputValue,
    setInputValue,
    creatureState,
    isBooting,
    handleKeyDown,
    handleBootComplete,
  };
}
