import { useState, useCallback, useRef } from 'react';
import { runCommand, TAB_COMPLETIONS } from '../constants/terminalCommands';

let lineIdCounter = 0;
function makeId() { return `l${++lineIdCounter}`; }

export default function useTerminal() {
  const [lines, setLines] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [cmdHistory, setCmdHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [creatureState, setCreatureState] = useState('boot');
  const [isBooting, setIsBooting] = useState(true);
  const creatureTimerRef = useRef(null);

  const triggerCreature = useCallback((state) => {
    if (state === 'idle') return;
    clearTimeout(creatureTimerRef.current);
    setCreatureState(state);
    const duration = state === 'spin' ? 1500 : state === 'celebrate' ? 1200 : 1000;
    creatureTimerRef.current = setTimeout(() => setCreatureState('idle'), duration);
  }, []);

  const appendLines = useCallback((newLines) => {
    setLines(prev => [
      ...prev,
      ...newLines.map(l => ({ ...l, id: makeId() })),
    ]);
  }, []);

  const executeCommand = useCallback((raw) => {
    const trimmed = raw.trim();
    if (!trimmed) return;

    // Echo the command line
    setLines(prev => [
      ...prev,
      { id: makeId(), text: trimmed, color: 'var(--term-cyan)', isCommand: true },
    ]);

    setCmdHistory(prev => [trimmed, ...prev]);
    setHistoryIndex(-1);

    // Brief thinking state
    setCreatureState('thinking');

    setTimeout(() => {
      const { lines: outLines, creatureHint } = runCommand(trimmed, {
        history: cmdHistory,
      });

      if (outLines === null) {
        // clear command
        setLines([]);
      } else if (outLines && outLines.length > 0) {
        appendLines(outLines);
      }

      triggerCreature(creatureHint || 'celebrate');
    }, 180);
  }, [cmdHistory, appendLines, triggerCreature]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter') {
      executeCommand(inputValue);
      setInputValue('');
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
      const matches = TAB_COMPLETIONS.filter(c =>
        c.startsWith(inputValue) && c !== inputValue
      );
      if (matches.length === 1) {
        setInputValue(matches[0]);
      } else if (matches.length > 1) {
        appendLines([{ text: matches.join('   '), color: 'var(--term-dim)' }]);
      }
    } else if (e.key === 'c' && e.ctrlKey) {
      e.preventDefault();
      if (inputValue) {
        setLines(prev => [
          ...prev,
          { id: makeId(), text: inputValue + '^C', color: 'var(--term-dim)', isCommand: true },
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
    appendLines([{ text: '', color: '' }]);
  }, [appendLines]);

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
